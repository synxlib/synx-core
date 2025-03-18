import { Kind, URIS } from "@/generic/hkt";
import { Expr } from "./common";
import { Monad } from "@/generic/monad";
import { Monad1 } from "fp-ts/lib/Monad";
import { Effect } from "@/generic/effect";

export interface SynxBind<F extends URIS> {
    pure<A>(a: A): Kind<F, A>;
    ret<A>(a: Kind<F, A>): Kind<F, Effect<A>>;
    scolon<A>(a: Kind<F, Effect<any>>, b: Kind<F, Effect<A>>): Kind<F, Effect<A>>;
    ap<A, B>(f: Kind<F, Effect<(a: A) => B>>, a: Kind<F, Effect<A>>): Kind<F, Effect<B>>;
    ap2<A, B, C>(f: Kind<F, Effect<(a: A, b: B) => C>>, a: Kind<F, Effect<A>>, b: Kind<F, Effect<B>>): Kind<F, Effect<C>>;
    ap3<A, B, C, D>(f: Kind<F, Effect<(a: A, b: B, c: C) => D>>, a: Kind<F, Effect<A>>, b: Kind<F, Effect<B>>, c: Kind<F, Effect<C>>): Kind<F, Effect<D>>;
}

export const pure =
    <F extends URIS, A>(a: A): Expr<F, A> =>
    (interpreter) =>
        interpreter.pure(a);

export const ret =
    <F extends URIS, A>(a: Expr<F, A>): Expr<F, Effect<A>> =>
    (interpreter) =>
        interpreter.ret(a(interpreter));

export const liftE = ret;

export const scolon =
    <F extends URIS, A>(
        a: Expr<F, Effect<any>>,
        b: Expr<F, Effect<A>>,
    ): Expr<F, Effect<A>> =>
    (interpreter) =>
        interpreter.scolon(a(interpreter), b(interpreter));

export const ap =
    <F extends URIS, A, B>(
        f: Expr<F, Effect<(a: A) => B>>,
        a: Expr<F, Effect<A>>,
    ): Expr<F, Effect<B>> =>
    (interpreter) =>
        interpreter.ap(f(interpreter), a(interpreter));

export const ap2 =
    <F extends URIS, A, B, C>(
        f: Expr<F, Effect<(a: A, b: B) => C>>,
        a: Expr<F, Effect<A>>,
        b: Expr<F, Effect<B>>,
    ): Expr<F, Effect<C>> =>
    (interpreter) =>
        interpreter.ap2(f(interpreter), a(interpreter), b(interpreter));

export const ap3 =
    <F extends URIS, A, B, C, D>(
        f: Expr<F, Effect<(a: A, b: B, c: C) => D>>,
        a: Expr<F, Effect<A>>,
        b: Expr<F, Effect<B>>,
        c: Expr<F, Effect<C>>,
    ): Expr<F, Effect<D>> =>
    (interpreter) =>
        interpreter.ap3(f(interpreter), a(interpreter), b(interpreter), c(interpreter));