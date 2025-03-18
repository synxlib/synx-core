import { SynxString } from "@/lang/extensions/string";
import { R, RValue, unR } from "./common";
import { RContext } from "./context";

export const RString = (rContext: RContext): SynxString<"R"> => ({
    str(value: string): RValue<string> {
        return R(value);
    },

    concat(s1: RValue<string>, s2: RValue<string>): RValue<string> {
        return rContext.createTrackedValue([s1, s2], () => String(unR(s1)) + String(unR(s2)));
    },

    toUpperCase(s: RValue<string>): RValue<string> {
        return rContext.createTrackedValue([s], () => String(unR(s)).toUpperCase());
    },

    toLowerCase(s: RValue<string>): RValue<string> {
        return rContext.createTrackedValue([s], () => String(unR(s)).toLowerCase());
    },

    substring(
        s: RValue<string>,
        start: RValue<number>,
        end?: RValue<number>
    ): RValue<string> {
        return rContext.createTrackedValue(end ? [s, start, end] : [s, start], () => String(unR(s)).substring(unR(start), end ? unR(end) : undefined));
    },

    replace(
        s: RValue<string>,
        searchValue: RValue<string>,
        replaceValue: RValue<string>
    ): RValue<string> {
        return rContext.createTrackedValue([s, searchValue, replaceValue], () => String(unR(s)).replace(String(unR(searchValue)), String(unR(replaceValue))));
    },

    includes(s: RValue<string>, searchString: RValue<string>): RValue<boolean> {
        return R(unR(s).includes(unR(searchString)));
    },

    startsWith(s: RValue<string>, searchString: RValue<string>): RValue<boolean> {
        return R(unR(s).startsWith(unR(searchString)));
    },

    endsWith(s: RValue<string>, searchString: RValue<string>): RValue<boolean> {
        return R(unR(s).endsWith(unR(searchString)));
    },

    length(s: RValue<string>): RValue<number> {
        return R(unR(s).length);
    },

    format(template: RValue<string>, ...values: RValue<any>[]): RValue<string> {
        let result = unR(template);
        for (let i = 0; i < values.length; i++) {
            result = result.replace(`{${i}}`, String(unR(values[i])));
        }
        return R(result);
    }
});