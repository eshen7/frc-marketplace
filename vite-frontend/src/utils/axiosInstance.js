import axios from "axios";

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

const axiosInstance = axios.create({
  baseURL: "https://millenniummarket.net/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const csrfToken = getCookie("csrftoken");
    const userID = getCookie("user_id");
    if (csrfToken) {
      config.headers["X-CSRFToken"] = csrfToken;
    }
    if (userID) {
      config.headers["X-User-ID"] = userID;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
export { getCookie };
