import { Freer, impure, pure } from "./freer";
import { makeTagGuard } from "./make-tag-guard";

const InstructionTags = {
    Concat: "Concat",
    Join: "Join",
} as const;

type ConcatInstr<A, B> = {
    tag: typeof InstructionTags.Concat;
    list: Freer<B[]>;
    value: Freer<B>;
    next: (result: Array<B>) => A;
};

type JoinInstr<A, B> = {
    tag: typeof InstructionTags.Join;
    list: Freer<B[]>;
    str: Freer<string>;
    next: (result: string) => A;
};

export type ListInstruction<A> = ConcatInstr<A, any> | JoinInstr<A, any>;

export const concat = <A>(list: Freer<Array<A>>, value: Freer<A>): Freer<Array<A>> =>
    impure({ tag: InstructionTags.Concat, list, value, next: pure });

export const join = <A>(list: Freer<Array<A>>, str: Freer<string>): Freer<string> =>
    impure({ tag: InstructionTags.Join, list, str, next: pure });


export function listMapInstr<A, B>(
    instr: ListInstruction<A>,
    f: (a: A) => B,
): ListInstruction<B> {
    switch (instr.tag) {
        case "Concat":
            return { ...instr, next: (arr: any[]) => f(instr.next(arr)) };
          case "Join":
            return { ...instr, next: (str: string) => f(instr.next(str)) };
    }
}

export const isListInstruction = makeTagGuard(Object.values(InstructionTags));
