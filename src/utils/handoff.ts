/**
 * How support sees why the assistant stopped. The reasons are the ones the backend
 * records in conversations.handoff_reason.
 *
 *  - attention: somebody asked for a person, or the assistant could not help;
 *  - problem: something broke on our side;
 *  - neutral: a person already took over.
 *
 * The tone is what the badge colours from, but the text always says it too, so the colour
 * is never the only carrier of the meaning.
 */
export type HandoffTone = "attention" | "problem" | "neutral";

export interface HandoffLabel {
  text: string;
  tone: HandoffTone;
}

const LABELS: Record<string, HandoffLabel> = {
  assistant_request: { text: "Assistant asked for help", tone: "attention" },
  provider_failure: { text: "Assistant failed", tone: "problem" },
  limit_exceeded: { text: "Assistant limit reached", tone: "problem" },
  user_rate_limit: { text: "Assistant limit reached", tone: "problem" },
  iterations_exceeded: { text: "Assistant couldn't answer", tone: "attention" },
  empty_response: { text: "Assistant couldn't answer", tone: "attention" },
  support_replied: { text: "Answered by support", tone: "neutral" },
};

const UNKNOWN: HandoffLabel = { text: "Handed over", tone: "neutral" };

export function handoffLabel(reason: string | null | undefined): HandoffLabel {
  // Own keys only: a plain object also answers to "constructor", "toString"...
  const known = reason && Object.prototype.hasOwnProperty.call(LABELS, reason);

  return known ? LABELS[reason as string] : UNKNOWN;
}
