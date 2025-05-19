// Initialize the map without zoom buttons
const map = L.map('map', {
  zoomControl: false
});

// Locate the user and center the map (only once)
map.locate({
  setView: true,
  maxZoom: 12,
  zoom: 10,
  enableHighAccuracy: true,
  watch: false
});

// Fallback location if geolocation fails
map.on('locationerror', () => {
  map.setView([41.3, 69.25], 6); // Uzbekistan
});

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let allHouses = [];
const loading = document.getElementById('loading');
let currentLanguage = 'uz'; // default language

// Load house data from JSON
fetch('houses.json')
  .then(response => response.json())
  .then(houses => {
    loading.style.display = 'none';
    allHouses = houses;
    displayHouses(houses);
  })
  .catch(error => {
    console.error('Error loading houses:', error);
    loading.innerText = 'Failed to load houses.';
  });

// Display house markers on the map
function displayHouses(houses) {
  houses.forEach(house => {
    const marker = L.marker([house.lat, house.lng]).addTo(map);
    marker.on('click', () => showSidebar(house));
  });
}

// Show house details in sidebar
function showSidebar(house) {
  // Fill in house details in the current language (with fallback to 'en')
  document.getElementById('houseName').innerText = house.name[currentLanguage] || house.name['en'];
  document.getElementById('houseDescription').innerText = house.description[currentLanguage] || house.description['en'];
  document.getElementById('houseLocationValue').innerText = house.location;
  document.getElementById('housePhoneValue').innerText = house.phone;
  document.getElementById('houseRoomsValue').innerText = house.rooms;
  document.getElementById('housePriceValue').innerText = house.price;

  // Load images
  const gallery = document.getElementById('imageGallery');
  gallery.innerHTML = "";
  house.images.forEach(src => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = house.name[currentLanguage] || house.name['en'];
    gallery.appendChild(img);
  });

  // Show sidebar and expand map height
  document.getElementById('sidebar').classList.remove('hidden');
  document.getElementById('map').classList.add('full-height');
}

// Close sidebar button
document.getElementById('closeBtn').addEventListener('click', () => {
  document.getElementById('sidebar').classList.add('hidden');
  document.getElementById('map').classList.remove('full-height');
});

// Close sidebar on map click (but not on markers)
map.on('click', () => {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar.classList.contains('hidden')) {
    sidebar.classList.add('hidden');
    document.getElementById('map').classList.remove('full-height');
  }
});

// Translations for labels
const translations = {
  en: {
    location: "📍 Location: ",
    phone: "☎️ Phone: ",
    rooms: "🛏️ Rooms: ",
    price: "💰 Price: "
  },
  ru: {
    location: "📍 Адрес: ",
    phone: "☎️ Телефон: ",
    rooms: "🛏️ Комнаты: ",
    price: "💰 Цена: "
  },
  uz: {
    location: "📍 Joylashuv: ",
    phone: "☎️ Telefon: ",
    rooms: "🛏️ Xonalar: ",
    price: "💰 Narxi: "
  }
};

const languageSelect = document.getElementById('languageSelect');

languageSelect.addEventListener('change', (e) => {
  currentLanguage = e.target.value;
  updateLabels(currentLanguage);
  
  // If sidebar is visible and a house is selected, update its content in the new language
  const sidebarVisible = !document.getElementById('sidebar').classList.contains('hidden');
  if (sidebarVisible && allHouses.length) {
    // Find the currently shown house by matching the houseName
    // Safer way: store currently shown house globally (optional)
    // Here: just re-show the sidebar with the last clicked house if stored
    // For now, let's do nothing or you can implement storing last house if needed
  }
});

// Initialize labels to English by default
updateLabels(currentLanguage);

function updateLabels(lang) {
  const t = translations[lang];
  if (!t) return;

  document.getElementById('labelLocation').innerText = t.location;
  document.getElementById('labelPhone').innerText = t.phone;
  document.getElementById('labelRooms').innerText = t.rooms;
  document.getElementById('labelPrice').innerText = t.price;
}
