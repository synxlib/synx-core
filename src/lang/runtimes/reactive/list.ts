import { ListInstruction } from "@/lang/extensions/list";
import { handleReactive, isSignal, withReactive } from "./reactive-helpers";

export function runListInstruction<A>(instr: ListInstruction<A>): A {
    switch (instr.tag) {
        case "Concat": {
            return handleReactive([instr.value, instr.list], (value, list) => {
                console.log("Concat", list, value);
                return instr.next([...list, value]);
            });
        }
        case "Join": {
            console.log("Join before:", instr.list);
            return handleReactive([instr.str, instr.list], (str, list) => {
                console.log("Join", list, str);
                return instr.next(list.join(str));
            });
        }
    }
}

