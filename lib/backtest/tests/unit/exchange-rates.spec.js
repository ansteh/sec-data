const { createCurrencyExchange } = require("../../exchange-rates");

describe("Exchange rate service:", function () {
  it("Convert 100 USD to EUR", async function () {
    const currencyExchange = createCurrencyExchange({
      baseCurrency: "USD",
    });

    const amount = await currencyExchange.convert({
      amount: 100,
      fromCurrencyCode: "USD",
      toCurrencyCode: "EUR",
    });

    console.log("amount", amount);
    expect(85).toEqual(amount);
  });
});
