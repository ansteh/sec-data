const { createInvestor } = require("./investor");

const createBacktest = ({ strategy, universe }) => {
  const investor = createInvestor({ strategy, universe });

  const simulate = async ({ delimiter, startTime, endTime }) => {
    if (!delimiter) {
      throw new Error("DELIMITER_IS_REQUIRED");
    }

    if (!startTime) {
      throw new Error("START_TIME_IS_REQUIRED");
    }

    if (!endTime) {
      throw new Error("END_TIME_IS_REQUIRED");
    }

    // investor.rebalance(time);

    return;
  };

  const next = async (time) => {
    return investor.rebalance(time);
  };

  const done = async () => {
    // return;
  };

  return {
    done,
    next,
    simulate,
  };
};

module.exports = {
  createBacktest,
};
