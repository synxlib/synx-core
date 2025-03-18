import {
  getElementById,
  setProperty,
  on,
  DomError,
} from "../src/lang/extensions/dom";
import { concat, str } from "@/lang/extensions/string";
import { toStr } from "@/lang/show";
import { fold } from "@/lang/extensions/event";
import { URIS } from "@/generic/hkt";
import { Either, left, right } from "@/generic/either";
import { Expr } from "@/lang/extensions/common";
import { lam, app, lam2 } from "@/lang/extensions/lambda";
import { RInterpreter } from "@/lang/interpreters/meta-circular";
import { chainEither, mapEither } from "@/lang/extensions/error";
import { add, num } from "@/lang/extensions/math";

export const clickCounterApp = () => {
  console.log("Starting app")
  // Get DOM elements
  const buttonEither = getElementById(str("button"));
  const displayEither = getElementById(str("count"));

  return chainEither(buttonEither, lam((button) => {
    return chainEither(displayEither, lam((display) => {
      // Both elements exist at this point
      const clickEvent = on(str("click"), button);
      const count = fold(clickEvent, num(0), lam2((n, _) => add(n, num(1))));
      const displayText = concat(str("Clicks: "), toStr(count));

      // Update property
      return setProperty(str("textContent"), displayText, display);
    }));
  }));
};

// clickCounterApp()(new RInterpreter());
