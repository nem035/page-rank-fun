document.addEventListener('DOMContentLoaded', () => {

  renderNavBar();

  document
    .addEventListener('click', (e) => {
      e.preventDefault();
      const targetPageId = (
          e.target.getAttribute('href') || ''
        )
        .split('#')
        .pop()
        .replace('.html', '');

      if (targetPageId) {
        [...document.querySelectorAll('.browser-window')]
        .forEach(bw =>
          bw.classList.remove('zoom-in')
        );

        document
          .getElementById(targetPageId)
          .classList
          .add('zoom-in');
      }
    });
});

function renderNavBar() {
  const linksContainer = document
    .getElementById('page-links');

  pageIds
    .forEach(pageId =>
      linksContainer.appendChild(
        createNavLink(pageId)
      )
    );
}

function createNavLink(pageId) {
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.setAttribute('href', `${pageId}.html`);
  a.appendChild(
    document
    .createTextNode(pageId)
  );
  li.appendChild(a);
  return li;
}

function sum(values) {
  return values
    .reduce((total, curr) =>
      total + curr,
      0
    );
}