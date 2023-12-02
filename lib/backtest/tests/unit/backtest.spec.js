const { createBacktest } = require("../../backtest");
const { createUniverse } = require("../../universe");

const nasdaq = require("../nasdaq");

describe("Backtest:", function () {
  it("Initiate a backtesting session", async function () {
    const strategy = null;

    const universe = createUniverse({ provider: nasdaq });
    const backtest = createBacktest({ strategy, universe });

    expect(!!backtest).toBe(true);
  });
});
