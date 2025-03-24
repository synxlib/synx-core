import { StateInstr } from "@/lang/extensions/state";
import { run } from "./run";

export function runStateInstr<S, A>(
    instr: StateInstr<unknown, A>,
    state: S
): A {
    switch(instr.tag) {
        case "State": {
            const [result, newState] = instr.run(state);
            return run(instr.next(result), newState);
        }
    }
}