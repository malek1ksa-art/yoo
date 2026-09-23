const videos = [
  {
    id: 1,
    title: "Whore&Whore - Free Sex",
    channel: "pornhub",
    views: "1.2M views",
    date: "2 weeks ago",
    duration: "4:28",
    color: "#2563eb",
    category: "trending",
    embed: `<iframe src="https://www.pornhub.com/embed/6a6f821469e78"  frameborder="0" width="560" height="340" scrolling="no" allowfullscreen></iframe>`,
    thumbnail: "pics/Screenshot 2026-08-06 212809.png",
  },
  // <iframe src="https://www.pornhub.com/embed/6a6f821469e78" frameborder="0" width="560" height="340" scrolling="no" allowfullscreen></iframe>
  {
    id: 2,
    title: "Whore&Whore - Free Sex",
    channel: "pornhub",
    views: "860K views",
    date: "1 month ago",
    duration: "3:12",
    color: "#7c3aed",
    category: "recent",
    embed: `<iframe src="https://www.pornhub.com/embed/6a6d2640d5cde"  frameborder="0" width="560" height="340" scrolling="no" allowfullscreen></iframe>`,
    thumbnail: "pics/Screenshot 2026-08-06 212809.png",
  },
  {
    id: 3,
    title: "Whore&Whore - Free Sex",
    channel: "pornhub",
    views: "540K views",
    date: "3 days ago",
    duration: "2:45",
    color: "#0f766e",
    category: "trending",
    embed: `<iframe src="https://www.pornhub.com/embed/693aec5f730c9" frameborder="0" width="560" height="340" scrolling="no" allowfullscreen></iframe>`,
    thumbnail: "pics/Screenshot 2026-08-06 212809.png",
  },
  {
    id: 4,
    title: "Whore&Whore - Free Sex",
    channel: "pornhub",
    views: "430K views",
    date: "5 days ago",
    duration: "5:02",
    color: "#d946ef",
    category: "top-rated",
    embed: `<iframe src="https://www.pornhub.com/embed/6a752c20767cb" frameborder="0" width="560" height="340" scrolling="no" allowfullscreen></iframe>`,
    thumbnail: "pics/Screenshot 2026-08-06 212809.png",
  },
];

const gallery = document.getElementById('gallery');
const videoCount = document.getElementById('video-count');
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');
const playerOverlay = document.getElementById('player-overlay');
const closePlayer = document.getElementById('close-player');
const playerFrame = document.getElementById('player-frame');
const playerTitle = document.getElementById('player-title');
const playerChannel = document.getElementById('player-channel');
const openFeatured = document.getElementById('open-featured');
const noResults = document.getElementById('no-results');
const categoryButtons = document.querySelectorAll('.category-btn');
const accessGate = document.getElementById('access-gate');
const accessDenied = document.getElementById('access-denied');
const joinYes = document.getElementById('join-yes');
const joinNo = document.getElementById('join-no');
const welcomePill = document.getElementById('welcome-pill');
const welcomeName = document.getElementById('welcome-name');

const sessionStorageKey = 'sexclub-session-user';

let currentFilter = '';
let currentCategory = 'all';
let currentSort = 'newest';

function getEmbedUrl(embed) {
  if (!embed) return '';
  const trimmed = embed.trim();
  if (trimmed.startsWith('<iframe')) {
    const match = trimmed.match(/src=['"]([^'"]+)['"]/i);
    return match ? match[1] : '';
  }
  return trimmed;
}

function parseEmbedMeta(embed) {
  if (!embed || !embed.trim().startsWith('<iframe')) {
    return { views: '', date: '' };
  }
  const viewsMatch = embed.match(/data-views=['"]([^'"]+)['"]/i);
  const dateMatch = embed.match(/data-date=['"]([^'"]+)['"]/i);
  return {
    views: viewsMatch ? viewsMatch[1] : '',
    date: dateMatch ? dateMatch[1] : '',
  };
}

function normalizeVideo(video) {
  const meta = parseEmbedMeta(video.embed);
  return {
    ...video,
    embed: getEmbedUrl(video.embed),
    views: video.views || meta.views,
    date: video.date || meta.date,
  };
}

function formatVideoCard(video) {
  return `
    <div class="col-sm-6 col-xl-3">
      <div class="card video-card h-100 shadow-sm">
        <div class="ratio ratio-16x9 preview-stage">
          <img src="${video.thumbnail}" alt="${video.title}" class="card-img-top preview-image" />
          <iframe
            class="preview-frame"
            data-preview-src="${video.embed}"
            title="${video.title}"
            loading="lazy"
            allow="autoplay; fullscreen"
            allowfullscreen
            sandbox="allow-scripts allow-same-origin allow-presentation"
          ></iframe>
          <div class="position-absolute top-0 end-0 m-2 badge bg-black bg-opacity-50">${video.duration}</div>
        </div>
        <div class="card-body d-flex flex-column">
          <h3 class="h6 mb-2">${video.title}</h3>
          <p class="video-meta mb-3">${video.channel} • ${video.views} • ${video.date}</p>
          <button class="btn btn-outline-light mt-auto play-button" data-id="${video.id}">Play</button>
        </div>
      </div>
    </div>
  `;
}

