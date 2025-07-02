import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;


export const fetchRooms = () => {
  return axios.get(`${API_URL}/rooms`);
};

export const deleteRoom = (roomId: string) => {
  return axios.delete(`${API_URL}/rooms/${roomId}`);
};

export const createRoom = (roomId: string) => {
  return axios.post(`${API_URL}/rooms`, { roomId })
}