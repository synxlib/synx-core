export function makeTagGuard<T extends string>(tags: readonly T[]) {
    const tagSet = new Set<string>(tags);
    return <I extends { tag: string }>(instr: I): instr is I & { tag: T } => {
        return tagSet.has(instr.tag);
    };
}
