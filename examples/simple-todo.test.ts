import { JSDOM } from "jsdom";
import { simpleTodoApp } from "./simple-todo";
import { describe, test, expect, beforeEach } from "vitest";
import { run } from "@/lang/runtimes/reactive/run";
import { doFreer } from "@/lang/extensions/helpers";
import { log } from "@/lang/extensions/debug";
import { recoverWith } from "@/lang/extensions/error";

describe("Simple TODO App", () => {
  let dom: JSDOM;
  let document: Document;

  beforeEach(() => {
    // Set up a JSDOM environment with our test HTML structure
    dom = new JSDOM(
      `
      <!DOCTYPE html>
      <html>
      <body>
        <input type="text" id="todo-input" value="Hello"/>
        <button id="todo-button">Increment</button>
        <span id="todo-list"></span>
      </body>
      </html>
    `,
      {
        runScripts: "dangerously",
        resources: "usable",
      }
    );

    document = dom.window.document;
    globalThis.document = document;
    // globalThis.window = dom.window;

    // Initialize the app within the JSDOM environment
    const result = run(simpleTodoApp());
    if (result.isRight()) run(result.value);
  });

  test("Entering new todo add it to the list and clears input", () => {
    const input = document.getElementById("todo-input") as HTMLInputElement;
    const button = document.getElementById("todo-button");
    const listEL = document.getElementById("todo-list");

    expect(button).not.toBeNull();
    expect(listEL).not.toBeNull();

    if (input && button && listEL) {
      (input as HTMLInputElement).value = "Buy Milk";
      input.dispatchEvent(new dom.window.Event("input"));
      button.dispatchEvent(new dom.window.Event("click"));
      expect(listEL.textContent).toBe("Buy Milk");
      expect(input.value).toBe("");
      (input as HTMLInputElement).value = "Go to School";
      input.dispatchEvent(new dom.window.Event("input"));
      button.dispatchEvent(new dom.window.Event("click"));
      expect(listEL.textContent).toBe("Buy Milk, Go to School");
      expect(input.value).toBe("");
    }
  });
});
