import * as model from './model.js';
import { MODEL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';

// Part of Webpack (used to perform updates without a full page reload):
if (module.hot) {
  module.hot.accept();
}

// Continous (async) function to control recipes:
const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();

    // 0) Update results view to mark selected search result:
    resultsView.update(model.getSearchResultsPage());

    // 1) Update bookmarks view:
    bookmarksView.update(model.state.bookmarks);

    // 2) Load recipe:
    await model.loadRecipe(id);

    // 3) Render recipe:
    recipeView.render(model.state.recipe);

    // Error handling:
  } catch (err) {
    recipeView.renderError();
    console.error(err);
  }
};

// Continous (async) function to control search results:
const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();

    // 1) Get search query:
    const query = searchView.getQuery();
    if (!query) return;

    // 2) Load search results:
    await model.loadSearchResults(query);

    // 3) Render search results at page 1:
    resultsView.render(model.getSearchResultsPage(1));

    // 4) Render initial pagination buttons:
    paginationView.render(model.state.search);

    // Error handling:
  } catch (err) {
    console.log(err);
  }
};

// Function to control pagination:
const controlPagination = function (goToPage) {
  // 1) Render NEW results:
  resultsView.render(model.getSearchResultsPage(goToPage));

  // 2) Render NEW pagination buttons:
  paginationView.render(model.state.search);
};

// Function to control recipe servings:
const controlServings = function (newServings) {
  // Update the recipe servings (in state):
  model.updateServings(newServings);

  // Update the recipe view:
  recipeView.update(model.state.recipe);
};

// Function to control adding/removing recipe bookmarks:
const controlAddBookmark = function () {
  // 1) Add/remove bookmark:
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // 2) Update recipe view:
  recipeView.update(model.state.recipe);

  // 3) Render bookmarks:
  bookmarksView.render(model.state.bookmarks);
};

// Function to render recipe bookmarks:
const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

// Continous (async) function to control adding a custom recipe:
const controlAddRecipe = async function (newRecipe) {
  try {
    // Show loading spinner:
    addRecipeView.renderSpinner();

    // Upload the new recipe data:
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    // Render recipe:
    recipeView.render(model.state.recipe);

    // Success message:
    addRecipeView.renderMessage();

    // Render bookmark view:
    bookmarksView.render(model.state.bookmarks);

    // Change ID in URL:
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // Close form window:
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODEL_CLOSE_SEC * 1000);

    // Error handling:
  } catch (err) {
    console.error('💥', err);
    addRecipeView.renderError(err.message);
  }
};

// Function to hold all other functions that run on app start:
const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
// Run app:
init();
