const snapshot = async (time, instruments, universe) => {
  const quotes = await getQuotes(time, instruments, universe);
  return getQuotedInstruments(instruments, quotes);
};

const getQuotes = async (time, instruments, universe) => {
  const instrumentIds = instruments.map((instrument) => {
    return instrument.id;
  });

  return universe.getQuotes(instrumentIds, time);
};

const getQuotedInstruments = (instruments, quotes) => {
  return instruments.map((instrument) => {
    const quote = quotes[instrument.id];

    return {
      ...instrument,
      ...quote,
    };
  });
};

module.exports = {
  snapshot,
};
