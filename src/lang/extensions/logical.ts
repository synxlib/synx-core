// DSL core - extensions/logical.ts
import { Free, traverse } from "@/generic/free";
import { makeTagGuard } from "./make-tag-guard";
import { Instruction } from "./instruction";

const InstructionTags = {
    And: "And",
    Or: "Or",
    Not: "Not",
    Equals: "Equals",
    GreaterThan: "GreaterThan",
    LessThan: "LessThan",
    IfElse: "IfElse",
    Match: "Match",
} as const;

export type LogicalInstruction =
    | {
          tag: typeof InstructionTags.And;
          left: boolean;
          right: boolean;
          resultType: boolean;
      }
    | {
          tag: typeof InstructionTags.Or;
          left: boolean;
          right: boolean;
          resultType: boolean;
      }
    | {
          tag: typeof InstructionTags.Not;
          value: boolean;
          resultType: boolean;
      }
    | {
          tag: typeof InstructionTags.Equals;
          left: any;
          right: any;
          resultType: boolean;
      }
    | {
          tag: typeof InstructionTags.GreaterThan;
          left: number;
          right: number;
          resultType: boolean;
      }
    | {
          tag: typeof InstructionTags.LessThan;
          left: number;
          right: number;
          resultType: boolean;
      }
    | {
          tag: typeof InstructionTags.IfElse;
          condition: boolean;
          thenBranch: any;
          elseBranch: any;
          resultType: any;
      }
    | {
          tag: typeof InstructionTags.Match;
          conditions: Array<[boolean, any]>;
          defaultValue: any;
          resultType: any;
      };

// Helper function to work with Free values or raw values
const wrapValue = <T>(value: T | Free<Instruction, T>): Free<Instruction, T> =>
    value instanceof Free ? value : Free.pure(value);

// Logical operations
export const and = (
    left: boolean | Free<Instruction, boolean>,
    right: boolean | Free<Instruction, boolean>,
): Free<Instruction, boolean> => {
    const leftFree = wrapValue(left);
    const rightFree = wrapValue(right);

    return leftFree.flatMap((leftVal) =>
        rightFree.flatMap((rightVal) =>
            Free.liftF({
                tag: InstructionTags.And,
                left: leftVal,
                right: rightVal,
                resultType: undefined as unknown as boolean,
            }),
        ),
    );
};

export const or = (
    left: boolean | Free<Instruction, boolean>,
    right: boolean | Free<Instruction, boolean>,
): Free<Instruction, boolean> => {
    const leftFree = wrapValue(left);
    const rightFree = wrapValue(right);

    return leftFree.flatMap((leftVal) =>
        rightFree.flatMap((rightVal) =>
            Free.liftF({
                tag: InstructionTags.Or,
                left: leftVal,
                right: rightVal,
                resultType: true,
            }),
        ),
    );
};

export const not = (
    value: boolean | Free<Instruction, boolean>,
): Free<Instruction, boolean> => {
    const valueFree = wrapValue(value);

    return valueFree.flatMap((val) =>
        Free.liftF({
            tag: InstructionTags.Not,
            value: val,
            resultType: undefined as unknown as boolean,
        }),
    );
};

export const equals = <T>(
    left: T | Free<Instruction, T>,
    right: T | Free<Instruction, T>,
): Free<Instruction, boolean> => {
    const leftFree = wrapValue(left);
    const rightFree = wrapValue(right);

    return leftFree.flatMap((leftVal) =>
        rightFree.flatMap((rightVal) =>
            Free.liftF({
                tag: InstructionTags.Equals,
                left: leftVal,
                right: rightVal,
                resultType: undefined as unknown as boolean,
            }),
        ),
    );
};

export const greaterThan = (
    left: number | Free<Instruction, number>,
    right: number | Free<Instruction, number>,
): Free<Instruction, boolean> => {
    const leftFree = wrapValue(left);
    const rightFree = wrapValue(right);

    return leftFree.flatMap((leftVal) =>
        rightFree.flatMap((rightVal) =>
            Free.liftF({
                tag: InstructionTags.GreaterThan,
                left: leftVal,
                right: rightVal,
                resultType: undefined as unknown as boolean,
            }),
        ),
    );
};

export const lessThan = (
    left: number | Free<Instruction, number>,
    right: number | Free<Instruction, number>,
): Free<Instruction, boolean> => {
    const leftFree = wrapValue(left);
    const rightFree = wrapValue(right);

    return leftFree.flatMap((leftVal) =>
        rightFree.flatMap((rightVal) =>
            Free.liftF({
                tag: InstructionTags.LessThan,
                left: leftVal,
                right: rightVal,
                resultType: undefined as unknown as boolean,
            }),
        ),
    );
};

export const ifElse = <T>(
    condition: boolean | Free<Instruction, boolean>,
    thenBranch: T | Free<Instruction, T>,
    elseBranch: T | Free<Instruction, T>,
): Free<Instruction, T> => {
    const conditionFree = wrapValue(condition);
    const thenFree = wrapValue(thenBranch);
    const elseFree = wrapValue(elseBranch);

    return conditionFree.flatMap((condVal) =>
        thenFree.flatMap((thenVal) =>
            elseFree.flatMap((elseVal) =>
                Free.liftF({
                    tag: InstructionTags.IfElse,
                    condition: condVal,
                    thenBranch: thenVal,
                    elseBranch: elseVal,
                    resultType: undefined as unknown as T,
                }),
            ),
        ),
    );
};

export const match = <T>(
    conditions: Array<
        [boolean | Free<Instruction, boolean>, T | Free<Instruction, T>]
    >,
    defaultValue: T | Free<Instruction, T>,
): Free<Instruction, T> => {
    // Process all condition-value pairs to Free
    const processedConditions = conditions.map(([cond, value]) => [
        wrapValue(cond),
        wrapValue(value),
    ]) as Array<[Free<Instruction, boolean>, Free<Instruction, T>]>;

    // Process the default value
    const defaultFree = wrapValue(defaultValue);

    // Helper to evaluate a single condition-value pair
    const evaluateConditionPair = (
        pair: [Free<Instruction, boolean>, Free<Instruction, T>],
    ): Free<Instruction, [boolean, T]> => {
        const [condition, value] = pair;
        return condition.flatMap((condValue) =>
            value.flatMap((val) => Free.pure([condValue, val])),
        );
    };

    // Evaluate all condition-value pairs
    return traverse(processedConditions, evaluateConditionPair).flatMap(
        (evalPairs) =>
            defaultFree.flatMap((defaultVal) =>
                Free.liftF({
                    tag: InstructionTags.Match,
                    conditions: evalPairs,
                    defaultValue: defaultVal,
                    resultType: undefined as unknown as T,
                }),
            ),
    );
};

// Guard to check if an instruction is a logical instruction
export const isLogicalInstruction = makeTagGuard(
    Object.values(InstructionTags),
);

// Additional convenience functions
export const greaterThanOrEqual = (
    left: number | Free<Instruction, number>,
    right: number | Free<Instruction, number>,
): Free<Instruction, boolean> => {
    return or(greaterThan(left, right), equals(left, right));
};

export const lessThanOrEqual = (
    left: number | Free<Instruction, number>,
    right: number | Free<Instruction, number>,
): Free<Instruction, boolean> => {
    return or(lessThan(left, right), equals(left, right));
};

export const notEquals = <T>(
    left: T | Free<Instruction, T>,
    right: T | Free<Instruction, T>,
): Free<Instruction, boolean> => {
    return not(equals(left, right));
};
