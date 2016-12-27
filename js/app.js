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
    window.pageRank.addPageLink(
      target.dataset.pageUrl,
      target.innerHTML
    );
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

  debugger;
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
  window.pageRank.resetLinkMaps();
  window.pageRank.updateLinkMaps();
  displayPageData();
}

function resetIterationCount() {
  document.getElementById('iteration-count').innerHTML = 0;
}