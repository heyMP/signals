import { LitElement, css, html } from 'lit'
import { customElement} from 'lit/decorators.js'
import { State, Computed } from '@heymp/signals';
import litLogo from './assets/lit.svg'
import viteLogo from '/vite.svg'
import { store } from './store';
import { watchSignal } from '@heymp/signals/lit';
import './my-doubler';
import './my-late-signal';
import './my-form';

// example of how we can interact with existing signals
store.counter.value = 1;

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('my-element')
export class MyElement extends LitElement {
  @watchSignal
  private isDone = store.isDone;

  @watchSignal
  private counter = store.counter;

  private nextValue = new Computed(() => store.counter.value + 1, [store.counter]);

  @watchSignal
  private myFormData = new State(new FormData());

  connectedCallback(): void {
    super.connectedCallback();
    setTimeout(() => {
      const el = this.shadowRoot?.querySelector('my-late-signal');
      el?.remove();
    }, 5000);
  }

  render() {
    console.log(Array.from(this.myFormData.value))
    return html`
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src=${viteLogo} class="logo" alt="Vite logo" />
        </a>
        <a href="https://lit.dev" target="_blank">
          <img src=${litLogo} class="logo lit" alt="Lit logo" />
        </a>
      </div>
      <slot></slot>
      <div class="card">
        ${this.renderCounter(this.isDone.value)}
        <div>
          Current doubled value: <my-doubler .count=${store.counter}></my-doubler>
        </div>
        <div>
          Future doubled value: <my-doubler .count=${this.nextValue}></my-doubler>
        </div>
      </div>
      <my-late-signal></my-late-signal>
      <my-form .formData=${this.myFormData}></my-form>
      <pre>${this.formatPreFormData(this.myFormData.value)}</pre>
    `
  }

  formatPreFormData(formData: FormData) {
    const output = [];
    for (const [key, value] of formData) {
      if (value instanceof File) {
        output.push([key, { name: value.name }]);
      }
      else {
        output.push([key, value]);
      }
    }
    return JSON.stringify(output);
  }

  renderCounter(isDone: boolean) {
    if (isDone) {
      return html`
        <h1>Counter is done!</h1>
        <p class="read-the-docs">
          Read the <a href="https://lit.dev" target="_blank">Lit documentation</a>
        </p>
      `
    }
    return html`
      <button @click=${() => this.counter.increment()} part="button">
        count is ${this.counter.value}
      </button>
    `
  }

  static styles = css`
    :host {
      max-width: 1280px;
      margin: 0 auto;
      padding: 2rem;
      text-align: center;
    }

    .logo {
      height: 6em;
      padding: 1.5em;
      will-change: filter;
      transition: filter 300ms;
    }
    .logo:hover {
      filter: drop-shadow(0 0 2em #646cffaa);
    }
    .logo.lit:hover {
      filter: drop-shadow(0 0 2em #325cffaa);
    }

    .card {
      padding: 2em;
    }

    .read-the-docs {
      color: #888;
    }

    ::slotted(h1) {
      font-size: 3.2em;
      line-height: 1.1;
    }

    a {
      font-weight: 500;
      color: #646cff;
      text-decoration: inherit;
    }
    a:hover {
      color: #535bf2;
    }

    button {
      border-radius: 8px;
      border: 1px solid transparent;
      padding: 0.6em 1.2em;
      font-size: 1em;
      font-weight: 500;
      font-family: inherit;
      background-color: #1a1a1a;
      cursor: pointer;
      transition: border-color 0.25s;
    }
    button:hover {
      border-color: #646cff;
    }
    button:focus,
    button:focus-visible {
      outline: 4px auto -webkit-focus-ring-color;
    }

    @media (prefers-color-scheme: light) {
      a:hover {
        color: #747bff;
      }
      button {
        background-color: #f9f9f9;
      }
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'my-element': MyElement
  }
}
