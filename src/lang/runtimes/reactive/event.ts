import { Either } from "@/generic/either";
import { EventInstruction } from "@/lang/extensions/event";
import { Freer } from "@/lang/extensions/freer";
import { run } from "./run";
import { notify } from "./dependency";

export function runEventInstr<A>(
    instr: EventInstruction<Freer<A>>,
): Either<string, A> {
    switch (instr.tag) {
        case "On": {
            const subscribers: ((e: any) => void)[] = [];
            const handler = (e: Event) => subscribers.forEach((cb) => cb(e));
            instr.target?.addEventListener(instr.event, handler);
            const eventSource: EventSource = {
              subscribe: (cb) => subscribers.push(cb),
            };
            return run(instr.next(eventSource));
        }
        case "Fold": {
            let state = instr.initial;
            const signal = { get: () => state };
            instr.event.subscribe((e) => {
                state = instr.reducer(state, e);
                notify(signal);
            });
            return run(instr.next(signal));
        }
        case "FoldM": {
            let state = instr.initial;
            const { event, reducer, next } = instr;
            const signal = { get: () => state };
            event.subscribe((e) => {
              const eff = reducer(state, e);
              const result = run(eff);
              if (result.isRight()) {
                state = result.value;
                notify(signal);
              } else {
                console.warn("Error in FoldM reducer:", result.value);
                // Optional: decide what to do (ignore, keep old state, set default, etc.)
              }
            });
            return run(next(signal));
        }
    }
}

