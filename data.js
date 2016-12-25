class Base {
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

class PageLink extends Base {
  constructor(url, html) {
    super(html);

    this.containingPageUrl = url;
    this.outgoingPageUrl = this.html.getAttribute('href');
  }
}

class Page extends Base {
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
    this.urlToLinksMap = new Map();

    for (const [url, html] of urlToHtmlMap.entries()) {
      const page = new Page(url, 1 / urlToHtmlMap.size, html);
      this.urlToPageMap.set(page.url, page);
    }

    for (const page of this.urlToPageMap.values()) {
      this.urlToLinksMap.set(page.url, []);

      const anchors = Array.from(page.html.querySelectorAll('a'));
      for (const anchor of anchors) {
        const link = new PageLink(page.url, anchor);
        this.urlToLinksMap.get(page.url).push(link);
      }
    }
  }

  calculateRank(url) {
    const term = (1 - this.d) / this.urlToPageMap.size;
    const linksForUrl = this.urlToLinksMap.get(url);
    const linkedPages = linksForUrl.map(link =>
      this.urlToPageMap.get(link.containingPageUrl)
    );

    const pageRank = term + this.d * sum(
      linkedPages.map(page =>
        page.rank / this.urlToLinksMap.get(page.url).length
      ));

    // cleanup result
    return parseFloat(
      pageRank.toPrecision(3)
    );
  }

  getPages() {
    return Array.from(this.urlToPageMap.values());
  }

  getPage(url) {
    return this.urlToPageMap.get(url);
  }
}