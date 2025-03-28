import { describe, it, expect, vi } from "vitest";
import { Free } from "@/generic/free";
import {
    and,
    or,
    not,
    equals,
    greaterThan,
    lessThan,
    ifElse,
    match,
} from "@/lang/extensions/logical";
import { Instruction } from "./instruction";

// Helper to create a mock interpreter for testing the DSL operations
function createMockInterpreter() {
    const calls: Array<{ tag: string; args: any }> = [];

    const interpret = <X>(effect: Instruction & { resultType: X }): X => {
        calls.push({
            tag: effect.tag,
            args: { ...effect, resultType: undefined },
        });

        // Simulate the real interpreter behavior based on the instruction tag
        switch (effect.tag) {
            case "And":
                return (effect.left && effect.right) as X;
            case "Or":
                return (effect.left || effect.right) as X;
            case "Not":
                return !effect.value as X;
            case "Equals":
                return (effect.left === effect.right) as X;
            case "GreaterThan":
                return (effect.left > effect.right) as X;
            case "LessThan":
                return (effect.left < effect.right) as X;
            case "IfElse":
                return (
                    effect.condition ? effect.thenBranch : effect.elseBranch
                ) as X;
            case "Match":
                for (const [condition, value] of effect.conditions) {
                    if (condition) return value as X;
                }
                return effect.defaultValue as X;
            default:
                throw new Error(`Unknown instruction tag: ${effect.tag}`);
        }
    };

    return { interpret, calls };
}

describe("Logical DSL Operations", () => {
    describe("Basic operations", () => {
        it("should create AND operations correctly", () => {
            const { interpret, calls } = createMockInterpreter();

            // Test with direct boolean values
            const program1 = and(true, false);
            const result1 = program1.run(interpret);

            expect(result1).toBe(false);
            expect(calls[0].tag).toBe("And");
            expect(calls[0].args.left).toBe(true);
            expect(calls[0].args.right).toBe(false);

            // Test with Free values
            const program2 = and(Free.pure(true), Free.pure(true));
            const result2 = program2.run(interpret);

            expect(result2).toBe(true);
            expect(calls[1].tag).toBe("And");
            expect(calls[1].args.left).toBe(true);
            expect(calls[1].args.right).toBe(true);
        });

        it("should create OR operations correctly", () => {
            const { interpret, calls } = createMockInterpreter();

            // Test with direct boolean values
            const program = or(false, true);
            const result = program.run(interpret);

            expect(result).toBe(true);
            expect(calls[0].tag).toBe("Or");
            expect(calls[0].args.left).toBe(false);
            expect(calls[0].args.right).toBe(true);
        });

        it("should create NOT operations correctly", () => {
            const { interpret, calls } = createMockInterpreter();

            const program = not(true);
            const result = program.run(interpret);

            expect(result).toBe(false);
            expect(calls[0].tag).toBe("Not");
            expect(calls[0].args.value).toBe(true);
        });

        it("should create EQUALS operations correctly", () => {
            const { interpret, calls } = createMockInterpreter();

            // Test with numbers
            const program1 = equals(42, 42);
            const result1 = program1.run(interpret);

            expect(result1).toBe(true);
            expect(calls[0].tag).toBe("Equals");

            // Test with strings
            const program2 = equals("hello", "world");
            const result2 = program2.run(interpret);

            expect(result2).toBe(false);
        });

        it("should create comparison operations correctly", () => {
            const { interpret, calls } = createMockInterpreter();

            const gt = greaterThan(10, 5);
            const lt = lessThan(10, 5);

            expect(gt.run(interpret)).toBe(true);
            expect(lt.run(interpret)).toBe(false);

            expect(calls[0].tag).toBe("GreaterThan");
            expect(calls[1].tag).toBe("LessThan");
        });
    });

    describe("Control flow operations", () => {
        it("should handle if/else operations correctly", () => {
            const { interpret } = createMockInterpreter();

            // True condition
            const program1 = ifElse(true, "then value", "else value");
            expect(program1.run(interpret)).toBe("then value");

            // False condition
            const program2 = ifElse(false, "then value", "else value");
            expect(program2.run(interpret)).toBe("else value");

            // With computation in the condition
            const program3 = ifElse(
                and(true, not(false)),
                "then value",
                "else value",
            );
            expect(program3.run(interpret)).toBe("then value");
        });

        it("should handle MATCH operations correctly", () => {
            const { interpret } = createMockInterpreter();

            // First condition is true
            const program1 = match(
                [
                    [true, "first value"],
                    [true, "second value"],
                ],
                "default value",
            );
            expect(program1.run(interpret)).toBe("first value");

            // No conditions are true
            const program2 = match(
                [
                    [false, "first value"],
                    [false, "second value"],
                ],
                "default value",
            );
            expect(program2.run(interpret)).toBe("default value");

            // Second condition is true
            const program3 = match(
                [
                    [false, "first value"],
                    [true, "second value"],
                ],
                "default value",
            );
            expect(program3.run(interpret)).toBe("second value");
        });
    });

    describe("Complex operations", () => {
        it("should be able to compose operations", () => {
            const { interpret } = createMockInterpreter();

            // Create a more complex expression: (a > b) && !(c == d)
            const a = 10,
                b = 5,
                c = "hello",
                d = "hello";

            const program = and(greaterThan(a, b), not(equals(c, d)));

            // Expected: (10 > 5) && !('hello' == 'hello') = true && false = false
            expect(program.run(interpret)).toBe(false);
        });

        it("should handle nested control flow", () => {
            const { interpret } = createMockInterpreter();

            // if (a > b) then (if c then 'value1' else 'value2') else 'value3'
            const program = ifElse(
                greaterThan(10, 5),
                ifElse(true, "value1", "value2"),
                "value3",
            );

            expect(program.run(interpret)).toBe("value1");
        });

        it("should work with complex conditional logic", () => {
            const { interpret } = createMockInterpreter();

            const program = match(
                [
                    [and(true, false), Free.pure("first")],
                    [or(false, not(false)), Free.pure("second")],
                ],
                Free.pure("default"),
            );

            // Second condition is true: or(false, not(false)) = true
            expect(program.run(interpret)).toBe("second");
        });
    });
});
