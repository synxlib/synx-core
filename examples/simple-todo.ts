import {
  getElementById,
  getProperty,
  setProperty,
} from "@/lang/extensions/dom";
import { constantOn, foldM, on, State } from "@/lang/extensions/event";
import {
  bind,
  doFreer,
  flatMap,
  typedDo,
  typedDoYield,
  chain,
  map,
  sequence
} from "@/lang/extensions/helpers";
import { log } from "@/lang/extensions/debug";
import { allE, chainE, mapE, require } from "@/lang/extensions/error";
import { Freer, pure } from "@/lang/extensions/freer";
import { concat, join } from "@/lang/extensions/list";
import { right } from "@/generic/either";

export const simpleTodoApp = () => {
  // === Example Program: simpleTodoApp ===
  const inputEither = getElementById("todo-input");
  const buttonEither = getElementById("todo-button");
  const listElEither = getElementById("todo-list");

  return mapE(
    allE([inputEither, buttonEither, listElEither]),
    ([input, button, listEl]) => {
      console.log(input, button, listEl);
      const clickEvent = on("click", pure(button));

      const todoList = foldM(clickEvent, pure([] as string[]), (_, __) => {
        console.log("Running fold");
        const value = getProperty("value", pure(input));
        return concat(pure(_), value);
      });

      const todoListStr = join(todoList, pure(", "));

      const inputValueOnSubmit = foldM(clickEvent, pure(""), () => pure(""))

      return sequence(
        setProperty("textContent", todoListStr, pure(listEl)),
        setProperty("value", inputValueOnSubmit, pure(input)),
      );
    }
  );
};

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
