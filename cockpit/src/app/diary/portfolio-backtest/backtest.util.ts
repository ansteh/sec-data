import { Observable } from 'rxjs';

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

const TIMELINE_OPTIONS = {
  batched: true,
};

export function timeline(dates: string[], options = TIMELINE_OPTIONS) {
  return (observable) => new Observable(function(observer) {
    dates = dates.slice(0);
    let states = dates.map(x => undefined);
    
    const tryNext = () => {
      const index = states.indexOf(undefined);
      
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
        states[dates.indexOf(state.date)] = state;
        tryNext();
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

// timeline example:
import { from } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';
import * as _ from 'lodash';

const dates = ['1', '2', '3'];
const candidates = _.shuffle(dates);
console.log('candidates', candidates);

from(candidates)
  .pipe(
    map((date) => { return { date }; }),
    timeline(dates, { batched: false })
  )
  .subscribe(console.log);