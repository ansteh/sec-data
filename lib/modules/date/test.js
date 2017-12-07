const { treefy, getNearest } = require('./index.js');

const series = require('./historical-price.json');

const tree = treefy(series);
// console.log(tree);
// console.log(series);
// console.log(get(tree, '2014-02-10T23:00:00.000Z'));

// console.log(get(tree, '2013-09-27T22:00:00.000Z'));
// console.log('new');
console.log(getNearest(tree, '2013-09-25T22:00:00.000Z'));
