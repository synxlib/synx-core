import { SynxLambda } from "@/lang/extensions/lambda";
import { R, RValue, unR } from "./common";
import { RContext } from "./context";
import { cons } from "fp-ts/lib/ReadonlyNonEmptyArray";

export const RLambda = (rContext: RContext): SynxLambda<"R"> => ({
  lam<A, B>(f: (a: RValue<A>) => RValue<B>): RValue<(a: A) => B> {
    // In the meta-circular interpreter, we directly create a JavaScript function
    // that applies f to the R-wrapped argument
    const fn = (a_: A): B => {
      // Wrap the argument in R
      const wrapped = R(a_);

      // Apply the function f to the wrapped argument
      const result = f(wrapped);

      // Unwrap the result
      return unR(result);
    };

    // Return the function wrapped in R
    return R(fn);
  },

  app<A, B>(f: RValue<(a: A) => B>, a: RValue<A>): RValue<B> {
    return rContext.createTrackedValue([f, a], () => unR(f)(unR(a)));
  },

  lam2: function <A, B, C>(f: (a: RValue<A>, b: RValue<B>) => RValue<C>): RValue<(a: A, b: B) => C> {
    const fn = (a: A, b: B): C => {
      const wrappedA = R(a);
      const wrappedB = R(b);
      const result = f(wrappedA, wrappedB);
      return unR(result);
    };

    return R(fn);
  },

  app2: function <A, B, C>(f: RValue<(a: A, b: B) => C>, a: RValue<A>, b: RValue<B>): RValue<C> {
    return rContext.createTrackedValue([f, a, b], () => unR(f)(unR(a), unR(b)));
  },

  app3: function <A, B, C, D>(f: RValue<(a: A, b: B, c: C) => D>, a: RValue<A>, b: RValue<B>, c: RValue<C>): RValue<D> {
    return rContext.createTrackedValue([f, a, b, c], () => unR(f)(unR(a), unR(b), unR(c)));
  },
  lam3: function <A, B, C, D>(f: (a: RValue<A>, b: RValue<B>, c: RValue<C>) => RValue<D>): RValue<(a: A, b: B, c: C) => D> {
    const fn = (a_: A, b_: B, c_: C): D => {
      const wrappedA = R(a_);
      const wrappedB = R(b_);
      const wrappedC = R(c_);
      const result = f(wrappedA, wrappedB, wrappedC);
      return unR(result);
    };

    return R(fn);
  }
});
