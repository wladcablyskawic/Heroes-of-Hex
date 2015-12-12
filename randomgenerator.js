var randomSeed = 0;
function randomGenerator() {
    var x = Math.sin(++randomSeed) * 10000;
	console.log('rg: '+(x - Math.floor(x)));
    return x - Math.floor(x);
}