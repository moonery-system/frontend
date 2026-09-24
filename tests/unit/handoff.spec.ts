import { handoffLabel } from "@/utils/handoff";

describe("handoffLabel", () => {
  it.each([
    ["assistant_request", "Assistant asked for help", "attention"],
    ["provider_failure", "Assistant failed", "problem"],
    ["limit_exceeded", "Assistant limit reached", "problem"],
    ["user_rate_limit", "Assistant limit reached", "problem"],
    ["iterations_exceeded", "Assistant couldn't answer", "attention"],
    ["empty_response", "Assistant couldn't answer", "attention"],
    ["support_replied", "Answered by support", "neutral"],
  ])("explains %s", (reason, text, tone) => {
    expect(handoffLabel(reason)).toEqual({ text, tone });
  });

  it.each([[null], [undefined], [""], ["something_new"]])(
    "does not break on %p",
    (reason) => {
      expect(handoffLabel(reason)).toEqual({
        text: "Handed over",
        tone: "neutral",
      });
    }
  );

  it("never resolves an inherited object key as a reason", () => {
    expect(handoffLabel("constructor").text).toBe("Handed over");
    expect(handoffLabel("toString").text).toBe("Handed over");
  });
});
