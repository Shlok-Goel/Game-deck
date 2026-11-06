const API_KEY = '4c72f87c0a984d659aa663d209f31122';
const MAX_PAGES=500;

let currentGame=null;

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

const USE_MOCK=true;

async function fetchNextGame() {
  function truncateText(text, maxLength = 200) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    const trimmedText = text.substring(0, maxLength);
    return trimmedText.substring(0, trimmedText.lastIndexOf(' ')) + '...';
  }

  try {
    let detailedGame;

    if (USE_MOCK) {
      const res = await fetch('./games.json');
      const data = await res.json();
      const randomIndex = getRandomInt(0, data.results.length - 1);
      detailedGame = data.results[randomIndex];
    } else {
      const randomPage = getRandomInt(1, MAX_PAGES);
      const listResponse = await fetch(
        `https://api.rawg.io/api/games?key=${API_KEY}&page=${randomPage}&page_size=10`
      );
      const listData = await listResponse.json();
      if (!listData.results || listData.results.length === 0) return;

      const basicGame = listData.results[getRandomInt(0, listData.results.length - 1)];
      const detailResponse = await fetch(
        `https://api.rawg.io/api/games/${basicGame.id}?key=${API_KEY}`
      );
      detailedGame = await detailResponse.json();
    }

    const cleanDescription = detailedGame.description_raw ||
      (detailedGame.description || '').replace(/<[^>]*>?/gm, '');

    const currentGame = {
      title: detailedGame.name,
      image: detailedGame.background_image,
      year: detailedGame.released ? detailedGame.released.split('-')[0] : 'N/A',
      description: truncateText(cleanDescription, 300),
      storeUrl: detailedGame.website ||
        `https://store.steampowered.com/search/?term=${encodeURIComponent(detailedGame.name)}`
    };

    updateUI(currentGame);
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