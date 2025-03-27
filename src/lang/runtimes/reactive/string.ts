import { StringInstruction } from "@/lang/extensions/string";
import { handleReactiveValues, ReactiveResult } from "./reactive-helpers";

export function runStringInstr<R>(
    instr: StringInstruction & { resultType: R },
): ReactiveResult<R> {
    switch (instr.tag) {
        case "Combine": {
            console.log("Configuring Combine reactivity.");
            return handleReactiveValues([instr.a, instr.b], (a, b) => {
                console.log("Combine callback", a, b, `"${a + b}"`);
                return a + b;
            });
        }
    }
}
