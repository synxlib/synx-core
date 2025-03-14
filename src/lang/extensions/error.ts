import { Either, right, left } from "@/generic/either";
import { URIS, Kind } from "../../generic/hkt";
import { Expr } from "./common"

export interface SynxError<F extends URIS> {
  throwError: <E, A>(error: E) => Kind<F, A>;
  fromEither: <E, A>(value: Either<Kind<F, E>, Kind<F, A>>) => Kind<F, Either<E, A>>;
  mapEither: <E, A, B>(
    value: Kind<F, Either<E, A>>,
    f: Kind<F, (a: A) => B>
  ) => Kind<F, Either<E, B>>;
  chainEither: <E, A, B>(
    action: Kind<F, Either<E, A>>,
    f: Kind<F, (a: A) => Either<E, B>>
  ) => Kind<F, Either<E, B>>;
//   catchError: <E, A>(
//     action: Kind<F, A>,
//     handler: (error: E) => Kind<F, A>
//   ) => Kind<F, A>;
}


export const throwError = <F extends URIS, E, A>(e: E): Expr<F, A> => 
  (interpreter: SynxError<F>) => interpreter.throwError(e);

export const fromError = <F extends URIS, E, A>(value: Either<Expr<F, E>, Expr<F, A>>): Expr<F, Either<E, A>> =>
  (interpreter) => interpreter.fromEither(
    value.isRight() ? right(value.value(interpreter)) : left(value.value(interpreter))
  );

export const mapEither = <F extends URIS, E, A, B>(
  value: Expr<F, Either<E, A>>,
  f: Expr<F, (a: A) => B>
): Expr<F, Either<E, B>> =>
  (interpreter) => interpreter.mapEither(value(interpreter), f(interpreter));

export const chainEither = <F extends URIS, E, A, B>(
  action: Expr<F, Either<E, A>>,
  f: Expr<F, (a: A) => Either<E, B>>
): Expr<F, Either<E, B>> =>
  (interpreter) => interpreter.chainEither(action(interpreter), f(interpreter));