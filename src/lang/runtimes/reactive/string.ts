import { StringInstruction } from "@/lang/extensions/string";
import { handleReactive } from "./reactive-helpers";

export function runStringInstr<A>(instr: StringInstruction<A>): A {
    switch (instr.tag) {
        case "Combine": {
            return handleReactive([instr.a, instr.b], (a, b) =>
                    instr.next(a + b)
                );
        }
    }
}

