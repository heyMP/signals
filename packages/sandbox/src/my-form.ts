import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { State } from '@heymp/signals';

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('my-form')
export class MyForm extends LitElement {
  formData = new State(new FormData());

  render() {
    return html`
      <form @change=${this.formChanged} @reset=${this.formReset}>
        <label for="email">Email</label>
        <input id="email" type="email" name="email">
        <label for="age">Age</label>
        <input id="age" type="number" name="age">
        <label for="picture">Picture</label>
        <input id="picture" type="file" name="picture" multiple>
        <input type="reset" value="Cancel">
      </form>
    `
  }

  formReset(e: Event) {
    if (e.type !== 'reset') return;
    this.formData.value = new FormData();
  }

  formChanged() {
    if (!this.formData) return;
    const form = this.shadowRoot?.querySelector('form');
    if (!form) return;
    this.formData.value = new FormData(form);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'my-form': MyForm
  }
}