function renderGallery(filter = '') {
  const normalizedVideos = videos.map(normalizeVideo);
  const query = filter.trim().toLowerCase();

  // Apply category filter
  let filtered = normalizedVideos.filter(video => {
    const matchesCategory = currentCategory === 'all' || video.category === currentCategory;
    const matchesSearch = query === '' ||
      video.title.toLowerCase().includes(query) ||
      video.channel.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  // Apply sorting
  filtered = applySort(filtered, currentSort);

  // Render
  gallery.innerHTML = filtered.length === 0 ? '' : filtered.map(formatVideoCard).join('');
  videoCount.textContent = `${filtered.length} video${filtered.length !== 1 ? 's' : ''}`;
  noResults.classList.toggle('d-none', filtered.length > 0);

  attachPlayListeners();
}

function applySort(videoList, sortType) {
  const sorted = [...videoList];
  switch (sortType) {
    case 'popular':
      return sorted.sort((a, b) => {
        const viewsA = parseInt(a.views) || 0;
        const viewsB = parseInt(b.views) || 0;
        return viewsB - viewsA;
      });
    case 'title':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case 'newest':
    default:
      return sorted.sort((a, b) => b.id - a.id);
  }
}

function attachPlayListeners() {
  const playButtons = document.querySelectorAll('.play-button');
  playButtons.forEach(button => {
    button.addEventListener('click', () => {
      const id = Number(button.dataset.id);
      const video = videos.find(item => item.id === id);
      if (video) {
        openPlayer(normalizeVideo(video));
      }
    });
  });

  const videoCards = document.querySelectorAll('.video-card');
  videoCards.forEach(card => {
    const previewFrame = card.querySelector('.preview-frame');
    const previewImage = card.querySelector('.preview-image');

    if (!previewFrame) return;

    const loadPreview = () => {
      if (previewFrame.dataset.previewSrc) {
        const timestamp = Date.now();
        const separator = previewFrame.dataset.previewSrc.includes('?') ? '&' : '?';
        previewFrame.src = `${previewFrame.dataset.previewSrc}${separator}t=${timestamp}`;
      }
    };

    const clearPreview = () => {
      previewFrame.removeAttribute('src');
    };

    card.addEventListener('mouseenter', loadPreview);
    card.addEventListener('mouseleave', clearPreview);

    if (previewImage) {
      previewImage.addEventListener('mouseenter', loadPreview);
    }
  });
}

function showAccessGate() {
  accessGate.classList.remove('d-none');
  accessDenied.classList.add('d-none');
}

function showAccessDenied() {
  accessGate.classList.add('d-none');
  accessDenied.classList.remove('d-none');
}

function updateWelcome(name) {
  welcomeName.textContent = name;
  welcomePill.classList.remove('d-none');
}

function setActiveUser(username) {
  sessionStorage.setItem(sessionStorageKey, username);
}

function restoreSession() {
  const savedName = sessionStorage.getItem(sessionStorageKey);
  if (savedName) {
    updateWelcome(savedName);
    accessGate.classList.add('d-none');
    accessDenied.classList.add('d-none');
  } else {
    showAccessGate();
  }
}

function openPlayer(video) {
  const embedUrl = getEmbedUrl(video.embed);
  playerFrame.src = embedUrl;
  playerTitle.textContent = video.title;
  playerChannel.textContent = `${video.channel} • ${video.views} • ${video.date}`;
  playerOverlay.classList.remove('d-none');
}

function closePlayerOverlay() {
  playerFrame.src = '';
  playerOverlay.classList.add('d-none');
}

searchInput.addEventListener('input', event => {
  currentFilter = event.target.value;
  renderGallery(currentFilter);
});

sortSelect.addEventListener('change', event => {
  currentSort = event.target.value;
  renderGallery(currentFilter);
});

categoryButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    categoryButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentCategory = btn.dataset.category;
    renderGallery(currentFilter);
  });
});

closePlayer.addEventListener('click', closePlayerOverlay);
playerOverlay.addEventListener('click', event => {
  if (event.target === playerOverlay) {
    closePlayerOverlay();
  }
});

// Keyboard controls
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !playerOverlay.classList.contains('d-none')) {
    closePlayerOverlay();
  }
});

joinYes.addEventListener('click', () => {
  const visitorName = 'visitor';
  setActiveUser(visitorName);
  updateWelcome(visitorName);
  accessGate.classList.add('d-none');
  accessDenied.classList.add('d-none');
});

joinNo.addEventListener('click', () => {
  showAccessDenied();
});

openFeatured.addEventListener('click', () => {
  openPlayer(normalizeVideo(videos[0]));
});

restoreSession();
renderGallery();
