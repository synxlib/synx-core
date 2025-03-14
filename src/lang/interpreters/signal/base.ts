import { Signal } from "./core";

declare module "../../../generic/hkt" {
  interface URItoKind<A> {
    'Signal': Signal<A>;
  }
}
