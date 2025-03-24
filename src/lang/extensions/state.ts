import { Freer, impure, pure } from "./freer";
import { flatMap } from "./helpers";
import { makeTagGuard } from "./make-tag-guard";

const InstructionTags = {
    State: "State",
} as const;

export type StateInstr<S, A> = {
    tag: typeof InstructionTags.State;
    run: (state: S) => [any, S];
    next: (result: any) => A;
}

export const getState = <S>(): Freer<S> =>
    impure({
        tag: InstructionTags.State,
        run: (s: S) => [s, s],
        next: pure<S>
    });

export const putState = <S>(s: S): Freer<null> =>
    impure({
        tag: InstructionTags.State,
        run: (s: S) => [null, s],
        next: pure
    })

export const modifyState = <S>(f: (s: S) => S): Freer<null> =>
    flatMap(getState<S>(), (x) => putState(f(x)));

export const isStateInstruction = makeTagGuard(Object.values(InstructionTags));