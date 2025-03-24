import { ListInstruction } from "@/lang/extensions/list";
import { handleReactive, isSignal, withReactive } from "./reactive-helpers";

export function runListInstruction<A>(instr: ListInstruction<A>): A {
    switch (instr.tag) {
        case "Concat": {
            return handleReactive([instr.value, instr.list], (value, list) =>
                    instr.next([...list, value]),
            );
        }
        case "Join": {
            return handleReactive([instr.str, instr.list], (str, list) =>
                    instr.next(list.join(str)),
            );
        }
    }
}

