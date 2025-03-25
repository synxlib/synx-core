import { Free, lift2 } from "@/generic/free";
import { makeTagGuard } from "./make-tag-guard";
import { Instruction } from "./instruction";

const InstructionTags = {
    Concat: "Concat",
    Join: "Join",
} as const;

type ConcatInstr<A> = {
    tag: typeof InstructionTags.Concat;
    list: A[];
    value: A;
    resultType: A[];
};

type JoinInstr<A> = {
    tag: typeof InstructionTags.Join;
    list: A[];
    str: string;
    resultType: string;
};

export type ListInstruction = ConcatInstr<any> | JoinInstr<any>;

export const concat = <A>(
    list: Free<Instruction, A[]>,
    value: Free<Instruction, A>,
): Free<Instruction, Array<A>> =>
    list.flatMap((listVal) =>
        value.flatMap((val) =>
            Free.liftF({
                tag: InstructionTags.Concat,
                list: listVal,
                value: val,
                resultType: [],
            }),
        ),
    );

export const join = <A>(
    list: Free<Instruction, Array<A>>,
    str: Free<Instruction, string>,
): Free<Instruction, string> =>
    list.flatMap((listVal) =>
        str.flatMap((strVal) =>
            Free.liftF({
                tag: InstructionTags.Join,
                list: listVal,
                str: strVal,
                resultType: "",
            }),
        ),
    );

// export function listMapInstr<A, B>(
//     instr: ListInstruction,
//     f: (a: A) => B,
// ): ListInstruction {
//     switch (instr.tag) {
//         case "Concat":
//             return { ...instr, next: (arr: any[]) => f(instr.next(arr)) };
//         case "Join":
//             return { ...instr, next: (str: string) => f(instr.next(str)) };
//     }
// }

export const isListInstruction = makeTagGuard(Object.values(InstructionTags));
