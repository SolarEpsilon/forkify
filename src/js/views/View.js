import icons from 'url:../../img/icons.svg'; // Parcel 2

// Parent class for methods that child classes use in other views:
export default class View {
  _data;

  /**
   * Render the received object to the DOM
   * @param {Object | Object[]} data The data to be rendered (e.g. recipe).
   * @param {boolean} [render=true] If false, create markup string instead of rendering to the DOM.
   * @returns {undefined | string} A markup string is returned if render=false
   * @this {Object} View instance
   * @author Ronan Magnus
   * @todo Finish implementation
   */

  // Method to render data (used in child views):
  render(data, render = true) {
    if (!data || (Array.isArray(data) && data.length === 0))
      return this.renderError();

    this._data = data;
    const markup = this._generateMarkup();

    if (!render) return markup;

    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  // Method to update data:
  update(data) {
    this._data = data;
    const newMarkup = this._generateMarkup();

    // Create new virtual DOM (basically a fresh DOM, which we'll update our data to):
    const newDOM = document.createRange().createContextualFragment(newMarkup);

    // Create an array of all new elements from our new virtual DOM:
    const newElements = Array.from(newDOM.querySelectorAll('*'));

    // Create an array of all current/previous elements (not in the virtual DOM):
    const curElements = Array.from(this._parentElement.querySelectorAll('*'));

    newElements.forEach((newEl, i) => {
      // Go through "curElements" and extract each piece of data, setting it to "curEl":
      const curEl = curElements[i];

      // Update changed TEXT:
      if (
        !newEl.isEqualNode(curEl) &&
        newEl.firstChild?.nodeValue.trim() !== ''
      ) {
        // Update curEl to newEl:
        curEl.textContent = newEl.textContent;
      }

      // Update changed ATTRIBUTES:
      if (!newEl.isEqualNode(curEl))
        Array.from(newEl.attributes).forEach(attr =>
          curEl.setAttribute(attr.name, attr.value)
        );
    });
  }

  // Method to clear parent element:
  _clear() {
    this._parentElement.innerHTML = '';
  }

  // Method to handle search results loading spinner:
  renderSpinner() {
    const markup = `
    <div class="spinner">
            <svg>
              <use href="${icons}#icon-loader"></use>
            </svg>
          </div>`;

    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  // Method to handle error message:
  renderError(message = this._errorMessage) {
    console.log('Error initiated!');
    const markup = `
      <div class="error">
        <div>
          <svg>
            <use href="${icons}#icon-alert-triangle"></use>
          </svg>
        </div>
        <p>${message}</p>
      </div>
    `;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  // Method to handle welcome message:
  renderMessage(message = this._message) {
    const markup = `
        <div class="message">
                <div>
                <svg>
                    <use href="${icons}#icon-smile"></use>
                </svg>
                </div>
                <p>${message}</p>
            </div>
            `;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }
}
