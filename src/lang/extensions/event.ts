import { URIS, Kind } from "../../generic/hkt";
import { Expr, Interpreter } from "./common";

// Event handling interface
export interface SynxEvent<F extends URIS> {
  fold<E, S>(
    events: Kind<F, { listeners: ((event: E) => void)[] }>,
    initialState: Kind<F, S>,
    reducer: (state: S, event: E) => S
  ): Kind<F, S>;
}

// Factory function for fold operation
export const fold =
  <F extends URIS, E, S>(
    events: Expr<F, { listeners: ((event: E) => void)[] }>,
    initialState: Expr<F, S>,
    reducer: (state: S, event: E) => S
  ) =>
  (interpreter: Interpreter<F>) =>
    interpreter.fold(events(interpreter), initialState(interpreter), reducer);
