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

class PageLink {
  constructor(containingPageUrl, outgoingPageUrl) {
    this.containingPageUrl = containingPageUrl;
    this.outgoingPageUrl = outgoingPageUrl;
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
    this.urlToOutLinksMap = new Map();
    this.urlToBackLinksMap = new Map();

    // build url -> Page map and initialize link maps
    for (const [url, html] of urlToHtmlMap.entries()) {
      const page = new Page(url, 1 / urlToHtmlMap.size, html);
      this.urlToPageMap.set(page.url, page);
      this.urlToOutLinksMap.set(page.url, []);
      this.urlToBackLinksMap.set(page.url, []);
    }

    // initialize link maps

    // build url -> [outgoing links] map
    for (const page of this.urlToPageMap.values()) {
      const anchors = Array.from(page.html.querySelectorAll('a'));

      for (const anchor of anchors) {
        const outLink = new PageLink(page.url, anchor.getAttribute('href'));
        this.urlToOutLinksMap.get(page.url).push(outLink);
      }
    }

    // build url -> [ingoing links]
    for (const [url, links] of this.urlToOutLinksMap.entries()) {
      for (const link of links) {
        this.urlToBackLinksMap.get(link.outgoingPageUrl).push(link);
      }
    }
  }

  calculateRank(url) {

    const currentRankOverNumberOfBackLinks = (url) => {
      return this.getBackLinkedPages(url).map(backLinkPage => {
        return backLinkPage.rank / (this.getOutLinks(backLinkPage.url).length || 1)
      });
    };

    const normalizedSum = (values) => {
      return (1 - this.d) + this.d * sum(values);
    };

    const pageRank = normalizedSum(
      currentRankOverNumberOfBackLinks(
        url
      )
    );

    return normalizeFloat(pageRank);
  }

  getBackLinkedPages(url) {
    return this.urlToBackLinksMap
      .get(url)
      .map(backLink =>
        this.urlToPageMap.get(backLink.containingPageUrl)
      );
  }

  getOutLinks(url) {
    return this.urlToOutLinksMap.get(url);
  }

  getPages() {
    return [...this.urlToPageMap.values()];
  }
}