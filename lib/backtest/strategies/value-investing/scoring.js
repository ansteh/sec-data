const createScoring = ({ universe }) => {
  const getInstrumentsByScoreDescending = async ({ max, time }) => {
    const instrumentsByIds = await universe.getInstruments(undefined, time);
    const instruments = Object.values(instrumentsByIds);
    const scoredInstruments = scoreAll(instruments);

    if (max) {
      return scoredInstruments.slice(0, max);
    }

    return scoredInstruments;
  };

  const scoreAll = (instruments) => {
    return instruments.map((instrument) => {
      return {
        ...instrument,
        id: instrument.instrumentId,
        score: score(instrument),
      };
    });
  };

  const score = (instrument) => {
    return 1;
  };

  return {
    getInstrumentsByScoreDescending,
  };
};

module.exports = {
  createScoring,
};
