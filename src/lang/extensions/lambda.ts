import { Kind, URIS } from "@/generic/hkt";
import { Expr } from "./common";

export interface SynxLambda<F extends URIS> {
    lam<A, B>(f: (a: Kind<F, A>) => Kind<F, B>): Kind<F, (a: A) => B>;
    lam2<A, B, C>(f: (a: Kind<F, A>, b: Kind<F, B>) => Kind<F, C>): Kind<F, (a: A, b: B) => C>;
    lam3<A, B, C, D>(f: (a: Kind<F, A>, b: Kind<F, B>, c: Kind<F, C>) => Kind<F, D>): Kind<F, (a: A, b: B, c: C) => D>;
    app<A, B>(f: Kind<F, (a: A) => B>, a: Kind<F, A>): Kind<F, B>;
    app2<A, B, C>(f: Kind<F, (a: A, b: B) => C>, a: Kind<F, A>, b: Kind<F, B>): Kind<F, C>;
    app3<A, B, C, D>(f: Kind<F, (a: A, b: B, c: C) => D>, a: Kind<F, A>, b: Kind<F, B>, c: Kind<F, C>): Kind<F, D>;
}

export const lam = <F extends URIS, A, B>(f: (a: Expr<F, A>) => Expr<F, B>): Expr<F, (a: A) => B> =>
    (interpreter) => interpreter.lam(x => f(() => x)(interpreter));

export const lam2 = <F extends URIS, A, B, C>(f: (a: Expr<F, A>, b: Expr<F, B>) => Expr<F, C>): Expr<F, (a: A, b: B) => C> =>
    (interpreter) => interpreter.lam2((x, y) => f(() => x, () => y)(interpreter));

export const lam3 = <F extends URIS, A, B, C, D>(f: (a: Expr<F, A>, b: Expr<F, B>, c: Expr<F, C>) => Expr<F, D>): Expr<F, (a: A, b: B, c: C) => D> =>
    (interpreter) => interpreter.lam3((x, y, z) => f(() => x, () => y, () => z)(interpreter));

export const app = <F extends URIS, A, B>(f: Expr<F, (a: A) => B>, a: Expr<F, A>): Expr<F, B> =>
    (interpreter) => interpreter.app(f(interpreter), a(interpreter));

export const app2 = <F extends URIS, A, B, C>(f: Expr<F, (a: A, b: B) => C>, a: Expr<F, A>, b: Expr<F, B>): Expr<F, C> =>
    (interpreter) => interpreter.app2(f(interpreter), a(interpreter), b(interpreter));

export const app3 = <F extends URIS, A, B, C, D>(f: Expr<F, (a: A, b: B, c: C) => D>, a: Expr<F, A>, b: Expr<F, B>, c: Expr<F, C>): Expr<F, D> =>
    (interpreter) => interpreter.app3(f(interpreter), a(interpreter), b(interpreter), c(interpreter));