const { createScoring } = require("./scoring");
const { createPortfolioProposal } = require("./diffusion");

const createScope = ({ universe }) => {
  const scoring = createScoring({ universe });

  const getOrderProposals = async ({ money, snapshot, time }) => {
    const instruments = await scoring.getInstrumentsByScoreDescending({ time });

    const portfolioProposal = createPortfolioProposal({
      securities: instruments,
      budget: money.value,
      count: 20,
      smooth: true,
    });

    return portfolioProposal.map((proposal) => {
      return { ...proposal, time };
    });
  };

  return {
    getOrderProposals,
  };
};

module.exports = {
  createScope,
};
