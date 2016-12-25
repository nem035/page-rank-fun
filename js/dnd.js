document.addEventListener('DOMContentLoaded', () => {

  const drake = dragula({
    revertOnSpill: true,
    isContainer(el) {
      return el.classList.contains('page-content');
    },
    invalidTarget(el, handle) {
      return el.tagName === 'A';
    },
    moves(el, source, handle, sibling) {
      return !window.state.isRunning;
    }
  });

  drake.on('drop', (el, target, source, sibling) => {
    window.pageRank.resetLinkMaps();
    window.pageRank.updateLinkMaps();
  });
});

document.addEventListener('click', (e) => {
  if (e.target.tagName === 'A' && !e.target.classList.contains('github-fork-ribbon')) {
    e.preventDefault();
  }
});