import { Either } from "@/generic/either";
import { Kind, URIS } from "../../generic/hkt";
import { Expr } from "./common";
import { DomEffect } from "./dom-effect";
import { app3, lam2, lam3 } from "./lambda";
import { ap, ap2, ap3, liftE, ret } from "./bind";
import { F } from "vitest/dist/chunks/config.BCv-fVdT";

export type DomError = {
  code: "ELEMENT_NOT_FOUND" | "PROPERTY_ERROR" | "SIGNAL_VALUE_NOT_DEFINED";
  message: string;
};

export interface SynxDom<F extends URIS> {
  createElement(tagName: Kind<F, string>): Kind<F, HTMLElement>;
  getElementIdBy(id: Kind<F, string>): Kind<F, DomEffect<HTMLElement>>;
  setProperty(
    name: Kind<F, string>,
    value: Kind<F, string>,
    el: Kind<F, HTMLElement>
  ): Kind<F, void>;
  // setProperty: Kind<F, (name: string, value: string, el: HTMLElement) => void>;
  getProperty(
    name: Kind<F, string>,
    el: Kind<F, HTMLElement>
  ): Kind<F, string>;
  on(eventType: Kind<F, string>, el: Kind<F, HTMLElement>): Kind<F, { listeners: ((event: unknown) => void)[] }>;
}

export const createElement =
  <F extends URIS>(tagName: Expr<F, string>): Expr<F, HTMLElement> =>
  (interpreter) =>
    interpreter.createElement(tagName(interpreter));

export const getElementById =
  <F extends URIS>(
    id: Expr<F, string>
  ): Expr<F, DomEffect<HTMLElement>> =>
  (interpreter) =>
    interpreter.getElementIdBy(id(interpreter));

  const setPropertyS = <F extends URIS>(
    name: Expr<F, string>,
    value: Expr<F, string>,
    el: Expr<F, HTMLElement>
  ): Expr<F, void> =>
  (interpreter) => {
    console.log("Extension setPropertyS value", value(interpreter));
    return interpreter.setProperty(name(interpreter), value(interpreter), el(interpreter));
  }

  export const setProperty =
  <F extends URIS>(
    name: Expr<F, string>,
    value: Expr<F, DomEffect<string>>,
    el: Expr<F, DomEffect<HTMLElement>>
  ): Expr<F, DomEffect<void>> =>
  (interpreter) => {
    // console.log("setProperty name", name(interpreter));
    console.log("Extension setProperty value", value(interpreter));
    // console.trace();
    const fn_: Expr<F, (n: string, v: string, e: HTMLElement) => void> =
      lam3((n, v, e) => {
        console.log("Extension setProperty lam3", v(interpreter));
        return setPropertyS(n, v, e);
      });

    // Apply function with three arguments using ap3
    return ap3(ret(fn_), ret(name), value, el)(interpreter);
  };

export const getPropertyS =
  <F extends URIS>(
    name: Expr<F, string>,
    el: Expr<F, HTMLElement>
  ): Expr<F, string> =>
  (interpreter) => {
    return interpreter.getProperty(
      name(interpreter),
      el(interpreter)
    );
  }

export const getProperty =
  <F extends URIS>(
    name: Expr<F, string>,
    el: Expr<F, DomEffect<HTMLElement>>
  ): Expr<F, DomEffect<string>> =>
  (interpreter) => {
    const fn_: Expr<F, (n: string, e: HTMLElement) => string> =
      lam2(getPropertyS);

    return ap2(ret(fn_), ret(name), el)(interpreter);
  }

export const onS = <F extends URIS>(
  eventType: Expr<F, string>,
  el: Expr<F, HTMLElement>
): Expr<F, { listeners: ((event: unknown) => void)[] }> =>
(interpreter) => {
  console.log("Extension onS eventType", eventType(interpreter));
  return interpreter.on(eventType(interpreter), el(interpreter));
}

export const on =
  <F extends URIS>(
    eventType: Expr<F, string>,
    el: Expr<F, DomEffect<HTMLElement>>
  ): Expr<F, DomEffect<{ listeners: ((event: unknown) => void)[] }>> =>
  (interpreter) => {
    const fn_: Expr<F, (et: string, e: HTMLElement) => { listeners: ((event: unknown) => void)[] }> =
      lam2(onS);

    return ap2(ret(fn_), ret(eventType), el)(interpreter);
  }
