const { createCurrencyExchange } = require("../../exchange-rates");

describe("Exchange rate service:", function () {
  it("Convert 100 USD to EUR", async function () {
    const currencyExchange = createCurrencyExchange();

    const amount = await currencyExchange.convert({
      amount: 100,
      fromCurrencyCode: "USD",
      toCurrencyCode: "EUR",
    });

    expect(85).toEqual(amount);
  });

  it("Error is thrown when trying to access a currency code that does not exist", async function () {
    const currencyExchange = createCurrencyExchange();
    let catchedInvalidError = false;

    try {
      await currencyExchange.getExchangeRate("TEST");
    } catch (err) {
      catchedInvalidError = err?.message === "INVALID_CURRENCY_CODE";
    }

    expect(catchedInvalidError).toBe(true);
  });
});
