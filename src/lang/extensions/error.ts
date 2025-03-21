import { Either, left } from "@/generic/either";
import { Freer, impure, mapFreer, pure } from "./freer";
import { makeTagGuard } from "./make-tag-guard";
import { log } from "./debug";

const InstructionTags = {
    Throw: "Throw",
    Catch: "Catch",
    Require: "Require"
} as const;

export type ErrorInstruction<A> =
    | { tag: "Throw"; error: string }
    | {
          tag: "Catch";
          tryBlock: Freer<any>;
          handler: (err: string) => Freer<A>;
      }
    | {
          tag: "Require";
          error: string;
          input: Either<string, any>;
          next: (value: any) => A;
      };

export const throwError = (msg: string): Freer<never> =>
    impure({ tag: "Throw", error: msg });

export const catchError = <A>(
    tryBlock: Freer<A>,
    handler: (msg: string) => Freer<A>,
): Freer<A> =>
    impure({
        tag: InstructionTags.Catch,
        tryBlock,
        handler: (err) => pure(handler(err)),
    });

export const require = <A>(e: Either<string, A>): Freer<A> =>
    e.isRight()
        ? pure(e.value)
        // TODO Use contructors from debug
        : impure({ tag: "Log", message: e.value, next: () => { throw new Error(e.value); } })

export const mapLeft = <A>(
    input: Either<string, A>,
    f: (msg: string) => string,
): Either<string, A> => (input.isLeft() ? left(f(input.value)) : input);

export const mapError = <A>(
    prog: Freer<A>,
    f: (err: string) => string,
): Freer<A> => catchError(prog, (e) => throwError(f(e)));

export const orElse = <A>(prog: Freer<A>, fallback: A): Freer<A> =>
    catchError(prog, () => pure(fallback));

export const recoverWith = <A>(prog: Freer<A>, alt: Freer<A>): Freer<A> =>
    catchError(prog, () => alt);

export function errorMapInstr<A, B>(
    instr: ErrorInstruction<A>,
    f: (a: A) => B,
): ErrorInstruction<B> {
    switch (instr.tag) {
        case InstructionTags.Throw:
            return { ...instr }; // nothing to map

        case InstructionTags.Catch:
            return {
                ...instr,
                handler: (err) => mapFreer(instr.handler(err), f),
            };
        case InstructionTags.Require:
            return {
                ...instr,
                next: (s) => f(instr.next(s))
            }
    }
}

export const isErrorInstruction = makeTagGuard(Object.values(InstructionTags));

