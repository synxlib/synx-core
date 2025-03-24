import { Freer, impure, pure } from "./freer";
import { makeTagGuard } from "./make-tag-guard";
import { showRegistry } from "./show";

const InstructionTags = {
    Add: "Add",
    Mul: "Mul",
} as const;

export type MathInstruction<A> =
    | {
          tag: typeof InstructionTags.Add;
          a: Freer<number>;
          b: Freer<number>;
          next: (result: number) => A;
      }
    | {
          tag: typeof InstructionTags.Mul;
          a: Freer<number>;
          b: Freer<number>;
          next: (result: number) => A;
      };

export const add = <A>(a: Freer<number>, b: Freer<number>): Freer<number> =>
    impure({ tag: InstructionTags.Add, a, b, next: pure });

export const mul = <A>(a: Freer<number>, b: Freer<number>): Freer<number> =>
    impure({ tag: InstructionTags.Mul, a, b, next: pure });

export function mathMapInstr<A, B>(
    instr: MathInstruction<A>,
    f: (a: A) => B,
): MathInstruction<B> {
    switch (instr.tag) {
        case InstructionTags.Add:
        case InstructionTags.Mul:
            return { ...instr, next: (r: number) => f(instr.next(r)) };
    }
}

export const isMathInstruction = makeTagGuard(Object.values(InstructionTags));

showRegistry.registerTypePredicate((value: any) => typeof value === "number", "number");
showRegistry.register("number", {
    format: (n: number)  => n.toString()
});
