exports.calculateAccuracy = (correct, total) =>
  total === 0 ? 0 : (correct / total) * 100;

exports.calculatePercentage = (score, total) => (score / total) * 100;