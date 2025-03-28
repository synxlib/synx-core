import { ListInstruction } from "@/lang/extensions/list";
import { handleReactiveValues, ReactiveResult } from "./reactive-helpers";

export function runListInstruction<R>(
    instr: ListInstruction & { resultType: R },
): ReactiveResult<R> {
    switch (instr.tag) {
        case "Concat": {
            return handleReactiveValues(
                [instr.value, instr.list],
                <T>(value: T, list: T[]) => {
                    console.log("Concat", list, value);
                    return [...list, value] as typeof instr.resultType;
                },
            );
        }
        case "Join": {
            console.log("Join before:", instr.list);
            return handleReactiveValues(
                [instr.str, instr.list],
                (str, list) => {
                    console.log("Join", list, str);
                    return list.join(str);
                },
            );
        }
    }
}
