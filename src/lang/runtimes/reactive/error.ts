import { Either, left } from "@/generic/either";
import { ErrorInstruction, throwError } from "@/lang/extensions/error";
import { run } from "./run";
import { pure } from "@/lang/extensions/freer";

export function runErrorInstr<A>(instr: ErrorInstruction<A>): A {
    switch (instr.tag) {
        case "Throw":
            throw new Error(instr.error);
    
        case "Catch": {
            try {
                const result = run(instr.tryBlock);
                return result;
              } catch (err) {
                return run(instr.handler(String(err)));
              }
        }
    
        case "Require": {
          return instr.input.isLeft()
            ? run(throwError(instr.input.value || instr.error))
            : run(pure(instr.next(instr.input.value)));
        }
    }
}