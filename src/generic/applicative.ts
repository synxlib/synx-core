import { Apply, Apply1 } from "./apply";
import { HKT, Kind, URIS } from "./hkt";

export interface Applicative<F> extends Apply<F> {
  readonly URI: F
  readonly of: <A>(a: A) => HKT<F, A>;
}


export interface Applicative1<F extends URIS> extends Apply1<F> {
  readonly URI: F
  readonly of: <A>(a: A) => Kind<F, A>
}

// export function liftA2<F extends URIS, A, B, C>(
//     A: Applicative<F>,
//     f: (a: A, b: B) => C,
//     fa: Kind<F, A>,
//     fb: Kind<F, B>
//   ): Kind<F, C> {
//     return A.ap(
//       A.map(fa, (a: A) => (b: B) => f(a, b)),
//       fb
//     )
//   }
  