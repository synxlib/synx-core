export type Either<E, A> = Left<E> | Right<A>;

export class Left<E> {
  readonly _tag: 'Left' = 'Left';
  constructor(readonly value: E) {}
  
  isLeft(): this is Left<E> {
    return true;
  }
  
  isRight(): false {
    return false;
  }
  
  map<B>(_f: (a: never) => B): Either<E, B> {
    return this as any;
  }
  
  flatMap<B>(_f: (a: never) => Either<E, B>): Either<E, B> {
    return this as any;
  }
}

export class Right<A> {
  readonly _tag: 'Right' = 'Right';
  constructor(readonly value: A) {}
  
  isLeft(): false {
    return false;
  }
  
  isRight(): this is Right<A> {
    return true;
  }
  
  map<B>(f: (a: A) => B): Either<never, B> {
    return new Right(f(this.value));
  }
  
  flatMap<E, B>(f: (a: A) => Either<E, B>): Either<E, B> {
    return f(this.value);
  }
}

export const left = <E>(e: E): Either<E, never> => new Left(e);
export const right = <A>(a: A): Either<never, A> => new Right(a);