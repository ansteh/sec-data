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

const evaluate = (scale) => {
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
};

export const report = (context, data, template) => {
  console.log({ context, data, template });

  return _.map(template, (scale) => {
    scale = _.cloneDeep(scale);

    const statement = _.get(data, scale.breadcrumbs);

    let values = _.get(statement, 'values') || [];
    values = context.applyFormula('prepare', scale, values);
    values = context.applyFormula('trend', scale, values);

    if(values && scale.clauses) {
      scale.clauses.forEach(context.assignMatch);
      scale.values = classify(scale.clauses, values);
    }

    evaluate(scale);

    return scale;
  });
};

export const summarize = (report) => {
  return _.map(report, (scale) => {
    return {
      category: scale.category,
      label: scale.description.label,
    };
  });
};
