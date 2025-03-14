import { Signal, signal, effect } from "./core";

class SignalEventInterpreter extends SynxEvent<'Signal'> {
    fold<E, S>(
        events: Signal<E>, 
        initialState: Signal<S>, 
        reducer: (state: S) => S
      ): Signal<S> {
        const state = signal<S>(initialState.value as S);
        
        effect(() => {
          if (events.value !== undefined) {
            state.value = reducer(state.value);
          }
        });
        
        return state;
      }
}