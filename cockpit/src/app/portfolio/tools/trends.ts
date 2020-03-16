import * as _ from 'lodash';

import { Interior } from './maxima';

export const Trends = _.curry(function(getValue, series) {

  var values = _.map(series, getValue);

  var peakIndices = Interior.findAllPeaks(values);
  var peakValues = _.map(peakIndices, function(index) { return values[index]; });

  var valleyIndices = Interior.findAllValleys(values);
  var valleyValues = _.map(valleyIndices, function(index) { return values[index]; });

  var aggragetUpperTrends = function() {
    var trend = [], end = valleyIndices.length-1;
    return _.reduce(valleyIndices, function(trends, valleyIndex, index) {
      if(trend.length === 0) {
        trend.push(valleyIndex);
      } else {
        if(valleyValues[index] > values[_.last(trend)]) {
          trend.push(valleyIndex);
        } else {
          trends.push(trend);
          trend = [valleyIndex];
        }
      }

      if(index === end) {
        trends.push(trend);
      }

      return trends;
    }, []);
  };

  var aggragetDownTrends = function() {
    var trend = [], end = peakIndices.length-1;
    return _.reduce(peakIndices, function(trends, peakIndex, index) {
      if(trend.length === 0) {
        trend.push(peakIndex);
      } else {
        if(peakValues[index] < values[_.last(trend)]) {
          trend.push(peakIndex);
        } else {
          trends.push(trend);
          trend = [peakIndex];
        }
      }

      if(index === end) {
        trends.push(trend);
      }

      return trends;
    }, []);
  };

  function filter(trends) {
    return _.chain(trends)
      .filter(function(trend) {
        return trend.length > 1;
      })
      .map(function(trend) {
        return _.map(trend, function(index) {
          return series[index];
        });
      })
      .value();
  };

  var maxima: any = {
    peaks: {},
    valleys: {}
  };

  if(peakValues.length > 0) {
    maxima.peaks.max = series[peakIndices[_.indexOf(peakValues, _.max(peakValues))]];
    maxima.peaks.min = series[peakIndices[_.indexOf(peakValues, _.min(peakValues))]];
  }

  if(valleyValues.length > 0) {
    maxima.valleys.max = series[valleyIndices[_.indexOf(valleyValues, _.max(valleyValues))]];
    maxima.valleys.min = series[valleyIndices[_.indexOf(valleyValues, _.min(valleyValues))]];
  }

  return {
    peaks: _.map(peakIndices, function(index) { return series[index]; }),
    valleys: _.map(valleyIndices, function(index) { return series[index]; }),

    upper: filter(aggragetUpperTrends()),
    down: filter(aggragetDownTrends()),

    maxima: maxima,
  };

});

export const Paths = (series, getValue) => {
  let trend, previous, end = series.length-1;

  return series.reduce((trends, point, index) => {
    if(_.isUndefined(previous)) {
      trend = { values: [point]}
    } else {
      const value = getValue(point);
      const last = getValue(previous);

      if(value === last) {
        trend.values.push(point);
      }

      if(value > last) {
        // console.log('up', value, last, JSON.stringify(_.map(trend.values, 'y')));
        if(trend.type === 'up') {
          // console.log('add up', point.y);
          trend.values.push(point);
        } else if(trend.type === 'down') {
          trends.down.push(trend.values);
          trend = { type: 'up', values: [previous, point]};
        } else {
          trend.type = 'up';
          trend.values.push(point);
        }
        // console.log('up result', JSON.stringify(_.map(trend.values, 'y')));
      }

      if(value < last) {
        // console.log('down', value, last, JSON.stringify(_.map(trend.values, 'y')));
        if(trend.type === 'down') {
          // console.log('add down', point.y);
          trend.values.push(point);
        } else if(trend.type === 'up') {
          trends.upper.push(trend.values);
          trend = { type: 'down', values: [previous, point]};
        } else {
          trend.type = 'down';
          trend.values.push(point);
        }
        // console.log('down result', JSON.stringify(_.map(trend.values, 'y')));
      }

      if(end === index) {
        if(trend.type === 'up') {
          trends.upper.push(trend.values);
        }

        if(trend.type === 'down') {
          trends.down.push(trend.values);
        }
      }
    }

    previous = point;

    return trends;
  }, { upper: [], down: [] });
};
