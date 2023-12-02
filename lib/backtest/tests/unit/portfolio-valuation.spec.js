const { createPortfolio } = require("../../portfolio");
const { createUniverse } = require("../../universe");
const { createPortfolioValuation } = require("../../portfolio-valuation");

const nasdaq = require("../nasdaq");

describe("Potfolio Valuation:", function () {
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

    const valuationGenerator = createPortfolioValuation({
      portfolio,
      universe,
    });

    const valuationSnapshot = await valuationGenerator.getSnapshot({
      baseCurrency: "USD",
      time: new Date(),
    });

    expect(valuationSnapshot.valuation.value).toEqual(150);
  });
});
