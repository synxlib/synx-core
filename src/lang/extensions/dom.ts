import { Either } from "@/generic/either";
import { Kind, URIS } from "../../generic/hkt";
import { Expr } from "./common";

export type DomError = {
  code: "ELEMENT_NOT_FOUND" | "PROPERTY_ERROR" | "SIGNAL_VALUE_NOT_DEFINED";
  message: string;
};

export interface SynxDom<F extends URIS> {
  getElementIdBy(id: Kind<F, string>): Kind<F, Either<DomError, HTMLElement>>;
  setProperty(
    name: Kind<F, string>,
    value: Kind<F, string>,
    el: Kind<F, HTMLElement>
  ): Kind<F, Either<DomError, void>>;
  on(eventType: Kind<F, string>, el: Kind<F, HTMLElement>): Kind<F, any>;
}

export const getElementById =
  <F extends URIS>(
    id: Expr<F, string>
  ): Expr<F, Either<DomError, HTMLElement>> =>
  (interpreter) =>
    interpreter.getElementIdBy(id(interpreter));

export const setProperty =
  <F extends URIS>(
    name: Expr<F, string>,
    value: Expr<F, string>,
    el: Expr<F, HTMLElement>
  ): Expr<F, Either<DomError, void>> =>
  (interpreter) =>
    interpreter.setProperty(
      name(interpreter),
      value(interpreter),
      el(interpreter)
    );

export const on =
  <F extends URIS>(
    eventType: Expr<F, string>,
    el: Expr<F, HTMLElement>
  ): Expr<F, void> =>
  (interpreter) =>
    interpreter.on(eventType(interpreter), el(interpreter));
