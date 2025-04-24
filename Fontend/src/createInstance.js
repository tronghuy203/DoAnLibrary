import axios from "axios";
import { jwtDecode } from "jwt-decode";

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const refreshToken = async () => {
  try {
    const res = await axios.post("/v1/auth/refresh", {}, { withCredentials: true });
    return res.data;
  } catch (err) {
    console.error("Refresh token failed:", err);
    throw err;
  }
};

export const createAxios = (user, dispatch, stateSuccess) => {
  const newInstance = axios.create();

  newInstance.interceptors.request.use(
    async (config) => {
      if (!user?.accessToken) return config;

      const decodedToken = jwtDecode(user.accessToken);
      const currentTime = Date.now() / 1000;

      if (decodedToken.exp >= currentTime) {
        config.headers["token"] = "Bearer " + user.accessToken;
        return config;
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              config.headers["token"] = "Bearer " + token;
              resolve(config);
            },
            reject: (err) => reject(err),
          });
        });
      }

      isRefreshing = true;

      try {
        const data = await refreshToken();
        const newAccessToken = data.accessToken;
        const refreshUser = {
          ...user,
          accessToken: newAccessToken,
        };

        dispatch(stateSuccess(refreshUser));
        config.headers["token"] = "Bearer " + newAccessToken;
        processQueue(null, newAccessToken);
        return config;
      } catch (error) {
        processQueue(error, null);
        throw error;
      } finally {
        isRefreshing = false;
      }
    },
    (err) => Promise.reject(err)
  );

  return newInstance;
};
