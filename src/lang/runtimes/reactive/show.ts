import { pure } from "@/lang/extensions/freer";
import { handleReactiveValues, ReactiveResult } from "./reactive-helpers";
import { ShowInstruction, showRegistry } from "@/lang/extensions/show";

export function runShowInstr<R>(
    instr: ShowInstruction & { resultType: R },
): ReactiveResult<R> {
    switch (instr.tag) {
        case "Show": {
            console.log("Configuring show");
            console.log("Show value", instr.value.get());
            return handleReactiveValues([instr.value], (value) => {
                const typeId = showRegistry.detectType(value);
                const formatted = showRegistry.format(typeId, value);
                console.log(
                    "Interpreter show value callback",
                    value,
                    formatted,
                    typeId,
                );
                return formatted as typeof instr.resultType;
            });
        }
    }
}
