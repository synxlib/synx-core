import { DomInstruction, InstructionTags } from "@/lang/extensions/dom";
import { handleReactiveValues, ReactiveResult } from "./reactive-helpers";
import { right, Either, left } from "@/generic/either";

export function runDomInstr<X>(
    instr: DomInstruction & { resultType: X },
): ReactiveResult<X> {
    switch (instr.tag) {
        case InstructionTags.GetElementById: {
            return handleReactiveValues([instr.id], (id) => {
                const element = document.getElementById(id);
                // Create the Either result
                const result = element
                    ? (right(element) as Either<string, HTMLElement>)
                    : (left(`Element with id ${id} not found`) as Either<
                          string,
                          HTMLElement
                      >);
                return result as typeof instr.resultType;
            });
        }
        case InstructionTags.QuerySelectorAll: {
            return handleReactiveValues(
                [instr.selector],
                (selector: string) => {
                    const elements = document.querySelectorAll(selector);

                    return Array.from(elements) as typeof instr.resultType;
                },
            );
        }
        case InstructionTags.QuerySelector: {
            return handleReactiveValues(
                [instr.selector],
                (selector: string) => {
                    const element = document.querySelector(selector);

                    const result = element
                        ? (right(element) as Either<string, Element>)
                        : (left(
                              `Element with selector ${selector} not found`,
                          ) as Either<string, Element>);

                    return result as typeof instr.resultType;
                },
            );
        }
        case "GetProperty": {
            return handleReactiveValues(
                [instr.prop, instr.target],
                (prop, target) => target[prop],
            );
        }
        case "SetProperty": {
            return handleReactiveValues(
                [instr.prop, instr.target, instr.value],
                (prop, target, value) => {
                    console.log("Set Property Callback", target, value);
                    if (target) target[prop] = value;
                    return undefined as typeof instr.resultType;
                },
            );
        }
        case InstructionTags.SetChildren: {
            return handleReactiveValues(
                [instr.parent, instr.items],
                <T>(parent: HTMLElement, items: T[]) => {
                    if (!parent) return undefined as X;

                    // Default key function uses array index
                    const keyFn = instr.keyFn || ((_, index) => index);

                    // Step 1: Create a key -> element mapping for existing DOM children
                    const existingChildren = new Map<
                        string | number,
                        HTMLElement
                    >();

                    // Get all current data-key attributes from DOM elements
                    Array.from(parent.children).forEach((child) => {
                        const key = child.getAttribute("data-key");
                        if (key !== null) {
                            existingChildren.set(key, child as HTMLElement);
                        }
                    });

                    // Step 2: Create a key -> new element mapping and track order
                    const newChildrenMap = new Map<
                        string | number,
                        HTMLElement
                    >();
                    const newChildrenOrder: Array<string | number> = [];

                    // Step 3: Process each item - create new elements or update existing ones
                    items.forEach((item, index) => {
                        const key = keyFn(item, index).toString();
                        newChildrenOrder.push(key);

                        // If element with this key already exists, update it
                        if (existingChildren.has(key)) {
                            const element = existingChildren.get(key)!;
                            instr.updateChildFn(element, item, index);
                            newChildrenMap.set(key, element);
                            existingChildren.delete(key); // Remove from existing to track what's left
                        }
                        // Otherwise create a new element
                        else {
                            const newChild = instr.createChildFn(item, index);
                            newChild.setAttribute("data-key", key.toString());
                            newChildrenMap.set(key, newChild);
                        }
                    });

                    // Step 4: Remove elements that are no longer needed
                    existingChildren.forEach((element) => {
                        parent.removeChild(element);
                    });

                    // Step 5: Efficiently position all elements in the correct order
                    // This algorithm minimizes DOM operations by:
                    // 1. Finding consecutive sequences that are already in the correct order
                    // 2. Only moving elements when necessary

                    // Start with an empty array to represent the current DOM state
                    const currentOrder: Array<string | number> = [];

                    // First pass: Identify which elements are already in the DOM
                    Array.from(parent.children).forEach((child) => {
                        const key = child.getAttribute("data-key");
                        if (key !== null && newChildrenMap.has(key)) {
                            currentOrder.push(key);
                        }
                    });

                    // Second pass: Update the DOM efficiently
                    let targetIndex = 0; // Where we want to insert
                    let currentIndex = 0; // Where we're currently inspecting in the current DOM

                    while (targetIndex < newChildrenOrder.length) {
                        const targetKey = newChildrenOrder[targetIndex];
                        const targetElement = newChildrenMap.get(targetKey)!;

                        // If we've run out of current elements or current element is not our target
                        if (
                            currentIndex >= currentOrder.length ||
                            currentOrder[currentIndex] !== targetKey
                        ) {
                            // Find if this element exists further down in the current order
                            const existingPosition =
                                currentIndex < currentOrder.length
                                    ? currentOrder.indexOf(
                                          targetKey,
                                          currentIndex,
                                      )
                                    : -1;

                            if (existingPosition === -1) {
                                // Element doesn't exist in current DOM, insert it
                                const referenceNode =
                                    currentIndex < parent.children.length
                                        ? parent.children[currentIndex]
                                        : null;

                                if (referenceNode) {
                                    parent.insertBefore(
                                        targetElement,
                                        referenceNode,
                                    );
                                } else {
                                    parent.appendChild(targetElement);
                                }

                                // Update our tracking arrays
                                currentOrder.splice(currentIndex, 0, targetKey);
                            } else {
                                // Element exists but in wrong position, move it
                                const moveElement =
                                    parent.children[existingPosition];
                                const referenceNode =
                                    currentIndex < parent.children.length
                                        ? parent.children[currentIndex]
                                        : null;

                                if (referenceNode) {
                                    parent.insertBefore(
                                        moveElement,
                                        referenceNode,
                                    );
                                } else {
                                    parent.appendChild(moveElement);
                                }

                                // Update our tracking array
                                currentOrder.splice(existingPosition, 1);
                                currentOrder.splice(currentIndex, 0, targetKey);
                            }
                        }

                        // Move to next position
                        targetIndex++;
                        currentIndex++;
                    }

                    // Step 6: Trim any excess elements
                    while (parent.children.length > newChildrenOrder.length) {
                        parent.removeChild(parent.lastChild!);
                    }

                    return undefined as X;
                },
            );
        }
    }
}
