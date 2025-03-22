import { Freer, impure, pure } from "./freer";
import { makeTagGuard } from "./make-tag-guard";

type EventSource = {
    subscribe: (cb: (e: unknown) => void) => void;
};

const InstructionTags = {
    Fold: "Fold",
    FoldM: "FoldM",
    On: "On",
} as const;

type FoldInstr<S, E, A> = {
    tag: typeof InstructionTags.Fold;
    event: EventSource;
    initial: S;
    reducer: (state: S, event: E) => S;
    next: (state: S) => A;
};

type FoldMInstr<S, E, A> = {
    tag: typeof InstructionTags.FoldM;
    event: EventSource;
    initial: S;
    reducer: (state: S, event: E) => Freer<S>;
    next: (state: S) => A;
};

export type EventInstruction<A> =
    | {
          tag: typeof InstructionTags.On;
          event: string;
          target: HTMLElement | null;
          next: (e: EventSource) => A;
      }
    | FoldInstr<any, any, A>
    | FoldMInstr<any, any, A>;

export const on = (
    event: string,
    target: HTMLElement | null,
): Freer<EventSource> =>
    impure({ tag: InstructionTags.On, event, target, next: pure });

export const fold = <S, E>(
    event: EventSource,
    initial: S,
    reducer: (state: S, event: E) => S,
): Freer<S> =>
    impure({
        tag: InstructionTags.Fold,
        event,
        initial,
        reducer,
        next: pure,
    } as FoldInstr<S, E, Freer<S>>);

export const foldM = <S, E>(
    event: EventSource,
    initial: S,
    reducer: (state: S, event: E) => Freer<S>,
): Freer<S> =>
    impure({
        tag: InstructionTags.FoldM,
        event,
        initial,
        reducer,
        next: pure,
    } as FoldMInstr<S, E, Freer<S>>);

export function eventMapInstr<A, B>(
    instr: EventInstruction<A>,
    f: (a: A) => B,
): EventInstruction<B> {
    switch (instr.tag) {
        case InstructionTags.On:
            return { ...instr, next: (e: EventSource) => f(instr.next(e)) };
        case InstructionTags.Fold:
            return { ...instr, next: (s) => f(instr.next(s)) } as FoldInstr<
                any,
                any,
                B
            >;
        case InstructionTags.FoldM:
            return { ...instr, next: (s) => f(instr.next(s)) } as FoldMInstr<
                any,
                any,
                B
            >;
    }
}

export const isEventInstruction = makeTagGuard(Object.values(InstructionTags));

export function constantOn<E, A>(event: EventSource, value: A): Freer<A> {
    return foldM(event, value, () => pure(value));
}
