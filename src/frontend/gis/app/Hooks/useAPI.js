export default (URL = "http://localhost:20002/api") => {
  const options = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const GET = (route, options) => {
    return fetch(`${URL}${route}`, options)
      .then(response => response.json());
  };

  return {
    GET,
  };
};