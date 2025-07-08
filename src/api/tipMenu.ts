import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;


export const fetchTipMenu = (roomId: string) => {
  return axios.get(`${API_URL}/tip-menu/${roomId}`);
};

export const updateTipMenu = (roomId: string, data: any) => {
  return axios.put(`${API_URL}/tip-menu/${roomId}`, data);
};
