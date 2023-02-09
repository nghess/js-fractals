//const math = require("src/math.js");

// Make canvas dimensions
var sdim = 128;
var canvas = document.getElementById("noiseCanvas");
var ctx = canvas.getContext("2d");

Math.seedrandom(117);

// Standard Normal variate using Box-Muller transform.
function gaussianRandom(mean = 0, stdev = 1) {
  let u = 1 - Math.random();
  let v = Math.random();
  let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  // Transform to the desired mean and standard deviation:
  return z * stdev + mean;
}

// Normalize 2d array
function normalizeArray(array) {
  let minValue = 0;
  let maxValue = 0;
  for (let i = 0; i < array.length; i++) {
    for (let j = 0; j < array[i].length; j++) {
      minValue = Math.min(minValue, array[i][j]);
      maxValue = Math.max(maxValue, array[i][j]);
    }
  }
  for (let i = 0; i < array.length; i++) {
    for (let j = 0; j < array[i].length; j++) {
      array[i][j] = (array[i][j] - minValue) / (maxValue - minValue);
    }
  }
  return array;
}

// Generate 2d white noise
function generateWhiteNoise(width, height) {
  let noise = [];
  for (let i = 0; i < height; i++) {
    noise[i] = [];
    for (let j = 0; j < width; j++) {
      noise[i][j] = gaussianRandom()*255;
    }
  }
  return noise;
}


// Build power spectrum frame
len = sdim+1
let f = [];
for (let i = 0; i <= Math.floor(len / 2); i++) {
  f.push(i / len);
}
for (let i = -Math.floor(len / 2); i < 0; i++) {
  f.push(i / len);
}

let u = [];
for (let i = 0; i < f.length; i++) {
  u[i] = f[i];
}
u = u.slice(0, len);

let v = [];
for (let i = 0; i < f.length; i++) {
  v[i] = f[i];
}
v = v.slice(0, len);

// Generate power spectrum
let beta = 3.5;
// Generate noise array and normalize
var noise = normalizeArray(generateWhiteNoise(sdim, sdim));

let powerspectrum = Array(sdim).fill().map(() => Array(sdim).fill(1));
for (let i = 0; i < sdim; i++) {
  for (let j = 0; j < sdim; j++) {
    powerspectrum[i][j] = Math.pow(
      Math.pow(u[i], 2) + Math.pow(v[j], 2),
      -beta / 2
    );
  }
}
// Get rid of inf
powerspectrum[0][0] = powerspectrum[0][1]

//Up to this point we are good.

// Perform ifft with mathjs
let tester = Array(sdim).fill().map(() => Array(sdim).fill(2.3));
let fft_result = Array(sdim).fill().map(() => Array(sdim).fill(0));
let cos = Array(sdim).fill().map(() => Array(sdim).fill(0));
let sin = Array(sdim).fill().map(() => Array(sdim).fill(0));
let waves = Array(sdim).fill().map(() => Array(sdim).fill(0));
for (let i = 0; i < sdim; i++) {
  for (let j = 0; j < sdim; j++) {
    cos[i][j] = math.cos(2 * Math.PI * noise[i][j]);
    sin[i][j] = math.sin(2 * Math.PI * noise[i][j]);
    cos[i][j] = math.complex(cos[i][j], 0)
    sin[i][j] = math.complex(0, sin[i][j])
    waves[i][j] = math.add(cos[i][j], sin[i][j])
    powerspectrum[i][j] = math.sqrt(powerspectrum[i][j])
    //console.log(sin)

  }
}

for (let i = 0; i < sdim; i++) {
  for (let j = 0; j < sdim; j++) {
  fft_result[i][j] = math.multiply(powerspectrum[i][j], waves[i][j])
  } 
}

//fft_result = math.multiply(powerspectrum, waves)


function getRealPart(complexArray) {
  let realpart = Array(sdim).fill().map(() => Array(sdim).fill(0));
  for (let i = 0; i < sdim; i++) {
    for (let j = 0; j < sdim; j++) {
      realpart[i][j] = (complexArray[i][j].re);
    }
  }
  return realpart;
}

noise = normalizeArray(getRealPart(math.ifft(fft_result)))
//noise = fft_result

let real = []



for (let i = 0; i < sdim; i++) {
  for (let j = 0; j < noise[i].length; j++) {
    let value = Math.floor(noise[i][j] * 255);
    ctx.fillStyle = "rgb(" + value + ", " + value + ", " + value + ")";
    ctx.fillRect(j, i, 1, 1);
  }
}
