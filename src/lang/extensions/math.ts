import { Free } from "@/generic/free";
import { makeTagGuard } from "./make-tag-guard";
import { showRegistry } from "./show";

export const InstructionTags = {
    Add: "Add",
    Mul: "Mul",
} as const;

export type MathInstruction =
    | {
          tag: typeof InstructionTags.Add;
          a: number;
          b: number;
          resultType: number;
      }
    | {
          tag: typeof InstructionTags.Mul;
          a: number;
          b: number;
          resultType: number;
      };

function mathOp<F extends MathInstruction>(
    tag: typeof InstructionTags.Add | typeof InstructionTags.Mul,
    a: Free<F, number>,
    b: Free<F, number>,
): Free<F, number> {
    return a.flatMap((aVal) =>
        b.flatMap((bVal) =>
            Free.liftF({
                tag,
                a: aVal,
                b: bVal,
                resultType: 0,
            } as F),
        ),
    );
}

export const add = (
    a: Free<MathInstruction, number>,
    b: Free<MathInstruction, number>,
) => mathOp(InstructionTags.Add, a, b);

export const mul = (
    a: Free<MathInstruction, number>,
    b: Free<MathInstruction, number>,
) => mathOp(InstructionTags.Mul, a, b);

export const isMathInstruction = makeTagGuard(Object.values(InstructionTags));

showRegistry.registerTypePredicate(
    (value: any) => typeof value === "number",
    "number",
);

showRegistry.register("number", {
    format: (n: number) => n.toString(),
});
