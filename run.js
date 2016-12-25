document.addEventListener('DOMContentLoaded', () => {
  fetchPagesAndBuildUrlToHtmlMap(
      ['A', 'B', 'C', 'D'].map(name => `${name}.html`)
    )
    .then(urlToHtmlMap => new PageRank(urlToHtmlMap))
    .then(pageRank => window.pageRank = pageRank)
    .then(addPagesToDOM)
    .then(calculatePageRanks);
});

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
        <div class='top-bar'>
          <div class='circles'>
            <div class="circle circle-red"></div>
            <div class="circle circle-yellow"></div>
            <div class="circle circle-green"></div>
          </div>
        </div>
        <div class='content'>
          ${html.innerHTML}
        </div>
      </div>
    </div>
    <div class="page-name">
      <span>${url}</span>
      <code class="page-rank"></code>
    </div>
  </div>
  `;

  return pageDOM;
}

function addPagesToDOM() {

  const pagesContainer = document.getElementById('pages-container');

  window.pageRank
    .getPages()
    .forEach(page =>
      pagesContainer.appendChild(page.html)
    );
}

function renderPages() {
  window.pageRank
    .getPages()
    .forEach(page =>
      pagesContainer.appendChild(page.html)
    );
}

function calculatePageRanks() {
  const ranksForCurrentIterationMap = new Map();

  for (const page of window.pageRank.getPages()) {
    const rank = window.pageRank.calculateRank(page.url);
    ranksForCurrentIterationMap.set(page.url, rank);
  }

  for (const [url, rank] of ranksForCurrentIterationMap.entries()) {
    const page = window.pageRank.getPage(url);
    page.rank = ranksForCurrentIterationMap.get(url);
  }

  for (const page of window.pageRank.getPages()) {
    document.getElementById(page.url).querySelector('.page-rank').innerHTML = page.rank;
  }
}