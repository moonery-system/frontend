/**
 * Wraps a "reload this" task so that it never runs twice at the same time.
 *
 * Calls that arrive while it is running are not lost and not multiplied: however many
 * there are, they collapse into ONE more run, started when the current one ends. That is
 * what a screen wants when several pushes arrive together -- the data has to be fetched
 * again after the last of them, once, not once per push.
 *
 * The returned promise resolves when the state as of the moment of the call has been
 * fetched. If the task throws, the promise rejects, any pending repeat is dropped, and the
 * next call starts fresh: a failure never wedges the queue.
 */
export function createSingleFlight(
  task: () => Promise<void>
): () => Promise<void> {
  let current: Promise<void> | null = null;
  let repeat = false;

  async function loop(): Promise<void> {
    do {
      repeat = false;
      await task();
    } while (repeat);
  }

  return function run(): Promise<void> {
    if (current) {
      repeat = true;
      return current;
    }

    current = loop().finally(() => {
      current = null;
      repeat = false;
    });

    return current;
  };
}
