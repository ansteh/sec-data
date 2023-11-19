const MathUtils = require("./math-utils");

const createPortfolioValuation = ({ portfolio }) => {
  const snapshots = [];

  const getSnapshot = async (time) => {
    const snapshot = await portfolio.getSnapshot(time);
    const valuation = valuate(snapshot);

    const state = {
      snapshot,
      time,
      valuation,
    };

    snapshots.push(state);

    return state;
  };

  const valuate = (snapshot) => {
    return {
      value: MathUtils.addAll(snapshot, "value"),
    };
  };

  return {
    getSnapshot,
  };
};

module.exports = {
  createPortfolioValuation,
};
