import { ErrorInstruction, throwError } from "@/lang/extensions/error";
import { ReactiveResult } from "./reactive-helpers";
import { run } from "./run";
import { Free } from "@/generic/free";
import { Instruction } from "@/lang/extensions/instruction";

export function runErrorInstr<R>(
    instr: ErrorInstruction & { resultType: R },
): ReactiveResult<R> {
    switch (instr.tag) {
        case "Throw": {
            const error = instr.error;
            throw new Error(error);
        }

        case "Catch": {
            try {
                const result = run(instr.tryBlock);
                return result;
            } catch (err) {
                const handlerProgram = instr.handler(String(err));
                return run(handlerProgram);
            }
        }

        case "Require": {
            if (instr.input.isLeft()) {
                const errorMsg = instr.input.value || instr.error;
                throw new Error(errorMsg);
            } else {
                // Run the pure value through the interpreter to maintain reactivity
                return run(Free.pure<Instruction, R>(instr.input.value));
            }
        }
    }
}
