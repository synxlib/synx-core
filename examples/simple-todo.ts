import { getElementById, getProperty, setProperty } from "@/lang/extensions/dom";
import { constantOn, foldM, on } from "@/lang/extensions/event";
import { bind, Do, doFreer, flatMap, typedDo, typedDoYield, chain, map } from "@/lang/extensions/helpers";
import { log } from "@/lang/extensions/debug";
import { require } from "@/lang/extensions/error";
import { Freer, pure } from "@/lang/extensions/freer";
import { Either } from "@/generic/either";
import { pipe } from "fp-ts/lib/function";

export const simpleTodoApp = doFreer(function* () {
    yield log("Starting app");
  
    const input = yield require(yield getElementById("todo-input"));

    const button = yield require(yield getElementById("todo-button"));
    const listEl = yield require(yield getElementById("todo-list"));
  
    const clickEvent = yield on("click", button);
  
    const todoList = yield foldM<string[], EventSource>(clickEvent, [""], (todos, _) =>
      typedDoYield(function* (): Generator<Freer<any>, string[], any> {
        const value: string = yield getProperty("value", input);
        return [...todos, value];
      })
    );

    const inputValueOnSubmit = yield constantOn(clickEvent, "");
  
    yield setProperty("value", inputValueOnSubmit, input);
    yield setProperty("textContent", todoList, listEl);
  });

// clickCounterApp()(new RInterpreter());

// export const simpleTodoApp = pipe(
//     pure({}),
//     bind("input", () => chain(require, getElementById("todo-input"))),
//     bind("button", () => chain(require, getElementById("todo-button"))),
//     bind("listEl", () => chain(require, getElementById("todo-list"))),
//     bind("submitTodo", ({ button }) => on("click", button)),
//     bind("todoList", ({ submitTodo, input }) => foldM(submitTodo, [""], (todos, _) => pipe(
//         map((value) => [...todos, value], getProperty("value", input))
//     ))),
//     bind("todoListStr", ({ todoList }) => {
//         console.log("todoList", todoList.get());
//         map(v => v.join("\n"), todoList.get());
//     }),
//     bind("inputValueOnSubmit", ({ submitTodo }) => constantOn(submitTodo, "")),
//     (v) => chain(({ todoListStr, listEl, inputValueOnSubmit, input }) => pipe(
//         setProperty("value", inputValueOnSubmit, input),
//         (v1) => chain(() => setProperty("textContent", todoListStr, listEl), v1)
//     ), v)
// );