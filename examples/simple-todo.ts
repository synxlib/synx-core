import {
  getElementById,
  getProperty,
  setProperty,
} from "@/lang/extensions/dom";
import { constantOn, foldM, on } from "@/lang/extensions/event";
import { sequence } from "@/lang/extensions/helpers";
import { allE, mapE } from "@/lang/extensions/error";
import { pure } from "@/lang/extensions/freer";
import { concat, join } from "@/lang/extensions/list";

export const simpleTodoApp = () => {
  // === Example Program: simpleTodoApp ===
  const inputEither = getElementById("todo-input");
  const buttonEither = getElementById("todo-button");
  const listElEither = getElementById("todo-list");

  return mapE(
    allE([inputEither, buttonEither, listElEither]),
    ([input, button, listEl]) => {
      const clickEvent = on("click", pure(button));

      const todoList = foldM(clickEvent, pure([] as string[]), (todos) => {
        const value = getProperty("value", pure(input));
        return concat(pure(todos), value);
      });

      const todoListStr = join(todoList, pure(", "));

      const inputValueOnSubmit = constantOn(clickEvent, pure(""));

      return sequence(
        setProperty("textContent", todoListStr, pure(listEl)),
        setProperty("value", inputValueOnSubmit, pure(input))
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
