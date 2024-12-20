console.log('hi')

export class SignalUpdatedEvent<T> extends Event {
  constructor(public oldValue: T, public newValue: T) {
    super('updated');
  }
}

export class State<T> extends EventTarget {
  _value: T;

  _abortCtrl = new AbortController();

  /**
   * Creates a new signal
   *
   * @param { T } value Initial value of the Signal
   * @example
   * const counter = new Signal.State(0)
   */
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

  /**
   * Async generator that yields the current value of the Signal and waits for the next update
   * @example
   * for await (const value of counter.stream()) {
   * }
   */
  async *stream() {
    yield this.value;
    while (true) {
      yield new Promise<T>(resolve => this.addEventListener('updated', () => resolve(this.value), { once: true, signal: this._abortCtrl.signal }));
    }
  }

  /**
   * Async iterator that yields the current value
   * @example
   * for await (const value of counter) {
   * }
   */
  [Symbol.asyncIterator]() {
    return this.stream();
  }

  disconnect() {
    this._abortCtrl.abort();
  }
}

export class Computed<F extends (...args: any) => any, P extends State<any>[]> extends State<ReturnType<F>> {
  /**
   * Computed Signal
   * @param { Function } fn Function that computes the value of the Signal
   * @param { State[] } props An array of dependencies that are instances of either Signal.State or Signal.Computed
   * @example
   * const isDone = Signal.Computed(() => counter.value > 9, [counter])
   */
  constructor(private fn: F, props: P) {
    super(fn());
    props.forEach(prop => this.watcher(prop));
  }

  async watcher(prop: State<any>) {
    for await (const _ of prop) {
      this.value = this.fn();
    }
  }
}

export class List<T extends State<any>> extends State<T[]> {
  override get value() {
    return super.value;
  }

  override set value(value: T[]) {
    if (this._value === value) return;
    this._value.forEach(i => i.disconnect());
    this._value = value;
    this.dispatchEvent(new Event('updated'));
  }

  override async *stream() {
    yield this.value;
    while (true) {
      const targets = [this, ...this.value];
      const ac = new AbortController();
      this._abortCtrl.signal.onabort = () => {
        ac.abort();
      }
      await Promise.race(targets.map(target =>
        new Promise<void>(resolve => target.addEventListener('updated', () => {
          resolve()
        }, { once: true, signal: ac.signal }))
      ));
      ac.abort();
      yield this.value;
    }
  }

  // override async *stream() {
  //   yield this.value;
  //   while (true) {
  //     const targets = [this, ...this.value];
  //     const ac = new AbortController();
  //     this._abortCtrl.signal.onabort = () => {
  //       ac.abort();
  //     }
  //     await Promise.race(targets.map(target =>
  //       new Promise<void>(resolve => target.addEventListener('updated', () => {
  //         resolve()
  //       }, { once: true, signal: ac.signal }))
  //     ));
  //     ac.abort();
  //     yield this.value;
  //   }
  // }

  override disconnect(): void {
    this.value.forEach(i => i.disconnect());
    super.disconnect();
  }
}

/**
 * Signal object that contains State and Computed classes
 * @example
 * const counter = Signal.State(0)
 * const isDone = Signal.Computed(() => counter.value > 9, [counter])
 */
export class Signal {
  static State = State;
  static Computed = Computed;
  static List = List;
}
