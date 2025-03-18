import { SynxError } from "@/lang/extensions/error";
import { R, RValue, unR } from "./common";
import { RContext } from "./context";
import { Either, left, right } from "@/generic/either";

export const RError = (rContext: RContext): SynxError<"R"> => ({
    throwError<E, A>(error: E): RValue<A> {
        throw new Error(`Error in R interpreter: ${JSON.stringify(error)}`);
    },

    fromEither<E, A>(
        value: Either<RValue<E>, RValue<A>>,
    ): RValue<Either<E, A>> {
        if (value.isLeft()) {
            return R(left(unR(value.value)));
        } else {
            return R(right(unR(value.value)));
        }
    },

    // Map over the Right value in an Either
    mapEither<E, A, B>(
        value: RValue<Either<E, A>>,
        f: RValue<(a: A) => B>,
    ): RValue<Either<E, B>> {
        const either = unR(value);
        const mapper = unR(f);

        if (either.isRight()) {
            return R(right(mapper(either.value)));
        } else {
            return R(left(either.value));
        }
    },

    // Chain/flatMap for Either values
    chainEither<E, A, B>(
        action: RValue<Either<E, A>>,
        f: RValue<(a: A) => Either<E, B>>,
    ): RValue<Either<E, B>> {
        const either = unR(action);
        const chainFunction = unR(f);

        if (either.isRight()) {
            const value = chainFunction(either.value);
            return R(value);
        } else {
            return R(left(either.value));
        }
    },
});

