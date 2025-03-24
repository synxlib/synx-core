import { Freer, impure, pure } from "./freer";
import { makeTagGuard } from "./make-tag-guard";

export type EventSource = {
    subscribe: (cb: (e: unknown) => void) => void;
};

export type State<T> = {
    get: () => T
}

const InstructionTags = {
    Fold: "Fold",
    FoldM: "FoldM",
    On: "On",
} as const;

type FoldInstr<S, E, A> = {
    tag: "Fold";
    event: Freer<EventSource>;
    initial: Freer<S>;
    reducer: (state: S, event: E) => S;
    next: (state: S) => A;
  };
  
  type FoldMInstr<S, E, A> = {
    tag: "FoldM";
    event: Freer<EventSource>;
    initial: Freer<S>;
    reducer: (state: S, event: E) => Freer<S>;
    next: (state: S) => A;
  };

export type EventInstruction<A> =
    | {
          tag: typeof InstructionTags.On;
          event: Freer<string>;
          target: Freer<HTMLElement>;
          next: (e: EventSource) => A;
      }
    | FoldInstr<any, any, A>
    | FoldMInstr<any, any, A>;

export const on = (
    event: string | Freer<string>,
    target: Freer<HTMLElement>,
): Freer<EventSource> =>
    impure({ tag: InstructionTags.On, event: typeof event === "string" ? pure(event) : event, target, next: pure });

export const fold = <S, E>(
    event: Freer<EventSource>,
    initial: Freer<S>,
    reducer: (state: S, event: E) => S,
): Freer<S> =>
    impure({
        tag: InstructionTags.Fold,
        event,
        initial,
        reducer,
        next: pure,
    });

export const foldM = <S, E>(
    event: Freer<EventSource>,
    initial: Freer<S>,
    reducer: (state: S, event: E) => Freer<S>
  ): Freer<S> => impure({ tag: "FoldM", event, initial, reducer, next: pure });

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

export function constantOn<E, A>(event: Freer<EventSource>, value: Freer<A>): Freer<A> {
    return foldM(event, value, () => value);
}
