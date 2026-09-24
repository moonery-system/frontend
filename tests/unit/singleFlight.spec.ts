import { createSingleFlight } from "@/utils/singleFlight";

function deferred() {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

// Lets the promise callbacks queued so far run.
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("createSingleFlight", () => {
  it("runs the task once for a single call", async () => {
    const task = jest.fn(async () => undefined);

    await createSingleFlight(task)();

    expect(task).toHaveBeenCalledTimes(1);
  });

  it("runs again for a call made after the previous one finished", async () => {
    const task = jest.fn(async () => undefined);
    const run = createSingleFlight(task);

    await run();
    await run();

    expect(task).toHaveBeenCalledTimes(2);
  });

  it("never runs two at once, and collapses calls made meanwhile into ONE more run", async () => {
    const gates = [deferred(), deferred(), deferred()];
    let started = 0;
    let running = 0;
    let maxRunning = 0;

    const task = jest.fn(async () => {
      running += 1;
      maxRunning = Math.max(maxRunning, running);
      const gate = gates[started++];
      await gate.promise;
      running -= 1;
    });
    const run = createSingleFlight(task);

    const first = run();
    await flush();
    expect(task).toHaveBeenCalledTimes(1);

    // Five pushes arrive while the first fetch is still in the air.
    run();
    run();
    run();
    run();
    run();
    await flush();
    expect(task).toHaveBeenCalledTimes(1);

    gates[0].resolve();
    await flush();

    // Exactly one repeat, not five.
    expect(task).toHaveBeenCalledTimes(2);

    gates[1].resolve();
    await first;

    expect(task).toHaveBeenCalledTimes(2);
    expect(maxRunning).toBe(1);
  });

  it("resolves the promise of a call made during a run only after the trailing run", async () => {
    const gates = [deferred(), deferred()];
    let started = 0;
    const task = jest.fn(async () => gates[started++].promise);
    const run = createSingleFlight(task);

    run();
    await flush();
    let lateSettled = false;
    run().then(() => {
      lateSettled = true;
    });

    gates[0].resolve();
    await flush();
    expect(lateSettled).toBe(false); // the repeat is still running

    gates[1].resolve();
    await flush();
    expect(lateSettled).toBe(true);
  });

  it("rejects when the task fails, drops the pending repeat and works again afterwards", async () => {
    const gate = deferred();
    const task = jest
      .fn<Promise<void>, []>()
      .mockImplementationOnce(() => gate.promise)
      .mockResolvedValue(undefined);
    const run = createSingleFlight(task);

    const failing = run();
    await flush();
    run(); // queues a repeat that must be dropped
    gate.reject(new Error("network down"));

    await expect(failing).rejects.toThrow("network down");
    expect(task).toHaveBeenCalledTimes(1);

    await run();
    expect(task).toHaveBeenCalledTimes(2);
  });
});
