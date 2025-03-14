import { Kind, URIS } from "../../generic/hkt";
import { Expr } from "./common";

// Define the interface for string operations
export interface SynxString<F extends URIS> {
  // Basic string creation
  str(value: string): Kind<F, string>;

  // String concatenation
  concat(s1: Kind<F, string>, s2: Kind<F, string>): Kind<F, string>;

  // String manipulation methods
  toUpperCase(s: Kind<F, string>): Kind<F, string>;
  toLowerCase(s: Kind<F, string>): Kind<F, string>;

  // String operations
  substring(
    s: Kind<F, string>,
    start: Kind<F, number>,
    end?: Kind<F, number>
  ): Kind<F, string>;
  replace(
    s: Kind<F, string>,
    searchValue: Kind<F, string>,
    replaceValue: Kind<F, string>
  ): Kind<F, string>;

  // String testing
  includes(s: Kind<F, string>, searchString: Kind<F, string>): Kind<F, boolean>;
  startsWith(
    s: Kind<F, string>,
    searchString: Kind<F, string>
  ): Kind<F, boolean>;
  endsWith(s: Kind<F, string>, searchString: Kind<F, string>): Kind<F, boolean>;

  // Length property
  length(s: Kind<F, string>): Kind<F, number>;

  // Format/template strings
  format(template: Kind<F, string>, ...values: Kind<F, any>[]): Kind<F, string>;
}

// Constructor functions for string operations
export const str =
  <F extends URIS>(value: string): Expr<F, string> =>
  (interpreter: SynxString<F>) =>
    interpreter.str(value);

export const concat =
  <F extends URIS>(s1: Expr<F, string>, s2: Expr<F, string>): Expr<F, string> =>
  (interpreter) =>
    interpreter.concat(s1(interpreter), s2(interpreter));

export const toUpperCase =
  <F extends URIS>(s: Expr<F, string>): Expr<F, string> =>
  (interpreter) =>
    interpreter.toUpperCase(s(interpreter));

export const toLowerCase =
  <F extends URIS>(s: Expr<F, string>): Expr<F, string> =>
  (interpreter) =>
    interpreter.toLowerCase(s(interpreter));

export const substring =
  <F extends URIS>(
    s: Expr<F, string>,
    start: Expr<F, number>,
    end?: Expr<F, number>
  ): Expr<F, string> =>
  (interpreter) =>
    end
      ? interpreter.substring(
          s(interpreter),
          start(interpreter),
          end(interpreter)
        )
      : interpreter.substring(s(interpreter), start(interpreter));

export const replace =
  <F extends URIS>(
    s: Expr<F, string>,
    searchValue: Expr<F, string>,
    replaceValue: Expr<F, string>
  ): Expr<F, string> =>
  (interpreter) =>
    interpreter.replace(
      s(interpreter),
      searchValue(interpreter),
      replaceValue(interpreter)
    );

export const includes =
  <F extends URIS>(
    s: Expr<F, string>,
    searchString: Expr<F, string>
  ): Expr<F, boolean> =>
  (interpreter) =>
    interpreter.includes(s(interpreter), searchString(interpreter));

export const startsWith =
  <F extends URIS>(
    s: Expr<F, string>,
    searchString: Expr<F, string>
  ): Expr<F, boolean> =>
  (interpreter) =>
    interpreter.startsWith(s(interpreter), searchString(interpreter));

export const endsWith =
  <F extends URIS>(
    s: Expr<F, string>,
    searchString: Expr<F, string>
  ): Expr<F, boolean> =>
  (interpreter) =>
    interpreter.endsWith(s(interpreter), searchString(interpreter));

export const length =
  <F extends URIS>(s: Expr<F, string>): Expr<F, number> =>
  (interpreter) =>
    interpreter.length(s(interpreter));

export const format =
  <F extends URIS>(
    template: Expr<F, string>,
    ...values: Expr<F, any>[]
  ): Expr<F, string> =>
  (interpreter) =>
    interpreter.format(
      template(interpreter),
      ...values.map((v) => v(interpreter))
    );
