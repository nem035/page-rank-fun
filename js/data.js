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

  equals(pageLink) {
    return this.containingPageUrl == pageLink.containingPageUrl &&
      this.outgoingPageUrl === pageLink.outgoingPageUrl;
  }
}

class PageLinksSet extends Set {
  constructor() {
    super(...arguments);
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
    const pageLink = arguments.length === 1 ?
      arguments[0] :
      new PageLink(arguments[0], arguments[1]);

    if (!this.has(pageLink)) {
      super.add(pageLink);
    }
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

  addPageLink(containingPageUrl, outgoingPageUrl) {
    if (this.urlToOutLinksSetMap.get(containingPageUrl).size < 20) {
      const page = this.urlToPageMap.get(containingPageUrl);

      page.html
        .querySelector('.page-content')
        .appendChild(buildAnchorFromUrl(outgoingPageUrl));

      const newPageLink = new PageLink(containingPageUrl, outgoingPageUrl);

      this.urlToOutLinksSetMap.get(containingPageUrl)
        .add(
          newPageLink
        );

      this.urlToOutLinksSetMap.get(outgoingPageUrl)
        .add(
          newPageLink
        );
    }
  }
}