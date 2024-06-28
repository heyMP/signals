import type { ReactiveController, ReactiveElement } from 'lit';

export const watchSignalController = Symbol('watch signal controller');

function hasAsyncIterator<T>(obj: any): obj is AsyncIterable<T> {
  return Symbol.asyncIterator in obj;
}

/** This controller holds a cache of observed property values which were set before the element updated */
export class WatchSignalController implements ReactiveController {
  private static hosts: WeakMap<HTMLElement, WatchSignalController> = new WeakMap();
  private startUpdating = false;

  constructor(private host: ReactiveElement, private key: string & keyof typeof host) {
    if (WatchSignalController.hosts.get(host)) {
      return WatchSignalController.hosts.get(host) as WatchSignalController;
    }
    host.addController(this);
  }

  /** Once the element has updated, we no longer need this controller, so we remove it */
  hostUpdated() {
    this.host.removeController(this);
    this.watchSignal();
  }

  async watchSignal() {
    const signal = this.host[this.key];
    if (!hasAsyncIterator(signal)) {
      console.warn(`Property ${this.key} does not contain a Symbol.asyncIterator.`)
      return;
    }
    for await (const _ of signal) {
      if (!this.startUpdating) {
        this.startUpdating = true;
        // wait for the next result
        continue;
      }
      this.host.requestUpdate();
    }
  }
}
