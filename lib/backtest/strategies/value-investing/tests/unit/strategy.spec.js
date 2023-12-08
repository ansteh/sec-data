const { createInvestor } = require("../../../../investor");
const { createUniverse } = require("../../../../universe");

const nasdaq = require("../../../../tests/nasdaq");
const valueInvesting = require("../../../value-investing");

describe("Value investing strategy:", function () {
  it("Start rebalance", async function () {
    const universe = createUniverse({ provider: nasdaq });
    const strategy = valueInvesting.createScope({ universe });
    const investor = createInvestor({ strategy, universe });

    await investor.deposit({
      currency: "USD",
      value: 150,
    });

    const instrument = await nasdaq.getTicker("AAPL");

    await investor.trade({
      instrument,
      amount: 5,
      time: new Date(),
    });

    const trades = await investor.rebalance(new Date());
    console.log("trades", trades);
  });
});
