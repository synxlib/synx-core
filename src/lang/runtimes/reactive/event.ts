import { EventInstruction, EventSource } from "@/lang/extensions/event";
import { Freer } from "@/lang/extensions/freer";
import { run } from "./run";
import { notify } from "./reactive-helpers";

export function runEventInstr<A>(instr: EventInstruction<Freer<A>>): A {
    switch (instr.tag) {
        case "On": {
            const event = run(instr.event);
            const target = run(instr.target);
            const listeners: ((e: any) => void)[] = [];
            const handler = (e: Event) => {
                listeners.forEach((cb) => cb(e));
            };
            target?.addEventListener(event, handler);
            const source: EventSource = {
                subscribe: (cb) => listeners.push(cb),
            };
            return run(instr.next(source));
        }
        case "Fold": {
            const event = run(instr.event);
            let current = run(instr.initial);
            const signal = { get: () => current };
            event.subscribe((e) => {
                current = run(instr.reducer(current, e));
                notify(signal);
            });
            return run(instr.next(signal));
        }
        case "FoldM": {
            const event = run(instr.event);
            let current = run(instr.initial);
            const signal = { get: () => current };

            event.subscribe((e) => {
                const eff = instr.reducer(current, e);
                current = run(eff);
                notify(signal);
            });
            return run(instr.next(signal));
        }
    }
}

