import { handleReactiveValues, ReactiveResult } from "./reactive-helpers";
import { InstructionTags, MathInstruction } from "@/lang/extensions/math";

export function runMathInstr<R>(
    effect: MathInstruction & { resultType: R },
): ReactiveResult<R> {
    switch (effect.tag) {
        case InstructionTags.Add: {
            const { a, b } = effect;
            return handleReactiveValues([a, b], (aVal, bVal) => aVal + bVal);
        }

        case InstructionTags.Mul: {
            const { a, b } = effect;
            return handleReactiveValues([a, b], (aVal, bVal) => aVal * bVal);
        }
    }
}
