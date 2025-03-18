import { SynxList } from "@/lang/extensions/list";
import { R, RValue, unR } from "./common";
import { RContext } from "./context";

export const RList = (rContext: RContext): SynxList<"R"> => ({
    list<A>(value: A[]): RValue<A[]> {
        return R(value);
    },

    append<A>(list: RValue<A[]>, value: RValue<A>): RValue<A[]> {
        return rContext.createTrackedValue([list, value], () => {
            return unR(list).concat([unR(value)]);
        });
    },

    len<A>(s: RValue<A[]>): RValue<number> {
        return rContext.createTrackedValue([s], () => unR(s).length);
    },

    first<A>(s: RValue<A[]>): RValue<A> {
        return rContext.createTrackedValue([s], () => {
            return unR(s)[0];
        });
    },
});
