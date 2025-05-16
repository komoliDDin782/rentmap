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
  // Fill in house details
  document.getElementById('houseName').innerText = house.name;
  document.getElementById('houseDescription').innerText = house.description;
  document.getElementById('houseLocation').innerText = house.location;
  document.getElementById('housePhone').innerText = house.phone;
  document.getElementById('houseRooms').innerText = house.rooms;
  document.getElementById('housePrice').innerText = house.price;

  // Load images
  const gallery = document.getElementById('imageGallery');
  gallery.innerHTML = "";
  house.images.forEach(src => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = house.name;
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
