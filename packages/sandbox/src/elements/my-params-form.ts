import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { State } from '@heymp/signals';

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('my-params-form')
export class MyParamsForm extends LitElement {
  formData = new State(new FormData());

  constructor() {
    super();
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.init();
  }

  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  render() {
    return html`
      <details>
        <summary>Mocks</summary>
        <form @change=${this.formChanged} @reset=${this.formReset}>
          <div>
            <label for="mocks">Enable Mocks</label>
            <input id="mocks" type="checkbox" name="mocks" .checked=${this.formData.value.has('mocks')}>
          </div>
          <div>
            <label for="delay">Delay</label>
            <input id="delay" type="checkbox" name="delay" .checked=${this.formData.value.has('delay')}>
          </div>
          <div>
            <label for="random-error">Random Error</label>
            <input id="random-error" type="checkbox" name="random-error" .checked=${this.formData.value.has('random-error')}>
          </div>
          <div>
            <label for="users">Custom Users Amount</label>
            <input id="users" type="checkbox" name="users" .checked=${this.formData.value.has('users')}>
          </div>
          <fieldset ?hidden=${!this.formData.value.has('users')}>
            <div>
              <label for="users-count">Users Count</label>
              <input id="users-count" type="number" name="users-count" .value=${this.formData.value.get('users-count')} placeholder="10">
            </div>
          </fieldset>
        </form>
      </details>
    `
  }

  init() {
    for (const [key, value] of Array.from(this.getUrlParams())) {
      this.formData.value.set(key, value);
    }
  }

  formReset(e: Event) {
    if (e.type !== 'reset') return;
    this.formData.value = new FormData();
  }

  formChanged() {
    if (!this.formData) return;
    const form = this.renderRoot?.querySelector('form');
    console.log(form);
    if (!form) return;
    this.formData.value = new FormData(form);
    console.log([...this.formData.value])
    this.syncToURL();
  }

  syncToURL() {
    const params = new URLSearchParams();
    for (const [key, value] of Array.from(this.formData.value)) {
      if (key === 'users-count') {
        if (this.formData.value.has('users')) {
          params.set(key, value.toString())
        }
      }
      else {
        params.set(key, value.toString());
      }
    }
    window.location.search = params.toString();
  }

  getUrlParams() {
    return new URLSearchParams(window.location.search);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'my-params-form': MyParamsForm
  }
}
