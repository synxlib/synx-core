import { DebugInstruction } from "./debug";
import { DomInstruction } from "./dom";
import { ErrorInstruction } from "./error";
import { EventInstruction } from "./event";
import { ListInstruction } from "./list";
import { StateInstr } from "./state";

export type Instruction<A> =
    | EventInstruction<A>
    | DomInstruction<A>
    | DebugInstruction<A>
    | ErrorInstruction<A>
    | ListInstruction<A>