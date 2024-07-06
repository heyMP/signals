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
@customElement('my-late-signal')
export class MyLateSignal extends LitElement {
  @watchSignal
  private count?: State<number>;

  private interval?: NodeJS.Timeout;

  connectedCallback(): void {
    super.connectedCallback();
    this.count = new State(0);
    setTimeout(() => {
      // @ts-ignore
      this.interval = setInterval(() => this.count.value++, 1000);
    }, 1000);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    clearInterval(this.interval);
  }

  render() {
    return html`
      ${this.count?.value}
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'my-late-signal': MyLateSignal
  }
}
