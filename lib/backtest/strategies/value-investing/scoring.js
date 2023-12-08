const createScoring = ({ universe }) => {
  const getInstrumentsByScoreDescending = async ({ max, time }) => {
    const instruments = await universe.getInstruments(time);
    return [];
  };

  return {
    getInstrumentsByScoreDescending,
  };
};

module.exports = {
  createScoring,
};
