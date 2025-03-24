import { handleReactive } from "./reactive-helpers";
import { MathInstruction } from "@/lang/extensions/math";

export function runMathInstr<A>(instr: MathInstruction<A>): A {
    switch (instr.tag) {
        case "Add": {
            return handleReactive([instr.a, instr.b], (a, b) =>
                instr.next(a + b),
            );
        }
        case "Mul": {
            return handleReactive([instr.a, instr.b], (a, b) =>
                instr.next(a * b),
            );
        }
    }
}

