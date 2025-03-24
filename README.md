# Synx

**Synx** is a reactive DOM programming language embedded in JavaScript. It provides an imperative API with functional, reactive semantics — built using an extensible EDSL powered by [freer monads](https://en.wikipedia.org/wiki/Free_monad).

Designed for small applications (similar to Alpine.js), Synx lets you write your app logic in pure JavaScript, with strong typing and complete separation between **what** you describe and **how** it's interpreted.

---

## Core Principles

- **Reactive by default**: Everything starts with DOM events and flows into the DOM. No explicit state.
- **Composable**: Use small combinators to build complex behavior.
- **Extensible**: Write your own combinators to expand the language.
- **Interpreter-friendly**: The language is independent of execution; multiple interpreters can run the same code with different semantics (e.g. real DOM, SSR,  logging, testing).
- **Type-safe**: Built with TypeScript for maximum safety and IDE support.
- **DOM-focused**: Syntax is close to the native DOM API.

---

## Example

```ts
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
```

---

## Status

- Freer monad core in progress (focusing on performance).
- Language primitives for DOM and events implemented.
- Simple applications already possible.
- Interpreters and performance optimization ongoing.

---

## Why Synx?

- Build reactive UIs without a framework.
- Leverage functional composition without sacrificing readability.
- Decouple logic from runtime — ideal for testing, logging, and alternative targets.

---

## License

MIT
