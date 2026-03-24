const crypto = require('crypto');

/**
 * Deterministic Seeded Shuffle
 * @param {Array} items - The array of items to shuffle
 * @param {String} seedStr - The seed string (e.g., "userId-date-day")
 * @returns {Array} Shuffled items
 */
const seededShuffle = (items, seedStr) => {
    // Create a numeric seed from the string hash
    const hash = crypto.createHash('sha256').update(seedStr).digest('hex');
    const seed = parseInt(hash.slice(0, 16), 16); // Use first 16 chars

    // Use a Linear Congruential Generator (LCG) for deterministic randomness based on the seed
    const m = 0x80000000;
    const a = 1103515245;
    const c = 12345;

    let state = seed % m;

    const nextRandom = () => {
        state = (a * state + c) % m;
        return state / (m - 1);
    };

    // Fisher-Yates shuffle using our seeded random
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(nextRandom() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
};

/**
 * Band Shuffle Strategy
 * 1. Take top K items (e.g. 30).
 * 2. Create bands based on score difference from top score.
 * 3. Shuffle inside each band.
 * 4. Concatenate bands.
 */
const applyBandShuffle = (candidates, seedStr) => {
    if (candidates.length === 0) return [];

    const topScore = candidates[0].finalScore;
    const bands = { A: [], B: [], C: [], D: [], E: [] };

    candidates.forEach(c => {
        const diff = topScore - c.finalScore;
        if (diff <= 3) bands.A.push(c);
        else if (diff <= 7) bands.B.push(c);
        else if (diff <= 12) bands.C.push(c);
        else if (diff <= 20) bands.D.push(c);
        else bands.E.push(c);
    });

    // Shuffle applicable bands
    const shuffledA = seededShuffle(bands.A, seedStr + '-A');
    const shuffledB = seededShuffle(bands.B, seedStr + '-B');
    const shuffledC = seededShuffle(bands.C, seedStr + '-C');
    const shuffledD = seededShuffle(bands.D, seedStr + '-D');
    // Band E is usually not shuffled or just appended

    return [
        ...shuffledA,
        ...shuffledB,
        ...shuffledC,
        ...shuffledD,
        ...bands.E
    ];
};

/**
 * Calculate distance in miles between two coordinates [lon, lat]
 */
const getHaversineDistance = (coords1, coords2) => {
    if (!coords1 || !coords2) return 999;

    const [lon1, lat1] = coords1;
    const [lon2, lat2] = coords2;

    const toRad = (deg) => (deg * Math.PI) / 180;

    const R = 3958.8; // Earth radius in miles
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
};

module.exports = {
    seededShuffle,
    applyBandShuffle,
    getHaversineDistance
};

