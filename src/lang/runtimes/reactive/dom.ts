import { DomInstruction, InstructionTags } from "@/lang/extensions/dom";
import { handleReactiveValues, ReactiveResult } from "./reactive-helpers";
import { right, Either, left } from "@/generic/either";

export function runDomInstr<X>(
    instr: DomInstruction & { resultType: X },
): ReactiveResult<X> {
    switch (instr.tag) {
        case InstructionTags.GetElementById: {
            return handleReactiveValues([instr.id], (id) => {
                const element = document.getElementById(id);
                // Create the Either result
                const result = element
                    ? (right(element) as Either<string, HTMLElement>)
                    : (left(`Element with id ${id} not found`) as Either<
                          string,
                          HTMLElement
                      >);
                return result as typeof instr.resultType;
            });
        }
        case "GetProperty": {
            return handleReactiveValues(
                [instr.prop, instr.target],
                (prop, target) => target[prop],
            );
        }
        case "SetProperty": {
            return handleReactiveValues(
                [instr.prop, instr.target, instr.value],
                (prop, target, value) => {
                    console.log("Set Property Callback", target, value);
                    if (target) target[prop] = value;
                    return undefined as typeof instr.resultType;
                },
            );
        }
    }
}
