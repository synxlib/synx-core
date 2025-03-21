import { Either, left } from "@/generic/either";
import { ErrorInstruction, throwError } from "@/lang/extensions/error";
import { run } from "./run";
import { pure } from "@/lang/extensions/freer";

export function runErrorInstr<A>(instr: ErrorInstruction<A>): Either<string, A> {
    switch (instr.tag) {
        case "Throw":
          return left(instr.error);
    
        case "Catch": {
          const attempt = run(instr.tryBlock);
          if (attempt.isRight()) return attempt;
          return run(instr.handler(attempt.value));
        }
    
        case "Require": {
          return instr.input.isLeft()
            ? run(throwError(instr.input.value || instr.error))
            : run(pure(instr.next(instr.input.value)));
        }
    }
}