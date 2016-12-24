const pageIds = ['A', 'B', 'C', 'D'];

const initialPageLinksMap = new Map([
  ['A', []],
  ['B', ['C', 'A']],
  ['C', ['A']],
  ['D', ['A', 'B', 'C']]
]);