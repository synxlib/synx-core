import { concat, str } from "@/lang/extensions/string";
import { toStr } from "@/lang/show";
import { add } from "@/lang/extensions/math";
import { getElementById, setProperty } from "@/lang/extensions/dom";
import { on } from "@/lang/extensions/event";
import { pure } from "@/lang/extensions/freer";
import { foldM } from "@/lang/extensions/event";
import { mapE, allE } from "@/lang/extensions/error";

export const clickCounterApp = () => {
  console.log("Starting app")
  // Get DOM elements
  const buttonEither = getElementById("button");
  const displayEither = getElementById("count");

  return mapE(
    allE([buttonEither, displayEither]),
    (([button, display]) => {
      const clickEvent = on("click", pure(button));
      const count = foldM(clickEvent, pure(0), (n) => add(n, pure(1)));
      const displayText = concat(str("Clicks: "), toStr(count));

      // Update property
      return setProperty(str("textContent"), displayText, display);
    })
  )
};

// run(clickCounterApp());
