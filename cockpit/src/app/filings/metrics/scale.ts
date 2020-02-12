import * as _ from 'lodash';

const SCALES = {
  margins: {
    incomeStatement: {
      grossProfit: {
        description: {
          label: 'Gross Profit',
        },
        clauses: [{
          match: x => x >= 0.8,
          description: {
            label: 'durable',
          },
        }, {
          match: x => x >= 0.2,
          description: {
            label: 'possibly durable',
          },
        }, {
          description: {
            label: 'highly competitive',
          },
        }],
      },
    },
  },
};

const assignScale = (data, path, scale, report) => {
  _.set(report, path, createStatement(data, path, scale));
};

const createStatement = (data, path, scale) => {
  const source = _.get(data, path);
  const values = classify(scale.clauses, source.values);

  return Object.assign(_.clone(scale.description), { values });
};

export const classify = (clauses, values) => {
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

const traverse = (data, path, node, report = {}) => {
  if(node.clauses) {
    assignScale(data, path, node, report);
  } else {
    _.forOwn(node, (child, section) => {
      const target = path.slice(0);
      target.push(section);
      traverse(data, target, child, report);
    });
  }

  return report;
};

export const report = (data) => {
  return traverse(data, [], SCALES);
};
