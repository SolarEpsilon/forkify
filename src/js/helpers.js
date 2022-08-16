import { TIMEOUT_SEC } from './config.js';

//////////////////////////////////////////
// Helper functions used elsewhere in the project

// Simple timeout function:
const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

// Funtion to turn JSON data into usable string:
export const AJAX = async function (url, uploadData = undefined) {
  try {
    const fetchPro = uploadData
      ? fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(uploadData),
        })
      : fetch(url);

    // If request takes too long, timeout:
    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);

    const data = await res.json();

    // If response fails, throw custom error:
    if (!res.ok) throw new Error(`${data.message} (${res.status})`);

    // Return nice, usable string data containing our recipe:
    return data;

    // Error handling:
  } catch (err) {
    throw err;
  }
};

// Function to convert decimals to fractions:
export const numberToFraction = function (amount) {
  // If whole number, just return that number:
  if (parseFloat(amount) === parseInt(amount)) {
    return amount;
  }

  // Convert decimal to fraction. Code borrowed from stackoverflow.com/a/23575406:
  const gcd = function (a, b) {
    if (b < 0.0000001) {
      return a;
    }
    return gcd(b, Math.floor(a % b));
  };
  const len = amount.toString().length - 2;
  let denominator = Math.pow(10, len);
  let numerator = amount * denominator;
  var divisor = gcd(numerator, denominator);
  numerator /= divisor;
  denominator /= divisor;
  let base = 0;
  // In a scenario like 3/2, convert to 1 1/2
  // by pulling out the base number and reducing the numerator.
  if (numerator > denominator) {
    base = Math.floor(numerator / denominator);
    numerator -= base * denominator;
  }
  amount = Math.floor(numerator) + '/' + Math.floor(denominator);
  if (base) {
    amount = base + ' ' + amount;
  }
  return amount;
};
