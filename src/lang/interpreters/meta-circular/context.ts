import { R, RValue, Tracking } from "./common";

// Context for tracking fold operations and variables
export interface Context {
  id: number;
  variables: Set<RValue<any>>; // State variables in this context
  operations: Array<() => void>; // Operations to run when state changes
}

// Centralized tracking registry
export class RContext {
  private contexts: Context[] = [];
  private nextContextId = 0;
  private trackingRegistry = new Map<RValue<any> | Symbol, Context>();

  // Create a new global context
  createContext(): Context {
    const context: Context = {
      id: this.nextContextId++,
      variables: new Set(),
      operations: [],
    };
    this.contexts.push(context);
    return context;
  }

  // Track a value in a global context
  trackGlobal(value: RValue<any>, context: Context): void {
    this.trackingRegistry.set(value._tracking?.id || value, context);
    context.variables.add(value);
    // console.log("Tracking", value, "in context", context);
  }

  // Retrieve tracking information from the global registry
  getTrackedContext(variable: RValue<any>): Context | undefined {
    return this.trackingRegistry.get(variable._tracking?.id || variable);
  }

  // Register an operation that depends on a tracked variable
  registerOperation(operation: () => void, variable: RValue<any>): void {
    const context = this.getTrackedContext(variable);
    if (context && !context.operations.includes(operation)) {
      context.operations.push(operation);
    }
  }

  // Collect tracking information for multiple values globally
  private combineGlobalTracking(...values: RValue<any>[]): Tracking | undefined {
    const trackedVars = values.flatMap(val => this.getTrackedContext(val)?.variables ?? []);

    if (trackedVars.length === 0) {
      return undefined;
    }

    console.log("Found tracked variables", trackedVars);
    // console.trace();
    return { variables: Array.from(new Set(trackedVars)) as unknown as RValue<any>[] };
  }

  // Create a tracked value globally
  createTrackedValue<A>(dependencies: RValue<any>[], operation: () => A): RValue<A> {
    const tracking = this.combineGlobalTracking(...dependencies);
    const result = R(operation(), tracking);

    // Register this operation with all global contexts of dependencies
    for (const dependency of dependencies) {
      const context = this.getTrackedContext(dependency);
      if (context) {
        this.registerOperation(() => {
          result.value.current = operation();
        }, dependency);
      }
    }

    return result;
  }
}

// export class RContext {
//   private contexts: Context[] = [];
//   private nextContextId = 0;

//   // Create a new context
//   createContext(): Context {
//     const context: Context = {
//       id: this.nextContextId++,
//       variables: new Set(),
//       operations: [],
//     };
//     this.contexts.push(context);
//     return context;
//   }

//   // Check if a value is tracked in any context
//   private findContextsForVariable(variable: RValue<any>): Context[] {
//     // If this variable has a context ID, find it directly
//     if (variable._tracking?.contextId !== undefined) {
//       const contextId = variable._tracking.contextId;
//       const context = this.contexts.find((ctx) => ctx.id === contextId);
//       return context ? [context] : [];
//     }

//     // Otherwise, check all contexts for this variable or any dependencies
//     return this.contexts.filter(
//       (ctx) =>
//         ctx.variables.has(variable) ||
//         Array.from(ctx.variables).some((v) =>
//           variable._tracking?.variables?.includes(v)
//         )
//     );
//   }

//   // Track a value in a context
//   trackInContext(value: RValue<any>, context: Context): void {
//     context.variables.add(value);
//   }

//   // Register an operation that depends on a tracked variable
//   registerOperation(
//     operation: () => void,
//     variable: RValue<any>
//   ): void {
//     const contexts = this.findContextsForVariable(variable);
//     for (const context of contexts) {
//       if (!context.operations.includes(operation)) {
//         context.operations.push(operation);
//       }
//     }
//   }

//   // Helper to collect tracking info from multiple values
//   private combineTracking(...values: RValue<any>[]): Tracking | undefined {
//     const trackedVars: RValue<any>[] = [];

//     for (const val of values) {
//       if (val._tracking) {
//         if (val._tracking.variables) {
//           trackedVars.push(...val._tracking.variables);
//         } else {
//           trackedVars.push(val);
//         }
//       }
//     }

//     if (trackedVars.length === 0) {
//       return undefined;
//     }

//     return {
//       variables: trackedVars,
//     };
//   }

//   // Helper to create a value and register any needed operations
//   createTrackedValue<A>(
//     dependencies: RValue<any>[], 
//     operation: () => A
//   ): RValue<A> {
//     const tracking = this.combineTracking(...dependencies);
//     const result = R(operation(), tracking);
    
//     // If there's an operation to register and we have tracking
//     if (operation && tracking) {
//       // Register this operation with all contexts that any dependency belongs to
//       for (const dependency of dependencies) {
//         if (dependency._tracking) {
//           this.registerOperation(() => { result.value.current = operation() }, dependency);
//         }
//       }
//     }
    
//     return result;
//   }

// }