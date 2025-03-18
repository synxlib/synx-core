// MetacircularInterpreter.ts
import { Either, left, right } from "@/generic/either";
import { HKT, URIS } from "@/generic/hkt";
import { DomError } from "@/lang/extensions/dom";
import { SynxMath } from "@/lang/extensions/math";
import { Show } from "@/lang/show";
import { Expr, Interpreter } from "@lang/extensions/common";
import { RMath } from "./math";
import { RContext } from "./context";
import { RString } from "./string";
import { RLambda } from "./lambda";
import { RError } from "./error";
import { REvent } from "./event";
import { RDom } from "./dom";
import { RList } from "./list";
import { unR, RValue } from "./common";
import { RBind } from "./bind";

export const RInterpreter = (): Interpreter<"R"> & Show<"R", number> => {
  const rContext = new RContext();

  return {
    ...RList(rContext),
    ...RMath(rContext),
    ...RString(rContext),
    ...RLambda(rContext),
    ...REvent(rContext),
    ...RError(rContext),
    ...RDom(rContext),
    ...RBind(rContext)
  };
};

// Evaluate function - simply extracts the value
export const eval_ = <A>(expr: RValue<A>): A => unR(expr);

/*
// Implementation of the meta-circular interpreter R
export class RInterpreter implements Interpreter<"R">, Show<"R", number> {
  private contexts: Context[] = [];
  private nextContextId = 0;

  // Create a new context
  private createContext(): Context {
    const context: Context = {
      id: this.nextContextId++,
      variables: new Set(),
      operations: [],
    };
    this.contexts.push(context);
    return context;
  }

  // Check if a value is tracked in any context
  private findContextsForVariable(variable: RValue<any>): Context[] {
    // If this variable has a context ID, find it directly
    if (variable._tracking?.contextId !== undefined) {
      const contextId = variable._tracking.contextId;
      const context = this.contexts.find((ctx) => ctx.id === contextId);
      return context ? [context] : [];
    }

    // Otherwise, check all contexts for this variable or any dependencies
    return this.contexts.filter(
      (ctx) =>
        ctx.variables.has(variable) ||
        Array.from(ctx.variables).some((v) =>
          variable._tracking?.variables?.includes(v)
        )
    );
  }

  // Track a value in a context
  private trackInContext(value: RValue<any>, context: Context): void {
    context.variables.add(value);
  }

  // Register an operation that depends on a tracked variable
  private registerOperation(
    operation: () => void,
    variable: RValue<any>
  ): void {
    const contexts = this.findContextsForVariable(variable);
    for (const context of contexts) {
      if (!context.operations.includes(operation)) {
        context.operations.push(operation);
      }
    }
  }

  // Helper to collect tracking info from multiple values
  private combineTracking(...values: RValue<any>[]): Tracking | undefined {
    const trackedVars: RValue<any>[] = [];

    for (const val of values) {
      if (val._tracking) {
        if (val._tracking.variables) {
          trackedVars.push(...val._tracking.variables);
        } else {
          trackedVars.push(val);
        }
      }
    }

    if (trackedVars.length === 0) {
      return undefined;
    }

    return {
      variables: trackedVars,
    };
  }

  // Helper to create a value and register any needed operations
  private createTrackedValue<A>(
    dependencies: RValue<any>[], 
    operation: () => A
  ): RValue<A> {
    const tracking = this.combineTracking(...dependencies);
    const result = R(operation(), tracking);
    
    // If there's an operation to register and we have tracking
    if (operation && tracking) {
      // Register this operation with all contexts that any dependency belongs to
      for (const dependency of dependencies) {
        if (dependency._tracking) {
          this.registerOperation(() => { result.value.current = operation() }, dependency);
        }
      }
    }
    
    return result;
  }

  // SynxMath implementation - meta-circular operations
  num(x: number): RValue<number> {
    return R(x);
  }

  add(x: RValue<number>, y: RValue<number>): RValue<number> {
    return this.createTrackedValue([x, y], () => unR(x) + unR(y));
  }

  sub(x: RValue<number>, y: RValue<number>): RValue<number> {
    return this.createTrackedValue([x, y], () => unR(x) - unR(y));
  }

  mul(x: RValue<number>, y: RValue<number>): RValue<number> {
    return this.createTrackedValue([x, y], () => unR(x) * unR(y));
  }

  div(x: RValue<number>, y: RValue<number>): RValue<number> {
    return this.createTrackedValue([x, y], () => unR(x) / unR(y));
  }

  mod(x: RValue<number>, y: RValue<number>): RValue<number> {
    return this.createTrackedValue([x, y], () => unR(x) % unR(y));
  }

  // Show implementation
  show(x: RValue<number>): RValue<string> {
    return this.createTrackedValue([x], () => String(unR(x)));
  }

  // SynxString implementation - direct operations
  str(value: string): RValue<string> {
    return R(value);
  }

  concat(s1: RValue<string>, s2: RValue<string>): RValue<string> {
    return this.createTrackedValue([s1, s2], () => String(unR(s1)) + String(unR(s2)));
  }

  toUpperCase(s: RValue<string>): RValue<string> {
    return this.createTrackedValue([s], () => String(unR(s)).toUpperCase());
  }

  toLowerCase(s: RValue<string>): RValue<string> {
    return this.createTrackedValue([s], () => String(unR(s)).toLowerCase());
  }

  substring(
    s: RValue<string>,
    start: RValue<number>,
    end?: RValue<number>
  ): RValue<string> {
    const sVal = unR(s);
    const startVal = unR(start);
    const endVal = end ? unR(end) : undefined;

    const result = String(sVal).substring(startVal, endVal);

    // Combine tracking from all operands
    const operands = end ? [s, start, end] : [s, start];
    const tracking = this.combineTracking(...operands);

    return R(result, tracking);
  }

  replace(
    s: RValue<string>,
    searchValue: RValue<string>,
    replaceValue: RValue<string>
  ): RValue<string> {
    const sVal = unR(s);
    const searchVal = unR(searchValue);
    const replaceVal = unR(replaceValue);

    const result = String(sVal).replace(String(searchVal), String(replaceVal));

    // Combine tracking from all operands
    const tracking = this.combineTracking(s, searchValue, replaceValue);

    return R(result, tracking);
  }

  includes(s: RValue<string>, searchString: RValue<string>): RValue<boolean> {
    return R(unR(s).includes(unR(searchString)));
  }

  startsWith(s: RValue<string>, searchString: RValue<string>): RValue<boolean> {
    return R(unR(s).startsWith(unR(searchString)));
  }

  endsWith(s: RValue<string>, searchString: RValue<string>): RValue<boolean> {
    return R(unR(s).endsWith(unR(searchString)));
  }

  length(s: RValue<string>): RValue<number> {
    return R(unR(s).length);
  }

  format(template: RValue<string>, ...values: RValue<any>[]): RValue<string> {
    let result = unR(template);
    for (let i = 0; i < values.length; i++) {
      result = result.replace(`{${i}}`, String(unR(values[i])));
    }
    return R(result);
  }

  // SynxDom implementation - dummy implementations
  getElementIdBy(id: RValue<string>): RValue<Either<DomError, HTMLElement>> {
    const elementId = unR(id);

    try {
      // Attempt to find the element in the DOM
      const element = document.getElementById(elementId);

      if (element) {
        // Element found, return it wrapped in Either.Right
        return R(right(element));
      } else {
        // Element not found, return an appropriate error
        return R(
          left({
            code: "ELEMENT_NOT_FOUND",
            message: `Element with id ${elementId} not found`,
          })
        );
      }
    } catch (error) {
      // Handle any exceptions that might occur
      return R(
        left({
          code: "PROPERTY_ERROR",
          message: `Error accessing DOM: ${error.message}`,
        })
      );
    }
  }

  setProperty(
    name: RValue<string>,
    value: RValue<string>,
    el: RValue<HTMLElement>
  ): RValue<Either<DomError, void>> {
    try {
      const element = unR(el);
      const propName = unR(name);
      const initialValue = unR(value);
      
      // Set the initial property value
      if (propName === "textContent") {
        element.textContent = String(initialValue);
      } else {
        (element as any)[propName] = initialValue;
      }
      
      // Create an operation to update this property when value changes
      const updateOperation = () => {
        // Get the latest value
        const latestValue = unR(value);

        console.log("Updating property", propName, "to", value);
        console.log("Updating property", propName, "to", latestValue);
        
        if (propName === "textContent") {
          element.textContent = String(latestValue);
        } else {
          (element as any)[propName] = latestValue;
        }
        console.log(`Updated ${propName} to ${latestValue}`);
        return right(undefined);
      };
      
      // Create a result value that registers the update operation
      return this.createTrackedValue([value], updateOperation);
    } catch (e) {
      return R(left({
        code: "PROPERTY_ERROR",
        message: `Failed to set property: ${e}`
      }));
    }
  }

  on(
    eventType: RValue<string>,
    el: RValue<HTMLElement>
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

    // Set up the actual DOM event listener
    element.addEventListener(type, (event) => {
      console.log(`Event ${type} triggered`, eventStream);
      // Pass the event to all listeners
      eventStream.listeners.forEach((listener) => listener(event));
    });

    return R(eventStream);
  }

  // SynxError implementation
  throwError<E, A>(error: E): RValue<A> {
    throw new Error(`Error in R interpreter: ${JSON.stringify(error)}`);
  }

  catchError<E, A>(
    action: RValue<A>,
    handler: (error: E) => RValue<A>
  ): RValue<A> {
    try {
      return action;
    } catch (e) {
      return handler(e as E);
    }
  }

  // SynxEvent implementation - dummy implementation
  fold<E, S>(
    events: RValue<{ listeners: ((event: E) => void)[] }>,
    initialState: RValue<S>,
    reducer: (state: S, event: E) => S
  ): RValue<S> {
    const eventStream = unR(events);
    const initialStateVal = unR(initialState);

    console.log("Event stream:", eventStream);

    // Create a new context for this fold
    const context = this.createContext();

    const stateValue = R<S>(initialStateVal, {
      id: Symbol("state"),
      contextId: context.id,
    });

    // Track this variable in the context
    this.trackInContext(stateValue, context);

    // Create an operation to update this state
    const updateState = (event: E) => {
      const newState = reducer(unR(stateValue), event);
      console.log("Updating state to", newState);
      (stateValue.value as any).current = newState;

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

    return stateValue;
  }

  lam<A, B>(f: (a: RValue<A>) => RValue<B>): RValue<(a: A) => B> {
    // In the meta-circular interpreter, we directly create a JavaScript function
    // that applies f to the R-wrapped argument
    const fn = (a: A): B => {
      // Wrap the argument in R
      const wrapped = R(a);

      // Apply the function f to the wrapped argument
      const result = f(wrapped);

      // Unwrap the result
      return unR(result);
    };

    // Return the function wrapped in R
    return R(fn);
  }

  app<A, B>(f: RValue<(a: A) => B>, a: RValue<A>): RValue<B> {
    // Extract the function and argument
    const fn = unR(f);
    const arg = unR(a);
    
    // Apply the function to the argument
    const result = fn(arg);
    
    // Return the result wrapped in R with combined tracking
    const tracking = this.combineTracking(f, a);
    return R(result, tracking);
  }

  fromEither<E, A>(value: Either<RValue<E>, RValue<A>>): RValue<Either<E, A>> {
    if (value.isLeft()) {
      return R(left(unR(value.value)));
    } else {
      return R(right(unR(value.value)));
    }
  }

  // Map over the Right value in an Either
  mapEither<E, A, B>(
    value: RValue<Either<E, A>>,
    f: RValue<(a: A) => B>
  ): RValue<Either<E, B>> {
    const either = unR(value);
    const mapper = unR(f);

    if (either.isRight()) {
      return R(right(mapper(either.value)));
    } else {
      return R(left(either.value));
    }
  }

  // Chain/flatMap for Either values
  chainEither<E, A, B>(
    action: RValue<Either<E, A>>,
    f: RValue<(a: A) => Either<E, B>>
  ): RValue<Either<E, B>> {
    const either = unR(action);
    const chainFunction = unR(f);

    if (either.isRight()) {
      const value = chainFunction(either.value);
      return R(value);
    } else {
      return R(left(either.value));
    }
  }
}
  */


// Usage example:
// const expr: Expr<"R", number> = (interpreter) =>
//   interpreter.add(interpreter.num(3), interpreter.mul(interpreter.num(4), interpreter.num(5)));
// const result = eval(expr(new RInterpreter())); // 23
