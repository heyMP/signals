export class SignalUpdatedEvent<T> extends Event {
  constructor(public oldValue: T, public newValue: T) {
    super('updated');
  }
}

export class Signal<T> extends EventTarget {
  private _value: T;

  constructor(value: T) {
    super();
    this._value = value;
  }

  get value() {
    return this._value;
  }

  set value(value: T) {
    const prevValue = this._value;
    // dirty check
    if (prevValue !== value) {
      this._value = value;
      this.dispatchEvent(new SignalUpdatedEvent(prevValue, this._value));
    }
  }

  async *stream(): AsyncGenerator<T> {
    yield this.value;
    while (true) {
      yield await new Promise(resolve => this.addEventListener('updated', () => resolve(this.value), { once: true }));
    }
  }

  [Symbol.asyncIterator]() {
    return this.stream();
  }
}

export class Computed<F extends (...args: any) => any, P extends Signal<any>[]> extends Signal<ReturnType<F>> {
  constructor(private fn: F, props: P) {
    super(fn());
    props.forEach(prop => this.watcher(prop));
  }

  async watcher(prop: Signal<any>) {
    for await (const _ of prop) {
      this.value = this.fn();
    }
  }
}
