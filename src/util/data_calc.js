function days_until(dateString) {
    const today = new Date();
    const targetDate = new Date(dateString);
    
    const differenceInTime = targetDate.getTime() - today.getTime();
    
    const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
    
    return differenceInDays;
}

module.exports = days_until