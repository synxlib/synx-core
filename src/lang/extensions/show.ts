// show.ts
import { Freer, impure, pure } from "./freer";
import { makeTagGuard } from "./make-tag-guard";

export const ShowInstructionTag = "Show" as const;

// TypeId can be a string (for primitive types) or a symbol (for custom types)
export type TypeId = string | symbol;

export interface ShowInstruction<A> {
  tag: typeof ShowInstructionTag;
  value: Freer<any>;
  getTypeId: (value: any) => TypeId;  // Function to determine type at runtime
  next: (result: string) => A;
}

export interface TypeFormatter {
  format: (value: any) => string;
}

class ShowRegistry {
  private formatters: Map<TypeId, TypeFormatter> = new Map();
  private typePredicates: Array<{
    predicate: (value: any) => boolean;
    typeId: TypeId;
  }> = [];

  // Register a formatter for a specific type
  register(typeId: TypeId, formatter: TypeFormatter): void {
    this.formatters.set(typeId, formatter);
  }

  // Register a type predicate for custom type detection
  registerTypePredicate(predicate: (value: any) => boolean, typeId: TypeId): void {
    this.typePredicates.push({ predicate, typeId });
  }

  // Get formatter for a type
  getFormatter(typeId: TypeId): TypeFormatter | undefined {
    return this.formatters.get(typeId);
  }

  // Detect type using registered predicates
  detectType(value: any): TypeId {
    // First check custom type predicates
    for (const { predicate, typeId } of this.typePredicates) {
      if (predicate(value)) {
        return typeId;
      }
    }

    // Then check basic types
    if (Array.isArray(value)) return "array";
    return typeof value;
  }

  // Format a value using the registered formatter
  format(typeId: TypeId, value: any): string {
    const formatter = this.getFormatter(typeId);
    if (!formatter) {
      console.warn(`No formatter registered for type '${String(typeId)}', using default`);
      return String(value);
    }
    return formatter.format(value);
  }
}

export const showRegistry = new ShowRegistry();

// Create a show function that can be used directly
export function show<T>(value: Freer<T>): Freer<string> {
  return impure({
    tag: ShowInstructionTag,
    value: value as Freer<T>,
    getTypeId: (val: any) => showRegistry.detectType(val),
    next: pure
  });
}

// Create a show function for a specific type
export function createShow<T>(typeId: TypeId) {
  return (value: Freer<T>): Freer<string> => 
    impure({ 
      tag: ShowInstructionTag, 
      value, 
      getTypeId: () => typeId,
      next: pure 
    });
}

export function showMapInstr<A, B>(
  instr: ShowInstruction<A>,
  f: (a: A) => B
): ShowInstruction<B> {
  return { ...instr, next: (r: string) => f(instr.next(r)) };
}

export const isShowInstruction = makeTagGuard([ShowInstructionTag]);