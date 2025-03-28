import { Either, left } from "@/generic/either";
import { Free } from "@/generic/free";
import { makeTagGuard } from "./make-tag-guard";
import { Instruction } from "./instruction";

export const InstructionTags = {
    GetElementById: "GetElementById",
    QuerySelectorAll: "QuerySelectorAll",
    GetProperty: "GetProperty",
    SetProperty: "SetProperty",
    SetChildren: "SetChildren",
} as const;

type GetElementByIdInstr = {
    tag: typeof InstructionTags.GetElementById;
    id: string;
    resultType: Either<string, HTMLElement>;
};

type SetChildrenInstr<T> = {
    tag: typeof InstructionTags.SetChildren;
    parent: HTMLElement;
    items: T[];
    keyFn?: (item: T, index: number) => string | number;
    updateChildFn: (element: HTMLElement, item: T, index: number) => void;
    createChildFn: (item: T, index: number) => HTMLElement;
    resultType: void;
};

export type DomInstruction =
    | GetElementByIdInstr
    | {
          tag: typeof InstructionTags.QuerySelectorAll;
          selector: string;
          resultType: Element[];
      }
    | {
          tag: typeof InstructionTags.GetProperty;
          prop: string;
          target: HTMLElement;
          resultType: string;
      }
    | {
          tag: typeof InstructionTags.SetProperty;
          prop: string;
          value: string;
          target: HTMLElement;
          resultType: void;
      }
    | SetChildrenInstr<any>;

export const getElementById = (
    id: string | Free<Instruction, string>,
): Free<Instruction, Either<string, HTMLElement>> =>
    typeof id === "string"
        ? Free.liftF({
              tag: InstructionTags.GetElementById,
              id,
              resultType: left("") as Either<string, HTMLElement>,
          })
        : id.flatMap((idVal) =>
              Free.liftF({
                  tag: InstructionTags.GetElementById,
                  id: idVal,
                  resultType: left("") as Either<string, HTMLElement>,
              }),
          );

export const querySelectorAll = (
    selector: string | Free<Instruction, string>,
): Free<Instruction, Element[]> =>
    typeof selector === "string"
        ? Free.liftF({
              tag: InstructionTags.QuerySelectorAll,
              selector,
              resultType: [] as Element[],
          })
        : selector.flatMap((selectorVal) =>
              Free.liftF({
                  tag: InstructionTags.QuerySelectorAll,
                  selector: selectorVal,
                  resultType: [] as Element[],
              }),
          );

export const getProperty = (
    prop: string | Free<Instruction, string>,
    target: Free<Instruction, HTMLElement>,
): Free<Instruction, string> =>
    target.flatMap((targetVal) =>
        typeof prop === "string"
            ? Free.liftF({
                  tag: InstructionTags.GetProperty,
                  prop,
                  target: targetVal,
                  resultType: "",
              })
            : prop.flatMap((propVal) =>
                  Free.liftF({
                      tag: InstructionTags.GetProperty,
                      prop: propVal,
                      target: targetVal,
                      resultType: "",
                  }),
              ),
    );

export const setProperty = (
    prop: string | Free<Instruction, string>,
    value: Free<Instruction, string>,
    target: Free<Instruction, HTMLElement>,
): Free<Instruction, void> =>
    target.flatMap((targetVal) =>
        value.flatMap((val) =>
            typeof prop === "string"
                ? Free.liftF({
                      tag: InstructionTags.SetProperty,
                      prop,
                      value: val,
                      target: targetVal,
                      resultType: undefined,
                  })
                : prop.flatMap((propVal) =>
                      Free.liftF({
                          tag: InstructionTags.SetProperty,
                          prop: propVal,
                          value: val,
                          target: targetVal,
                          resultType: undefined,
                      }),
                  ),
        ),
    );

export const setChildren = <T>(
    parent: Free<Instruction, HTMLElement>,
    items: Free<Instruction, T[]>,
    updateChildFn: (element: HTMLElement, item: T, index: number) => void,
    createChildFn: (item: T, index: number) => HTMLElement,
    keyFn?: (item: T, index: number) => string | number,
): Free<Instruction, void> =>
    parent.flatMap((parentVal) =>
        items.flatMap((itemsVal) =>
            Free.liftF({
                tag: InstructionTags.SetChildren,
                parent: parentVal,
                items: itemsVal,
                keyFn,
                updateChildFn,
                createChildFn,
                resultType: undefined,
            }),
        ),
    );

// export function domMapInstr<A, B>(
//     instr: DomInstruction,
//     f: (a: A) => B,
// ): DomInstruction {
//     switch (instr.tag) {
//         case InstructionTags.GetElementById:
//             return {
//                 ...instr,
//                 next: (el: HTMLElement | null) => f(instr.next(el)),
//             };
//         case InstructionTags.GetProperty:
//             return { ...instr, next: (v: string) => f(instr.next(v)) };
//         case InstructionTags.SetProperty:
//             return { ...instr, next: () => f(instr.next()) };
//     }
// }

export const isDomInstruction = makeTagGuard(Object.values(InstructionTags));
