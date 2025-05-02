import axios from 'axios';

export const fetchUserInfo = async () => {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    throw new Error('No access token found');
  }
  try {
    const response = await axios.get('http://localhost:8080/api/v1/auth/account', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      withCredentials: true,
    });
    return response.data; 
  // eslint-disable-next-line no-unused-vars
  } catch (err) {
    throw new Error('Failed to fetch user info');
  }
};