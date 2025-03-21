import { Either, right, left } from "@/generic/either";
import { isDebugInstruction } from "@/lang/extensions/debug";
import { isDomInstruction } from "@/lang/extensions/dom";
import { isEventInstruction } from "@/lang/extensions/event";
import { Freer } from "@/lang/extensions/freer";
import { Instruction } from "@/lang/extensions/instruction";
import { runDebugInstr } from "./debug";
import { runDomInstr } from "./dom";
import { runEventInstr } from "./event";
import { isErrorInstruction } from "@/lang/extensions/error";
import { runErrorInstr } from "./error";

export function run<A>(program: Freer<A>): A {
    if (program.kind === "Pure") return program.value;
    return runInstr(program.instr);
}

function runInstr<A>(instr: Instruction<Freer<A>>): A {
    if (isDomInstruction(instr)) return runDomInstr(instr);
    if (isEventInstruction(instr)) return runEventInstr(instr);
    if (isDebugInstruction(instr)) return runDebugInstr(instr);
    if (isErrorInstruction(instr)) return runErrorInstr(instr);
    throw new Error(`Unknown instruction: ${(instr as any).tag}`);
}
