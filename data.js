const pageIds = ['A', 'B', 'C', 'D'];

class Page {
  constructor(id, html, rank) {
    this.id = id;
    this.html = html;
    this.rank = rank;
  }

  getLinks() {
    return this.html instanceof Node ? [...this.html.querySelectorAll('a')] : [];
  }

  displayRank() {
    if (this.html instanceof Node) {
      this.html.querySelector('.page-rank').innerHTML = this.rank;
    }
  }
}

// initialize ranks
const pagesMap = new Map(
  pageIds.map(pageId => ([
    pageId,
    new Page(pageId, '', 1 / pageIds.length)
  ]))
);