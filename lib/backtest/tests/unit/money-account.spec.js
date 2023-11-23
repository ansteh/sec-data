const { createCurrencyExchange } = require("../../exchange-rates");
const { createMoneyAccount } = require("../../money-account");

const mockMoneyAccount = (baseCurrency = "USD") => {
  const currencyExchange = createCurrencyExchange({
    baseCurrency,
  });

  const moneyAccount = createMoneyAccount({
    currencyExchange,
    baseCurrency: "USD",
  });

  return {
    currencyExchange,
    moneyAccount,
  };
};

describe("Money account:", function () {
  it("Get total amount of account by base currency", async function () {
    const { moneyAccount } = mockMoneyAccount();

    const totalAmount = await moneyAccount.getTotalAmount();

    expect(totalAmount.currency).toEqual("USD");
    expect(totalAmount.value).toEqual(0);
  });

  it("Get total amount (Base currency conversion)", async function () {
    const { moneyAccount } = mockMoneyAccount();

    await moneyAccount.moveMoney({ currency: "EUR", value: 85 });
    await moneyAccount.moveMoney({ currency: "USD", value: 100 });

    const totalAmount = await moneyAccount.getTotalAmount();

    expect(totalAmount.currency).toEqual("USD");
    expect(totalAmount.value).toEqual(200);
  });

  it("Get total amount (Foreign currency conversion)", async function () {
    const currency = "USD";
    const { moneyAccount } = mockMoneyAccount(currency);

    await moneyAccount.moveMoney({ currency, value: 50 });
    await moneyAccount.moveMoney({ currency, value: 50 });

    const totalAmount = await moneyAccount.getTotalAmount("EUR");

    expect(totalAmount.currency).toEqual("EUR");
    expect(totalAmount.value).toEqual(85);
  });

  it("Has enough balance returns false if the balance is bigger than total amount value", async function () {
    const currency = "USD";
    const { moneyAccount } = mockMoneyAccount(currency);

    const notEnoughBalanceResult = await moneyAccount.hasEnoughBalance({
      currency,
      value: 50,
    });

    expect(notEnoughBalanceResult).toEqual(false);
  });

  it("Has enough balance returns true if the balance is equal to total amount value", async function () {
    const { moneyAccount } = mockMoneyAccount();

    await moneyAccount.moveMoney({ currency: "USD", value: 50 });

    const enoughBalanceResult = await moneyAccount.hasEnoughBalance({
      currency: "USD",
      value: 50,
    });

    expect(enoughBalanceResult).toEqual(true);
  });

  it("Has enough balance returns true if the balance is equal to total amount value (by foreign currency conversion)", async function () {
    const { moneyAccount } = mockMoneyAccount();

    await moneyAccount.moveMoney({ currency: "USD", value: 100 });

    const enoughBalanceResult = await moneyAccount.hasEnoughBalance({
      currency: "EUR",
      value: 85,
    });

    expect(enoughBalanceResult).toEqual(true);
  });
});
