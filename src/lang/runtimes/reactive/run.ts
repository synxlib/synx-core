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
import { Free } from "@/generic/free";

export function run<A>(program: Free<Instruction, A>): A {
    console.log("program", program);
    // Create an interpreter that delegates based on instruction type
    const interpret = <X>(
        effect: Instruction & { resultType: X },
    ): X | { get: (...args: any[]) => X; _dependencies: any[] } => {
        if (isDomInstruction(effect)) return runDomInstr(effect);
        if (isEventInstruction(effect)) return runEventInstr(effect);
        if (isDebugInstruction(effect)) return runDebugInstr(effect);
        if (isListInstruction(effect)) return runListInstruction(effect);
        if (isErrorInstruction(effect)) return runErrorInstr(effect);
        if (isMathInstruction(effect)) return runMathInstr(effect);
        if (isStringInstruction(effect)) return runStringInstr(effect);
        if (isShowInstruction(effect)) return runShowInstr(effect);

        throw new Error(`Unknown instruction: ${(effect as any).tag}`);
    };

    // Use the built-in run method with our interpreter
    return program.run(interpret);
}
