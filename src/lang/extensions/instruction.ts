import { DebugInstruction } from "./debug";
import { DomInstruction } from "./dom";
import { ErrorInstruction } from "./error";
import { EventInstruction } from "./event";
import { ListInstruction } from "./list";
import { LogicalInstruction } from "./logical";
import { MathInstruction } from "./math";
import { ShowInstruction } from "./show";
import { StateInstr } from "./state";
import { StringInstruction } from "./string";

export type Instruction =
    | EventInstruction
    | DomInstruction
    | DebugInstruction
    | ErrorInstruction
    | ListInstruction
    | MathInstruction
    | StringInstruction
    | LogicalInstruction
    | ShowInstruction;
