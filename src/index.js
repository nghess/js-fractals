/*---PARAMS---*/

// Set beta and seed of fractal
let beta = 3;
Math.seedrandom(9797);

// Make canvas dimensions
var sdim = 512;
var canvas = document.getElementById("noiseCanvas");
var ctx = canvas.getContext("2d");

/*---FUNCTIONS---*/

// Gaussian noise
function gaussianRandom(mean = 0, stdev = 1) {
  let u = 1 - Math.random();
  let v = Math.random();
  let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * stdev + mean;
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

// Normalize 2d array
function normalizeArray(array) {
  let minValue = 0;
  let maxValue = 0;
  for (let i = 0; i < sdim; i++) {
    for (let j = 0; j < sdim; j++) {
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

// Take real part of complex numbers
function getRealPart(complexArray) {
  let realpart = Array(sdim).fill().map(() => Array(sdim).fill(0));
  for (let i = 0; i < sdim; i++) {
    for (let j = 0; j < sdim; j++) {
      realpart[i][j] = (complexArray[i][j].re);
    }
  }
  return realpart;
}

/*---Execute---*/

// Generate power spectrum frame
len = sdim
let f = [];
for (let i = 0; i <= Math.floor(sdim / 2); i++) {
  f.push(i / sdim);
}
for (let i = -Math.floor(sdim / 2); i < 0; i++) {
  f.push(i / sdim);
}
let u = [];
let v = [];
for (let i = 0; i < f.length; i++) {
  u[i] = f[i];
  v[i] = f[i];
}
u = u.slice(0, sdim);
v = v.slice(0, sdim);


// Shape power spectrum with beta value
let powerspectrum = Array(sdim).fill().map(() => Array(sdim).fill(0));
for (let i = 0; i < sdim; i++) {
  for (let j = 0; j < sdim; j++) {
    powerspectrum[i][j] = Math.pow(
      Math.pow(u[i], 2) + Math.pow(v[j], 2),
      -beta / 2
    );
  }
}

// Get rid of inf at corner of ps
powerspectrum[0][0] = powerspectrum[0][1]

// Generate Gaussian white noise 
var noise = generateWhiteNoise(sdim, sdim);

// Prepare arrays for IFFT
let cos = Array(sdim).fill().map(() => Array(sdim).fill(0));
let sin = Array(sdim).fill().map(() => Array(sdim).fill(0));
let ps = Array(sdim).fill().map(() => Array(sdim).fill(0));

for (let i = 0; i < sdim; i++) {
  for (let j = 0; j < sdim; j++) {
    cos[i][j] = math.cos(2 * Math.PI * noise[i][j]);
    cos[i][j] = math.complex(cos[i][j], 0)
    sin[i][j] = math.sin(2 * Math.PI * noise[i][j]);
    sin[i][j] = math.complex(0, sin[i][j])
    ps[i][j] = math.sqrt(powerspectrum[i][j])
  }
}

// Create fractal
waves = math.add(cos, sin)
guts = math.dotMultiply(ps, waves)
fractal = normalizeArray(getRealPart(math.ifft(guts)))

// Render to canvas
let imageData = ctx.createImageData(sdim, sdim);
let data = imageData.data;
for (let i = 0; i < sdim; i++) {
  for (let j = 0; j < sdim; j++) {
    let value = Math.floor(fractal[i][j] * 255);
    let offset = (i * sdim + j) * 4;
    data[offset + 0] = value;
    data[offset + 1] = value;
    data[offset + 2] = value;
    data[offset + 3] = 255;
  }
}
ctx.putImageData(imageData, 0, 0);
