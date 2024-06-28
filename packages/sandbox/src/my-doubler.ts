import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { State } from '@heymp/signals';
import { watchSignal } from '@heymp/signals/lit';

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('my-doubler')
export class MyDoubler extends LitElement {
  @watchSignal
  private count?: State<number>;

  render() {
    console.log('render');
    return html`
      ${this.count?.value}
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'my-doubler': MyDoubler
  }
}
