const { createPortfolio } = require("../portfolio");
const { createUniverse } = require("../universe");

const nasdaq = require("./nasdaq");

const testSnapshot = async () => {
  const universe = createUniverse({ provider: nasdaq });
  const portfolio = createPortfolio({ universe });

  portfolio.addInstrument({
    amount: 5,
    instrument: nasdaq.getTicker("AAPL"),
    time: new Date(),
  });

  const snapshot = await portfolio.getSnapshot();
  console.log("testSnapshot", snapshot);
};

testSnapshot().then(console).catch(console.log).finally(process.exit);
