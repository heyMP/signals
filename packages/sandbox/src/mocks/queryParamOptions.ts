const params = new URLSearchParams(window.location.search);

export const userDelay = params.has('delay')
  ? params.get('delay') !== 'on'
    ? Number(params.get('delay'))
    // undefined will result in a random
    // amount of delay lengths
    : undefined
  : 0;

export const userCount = params.has('users-count')
  ? params.get('users-count') !== ''
    ? Number(params.get('users-count'))
    : 10
  : 10;

export const randomError = params.has('random-error')
  ? params.get('random-error') !== 'on'
    ? Number(params.get('random-error'))
    : .8
  : 1;
