const axios = require('axios');

async function searchShows(searchTerm) {
    try {
      const response = await axios.get(`https://api.tvmaze.com/search/shows?q=${searchTerm}`);
      return response.data;
    } catch (error) {
        console.error('Error searching for shows:', error);
        return [];
    }
} 

async function getShowById(showId) {
  try {
      const response = await axios.get(`http://api.tvmaze.com/shows/${showId}`);
      return response.data;
  } catch (error) {
      console.error('Error fetching show data:', error);
      return null;
  }
}




module.exports = {
  searchShows,
  getShowById
}
  