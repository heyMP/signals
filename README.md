**IN DEVELOPMENT**

# @heymp/signals 🚦

Minimal signals like library built powerful browser features;
EventTarget and AsyncIterators.

## Usage example

```js
import { Signal } from '@heymp/signals';

const count = new Signal.State(0);
const isDone = new Signal.Computed(() => count.value > 3, [count]);

setInterval(() => {
  count.value++;
}, 1000)

for await (const value of isDone) {
  console.log('Counter is done:', value);
}
```

## EventTarget

Signals are based on the [EventTarget](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget)
interface. This means you can listen to the `update` event emitted from that signal.

```js
const count = new Signal.State(0);
count.addEventListener('update', () => {
  console.log('Count updated:', count.value);
});
```

## AsyncIterator

Signals also contain a [[Symbol.iterator]](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/iterator).
Async iterables are objects with a `[Symbol.asyncIterator]` method, which
returns an iterator who's `next()` method returns a Promise. This allows you
to use the `for await...of` syntax to listen to the signal.

NOTE: Using an async iterator in a `for await...of` loop will block the event loop
until the signal is done emitting values.

```js
const count = new Signal.State(0);
for await (const value of count) {
  console.log('Count updated:', value);
}
```


## Lit

The cool thing about using AsyncIterators is that frameworks can expose 
methods for re-rendering components when new values are yielded.

For instance, Lit exposes `asyncReplace` and `asyncAppend` directives
to easily render new values from an async iterable.

```js
import { LitElement, html } from 'lit'
import { asyncReplace } from 'lit/directives/async-replace.js'

export class MyElement extends LitElement {
  render() {
    return html`
      <button @click=${() => store.counter.value++}>
        count is ${asyncReplace(store.counter)}
      </button>
    `;
  }
}
```

## Signals Standard

There has been some awesome work done by Rob Eisenberg and library authors
to [propose Signals as a new TC39 standard](https://eisenbergeffect.medium.com/a-tc39-proposal-for-signals-f0bedd37a335). 
I highly recommend reading this article to learn more about this initiative.

## Should I use this library?

This is mostly a proof of concept but we do use this pattern for
some of our internal projects. There are known issues with EventTarget
if there are thousands of EventTarget instances.

I would recommend looking at the [Signal Polyfill](https://github.com/proposal-signals/proposal-signals/tree/main/packages/signal-polyfill)
as an alternative.
