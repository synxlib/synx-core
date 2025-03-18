import { JSDOM } from "jsdom";
import { RInterpreter } from "../src/lang/interpreters/meta-circular";
import { simpleTodoApp } from "./simple-todo";
import { describe, test, expect, beforeEach } from "vitest";

describe("Click Counter App", () => {
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
    globalThis.window = dom.window;

    const interpreter = RInterpreter();

    // Initialize the app within the JSDOM environment
    const output = simpleTodoApp()(interpreter);
    console.log("output", output);
    output.value.current._run();
  });

  test("Clicking the button increments the counter", () => {
    const input = document.getElementById("todo-input") as HTMLInputElement;
    const button = document.getElementById("todo-button");
    const listEL = document.getElementById("todo-list");

    expect(button).not.toBeNull();
    expect(listEL).not.toBeNull();

    if (input && button && listEL) {
      (input as HTMLInputElement).value = "World";
      input.dispatchEvent(new dom.window.Event("input"));
      button.dispatchEvent(new dom.window.Event("click"));
      expect(listEL.textContent).toBe("World");
      expect(input.value).toBe("");
    }
  });
});
