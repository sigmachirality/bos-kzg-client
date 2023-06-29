// import './noblecurves.js';

const FR = nobleCurves.bls12_381.fields.Fr;
const G1 = nobleCurves.bls12_381.G1.CURVE;
const G2 = nobleCurves.bls12_381.G2.CURVE;

function decodeContributions(contributions) {
  for (var i = 0; i < contributions.length; i++) {
    for(var j = 0; j < contributions[i].numG1Powers; j++){
        var hexStr = contributions[i].powersOfTau.G1Powers[j].substring(2);
        var hex = nobleCurves.utils.hexToBytes(hexStr);
        var affinePoint = G1.fromBytes(hex);
        contributions[i].powersOfTau.G1Powers[j] = affinePoint; 
    }

    for(var j = 0; j < contributions[i].numG2Powers; j++){
        var hexStr = contributions[i].powersOfTau.G2Powers[j].substring(2);
        var hex = nobleCurves.utils.hexToBytes(hexStr);
        var affinePoint = G2.fromBytes(hex);
        contributions[i].powersOfTau.G2Powers[j] = affinePoint;
    }
  }
  return contributions;
}

function hashFnv32a(str, asString, seed) {
    /*jshint bitwise:false */
    var i, l,
        hval = (seed === undefined) ? 0x811c9dc5 : seed;

    for (i = 0, l = str.length; i < l; i++) {
        hval ^= str.charCodeAt(i);
        hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
    }
    if( asString ){
        // Convert to 8 digit hex string
        return ("0000000" + (hval >>> 0).toString(16)).substr(-8);
    }
    return hval >>> 0;
}

function generateRandom(entropy){
    const seedInt = hashFnv32a(entropy)
    randomBytes = crypto.randomUUID();
    const randomInt = (parseInt(randomBytes, 16) + seedInt);
    const randomBigInt = BigInt(randomInt);
    return randomBigInt;
}

function contribute(contributions, rands) {
  for(var i = 0; i < contributions.length; i++) {
      const g1Powers = contributions[i].powersOfTau.G1Powers;
      const g2Powers = contributions[i].powersOfTau.G2Powers;
      var xi = BigInt(1);
      for(var j = 0; j < contributions[i].numG1Powers; j++) {
          const g1Affine = g1Powers[j];
          const g1PrjPoint = G1Point.fromAffine(g1Affine);

          const g1NewPrjPoint = g1PrjPoint.multiply(xi);
          const g1NewAffine = g1NewPrjPoint.toAffine();

          contributions[i].powersOfTau.G1Powers[j] = g1NewAffine;

          if (j < contributions[i].numG2Powers) {
              const g2Affine = g2Powers[j];
              const g2PrjPoint = G2Point.fromAffine(g2Affine);

              const g2NewPrjPoint = g2PrjPoint.multiply(xi);
              const g2NewAffine = g2NewPrjPoint.toAffine();

              contributions[i].powersOfTau.G2Powers[j] = g2NewAffine;
          }
          xi = (xi * rands[i]) % Fr.ORDER;
      }
  };
  return contributions;
}

function updateWitness(contributions, rand) {
    for(var i = 0; i < contributions.length; i++) {
        const potPubkey = contributions[i].potPubkey;
        const hexStr = potPubkey.substring(2);

        // PotPub -> G2Affine
        const hex = nobleCurves.utils.hexToBytes(hexStr);

        const potPubkeyAffine = G2.fromBytes(hex);

        const potPubkeyPrj = G2Point.fromAffine(potPubkeyAffine);
        const newPubkeyPrj = potPubkeyPrj.multiply(rand[i])

        const newPotPubkey = nobleCurves.utils.bytesToHex(G2.toBytes(G2Point, newPubkeyPrj, true));

        contributions[i].potPubkey = '0x' + newPotPubkey;
    }

    return contributions;
}

function runCeremony(entropy, contributions) {
  const prevContributions = decodeContributions(contributions);
  var rands = [];
  for (var i = 0; i < prevContributions.length; i++) {
    rands[i] = generateRandom(entropy);
    rands[i] = Fr.create(rands[i]);
  }
  let newContributions = contribute(prevContributions, rands);
  newContributions = updateWitness(newContributions, rands);

  delete newContributions[0].blsSignature
  delete newContributions[1].blsSignature
  delete newContributions[2].blsSignature
  delete newContributions[3].blsSignature

  return newContributions;
}

window.addEventListener("message", (event) => {
  const { stage } = event;

  if (stage === 'computing') {
    const { contributions, entropy } = event.data
    try {
      const contributions = runCeremony(entropy, contributions);
      window.top.postMessage(contributions, "*")
    } catch (e) {
      console.error(e);
    }
  }
}, false);