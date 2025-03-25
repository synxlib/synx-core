import { Free } from "@/generic/free";
import { makeTagGuard } from "./make-tag-guard";
import { Instruction } from "./instruction";

export type EventSource = {
    subscribe: (cb: (e: unknown) => void) => void;
};

export type State<T> = {
    get: () => T;
};

const InstructionTags = {
    Fold: "Fold",
    FoldM: "FoldM",
    On: "On",
} as const;

export interface BaseInstruction<R> {
    tag: string;
    resultType: R;
}

export type OnInstruction = {
    tag: typeof InstructionTags.On;
    event: string;
    target: HTMLElement;
    resultType: EventSource;
};

export interface FoldInstruction<S, E> extends BaseInstruction<S> {
    tag: typeof InstructionTags.Fold;
    event: EventSource;
    initial: S;
    reducer: (state: S, event: E) => S;
}

export interface FoldMInstruction<S, E> extends BaseInstruction<S> {
    tag: typeof InstructionTags.FoldM;
    event: EventSource;
    initial: S;
    reducer: (state: S, event: E) => Free<Instruction, S>;
    resultType: S;
}

// Union type for all instructions
export type EventInstruction =
    | OnInstruction
    | FoldInstruction<any, any>
    | FoldMInstruction<any, any>;

export const on = (
    event: string | Free<Instruction, string>,
    target: Free<Instruction, HTMLElement>,
): Free<Instruction, EventSource> => {
    // Handle both string and computed event
    const eventComp =
        typeof event === "string"
            ? Free.pure<Instruction, string>(event)
            : event;

    // Evaluate both arguments before creating the instruction
    return eventComp.flatMap((eventVal) =>
        target.flatMap((targetVal) =>
            Free.liftF<Instruction, EventSource>({
                tag: InstructionTags.On,
                event: eventVal,
                target: targetVal,
                resultType: {} as EventSource, // Type placeholder, value provided by interpreter
            }),
        ),
    );
};

export const fold = <S, E>(
    event: Free<Instruction, EventSource>,
    initial: Free<Instruction, S>,
    reducer: (state: S, event: E) => S,
): Free<Instruction, S> => {
    return event.flatMap((eventVal) =>
        initial.flatMap((initialVal) => {
            const foldInstr: FoldInstruction<S, E> = {
                tag: InstructionTags.Fold,
                event: eventVal,
                initial: initialVal,
                reducer,
                resultType: {} as S,
            };

            return Free.liftF(foldInstr as Instruction);
        }),
    );
};

export const foldM = <S, E>(
    event: Free<Instruction, EventSource>,
    initial: Free<Instruction, S>,
    reducer: (state: S, event: E) => Free<Instruction, S>,
): Free<Instruction, S> => {
    // Evaluate event and initial state before creating the instruction
    return event.flatMap((eventVal) =>
        initial.flatMap((initialVal) =>
            Free.liftF<Instruction, S>({
                tag: InstructionTags.FoldM,
                event: eventVal,
                initial: initialVal,
                reducer,
                resultType: {} as S, // Type placeholder
            } as FoldMInstruction<S, E>),
        ),
    );
};

// export function eventMapInstr<A, B>(
//     instr: EventInstruction<A>,
//     f: (a: A) => B,
// ): EventInstruction<B> {
//     switch (instr.tag) {
//         case InstructionTags.On:
//             return { ...instr, next: (e: EventSource) => f(instr.next(e)) };
//         case InstructionTags.Fold:
//             return { ...instr, next: (s) => f(instr.next(s)) } as FoldInstr<
//                 any,
//                 any,
//                 B
//             >;
//         case InstructionTags.FoldM:
//             return { ...instr, next: (s) => f(instr.next(s)) } as FoldMInstr<
//                 any,
//                 any,
//                 B
//             >;
//     }
// }

export const isEventInstruction = makeTagGuard(Object.values(InstructionTags));

export function constantOn<S>(
    event: Free<Instruction, EventSource>,
    value: Free<Instruction, S>,
): Free<Instruction, S> {
    return foldM(event, value, () => value);
}
