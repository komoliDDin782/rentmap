// Initialize the map without zoom buttons
const map = L.map('map', {
  zoomControl: false
});

// Locate the user and center the map (only once, not continuously)
map.locate({
  setView: true,
  maxZoom: 12,
  zoom: 10,
  enableHighAccuracy: true,
  watch: false  // Disable continuous tracking of the user's location
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

// Fetch house data
const loading = document.getElementById('loading');

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

// Show selected house details in sidebar
function showSidebar(house) {
  document.getElementById('houseName').innerText = house.name;
  document.getElementById('houseDescription').innerText = house.description;
  document.getElementById('houseLocation').innerText = house.location;
  document.getElementById('housePhone').innerText = house.phone;
  document.getElementById('houseRooms').innerText = house.rooms;
  document.getElementById('housePrice').innerText = house.price;

  const gallery = document.getElementById('imageGallery');
  gallery.innerHTML = "";
  house.images.forEach(src => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = house.name;
    gallery.appendChild(img);
  });

  document.getElementById('sidebar').classList.remove('hidden');
}

// Close sidebar button
document.getElementById('closeBtn').addEventListener('click', () => {
  document.getElementById('sidebar').classList.add('hidden');
});

// Filter houses by type
document.getElementById('filter').addEventListener('change', (e) => {
  const filterValue = e.target.value;
  const filteredHouses = filterValue === 'all'
    ? allHouses
    : allHouses.filter(house => house.type === filterValue);

  // Remove existing markers
  map.eachLayer(layer => {
    if (layer instanceof L.Marker) {
      map.removeLayer(layer);
    }
  });

  // Re-add tile layer (since it's removed with markers)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  displayHouses(filteredHouses);
});

// Close sidebar when clicking on the map (but not on a marker)
map.on('click', function (e) {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar.classList.contains('hidden')) {
    sidebar.classList.add('hidden');
  }
});
