import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { Navigation, MapPin, Compass, ShieldCheck } from "lucide-react";

interface LiveTrackingMapProps {
  courierLat: number;
  courierLng: number;
  destinationLat: number;
  destinationLng: number;
  courierName: string;
  orderNo: string;
}

export function LiveTrackingMap({
  courierLat,
  courierLng,
  destinationLat,
  destinationLng,
  courierName,
  orderNo,
}: LiveTrackingMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const courierMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  const token =
    (import.meta as any).env?.VITE_MAPBOX_TOKEN ||
    (import.meta as any).env?.VITE_MAPBOX_ACCESS_TOKEN ||
    "";

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!token || token.length < 20) {
      setUseFallback(true);
      return;
    }

    try {
      mapboxgl.accessToken = token;

      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: [courierLng, courierLat],
        zoom: 13.8,
        attributionControl: false,
      });

      // Add zoom and rotation controls to the map
      map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), "top-right");

      map.on("load", () => {
        setMapLoaded(true);

        // Destination Marker
        const destEl = document.createElement("div");
        destEl.className = "flex items-center justify-center w-9 h-9 rounded-full bg-slate-950 text-white shadow-2xl border-2 border-white cursor-pointer hover:scale-110 transition-transform";
        destEl.innerHTML = `<span style="font-size:16px;">📍</span>`;
        new mapboxgl.Marker(destEl)
          .setLngLat([destinationLng, destinationLat])
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<div style="padding:6px;font-family:sans-serif;font-size:12px;font-weight:bold;">📍 Delivery Destination</div>`))
          .addTo(map);

        // Courier Marker with glowing animated pulse
        const courierEl = document.createElement("div");
        courierEl.className = "relative flex items-center justify-center w-11 h-11 rounded-2xl bg-emerald-500 text-white shadow-2xl border-2 border-white cursor-pointer";
        courierEl.innerHTML = `
          <span style="font-size:18px;">🛵</span>
          <span class="absolute -inset-2 rounded-2xl bg-emerald-400 opacity-50 animate-ping"></span>
        `;
        courierMarkerRef.current = new mapboxgl.Marker(courierEl)
          .setLngLat([courierLng, courierLat])
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<div style="padding:6px;font-family:sans-serif;font-size:12px;font-weight:bold;">🛵 ${courierName}</div>`))
          .addTo(map);

        // Add connecting live route line
        const routeGeoJSON: GeoJSON.Feature<GeoJSON.LineString> = {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: [
              [courierLng, courierLat],
              [(courierLng + destinationLng) / 2 + 0.002, (courierLat + destinationLat) / 2 - 0.001],
              [destinationLng, destinationLat],
            ],
          },
        };

        map.addSource("route", {
          type: "geojson",
          data: routeGeoJSON,
        });

        map.addLayer({
          id: "route-glow",
          type: "line",
          source: "route",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#10b981",
            "line-width": 8,
            "line-opacity": 0.3,
          },
        });

        map.addLayer({
          id: "route",
          type: "line",
          source: "route",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#0f172a",
            "line-width": 3.5,
            "line-dasharray": [2, 1],
          },
        });

        // Fit map bounds smoothly
        const bounds = new mapboxgl.LngLatBounds()
          .extend([courierLng, courierLat])
          .extend([destinationLng, destinationLat]);
        map.fitBounds(bounds, { padding: 70, maxZoom: 15.5 });
      });

      map.on("error", () => {
        setUseFallback(true);
      });

      mapRef.current = map;

      return () => {
        map.remove();
      };
    } catch {
      setUseFallback(true);
    }
  }, [token]);

  // Update courier marker position & map center in real-time
  useEffect(() => {
    if (courierMarkerRef.current) {
      courierMarkerRef.current.setLngLat([courierLng, courierLat]);
    }
    if (mapRef.current && mapLoaded) {
      // Update dynamic route line
      const routeSource: mapboxgl.GeoJSONSource = mapRef.current.getSource("route") as any;
      if (routeSource) {
        routeSource.setData({
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: [
              [courierLng, courierLat],
              [(courierLng + destinationLng) / 2 + 0.001, (courierLat + destinationLat) / 2],
              [destinationLng, destinationLat],
            ],
          },
        });
      }
    }
  }, [courierLat, courierLng, destinationLat, destinationLng, mapLoaded]);

  return (
    <div className="relative w-full h-[420px] sm:h-[480px] rounded-3xl overflow-hidden border border-slate-200 shadow-xl bg-slate-100">
      {!useFallback ? (
        <div ref={mapContainerRef} className="w-full h-full" />
      ) : (
        /* Resilient Fallback Canvas */
        <div className="relative w-full h-full bg-[#f4f6f8] flex flex-col items-center justify-center p-6 overflow-hidden">
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: `linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)`,
              backgroundSize: "36px 36px",
            }}
          />
          <div className="relative z-10 flex flex-col items-center animate-bounce">
            <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500 text-white shadow-2xl border-4 border-white">
              <Navigation className="w-7 h-7 transform rotate-45" />
              <span className="absolute -inset-3 rounded-2xl bg-emerald-400 opacity-40 animate-ping" />
            </div>
            <div className="mt-3 px-3.5 py-1.5 bg-slate-900 text-white rounded-full text-xs font-bold shadow-md flex items-center gap-1.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{courierName}</span>
            </div>
          </div>
          <div className="absolute top-12 right-12 z-10 flex flex-col items-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-950 text-white shadow-xl border-2 border-white">
              <MapPin className="w-5 h-5 text-rose-400" />
            </div>
            <span className="mt-1 px-2.5 py-0.5 bg-white text-slate-800 rounded-full text-[10px] font-bold shadow-sm border border-slate-200">
              Customer Destination
            </span>
          </div>
        </div>
      )}

      {/* Floating Telemetry Stats Overlay */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <div>
            <p className="text-xs font-bold text-slate-900 font-heading flex items-center gap-1.5">
              <span>Live Mapbox Telemetry</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            </p>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
              GPS: {courierLat.toFixed(4)}° N, {Math.abs(courierLng).toFixed(4)}° W
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 font-mono">
            {orderNo}
          </span>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Mapbox Live</span>
          </span>
        </div>
      </div>
    </div>
  );
}
