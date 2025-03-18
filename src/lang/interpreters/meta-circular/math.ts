import { SynxMath } from "@/lang/extensions/math";
import { R, RValue, unR } from "./common";
import { RContext } from "./context";

export const RMath = (rContext: RContext): SynxMath<"R"> => ({
  num(x: number): RValue<number> {
    return R(x);
  },

  add(x: RValue<number>, y: RValue<number>): RValue<number> {
    return rContext.createTrackedValue([x, y], () => unR(x) + unR(y));
  },

  sub(x: RValue<number>, y: RValue<number>): RValue<number> {
    return rContext.createTrackedValue([x, y], () => unR(x) - unR(y));
  },

  mul(x: RValue<number>, y: RValue<number>): RValue<number> {
    return rContext.createTrackedValue([x, y], () => unR(x) * unR(y));
  },

  div(x: RValue<number>, y: RValue<number>): RValue<number> {
    return rContext.createTrackedValue([x, y], () => unR(x) / unR(y));
  },

  mod(x: RValue<number>, y: RValue<number>): RValue<number> {
    return rContext.createTrackedValue([x, y], () => unR(x) % unR(y));
  },

  show(x: RValue<number>): RValue<string> {
    return rContext.createTrackedValue([x], () => String(unR(x)));
  }
});