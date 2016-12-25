document.addEventListener('DOMContentLoaded', () => {
  fetchPagesAndBuildUrlToHtmlMap(
      ['A', 'B', 'C', 'D'].map(name => `${name}.html`)
    )
    .then(urlToHtmlMap => new PageRank(urlToHtmlMap))
    .then(pageRank => window.pageRank = pageRank)
    .then(addPagesToDOM)
    .then(displayRanks);
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
        <div class="content">
          ${html.innerHTML}
        </div>
      </div>
    </div>
    <div class="page-name">
      <code class="page-rank"></code>
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

function calculatePageRanks() {

  for (const page of window.pageRank.urlToPageMap.values()) {
    page.rank = window.pageRank.calculateRank(page.url);
  }

  displayRanks();
}