function progressBar(passedDays) {
  const totalDays = 131;

  const percentage = Math.round((passedDays / totalDays) * 100);

  const progressBarSize = 20;
  const progress = Math.round((percentage / 100) * progressBarSize);

  const progressBar =
    "[" +
    "=".repeat(progress) +
    "  ".repeat(progressBarSize - progress) +
    "] " +
    percentage +
    "%";

  return progressBar;
}

module.exports = progressBar;
