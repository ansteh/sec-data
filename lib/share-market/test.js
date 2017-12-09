const getMargin = (value, price) => {
  return (value - price)/value;
};

const growthRates = (collection) => {
  return _.reduce(collection, (rates, value, index) => {
    if(index > 0) {
      let previous = collection[index-1];
      rates.push(value/previous - 1);
    }
    return rates;
  }, []);
};

// console.log(getMargin(20, 10));
// console.log(getMargin(10, 20));

console.log(getMargin(-20, 10));
// console.log(getMargin(10, 20));
