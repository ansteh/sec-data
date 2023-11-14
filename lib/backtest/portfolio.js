const Snapshot = require("./snapshot");

const createPortfolio = ({ universe }) => {
  const snapshots = [];
  const summaries = [];

  let instrumentByIds = {};

  const getSnapshot = async (time) => {
    const instruments = getInstruments();
    return Snapshot.snapshot(time, instruments, universe);
  };

  const getInstruments = () => {
    return Object.values(instrumentByIds);
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
      orders: [],
    };

    addOrder({
      amount: amount || 0,
      instrumentId: instrument.id,
      time: time || new Date(),
    });

    return instrumentByIds[instrument.id];
  };

  const addOrder = ({ amount, instrumentId, time }) => {
    const instrument = instrumentByIds[instrumentId];
    if (!instrument) {
      throw new Error("NOT_FOUND_INSTRUMENT");
    }

    const newOrder = { amount, time };
    const orders = instrument.orders;
    const latest = orders[0];

    if (!latest || latest.time.valueOf() <= time.valueOf()) {
      instrumentByIds[instrument.id].orders.push(newOrder);
      return instrument;
    }

    const timeValue = time.valueOf();
    const index = orders.findIndex((order) => {
      return order.time.valueOf() < timeValue;
    });

    orders.splice(index, 0, newOrder);

    return instrument;
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
