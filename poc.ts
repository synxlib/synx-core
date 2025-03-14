import { signal, computed, effect } from "@preact/signals-core";

// Define our MutableSignal interface (from the original code)
interface MutableSignal<T> {
  value: T;
  peek(): T;
  update(updater: (current: T) => T): void;
}

// Extended interface for number signals with arithmetic updates
interface NumericSignal extends MutableSignal<number> {
  add(n: number): void;
  subtract(n: number): void;
  multiply(n: number): void;
  divide(n: number): void;
}

// Define the ArithmeticSym interface correctly for TypeScript
interface ArithmeticSym<R> {
  intS: (x: number) => R;
  doubleS: (x: number) => R;
  addS: (x: R, y: R) => R;
  subS: (x: R, y: R) => R;
  mulS: (x: R, y: R) => R;
  divS: (x: R, y: R) => R;
}

// Define the Applicative interface
interface Applicative<F> {
  pure: <A>(x: A) => F<A>;
  ap: <A, B>(ff: F<(a: A) => B>, fa: F<A>) => F<B>;
  map: <A, B>(f: (a: A) => B, fa: F<A>) => F<B>;
}

// Simplified type for our functors
type Func<A> = A;

// A simple identity functor
const Id: Applicative<Func> = {
  pure: <A>(x: A): Func<A> => x,
  ap: <A, B>(ff: Func<(a: A) => B>, fa: Func<A>): Func<B> => ff(fa),
  map: <A, B>(f: (a: A) => B, fa: Func<A>): Func<B> => f(fa),
};

// SignalArithmetic implements ArithmeticSym for MutableSignal<number>
class SignalArithmetic implements ArithmeticSym<MutableSignal<number>> {
  // Create a numeric signal
  private createNumericSignal(initialValue: number): NumericSignal {
    const sig = signal(initialValue);

    const numericSignal: NumericSignal = {
      get value() {
        return sig.value;
      },
      set value(newValue: number) {
        sig.value = newValue;
      },
      peek() {
        return sig.peek();
      },
      update(updater: (current: number) => number) {
        sig.value = updater(sig.value);
      },
      add(n: number) {
        sig.value += n;
      },
      subtract(n: number) {
        sig.value -= n;
      },
      multiply(n: number) {
        sig.value *= n;
      },
      divide(n: number) {
        sig.value /= n;
      },
    };

    return numericSignal;
  }

  // Implementation of intS - creates a signal from an integer
  intS(x: number): MutableSignal<number> {
    return this.createNumericSignal(x);
  }

  // Implementation of doubleS - also creates a signal from a floating point number
  doubleS(x: number): MutableSignal<number> {
    return this.createNumericSignal(x);
  }

  // Implementation of addS - creates a computed signal that adds two signals
  addS(
    x: MutableSignal<number>,
    y: MutableSignal<number>,
  ): MutableSignal<number> {
    return computed(() => x.value + y.value);
  }

  // Implementation of subS - creates a computed signal that subtracts two signals
  subS(
    x: MutableSignal<number>,
    y: MutableSignal<number>,
  ): MutableSignal<number> {
    return computed(() => x.value - y.value);
  }

  // Implementation of mulS - creates a computed signal that multiplies two signals
  mulS(
    x: MutableSignal<number>,
    y: MutableSignal<number>,
  ): MutableSignal<number> {
    return computed(() => x.value * y.value);
  }

  // Implementation of divS - creates a computed signal that divides two signals
  divS(
    x: MutableSignal<number>,
    y: MutableSignal<number>,
  ): MutableSignal<number> {
    return computed(() => x.value / y.value);
  }
}

// Helper functions to emulate the Haskell functions
function int<F>(
  arithmetic: ArithmeticSym<MutableSignal<number>>,
  applicative: Applicative<F>,
): F<MutableSignal<number>> {
  return (x: number) => applicative.pure(arithmetic.intS(x));
}

function double<F>(
  arithmetic: ArithmeticSym<MutableSignal<number>>,
  applicative: Applicative<F>,
): F<MutableSignal<number>> {
  return (x: number) => applicative.pure(arithmetic.doubleS(x));
}

// Operator-like functions to simulate the Haskell infix operators
function addOp<F>(
  arithmetic: ArithmeticSym<MutableSignal<number>>,
  applicative: Applicative<F>,
) {
  return (
    x: F<MutableSignal<number>>,
    y: F<MutableSignal<number>>,
  ): F<MutableSignal<number>> => {
    return applicative.ap(
      applicative.map(
        (a: MutableSignal<number>) => (b: MutableSignal<number>) =>
          arithmetic.addS(a, b),
        x,
      ),
      y,
    );
  };
}

