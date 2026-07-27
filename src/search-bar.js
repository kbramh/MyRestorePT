const searchBarPanel = `
        <div class="search-bar-form">
         <input class="search-bar-input" type="text" id="search" placeholder="Search..." aria-label="Search site content" />
         <button type="button" class="search-bar-button">Go!</button>
        </div>
        <p class="search-bar-status" role="status" aria-live="polite"></p>
    `;

const searchBarElement = document.querySelector('searchBar');

searchBarElement.innerHTML = searchBarPanel;

function getCurrentPage() {
  const path = window.location.pathname;
  if (path === '/' || path.endsWith('/')) {
    return 'index.html';
  }

  const file = path.split('/').pop();
  return file || 'index.html';
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildSearchPattern(query) {
  const words = query.trim().split(/\s+/).filter(Boolean);

  if (!words.length) {
    return null;
  }

  if (words.length === 1) {
    return new RegExp(escapeRegExp(words[0]), 'i');
  }

  return new RegExp(words.map(escapeRegExp).join('\\s+'), 'i');
}

function textMatchesQuery(query, text) {
  const pattern = buildSearchPattern(query);
  return pattern ? pattern.test(text) : false;
}

function clearHighlights() {
  document.querySelectorAll('mark.search-highlight').forEach((mark) => {
    const parent = mark.parentNode;
    parent.replaceChild(document.createTextNode(mark.textContent), mark);
    parent.normalize();
  });
}

function setSearchStatus(message) {
  const status = document.querySelector('.search-bar-status');
  if (status) {
    status.textContent = message;
  }
}

function getMainTextSegments(main) {
  const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
  const segments = [];
  let offset = 0;

  while (walker.nextNode()) {
    const node = walker.currentNode;

    if (node.parentNode?.closest('mark.search-highlight')) {
      continue;
    }

    const text = node.textContent;
    segments.push({
      node,
      start: offset,
      end: offset + text.length,
      text,
    });
    offset += text.length;
  }

  return segments;
}

function wrapTextNodeMatch(node, localStart, localEnd) {
  const text = node.textContent;
  const before = text.slice(0, localStart);
  const highlighted = text.slice(localStart, localEnd);
  const after = text.slice(localEnd);
  const parent = node.parentNode;

  if (!parent || !highlighted) {
    return null;
  }

  const mark = document.createElement('mark');
  mark.className = 'search-highlight';
  mark.textContent = highlighted;

  if (before) {
    parent.insertBefore(document.createTextNode(before), node);
  }
  parent.insertBefore(mark, node);
  if (after) {
    parent.insertBefore(document.createTextNode(after), node);
  }
  parent.removeChild(node);

  return mark;
}

function highlightAndScroll(query) {
  clearHighlights();

  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return false;
  }

  const main = document.querySelector('main');
  if (!main) {
    return false;
  }

  const segments = getMainTextSegments(main);
  if (!segments.length) {
    return false;
  }

  const fullText = segments.map((segment) => segment.text).join('');
  const regex = buildSearchPattern(trimmedQuery);

  if (!regex) {
    return false;
  }

  const match = fullText.match(regex);

  if (!match || match.index === undefined) {
    return false;
  }

  const matchStart = match.index;
  const matchEnd = matchStart + match[0].length;
  const affectedSegments = segments.filter(
    (segment) => segment.end > matchStart && segment.start < matchEnd,
  );

  if (!affectedSegments.length) {
    return false;
  }

  let firstMark = null;

  for (let index = affectedSegments.length - 1; index >= 0; index -= 1) {
    const segment = affectedSegments[index];
    const localStart = Math.max(0, matchStart - segment.start);
    const localEnd = Math.min(segment.text.length, matchEnd - segment.start);
    const mark = wrapTextNodeMatch(segment.node, localStart, localEnd);

    if (index === 0) {
      firstMark = mark;
    }
  }

  firstMark?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  return Boolean(firstMark);
}

function findSearchMatch(query) {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return null;
  }

  const currentPage = getCurrentPage();
  const currentPageMatch = SEARCH_INDEX.find(
    (entry) =>
      entry.page === currentPage && textMatchesQuery(trimmedQuery, entry.text),
  );

  if (currentPageMatch) {
    return { page: currentPageMatch.page, query: trimmedQuery };
  }

  const otherPageMatch = SEARCH_INDEX.find((entry) =>
    textMatchesQuery(trimmedQuery, entry.text),
  );

  if (!otherPageMatch) {
    return null;
  }

  return { page: otherPageMatch.page, query: trimmedQuery };
}

function runSearch(query) {
  const match = findSearchMatch(query);

  if (!match) {
    clearHighlights();
    setSearchStatus(`No results found for "${query.trim()}".`);
    return;
  }

  const currentPage = getCurrentPage();
  const searchUrl = `${match.page}?q=${encodeURIComponent(match.query)}`;

  if (currentPage === match.page) {
    const foundOnPage = highlightAndScroll(match.query);
    history.replaceState(null, '', searchUrl);

    if (foundOnPage) {
      setSearchStatus('');
    } else {
      setSearchStatus(`No results found for "${match.query}".`);
    }
    return;
  }

  window.location.href = searchUrl;
}

const input = searchBarElement.querySelector('.search-bar-input');
const button = searchBarElement.querySelector('.search-bar-button');

button.addEventListener('click', () => {
  runSearch(input.value);
});

input.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    runSearch(input.value);
  }
});

const params = new URLSearchParams(window.location.search);
const queryFromUrl = params.get('q');

if (queryFromUrl) {
  input.value = queryFromUrl;
  const foundOnPage = highlightAndScroll(queryFromUrl);

  if (!foundOnPage) {
    setSearchStatus(`No results found for "${queryFromUrl}".`);
  }
}
