import { DomError, SynxDom } from "@/lang/extensions/dom";
import { R, RValue, unR } from "./common";
import { RContext } from "./context";
import { Either, left, right } from "@/generic/either";
import { DomEffect } from "@/lang/extensions/dom-effect";

export const RDom = (rContext: RContext): SynxDom<"R"> => ({
    createElement(tag: RValue<string>): RValue<HTMLElement> {
        return rContext.createTrackedValue([tag], () =>
            document.createElement(unR(tag)),
        );
    },

    getElementIdBy(id: RValue<string>): RValue<DomEffect<HTMLElement>> {
        return rContext.createTrackedValue(
            [id],
            () =>
                new DomEffect(() => {
                    const elementId = unR(id);

                    try {
                        // Attempt to find the element in the DOM
                        const element = document.getElementById(elementId);

                        if (!element) {
                            throw new Error(
                                `Element with ID '${elementId}' not found`,
                            );
                        }

                        return element;
                    } catch (error) {
                        throw {
                            code: "ELEMENT_NOT_FOUND",
                            message: `Error accessing DOM: ${error instanceof Error ? error.message : ""}`,
                        } as DomError;
                    }
                }),
        );
    },

    setProperty(
        name: RValue<string>,
        value: RValue<string>,
        el: RValue<HTMLElement>,
    ): RValue<void> {
        try {
            const element = unR(el);
            const propName = unR(name);
            const initialValue = unR(value);

            console.log("Interpreting setProperty", value, rContext.getTrackedContext(value));

            // console.log(
            //     "setting property initially",
            //     name,
            //     "to",
            //     value,
            // );

            // Set the initial property value
            if (propName === "textContent") {
                element.textContent = String(initialValue);
            } else {
                (element as any)[propName] = initialValue;
            }

            // Create an operation to update this property when value changes
            const updateOperation = () => {
                console.log("Updating property", propName, "to", value);
                // Get the latest value
                const latestValue = unR(value);

                if (propName === "textContent") {
                    element.textContent = String(latestValue);
                } else {
                    (element as any)[propName] = latestValue;
                }
                return undefined;
            };

            // Create a result value that registers the update operation
            return rContext.createTrackedValue([value], updateOperation);
        } catch (e) {
            return R(undefined);
            // return R(
            //         left({
            //             code: "PROPERTY_ERROR",
            //             message: `Failed to set property: ${e}`,
            //         }),
            // );
        }
    },

    on(
        eventType: RValue<string>,
        el: RValue<HTMLElement>,
    ): RValue<{ listeners: ((event: any) => void)[] }> {
        const element = unR(el);
        const type = unR(eventType);

        if (element === null) {
            // Return an empty event stream if element is null
            return R({ listeners: [] });
        }

        // Create an event stream object
        const eventStream = {
            listeners: [] as ((event: any) => void)[],
        };

        console.log("Attach event listener", type, "to", element);
        // Set up the actual DOM event listener
        element.addEventListener(type, (event) => {
            console.log(`Event ${type} triggered`, eventStream);
            // Pass the event to all listeners
            eventStream.listeners.forEach((listener) => listener(event));
        });

        return R(eventStream);
    },

    getProperty: function (
        name: RValue<string>,
        el: RValue<HTMLElement>,
    ): RValue<string> {
        return rContext.createTrackedValue([name, el], () => {
            const propName = unR(name);
            const element = unR(el);

            if (propName === "textContent") {
                return element.textContent || "";
            } else {
                return (element as any)[propName];
            }
        });
    },
});

