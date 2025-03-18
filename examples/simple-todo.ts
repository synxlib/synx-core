import { num } from "../src/lang/extensions/math";
import {
  getElementById,
  setProperty,
  on,
  DomError,
  createElement,
  getProperty
} from "../src/lang/extensions/dom";
import { concat, str } from "@/lang/extensions/string";
import { toStr } from "@/lang/show";
import { fold, effect, foldM } from "@/lang/extensions/event";
import { URIS } from "@/generic/hkt";
import { Either, left, right } from "@/generic/either";
import { Expr } from "@/lang/extensions/common";
import { lam, app, lam2 } from "@/lang/extensions/lambda";
import { RInterpreter } from "@/lang/interpreters/meta-circular";
import { chainEither, mapEither } from "@/lang/extensions/error";
import { append, list, first } from "@/lang/extensions/list";
import { ap, liftE, scolon } from "@/lang/extensions/bind";

export const simpleTodoApp = () => {
    console.log("Starting app")
    // Get DOM elements
    const input = getElementById(str("todo-input"));
    const button = getElementById(str("todo-button"));
    const listEl = getElementById(str("todo-list"));

    // Listen for button clicks
    const clickEvent = on(str("click"), button);

    const todoList = fold(
        clickEvent,
        list(["Add Todo"] as string[]),
        lam2((todos, _) => append(todos, str("second todo")))
    );

    const inputValue = foldM(
        on(str("input"), input),
        getProperty(str("value"), input),
        lam2(() => getProperty(str("value"), input))
    );

    const item = createElement(str("li"));

    const fn = liftE(lam(first))

    // return scolon(
    //     setProperty(str("textContent"), inputValue, listEl),
    //     setProperty(str("value"), liftE(str("")), input)
    // );

    return setProperty(str("textContent"), inputValue, listEl);
};

// clickCounterApp()(new RInterpreter());

