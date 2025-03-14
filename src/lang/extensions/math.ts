import { Show } from "../show";
import { Kind, URIS } from "../../generic/hkt";
import { Expr, Interpreter } from "./common";
import { Applicative, Applicative1 } from "@/generic/applicative";
// import { Applicative, Applicative1 } from "fp-ts/Applicative";

export interface SynxMath<F extends URIS> extends Show<F, number> {
  num(x: number): Kind<F, number>;
  add(x: Kind<F, number>, y: Kind<F, number>): Kind<F, number>;
  sub(x: Kind<F, number>, y: Kind<F, number>): Kind<F, number>;
  mul(x: Kind<F, number>, y: Kind<F, number>): Kind<F, number>;
  div(x: Kind<F, number>, y: Kind<F, number>): Kind<F, number>;
  mod(x: Kind<F, number>, y: Kind<F, number>): Kind<F, number>;
}

export const num =
  <F extends URIS>(n: number): Expr<F, number> =>
  (interpreter: SynxMath<F>) =>
    interpreter.num(n);

export const add =
  <F extends URIS>(e1: Expr<F, number>, e2: Expr<F, number>): Expr<F, number> =>
  (interpreter) =>
    interpreter.add(e1(interpreter), e2(interpreter));

export const addM =
  <F extends URIS>(A: Applicative1<F>) =>
  (
    x: Kind<F, Expr<F, number>>,
    y: Kind<F, Expr<F, number>>
  ): Kind<F, Expr<F, number>> =>
    A.ap(
      A.map(
        x,
        (a: Expr<F, number>) =>
          (b: Expr<F, number>): Expr<F, number> =>
          (interpreter) =>
            interpreter.add(a(interpreter), b(interpreter))
      ),
      y
    );

export const sub =
  <F extends URIS>(e1: Expr<F, number>, e2: Expr<F, number>): Expr<F, number> =>
  (interpreter) =>
    interpreter.sub(e1(interpreter), e2(interpreter));

export const mul =
  <F extends URIS>(e1: Expr<F, number>, e2: Expr<F, number>): Expr<F, number> =>
  (interpreter) =>
    interpreter.mul(e1(interpreter), e2(interpreter));

export const div =
  <F extends URIS>(e1: Expr<F, number>, e2: Expr<F, number>): Expr<F, number> =>
  (interpreter) =>
    interpreter.div(e1(interpreter), e2(interpreter));

export const mod =
  <F extends URIS>(e1: Expr<F, number>, e2: Expr<F, number>): Expr<F, number> =>
  (interpreter) =>
    interpreter.mod(e1(interpreter), e2(interpreter));
