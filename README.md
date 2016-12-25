# PageRank in JavaScript

PageRank essentially works by counting the number of links to a page to obtain a rough estimate of website's importance.
The base assumption in PageRank is that more important websites are likely to receive more links from other websites.

[Demo Page](https://nem035.github.io/page-rank-fun/)

## Algorithm

We have 4 pages A.html, B.html, C.html, D.html

PageRank is initialized to the same value for all pages, with a probability distribution between 0 and 1. Hence the initial value for each page in this example is 0.25.

```js
const pages = ['A', 'B', 'C', 'D'];
const initialRanks = pages.map(() => 1 / pages.length); // [0.25, 0.25, 0.25, 0.25]
```

The PageRank of a given page gets equally distributed through the its outbound links on each iteration of the algorithm.

If the only links we had were `A`, `B`, and `C` to `D`, each link would transfer 0.25 PageRank to `D` upon the next iteration, for a total of 0.75.

`PR('D') = PR('A') + PR('B') + PR('C')`

Suppose instead that page `B` had a link to pages `C` and `A`, page `C` had a link to page `A`, and page `D` had links to all three pages.

```html
<!-- B.html -->
<a href="A.html">A</a>
<a href="C.html">C</a>

<!-- C.html -->
<a href="A.html">A</a>

<!-- D.html -->
<a href="A.html">A</a>
<a href="B.html">B</a>
<a href="C.html">C</a>
```

In this example, upon the first iteration, page `B` would transfer half of its existing rank, or 0.125, to page `A` and the other half, to page `C`. Page `C` would transfer all of its existing rank, 0.25, to the only page it links to, `A`. Since `D` had three outbound links, it would transfer one third of its rank, or approximately 0.083, to `A`.

At the end of this iteration, page `A` will have a PageRank of approximately 0.458.

```js
pageRankA = PR('B') / 2 + PR('C') + PR('D') / 3` // (0.25 / 2) + (0.25 / 1) + (0.25 / 3) ~= 0.458
```

In other words, the PageRank conferred by an outbound link is equal to the document's own PageRank score divided by the number of outbound links `L`.

```js
pageRankA = PR('B') / L('B') +
            PR('C') / L('C') +
            PR('D') / L('D')`
```

In the general case, the PageRank value for any page `X` can be expressed as:

```js
pageRankX = sum(
  pagesLinkingTo('X').
    map(page =>
      getPageRank(page) / countOutgoingLinks(page)
    )
)
```

### Damping Factor

- Original Paper

> We assume page A has pages T1...Tn which point to it (i.e., are citations). The parameter d is a damping factor which can be set between 0 and 1. We usually set d to 0.85. There are more details about d in the next section. Also C(A) is defined as the number of links going out of page A. The PageRank of a page A is given as follows:

- Wikiedia

> The PageRank theory holds that an imaginary random surfer who is randomly clicking on links will eventually stop clicking. The probability, at any step, that the person will continue is a damping factor `d`. Various studies have tested different damping factors, but it is generally assumed that the damping factor will be set around 0.85.

```js
pageRankX = (1 - d) + d * sum(
  pagesLinkingTo('X').
    map(page =>
      PR(page) / L(page)
    )
);
```

## Sources

- [Wikipedia](https://en.wikipedia.org/wiki/PageRank)
- [Princeton's Ian Rogers](http://www.cs.princeton.edu/~chazelle/courses/BIB/pagerank.htm)

## Libraries

- [dragula](https://github.com/bevacqua/dragula)
- [highlight](https://github.com/isagalaev/highlight.js)

## Licence

MIT