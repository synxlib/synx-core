import { DomError, SynxDom } from "@lang/extensions/dom";
import { signal, computed, Signal } from "./core";
import { Either, left, right } from "@/generic/either";
import { effect } from "@preact/signals-core";

export class DomInterpreter implements SynxDom<'Signal'> {
  getElementIdBy(id: Signal<string>): Signal<Either<DomError, HTMLElement>> {
    // Use computed to create a derived signal that reacts to changes in the id signal
    return computed(() => {
      if (id.value == null) return left({
        code: "SIGNAL_VALUE_NOT_DEFINED",
        message: `The id signal passed to getElementById does not have a value.`
      });

      const element = document.getElementById(id.value);
      
      if (element === null) {
        return left({
          code: 'ELEMENT_NOT_FOUND',
          message: `Element with id "${id.value}" not found`
        });
      }
      
      return right(element);
    });
  }
  
  setProperty(
    name: Signal<string>, 
    value: Signal<string>, 
    el: Signal<HTMLElement>
  ): Signal<Either<DomError, void>> {
    // Create a computed signal that depends on name, value, and el
    return computed(() => {
      if (el.value == null) return left({
        code: "SIGNAL_VALUE_NOT_DEFINED",
        message: `The element signal passed to setProperty does not have a value.`
      });
      
      if (name.value == null) return left({
        code: "SIGNAL_VALUE_NOT_DEFINED",
        message: `The property name signal passed to setProperty does not have a value.`
      });

      const currentEl = el.value;
      
      const element = currentEl;
      
      try {
        // Create an effect to update the property whenever value changes
        const effect = computed(() => {
          if (name.value == null) return left({
            code: "SIGNAL_VALUE_NOT_DEFINED",
            message: `The property name signal passed to setProperty does not have a value.`
          });

          (element as any)[name.value] = value.value;
        });
        
        // We need to keep the effect reference to avoid it being garbage collected
        // In a real implementation, you might want to store this somewhere and clean it up later
        (element as any).__propertyEffect = effect;
        
        return right(undefined);
      } catch (error) {
        return left({
          code: 'PROPERTY_ERROR',
          message: `Error setting property "${name.value}" on element: ${error instanceof Error ? error.message : String(error)}`
        });
      }
    });
  }

  on(
    eventType: Signal<string>,
    el: Signal<HTMLElement | null>
  ): Signal<any> {
    const eventSignal = signal<any>(undefined);
    
    effect(() => {
      const element = el.value;
      const type = eventType.value ?? '';
      
      if (element) {
        const listener = (event: Event) => {
          eventSignal.value = event;
        };
        
        element.addEventListener(type, listener);
        
        // Setup cleanup when element or type changes
        return () => {
          element.removeEventListener(type, listener);
        };
      }
    });
    
    return eventSignal;
  }
}

// Helper function to create a Preact signal wrapped in Either
export const safeGetElementById = (id: string): Signal<Either<DomError, HTMLElement>> => {
  const element = document.getElementById(id);
  
  if (element === null) {
    return signal(left({
      code: 'ELEMENT_NOT_FOUND',
      message: `Element with id "${id}" not found`
    }));
  }
  
  return signal(right(element));
}