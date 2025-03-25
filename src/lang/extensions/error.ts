import { Free } from "@/generic/free";
import { Either, left, right } from "@/generic/either";
import { makeTagGuard } from "./make-tag-guard";
import { Instruction } from "./instruction";
import { log } from "./debug";
// import { log } from "./debug";

const InstructionTags = {
    Throw: "Throw",
    Catch: "Catch",
    Require: "Require",
} as const;

export type ThrowInstruction = {
    tag: typeof InstructionTags.Throw;
    error: string;
    resultType: never;
};

export type CatchInstruction<A> = {
    tag: typeof InstructionTags.Catch;
    tryBlock: Free<Instruction, A>;
    handler: (err: string) => Free<Instruction, A>;
    resultType: A;
};

export type RequireInstruction<T> = {
    tag: typeof InstructionTags.Require;
    error: string;
    input: Either<string, T>;
    resultType: T;
};

// Union type for error instructions
export type ErrorInstruction<A = any, T = any> =
    | ThrowInstruction
    | CatchInstruction<A>
    | RequireInstruction<T>;

// Smart constructors for error operations
export const throwError = (
    msg: string | Free<Instruction, string>,
): Free<Instruction, never> => {
    const msgComp =
        typeof msg === "string" ? Free.pure<Instruction, string>(msg) : msg;

    return msgComp.flatMap((errorMsg) =>
        Free.liftF<Instruction, never>({
            tag: InstructionTags.Throw,
            error: errorMsg,
            resultType: undefined as never,
        }),
    );
};

export const catchError = <A>(
    tryBlock: Free<Instruction, A>,
    handler: (msg: string) => Free<Instruction, A>,
): Free<Instruction, A> => {
    return Free.liftF<Instruction, A>({
        tag: InstructionTags.Catch,
        tryBlock,
        handler,
        resultType: undefined as unknown as A,
    });
};

export const require = <T>(e: Either<string, T>): Free<Instruction, T> => {
    if (e.isRight()) {
        return Free.pure(e.value);
    }

    return Free.liftF<Instruction, T>({
        tag: InstructionTags.Require,
        error: e.value,
        input: e,
        resultType: undefined as unknown as T,
    });
};

// export const requireE = <A>(fa: Free<Instruction, Either<string, A>>): Freer<A> =>
//     flatMap(fa, (either) =>
//         either.isRight() ? pure(either.value) : throwError(either.value),
//     );
//
// export const mapLeft = <A>(
//     input: Either<string, A>,
//     f: (msg: string) => string,
// ): Either<string, A> => (input.isLeft() ? left(f(input.value)) : input);
//
// export const mapError = <A>(
//     prog: Free<Instruction, A>,
//     f: (err: string) => string,
// ): Free<Instruction, A> => catchError(prog, (e) => throwError(f(e)));
//
// export const orElse = <A>(prog: Free<Instruction, A>, fallback: A): Freer<A> =>
//     catchError(prog, () => pure(fallback));
//
// export const recoverWith = <A>(prog: Free<Instruction, A>, alt: Freer<A>): Freer<A> =>
//     catchError(prog, () => alt);

// export function errorMapInstr<A, B>(
//     instr: ErrorInstruction<A>,
//     f: (a: A) => B,
// ): ErrorInstruction<B> {
//     switch (instr.tag) {
//         case InstructionTags.Throw:
//             return { ...instr }; // nothing to map
//
//         case InstructionTags.Catch:
//             return {
//                 ...instr,
//                 handler: (err) => mapFreer(instr.handler(err), f),
//             };
//         case InstructionTags.Require:
//             return {
//                 ...instr,
//                 next: (s) => f(instr.next(s)),
//             };
//     }
// }

export const isErrorInstruction = makeTagGuard(Object.values(InstructionTags));

export const fromNullable = <A>(
    value: A | null | undefined,
    errorMsg: string,
): Either<string, A> => (value != null ? right(value) : left(errorMsg));

// Map over an Either, preserving errors
export const eitherMap = <E, A, B>(
    either: Either<E, A>,
    f: (a: A) => B,
): Either<E, B> => (either.isRight() ? right(f(either.value)) : either);

// Chain Eithers together
export const eitherChain = <E, A, B>(
    either: Either<E, A>,
    f: (a: A) => Either<E, B>,
): Either<E, B> => (either.isRight() ? f(either.value) : either);

// Sequence multiple Eithers
export const eitherAll = <E, A>(eithers: Either<E, A>[]): Either<E, A[]> => {
    const results: A[] = [];

    for (const either of eithers) {
        if (either.isLeft()) return either;
        results.push(either.value);
    }

    return right(results);
};

// Map over a Free<Instruction, Either<E, A>> to get a Freer<Either<E, B>>
export const mapE = <E, A, B>(
    fa: Free<Instruction, Either<E, A>>,
    f: (a: A) => B,
): Free<Instruction, Either<E, B>> =>
    fa.flatMap((either) => Free.pure(eitherMap(either, f)));

// Chain operations on Free<Instruction, Either<E, A>>
export const chainE = <E, A, B>(
    fa: Free<Instruction, Either<E, A>>,
    f: (a: A) => Free<Instruction, Either<E, B>>,
): Free<Instruction, Either<E, B>> =>
    fa.flatMap((either) =>
        either.isRight() ? f(either.value) : Free.pure(left(either.value)),
    );

// Lift a regular value into Free<Instruction, Either<E, A>>
export const ofE = <A>(value: A): Free<Instruction, Either<string, A>> =>
    Free.pure(right(value));

// Sequence multiple Free<Instruction, Either<E, A>> values
export const allE = <E, A>(
    fas: Free<Instruction, Either<E, A>>[],
): Free<Instruction, Either<E, A[]>> => {
    if (fas.length === 0) return Free.pure(right([]));

    return fas.reduce(
        (acc, next) =>
            chainE(acc, (values) =>
                chainE(next, (value) => Free.pure(right([...values, value]))),
            ),
        Free.pure(right([]) as Either<E, A[]>),
    );
};

// Apply a function to a successful value, or log the error and throw
export const withRequire = <A, B>(
    fa: Free<Instruction, Either<string, A>>,
    f: (a: A) => Free<Instruction, B>,
): Free<Instruction, B> => {
    return fa.flatMap((either) => {
        if (either.isRight()) {
            // Continue with the computation if we have a value
            return f(either.value);
        } else {
            // Log the error and throw if it's a Left
            return log(`Error: ${either.value}`).flatMap(() =>
                throwError(`Required value missing: ${either.value}`),
            );
        }
    });
};

// Try to get a successful value, or use a default with a warning
export const withDefault = <A>(
    fa: Free<Instruction, Either<string, A>>,
    defaultValue: A,
): Free<Instruction, A> =>
    fa.flatMap((either) =>
        either.isRight()
            ? Free.pure(either.value)
            : log(
                  `Warning: Using default value because: ${either.value}`,
              ).flatMap(() => Free.pure(defaultValue)),
    );
