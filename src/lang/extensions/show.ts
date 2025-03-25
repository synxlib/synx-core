import { Free } from "@/generic/free";
import { makeTagGuard } from "./make-tag-guard";
import { Instruction } from "./instruction";

export const ShowInstructionTag = "Show" as const;

// TypeId can be a string (for primitive types) or a symbol (for custom types)
export type TypeId = string | symbol;

export interface ShowInstruction {
    tag: typeof ShowInstructionTag;
    value: any;
    getTypeId: (value: any) => TypeId;
    resultType: string;
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
    registerTypePredicate(
        predicate: (value: any) => boolean,
        typeId: TypeId,
    ): void {
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
            console.warn(
                `No formatter registered for type '${String(typeId)}', using default`,
            );
            return String(value);
        }
        return formatter.format(value);
    }
}

export const showRegistry = new ShowRegistry();

// Create a show function that can be used directly
export function show<T>(
    value: Free<Instruction, T>,
): Free<Instruction, string> {
    return value.flatMap((val) => {
        console.log("show val", val);
        return Free.liftF<Instruction, string>({
            tag: ShowInstructionTag,
            value: val,
            getTypeId: (val: any) => showRegistry.detectType(val),
            resultType: "",
        });
    });
}

// Create a show function for a specific type
export function createShow<T>(typeId: TypeId) {
    return (value: Free<Instruction, T>): Free<Instruction, string> =>
        value.flatMap((val) =>
            Free.liftF({
                tag: ShowInstructionTag,
                value: val,
                getTypeId: (val: any) => showRegistry.detectType(val),
                resultType: "",
            }),
        );
}

// export function showMapInstr<A, B>(
//     instr: ShowInstruction<A>,
//     f: (a: A) => B,
// ): ShowInstruction<B> {
//     return { ...instr, next: (r: string) => f(instr.next(r)) };
// }

export const isShowInstruction = makeTagGuard([ShowInstructionTag]);
