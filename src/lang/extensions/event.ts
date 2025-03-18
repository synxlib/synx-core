import { Effect } from "@/generic/effect";
import { URIS, Kind } from "../../generic/hkt";
import { ap, ap2, ap3, pure, ret } from "./bind";
import { Expr, Interpreter } from "./common";
import { DomEffect } from "./dom-effect";
import { lam2, lam3 } from "./lambda";

export interface SynxEvent<F extends URIS> {
    fold<E, S>(
        event: Kind<F, { listeners: ((event: E) => void)[] }>,
        initialState: Kind<F, S>,
        reducer: Kind<F, (state: S, event: E) => S>,
    ): Kind<F, S>;

    foldM<E, S>(
        event: Kind<F, Effect<{ listeners: ((event: E) => void)[] }>>,
        initialState: Kind<F, Effect<S>>,
        reducer: Kind<F, (state: Effect<S>, event: E) => Effect<S>>,
    ): Kind<F, Effect<S>>;

    effect<E>(
        event: Kind<F, { listeners: ((event: E) => void)[] }>,
        handler: Kind<F, (event: E) => void>,
    ): Kind<F, void>;

    zip<S, T>(
        a: Kind<F, { listeners: ((event: S) => void)[] }>,
        b: Kind<F, { listeners: ((event: T) => void)[] }>,
    ): Kind<F, { listeners: ((event: S | T) => void)[] }>;
}

export const foldS =
    <F extends URIS, E, S>(
        event: Expr<F, { listeners: ((event: E) => void)[] }>,
        initialState: Expr<F, S>,
        reducer: Expr<F, (state: S, event: E) => S>,
    ): Expr<F, S> =>
    (interpreter: Interpreter<F>) =>
        interpreter.fold(
            event(interpreter),
            initialState(interpreter),
            reducer(interpreter),
        );

export const fold =
    <F extends URIS, E, S>(
        event: Expr<F, Effect<{ listeners: ((event: E) => void)[] }>>,
        initialState: Expr<F, S>,
        reducer: Expr<F, (state: S, event: E) => S>,
    ): Expr<F, Effect<S>> =>
    (interpreter: Interpreter<F>) => {
        const fn: Expr<
            F,
            (
                event: { listeners: ((event: E) => void)[] },
                initialState: S,
                reducer: (state: S, event: E) => S,
            ) => S
        > = lam3(foldS);

        return ap3(
            ret(fn),
            event,
            ret(initialState),
            ret(reducer),
        )(interpreter);
    };

export const foldM =
    <F extends URIS, E, S>(
        event: Expr<F, Effect<{ listeners: ((event: E) => void)[] }>>, // Event stream
        initialState: Expr<F, Effect<S>>, // Initial state (inside the monad)
        reducer: Expr<F, (state: Effect<S>, event: E) => Effect<S>>, // Effectful reducer
    ): Expr<F, Effect<S>> =>
    (interpreter) => {

        return interpreter.foldM(
            event(interpreter),
            initialState(interpreter),
            reducer(interpreter),
        );
        // const flattenEffect =
        //     <F extends URIS, S>(
        //         expr: Expr<F, Effect<Effect<S>>>,
        //     ): Expr<F, Effect<S>> =>
        //     (interpreter) => {
        //         const nestedEffect: Kind<F, Effect<Effect<S>>> = expr(
        //             interpreter,
        //         );

        //         // Wrap the flattening function inside Kind<F, _>
        //         const flattenFn: Kind<F, (e: Effect<Effect<S>>) => Effect<S>> =
        //             interpreter.pure((e) => {
        //                 console.log("Flattening effect", e);
        //                 return e.chain((x) => x);
        //             });

        //         return interpreter.app(flattenFn, nestedEffect);
        //     };

        // const result = flattenEffect(fold(event, initialState, reducer))(interpreter);
        // console.log("FoldM result:", result);
        // return result;

        // const fn: Expr<
        //     F,
        //     (
        //         event: { listeners: ((event: E) => void)[] },
        //         initialState: S,
        //         reducer: (state: S, event: E) => S,
        //     ) => S
        // > = lam3(foldS);

        // return ap3(
        //     fn,
        //     event,
        //     initialState,
        //     reducer,
        // )(interpreter);
    };

export const effect =
    <F extends URIS, E>(
        event: Expr<F, { listeners: ((event: E) => void)[] }>,
        handler: Expr<F, (event: E) => void>,
    ) =>
    (interpreter: Interpreter<F>) =>
        interpreter.effect(event(interpreter), handler(interpreter));

export const zip =
    <F extends URIS, S, T>(
        a: Expr<F, { listeners: ((event: S) => void)[] }>,
        b: Expr<F, { listeners: ((event: T) => void)[] }>,
    ) =>
    (interpreter: Interpreter<F>) =>
        interpreter.zip(a(interpreter), b(interpreter));

