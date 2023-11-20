const { createCurrencyExchange } = require("../../exchange-rates");
const { createMoneyAccount } = require("../../money-account");

describe("Money account:", function () {
  it("Get total amount of account by base currency", async function () {
    const currencyExchange = createCurrencyExchange({
      baseCurrency: "USD",
    });

    const moneyAccount = createMoneyAccount({
      baseCurrency: "USD",
      exchangeRatesService: currencyExchange,
    });

    const totalAmount = await moneyAccount.getTotalAmount();

    expect(totalAmount.currency).toEqual("USD");
    expect(totalAmount.value).toEqual(0);
  });
});
