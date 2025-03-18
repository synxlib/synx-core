export interface Tracking {
  id?: Symbol;
  contextId?: number;
  variables?: RValue<any>[];
}

// Define our 'R' interpreter type
export interface RValue<A> /*extends HKT<"R", A>*/ {
  readonly _URI: "R";
  readonly _A: A;
  readonly value: { current: A };
  _tracking?: Tracking;
}

export interface RStateValue<A> extends RValue<any> {
  readonly _URI: "R";
  readonly _A: A;
  readonly value: { current: A };
  readonly _tracking?: Tracking;
}

export function isRStateValue<A>(value: RValue<any>): value is RStateValue<A> {
  return (
    typeof value.value === "object" &&
    value.value !== null &&
    "current" in value.value
  );
}

// Declare R URI for TypeScript's type system
declare module "../../../generic/hkt" {
  interface URItoKind<A> {
    R: RValue<A>;
  }
}

// Constructor function for R values
export const R = <A>(value: A, tracking?: Tracking): RValue<A> => ({
  _URI: "R",
  _A: {} as A,
  value: { current: value },
  _tracking: tracking,
});

// Accessor function to extract the value
export const unR = <A>(r: RValue<A>): A => {
  return r.value.current;
};
