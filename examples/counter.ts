import { getElementById, setProperty } from "@/lang/extensions/dom";
import { mapE, allE } from "@/lang/extensions/error";
import { combine } from "@/lang/extensions/string";
import { fold, on } from "@/lang/extensions/event";
import { show } from "@/lang/extensions/show";
import { Free } from "@/generic/free";

export const clickCounterApp = () => {
  console.log("Starting app");
  // Get DOM elements
  const buttonEither = getElementById("button");
  const displayEither = getElementById("count");

  return mapE(allE([buttonEither, displayEither]), ([button, display]) => {
    const clickEvent = on("click", Free.pure(button));
    const count = fold(clickEvent, Free.pure(0), (n) => n + 1);
    const displayText = combine(Free.pure("Clicks: "), show(count));

    // Update property
    return setProperty("textContent", displayText, Free.pure(display));
  });
};

// run(clickCounterApp());
