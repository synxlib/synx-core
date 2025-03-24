import { getElementById, setProperty } from "@/lang/extensions/dom";
import { pure } from "@/lang/extensions/freer";
import { mapE, allE } from "@/lang/extensions/error";
import { combine } from "@/lang/extensions/string";
import { foldM, on } from "@/lang/extensions/event";
import { show } from "@/lang/extensions/show";

export const clickCounterApp = () => {
  console.log("Starting app")
  // Get DOM elements
  const buttonEither = getElementById("button");
  const displayEither = getElementById("count");

  return mapE(
    allE([buttonEither, displayEither]),
    (([button, display]) => {
      const clickEvent = on("click", pure(button));
      const count = foldM(clickEvent, pure(0), (n) => pure(n + 1));
      const displayText = combine(pure("Clicks: "), show(count));

      // Update property
      return setProperty("textContent", displayText, pure(display));
    })
  )
};

// run(clickCounterApp());
