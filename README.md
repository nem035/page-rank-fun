# PageRank in JavaScript

[PageRank](https://en.wikipedia.org/wiki/PageRank) works by counting the number and quality of links to a page to determine a rough estimate of how important the website is.
The underlying assumption is that more important websites are likely to receive more links from other websites.

A PageRank of 0.5 means there is a 50% chance that a person clicking on a random link will be directed to the document with the 0.5 PageRank.

## Algorithm

We have 4 pages A.html, B.html, C.html, D.html

Links from a page to itself, or multiple outbound links from one single page to another single page, are ignored.

PageRank is initialized to the same value for all pages, with a probability distribution between 0 and 1. Hence the initial value for each page in this example is 0.25.

```js
const pages = ['A', 'B', 'C', 'D'];
const initialRanks = pages.map(() => 1 / pages.length);
```

The PageRank transferred from a given page to the targets of its outbound links upon the next iteration is divided equally among all outbound links.

If the only links in the system were from pages `A`, `B`, and `C` to `D`, each link would transfer 0.25 PageRank to `D` upon the next iteration, for a total of 0.75.

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

Thus, upon the first iteration, page `B` would transfer half of its existing value, or 0.125, to page `A` and the other half, or 0.125, to page `C`. Page `C` would transfer all of its existing value, 0.25, to the only page it links to, `A`. Since `D` had three outbound links, it would transfer one third of its existing value, or approximately 0.083, to `A`.

At the completion of this iteration, page `A` will have a PageRank of approximately 0.458.

```js
pageRankA = PR('B') / 2 + PR('C') + PR('D') / 3`
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
      PR(page) / L(page)
    )
)
```

i.e. the PageRank value for a page `X` is dependent on the PageRank values for each page `Y` contained in the set `Bx` (the set containing all pages linking to page `X`) divided by the number `L(Y)` of links from page `Y`.

### Damping Factor

The PageRank theory holds that an imaginary random surfer who is randomly clicking on links will eventually stop clicking. The probability, at any step, that the person will continue is a damping factor `d`. Various studies have tested different damping factors, but it is generally assumed that the damping factor will be set around 0.85.

The damping factor is subtracted from 1 and the result is divided by the number of documents `N` in the collection. This term is then added to the product of the damping factor and the sum of the incoming PageRank scores:

```js
const term = ((1 - d) / pages.length);
pageRankX = term + d * sum(
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

## Licence

MIT