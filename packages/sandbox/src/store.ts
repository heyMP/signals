import { Signal, Computed } from '@heymp/signals';

class Counter extends Signal<number> {
  constructor(value: number) {
    super(value);
  }

  increment() {
    if (this.value < 10) {
      this.value++;
    }
  }

  decrement() {
    if (this.value > 0) {
      this.value--;
    }
  }
}

const counter = new Counter(0);
const isDone = new Computed(() => counter.value > 9, [counter]);

export const store = {
  counter,
  isDone
}
