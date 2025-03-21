import { Freer, impure, pure } from "./freer";
import { makeTagGuard } from "./make-tag-guard";

const InstructionTags = {
    Log: "Log",
} as const;

export type DebugInstruction<A> = {
    tag: typeof InstructionTags.Log;
    message: string;
    next: () => A;
};

export const log = (message: string): Freer<void> =>
    impure({ tag: InstructionTags.Log, message, next: () => pure(undefined) });

export function debugMapInstr<A, B>(instr: DebugInstruction<A>, f: (a: A) => B): DebugInstruction<B> {
    switch (instr.tag) {
      case InstructionTags.Log:
        return { ...instr, next: () => f(instr.next()) };
    }
  }
  
export const isDebugInstruction = makeTagGuard(Object.values(InstructionTags));
