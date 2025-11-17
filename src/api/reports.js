import axios from './axios';

// create report
export const createReport = async (reportData) => {
  const response = await axios.post('/reports', reportData);
  return response.data;
};

// get user's submitted reports
export const getMyReports = async (params = {}) => {
  const response = await axios.get('/reports/my', { params });
  return response.data;
};

// get single report
export const getReport = async (reportId) => {
  const response = await axios.get(`/reports/${reportId}`);
  return response.data;
};