import { getElementById, getProperty, setProperty } from "@/lang/extensions/dom";
import { foldM, on } from "@/lang/extensions/event";
import { doFreer } from "@/lang/extensions/helpers";
import { log } from "@/lang/extensions/debug";
import { require } from "@/lang/extensions/error";

export const simpleTodoApp = doFreer(function* () {
    yield log("Starting app");
  
    const input = yield require(yield getElementById("todo-input"));
    const button = yield require(yield getElementById("todo-button"));
    const listEl = yield require(yield getElementById("todo-list"));
  
    const clickEvent = yield on("click", button);
  
    const todoList = yield foldM(clickEvent, [""], (todos, _) =>
      doFreer(function* () {
        const value = yield getProperty("value", input);
        return [...todos, value];
      })
    );
  
    // yield setProperty("value", "", input);
    yield setProperty("textContent", todoList, listEl);
  });

// clickCounterApp()(new RInterpreter());

