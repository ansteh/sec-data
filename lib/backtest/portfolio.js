const MathUtils = require("./math-utils");

const createPortfolio = ({ moneyAccount, universe }) => {
  let instrumentByIds = {};

  const getSnapshot = async (time) => {
    const quotes = await getQuotes(time);

    return getInstruments().reduce((snapshot, instrument) => {
      const amount = instrument.amount;
      const quote = quotes[instrument.id];

      snapshot.push({
        amount,
        quote,
        instrumentId: instrument.id,
        value: MathUtils.mul(quote.price, amount),
      });

      return snapshot;
    }, []);
  };

  const getQuotes = async (time) => {
    const instrumentIds = getInstrumentIds();
    return universe.getQuotes(instrumentIds, time);
  };

  const getInstruments = () => {
    return Object.values(instrumentByIds);
  };

  const getInstrumentIds = () => {
    return Object.keys(instrumentByIds);
  };

  const setInstruments = (instruments = []) => {
    instrumentByIds = {};

    instruments.forEach((instrument) => {
      instrumentByIds[instrument.id] = instrument;
    });
  };

  const addInstrument = ({ instrument, amount, time }) => {
    instrumentByIds[instrument.id] = instrumentByIds[instrument.id] || {
      ...instrument,
      amount: 0,
      orders: [],
    };

    commitOrder({
      amount: amount || 0,
      instrumentId: instrument.id,
      time: time || new Date(),
    });

    return instrumentByIds[instrument.id];
  };

  const commitOrder = ({ amount, instrumentId, time }) => {
    const instrument = instrumentByIds[instrumentId];
    if (!instrument) {
      throw new Error("NOT_FOUND_INSTRUMENT");
    }

    const newOrder = { amount, time };
    const orders = instrument.orders;
    const latest = orders[0];

    if (!latest || latest.time.valueOf() <= time.valueOf()) {
      instrumentByIds[instrument.id].orders.push(newOrder);
      if (amount) {
        updateInstrumentAmount(instrument, amount);
      }

      return instrument;
    }

    const timeValue = time.valueOf();
    const index = orders.findIndex((order) => {
      return order.time.valueOf() < timeValue;
    });

    orders.splice(index, 0, newOrder);

    if (amount) {
      updateInstrumentAmount(instrument, amount);
    }

    return instrument;
  };

  const updateInstrumentAmount = (instrument, changeAmount) => {
    instrument.amount = MathUtils.add(instrument.amount, changeAmount);
  };

  return {
    addInstrument,
    getInstruments,
    getSnapshot,
    setInstruments,
  };
};

module.exports = {
  createPortfolio,
};
