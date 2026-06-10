const express = require("express");
const axios = require("axios");

const router = express.Router();

router.get("/movies", async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.themoviedb.org/3/movie/now_playing",
      {
        headers: {
          Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5YWYwYTU1NjlhMDM0OTI4YWRhYzFkODM4MTVjMjQ1MCIsIm5iZiI6MTc4MTA4MDEyNi42MDksInN1YiI6IjZhMjkyMDNlODlhMzkyNjYyYjg5NjMwYyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ._KoklfuSoBq9u25Tn1FrbjmC8-IWxbCKBG2OEsnCk68}`
        }
      }
    );

    res.json(response.data.results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "TMDB Error" });
  }
});

module.exports = router;