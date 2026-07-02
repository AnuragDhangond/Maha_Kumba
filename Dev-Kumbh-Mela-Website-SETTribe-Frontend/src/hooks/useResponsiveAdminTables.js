import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const TABLE_SELECTOR = '.table-wrapper-premium .admin-table';
const TOGGLE_SELECTOR = '.responsive-row-toggle';

const cleanLabel = (value) => value.replace(/\s+/g, ' ').trim();

const setExpandedState = (row, expanded) => {
  row.setAttribute('data-expanded', expanded ? 'true' : 'false');

  const button = row.querySelector(TOGGLE_SELECTOR);

  if (button) {
    button.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    button.setAttribute('aria-label', expanded ? 'Hide row details' : 'Show row details');
    button.title = expanded ? 'Hide row details' : 'Show row details';
  }
};

const ensureToggleButton = (row, firstCell) => {
  let button = firstCell.querySelector(TOGGLE_SELECTOR);

  if (!button) {
    button = document.createElement('button');
    button.type = 'button';
    button.className = 'responsive-row-toggle';
    button.setAttribute('data-row-toggle', 'true');
    firstCell.appendChild(button);
  }

  firstCell.classList.add('responsive-summary-cell');

  if (!row.hasAttribute('data-expanded')) {
    row.setAttribute('data-expanded', 'false');
  }

  setExpandedState(row, row.getAttribute('data-expanded') === 'true');
};

const syncResponsiveAdminTables = () => {
  const tables = document.querySelectorAll(TABLE_SELECTOR);

  tables.forEach((table) => {
    const headers = Array.from(table.querySelectorAll('thead th'))
      .map((header) => cleanLabel(header.textContent || ''))
      .filter(Boolean);

    if (!headers.length) {
      return;
    }

    table.querySelectorAll('tbody tr').forEach((row) => {
      const cells = Array.from(row.children).filter(
        (cell) => cell instanceof HTMLTableCellElement && cell.tagName.toLowerCase() === 'td'
      );
      const isExpandableRow = cells.length > 1 && !cells.some((cell) => cell.colSpan > 1);

      if (!isExpandableRow) {
        row.removeAttribute('data-responsive-row');
        row.removeAttribute('data-expanded');

        cells[0]?.classList.remove('responsive-summary-cell');
        cells[0]?.querySelector(TOGGLE_SELECTOR)?.remove();
      } else {
        row.setAttribute('data-responsive-row', 'true');
        ensureToggleButton(row, cells[0]);
      }

      cells.forEach((cell, index) => {
        if (!(cell instanceof HTMLTableCellElement) || cell.tagName.toLowerCase() !== 'td') {
          return;
        }

        const label = headers[index] || headers[headers.length - 1];

        if (label) {
          cell.setAttribute('data-label', label);
        }
      });
    });
  });
};

const useResponsiveAdminTables = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    let frameId = null;
    const rootNode = document.getElementById('root');

    const scheduleSync = () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }

      frameId = window.requestAnimationFrame(() => {
        syncResponsiveAdminTables();
        frameId = null;
      });
    };

    scheduleSync();

    const observer = new MutationObserver(() => {
      scheduleSync();
    });

    const handleRootClick = (event) => {
      const toggleButton = event.target.closest(TOGGLE_SELECTOR);

      if (!toggleButton) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const row = toggleButton.closest('tr[data-responsive-row="true"]');

      if (!row) {
        return;
      }

      const shouldExpand = row.getAttribute('data-expanded') !== 'true';
      const siblingRows = row.parentElement?.querySelectorAll('tr[data-responsive-row="true"]') || [];

      siblingRows.forEach((siblingRow) => {
        setExpandedState(siblingRow, siblingRow === row ? shouldExpand : false);
      });
    };

    if (rootNode) {
      observer.observe(rootNode, {
        childList: true,
        subtree: true,
        characterData: true,
      });

      rootNode.addEventListener('click', handleRootClick);
    }

    return () => {
      observer.disconnect();

      if (rootNode) {
        rootNode.removeEventListener('click', handleRootClick);
      }

      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [pathname]);
};

export default useResponsiveAdminTables;
