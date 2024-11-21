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
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const csrfToken = getCookie("csrftoken");
    const userUUID = getCookie("user_uuid");
    if (csrfToken) {
      config.headers["X-CSRFToken"] = csrfToken;
    }
    if (userUUID) {
      config.headers["X-User-UUID"] = userUUID;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
export { getCookie };
