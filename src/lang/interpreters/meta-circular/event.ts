import { SynxEvent } from "@/lang/extensions/event";
import { R, RValue, unR } from "./common";
import { RContext } from "./context";
import { Effect } from "@/generic/effect";

export const REvent = (rContext: RContext): SynxEvent<"R"> => ({
    fold<E, S>(
        events: RValue<{ listeners: ((event: E) => void)[]; }>,
        initialState: RValue<S>,
        reducer: RValue<(state: S, event: E) => S>
    ): RValue<S> {
        const eventStream = unR(events);
        const initialStateVal = unR(initialState);

        console.log("Interpreter Fold, Event stream:", events);

        // Create a new context for this fold
        const context = rContext.createContext();

        initialState._tracking = {
            id: Symbol("state"),
            contextId: context.id,
        };

        // Track this variable in the context
        rContext.trackGlobal(initialState, context);

        // Create an operation to update this state
        const updateState = (event: E) => {
            const newState = unR(reducer)(unR(initialState), event);
            console.log("Updating state to", newState);
            (initialState.value as any).current = newState;

            // Run all operations registered to this context
            console.log(
                `Running ${context.operations.length} operations for context ${context.id}`
            );
            context.operations.forEach((op) => op());
        };

        // Add the event listener that will trigger updates
        if (eventStream && Array.isArray(eventStream.listeners)) {
            console.log("Adding event listener");
            eventStream.listeners.push(updateState);
        }

        console.log("Initial state value:", initialState);
        return initialState;
    },


    foldM<E, S>(
        events: RValue<Effect<{ listeners: ((event: E) => void)[]; }>>,
        initialState: RValue<Effect<S>>,
        reducer: RValue<(state: Effect<S>, event: E) => Effect<S>>
    ): RValue<Effect<S>> {
        const eventStream = unR(events);
        const initialStateVal = unR(initialState);

        console.log("Interpreter Fold, Event stream:", events);

        // Create a new context for this fold
        const context = rContext.createContext();

        initialState._tracking = {
            id: Symbol("state"),
            contextId: context.id,
        };

        // Track this variable in the context
        rContext.trackGlobal(initialState, context);

        // Create an operation to update this state
        const updateState = (event: E) => {
            const newState = unR(reducer)(unR(initialState), event);
            console.log("Updating state to", newState);
            (initialState.value as any).current = newState;

            // Run all operations registered to this context
            console.log(
                `Running ${context.operations.length} operations for context ${context.id}`
            );
            context.operations.forEach((op) => {
                console.log("Running operation", op);
                op();
            });
        };

        // Add the event listener that will trigger updates
        events.value.current = eventStream.map((stream) => {
            if (stream && Array.isArray(stream.listeners)) {
                console.log("Adding event listener");
                stream.listeners.push(updateState);
            }
            return stream;
        });


        console.log("Initial state value:", initialState);

        // This is scolon
        const result = rContext.createTrackedValue([events, initialState], () => {
            return unR(events).chain(() => unR(initialState));
        });

        console.log("FoldM result", result);

        return result;
    },

    effect<E>(
        events: RValue<{ listeners: ((event: E) => void)[] }>,
        effectFn: RValue<(event: E) => void>
    ): RValue<void> {
        const eventStream = unR(events);

        if (eventStream && Array.isArray(eventStream.listeners)) {
            eventStream.listeners.push(unR(effectFn));
        }

        return R(undefined);
    },

    zip: function <S, T>(a: RValue<{ listeners: ((event: S) => void)[]; }>, b: RValue<{ listeners: ((event: T) => void)[]; }>): RValue<{ listeners: ((event: S | T) => void)[]; }> {
        // Zip implementation
        const streamA = unR(a);
        const streamB = unR(b);

        const zippedStream = {
            listeners: [],
        };

        return R(zippedStream, {
            id: Symbol("zipped"),
            variables: [a, b],
        });
    }
});
