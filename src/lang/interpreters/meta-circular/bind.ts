import { SynxBind } from "@/lang/extensions/bind";
import { R, RValue, unR } from "./common";
import { RContext } from "./context";
import { Effect } from "@/generic/effect";
import { DomEffect } from "@/lang/extensions/dom-effect";

export const RBind = (rContext: RContext): SynxBind<"R"> => ({
    pure: function <A>(a: A): RValue<A> {
        return R(a);
    },
    scolon: function <A>(
        a: RValue<Effect<any>>,
        b: RValue<Effect<A>>,
    ): RValue<Effect<A>> {
        return rContext.createTrackedValue([a, b], () => {
            return unR(a).chain(() => unR(b));
        });
    },
    ret: function <A>(a: RValue<A>): RValue<Effect<A>> {
        // console.log("ret a", a);
        const result = rContext.createTrackedValue([a], () => new DomEffect(() => unR(a)));
        // console.log("ret result", result);

        return result;
    },
    ap: function <A, B>(
        f: RValue<Effect<(a: A) => B>>,
        a: RValue<Effect<A>>,
    ): RValue<Effect<B>> {
        return rContext.createTrackedValue([f, a], () => {
            const f_ = unR(f);
            const a_ = unR(a);
            return f_.chain((f__) => a_.map(f__));
        });
    },
    ap2: function <A, B, C>(
        f: RValue<Effect<(a: A, b: B) => C>>,
        a: RValue<Effect<A>>,
        b: RValue<Effect<B>>,
    ): RValue<Effect<C>> {
        return rContext.createTrackedValue([f, a, b], () => {
            const f_ = unR(f);
            const a_ = unR(a);
            const b_ = unR(b);

            return f_.chain((f__) =>
                a_.chain(
                    (a__) => b_.map((b__) => f__(a__, b__)), // Apply function inside effect
                ),
            );
        });
    },
    ap3: function <A, B, C, D>(
        f: RValue<Effect<(a: A, b: B, c: C) => D>>,
        a: RValue<Effect<A>>,
        b: RValue<Effect<B>>,
        c: RValue<Effect<C>>,
    ): RValue<Effect<D>> {
        console.log("ap3 b", b)
        return rContext.createTrackedValue([f, a, b, c], () => {
            const f_ = unR(f);
            const a_ = unR(a);
            const b_ = unR(b);
            const c_ = unR(c);

            return f_.chain((f__) =>
                a_.chain((a__) =>
                    b_.chain(
                        (b__) => c_.map((c__) => f__(a__, b__, c__)), // Apply function inside effect
                    ),
                ),
            );
        });
    },
});

