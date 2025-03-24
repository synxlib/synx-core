import { mul } from "@/lang/extensions/math";
import { Freer, pure } from "@/lang/extensions/freer";
import { run } from "@/lang/runtimes/reactive/run";
import { throwError } from "@/lang/extensions/error";

export function powerF(
  n: number,
  x: Freer<number>
): Freer<number> {
  if (n === 0) {
    return pure(1);
  } else if (n > 0) {
    // Compose operations to create x * powerF(n-1, x)
    return mul(x, powerF(n - 1, x));
  } else {
    // Negative exponent - throw error
    return throwError("negative exponent");
  }
}

const result = run(powerF(12, pure(3)));

console.log(result);


const error = run(powerF(-2, pure(3)));

console.log(error);

// pnpm exec tsx examples/powerF.ts