import { Free } from "@/generic/free";
import { makeTagGuard } from "./make-tag-guard";

const InstructionTags = {
    Combine: "Combine",
} as const;

export type StringInstruction = {
    tag: typeof InstructionTags.Combine;
    a: string;
    b: string;
    resultType: string;
};

export const combine = (
    a: Free<Instruction, string>,
    b: Free<Instruction, string>,
): Free<StringInstruction, string> =>
    a.flatMap((aVal) =>
        b.flatMap((bVal) =>
            Free.liftF({
                tag: InstructionTags.Combine,
                a: aVal,
                b: bVal,
                resultType: "",
            }),
        ),
    );

// export function stringMapInstr<A, B>(
//     instr: StringInstruction<A>,
//     f: (a: A) => B,
// ): StringInstruction<B> {
//     switch (instr.tag) {
//         case InstructionTags.Combine:
//             return { ...instr, next: (r: string) => f(instr.next(r)) };
//     }
// }

export const isStringInstruction = makeTagGuard(Object.values(InstructionTags));
