// src/api/user-api.js

import axios from "axios";
import { backendConfig } from "../mainContent"; // not MainContent

const apiUrl = backendConfig.base;

export const registerUser = async (payload) => {
  try {
    const response = await axios.post(`${apiUrl}/user/register`, payload);
    return response.data;
  } catch (error) {
    console.error("Axios error:", error);
    throw error?.response?.data || { message: "Something went wrong" };
  }
};
