import { Kind, URIS } from "../../generic/hkt";
import { Expr } from "./common";

export interface SynxList<F extends URIS> {
  list<A>(value: A[]): Kind<F, A[]>;

  append<A>(list: Kind<F, A[]>, value: Kind<F, A>): Kind<F, A[]>;

  len<A>(s: Kind<F, A[]>): Kind<F, number>;
  
  first<A>(s: Kind<F, A[]>): Kind<F, A>;
}

export const list =
  <F extends URIS, A>(value: A[]): Expr<F, A[]> =>
  (interpreter) =>
    interpreter.list(value);

export const append =
  <F extends URIS, A>(list: Expr<F, A[]>, value: Expr<F, A>): Expr<F, A[]> =>
  (interpreter) =>
    interpreter.append(list(interpreter), value(interpreter));

export const first =
  <F extends URIS, A>(s: Expr<F, A[]>): Expr<F, A> =>
  (interpreter) =>
    interpreter.first(s(interpreter));