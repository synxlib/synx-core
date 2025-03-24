import { DebugInstruction } from "./debug";
import { DomInstruction } from "./dom";
import { ErrorInstruction } from "./error";
import { EventInstruction } from "./event";
import { ListInstruction } from "./list";
import { MathInstruction } from "./math";
import { ShowInstruction } from "./show";
import { StateInstr } from "./state";
import { StringInstruction } from "./string";

export type Instruction<A> =
    | EventInstruction<A>
    | DomInstruction<A>
    | DebugInstruction<A>
    | ErrorInstruction<A>
    | ListInstruction<A>
    | MathInstruction<A>
    | StringInstruction<A>
    | ShowInstruction<A>