import { Free, sequence } from "@/generic/free";
import { Instruction } from "@/lang/extensions/instruction";
import { run } from "@/lang/runtimes/reactive/run";
import { performance } from "perf_hooks";
import { benchmark } from "./benchmark";

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
            benchmark(label, () => deepBindTest(depth), iterations);
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
    runBenchmarks("Wide Tree", (depth: number) => {
        wideTreeTest(depth, depth);
    });
}
// If you want to add more realistic benchmarks, you can add them here
function runRealisticBenchmarks() {
    // Add your own tests that better reflect your actual usage patterns
    // For example:
    /*
  function realisticWorkflow() {
    // Create a real workflow using your Free monad
    // This should mimic how you actually use it in your application
    const program = ... your actual usage pattern ...
    return run(program);
  }

  benchmark("Realistic Workflow", realisticWorkflow, 20);
  */
}

// Run all benchmarks
function runAllBenchmarks() {
    runDeepBindBenchmarks();
    runWideTreeBenchmarks();
    // runRealisticBenchmarks();
}

// Only run if directly executed
// if (require.main === module) {
//   runAllBenchmarks();
// }

// Export for modular usage
export {
    deepBindTest,
    runDeepBindBenchmarks,
    // runRealisticBenchmarks,
    runAllBenchmarks,
};

runAllBenchmarks();
