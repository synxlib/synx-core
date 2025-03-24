import { Either } from "@/generic/either";
import { Freer, impure, pure } from "./freer";
import { makeTagGuard } from "./make-tag-guard";
import { State } from "./event";
import { fromNullable } from "./error";

const InstructionTags = {
    GetElementById: "GetElementById",
    GetProperty: "GetProperty",
    SetProperty: "SetProperty",
} as const;

type InstructionBase<T, A> = {
    next: (value: T) => A;
};

type GetElementByIdInstr<A> = {
    tag: typeof InstructionTags.GetElementById;
    id: Freer<string>;
    next: (el: HTMLElement | null) => A
};

export type DomInstruction<A> =
    | GetElementByIdInstr<A>
    | {
          tag: typeof InstructionTags.GetProperty;
          prop: Freer<string>;
          target: Freer<HTMLElement>;
          next: (value: string) => A;
      }
    | {
          tag: typeof InstructionTags.SetProperty;
          prop: Freer<string>;
          value: Freer<string>;
          target: Freer<HTMLElement>;
          next: () => A;
      };

export const getElementById = (
    id: string | Freer<string>,
): Freer<Either<string, HTMLElement>> =>
    impure({
        tag: "GetElementById",
        id: typeof id === "string" ? pure(id) : id,
        next: (el) => pure(fromNullable<HTMLElement>(el, `Element with id not found`)),
    });

export const getProperty = (
    prop: string | Freer<string>,
    target: Freer<HTMLElement>,
): Freer<string> =>
    impure({
        tag: "GetProperty",
        prop: typeof prop === "string" ? pure(prop) : prop,
        target,
        next: pure,
    });

export const setProperty = (
    prop: string | Freer<string>,
    value: Freer<string>,
    target: Freer<HTMLElement>,
): Freer<void> =>
    impure({
        tag: "SetProperty",
        prop: typeof prop === "string" ? pure(prop) : prop,
        value,
        target,
        next: () => pure(undefined),
    });

export function domMapInstr<A, B>(
    instr: DomInstruction<A>,
    f: (a: A) => B,
): DomInstruction<B> {
    switch (instr.tag) {
        case InstructionTags.GetElementById:
            return {
                ...instr,
                next: (el: Either<string, HTMLElement>) => f(instr.next(el)),
            };
        case InstructionTags.GetProperty:
            return { ...instr, next: (v: string) => f(instr.next(v)) };
        case InstructionTags.SetProperty:
            return { ...instr, next: () => f(instr.next()) };
    }
}

export const isDomInstruction = makeTagGuard(Object.values(InstructionTags));

