import { Functor, Functor1 } from "./functor";
import { HKT, Kind, URIS } from "./hkt";

export interface Apply<F> extends Functor<F> {
    readonly ap: <A, B>(fab: HKT<F, (a: A) => B>, fa: HKT<F, A>) => HKT<F, B>
}

export interface Apply1<F extends URIS> extends Functor1<F> {
  readonly ap: <A, B>(fab: Kind<F, (a: A) => B>, fa: Kind<F, A>) => Kind<F, B>
}