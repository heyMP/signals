import type { ReactiveElement } from 'lit';
import { WatchSignalController } from '../controllers/WatchSignalController.js';

export function watchSignal(...args: any[]): void {
  const [proto, key] = args;
    (proto.constructor as typeof ReactiveElement)
      .addInitializer(x => new WatchSignalController(x, key));
}
