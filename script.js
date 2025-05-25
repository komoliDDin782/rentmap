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
const languageSelect = document.getElementById('languageSelect');

// Load saved language or default to 'uz'
let currentLanguage = localStorage.getItem('selectedLanguage') || 'uz';

// Set the language selector dropdown to saved language
languageSelect.value = currentLanguage;

let lastShownHouse = null; // To remember which house is currently shown in sidebar

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
  lastShownHouse = house;

  document.getElementById('houseName').innerText = house.name[currentLanguage] || house.name['en'];
  document.getElementById('houseDescription').innerText = house.description[currentLanguage] || house.description['en'];
  document.getElementById('houseLocationValue').innerText = house.location;
  document.getElementById('housePhoneValue').innerText = house.phone;
  document.getElementById('houseRoomsValue').innerText = house.rooms;
  document.getElementById('housePriceValue').innerText = house.price;

  const gallery = document.getElementById('imageGallery');
  gallery.innerHTML = "";
  house.images.forEach(src => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = house.name[currentLanguage] || house.name['en'];
    gallery.appendChild(img);
  });

  document.getElementById('sidebar').classList.remove('hidden');
  document.getElementById('map').classList.add('full-height');
}

// Close sidebar button
document.getElementById('closeBtn').addEventListener('click', () => {
  document.getElementById('sidebar').classList.add('hidden');
  document.getElementById('map').classList.remove('full-height');
  lastShownHouse = null;
});

// Close sidebar on map click (but not on markers)
map.on('click', () => {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar.classList.contains('hidden')) {
    sidebar.classList.add('hidden');
    document.getElementById('map').classList.remove('full-height');
    lastShownHouse = null;
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

// Update labels according to language
function updateLabels(lang) {
  const t = translations[lang];
  if (!t) return;

  document.getElementById('labelLocation').innerText = t.location;
  document.getElementById('labelPhone').innerText = t.phone;
  document.getElementById('labelRooms').innerText = t.rooms;
  document.getElementById('labelPrice').innerText = t.price;
}

// When user changes language selection
languageSelect.addEventListener('change', (e) => {
  currentLanguage = e.target.value;
  localStorage.setItem('selectedLanguage', currentLanguage); // Save language selection

  updateLabels(currentLanguage);

  // If sidebar is open and a house is shown, update the sidebar with new language
  if (lastShownHouse) {
    showSidebar(lastShownHouse);
  }
});

// Store markers by house id for easy toggle removes
const houseMarkers = new Map();

// When loading houses, save markers with IDs:
function displayHouses(houses) {
  houses.forEach(house => {
    const marker = L.marker([house.lat, house.lng]).addTo(map);
    marker.on('click', () => showSidebar(house));
    houseMarkers.set(house.id, marker);  // Save marker by id
  });
}

// Sidebar toggle button
const toggleSidebarBtn = document.getElementById('toggleSidebarBtn');
const leftSidebar = document.getElementById('leftSidebar');
const closeLeftSidebar = document.getElementById('closeLeftSidebar');

toggleSidebarBtn.addEventListener('click', () => {
  leftSidebar.classList.toggle('visible');
});

closeLeftSidebar.addEventListener('click', () => {
  leftSidebar.classList.remove('visible');
});

// Activate / Deactivate buttons
const houseIdInput = document.getElementById('houseIdInput');
const activateBtn = document.getElementById('activateBtn');
const deactivateBtn = document.getElementById('deactivateBtn');

activateBtn.addEventListener('click', () => {
  const id = houseIdInput.value.trim();
  if (houseMarkers.has(id)) {
    houseMarkers.get(id).addTo(map);
    alert(`House ID ${id} activated.`);
  } else {
    alert('House ID not found.');
  }
});

deactivateBtn.addEventListener('click', () => {
  const id = houseIdInput.value.trim();
  if (houseMarkers.has(id)) {
    map.removeLayer(houseMarkers.get(id));
    alert(`House ID ${id} deactivated.`);
  } else {
    alert('House ID not found.');
  }
});
map.on('locationfound', (e) => {
  const userMarker = L.circleMarker(e.latlng, {
    radius: 8, // Size in pixels (adjust for comfort)
     // Border color
    fillColor: '#134eccaf', // Full blue fill
    fillOpacity: 1, // Fully filled
    weight: 2, // Border thickness
    opacity: 1, // Full border opacity
    className: 'user-location-marker' // We'll use this to add shadow
  }).addTo(map);
});
