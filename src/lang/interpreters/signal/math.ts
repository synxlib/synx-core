import { SynxMath } from "@lang/extensions/math";
import { signal, computed, effect, Signal, ReadonlySignal } from "@preact/signals-core";
import "./base";

// Extended interface that uses method augmentation rather than property addition
export interface MutableSignal<T> extends Signal<T> {
  update(updater: (current: T) => T): void;
}

// Extended interface for numeric operations
export interface NumericSignal extends Signal<number> {
  add(n: number): void;
  sub(n: number): void;
  mul(n: number): void;
  div(n: number): void;
  mod(n: number): void;
}

export class EnhancedMathSignalInterpreter implements SynxMath<'Signal'> {
  show(n: Signal<number | undefined>): Signal<string> {
    return computed(() => n.value?.toString() ?? '');
  }
  // Use a WeakMap to store additional methods for signals
  private methodStorage = new WeakMap<Signal<any>, Record<string, Function>>();
  
  // Helper to get a method from storage
  private getMethod<T, R>(sig: Signal<T>, name: string, defaultFn: (sig: Signal<T>) => R): R {
    const methods = this.methodStorage.get(sig);
    if (methods && name in methods) {
      return methods[name]() as R;
    }
    return defaultFn(sig);
  }
  
  // Helper to add a method to a signal
  private augmentSignal<T>(sig: Signal<T>, methods: Record<string, Function>): Signal<T> {
    // Store the methods
    this.methodStorage.set(sig, methods);
    
    // Create proxy methods on the signal
    for (const [name, fn] of Object.entries(methods)) {
      // Skip if method already exists
      if (name in sig) continue;
      
      // Add method to signal
      Object.defineProperty(sig, name, {
        value: function(...args: any[]) {
          return fn.apply(sig, args);
        },
        configurable: true,
        enumerable: true
      });
    }
    
    return sig;
  }
  
  // Create a numeric signal
  num(x: number): NumericSignal {
    const sig = signal(x);
    
    // Define numeric methods
    const methods = {
      update: function(updater: (current: number) => number) {
        sig.value = updater(sig.value);
      },
      add: function(n: number) {
        sig.value += n;
      },
      sub: function(n: number) {
        sig.value -= n;
      },
      mul: function(n: number) {
        sig.value *= n;
      },
      div: function(n: number) {
        sig.value /= n;
      },
      mod: function(n: number) {
        sig.value %= n;
      }
    };
    
    // Augment the signal with our methods
    return this.augmentSignal(sig, methods) as NumericSignal;
  }
  
  // Binary operations
  add(x: Signal<number>, y: Signal<number>): ReadonlySignal<number> {
    return computed(() => x.value + y.value);
  }
  
  sub(x: Signal<number>, y: Signal<number>): ReadonlySignal<number> {
    return computed(() => x.value - y.value);
  }
  
  mul(x: Signal<number>, y: Signal<number>): ReadonlySignal<number> {
    return computed(() => x.value * y.value);
  }
  
  div(x: Signal<number>, y: Signal<number>): ReadonlySignal<number> {
    return computed(() => x.value / y.value);
  }
  
  mod(x: Signal<number>, y: Signal<number>): ReadonlySignal<number> {
    return computed(() => x.value % y.value);
  }
}