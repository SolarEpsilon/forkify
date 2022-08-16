import { API_URL, RES_PER_PAGE, KEY } from './config.js';
import { AJAX } from './helpers.js';

// Create state variable. Will be filled with actual data later in the file:
export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    page: 1,
    resultsPerPage: RES_PER_PAGE,
  },
  bookmarks: [],
};

// Function to create recipe data. Just like with "state", function is replaced with actual data later:
const createRecipeObject = function (data) {
  const { recipe } = data.data;
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && { key: recipe.key }),
  };
};

// Continuous (async) function to load recipe data:
export const loadRecipe = async function (id) {
  try {
    // Create AJAX call using our API's URL, the recipe ID, and the recipe key:
    const data = await AJAX(`${API_URL}/${id}?key=${KEY}`);

    // Assign state.recipe to the created recipe data function using "data", which we received from our AJAX call:
    state.recipe = createRecipeObject(data);

    // If the recipe is bookmarked, load that recipe instead of a new one:
    if (state.bookmarks.some(bookmark => bookmark.id === id))
      state.recipe.bookmarked = true;
    else state.recipe.bookmarked = false;

    // Error handling:
  } catch (err) {
    console.error(`${err} 💥💥💥💥💥`);
    throw err;
  }
};

// Continuous (async) function to load search results:
export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;

    // Create AJAX call using our API's URLs, the search querries, and the recipes' keys:
    const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);

    // Set search results to the recipes data.
    // For each recipe, return a new array with all the recipe data assigned to the correct data in "state.search.results":
    state.search.results = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        ...(rec.key && { key: rec.key }),
      };
    });
    // Reset page to 1 when we do a new search:
    state.search.page = 1;

    // Error handling:
  } catch (err) {
    console.error(`${err} 💥💥💥💥💥`);
    throw err;
  }
};

// Function to get the number of search results pages:
export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;

  const start = (page - 1) * state.search.resultsPerPage;
  const end = page * state.search.resultsPerPage;

  return state.search.results.slice(start, end);
};

// Function to update recipe servings:
export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
  });

  // Reset servings:
  state.recipe.servings = newServings;
};

// Function to retain bookmarks after page reload:
const persistBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

// Function to add bookmark to current recipe:
export const addBookmark = function (recipe) {
  // Add bookmark:
  state.bookmarks.push(recipe);

  // Mark current recipe as bookmarked:
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;

  // Update bookmarks in local storage:
  persistBookmarks();
};

// Function to delete bookmark from current recipe:
export const deleteBookmark = function (id) {
  // Find bookmark index:
  const index = state.bookmarks.findIndex(el => el.id === id);
  // Remove using "splice". We take out 1 element, the bookmark, using the arguements:
  state.bookmarks.splice(index, 1);

  // Mark current recipe as no longer bookmarked:
  if (id === state.recipe.id) state.recipe.bookmarked = false;

  // Update bookmarks in local storage:
  persistBookmarks();
};

// Function to hold local storage:
const init = function () {
  const storage = localStorage.getItem('bookmarks');
  // If there is data in local storage, set bookmarks:
  if (storage) state.bookmarks = JSON.parse(storage);
};
init();

// Continuous (async) function to handle uploading recipes:
export const uploadRecipe = async function (newRecipe) {
  try {
    // Take raw input data and transform it into the format we want using array methods:
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        const ingArr = ing[1].split(',').map(el => el.trim());
        // If array format is not 3 ingredients separated by commas, throw error:
        if (ingArr.length !== 3)
          throw new Error(
            'Wrong ingredient format! Please use the correct format :)'
          );

        // Unpack ingredients:
        const [quantity, unit, description] = ingArr;

        // Return the unpacked ingredients. If quantity exists, make it a string. If quantity does not exist, make its value "null":
        return { quantity: quantity ? +quantity : null, unit, description };
      });

    // Create new recipe object with the data the user entered:
    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    };

    // Create URL and use our recipe upload data:
    const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);

    // Create recipe and add it to our bookmarks:
    state.recipe = createRecipeObject(data);
    addBookmark(state.recipe);
    // Error handling:
  } catch (err) {
    console.error(`${err} 💥💥💥💥💥`);
    throw err;
  }
};
