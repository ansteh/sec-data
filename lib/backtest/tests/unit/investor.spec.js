const { createInvestor } = require("../../investor");
const { createUniverse } = require("../../universe");

const nasdaq = require("../nasdaq");

describe("Investor trading:", function () {
  it("Investor can buy a random stock", async function () {
    const universe = createUniverse({ provider: nasdaq });
    const investor = createInvestor({ universe });
    const instrument = await nasdaq.getTicker("AAPL");

    await investor.deposit({
      currency: "EUR",
      value: 85,
    });

    await investor.trade({
      instrument,
      amount: 5,
      time: new Date(),
    });

    const totalAmount = await investor.getTotalAmountOfMoneyAccount("USD");

    expect(totalAmount.currency).toEqual("USD");
    expect(totalAmount.value).toEqual(50);
  });
});
