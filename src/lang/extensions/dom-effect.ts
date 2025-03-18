import { Effect } from "@/generic/effect";

export class DomEffect<A> implements Effect<A> {
    constructor(readonly _run: () => A) {}

    map<B>(f: (a: A) => B): DomEffect<B> {
        return new DomEffect(() => f(this.run()));
    }

    chain<B>(f: (a: A) => DomEffect<B>): DomEffect<B> {
        return new DomEffect(() => f(this.run()).run());
    }

    // Execute the effect
    run(): A {
        return this._run();
    }
}