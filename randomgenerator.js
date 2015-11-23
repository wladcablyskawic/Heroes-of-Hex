var seed = 1;
function randomGenerator() {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}