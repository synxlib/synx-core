import { DomInstruction } from "@/lang/extensions/dom";
import { Freer } from "@/lang/extensions/freer";
import { run } from "./run";
import { handleReactive, withReactive } from "./reactive-helpers";

export function runDomInstr<A>(instr: DomInstruction<Freer<A>>): A {
    switch (instr.tag) {
        case "GetElementById": {
            const id = run(instr.id);
            const el = document.getElementById(id);
            return run(instr.next(el));
        }
        case "GetProperty": {
            const prop = run(instr.prop);
            const target = run(instr.target);
            const value = target[prop];
            return run(instr.next(value));
        }
        case "SetProperty": {
            const prop = run(instr.prop);
            const target = run(instr.target);
            // const value = instr.value;
            return handleReactive([instr.value], (value) => {
                if (target) target[prop] = value;
                return instr.next();
            })
            // return run(
            //   flatMap(value, (v: any) => {
            //     withReactive(v, (val: any) => {
            //       if (target) target[prop] = val;
            //     });
            //     return instr.next();
            //   })
            // );
        }
    }
}
