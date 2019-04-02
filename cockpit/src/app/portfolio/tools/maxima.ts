import * as _ from 'lodash';

export const Interior = (function() {

  function chain(iteratee) {
    return function(series) {
      var previous, value, result;
      var collection = _.map(series, function(data, index) {
        value = data;
        if(index === 0) {
          result = 0;
        } else {
          result = iteratee(value, previous);
        }
        previous = value;
        return result;
      });
      collection.shift();
      return collection;
    };
  };

  var dif = chain(function(a, b) {
    return a-b;
  });

  var sign = chain(function(a, b) {
    return Math.sign(a)-Math.sign(b);
  });

  var findAllExtrema = _.curry(function(diffs, series) {
    var min = _.min(series)-1;
    series.unshift(min);
    series.push(min);
    var difSign = sign(dif(series));
    return _.reduce(difSign, function(collector, value, index) {
      if(_.includes(diffs, value)) {
        collector.push(index);
      }
      return collector;
    }, []);
  });

  var findAllPeaksByCompare = function(series) {
    return _.reduce(series, function(indices, value, index) {
      if(index === 0) {
        if(index+1 < series.length && value > series[index+1]) {
          indices.push(index);
        }
      }
      if(index === series.length-1) {
        if(index-1 > -1 && value > series[index-1]) {
          indices.push(index);
        }
      }
      if(series[index-1] < value && value > series[index+1]) {
        indices.push(index);
      }
      return indices;
    }, []);
  };

  var findAllValleysByCompare = function(series) {
    return _.reduce(series, function(indices, value, index) {
      if(index === 0) {
        if(index+1 < series.length && value < series[index+1]) {
          indices.push(index);
        }
      }
      if(index === series.length-1) {
        if(index-1 > -1 && value < series[index-1]) {
          indices.push(index);
        }
      }
      if(series[index-1] > value && value < series[index+1]) {
        indices.push(index);
      }
      return indices;
    }, []);
  };

  return {
    findAllPeaks: findAllPeaksByCompare,
    findAllValleys: findAllValleysByCompare
    // findAllPeaks: findAllExtrema([-1, -2]),
    // findAllValleys: findAllExtrema([1, 2])
  };
}());

// console.log(Interior.findAllPeaks([2.3, 2, 2.5, 2.7, 2.4, 2, 1.7, 4, 3.9, 4, 3.5, 3.3, 4]));
// console.log(Interior.findAllValleys([2.3, 2,2.5,2.7,2.4,2,1.7,4,3.9,4,3.5,3.3,4]));
// console.log('Interior.findAllPeaks', Interior.findAllPeaks([1, 2, 1, 2, 1]));
// console.log('Interior.findAllPeaks', Interior.findAllValleys([1, 2, 1, 2, 1]));
