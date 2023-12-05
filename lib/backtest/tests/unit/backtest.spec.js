const { createBacktest } = require("../../backtest");
const { createUniverse } = require("../../universe");

const nasdaq = require("../nasdaq");
const valueInvesting = require("../../strategies/value-investing");

describe("Backtest:", function () {
  it("Initiate a backtesting session", async function () {
    const strategy = null;

    const universe = createUniverse({ provider: nasdaq });
    const backtest = createBacktest({ strategy, universe });

    expect(!!backtest).toBe(true);
  });

  it("Start a backtest", async function () {
    const universe = createUniverse({ provider: nasdaq });
    const strategy = valueInvesting.createScope({ universe });
    const backtest = createBacktest({ strategy, universe });

    await backtest.next(new Date());
  });
});
