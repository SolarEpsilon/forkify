import View from './View.js';
import icons from 'url:../../img/icons.svg'; // Parcel 2

// Class for showing recipes in search and bookmarks:
class PreviewView extends View {
  // Clear parent element:
  _parentElement = '';

  _generateMarkup() {
    // Get the page ID of the opened recipe:
    const id = window.location.hash.slice(1);

    // HTML string showing the recipe preview. This code is used both to show the recipes in search results and in our bookmarked recipes:
    return `
      <li class="preview">
          <a class="preview__link ${
            this._data.id === id ? 'preview__link--active' : ''
          }" href="#${this._data.id}">
              <figure class="preview__fig">
                  <img src="${this._data.image}" alt="${this._data.title}" />
          </figure>
              <div class="preview__data">
                  <h4 class="preview__title">${this._data.title}</h4>
                  <p class="preview__publisher">${this._data.publisher}</p>
                  <div class="preview__user-generated ${
                    this._data.key ? '' : 'hidden'
                  }">
                    <svg>
                    <use href="${icons}#icon-user"></use>
                    </svg>
                  </div>
              </div>
          </a>
    </li>
      `;
  }
}

export default new PreviewView();
