const oneDegreeOfLongitudeInMeters = 111.32 * 1000;
const circumference = (40075 / 360) * 1000;

const calculateLatitudeDelta = (latitude, accuracy = 65) => accuracy * (1 / (Math.cos(latitude) * circumference));

const calculateLongitudeDelta = (accuracy = 65) => accuracy / oneDegreeOfLongitudeInMeters;

export { calculateLatitudeDelta, calculateLongitudeDelta };