class CustomHTMLElem {
  constructor(html) {
    this._html = null;
    this.html = html;
  }

  get html() {
    return this._html;
  }

  set html(html) {
    if (typeof html === 'string') {
      this._html = document.createElement('div');
      this._html.innerHTML = html;
    } else if (html instanceof HTMLElement) {
      this._html = html;
    } else {
      throw Error(`Invalid html "${html}"`);
    }
  }
}

class PageLink {
  constructor(containingPageUrl, outgoingPageUrl) {
    this.containingPageUrl = containingPageUrl;
    this.outgoingPageUrl = outgoingPageUrl;
  }

  equals() {
    if (arguments.length === 1) {
      return this.containingPageUrl == arguments[0].containingPageUrl &&
        this.outgoingPageUrl === arguments[0].outgoingPageUrl;
    }

    return this.containingPageUrl == arguments[0] &&
      this.outgoingPageUrl === arguments[1];
  }
}

class PageLinksSet extends Set {
  constructor() {
    super(...arguments);
  }

  _toPageLink() {
    return arguments.length === 1 ?
      arguments[0] :
      new PageLink(arguments[0], arguments[1]);
  }

  has(pageLink) {
    for (const pg of this.values()) {
      if (pg.equals(pageLink)) {
        return true;
      }
    }
    return false;
  }

  add() {
    const pageLink = this._toPageLink(...arguments);

    if (!this.has(pageLink)) {
      super.add(pageLink);
    }
  }

  get() {
    if (arguments.length === 1) {
      return super.get(arguments[0]);
    }

    for (const pl of this.values()) {
      if (pl.equals(
          arguments[0],
          arguments[1]
        )) {
        return pl;
      }
    }

    return null;
  }

  delete() {
    return super.delete(
      this.get(...arguments)
    )
  }
}

class Page extends CustomHTMLElem {
  constructor(url, initialRank, html) {
    super(html);

    this.url = url;
    this.rank = initialRank;
  }
}

class PageRank {

  constructor(urlToHtmlMap) {

    this.d = 0.85;
    this.urlToPageMap = new Map();
    this.urlToOutLinksSetMap = new Map();
    this.urlToBackLinksSetMap = new Map();

    this.initPages(urlToHtmlMap);
    this.resetLinksSetMaps();
    this.updateLinksSetMaps();
  }

  initPages(urlToHtmlMap) {
    for (const [url, html] of urlToHtmlMap.entries()) {
      const page = new Page(url, 1 / urlToHtmlMap.size, html);
      this.urlToPageMap.set(page.url, page);
    }
  }

  resetLinksSetMaps() {
    for (const page of this.getPages()) {
      this.urlToOutLinksSetMap.set(page.url, new PageLinksSet());
      this.urlToBackLinksSetMap.set(page.url, new PageLinksSet());
    }
  }

  updateLinksSetMaps() {

    for (const page of this.urlToPageMap.values()) {
      const anchors = Array.from(page.html.querySelectorAll('a'));

      for (const anchor of anchors) {
        this.urlToOutLinksSetMap.get(page.url).add(
          page.url,
          anchor.getAttribute('href')
        );
      }
    }

    for (const [url, links] of this.urlToOutLinksSetMap.entries()) {
      for (const link of links) {
        this.urlToBackLinksSetMap.get(link.outgoingPageUrl).add(link);
      }
    }
  }

  calculateRank(url) {

    const currentRankOverNumberOfBackLinks = (url) => {
      return this.getBackLinkedPages(url).map(backLinkPage => {
        return backLinkPage.rank / this.countOutLinks(backLinkPage.url)
      });
    };

    const normalizedSum = (ranksOverNumberOfBackLinks) => {
      return (1 - this.d) + this.d * sum(ranksOverNumberOfBackLinks);
    };

    const pageRank = normalizedSum(
      currentRankOverNumberOfBackLinks(
        url
      )
    );

    return normalizeFloat(pageRank);
  }

  getBackLinkedPages(url) {
    return [...this.urlToBackLinksSetMap.get(url)]
      .map(backLink =>
        this.urlToPageMap.get(backLink.containingPageUrl)
      );
  }