function mulOp<F>(
  arithmetic: ArithmeticSym<MutableSignal<number>>,
  applicative: Applicative<F>,
) {
  return (
    x: F<MutableSignal<number>>,
    y: F<MutableSignal<number>>,
  ): F<MutableSignal<number>> => {
    return applicative.ap(
      applicative.map(
        (a: MutableSignal<number>) => (b: MutableSignal<number>) =>
          arithmetic.mulS(a, b),
        x,
      ),
      y,
    );
  };
}

function subOp<F>(
  arithmetic: ArithmeticSym<MutableSignal<number>>,
  applicative: Applicative<F>,
) {
  return (
    x: F<MutableSignal<number>>,
    y: F<MutableSignal<number>>,
  ): F<MutableSignal<number>> => {
    return applicative.ap(
      applicative.map(
        (a: MutableSignal<number>) => (b: MutableSignal<number>) =>
          arithmetic.subS(a, b),
        x,
      ),
      y,
    );
  };
}

function divOp<F>(
  arithmetic: ArithmeticSym<MutableSignal<number>>,
  applicative: Applicative<F>,
) {
  return (
    x: F<MutableSignal<number>>,
    y: F<MutableSignal<number>>,
  ): F<MutableSignal<number>> => {
    return applicative.ap(
      applicative.map(
        (a: MutableSignal<number>) => (b: MutableSignal<number>) =>
          arithmetic.divS(a, b),
        x,
      ),
      y,
    );
  };
}

// Direct helpers without the applicative structure (simpler API)
function createInt(x: number): MutableSignal<number> {
  const arithmetic = new SignalArithmetic();
  return arithmetic.intS(x);
}

function createDouble(x: number): MutableSignal<number> {
  const arithmetic = new SignalArithmetic();
  return arithmetic.doubleS(x);
}

function createAdd(
  x: MutableSignal<number>,
  y: MutableSignal<number>,
): MutableSignal<number> {
  const arithmetic = new SignalArithmetic();
  return arithmetic.addS(x, y);
}

function createMul(
  x: MutableSignal<number>,
  y: MutableSignal<number>,
): MutableSignal<number> {
  const arithmetic = new SignalArithmetic();
  return arithmetic.mulS(x, y);
}

function createSub(
  x: MutableSignal<number>,
  y: MutableSignal<number>,
): MutableSignal<number> {
  const arithmetic = new SignalArithmetic();
  return arithmetic.subS(x, y);
}

function createDiv(
  x: MutableSignal<number>,
  y: MutableSignal<number>,
): MutableSignal<number> {
  const arithmetic = new SignalArithmetic();
  return arithmetic.divS(x, y);
}

// Simple DSL with custom operators
const $ = {
  // Factory functions
  int: createInt,
  double: createDouble,

  // Operator functions
  "+": createAdd,
  "-": createSub,
  "*": createMul,
  "/": createDiv,

  // Chaining syntax for more readable expressions
  expr: (
    a: MutableSignal<number>,
    op: string,
    b: MutableSignal<number>,
  ): MutableSignal<number> => {
    switch (op) {
      case "+":
        return createAdd(a, b);
      case "-":
        return createSub(a, b);
      case "*":
        return createMul(a, b);
      case "/":
        return createDiv(a, b);
      default:
        throw new Error(`Unknown operator: ${op}`);
    }
  },
};

// Example usage in different styles
function demoDirectStyle() {
  // Create base signals
  const a = $.int(5);
  const b = $.int(10);

  // Using direct operator functions
  const sum = $.expr(a, "+", b); // a + b
  const product = $.expr(a, "*", b); // a * b
  const complex = $.expr($.expr(a, "+", b), "*", $.int(2)); // (a + b) * 2

  // Set up an effect to show values changing
  effect(() => {
    console.log("Direct style:");
    console.log(`a = ${a.value}`);
    console.log(`b = ${b.value}`);
    console.log(`a + b = ${sum.value}`);
    console.log(`a * b = ${product.value}`);
    console.log(`(a + b) * 2 = ${complex.value}`);
    console.log("-".repeat(30));
  });

  // Update signal values to demonstrate reactivity
  setTimeout(() => {
    if ("add" in a) (a as NumericSignal).add(3); // a += 3
    console.log("Updated a to", a.value);
  }, 1000);
}

// Example using a more Haskell-like approach with applicatives
function demoApplicativeStyle() {
  const arithmetic = new SignalArithmetic();
  const add = addOp(arithmetic, Id);
  const mul = mulOp(arithmetic, Id);

  // Use curried functions to create the values
  const intF = int(arithmetic, Id);
  const a = intF(5);
  const b = intF(10);
  const two = intF(2);

  // (5 + 10) * 2 in a style similar to the Haskell example
  const result = mul(add(a, b), two);

  effect(() => {
    console.log("Applicative style result:", result.value);
  });
}

// Run the demos
demoDirectStyle();
demoApplicativeStyle();
