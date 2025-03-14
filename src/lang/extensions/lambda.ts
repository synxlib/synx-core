import { Kind, URIS } from "@/generic/hkt";
import { Expr } from "./common";

export interface SynxLambda<F extends URIS> {
    lam<A, B>(f: (a: Kind<F, A>) => Kind<F, B>): Kind<F, (a: A) => B>;
    app<A, B>(f: Kind<F, (a: A) => B>, a: Kind<F, A>): Kind<F, B>;
}

export const lam = <F extends URIS, A, B>(f: (a: Expr<F, A>) => Expr<F, B>): Expr<F, (a: A) => B> =>
    (interpreter) => interpreter.lam((x) => f((i) => x)(interpreter));

export const app = <F extends URIS, A, B>(f: Expr<F, (a: A) => B>, a: Expr<F, A>): Expr<F, B> =>
    (interpreter) => interpreter.app(f(interpreter), a(interpreter));