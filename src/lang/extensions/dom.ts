import { Either } from "@/generic/either";
import { Freer, impure, pure } from "./freer";
import { makeTagGuard } from "./make-tag-guard";

const InstructionTags = {
    GetElementById: "GetElementById",
    GetProperty: "GetProperty",
    SetProperty: "SetProperty",
} as const;

export type DomInstruction<A> =
    | {
          tag: typeof InstructionTags.GetElementById;
          id: string;
          next: (el: Either<string, HTMLElement>) => A;
      }
    | {
          tag: typeof InstructionTags.GetProperty;
          prop: string;
          target: HTMLElement | null;
          next: (value: string) => A;
      }
    | {
          tag: typeof InstructionTags.SetProperty;
          prop: string;
          value: string;
          target: HTMLElement | null;
          next: () => A;
      };

export const getElementById = (id: string): Freer<Either<string, HTMLElement>> =>
    impure({ tag: InstructionTags.GetElementById, id, next: pure });

export const getProperty = (
    prop: string,
    target: HTMLElement,
): Freer<string> =>
    impure({ tag: InstructionTags.GetProperty, prop, target, next: pure });

export const setProperty = (
    prop: string,
    value: string,
    target: HTMLElement,
): Freer<void> =>
    impure({
        tag: InstructionTags.SetProperty,
        prop,
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
