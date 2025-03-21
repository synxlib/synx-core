import { DebugInstruction } from "./debug";
import { DomInstruction } from "./dom";
import { ErrorInstruction } from "./error";
import { EventInstruction } from "./event";

export type Instruction<A> =
    | EventInstruction<A>
    | DomInstruction<A>
    | DebugInstruction<A>
    | ErrorInstruction<A>