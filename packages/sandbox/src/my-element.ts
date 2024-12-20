import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { repeat } from 'lit/directives/repeat.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { watchSignal } from '@heymp/signals/lit';
import { match, P } from 'ts-pattern';
import { UsersSignal } from './services/users.js';
import { UserSignal } from './services/user.js';
import { initMocks } from './mocks/init.js';
import './elements/my-params-form.js';
import './elements/my-user.js';
import { State } from '@heymp/signals';

await initMocks();

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('my-element')
export class MyElement extends LitElement {
  @watchSignal
  users = new UsersSignal([]);

  @watchSignal
  searchFilter = new State<string>('');

  @watchSignal
  letterFilter = new State<string>('');

  @watchSignal
  statusFilter = new State<boolean | 'error' | 'all'>('all');

  private formRef = createRef<HTMLFormElement>();

  connectedCallback(): void {
    super.connectedCallback();
    this.users.update();
  }

  protected createRenderRoot() {
    return this;
  }

  render() {
    const content = match(this.users.state)
      .with('initial', () => this.renderLoadingState())
      .with('updating', () => this.renderLoadingState())
      .with('complete', () => this.renderDefaultState())
      .with('error', () => this.renderErrorState())
      .exhaustive()

    return html`
      <my-params-form></my-params-form>
      ${this.renderUserListForm()}
      <div class="user-list">
        <div>Service State: ${this.renderState()}</div>
        <div>Service Children State: ${this.renderChildStatus()}</div>
        <button @click=${this.refresh}>refresh</button>
        ${content}
      </div>
    `;
  }

  renderLoadingState() {
    return html`fetching users...`;
  }

  renderDefaultState() {
    const users = this.getFilteredUserList() ?? [];

    users.sort((a, b) => {
      return (a.value?.isActive === b.value?.isActive) ? 0 : a.value?.isActive ? -1 : 1;
    });

    return html`
      <div>(${users.length})</div>
      <ul>
        ${repeat(users, (user) => user.value.id, this.renderUserListItem)}
      </ul>
    `
  }

  renderErrorState() {
    return html`oops there was an error 🫠`;
  }

  renderUserListItem(user: UserSignal) {
    return html`<li><my-user .user=${user}></my-user></li>`
  }

  renderState() {
    return match(this.users.state)
      .with('error', () => html`🚨`)
      .with('complete', () => html`✅`)
      .otherwise(() => html`✨`)
  }

  renderChildStatus() {
    return match(this.users.childStates.value)
      .with(P.when(set => set.size === 0), () => html`🔌`)
      .with(P.when(set => set.has('error')), () => html`🚨`)
      .with(P.when(set =>
        (set.size === 1 || set.size === 2) &&
        Array.from(set).every(value => value === 'complete' || value === 'initial')
      ), () => html`✅`)
      .otherwise(() => html`✨`)
  }

  renderUserListForm() {
    return html`
      <details>
        <summary>Filter</summary>
        <form @input=${this.formUpdated} ${ref(this.formRef)}>
          <details open>
            <summary>Search filter</summary
            <label for="search-filter" name="search-filter">Filter</label>
            <input id="search-filter" name="search-filter" type="text" .value=${this.searchFilter.value}>
          </details>
          <details open>
            <summary for="letter-filter">Filter by starting letter of last name</summary>
            <input id="letter-filter-none" type="radio" value="" name="letter-filter" checked>
              <label for="letter-filter-none">none</label>
            </input>
            ${'abcdefghijklmnopqrstuvwxyz'.split('').map(letter => html`
              <input id="letter-filter-${letter}" type="radio" value=${letter} name="letter-filter">
                <label for="letter-filter-${letter}">${letter}</label>
              </input>
            `)}
          </details>
          <details open>
            <summary for="status-filter">Filter by user status</summary>
            <input id="status-filter-all" type="radio" value="all" name="status-filter" checked>
              <label for="status-filter-all">All</label>
            </input>
            <input id="status-filter-active" type="radio" value="true" name="status-filter">
              <label for="status-filter-active">Active</label>
            </input>
            <input id="status-filter-inactive" type="radio" value="false" name="status-filter">
              <label for="status-filter-inactive">Inactive</label>
            </input>
            <input id="status-filter-error" type="radio" value="error" name="status-filter">
              <label for="status-filter-error">Error</label>
            </input>
          </details>
        </form>
      </details>
    `;
  }


  formUpdated(e: Event) {
    e.preventDefault();

    if (!this.formRef.value) { return; }

    const formData = new FormData(this.formRef.value);

    this.letterFilter.value = formData.get('letter-filter') as typeof this.letterFilter.value;
    this.searchFilter.value = formData.get('search-filter') as typeof this.searchFilter.value;
    this.statusFilter.value = formData.get('status-filter') as typeof this.statusFilter.value;
  }

  getFilteredUserList() {
    const letter = this.letterFilter.value.toLowerCase();
    const search = this.searchFilter.value.toLowerCase();
    const status = this.statusFilter.value;

    return this.users.value?.filter(user => {
      if (!user.value.lastName.toLowerCase().startsWith(letter)) {
        return false;
      }

      if (!`${user.value.firstName}${user.value.lastName}`.toLowerCase().includes(search)) {
        return false;
      }

      if (status !== "all") {
        const userStatus = user.state === 'error' ? 'error' : user.value.isActive.toString();
        if (status !== userStatus) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Refresh the user list
   */
  public refresh() {
    this.users.update();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'my-element': MyElement
  }
}
