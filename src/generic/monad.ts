import { Applicative } from "./applicative";
import { Chain } from "./chain";
import { URIS } from "./hkt";

export interface Monad<F extends URIS> extends Applicative<F>, Chain<F> {}