var randomSeed = 0;
function randomGenerator() {
    var x = Math.sin(++randomSeed) * 10000;
    return x - Math.floor(x);
}