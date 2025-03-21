import { debugMapInstr, isDebugInstruction } from "./debug";
import { domMapInstr, isDomInstruction } from "./dom";
import { eventMapInstr, isEventInstruction } from "./event";
import { Freer, pure, impure } from "./freer";
import { Instruction } from "./instruction";

export function doFreer<A>(gen: () => Generator<Freer<any>, A, any>): Freer<A> {
    const iterator = gen();
    function step(value?: any): Freer<A> {
        const next = iterator.next(value);
        return next.done ? pure(next.value) : flatMap(next.value, step);
    }
    return step();
}

export function mapInstr<A, B>(instr: Instruction<A>, f: (a: A) => B): Instruction<B> {
    if (isDomInstruction(instr)) return domMapInstr(instr, f);
    if (isEventInstruction(instr)) return eventMapInstr(instr, f);
    if (isDebugInstruction(instr)) return debugMapInstr(instr, f);

    throw new Error(`Unhandled instruction tag: ${(instr as any).tag}`);
}

export function flatMap<A, B>(fa: Freer<A>, f: (a: A) => Freer<B>): Freer<B> {
    if (fa.kind === "Pure") return f(fa.value);
    return impure(
        mapInstr(fa.instr, (x) => flatMap(x, f))
    );
}