  countOutLinks(url) {
    return this.urlToOutLinksSetMap.get(url).size || 1;
  }

  getPages() {
    return [...this.urlToPageMap.values()];
  }

  getDescSortedPages(direction = 'asc') {
    return this.getPages().sort((page1, page2) => {
      return page2.rank - page1.rank;
    });
  }

  createPageLink(containingPageUrl, outgoingPageUrl) {

    const newPageLink = new PageLink(containingPageUrl, outgoingPageUrl);

    this.urlToOutLinksSetMap.get(containingPageUrl)
      .add(
        newPageLink
      );

    this.urlToBackLinksSetMap.get(outgoingPageUrl)
      .add(
        newPageLink
      );
  }

  deletePageLink(containingPageUrl, outgoingPageUrl) {
    this.urlToOutLinksSetMap.get(containingPageUrl)
      .delete(
        containingPageUrl,
        outgoingPageUrl
      );

    this.urlToBackLinksSetMap.get(outgoingPageUrl)
      .delete(
        containingPageUrl,
        outgoingPageUrl
      );
  }
}

class State {
  constructor() {
    this._isRunning = false;
    this._isFinished = false;
  }

  get isRunning() {
    return this._isRunning;
  }

  set isRunning(isRunning) {
    this._isRunning = isRunning;
    const actions = [...document.querySelectorAll('button')];
    for (const action of actions) {
      action.disabled = isRunning;
    }
  }

  get isFinished() {
    return this._isFinished;
  }

  set isFinished(isFinished) {
    this._isFinished = isFinished;
  }
}

const initialPageNames = ['A', 'B', 'C', 'D'];
const initialLinks = new Map([
  ['A', ['B', 'C']],
  ['B', ['C']],
  ['C', ['A']],
  ['D', ['C']]
])

document.addEventListener('DOMContentLoaded', () => {
  initStateAndPageRank(buildUrlToHtmlMap(initialPageNames));
  addPagesToDOM();
  displayPageData();
});

function addPagesToDOM() {
  const pagesContainer = document.getElementById('pages-container');

  for (const page of window.pageRank.getDescSortedPages()) {
    pagesContainer.appendChild(page.html);
  }
}

document.addEventListener('click', ({
  target
}) => {
  if (target.classList.contains('item-add-link')) {
    const containingPageUrl = target.dataset.pageUrl;
    const outgoingPageUrl = target.innerHTML;

    if (window.pageRank.urlToOutLinksSetMap.get(containingPageUrl).size < 20) {
      const page = window.pageRank.urlToPageMap.get(containingPageUrl);

      page.html
        .querySelector('.page-content')
        .appendChild(buildAnchorFromUrl(outgoingPageUrl));

      window.pageRank.createPageLink(
        target.dataset.pageUrl,
        target.innerHTML
      );
    }
  }
});

function initStateAndPageRank(urlToHtmlMap) {
  window.state = new State();
  window.pageRank = new PageRank(urlToHtmlMap);
}

function buildUrlToHtmlMap(urls) {

  const urlToHtmlMap = new Map();

  urls.map(url => {
    urlToHtmlMap.set(url, createPageDOM(url))
  });

  return urlToHtmlMap;
}

function createPageDOM(url) {
  const pageDOM = document.createElement('div');
  pageDOM.setAttribute('id', url);
  pageDOM.classList.add('page-container');

  pageDOM.innerHTML = `
    <div class="page-window-container">
      <div class="page-window">
        <div class="top-bar">
          <span class="circles">
            <span class="circle circle-red"></span>
            <span class="circle circle-yellow"></span>
            <span class="circle circle-green"></span>
          </span>
        </div>
        <div class="page-url">
          <input readonly value=${'http://www.' + url + '.html'}/>
        </div>
        <div class="page-content">
          ${getInitialLinksHTML(url)}
        </div>
        <button class="btn-add-link" type="button">&#43;</button>
        <ul class="links-dropdown-container">
          <div class="arrow-right"></div>
          <li class="item-add-link" data-page-url="${url}">A</li>
          <li class="item-add-link" data-page-url="${url}">B</li>
          <li class="item-add-link" data-page-url="${url}">C</li>
          <li class="item-add-link" data-page-url="${url}">D</li>
        </ul>
      </div>
    </div>
    <div class="page-name">
      Page Rank <code class="page-rank"></code>
    </div>
  `;

  return pageDOM;
}

