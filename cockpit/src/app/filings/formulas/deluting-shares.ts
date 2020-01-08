import * as _ from 'lodash';

const dilute = ({ valuation, capital, equityRate, investment }) => {
  const capitalRate = capital/valuation;
  const dilutedEquityRate = equityRate * (1 - capitalRate);

  // console.log('equityRate', `${_.round(equityRate*100, 2)}%`);
  console.log('capitalRate', `${_.round(capitalRate*100, 2)}%`);
  console.log('current equityRate', `${_.round(equityRate*100, 2)}%`);
  console.log('');

  console.log('Without investment:');
  console.log('diluted equity rate', `${_.round(dilutedEquityRate*100, 2)}%`);
  console.log('');

  const investmentRate = investment/capital;
  const investmentEquityRate = investmentRate * capitalRate;
  const totalEquityRate = dilutedEquityRate + investmentEquityRate;

  console.log('With investment:');
  console.log('investmentRate', `${_.round(investmentRate*100, 2)}%`);
  console.log('investmentEquityRate', `${_.round(investmentEquityRate*100, 2)}%`);
  console.log('totalEquityRate', `${_.round(totalEquityRate*100, 2)}%`);
  console.log('');
};

dilute({
  valuation: 4000000,
  capital: 400000,
  equityRate: 0.08,
  investment: 20000,
});
