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
    if (this.isRunning) {
      this.isRunning = false;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {

  fetchPagesAndBuildUrlToHtmlMap(
      ['A', 'B', 'C', 'D'].map(name => `pages/${name}.html`)
    )
    .then(initStateAndPageRank)
    .then(addPagesToDOM)
    .then(displayRanks);
});

function initStateAndPageRank(urlToHtmlMap) {
  window.state = new State();
  window.pageRank = new PageRank(urlToHtmlMap);
}

async function fetchPagesAndBuildUrlToHtmlMap(urls) {

  const urlToHtmlMap = new Map();

  const htmls = await Promise.all(
    urls.map(url =>
      fetchPageHtml(url)
      .then(html =>
        urlToHtmlMap.set(url, createPageTemplate(url, html))
      )
    )
  );

  return urlToHtmlMap;
}

async function fetchPageHtml(url) {
  const response = await fetch(url);
  const text = await response.text();

  const html = document.createElement('div');
  html.innerHTML = text;
  html.setAttribute('id', url);

  return html;
}

function createPageTemplate(url, html) {
  const pageDOM = document.createElement('div');
  pageDOM.innerHTML = `
  <div id=${url} class="page-container">
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
          <input readonly value=${window.location + url}/>
        </div>
        <div class="page-content">
          ${html.innerHTML}
        </div>
      </div>
    </div>
    <div class="page-name">
      Page Rank <code class="page-rank"></code>
    </div>
  </div>
  `;

  return pageDOM;
}

function addPagesToDOM() {

  const pagesContainer = document.getElementById('pages-container');

  for (const page of window.pageRank.urlToPageMap.values()) {
    pagesContainer.appendChild(page.html)
  }
}

function displayRanks() {
  for (const page of window.pageRank.urlToPageMap.values()) {
    document.getElementById(page.url).querySelector('.page-rank').innerHTML = page.rank;
  }
}

function calculateFinalPageRanks() {
  (function runIteration() {
    calculatePageRanks(true);

    if (!window.state.isFinished) {
      setTimeout(runIteration, 500);
    }
  })()
}

function calculatePageRanks(isIteration) {
  if (window.state.isFinished) {
    return;
  }

  if (!window.state.isRunning) {
    window.state.isRunning = true;
  }

  const urlToPreviousRankMap = new Map();

  for (const page of window.pageRank.urlToPageMap.values()) {
    urlToPreviousRankMap.set(page.url, page.rank);
    page.rank = window.pageRank.calculateRank(page.url);
  }

  let unchanged = 0;
  for (const page of window.pageRank.getPages()) {
    const previousRank = urlToPreviousRankMap.get(page.url);
    if (previousRank === page.rank) {
      unchanged += 1;
    }
  }

  if (!isIteration) {
    window.state.isRunning = false;
  }

  if (unchanged === window.pageRank.urlToPageMap.size) {
    window.state.isFinished = true;
  } else {
    updateRanksAndStats();
  }
}

function updateRanksAndStats() {
  displayRanks();
  incrementIterationCount();
  updateAverageRank();
}

function incrementIterationCount() {
  const elem = document.getElementById('iteration-count');
  elem.innerHTML = parseInt(elem.innerHTML) + 1;
}

function updateAverageRank() {
  const pages = window.pageRank.getPages();
  const avg = sum(
    pages.map(page => page.rank)
  ) / pages.length;
  const elem = document.getElementById('average-rank');
  elem.innerHTML = normalizeFloat(avg);
}

function sum(values) {
  return values.reduce((total, curr) => total + curr, 0);
}

function normalizeFloat(f) {
  return parseFloat(f.toPrecision(3));
}

function resetPageRanks() {
  window.state.isFinished = false;

  const pages = window.pageRank.getPages();

  for (const page of pages) {
    page.rank = 1 / pages.length;
  }

  displayRanks();
  resetIterationCount();
  updateAverageRank();
}

function resetIterationCount() {
  document.getElementById('iteration-count').innerHTML = 0;
}