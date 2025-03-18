import { Effect } from "@/generic/effect";
import { Kind, URIS } from "../../generic/hkt";
import { SynxBind } from "./bind";
import { SynxDom } from "./dom";
import { SynxError } from "./error";
import { SynxEvent } from "./event";
import { SynxLambda } from "./lambda";
import { SynxList } from "./list";
import { SynxMath } from "./math";
import { SynxString } from "./string";

export type Interpreter<F extends URIS> = SynxMath<F> &
    SynxDom<F> &
    SynxString<F> &
    SynxEvent<F> &
    SynxError<F> &
    SynxLambda<F> &
    SynxList<F> &
    SynxBind<F>;

export type Expr<
    F extends URIS,
    A,
    I extends Interpreter<F> = Interpreter<F>,
> = (interpreter: I) => Kind<F, A>;

export const flattenEffect =
    <F extends URIS, S>(expr: Expr<F, Effect<Effect<S>>>): Expr<F, Effect<S>> =>
    (interpreter) => {
        const nestedEffect: Kind<F, Effect<Effect<S>>> = expr(interpreter);

        // Wrap the flattening function inside Kind<F, _>
        const flattenFn: Kind<F, (e: Effect<Effect<S>>) => Effect<S>> =
            interpreter.pure((e) => e.chain((x) => x));

        return interpreter.app(flattenFn, nestedEffect);
    };
