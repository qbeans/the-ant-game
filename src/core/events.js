// The core reports things worth telling the player (achievements, expedition returns...) as events.
// The UI drains them after each update; the core never touches the DOM.

const queue = [];

export function emit(event) {
  queue.push(event);
}

/** Removes and returns all pending events. */
export function drainEvents() {
  return queue.splice(0, queue.length);
}
