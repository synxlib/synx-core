import { Instruction } from "./instruction";

export type Freer<A> =
  | { kind: "Pure"; value: A }
  | { kind: "Impure"; instr: Instruction<Freer<A>> };

export const pure = <A>(value: A): Freer<A> => ({ kind: "Pure", value });
export const impure = <A>(instr: Instruction<Freer<A>>): Freer<A> => ({ kind: "Impure", instr });
