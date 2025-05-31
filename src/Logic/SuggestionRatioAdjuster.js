class SuggestionRatioAdjuster {
  constructor(likeWeight = 1.3, commentWeight = 2.0, clickWeight = 1.0) {
    this.likeWeight = likeWeight;
    this.commentWeight = commentWeight;
    this.clickWeight = clickWeight;
  }

  computeScores(interactions) {
    const scores = {};
    for (const entry of interactions) {
      const { industry, likes, comments, clicks } = entry;
      const score = (
        (likes * this.likeWeight) +
        (comments * this.commentWeight) +
        (clicks * this.clickWeight)
      );
      scores[industry] = score;
    }
    return scores;
  }

  adjustRatios(interactions, totalSuggestions = 30) {
    const scores = this.computeScores(interactions);
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

    const adjustedRatios = {};
    const industries = Object.keys(scores);

    if (totalScore === 0) {
      const equalRatio = Math.floor(totalSuggestions / industries.length);
      for (const industry of industries) {
        adjustedRatios[industry] = equalRatio;
      }
      return adjustedRatios;
    }

    // Step 1: compute raw ratios
    for (const industry of industries) {
      adjustedRatios[industry] = Math.round((scores[industry] / totalScore) * totalSuggestions);
    }

    // Step 2: handle rounding error
    let currentTotal = Object.values(adjustedRatios).reduce((a, b) => a + b, 0);
    let diff = totalSuggestions - currentTotal;

    if (diff !== 0) {
      // adjust the most influential industry
      const targetIndustry = diff > 0
        ? industries.reduce((a, b) => (scores[a] > scores[b] ? a : b))
        : industries.reduce((a, b) => (scores[a] < scores[b] ? a : b));
      adjustedRatios[targetIndustry] += diff;
    }

    return adjustedRatios;
  }
}

export default SuggestionRatioAdjuster;


//how to use

// import AISuggestionEngine from './src/Logic/AISuggestionEngine.js';

// const interactions = [
//   { industry: 'tech', likes: 50, comments: 20, clicks: 100 },
//   { industry: 'finance', likes: 20, comments: 10, clicks: 10 },
//   { industry: 'health', likes: 10, comments: 50, clicks: 20 }
// ];

// const adjuster = new AISuggestionEngine ();
// const newRatios = adjuster.adjustRatios(interactions);

// console.log(newRatios);