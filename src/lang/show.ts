import { Kind, URIS } from "../generic/hkt";
import { Expr } from "./extensions/common";

export interface Show<F extends URIS, A> {
  show(value: Kind<F, A>): Kind<F, string>;
}

// Type dictionary for Show instances
export interface ShowInstances<F extends URIS> {
  number: Show<F, number>;
  string: Show<F, string>;
  boolean: Show<F, boolean>;
}

export const toStr =
  <F extends URIS, A>(value: Expr<F, A>): Expr<F, string> =>
  (interpreter) =>
    interpreter.show(value(interpreter));
