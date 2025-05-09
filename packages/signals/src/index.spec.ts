// sum.test.js
import { expect, test } from 'vitest'
import { Signal } from './index.js';

/**
 * STATE
 */
test('State emits update event', () => {
  const counter = new Signal.State(0);
  counter.addEventListener('updated', () => {
    expect(counter.value).toBe(1);
  })
  counter.value = 1;
});

test('State contains async itertator', async () => {
  const counter = new Signal.State(0);
  const listener = async () => {
    for await (const count of counter) {
      if (count === 1) {
        return count;
      }
    }
    return undefined;
  }
  counter.value = 1;
  const count = await listener();
  expect(count).toBe(1);
});

/**
 * COMPUTED
 */
test('Computed contains async itertator', async () => {
  const counter = new Signal.State(0);
  const listener = async () => {
    for await (const count of counter) {
      if (count === 1) {
        return count;
      }
    }
    return undefined;
  }
  counter.value = 1;
  const count = await listener();
  expect(count).toBe(1);
});

test('Computed emits one event', async () => {
  const counter = new Signal.State(0);
  let events = 0;
  const listener = async () => {
    for await (const count of counter) {
      events++;
      if (count === 1) {
        return count;
      }
    }
    return undefined;
  }
  counter.value = 1;
  await listener();
  expect(events).toBe(1);
});

/**
 * LIST
 */
test('List should contain a length property', async () => {
  const counters = new Signal.List([new Signal.State(0), new Signal.State(0)]);
  expect(counters.length).toBe(2);
});

test('List emits one event per change', async () => {
  const counters = new Signal.List([new Signal.State(0), new Signal.State(0)]);
  let events = 0;

  counters.addEventListener('updated', () => {
    events++;
  });

  // incrementing counter triggers event
  counters.value.at(0)!.value = 1
  expect(events).toBe(1);

  // setting counter to the same value
  // should not trigger an additional event
  counters.value.at(0)!.value = 1;
  expect(events).toBe(1);

  // incrementing counter to a different value
  // should trigger change
  counters.value.at(0)!.value++
  expect(events).toBe(2);
});

// test('State can be cleaned up', async () => {
//   let counters = new Signal.List([new Signal.State(0)]);
//   for (let i = 0; i < 1000; i++) {
//     const value = counters.value;
//     counters = new Signal.List([...value, new Signal.State(0)]);
//   }
//   counters.disconnect();
//   await new Promise(res => setTimeout(res, 5000));
// });
