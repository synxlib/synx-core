import { Freer, impure, pure } from "./freer";
import { makeTagGuard } from "./make-tag-guard";

const InstructionTags = {
    Combine: "Combine",
} as const;

export type StringInstruction<A> =
    | {
          tag: typeof InstructionTags.Combine;
          a: Freer<string>;
          b: Freer<string>;
          next: (result: string) => A;
      };

export const combine = (a: Freer<string>, b: Freer<string>): Freer<string> =>
    impure({ tag: InstructionTags.Combine, a, b, next: pure });

export function stringMapInstr<A, B>(
    instr: StringInstruction<A>,
    f: (a: A) => B,
): StringInstruction<B> {
    switch (instr.tag) {
        case InstructionTags.Combine:
            return { ...instr, next: (r: string) => f(instr.next(r)) };
    }
}

export const isStringInstruction = makeTagGuard(Object.values(InstructionTags));