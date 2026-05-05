import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Search, Loader2 } from 'lucide-react';

interface ClinicLocationPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  clinicCity?: string;
}

// Default city coordinates fallback
const CITY_COORDINATES: Record<string, [number, number]> = {
  'delhi': [28.7041, 77.1025],
  'mumbai': [19.076, 72.8777],
  'bangalore': [12.9716, 77.5946],
  'hyderabad': [17.385, 78.4867],
  'kolkata': [22.5726, 88.3639],
  'chennai': [13.0827, 80.2707],
  'pune': [18.5204, 73.8567],
  'jaipur': [26.9124, 75.7873],
  'ahmedabad': [23.0225, 72.5714],
  'lucknow': [26.8467, 80.9462],
};

export function ClinicLocationPicker({
  initialLat,
  initialLng,
  onLocationSelect,
  clinicCity,
}: ClinicLocationPickerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const marker = useRef<L.Marker | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [error, setError] = useState('');

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Determine initial center
    let initialCenter: [number, number] = [28.7041, 77.1025]; // Delhi default

    if (initialLat !== undefined && initialLng !== undefined) {
      initialCenter = [initialLat, initialLng];
    } else if (clinicCity) {
      const cityKey = clinicCity.toLowerCase();
      const cityCoords = CITY_COORDINATES[cityKey];
      if (cityCoords) {
        initialCenter = cityCoords;
      }
    }

    // Create map
    map.current = L.map(mapContainer.current).setView(initialCenter, 13);

    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map.current);

    // Add initial marker if coordinates provided
    if (initialLat !== undefined && initialLng !== undefined) {
      marker.current = L.marker([initialLat, initialLng], {
        draggable: true,
        title: 'Clinic Location',
      }).addTo(map.current);

      // Fetch address for initial location
      reverseGeocodeCoordinates(initialLat, initialLng);
    }

    // Handle map clicks
    const handleMapClick = (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      updateMarker(lat, lng);
    };

    map.current.on('click', handleMapClick);

    return () => {
      if (map.current) {
        map.current.off('click', handleMapClick);
      }
    };
  }, []);

  // Update marker when dragged or clicked
  const updateMarker = (lat: number, lng: number) => {
    if (!map.current) return;

    if (marker.current) {
      marker.current.setLatLng([lat, lng]);
    } else {
      marker.current = L.marker([lat, lng], {
        draggable: true,
        title: 'Clinic Location',
      }).addTo(map.current);
    }

    reverseGeocodeCoordinates(lat, lng);
    onLocationSelect(lat, lng, selectedAddress);
  };

  // Reverse geocode coordinates to get address
  const reverseGeocodeCoordinates = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      setSelectedAddress(data.address?.road || data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      setError('');
    } catch (err) {
      console.error('Reverse geocoding failed:', err);
      setSelectedAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
  };

  // Search for address
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError('');

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      const data = await response.json();

      if (!data || data.length === 0) {
        setError('Address not found. Try a different search or click on the map.');
        setIsSearching(false);
        return;
      }

      const result = data[0];
      const lat = parseFloat(result.lat);
      const lng = parseFloat(result.lon);

      if (!map.current) return;

      // Center map on result
      map.current.setView([lat, lng], 15);

      // Update marker
      if (marker.current) {
        marker.current.setLatLng([lat, lng]);
      } else {
        marker.current = L.marker([lat, lng], {
          draggable: true,
          title: 'Clinic Location',
        }).addTo(map.current);
      }

      // Handle marker drag
      if (marker.current) {
        marker.current.on('dragend', () => {
          const pos = marker.current!.getLatLng();
          updateMarker(pos.lat, pos.lng);
        });
      }

      setSelectedAddress(result.display_name);
      onLocationSelect(lat, lng, result.display_name);
      setSearchQuery('');
      setError('');
    } catch (err) {
      console.error('Search failed:', err);
      setError('Search failed. Please try again or click on the map.');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle marker drag end
  useEffect(() => {
    if (!marker.current) return;

    const handleDragEnd = () => {
      if (!marker.current) return;
      const pos = marker.current.getLatLng();
      updateMarker(pos.lat, pos.lng);
    };

    marker.current.on('dragend', handleDragEnd);

    return () => {
      if (marker.current) {
        marker.current.off('dragend', handleDragEnd);
      }
    };
  }, [selectedAddress]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Clinic Location on Map</label>

        {/* Search Bar */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search clinic address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 outline-none bg-transparent text-sm"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            className="px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-semibold transition"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
            Search
          </button>
        </div>

        {/* Error Message */}
        {error && <p className="text-red-600 text-xs mb-3">{error}</p>}

        {/* Map Container */}
        <div
          ref={mapContainer}
          className="w-full h-80 rounded-lg border border-gray-300 shadow-sm bg-gray-50"
          style={{ zIndex: 0 }}
        />

        {/* Selected Address Display */}
        {selectedAddress && (
          <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-xs text-blue-700 font-medium mb-1">Selected Location:</p>
            <p className="text-sm text-blue-900 font-semibold">{selectedAddress}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-4 p-3 rounded-lg bg-gray-50 border border-gray-200">
          <p className="text-xs text-gray-600">
            <span className="font-semibold">Tip:</span> Search for your clinic address or click directly on the map. You can drag the marker to fine-tune the location.
          </p>
        </div>
      </div>
    </div>
  );
}
