import { Kind, URIS } from "../../generic/hkt";
import { SynxDom } from "./dom";
import { SynxError } from "./error";
import { SynxEvent } from "./event";
import { SynxLambda } from "./lambda";
import { SynxMath } from "./math";
import { SynxString } from "./string";

export type Interpreter<F extends URIS> = SynxMath<F> & SynxDom<F> & SynxString<F> & SynxEvent<F> & SynxError<F> & SynxLambda<F>; // Base type for all interpreters
export type Expr<F extends URIS, A, I extends Interpreter<F> = Interpreter<F>> = 
  (interpreter: I) => Kind<F, A>;
