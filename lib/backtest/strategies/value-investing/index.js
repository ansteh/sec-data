const { createScoring } = require("./scoring");

const createScope = ({ universe }) => {
  const scoring = createScoring({ universe });

  const getOrderProposals = async ({ money, snapshot, time }) => {
    const instruments = await scoring.getInstrumentsByScoreDescending({ time });

    console.log(
      "getOrderProposals",
      JSON.stringify({ money, snapshot, time }, null, 2)
    );

    return [];
  };

  const getScore = (instrument) => {
    return 1;
  };

  return {
    getOrderProposals,
  };
};

module.exports = {
  createScope,
};
