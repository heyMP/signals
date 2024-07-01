import type { State } from '../../index.js';
import {useEffect, useState} from 'react';

export function useSignal<T extends State<unknown>>(signal: T) {
  const [value, setValue] = useState(signal.value);

  useEffect(() => {
    watchSignal();
  }, []);

  async function watchSignal() {
    for await (const v of signal) {
      setValue(v);
    }
  }

  return [value as T extends State<infer U> ? U : never] as const;
}
