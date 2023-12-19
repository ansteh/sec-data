const { createPortfolioProposal } = require("../../diffusion");

describe("Portfolio structure proposal:", function () {
  it("Create portfolio porposals", async function () {
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

    const portfolioProposal = createPortfolioProposal({
      securities: instruments,
      budget: 200,
      count: 20,
      smooth: true,
    });

    console.log("portfolioProposal", portfolioProposal);
  });
});
