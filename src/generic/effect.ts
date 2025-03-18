import { Monad } from "fp-ts/lib/Monad";
import { HKT, Kind, URIS } from "fp-ts/lib/HKT";

export interface Effect<A> {
    readonly _run: () => A
    chain: <B>(f: (a: A) => Effect<B>) => Effect<B>;
    map: <B>(f: (a: A) => B) => Effect<B>;
    run: () => A;
}