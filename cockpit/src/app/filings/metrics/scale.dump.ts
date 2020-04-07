import * as _ from 'lodash';

const assignScale = (data, path, scale, report) => {
  _.set(report, path, createStatement(data, path, scale));
};

const createStatement = (data, path, scale) => {
  const source = _.get(data, path);
  const values = classify(scale.clauses, source.values);

  return Object.assign(_.clone(scale.description), { values });
};

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

// export const report = (data, template) => {
//   return traverse(data, [], template);
// };

export const report = (context, data, template) => {
  console.log({ context, data, template });
  // return traverse(scope, data, template);
};

// const SCALES = {
//   margins: {
//     incomeStatement: {
//       grossProfit: {
//         description: {
//           label: 'Gross Profit',
//         },
//         clauses: [{
//           match: x => x >= 0.4,
//           description: {
//             label: 'tend to be durable',
//           },
//         }, {
//           match: x => x >= 0.2,
//           description: {
//             label: 'highly competitive industry',
//             tag: ['durable exceptions'],
//           },
//         }, {
//           description: {
//             label: 'fiercly competitive industry',
//             tag: ['no sustainable competitive advantage'],
//           },
//         }],
//       },
//       sellingGeneralAndAdministrativeExpense: {
//         description: {
//           label: 'SGA (% Gross Profit)',
//         },
//         clauses: [{
//           match: x => x <= 0.3,
//           description: {
//             label: 'durable',
//           },
//         }, {
//           match: x => x <= 0.8,
//           description: {
//             label: 'durable exceptions',
//           },
//         }, {
//           description: {
//             label: 'fiercly competitive industry',
//             tag: ['no sustainable competitive advantage'],
//           },
//         }],
//       },
//       researchAndDevelopment: {
//         description: {
//           label: 'Research and Development (% Gross Profit)',
//         },
//         clauses: [{
//           match: x => x <= 0.15,
//           description: {
//             label: 'tend to be durable',
//           },
//         }, {
//           description: {
//             label: 'medicore',
//             tag: ['highly competitive capital-intensive business'],
//           },
//         }],
//       },
//       depreciationAndAmortization: {
//         description: {
//           label: 'Depreciation & Amortization (% Gross Profit)',
//         },
//         clauses: [{
//           match: x => x <= 0.1,
//           description: {
//             label: 'tend to be durable',
//           },
//         }, {
//           description: {
//             label: 'medicore',
//             tag: ['highly competitive capital-intensive business'],
//           },
//         }],
//       },
//       interestExpense: {
//         description: {
//           label: 'Interest Expense (% Operating Income)',
//         },
//         clauses: [{
//           match: x => x <= 0,
//           description: {
//             label: 'durable',
//             tag: ['earns interest'],
//           },
//         }, {
//           match: x => x <= 0.15,
//           description: {
//             label: 'tend to be durable',
//           },
//         }, {
//           description: {
//             label: 'medicore',
//             tag: ['highly competitive capital-intensive business', 'exceptions (bank)'],
//           },
//         }],
//       },
//       netIncome: {
//         description: {
//           label: 'Net Income (% Revenue)',
//         },
//         clauses: [{
//           match: x => x >= 0.2,
//           description: {
//             label: 'durable',
//           },
//         }, {
//           match: x => x >= 0.1,
//           description: {
//             label: 'tend to be durable',
//             tag: ['search nugggets'],
//           },
//         }, {
//           description: {
//             label: 'tend to be medicore',
//             tag: ['highly competitive industry'],
//           },
//         }],
//       },
//     },
//   },
// };
