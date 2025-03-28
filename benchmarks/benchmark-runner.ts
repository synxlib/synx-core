import { Free, sequence } from "@/generic/free";
import { Instruction } from "@/lang/extensions/instruction";
import { run } from "@/lang/runtimes/reactive/run";
import { benchmark } from "./benchmark";
import { log } from "@/lang/extensions/debug";

function runBenchmarks(
    name: string,
    fn: (depth: number) => void,
    depths = [
        { depth: 100, iterations: 50 },
        { depth: 1000, iterations: 20 },
        { depth: 5000, iterations: 10 },
        { depth: 10000, iterations: 5 },
        { depth: 50000, iterations: 2 },
        { depth: 500000, iterations: 2 },
    ],
) {
    console.log(`=== ${name.toUpperCase()} BENCHMARKS ===`);

    for (const { depth, iterations } of depths) {
        const label = `${name} (${depth})`;
        try {
            benchmark(label, () => fn(depth), iterations);
        } catch (e) {
            console.error(`❌ Failed at depth ${depth}: ${e.message || e}`);
        }
    }
}

function deepBindTest(depth: number) {
    let program: Free<Instruction, number> = Free.pure(0);
    for (let i = 0; i < depth; i++) {
        program = program.flatMap((value) => Free.pure(value + 1));
    }
    return run(program);
}

function runDeepBindBenchmarks() {
    runBenchmarks("Deep Bind", (depth: number) => {
        deepBindTest(depth);
    });
}

function wideTreeTest(width: number, depth: number) {
    function buildTree(currentDepth: number): Free<Instruction, number> {
        if (currentDepth === 0) return Free.pure(1);

        let effects: Free<Instruction, number>[] = [];
        for (let i = 0; i < width; i++) {
            effects.push(buildTree(currentDepth - 1));
        }

        return sequence(effects).flatMap((values) =>
            Free.pure(values.reduce((a, b) => a + b, 0)),
        );
    }

    return run(buildTree(depth));
}

function runWideTreeBenchmarks() {
    runBenchmarks(
        "Wide Tree",
        (depth: number) => {
            wideTreeTest(10, depth);
        },
        [
            { depth: 100, iterations: 50 },
            { depth: 1000, iterations: 20 },
            { depth: 5000, iterations: 10 },
        ],
    );
}

function manyLogTest(count: number) {
    // Create a sequence of many simple log instructions
    const effects = Array(count)
        .fill(0)
        .map((_, i) => log(`Log message ${i}`));

    return run(sequence(effects));
}

function runManyLogTest() {
    runBenchmarks(
        "Many Logs",
        (depth: number) => {
            return manyLogTest(depth);
        },
        [
            { depth: 100, iterations: 50 },
            { depth: 1000, iterations: 20 },
            { depth: 5000, iterations: 10 },
        ],
    );
}

// Run all benchmarks
function runAllBenchmarks() {
    runDeepBindBenchmarks();
    runWideTreeBenchmarks();
    // runManyLogTest();
}

runAllBenchmarks();
