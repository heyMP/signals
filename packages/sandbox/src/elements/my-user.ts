import { watchSignal } from '@heymp/signals/lit';
import { LitElement,  html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { match, P } from 'ts-pattern';
import { UserSignal } from '../services/user.js';


/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('my-user')
export class MyUser extends LitElement {
  @watchSignal
  user?: UserSignal;

  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  render() {
    const name = `${this.user?.value?.firstName} ${this.user?.value?.lastName}`;
    const ariaLabel = this.user?.value.isActive ? 'Activate user' : 'Deactivate user';

    return html`
      <button aria-label=${ariaLabel} @click=${this.userClicked} ?disabled=${this.isDisabled()}>${name} ${this.renderIsIcon()}</button>
    `;
  }

  renderIsIcon() {
    const state = this.user?.state;
    const isActive = this.user?.value.isActive;
    return match([state, isActive])
      .with(['error', P._], () => '🚨')
      .with(['deactivating', P._], () => '😴')
      .with(['activating', P._], () => '😎')
      .with([P._, true], () => '😎')
      .with([P._, false], () => '😴')
      .otherwise(() => '🔌')
  }

  userClicked() {
    console.log('clicked')
    this.user?.toggleActivation();
  }

  isDisabled() {
    return match(this.user?.state)
      .with('activating', () => true)
      .with('deactivating', () => true)
      .with('updating', () => true)
      .otherwise(() => false)
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'my-user': MyUser
  }
}
