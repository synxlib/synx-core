import { HKT, Kind, URIS } from "@/generic/hkt";

export interface Functor<F> {
  readonly URI: F;
  readonly map: <A, B>(fa: HKT<F, A>, f: (a: A) => B) => HKT<F, B>;
}

export interface Functor1<F extends URIS> {
  readonly URI: F
  readonly map: <A, B>(fa: Kind<F, A>, f: (a: A) => B) => Kind<F, B>
}