function getInitialLinksHTML(url) {
  return initialLinks
    .get(url)
    .map(url => `<a href=${url}>${url}</a>`)
    .join('');
}

function buildAnchorFromUrl(url) {
  const a = document.createElement('a');
  a.setAttribute('href', url);
  a.innerHTML = url;
  return a;
}

function displayPageData() {
  const pagesContainer = document.getElementById('pages-container');

  window.pageRank.getDescSortedPages()
    .forEach((page, i) => {
      requestAnimationFrame(() => {
        page.html.dataset.index = i;
      });
    });

  updateRanksAndAverage();
}

function calculate() {
  const pagesContainer = document.getElementById('pages-container');

  resetIterationCount();
  window.state.isFinished = false;
  window.state.isRunning = true;

  (function runIteration() {

    if (!calculatePageRanksIteration()) {
      incrementIterationCount();
      runIteration();
    } else {
      displayPageData();
      window.state.isFinished = true;
      window.state.isRunning = false;
    }
  })()
}

function calculatePageRanksIteration() {
  const urlToPreviousRankMap = new Map();

  for (const page of window.pageRank.getPages()) {
    urlToPreviousRankMap.set(page.url, page.rank);
    page.rank = window.pageRank.calculateRank(page.url);
  }

  let unchanged = 0;
  const epsilon = 0.001;
  for (const page of window.pageRank.getPages()) {
    const previousRank = urlToPreviousRankMap.get(page.url);
    if (Math.abs(previousRank - page.rank) < epsilon) {
      unchanged += 1;
    }
  }

  return unchanged === window.pageRank.urlToPageMap.size;
}

function updateRanksAndAverage() {
  displayRanks();
  updateAverageRank();
}

function displayRanks() {
  for (const page of window.pageRank.getPages()) {
    document.getElementById(page.url).querySelector('.page-rank').innerHTML = page.rank;
  }
}

function updateAverageRank() {
  const pages = window.pageRank.getPages();
  const avg = sum(
    pages.map(page => page.rank)
  ) / pages.length;
  const elem = document.getElementById('average-rank');
  elem.innerHTML = normalizeFloat(avg);
}

function incrementIterationCount() {
  const elem = document.getElementById('iteration-count');
  elem.innerHTML = parseInt(elem.innerHTML) + 1;
}

function sum(values) {
  return values.reduce((total, curr) => total + curr, 0);
}

function normalizeFloat(f) {
  return parseFloat(f.toPrecision(3));
}

function reset() {
  window.state.isFinished = false;
  window.state.isRunning = false;

  const pages = window.pageRank.getPages();

  for (const page of pages) {
    page.rank = 1 / pages.length;
    page.html
      .querySelector('.page-content')
      .innerHTML = getInitialLinksHTML(page.url);
  }

  resetIterationCount();
  window.pageRank.resetLinksSetMaps();
  window.pageRank.updateLinksSetMaps();
  displayPageData();
}

function resetIterationCount() {
  document.getElementById('iteration-count').innerHTML = 0;
}

document.addEventListener('DOMContentLoaded', () => {

  const drake = dragula({
    revertOnSpill: true,
    isContainer(el) {
      return el.classList.contains('page-content');
    },
    invalidTarget(el, handle) {
      return el.tagName === 'A';
    },
    moves(el, source, handle, sibling) {
      return !window.state.isRunning;
    }
  });

  drake.on('drop', (el, target, source, sibling) => {

    window.pageRank.deletePageLink(
      target.parentElement.parentElement.parentElement.getAttribute('id'),
      el.getAttribute('href')
    );

    window.pageRank.createPageLink(
      target.parentElement.parentElement.parentElement.getAttribute('id'),
      el.getAttribute('href')
    );
  });
});

document.addEventListener('click', (e) => {
  if (e.target.tagName === 'A' && !e.target.classList.contains('github-fork-ribbon')) {
    e.preventDefault();
  }
});