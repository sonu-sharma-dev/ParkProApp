export const parkingData = {
    revenue: {
      daily: 4000,
      weekly: 54000,
      monthly: 260000,
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{ data: [2000, 3000, 4000, 3500, 6000, 8000, 1250] }],
    },
    expenseProfit: {
      labels: ['Expense', 'Profit'],
      datasets: [
        { data: [12000, 24000], color: () => `#FF5722` }, // Expense
        { data: [24000, 36000], color: () => `#4CAF50` }, // Profit
      ],
    },
    usageStats: {
      labels: ['Jan', 'Feb', 'Mar'],
      data: [0.6, 0.8, 0.7],
    },
    usageDistribution: [
      { name: 'Hourly', population: 300, color: '#4CAF50', legendFontColor: '#000', legendFontSize: 14 },
      { name: 'Daily', population: 150, color: '#FF5722', legendFontColor: '#000', legendFontSize: 14 },
      { name: 'Monthly', population: 50, color: '#2196F3', legendFontColor: '#000', legendFontSize: 14 },
    ],
    totalSlots: 50,
    hoursUtilized: 250,
  };
  