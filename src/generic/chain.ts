import { Apply } from "./apply";
import { HKT } from "./hkt";

export interface Chain<F> extends Apply<F> {
    readonly chain: <A, B>(fa: HKT<F, A>, f: (a: A) => HKT<F, B>) => HKT<F, B>;
}
