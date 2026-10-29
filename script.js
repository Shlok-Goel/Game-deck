const API_KEY = '4c72f87c0a984d659aa663d209f31122';
const MAX_PAGES=500;

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function updateUI(game) {
  document.querySelector('.game-name').textContent = game.title;
  document.querySelector('.year').textContent = game.year;
  document.querySelector('.desc').textContent = game.description;


  const img = document.querySelector('.game-image');
  img.src = game.image;
  document.querySelector('.heading').textContent=game.title;

  const insp_btn=document.querySelector('.inspect-button');
  if (insp_btn) {
    // Store the URL on the button element
    insp_btn.setAttribute('data-url', game.storeUrl);
  }


  
}

async function fetchNextGame() {
    function truncateText(text, maxLength = 200) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    
    // Cut text at maxLength and ensure it doesn't break mid-word
    const trimmedText = text.substring(0, maxLength);
    return trimmedText.substring(0, trimmedText.lastIndexOf(' ')) + '...';
}
  try {

    const randomPage = getRandomInt(1, MAX_PAGES);

    // 1. Fetch the list of games
    const listResponse = await fetch(
      `https://api.rawg.io/api/games?key=${API_KEY}&page=${randomPage}&page_size=10`
    );
    const listData = await listResponse.json();

    if (listData.results && listData.results.length > 0) {
      // 2. Pick a random game index out of the returned batch (0 through listData.results.length - 1)
      const randomIndex = getRandomInt(0, listData.results.length - 1);
      const basicGame = listData.results[randomIndex];

      // 2. Fetch full details using the game's ID
      const detailResponse = await fetch(
        `https://api.rawg.io/api/games/${basicGame.id}?key=${API_KEY}`
      );
      const detailedGame = await detailResponse.json();

      // 3. Clean up the detailed description
      // RAWG returns descriptions formatted in HTML, so we strip out HTML tags
      const cleanDescription = detailedGame.description_raw || 
        detailedGame.description.replace(/<[^>]*>?/gm, '');

      

      // 4. Construct complete game object
      const gameData = {
        title: detailedGame.name,
        image: detailedGame.background_image,
        year: detailedGame.released ? detailedGame.released.split('-')[0] : 'N/A',
        description: truncateText(cleanDescription, 300), // Real text summary of the game!

        storeUrl: detailedGame.website || `https://store.steampowered.com/search/?term=${encodeURIComponent(detailedGame.name)}`

      };

      updateUI(gameData);
      
    }
  } catch (error) {
    console.error('Error fetching game details:', error);
  }
}

// Attach event listeners to your UI buttons
document.getElementsByClassName('pass-button')[0].addEventListener('click', fetchNextGame);
document.getElementsByClassName('WL-button')[0].addEventListener('click', () => {
  // Optional: save game to a wishlist array here
  fetchNextGame();
});

// Place this event listener near the bottom of your script file with your pass/wishlist button listeners:
document.querySelector('.inspect-button')?.addEventListener('click', (e) => {
  const url = e.target.getAttribute('data-url');
  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
});


// Fetch initial game on page load
fetchNextGame();