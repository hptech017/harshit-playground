import React, { useEffect, useState, useRef } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
} from "@react-google-maps/api";
import { 
  Search, 
  Navigation, 
  MapPin, 
  Star, 
  ExternalLink, 
  Menu,
  X,
  Utensils,
  Fuel,
  Plus,
  Banknote,
  Coffee,
  Loader2,
  ChevronRight
} from "lucide-react";

const containerStyle = {
  width: "100%",
  height: "100vh",
};

const defaultCenter = { lat: 28.6139, lng: 77.2090 };

const categoryConfig = {
  restaurant: { icon: Utensils, label: "Restaurants", color: "bg-orange-500" },
  gas_station: { icon: Fuel, label: "Gas Stations", color: "bg-blue-500" },
  hospital: { icon: Plus, label: "Hospitals", color: "bg-red-500" },
  atm: { icon: Banknote, label: "ATMs", color: "bg-green-500" },
  cafe: { icon: Coffee, label: "Cafes", color: "bg-amber-600" },
};

const NearbySearch = () => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, // Replace with actual API key
    libraries: ["places"],
  });

  const [userLocation, setUserLocation] = useState(null);
  const [places, setPlaces] = useState([]);
  const [mapRef, setMapRef] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const serviceRef = useRef(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => setUserLocation(defaultCenter)
    );
  }, []);

  const searchNearby = async (type) => {
    if (!mapRef || !userLocation) return;
    
    setLoading(true);
    setActiveCategory(type);

    if (!serviceRef.current) {
      serviceRef.current = new window.google.maps.places.PlacesService(mapRef);
    }

    const request = {
      location: userLocation,
      radius: 3000,
      type: type,
    };

    serviceRef.current.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        setPlaces(results);
        setLoading(false);
      } else {
        setLoading(false);
      }
    });
  };

  const searchByText = async () => {
    if (!mapRef || !userLocation || !searchQuery.trim()) return;
    
    setLoading(true);
    setActiveCategory('search');

    if (!serviceRef.current) {
      serviceRef.current = new window.google.maps.places.PlacesService(mapRef);
    }

    const request = {
      location: userLocation,
      radius: 5000,
      query: searchQuery,
    };

    serviceRef.current.textSearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        setPlaces(results);
        setLoading(false);
      } else {
        setLoading(false);
      }
    });
  };

  const handlePlaceClick = (place) => {
    if (mapRef) {
      mapRef.panTo(place.geometry.location);
      mapRef.setZoom(16);
      setSelectedPlace(place);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading Maps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-30 lg:hidden bg-white rounded-lg p-2 shadow-lg border"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed lg:relative top-0 left-0 h-full w-80 bg-white shadow-xl border-r border-gray-200 z-20
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Nearby Places</h1>
            <p className="text-gray-600 text-sm">Discover places around you</p>
          </div>

          {/* Search Bar */}
          <div className="p-6 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for places..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchByText()}
              />
              {searchQuery && (
                <button
                  onClick={searchByText}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-blue-700 transition-colors"
                >
                  Search
                </button>
              )}
            </div>
          </div>

          {/* Categories */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Categories</h3>
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(categoryConfig).map(([type, config]) => {
                const Icon = config.icon;
                const isActive = activeCategory === type;
                
                return (
                  <button
                    key={type}
                    onClick={() => searchNearby(type)}
                    className={`
                      flex items-center space-x-3 w-full p-3 rounded-lg text-left transition-all duration-200
                      ${isActive 
                        ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                        : 'hover:bg-gray-50 text-gray-700 border border-transparent'
                      }
                    `}
                  >
                    <div className={`p-2 rounded-lg ${isActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-gray-600'}`} />
                    </div>
                    <span className="font-medium">{config.label}</span>
                    <ChevronRight className={`w-4 h-4 ml-auto ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-hidden">
            <div className="p-6 pb-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                  Results ({places.length})
                </h3>
                {loading && (
                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                )}
              </div>
            </div>

            <div className="px-6 pb-6 overflow-y-auto h-full">
              {loading && (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loading && places.length === 0 && (
                <div className="text-center py-12">
                  <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No places found</p>
                  <p className="text-gray-400 text-sm mt-1">Try searching or selecting a category</p>
                </div>
              )}

              {!loading && places.map((place, idx) => (
                <div
                  key={idx}
                  onClick={() => handlePlaceClick(place)}
                  className="group cursor-pointer p-4 rounded-lg hover:bg-gray-50 transition-all duration-200 border border-transparent hover:border-gray-200 mb-2"
                >
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <MapPin className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate group-hover:text-blue-700 transition-colors">
                        {place.name}
                      </h4>
                      <div className="flex items-center space-x-2 mt-1">
                        {place.rating && (
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium text-gray-700">
                              {place.rating.toFixed(1)}
                            </span>
                          </div>
                        )}
                        <span className="text-gray-400 text-sm">•</span>
                        <span className="text-gray-600 text-sm truncate">
                          {place.vicinity}
                        </span>
                      </div>
                      {place.price_level && (
                        <div className="mt-1">
                          <span className="text-green-600 text-sm font-medium">
                            {'$'.repeat(place.price_level)}
                          </span>
                        </div>
                      )}
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={userLocation || defaultCenter}
          zoom={14}
          onLoad={(map) => setMapRef(map)}
          options={{
            zoomControl: true,
            streetViewControl: true,
            mapTypeControl: true,
            fullscreenControl: true,
          }}
        >
          {/* User Location Marker */}
          {userLocation && (
            <Marker
              position={userLocation}
              icon={{
                url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
                  <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="8" fill="#3b82f6" opacity="0.2"/>
                    <circle cx="12" cy="12" r="4" fill="#3b82f6"/>
                    <circle cx="12" cy="12" r="2" fill="white"/>
                  </svg>
                `),
                scaledSize: new window.google.maps.Size(24, 24),
                anchor: new window.google.maps.Point(12, 12)
              }}
            />
          )}

          {/* Places Markers */}
          {places.map((place, idx) => (
            <Marker
              key={idx}
              position={place.geometry.location}
              onClick={() => setSelectedPlace(place)}
              icon={{
                url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
                  <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 24 16 24s16-12 16-24c0-8.837-7.163-16-16-16z" fill="#dc2626"/>
                    <circle cx="16" cy="16" r="8" fill="white"/>
                    <circle cx="16" cy="16" r="4" fill="#dc2626"/>
                  </svg>
                `),
                scaledSize: new window.google.maps.Size(32, 40),
                anchor: new window.google.maps.Point(16, 40)
              }}
            />
          ))}

          {/* Info Window */}
          {selectedPlace && (
            <InfoWindow
              position={selectedPlace.geometry.location}
              onCloseClick={() => setSelectedPlace(null)}
            >
              <div className="p-4 max-w-xs">
                <h3 className="font-bold text-gray-900 mb-2">{selectedPlace.name}</h3>
                <div className="flex items-center space-x-2 mb-2">
                  {selectedPlace.rating && (
                    <>
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="font-medium text-gray-700">
                        {selectedPlace.rating.toFixed(1)}
                      </span>
                    </>
                  )}
                  {selectedPlace.price_level && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span className="text-green-600 font-medium">
                        {'$'.repeat(selectedPlace.price_level)}
                      </span>
                    </>
                  )}
                </div>
                <p className="text-gray-600 text-sm mb-4">{selectedPlace.vicinity}</p>
                <button
                  onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.geometry.location.lat()},${selectedPlace.geometry.location.lng()}`, '_blank')}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Get Directions</span>
                </button>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default NearbySearch;