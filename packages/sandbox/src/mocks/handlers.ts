import { http, delay, HttpResponse } from 'msw';
import { random } from '../lib/random.js';
import { getUsers } from './data/users.js';
import * as ParamOptions from './queryParamOptions.js';

const USERS = getUsers(ParamOptions.userCount);

export const handlers = [
  http.all('*', async () => {
    await delay(ParamOptions.userDelay);

    if (random({ threshold: ParamOptions.randomError })) {
      return HttpResponse.error();
    }
  }),

  // Intercept "GET https://example.com/user" requests...
  http.get('https://example.com/users', async () => {
    return HttpResponse.json(USERS);
  }),

  http.post('https://example.com/users/:id/activate', async ({ params }) => {
    const { id } = params;
    const user = USERS.find(i => i.id === id);

    if (user) {
      user.isActive = true;
    }

    return HttpResponse.json(user);
  }),

  http.post('https://example.com/users/:id/deactivate', async ({ params }) => {
    await delay(ParamOptions.userDelay);
    const { id } = params;
    const user = USERS.find(i => i.id === id);

    if (user) {
      user.isActive = false;
    }

    return HttpResponse.json(user);
  }),
]
