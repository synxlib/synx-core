import { debugMapInstr, isDebugInstruction } from "./debug";
import { domMapInstr, isDomInstruction } from "./dom";
import { errorMapInstr, isErrorInstruction } from "./error";
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

export function doFreerTyped<Y, R>(gen: () => Generator<Freer<Y>, R, Y>): Freer<R> {
    const iterator = gen();

    function step(value: Y): Freer<R> {
        const next = iterator.next(value);
        return next.done ? pure(next.value) : flatMap(next.value, step);
    }

    // Kick off with dummy value (usually ignored)
    return step(undefined as unknown as Y);
}

export function typedDo<T>(gen: () => Generator<Freer<any>, T, any>): Freer<T> {
    return doFreerTyped(gen);
}

export function typedDoYield<A, T extends Generator<Freer<any>, A, any>>(
    gen: () => T,
): Freer<A> {
    return doFreer(gen);
}

export function mapInstr<A, B>(
    instr: Instruction<A>,
    f: (a: A) => B,
): Instruction<B> {
    if (isDomInstruction(instr)) return domMapInstr(instr, f);
    if (isEventInstruction(instr)) return eventMapInstr(instr, f);
    if (isDebugInstruction(instr)) return debugMapInstr(instr, f);
    if (isErrorInstruction(instr)) return errorMapInstr(instr, f);

    throw new Error(`Unhandled instruction tag: ${(instr as any).tag}`);
}

export function map<A, B>(f: (a: A) => B, fa: Freer<A>): Freer<B> {
    if (fa.kind === "Pure") return pure(f(fa.value));
    return impure(mapInstr(fa.instr, (x) => map(f, x)));
}

export function flatMap<A, B>(fa: Freer<A>, f: (a: A) => Freer<B>): Freer<B> {
    if (fa.kind === "Pure") return f(fa.value);
    return impure(mapInstr(fa.instr, (x) => flatMap(x, f)));
}

export function chain<A, B>(f: (a: A) => Freer<B>, fa: Freer<A>): Freer<B> {
    return flatMap(fa, f);
}

// export const Do: Freer<{}> = pure({});

export function bind<K extends string, A, R extends Record<string, any>>(
    name: K,
    f: (r: R) => Freer<A>,
): (fr: Freer<R>) => Freer<R & { [P in K]: A }> {
    return (fr) =>
        flatMap(fr, (r) =>
            flatMap(f(r), (a) =>
                pure({
                    ...r,
                    [name]: a,
                } as R & { [P in K]: A }),
            ),
        );
}

