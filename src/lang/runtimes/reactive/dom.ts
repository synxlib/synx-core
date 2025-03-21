import { Either, right, left } from "@/generic/either";
import { DomInstruction } from "@/lang/extensions/dom";
import { Freer } from "@/lang/extensions/freer";
import { run } from "./run";
import { trackDependency } from "./dependency";

export function runDomInstr<A>(instr: DomInstruction<Freer<A>>): A {
    switch (instr.tag) {
        case "GetElementById": {
            const el = document.getElementById(instr.id);
            const result = el
                ? right(el)
                : left(`Element not found: ${instr.id}`);
            return run(instr.next(result));
        }
        case "GetProperty": {
            const value = instr.target[instr.prop];
            return run(instr.next(value));
        }
        case "SetProperty": {
            const effect = () => {
                const value = typeof instr.value === "object" && "get" in instr.value
                  ? instr.value.get()
                  : instr.value;
                if (instr.target) instr.target[instr.prop] = value;
              };
              if (typeof instr.value === "object" && "get" in instr.value) {
                trackDependency(instr.value, effect);
                effect();
              } else {
                effect();
              }
              return run(instr.next());
        }
    }
}
