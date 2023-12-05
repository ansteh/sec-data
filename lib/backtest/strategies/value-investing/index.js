const createScope = ({ universe }) => {
  const getOrderProposals = ({ snapshot, time }) => {
    console.log({ snapshot, time });
    return [];
  };

  return {
    getOrderProposals,
  };
};

module.exports = {
  createScope,
};
