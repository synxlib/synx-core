import { Free } from "@/generic/free";
import { makeTagGuard } from "./make-tag-guard";
import { Instruction } from "./instruction";

const InstructionTags = {
    Log: "Log",
} as const;

export type DebugInstruction = {
    tag: typeof InstructionTags.Log;
    message: string;
    resultType: void;
};

export const log = (
    message: string | Free<Instruction, string>,
): Free<Instruction, void> =>
    typeof message === "string"
        ? Free.liftF({
              tag: InstructionTags.Log,
              message,
              resultType: undefined,
          })
        : message.flatMap((msgVal) =>
              Free.liftF({
                  tag: InstructionTags.Log,
                  message: msgVal,
                  resultType: undefined,
              }),
          );

// export function debugMapInstr<A, B>(
//     instr: DebugInstruction,
//     f: (a: A) => B,
// ): DebugInstruction {
//     switch (instr.tag) {
//         case InstructionTags.Log:
//             return { ...instr, next: () => f(instr.next()) };
//     }
// }

export const isDebugInstruction = makeTagGuard(Object.values(InstructionTags));
