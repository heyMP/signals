# @heymp/signals

## 0.1.1

### Patch Changes

- 163dc33: State stream async generator now returns correct type.

  Previously, when trying to use the an async iteratable
  in a `for await` loop, the value would be typed as `unknown`.
  It is now correctly typed with the typing of the State generic.

  ```ts
  const count = new State(0);

  for await (const value of count) {
    value;
    // ^? const value:number
  }
  ```

## 0.1.0

### Minor Changes

- fe3d8b5: Initial release
