import View from './View.js';
import icons from 'url:../../img/icons.svg'; // Parcel 2

// Class to handle recipe list pagination:
class PaginationView extends View {
  _parentElement = document.querySelector('.pagination');

  // Handle clicks on pagination:
  addHandlerClick(handler) {
    // When pagination is clicked:
    this._parentElement.addEventListener('click', function (e) {
      // Assign nearest pagination button to "btn" var:
      const btn = e.target.closest('.btn--inline');

      // Guard clause if no btn:
      if (!btn) return;

      // HTMLElement.dataset give us access to the element's data. "dataset.goto" give us the page to go to, and the "+" turns it into a number:
      const goToPage = +btn.dataset.goto;
      // From parent "view.js", go to the clicked pagination page:
      handler(goToPage);
    });
  }

  // Generate pagination buttons depending on which page of the search results we're at:
  _generateBtnMarkup(type, currentPage) {
    return `
      <button data-goto="${
        type === 'next' ? currentPage + 1 : currentPage - 1
      }" class="btn--inline pagination__btn--${type}">
        ${type === 'next' ? `<span>Page ${currentPage + 1}</span>` : ''}
          <svg class="search__icon">
            <use href="${icons}#icon-arrow-${
      type === 'next' ? 'right' : 'left'
    }"></use>
        </svg>
        ${type === 'prev' ? `<span>Page ${currentPage - 1}</span>` : ''}
        `;
  }

  // Generate search results pages:
  _generateMarkup() {
    const curPage = this._data.page;
    // Get number of pages by diving results by resultsPerPage, default 10, and rounding up:
    const numPages = Math.ceil(
      this._data.results.length / this._data.resultsPerPage
    );

    // If at page 1 and there are other pages:
    if (curPage === 1 && numPages > 1) {
      return this._generateBtnMarkup('next', curPage);
    }

    // If at last page:
    if (curPage === numPages && numPages > 1) {
      return this._generateBtnMarkup('prev', curPage);
    }
    // If there are other pages:
    if (curPage < numPages) {
      return `${this._generateBtnMarkup(
        'next',
        curPage
      )}${this._generateBtnMarkup('prev', curPage)}`;
    }
    // If at page 1 and there are NOT other pages:
    return '';
  }
}

export default new PaginationView();
