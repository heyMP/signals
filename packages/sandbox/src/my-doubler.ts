import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { asyncReplace } from 'lit/directives/async-replace.js'
import { Signal } from '@heymp/signals';

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('my-doubler')
export class MyDoubler extends LitElement {
  @state() private count?: Signal<number>;

  render() {
    console.log('render my-doubler');
    if (!this.count) { return }
    const count = this.count;
    return html`
      ${asyncReplace(count, () => count.value * 2)}
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'my-doubler': MyDoubler
  }
}
