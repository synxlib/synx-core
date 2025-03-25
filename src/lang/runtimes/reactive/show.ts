import { pure } from "@/lang/extensions/freer";
import { handleReactive } from "./reactive-helpers";
import { ShowInstruction, showRegistry } from "@/lang/extensions/show";

export function runShowInstr<A>(instr: ShowInstruction<A>): A {
    switch (instr.tag) {
        case "Show": {
            return handleReactive([instr.value], (value) => {
                const typeId = instr.getTypeId(value);
                const formatted = showRegistry.format(typeId, value);
                return instr.next(formatted);
            });
        }
    }
}


