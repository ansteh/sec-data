const { createUniverse } = require("../../../../universe");

const nasdaq = require("../../../../tests/nasdaq");
const valueInvesting = require("../../../value-investing");

describe("Value investing strategy:", function () {
  it("Start rebalance", async function () {
    const universe = createUniverse({ provider: nasdaq });
    const strategy = valueInvesting.createScope({ universe });

    throw new Error("TODO");
  });
});
