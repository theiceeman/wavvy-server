import axios from "axios";


export const Request = {
  post: async (url, data, config?) => {
    const headers = config?.headers;
    return await axios.post(url, data, {
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
    })
      .then(response => {
        return { ok: true, data: response };
      })
      .catch((error) => {
        return { ok: false, data: error };
      });
  },

  get: async (url, config?) => {
    const headers = config?.headers;
    return await axios.get(url, {
      ...config,
      headers: {
        ...headers,
        "Access-Control-Allow-Origin": process.env.REACT_APP_APP_URL,
      },
    })
      .then(response => {
        return { ok: true, data: response };
      })
      .catch((error) => {
        return { ok: false, data: error };
      });
  },
};
