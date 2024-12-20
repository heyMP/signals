import { State, SignalUpdatedEvent } from '@heymp/signals';
import { User } from '../types.js';
import { fetchWrapper } from '../lib/fetchWrapper.js';

export const userSignalStates = ['initial', 'updating', 'activating', 'deactivating', 'complete', 'error'] as const;

export type UserSignalState = typeof userSignalStates[number];

export class UserSignal extends State<User> {
  constructor(value: User) {
    super(value);
  }

  #state: UserSignalState = 'initial';

  error?: Error;

  get state() {
    return this.#state;
  }

  set state(state: UserSignalState) {
    const prev = this.#state;
    if (prev !== state) {
      this.#state = state;
      this.dispatchEvent(new SignalUpdatedEvent(prev, this.#state));
    }
  }

  async update(id: User['id']): Promise<User> {
    return fetch(`https://example.com/users/${id}`)
      .then(res => {
        if (!res.ok) {
          const error = new Error(`[getUser] status not ok: ${res.status}`);
          error.cause = res;
          throw error;
        }
        return res;
      })
      .then(res => res.json())
  }

  async activate() {
    this.state = 'activating';
    const { data, error } = await fetchWrapper<User>({
      url: `https://example.com/users/${this.value?.id}/activate`,
      options: { method: 'POST' }
    });

    if (error) {
      this.state = 'error';
      return { error };
    }

    this.value = {
      ...data
    };
    this.state = 'complete';

    return { data };
  }

  async deactivate() {
    this.state = 'deactivating';
    const { data, error } = await fetchWrapper<User>({
      url: `https://example.com/users/${this.value?.id}/deactivate`,
      options: { method: 'POST' }
    });

    if (error) {
      this.state = 'error';
      return { error };
    }

    this.value = {
      ...data
    };
    this.state = 'complete';

    return { data };
  }

  async toggleActivation() {
    if (this.value.isActive) {
      return this.deactivate();
    }
    return this.activate();
  }
}
