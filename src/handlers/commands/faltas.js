function calculateMissingClasses(hours) {
    const hoursInMisses = parseInt(0.3 * hours);
    return hoursInMisses;
}

module.exports = async (msg) => {
    const hours = [30, 45, 60, 75, 90, 120];
    const missingClasses = hours.map((hour) => (
        {
            hour, 
            misses: calculateMissingClasses(hour)
        }
        ));

    const message = missingClasses.reduce((acc, curr) => {
        return acc + `${curr.hour}h: ${curr.misses} faltas\n`
    }, '*Bom semestre!* \n');

    await msg.reply(message);
}