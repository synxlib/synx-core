// Composition of applicative functors using existing interfaces
import { HKT } from "@/generic/hkt";
import { Functor } from "@/generic/functor";
import { Apply } from "@/generic/apply";
import { Applicative } from "@/generic/applicative";

// Composition of two type constructors (kind * -> *)
// This represents `i (j a)` in Haskell
export interface CompositionURI<I, Jf> {
  readonly _URI: unique symbol;
}

// The composed type - this extends HKT to make it compatible with your interface
export interface Composition<I, Jf, A> extends HKT<CompositionURI<I, Jf>, A> {
  readonly value: HKT<I, HKT<Jf, A>>;
}

// Type guard to check if a HKT is actually a Composition
function isComposition<I, Jf, A>(
  fa: HKT<CompositionURI<I, Jf>, A>
): fa is Composition<I, Jf, A> {
  return "value" in fa;
}

// Constructor function (like J in Haskell)
export function compose<I, Jf, A>(
  value: HKT<I, HKT<Jf, A>>
): Composition<I, Jf, A> {
  return {
    _URI: {} as CompositionURI<I, Jf>,
    _A: {} as A,
    value,
  };
}

// Accessor function (like unJ in Haskell)
export function decompose<I, Jf, A>(
  composition: HKT<CompositionURI<I, Jf>, A>
): HKT<I, HKT<Jf, A>> {
  if (!isComposition(composition)) {
    throw new Error("Not a composition");
  }
  return composition.value;
}

// Create a Functor instance for the composition
export function composeFunctor<I, Jf>(
  I: Functor<I>,
  J: Functor<Jf>
): Functor<CompositionURI<I, Jf>> {
  return {
    URI: {} as CompositionURI<I, Jf>,
    map: <A, B>(
      fa: HKT<CompositionURI<I, Jf>, A>,
      f: (a: A) => B
    ): HKT<CompositionURI<I, Jf>, B> => {
      // fmap f (J x) = J $ fmap (fmap f) x
      const innerValue = decompose(fa);
      return compose(I.map(innerValue, (ja) => J.map(ja, f)));
    },
  };
}

// Create an Apply instance for the composition
export function composeApply<I, Jf>(
  I: Apply<I>,
  J: Apply<Jf>
): Apply<CompositionURI<I, Jf>> {
  const functor = composeFunctor(I, J);

  return {
    ...functor,
    ap: <A, B>(
      fab: HKT<CompositionURI<I, Jf>, (a: A) => B>,
      fa: HKT<CompositionURI<I, Jf>, A>
    ): HKT<CompositionURI<I, Jf>, B> => {
      // J f <*> J x = J $ (<*>) <$> f <*> x
      const ff = decompose(fab);
      const fx = decompose(fa);

      return compose(
        I.ap(
          I.map(ff, (jf) => (jx: HKT<Jf, A>) => J.ap(jf, jx)),
          fx
        )
      );
    },
  };
}

// Create an Applicative instance for the composition
export function composeApplicative<I, Jf>(
  I: Applicative<I>,
  J: Applicative<Jf>
): Applicative<CompositionURI<I, Jf>> {
  const apply = composeApply(I, J);

  return {
    ...apply,
    of: <A>(a: A): HKT<CompositionURI<I, Jf>, A> => {
      // pure = J . pure . pure
      return compose(I.of(J.of(a)));
    },
  };
}

// Lift a value from m a to (m :. i) a
export function liftComposition<M, Jf, A>(
  M: Functor<M>,
  ma: HKT<M, A>
): HKT<CompositionURI<M, Jf>, A> {
  // liftJ = J . fmap pure
  return compose(M.map(ma, (a) => ({ _tag: "_pure", value: a }) as any));
}

// A common operation: mapJ2
export function mapComposition<M, I, Jf, A>(
  M: Functor<M>,
  f: (ia: HKT<I, A>) => HKT<Jf, A>
): (mia: HKT<CompositionURI<M, I>, A>) => HKT<CompositionURI<M, Jf>, A> {
  // mapJ2 f = J . fmap f . unJ
  return (mia) => {
    const innerValue = decompose(mia);
    return compose(M.map(innerValue, f));
  };
}

// Composing weakening: liftJ2
export function composeWeaken<M, I, Jf, A>(
  M: Functor<M>,
  I: Applicative<I>,
  mia: HKT<CompositionURI<M, I>, A>
): HKT<CompositionURI<M, CompositionURI<I, Jf>>, A> {
  // liftJ2 = mapJ2 liftJ
  return mapComposition<M, I, CompositionURI<I, Jf>, A>(M, (ia) =>
    compose(I.of({ _tag: "_pure", value: null } as any))
  )(mia);
}

// Helper witnesses for associate transformations
export function composeAssocRight<M, I1, I2, A>(
  composed: HKT<CompositionURI<CompositionURI<M, I1>, I2>, A>
): HKT<CompositionURI<M, CompositionURI<I1, I2>>, A> {
  // jassocp2 (J (J mi1i2)) = J (fmap J mi1i2)
  const outerValue = decompose(composed);
  const innerValue = decompose(
    outerValue as any as HKT<CompositionURI<M, I1>, HKT<I2, A>>
  );
  return compose(innerValue as any);
}

export function composeAssocLeft<M, I1, I2, A>(
  composed: HKT<CompositionURI<M, CompositionURI<I1, I2>>, A>
): HKT<CompositionURI<CompositionURI<M, I1>, I2>, A> {
  // jassocm2 (J mJi1i2) = J . J $ (fmap unJ mJi1i2)
  const innerValue = decompose(composed);
  return compose(compose(innerValue as any));
}

// The functions correspond to the Haskell code as follows:
// Haskell      | TypeScript
// -------------|-------------
// J            | compose
// unJ          | decompose
// liftJ        | liftComposition
// mapJ2        | mapComposition
// liftJ2       | composeWeaken
// jassocp2     | composeAssocRight
// jassocm2     | composeAssocLeft
