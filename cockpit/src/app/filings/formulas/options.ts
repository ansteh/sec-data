export const evaluate = ({ option, quote }) => {
  const state = Object.assign({}, option, quote);

  if(option.type === 'CALL') {
    const value = quote.price - option.strike;
    state.intrinsicValue = Math.max(value, 0);
    state.status = value > 0 ? 'ITM' : 'OTM';
  }

  if(option.type === 'PUT') {
    const value = option.strike - quote.price;
    state.intrinsicValue = Math.max(value, 0);
    state.status = value > 0 ? 'ITM' : 'OTM';
  }

  if(option.premium) {
    state.premium = option.premium;
    state.timeValue = option.premium - state.intrinsicValue;
  } else if(option.timeValue) {
    state.premium = option.timeValue + state.intrinsicValue;
    state.timeValue = option.timeValue;
  }

  if(typeof state.premium === 'number') {
    state.profit = state.intrinsicValue - state.premium;
    state.percentage = state.profit/state.premium;
  }

  return state;
};

export const createTable = (start, end, step = 5, stockPrice = 100) => {
  const quote = { price: stockPrice };

  return span(start, end, step).map((strike) => {
    return {
      strike,
      call: evaluate({ option: { type: 'CALL', strike }, quote }),
      put: evaluate({ option: { type: 'PUT', strike }, quote }),
    };
  });
};

const span = (start, end, step) => {
  const items = [];
  let current = start;

  do {
    items.push(current);
    current += step;
  } while(current <= end);

  return items;
};

export const createProfitTable = ({ start, end, step, strike, premium }: any) => {
  step = step || 5;

  return span(start, end, step).map((price) => {
    return evaluate({ option: { type: 'CALL', strike, premium }, quote: { price } });
  });
};

export const test = () => {
  const quote = { price: 100 };

  console.log(evaluate({ option: { type: 'CALL', strike: 85 }, quote }));
  console.log(evaluate({ option: { type: 'PUT', strike: 85 }, quote }));

  console.log(createTable(85, 110));

  console.log(evaluate({ option: { type: 'CALL', strike: 85, premium: 16 }, quote }));
  console.log(evaluate({ option: { type: 'CALL', strike: 45, premium: 10 }, quote: { price: 62 } }));

  console.log(createProfitTable({
    start: 50,
    end: 70,
    strike: 45,
    premium: 10,
  }));

  console.log(createProfitTable({
    start: 50,
    end: 70,
    strike: 60,
    premium: 1,
  }));
};
