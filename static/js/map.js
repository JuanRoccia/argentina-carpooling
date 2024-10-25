// Initialize map centered on Argentina
const map = L.map('map', {
    zoomControl: false  // We'll add a custom position for zoom control
}).setView([-34.6037, -58.3816], 5);

let originMarker = null;
let destMarker = null;

// Add a modern-styled map layer
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
}).addTo(map);

// Add zoom control to the top-right
L.control.zoom({
    position: 'topright'
}).addTo(map);

// Custom marker icons
const createCustomIcon = (color) => {
    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="
            background-color: ${color};
            border: 2px solid white;
            border-radius: 50%;
            height: 12px;
            width: 12px;
            box-shadow: 0 0 10px rgba(0,0,0,0.5);
            position: relative;
        "></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6]
    });
};

const originIcon = createCustomIcon('#00ff00');
const destIcon = createCustomIcon('#ff0000');

// Helper function to create/update a marker with animation
function updateMarker(latlng, isOrigin = true) {
    const marker = isOrigin ? originMarker : destMarker;
    const icon = isOrigin ? originIcon : destIcon;
    
    if (marker) {
        // Animate marker movement
        const startPos = marker.getLatLng();
        const frames = 30;
        let frame = 0;
        
        const animate = () => {
            frame++;
            const progress = frame / frames;
            const lat = startPos.lat + (latlng.lat - startPos.lat) * progress;
            const lng = startPos.lng + (latlng.lng - startPos.lng) * progress;
            
            marker.setLatLng([lat, lng]);
            
            if (frame < frames) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    } else {
        const newMarker = L.marker(latlng, {
            icon: icon,
            draggable: true
        });
        
        // Add a nice pop-in animation
        newMarker.addEventListener('add', function(e) {
            const el = e.target.getElement();
            el.style.transform = 'scale(0)';
            el.style.transition = 'transform 0.3s ease-out';
            setTimeout(() => {
                el.style.transform = 'scale(1)';
            }, 10);
        });
        
        newMarker.addTo(map);
        
        if (isOrigin) {
            originMarker = newMarker;
            newMarker.bindPopup('Origin').openPopup();
        } else {
            destMarker = newMarker;
            newMarker.bindPopup('Destination').openPopup();
        }

        newMarker.on('dragend', function(e) {
            const position = e.target.getLatLng();
            updateLocationInput(position, isOrigin);
            reverseGeocode(position, isOrigin);
        });
    }
    
    // Update hidden inputs
    const prefix = isOrigin ? 'origin' : 'dest';
    const latInput = document.getElementById(`${prefix}_lat`);
    const lonInput = document.getElementById(`${prefix}_lon`);
    if (latInput && lonInput) {
        latInput.value = latlng.lat;
        lonInput.value = latlng.lng;
    }
    
    // Update map view to show both markers
    if (originMarker && destMarker) {
        const bounds = L.latLngBounds(originMarker.getLatLng(), destMarker.getLatLng());
        map.fitBounds(bounds, { padding: [50, 50] });
    } else {
        map.setView(latlng, 12);
    }
}

// Function to perform geocoding using Nominatim
async function geocodeLocation(query) {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=ar&limit=5`);
    const data = await response.json();
    return data.map(item => ({
        name: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon)
    }));
}

// Function to perform reverse geocoding
async function reverseGeocode(latlng, isOrigin) {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`);
    const data = await response.json();
    const locationInput = document.getElementById(isOrigin ? 'origin' : 'destination');
    if (locationInput) {
        locationInput.value = data.display_name;
    }
}

// Function to update location input
function updateLocationInput(latlng, isOrigin) {
    const prefix = isOrigin ? 'origin' : 'dest';
    const latInput = document.getElementById(`${prefix}_lat`);
    const lonInput = document.getElementById(`${prefix}_lon`);
    if (latInput && lonInput) {
        latInput.value = latlng.lat;
        lonInput.value = latlng.lng;
    }
}

// Function to setup autocomplete for an input
function setupAutocomplete(inputId, isOrigin) {
    const input = document.getElementById(inputId);
    if (!input) return;

    let dropdown = null;
    let debounceTimer;

    input.addEventListener('input', async function() {
        clearTimeout(debounceTimer);
        if (dropdown) {
            dropdown.remove();
        }

        if (input.value.length < 3) return;

        debounceTimer = setTimeout(async () => {
            const results = await geocodeLocation(input.value);
            if (results.length > 0) {
                dropdown = document.createElement('div');
                dropdown.className = 'autocomplete-dropdown';
                dropdown.style.position = 'absolute';
                dropdown.style.width = input.offsetWidth + 'px';
                dropdown.style.maxHeight = '200px';
                dropdown.style.overflowY = 'auto';
                dropdown.style.backgroundColor = 'var(--bs-body-bg)';
                dropdown.style.border = '1px solid var(--bs-border-color)';
                dropdown.style.borderRadius = '0.375rem';
                dropdown.style.zIndex = '1000';

                results.forEach(result => {
                    const item = document.createElement('div');
                    item.className = 'dropdown-item';
                    item.style.padding = '0.5rem 1rem';
                    item.style.cursor = 'pointer';
                    item.textContent = result.name;
                    
                    item.addEventListener('mouseover', () => {
                        item.style.backgroundColor = 'var(--bs-primary)';
                    });
                    
                    item.addEventListener('mouseout', () => {
                        item.style.backgroundColor = '';
                    });

                    item.addEventListener('click', () => {
                        input.value = result.name;
                        const latlng = { lat: result.lat, lng: result.lon };
                        updateMarker(latlng, isOrigin);
                        dropdown.remove();
                        dropdown = null;
                    });

                    dropdown.appendChild(item);
                });

                input.parentNode.style.position = 'relative';
                input.parentNode.appendChild(dropdown);
            }
        }, 300);
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (dropdown && !input.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.remove();
            dropdown = null;
        }
    });
}

// Handle map clicks
map.on('click', function(e) {
    if (!originMarker) {
        updateMarker(e.latlng, true);
        reverseGeocode(e.latlng, true);
    } else if (!destMarker) {
        updateMarker(e.latlng, false);
        reverseGeocode(e.latlng, false);
    }
});

// Initialize autocomplete when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setupAutocomplete('origin', true);
    setupAutocomplete('destination', false);
});
