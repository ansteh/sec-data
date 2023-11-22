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

  it("Get total amount (Base currency conversion)", async function () {
    const currency = "USD";
    const currencyExchange = createCurrencyExchange({
      baseCurrency: currency,
    });

    const moneyAccount = createMoneyAccount({
      baseCurrency: currency,
      exchangeRatesService: currencyExchange,
    });

    await moneyAccount.moveMoney({ currency: "EUR", value: 85 });
    await moneyAccount.moveMoney({ currency: "USD", value: 100 });

    const totalAmount = await moneyAccount.getTotalAmount();

    expect(totalAmount.currency).toEqual("USD");
    expect(totalAmount.value).toEqual(200);
  });

  it("Get total amount (Foreign currency conversion)", async function () {
    const currency = "USD";
    const currencyExchange = createCurrencyExchange({
      baseCurrency: currency,
    });

    const moneyAccount = createMoneyAccount({
      baseCurrency: currency,
      exchangeRatesService: currencyExchange,
    });

    await moneyAccount.moveMoney({ currency, value: 50 });
    await moneyAccount.moveMoney({ currency, value: 50 });

    const totalAmount = await moneyAccount.getTotalAmount("EUR");

    expect(totalAmount.currency).toEqual("EUR");
    expect(totalAmount.value).toEqual(85);
  });
});
