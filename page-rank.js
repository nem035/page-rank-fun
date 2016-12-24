function run() {

  const tempRanksMap = new Map();

  // calculate and display page rank for every page
  for (const [pageId, page] of pagesMap.entries()) {
    tempRanksMap.set(pageId, PR(pageId));
  }

  // update ranks from this iteration into the global ranks map
  for (const [pageId, rank] of tempRanksMap.entries()) {
    const page = pagesMap.get(pageId);
    page.rank = tempRanksMap.get(pageId);
    page.displayRank();
  }
}

function PR(pageId) {

  // damping factor
  const d = 0.85;
  const term = ((1 - d) / pageIds.length);

  // page rank
  const pageRank = term + d * sum(
    pagesLinkingTo(pageId)
    .map(pageLinkId =>
      pagesMap.get(pageLinkId).rank / L(pageLinkId)
    ));

  // cleanup result
  return parseFloat(
    pageRank.toPrecision(3)
  );
}

function pagesLinkingTo(pageId) {
  return [...pagesMap.keys()]
    .filter(pageLinkId =>
      getLinkNames(pageLinkId).includes(pageId)
    );
}

function L(pageId) {
  return pagesMap.get(pageId).getLinks().length;
}

function getLinkNames(pageId) {
  return pagesMap.get(pageId).getLinks().map(link => link.innerHTML);
}

function createPageTemplate(html) {
  const bw = document.createElement('div');
  bw.classList.add('browser-window');
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
      ${html.innerHTML}
    </div>
  `;
  return bw;
}

// render browser window element for a page
function renderPageTemplate(page, html) {
  page.html = createPageTemplate(html);
  document
    .getElementById('pages-container')
    .appendChild(page.html);
}

async function fetchPageHtml(pageId) {
  // fetch current page
  const response = await fetch(`${pageId}.html`);

  // fetch content of current page
  const text = await response.text();

  // create element for the current page
  const html = document.createElement('div');
  html.innerHTML = text;
  html.setAttribute('id', pageId);

  return html;
}

async function fetchAndRenderPages() {
  // fetch all page html
  const htmls = await Promise.all(
    pageIds.map(fetchPageHtml)
  );

  // add each page to the global pagesMap and render it
  htmls.forEach((html, idx) =>
    renderPageTemplate(
      pagesMap.get(pageIds[idx]),
      html
    )
  );
}

document.addEventListener('DOMContentLoaded', () => {
  fetchAndRenderPages().then(run);
});