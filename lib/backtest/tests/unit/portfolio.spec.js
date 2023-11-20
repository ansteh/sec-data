const { createPortfolio } = require("../../portfolio");
const { createUniverse } = require("../../universe");

const nasdaq = require("../nasdaq");

describe("Potfolio:", function () {
  it("Get portfolio snapshot for specific time", async function () {
    const universe = createUniverse({ provider: nasdaq });
    const portfolio = createPortfolio({ universe });

    portfolio.addInstrument({
      amount: 5,
      instrument: await nasdaq.getTicker("AAPL"),
      time: new Date(),
    });

    portfolio.addInstrument({
      amount: 10,
      instrument: await nasdaq.getTicker("AAPL"),
      time: new Date(new Date().valueOf() - 100000),
    });

    const snapshot = await portfolio.getSnapshot();
    const instrumentSnapshot = snapshot[0];
    expect(instrumentSnapshot.value).toEqual(150);
  });
});
