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
 
export function timeline(dates: string[]) {
  dates = dates.slice(0);
  
  return (observable) => new Observable(function(observer) {
    let states = [];
    let waitinglist = [],
    
    const subscription = observable.subscribe({
      next(state) {
        const index = dates.indexOf(state.date);
        
        if(index === 0) {
          states.push(state);
          observer.next(states);
          states = [];
        } else {
          
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