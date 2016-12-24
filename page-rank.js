function run(pages) {

  // initialize ranks
  const ranks = pages.map(() =>
    1 / pages.length
  );

  // calculate page rank for every page name
  const pageRanks = pages.map(page => ({
    page,
    rank: PR(page.id, pages)
  }));

  pageRanks.forEach(
    displayPageRanks
  );
}

function PR(pageId, pages) {

  // get current page
  const currentPage = pages.find(page =>
    page.id === pageId
  );

  // remove current page from the rest of the pages
  const otherPages = pages.filter(page =>
    page.id !== pageId
  );

  return sum(
    pagesLinkingTo(pageId, otherPages)
    .map(page =>
      PR(page.id, pages) / L(page)
    )
  );
}

function sum(values) {
  return values
    .reduce((total, curr) =>
      total + curr,
      0
    );
}

function pagesLinkingTo(pageId, pages) {
  return pages
    .filter(page =>
      getLinkNames(page).includes(pageId)
    );
}

function L(page) {
  return getLinks(page).length;
}

function getLinks(page) {
  return Array.from(
    page.querySelectorAll('a')
  );
}

function getLinkNames(page) {
  return getLinks(page).map(link => link.innerHTML);
}

function displayPageRanks({
  page,
  rank
}) {
  document.querySelector(`#${page.id} .page-rank`).innerHTML = rank;
}

function getStartingLinks(pageId) {
  return initialPageLinksMap
    .get(pageId)
    .map(initialLink =>
      `<a href=${initialLink}.html>${initialLink}</a>`
    )
    .join('<br />\n');
}

function getPageTemplate(pageId) {
  return `
    <div class="row">
      ${getStartingLinks(pageId)}
    </div>
  `;
}

function createBrowserWindow(page) {
  const bw = document.createElement('div');
  bw.classList.add('browser-window');
  bw.setAttribute('id', page.id);
  bw.innerHTML = `
    <div class='top-bar'>
      <div class='circles'>
         <div class="circle circle-red"></div>
         <div class="circle circle-yellow"></div>
         <div class="circle circle-green"></div>
      </div>
      <span class="page-rank-wrapper">PageRank <code class="page-rank"></code></span>
    </div>
    <div class='content'>
      ${page.innerHTML}
    </div>
  `;
  return bw;
}

function renderPageTemplate(page) {
  document
    .getElementById('pages-container')
    .appendChild(createBrowserWindow(page));
}

async function fetchPage(pageId) {
  const response = await fetch(`${pageId}.html`);
  const text = await response.text();
  const html = document.createElement('div');
  html.innerHTML = text;
  html.setAttribute('id', pageId);
  return html;
}

async function fetchAndRenderPages() {
  const pages = await Promise.all(
    pageIds.map(fetchPage)
  );

  pages.forEach(renderPageTemplate);

  return pages;
}

document.addEventListener('DOMContentLoaded', () => {
  fetchAndRenderPages().then(run);
});