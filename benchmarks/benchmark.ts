import { performance } from "perf_hooks";

export function benchmark(name: string, fn: () => any, iterations = 100) {
    // Perform garbage collection if available (Node.js only)
    if (global.gc) {
        global.gc();
    } else {
        console.warn(
            "No GC hook! Add --expose-gc when running Node.js to measure memory usage accurately.",
        );
    }

    // Get initial memory usage
    const initialMemory = process.memoryUsage();

    // Warm-up
    console.log(`Running benchmark: ${name}`);
    console.log(`Warming up with ${10} iterations...`);
    for (let i = 0; i < 10; i++) fn();

    // Measure time
    console.log(`Measuring performance over ${iterations} iterations...`);
    const startTime = performance.now();
    let lastResult;
    for (let i = 0; i < iterations; i++) {
        lastResult = fn();
    }
    const endTime = performance.now();
    const average = (endTime - startTime) / iterations;

    // Force garbage collection again if available
    if (global.gc) {
        global.gc();
    }

    // Measure final memory state
    const finalMemory = process.memoryUsage();

    // Calculate memory differences
    const heapUsed = finalMemory.heapUsed - initialMemory.heapUsed;
    const heapTotal = finalMemory.heapTotal - initialMemory.heapTotal;
    const rss = finalMemory.rss - initialMemory.rss;
    const external = finalMemory.external - initialMemory.external;

    // Print results in a format easy to copy
    console.log(`\n=== BENCHMARK RESULTS: ${name} ===`);
    console.log(`Implementation: <REPLACE WITH CURRENT IMPLEMENTATION NAME>`);
    console.log(`Depth/Size: <REPLACE WITH TEST SIZE>`);
    console.log(`Time: ${average.toFixed(3)}ms per iteration`);
    console.log(`Last Result: ${lastResult}`);
    console.log(`Memory Usage:`);
    console.log(
        `  Heap Used: ${formatMemory(finalMemory.heapUsed)} (${heapUsed > 0 ? "+" : ""}${formatMemory(heapUsed)})`,
    );
    console.log(
        `  Heap Total: ${formatMemory(finalMemory.heapTotal)} (${heapTotal > 0 ? "+" : ""}${formatMemory(heapTotal)})`,
    );
    console.log(
        `  RSS: ${formatMemory(finalMemory.rss)} (${rss > 0 ? "+" : ""}${formatMemory(rss)})`,
    );
    console.log(
        `  External: ${formatMemory(finalMemory.external)} (${external > 0 ? "+" : ""}${formatMemory(external)})`,
    );

    // Create CSV-friendly output for easy recording
    console.log("\nCSV FORMAT (copy this to your spreadsheet):");
    console.log(
        `Implementation,Depth,Time (ms),Heap Used,Heap Total,RSS,External`,
    );
    console.log(
        `<IMPL>,<DEPTH>,${average.toFixed(3)},${formatMemoryRaw(heapUsed)},${formatMemoryRaw(heapTotal)},${formatMemoryRaw(rss)},${formatMemoryRaw(external)}`,
    );

    if (heapUsed > 1024 * 1024 * 10) {
        // If increase is more than 10MB
        console.warn(
            "⚠️ Significant memory increase detected. Possible memory leak?",
        );
    }

    return {
        name,
        timeMs: average,
        lastResult,
        memoryDelta: {
            heapUsed,
            heapTotal,
            rss,
            external,
        },
    };
}

/**
 * Format memory size in a human-readable way
 */
function formatMemory(bytes: number): string {
    const absBytes = Math.abs(bytes);
    if (absBytes < 1024) {
        return `${bytes} B`;
    } else if (absBytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(2)} KB`;
    } else if (absBytes < 1024 * 1024 * 1024) {
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    } else {
        return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    }
}

/**
 * Format memory size in a spreadsheet-friendly way (MB)
 */
function formatMemoryRaw(bytes: number): string {
    return (bytes / (1024 * 1024)).toFixed(2);
}
