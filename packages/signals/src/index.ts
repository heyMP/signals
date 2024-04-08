export class SignalUpdatedEvent<T> extends Event {
  constructor(public oldValue: T, public newValue: T) {
    super('updated');
  }
}

export class State<T> extends EventTarget {
  private _value: T;

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
      yield new Promise(resolve => this.addEventListener('updated', () => resolve(this.value), { once: true }));
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

/**
 * Signal object that contains State and Computed classes
 * @example
 * const counter = Signal.State(0)
 * const isDone = Signal.Computed(() => counter.value > 9, [counter])
 */
export const Signal = {
  State: State,
  Computed: Computed,
}
