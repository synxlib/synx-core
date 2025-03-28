import { DebugInstruction } from "@/lang/extensions/debug";
import { ReactiveResult } from "./reactive-helpers";

export function runDebugInstr<R>(
    instr: DebugInstruction & { resultType: R },
): ReactiveResult<R> {
    switch (instr.tag) {
        case "Log": {
            console.log(instr.message);
            return undefined as typeof instr.resultType;
        }
    }
}
