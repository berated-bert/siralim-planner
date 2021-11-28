/** Return a random element from the given array. */
function randomSample(items) {
  const item = items[Math.floor(Math.random()*items.length)];
  return item;
}

export default randomSample;