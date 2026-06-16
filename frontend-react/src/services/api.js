// services/api.js
import axios from "axios";

export const analyzeText = async (text) => {
  const res = await axios.post("http://127.0.0.1:8000/analyze", {
    text,
  });
  return res.data;
};