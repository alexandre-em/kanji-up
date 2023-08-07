import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export const checkJwtTokenValidity = async (token: string) => {
  return axios.get(`${process.env.AUTH_BASE_URL}/session/check`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
