// declare function getEventListeners(node: HTMLElement): {
//   [K in keyof HTMLElementEventMap]?: Array<{
//     listener: () => void;
//     once: boolean;
//     passive: boolean;
//     type: K;
//     useCapture: boolean;
//   }>;
// };

// export default getEventListeners;

type EventListeners = {
  [K in keyof ElementEventMap]?: Set<{
    type: string;
    listener: (this: Element, ev: ElementEventMap[K]) => any;
    options?: boolean | AddEventListenerOptions;
  }>;
};

declare global {
  interface Element {
    _addEventListener: Element['addEventListener'];
    _removeEventListener: Element['removeEventListener'];
    getEventListeners<K extends keyof ElementEventMap>(
      type?: K
    ): EventListeners | EventListeners[keyof EventListeners];
    // TODO change impl to use Map
    eventListeners: EventListeners;
  }
}

Element.prototype._addEventListener = Element.prototype.addEventListener;
Element.prototype._removeEventListener = Element.prototype.removeEventListener;

Element.prototype.addEventListener = function <K extends keyof ElementEventMap>(
  type: K,
  listener: (this: Element, ev: ElementEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions
) {
  this._addEventListener(type, listener, options);
  this.eventListeners ||= {};
  this.eventListeners[type] ||= new Set();

  this.eventListeners[type]?.add({ type, listener, options });
};

Element.prototype.removeEventListener = function <
  K extends keyof ElementEventMap
>(
  type: K,
  listener: (this: Element, ev: ElementEventMap[K]) => any,
  options?: boolean | EventListenerOptions
) {
  this._removeEventListener(type, listener, options);

  this.eventListeners ||= {};
  this.eventListeners[type] ||= new Set();

  this.eventListeners[type]?.forEach(eventListener => {
    if (eventListener.listener === listener) {
      this.eventListeners[type]?.delete(eventListener);
    }
  });

  if (this.eventListeners[type]?.size === 0) {
    delete this.eventListeners[type];
  }
};

Element.prototype.getEventListeners = function (type) {
  this.eventListeners ||= {};

  if (!type) return this.eventListeners;

  this.eventListeners[type] ||= new Set();
  return this.eventListeners[type];
};

export {};
