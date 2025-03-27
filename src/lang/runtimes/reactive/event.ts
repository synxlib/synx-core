import { EventInstruction, EventSource } from "@/lang/extensions/event";
import { run } from "./run";
import { notify } from "./reactive-helpers";
import { handleReactiveValues, ReactiveResult } from "./reactive-helpers";

export function runEventInstr<R>(
    instr: EventInstruction & { resultType: R },
): ReactiveResult<R> {
    switch (instr.tag) {
        case "On": {
            return handleReactiveValues(
                [instr.event, instr.target],
                (event, target) => {
                    const listeners: ((e: any) => void)[] = [];
                    const handler = (e: Event) => {
                        listeners.forEach((cb) => cb(e));
                    };
                    target?.addEventListener(event, handler);
                    const source: EventSource = {
                        subscribe: (cb) => listeners.push(cb),
                    };
                    return source as typeof instr.resultType;
                },
            );
        }
        case "Fold": {
            return handleReactiveValues(
                [instr.event, instr.initial],
                (event, initial) => {
                    let current = initial;
                    console.log("Fold initial value", initial);
                    const signal = { get: () => current, _dependencies: [] };
                    event.subscribe((e: unknown) => {
                        console.log("Running fold subscribe", current);
                        current = instr.reducer(current, e);
                        console.log("New current", current);
                        notify(signal);
                    });
                    console.log(
                        "Returning signal from fold",
                        signal,
                        signal.get(),
                    );
                    return signal as typeof instr.resultType;
                },
            );
        }
        case "FoldM": {
            return handleReactiveValues(
                [instr.event, instr.initial],
                (event, initial) => {
                    let current = initial;
                    const signal = { get: () => current };
                    event.subscribe((e: unknown) => {
                        current = run(instr.reducer(current, e));
                        notify(signal);
                    });
                    return signal as typeof instr.resultType;
                },
            );
        }
    }
}
