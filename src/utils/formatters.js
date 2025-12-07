export const formatCurrency = (amount) => {
  return amount.toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export const formatPercentage = (percentage) => {
  return `${percentage.toFixed(1)}%`;
};

export const roundToNextHundred = (num) => {
  return Math.ceil(num / 100) * 100;
};

export const hasValue = (value) => {
  return value !== '' && value !== null && value !== undefined;
};

export const parseNumber = (value) => {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};

export const calculateMonthsRemaining = (targetDate) => {
  const today = new Date();
  const target = new Date(targetDate);
  const diffTime = target - today;
  const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.44)); // Average days per month
  return Math.max(0, diffMonths);
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};