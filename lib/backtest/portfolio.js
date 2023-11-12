const Snapshot = require("./snapshot");

const createPortfolio = ({ universe }) => {
  const snapshots = [];
  const summaries = [];

  let instruments = [];

  const getSnapshot = async (time) => {
    return Snapshot.snapshot(time, instruments, universe);
  };

  const getInstruments = () => {
    return instruments;
  };

  const setInstruments = (newInstruments) => {
    instruments = newInstruments;
  };

  const addInstrument = ({ instrument, amount, time }) => {
    return undefined;
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
