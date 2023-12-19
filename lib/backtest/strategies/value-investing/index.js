const { createScoring } = require("./scoring");

const createScope = ({ universe }) => {
  const scoring = createScoring({ universe });

  const getOrderProposals = async ({ money, snapshot, time }) => {
    const instruments = await scoring.getInstrumentsByScoreDescending({ time });

    console.log(
      "getOrderProposals",
      JSON.stringify({ money, snapshot, time }, null, 2)
    );

    console.log("instruments", JSON.stringify(instruments, null, 2));

    const proposal = { amount, instrument, time };

    return [];
  };

  return {
    getOrderProposals,
  };
};

module.exports = {
  createScope,
};
