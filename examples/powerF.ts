import { URIS } from "@/generic/hkt";
import { throwError } from "@/lang/extensions/error";
import { Expr } from "@/lang/extensions/common";
import { num, mul } from "@/lang/extensions/math";
import { RInterpreter } from "@/lang/interpreters/meta-circular";

export function powerF<F extends URIS>(
  n: number,
  x: Expr<F, number>
): Expr<F, number> {
  if (n === 0) {
    return num(1);
  } else if (n > 0) {
    // Compose operations to create x * powerF(n-1, x)
    return mul(x, powerF(n - 1, x));
  } else {
    // Negative exponent - throw error
    return throwError("negative exponent");
  }
}

const result = powerF(12, num(3))(new RInterpreter());

console.log(result.value);


const error = powerF(-2, num(3))(new RInterpreter());

console.log(error.value);