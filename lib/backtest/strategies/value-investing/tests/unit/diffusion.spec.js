const { createPortfolioProposal } = require("../../diffusion");

const getInstruments = () => {
  const time = new Date();

  const instruments = [
    {
      instrumentId: 1,
      currency: "USD",
      price: 10,
      date: time,
      score: 0.9,
    },
    {
      instrumentId: 2,
      currency: "USD",
      price: 20,
      date: time,
      score: 0.8,
    },
  ];

  return instruments;
};

describe("Portfolio structure proposal:", function () {
  it("Create portfolio porposals", async function () {
    const portfolioProposal = createPortfolioProposal({
      securities: getInstruments(),
      budget: 200,
      count: 20,
      smooth: true,
    });

    const [proposalA, proposalB] = portfolioProposal;

    expect(proposalA.amount).toBe(5);
    expect(proposalA.instrument.instrumentId).toBe(2);

    expect(proposalB.amount).toBe(10);
    expect(proposalB.instrument.instrumentId).toBe(1);
  });

  it("Make sure every stock is considered that is possible by budget", async function () {
    const portfolioProposal = createPortfolioProposal({
      securities: getInstruments(),
      budget: 30,
      count: 20,
      smooth: true,
    });

    const [proposalA, proposalB] = portfolioProposal;

    expect(proposalA.amount).toBe(1);
    expect(proposalA.instrument.instrumentId).toBe(2);

    expect(proposalB.amount).toBe(1);
    expect(proposalB.instrument.instrumentId).toBe(1);
  });

  it("Make sure every stock is considered that is below or equal by budget", async function () {
    const portfolioProposal = createPortfolioProposal({
      securities: getInstruments(),
      budget: 20,
      count: 20,
      smooth: true,
    });

    const [proposalA, proposalB] = portfolioProposal;

    expect(proposalA.amount).toBe(1);
    expect(proposalA.instrument.instrumentId).toBe(2);

    expect(proposalB.amount).toBe(0);
    expect(proposalB.instrument.instrumentId).toBe(1);
  });

  it("Smoothing works as expected", async function () {
    const portfolioProposal = createPortfolioProposal({
      securities: getInstruments(),
      budget: 31,
      count: 20,
      smooth: true,
    });

    const [proposalA, proposalB] = portfolioProposal;

    expect(proposalA.amount).toBe(1);
    expect(proposalA.instrument.instrumentId).toBe(2);

    expect(proposalB.amount).toBe(1);
    expect(proposalB.instrument.instrumentId).toBe(1);
  });
});
