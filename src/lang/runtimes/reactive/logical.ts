// Interpreter - reactive/logical.ts
import { LogicalInstruction } from "@/lang/extensions/logical";
import { ReactiveResult } from "./reactive-helpers";
import { handleReactiveValues } from "./reactive-helpers";

export function runLogicalInstr<R>(
    instr: LogicalInstruction & { resultType: R },
): ReactiveResult<R> {
    switch (instr.tag) {
        case "And": {
            const { left, right } = instr;
            return handleReactiveValues(
                [left, right],
                (leftVal, rightVal) => leftVal && rightVal,
            );
        }
        case "Or": {
            const { left, right } = instr;
            return handleReactiveValues(
                [left, right],
                (leftVal, rightVal) => leftVal || rightVal,
            );
        }
        case "Not": {
            const { value } = instr;
            return handleReactiveValues(
                [value],
                (val) => !val as typeof instr.resultType,
            );
        }
        case "Equals": {
            const { left, right } = instr;
            return handleReactiveValues(
                [left, right],
                (leftVal, rightVal) =>
                    (leftVal === rightVal) as typeof instr.resultType,
            );
        }
        case "GreaterThan": {
            const { left, right } = instr;
            return handleReactiveValues(
                [left, right],
                (leftVal, rightVal) =>
                    (leftVal > rightVal) as typeof instr.resultType,
            );
        }
        case "LessThan": {
            const { left, right } = instr;
            return handleReactiveValues(
                [left, right],
                (leftVal, rightVal) =>
                    (leftVal < rightVal) as typeof instr.resultType,
            );
        }
        case "IfElse": {
            const { condition, thenBranch, elseBranch } = instr;
            return handleReactiveValues(
                [condition, thenBranch, elseBranch],
                (condVal, thenVal, elseVal) => (condVal ? thenVal : elseVal),
            );
        }
        case "Match": {
            const { conditions, defaultValue } = instr;
            return handleReactiveValues(
                [conditions, defaultValue],
                (condPairs, defVal) => {
                    // Find the first condition that's true and return its value
                    for (const [condition, value] of condPairs) {
                        if (condition) {
                            return value;
                        }
                    }
                    // If no condition matched, return the default value
                    return defVal;
                },
            );
        }
    }
}
