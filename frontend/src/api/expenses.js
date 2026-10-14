
import api from "./axios";

export const createExpense = async (expenseData) => {
  const response = await api.post("/expenses/", expenseData);
  return response.data;
};

export const getExpenses = async (params = {}) => {
  const response = await api.get("/expenses/", { params });
  return response.data;
};

export const updateExpense = async (expenseId, expenseData) => {
  const response = await api.put(`/expenses/${expenseId}`, expenseData);
  return response.data;
};

// Delete an expense
export const deleteExpense = async (expenseId) => {
  const response = await api.delete(`/expenses/${expenseId}`);
  return response.data;
};

export const getDashboard = async (year, month) => {
  const response = await api.get("/expenses/dashboard", {
    params: { year, month },
  });
  return response.data;
};
