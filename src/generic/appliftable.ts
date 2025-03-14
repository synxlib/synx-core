import { Applicative } from "./applicative";
import { HKT } from "./hkt";

export interface AppLiftable<F> extends Applicative<F> {
  // The app_pull operation allows "distributing" an applicative over another
  readonly app_pull: <G, A>(iga: HKT<G, HKT<F, A>>) => HKT<F, HKT<G, A>>;
}
