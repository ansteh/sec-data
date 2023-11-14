const { createPortfolio } = require("../portfolio");
const { createUniverse } = require("../universe");

const nasdaq = require("./nasdaq");

const testSnapshot = async () => {
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
  console.log("testSnapshot", JSON.stringify(snapshot, null, 2));
};

testSnapshot().then(console).catch(console.log).finally(process.exit);
