import React, { useState, useEffect, useRef } from "react";
import { 
  X, 
  MapPin, 
  Navigation, 
  Search, 
  Check, 
  Loader2, 
  Sparkles,
  Compass,
  AlertCircle
} from "lucide-react";

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (location: {
    address: string;
    city: string;
    region: string;
    latitude: number;
    longitude: number;
  }) => void;
  initialLat?: number;
  initialLng?: number;
}

// Default center: Airport Residential Area, Accra, Ghana
const DEFAULT_LAT = 5.6037;
const DEFAULT_LNG = -0.1870;

export function LocationPickerModal({
  isOpen,
  onClose,
  onSelectLocation,
  initialLat = DEFAULT_LAT,
  initialLng = DEFAULT_LNG,
}: LocationPickerModalProps) {
  const [lat, setLat] = useState(initialLat);
  const [lng, setLng] = useState(initialLng);
  const [zoom, setZoom] = useState(15);
  const [address, setAddress] = useState("14 Independence Ave, Airport Residential");
  const [city, setCity] = useState("Accra");
  const [region, setRegion] = useState("Greater Accra");
  const [isDragging, setIsDragging] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{ name: string; lat: number; lng: number }>>([]);
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<any>(null);

  // Reverse geocode when coordinates change
  const reverseGeocode = async (latitude: number, longitude: number) => {
    setIsGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=18&addressdetails=1`,
        {
          headers: {
            "Accept-Language": "en",
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const road = addr.road || addr.pedestrian || addr.suburb || addr.neighbourhood || addr.city_district || "Selected Location";
        const houseNum = addr.house_number ? `${addr.house_number} ` : "";
        const formattedStreet = `${houseNum}${road}`;
        const determinedCity = addr.city || addr.town || addr.village || addr.suburb || "Accra";
        const determinedRegion = addr.state || addr.region || addr.county || "Greater Accra";

        setAddress(data.display_name?.split(",").slice(0, 2).join(",") || formattedStreet);
        setCity(determinedCity);
        setRegion(determinedRegion);
        return;
      }
    } catch {
      setAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleMapMove = (deltaX: number, deltaY: number) => {
    const factor = 0.00005 * (18 / zoom);
    const newLat = lat - deltaY * factor;
    const newLng = lng + deltaX * factor;
    setLat(newLat);
    setLng(newLng);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      reverseGeocode(newLat, newLng);
    }, 450);
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    setIsGeocoding(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        setLat(userLat);
        setLng(userLng);
        setZoom(16);
        reverseGeocode(userLat, userLng);
      },
      () => {
        setIsGeocoding(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery + " Ghana")}&format=json&limit=5`
      );
      if (res.ok) {
        const data = await res.json();
        setSearchResults(
          data.map((item: any) => ({
            name: item.display_name,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
          }))
        );
      }
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (result: { name: string; lat: number; lng: number }) => {
    setLat(result.lat);
    setLng(result.lng);
    setSearchResults([]);
    setSearchQuery("");
    reverseGeocode(result.lat, result.lng);
  };

  const handleConfirm = () => {
    onSelectLocation({
      address,
      city,
      region,
      latitude: lat,
      longitude: lng,
    });
    onClose();
  };

  // Mouse & Touch Handlers
  const isMouseDownRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  const onMouseDown = (e: React.MouseEvent) => {
    isMouseDownRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    setIsDragging(true);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current) return;
    const deltaX = e.clientX - lastMousePosRef.current.x;
    const deltaY = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    handleMapMove(deltaX, deltaY);
  };

  const onMouseUp = () => {
    isMouseDownRef.current = false;
    setIsDragging(false);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isMouseDownRef.current = true;
      lastMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      setIsDragging(true);
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isMouseDownRef.current || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - lastMousePosRef.current.x;
    const deltaY = e.touches[0].clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    handleMapMove(deltaX, deltaY);
  };

  const onTouchEnd = () => {
    isMouseDownRef.current = false;
    setIsDragging(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[90vh] sm:h-[680px]">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-950 font-heading">Select Delivery Location</h3>
              <p className="text-[11px] text-slate-500 font-mono">Pan map beneath pin to pinpoint destination</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Location Bar */}
        <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200/80 relative z-20 shrink-0">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search area, landmark or street (e.g. Airport Residential, East Legon, Cantonments)..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-4 py-2.5 bg-slate-950 text-white font-semibold text-xs rounded-xl hover:bg-black transition-colors flex items-center gap-1.5 shrink-0 shadow-sm"
            >
              {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">Search</span>
            </button>
            <button
              type="button"
              onClick={handleLocateMe}
              title="Use current device location"
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 transition-colors shrink-0 shadow-sm"
            >
              <Navigation className="w-4 h-4" />
            </button>
          </form>

          {/* Search Dropdown Results */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-3 right-3 mt-1 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xl z-30 max-h-48 overflow-y-auto">
              {searchResults.map((res, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectSearchResult(res)}
                  className="w-full text-left px-4 py-2.5 text-xs text-slate-800 hover:bg-slate-50 border-b border-slate-100 last:border-0 flex items-center gap-2"
                >
                  <MapPin className="w-3.5 h-3.5 text-slate-900 shrink-0" />
                  <span className="truncate">{res.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Interactive Map Canvas Container */}
        <div
          ref={mapContainerRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          className="relative flex-1 w-full bg-slate-100 cursor-grab active:cursor-grabbing select-none overflow-hidden"
        >
          {/* Map Tiles Layer */}
          <div className="absolute inset-0 transition-transform duration-75 ease-out">
            <iframe
              title="Map View"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.008}%2C${lat - 0.006}%2C${lng + 0.008}%2C${lat + 0.006}&layer=mapnik`}
              className="w-full h-full pointer-events-none opacity-80 contrast-105"
            />
          </div>

          {/* Fixed Center Pin (Tactile Hop Animation) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="relative flex flex-col items-center">
              <div
                className={`transition-all duration-200 transform ${
                  isDragging ? "-translate-y-4 scale-110" : "translate-y-0"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-slate-950 border-2 border-white text-white flex items-center justify-center shadow-2xl">
                  <MapPin className="w-5 h-5 fill-white text-slate-950" />
                </div>
              </div>
              <div
                className={`w-3 h-1.5 bg-slate-900/60 rounded-full blur-[1px] transition-all duration-200 ${
                  isDragging ? "scale-75 opacity-40" : "scale-100 opacity-90"
                }`}
              />
            </div>
          </div>

          {/* Zoom Controls Overlay */}
          <div className="absolute right-4 bottom-4 flex flex-col gap-1.5 z-20">
            <button
              onClick={() => setZoom(Math.min(19, zoom + 1))}
              className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 text-slate-900 flex items-center justify-center text-base hover:bg-slate-100 transition-colors shadow-lg font-bold"
            >
              +
            </button>
            <button
              onClick={() => setZoom(Math.max(12, zoom - 1))}
              className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 text-slate-900 flex items-center justify-center text-base hover:bg-slate-100 transition-colors shadow-lg font-bold"
            >
              -
            </button>
          </div>

          {/* Live Status Pill */}
          <div className="absolute top-4 left-4 z-20 pointer-events-none">
            <div className="px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200 text-[10px] font-mono font-bold text-slate-800 flex items-center gap-1.5 shadow-md">
              <span className={`w-2 h-2 rounded-full ${isGeocoding ? "bg-amber-500 animate-spin" : "bg-emerald-500"}`} />
              <span>{isGeocoding ? "Resolving street..." : `${lat.toFixed(4)}, ${lng.toFixed(4)}`}</span>
            </div>
          </div>
        </div>

        {/* Bottom Selected Address & Confirmation Bar */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-100 shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">
              Confirmed Destination
            </span>
            <p className="text-sm font-bold text-slate-950 truncate mt-0.5 font-heading">
              {address}
            </p>
            <p className="text-xs font-mono text-slate-500 truncate">
              {city}, {region}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-5 py-3 rounded-xl border border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 transition-colors font-mono"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 sm:flex-initial px-6 py-3 bg-slate-950 text-white font-bold text-xs font-mono uppercase tracking-wider rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              <Check className="w-4 h-4" />
              <span>Confirm Location</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
