import { Observable } from 'rxjs';

import * as _ from 'lodash';

export const getPointData = (snapshot) => {
  return {
    date: snapshot.date,
    rate: snapshot.audit.value,
    
    // entries: {
    //   portfolio: {
    //     ticker: 'portfolio',
    //     date: snapshot.date,
    //     rate: snapshot.audit.value,
    //   }
    // },
  };
};

export const getPerformance = (snapshots: any[]) => {
  const stocks = snapshots.reduce((stocks, snapshot) => {
    if(!snapshot.orders) return;
        
    snapshot.orders.orders.forEach((order) => {
      const performance = stocks[order.ticker] || {
        ticker: order.ticker,
        count: 0,
        invested: 0,
        payout: 0,
        fee: 0,
      };
      
      performance.count = order.count;

      if(order.change > 0) performance.invested += order.price * order.change;
      if(order.change < 0) performance.payout += order.price * -order.change;
      
      performance.fee += order.fee;
      performance.net = (performance.payout - performance.invested) + (performance.count * order.price);
      
      stocks[order.ticker] = performance;
    });
    
    return stocks;
  }, {});
  
  return {
    net: sumBy(stocks, 'net') - sumBy(stocks, 'fee'),
    invested: sumBy(stocks, 'invested'),
    payout: sumBy(stocks, 'payout'),
    fee: sumBy(stocks, 'fee'),

    stocks: _.orderBy(_.values(stocks), ['net'], ['desc']),
  };
};

const sumBy = (values, path) => {
  return _.sumBy(_.filter(values, path), path);
};

const TIMELINE_OPTIONS = {
  batched: true,
};

export function timeline(dates: string[], options = TIMELINE_OPTIONS) {
  console.log(dates);
  
  return (observable) => new Observable(function(observer) {
    dates = dates.slice(0);
    let states = dates.map(x => undefined);
    
    const tryNext = () => {
      const index = states.indexOf(undefined);
      // console.log('tryNext', states, index);
      
      if(index > 0) {
        nextAll(states.slice(0, index));
        states = states.slice(index);
        dates = dates.slice(index);
      } else if(index === -1 && states.length > 0) {
        nextAll(states);
        states = [];
        dates = [];
      }
    };
    
    const nextAll = (states) => {
      if(options.batched) {
        observer.next(states);
      } else {
        states.forEach(state => observer.next(state));
      }
    };
    
    const subscription = observable.subscribe({
      next(state) {
        if(state) {
          states[dates.indexOf(state.date)] = state;
          tryNext();
        }
      },
      error(err) {
        observer.error(err);
      },
      complete() {
        observer.complete();
      }
    });
    
    return function() {
      subscription.unsubscribe();
    };
  });
}

export function delay(delayInMillis) {
  return (observable) => new Observable(observer => {
    // this function will called each time this
    // Observable is subscribed to.
    const allTimerIDs = new Set();
    const subscription = observable.subscribe({
      next(value) {
        const timerID = setTimeout(() => {
          observer.next(value);
          allTimerIDs.delete(timerID);
        }, delayInMillis);
        allTimerIDs.add(timerID);
      },
      error(err) {
        observer.error(err);
      },
      complete() {
        observer.complete();
      }
    });
    // the return value is the teardown function,
    // which will be invoked when the new
    // Observable is unsubscribed from.
    return () => {
      subscription.unsubscribe();
      allTimerIDs.forEach(timerID => {
        clearTimeout(timerID);
      });
    }
  });
}

// // timeline example:
// import { from } from 'rxjs';
// import { mergeMap, map } from 'rxjs/operators';
// import * as _ from 'lodash';
// 
// const dates = ['1', '2', '3'];
// const candidates = _.shuffle(dates);
// console.log('candidates', candidates);
// 
// from(candidates)
//   .pipe(
//     map((date) => { return { date }; }),
//     timeline(dates, { batched: false })
//   )
//   .subscribe(console.log);