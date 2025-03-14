// Core expression interface
interface ExpSYM<R> {
  lit(n: number): R;
  neg(e: R): R;
  add(e1: R, e2: R): R;
}

// Expression type - generic in both result type and interpreter
type Expr<R, I> = (i: I) => R;

// Smart constructors
const lit =
  <R, I extends ExpSYM<R>>(n: number): Expr<R, I> =>
  (i) =>
    i.lit(n);
const neg =
  <R, I extends ExpSYM<R>>(e: Expr<R, I>): Expr<R, I> =>
  (i) =>
    i.neg(e(i));
const add =
  <R, I extends ExpSYM<R>>(e1: Expr<R, I>, e2: Expr<R, I>): Expr<R, I> =>
  (i) =>
    i.add(e1(i), e2(i));

// Evaluation is just function application
const eval_ = <R, I>(expr: Expr<R, I>, interp: I): R => expr(interp);

// Numeric interpreter
const numInterp: ExpSYM<number> = {
  lit: (n) => n,
  neg: (e) => -e,
  add: (e1, e2) => e1 + e2,
};

// String interpreter
const strInterp: ExpSYM<string> = {
  lit: (n) => n.toString(),
  neg: (e) => `(-${e})`,
  add: (e1, e2) => `(${e1} + ${e2})`,
};

// Example expression
const example1 = <R, I extends ExpSYM<R>>(): Expr<R, I> => add(lit(8), lit(2));

const example2 = <R, I extends ExpSYM<R>>(): Expr<R, I> =>
  add(lit(8), neg(lit(2)));

// Usage
console.log(eval_(example1(), numInterp)); // 10
console.log(eval_(example2(), numInterp)); // 6
console.log(eval_(example1(), strInterp)); // "(8 + 2)"
console.log(eval_(example2(), strInterp)); // "(8 + (-2))"

// -------------------------------------------------------------------------------
// EXTENDING WITH MULTIPLICATION
// Note: All previous code remains unchanged
// -------------------------------------------------------------------------------

// Additional operation interface
interface MulSYM<R> {
  mul(e1: R, e2: R): R;
}

// New smart constructor for multiplication
const mul =
  <R, I extends ExpSYM<R> & MulSYM<R>>(
    e1: Expr<R, I>,
    e2: Expr<R, I>
  ): Expr<R, I> =>
  (i) =>
    i.mul(e1(i), e2(i));

// Extended interpreters
const extNumInterp: ExpSYM<number> & MulSYM<number> = {
  ...numInterp, // Reuse existing interpreter
  mul: (e1, e2) => e1 * e2,
};

const extStrInterp: ExpSYM<string> & MulSYM<string> = {
  ...strInterp, // Reuse existing interpreter
  mul: (e1, e2) => `(${e1} * ${e2})`,
};

// New example using multiplication
const example3 = <R, I extends ExpSYM<R> & MulSYM<R>>(): Expr<R, I> =>
  mul(lit(4), lit(5));

const example4 = <R, I extends ExpSYM<R> & MulSYM<R>>(): Expr<R, I> =>
  mul(add(lit(3), lit(2)), neg(lit(2)));

// Original examples still work with extended interpreters
console.log("Original examples with extended interpreters:");
console.log(eval_(example1(), extNumInterp)); // 10
console.log(eval_(example2(), extNumInterp)); // 6

// New examples using multiplication
console.log("New examples using multiplication:");
console.log(eval_(example3(), extNumInterp)); // 20
console.log(eval_(example4(), extNumInterp)); // -10
console.log(eval_(example3(), extStrInterp)); // "(4 * 5)"
console.log(eval_(example4(), extStrInterp)); // "((3 + 2) * (-2))"
