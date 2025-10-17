import axios from "axios";

const API_BASE = "http://localhost:3000/api";

// get assets
export const fetchAssets = async () => {
  const { data } = await axios.get(`${API_BASE}/assets`);
  return data;
};

// place order
export const placeOrder = async (order) => {
  const { data } = await axios.post(`${API_BASE}/order`, order);
  return data;
};

// get order history
export const fetchOrders = async () => {
  const { data } = await axios.get(`${API_BASE}/orders`);
  return data;
};
