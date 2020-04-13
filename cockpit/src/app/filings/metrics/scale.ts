import * as _ from 'lodash';

const classify = (clauses, values) => {
  return _.map(values, (value) => {
    if(_.isNumber(value)) {
      const category = _.find(clauses, clause => clause.match ? clause.match(value) : true);

      if(category) {
        return Object.assign(_.clone(category.description), { value });
      }
    }

    return null;
  })
};

const assignStats = (context, scale) => {
  scale.stats = _
    .chain(scale.values)
    .filter()
    .reduce((stats, { label }) => {
      stats[label] = stats[label] || 0;
      stats[label] += 1;
      return stats;
    }, {})
    .value();

  const total = _.sum(_.values(scale.stats));
  _.forOwn(scale.stats, (value, key) => {
    scale.stats[key] = value/total;
  });

  const category = _.reduce(scale.clauses, (category, clause) => {
    const label = clause.description.label;
    const rate = scale.stats[label];

    if(rate && (!category || category.rate < rate)) {
      category = { label, rate };
    }

    return category;
  }, null);

  scale.category = _.get(category, 'label') || null;
  scale.score = context.getScore(scale.category);

  if(_.keys(scale.stats).length > 0) {
    scale.avgScore = 0;
    _.forOwn(scale.stats, (value, category) => {
      scale.avgScore += value * context.getScore(category);
    });
  } else {
    scale.avgScore = context.worstScore;
  }
};

export const report = (context, data, template) => {
  // console.log({ context, data, template });

  const scales = _.map(template, (scale) => {
    scale = _.cloneDeep(scale);

    const statement = _.get(data, scale.breadcrumbs);

    let values = _.get(statement, 'values') || [];
    values = context.applyFormula('prepare', scale, values);
    values = context.applyFormula('trend', scale, values);

    if(values && scale.clauses) {
      scale.clauses.forEach(context.assignMatch);
      scale.values = classify(scale.clauses, values);
    }

    assignStats(context, scale);

    return scale;
  });

  return Object.assign({ scales }, evaluate(context, scales));
};

export const summarize = (report) => {
  return _.map(report, (scale) => {
    return {
      category: scale.category,
      label: scale.description.label,
    };
  });
};

export const evaluate = (context, scales) => {
  const score = _
    .chain(scales)
    .map('score')
    .filter()
    .sum()
    .value();

  const scores = context.getScores();
  const minScore = getTotalScoreBy('min', scores, scales); // scales.length * context.worstScore;
  const maxScore = getTotalScoreBy('max', scores, scales);
  const avgScore = _.sumBy(scales, 'avgScore');

  return {
    original: {
      avg: avgScore,
      min: minScore,
      value: score,
      max: maxScore,
    },
    score: normalize({
      avg: avgScore,
      min: minScore,
      value: score,
      max: maxScore,
    }),
  };
};

const normalize = (score, factor = 100) => {
  const shift = -score.min || 0;
  const value = (score.value + shift) / (score.max + shift);
  const avg = (score.avg + shift) / (score.max + shift);

  return {
    avg: avg * factor,
    min: 0,
    value: value * factor,
    max: factor,
  };
};

const getTotalScoreBy = (func, scores, scales) => {
  return _
    .chain(scales)
    .map('clauses')
    .map(clauses => getScoreBy(func, scores, clauses))
    .sum()
    .value();
};

const getScoreBy = (func, scores, clauses) => {
  return _
    .chain(clauses)
    .map('description.label')
    .map(category => scores[category])
    .filter(_.isNumber)
    [func]()
    .value() || 0;
};
