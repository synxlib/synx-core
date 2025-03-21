import { DebugInstruction } from "@/lang/extensions/debug";
import { Freer } from "@/lang/extensions/freer";
import { run } from "./run";
import { Either } from "@/generic/either";


export function runDebugInstr<A>(instr: DebugInstruction<Freer<A>>): Either<string, A> {
    switch(instr.tag) {
        case "Log": {
            console.log(instr.message);
            return run(instr.next());
          }
    }
}