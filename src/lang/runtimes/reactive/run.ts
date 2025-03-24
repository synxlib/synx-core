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
import { isStateInstruction } from "@/lang/extensions/state";
import { runStateInstr } from "./state";
import { isListInstruction } from "@/lang/extensions/list";
import { runListInstruction } from "./list";
import { isMathInstruction } from "@/lang/extensions/math";
import { runMathInstr } from "./math";
import { isStringInstruction } from "@/lang/extensions/string";
import { runStringInstr } from "./string";
import { isShowInstruction } from "@/lang/extensions/show";
import { runShowInstr } from "./show";

export function run<A>(program: Freer<A>, state: any = undefined): A {
    if (program.kind === "Pure") return program.value;
    return runInstr(program.instr, state);
}

function runInstr<A>(instr: Instruction<Freer<A>>, state: any = undefined): A {
    if (isDomInstruction(instr)) return runDomInstr(instr);
    if (isEventInstruction(instr)) return runEventInstr(instr);
    if (isDebugInstruction(instr)) return runDebugInstr(instr);
    if (isListInstruction(instr)) return runListInstruction(instr);
    if (isErrorInstruction(instr)) return runErrorInstr(instr);
    if (isMathInstruction(instr)) return runMathInstr(instr);
    if (isStringInstruction(instr)) return runStringInstr(instr);
    if (isShowInstruction(instr)) return runShowInstr(instr);
    // if (isStateInstruction(instr)) return runStateInstr(instr, state);
    throw new Error(`Unknown instruction: ${(instr as any).tag}`);
}
