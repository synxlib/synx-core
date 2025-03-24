import { JSDOM } from "jsdom";
import { clickCounterApp } from "./counter"; 
import { describe, test, expect, beforeEach } from "vitest";
import { run } from "@/lang/runtimes/reactive/run";

describe("Click Counter App", () => {
  let dom: JSDOM;
  let document: Document;

  beforeEach(() => {
    // Set up a JSDOM environment with our test HTML structure
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
      <body>
        <span id="count">Clicks: 0</span>
        <button id="button">Increment</button>
      </body>
      </html>
    `);

    document = dom.window.document;
    globalThis.document = document;
    // globalThis.window = dom.window;


    // Initialize the app within the JSDOM environment
    const result = run(clickCounterApp());
    if (result.isRight()) run(result.value);
  });

  test("Initial counter should be 'Clicks: 0'", () => {
    const countDisplay = document.getElementById("count");
    expect(countDisplay?.textContent).toBe("Clicks: 0");
  });

  test("Clicking the button increments the counter", () => {
    const button = document.getElementById("button");
    const countDisplay = document.getElementById("count");

    expect(button).not.toBeNull();
    expect(countDisplay).not.toBeNull();

    if (button && countDisplay) {
      // Simulate a click event
      button.dispatchEvent(new dom.window.Event("click"));
      expect(countDisplay.textContent).toBe("Clicks: 1");

      button.dispatchEvent(new dom.window.Event("click"));
      expect(countDisplay.textContent).toBe("Clicks: 2");
    }
  });
});
