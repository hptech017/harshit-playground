
import axios from "axios";

const API_BASE = "http://192.168.1.4:2000/api";

export const placeOrder = async (payload) => {
  try {
    const res = await axios.post(`${API_BASE}/trade/order`, payload);
    return res.data; // backend ka response return
  } catch (err) {
    throw err.response?.data || { message: err.message };
  }
};
