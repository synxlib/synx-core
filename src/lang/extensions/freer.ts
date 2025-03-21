import { mapInstr } from "./helpers";
import { Instruction } from "./instruction";

export type Freer<A> =
  | { kind: "Pure"; value: A }
  | { kind: "Impure"; instr: Instruction<Freer<A>> };

export const pure = <A>(value: A): Freer<A> => ({ kind: "Pure", value });
export const impure = <A>(instr: Instruction<Freer<A>>): Freer<A> => ({ kind: "Impure", instr });

export function mapFreer<A, B>(fa: Freer<A>, f: (a: A) => B): Freer<B> {
  if (fa.kind === "Pure") return pure(f(fa.value));
  return impure(mapInstr(fa.instr, (x) => mapFreer(x, f)));
}