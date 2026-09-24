import { humanizeStatus } from "@/utils/status";

describe("humanizeStatus", () => {
  it("turns a status name into readable words (also proves the @/ alias works)", () => {
    expect(humanizeStatus("client_address_not_found")).toBe(
      "Client address not found"
    );
  });
});
