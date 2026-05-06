"use client";

import { useEffect, useRef, useCallback, useState, useImperativeHandle, forwardRef } from "react";
import type { MapBusiness } from "@/lib/map-utils";
import { getCategoryColor, getDirectionsUrl, HARMONY_CENTER, DEFAULT_ZOOM } from "@/lib/map-utils";
import { harmonyBoundary } from "@/data/town/harmony-boundary";
import { settings } from "@/data/town/settings";
import type L from "leaflet";

const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";

export interface HarmonyMapHandle {
	resetView: () => void;
}

interface HarmonyMapProps {
	businesses: MapBusiness[];
	selectedBusiness: MapBusiness | null;
	onMarkerClick: (business: MapBusiness) => void;
}

export const HarmonyMap = forwardRef<HarmonyMapHandle, HarmonyMapProps>(function HarmonyMap(
	{ businesses, selectedBusiness, onMarkerClick },
	ref,
) {
	const mapContainerRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<L.Map | null>(null);
	const markersRef = useRef<Map<string, L.CircleMarker>>(new Map());
	const prevSelectedRef = useRef<string | null>(null);
	const leafletRef = useRef<typeof import("leaflet") | null>(null);
	const [mapReady, setMapReady] = useState(false);

	useEffect(() => {
		let cancelled = false;

		async function init() {
			if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
				const link = document.createElement("link");
				link.rel = "stylesheet";
				link.href = LEAFLET_CSS;
				document.head.appendChild(link);
				await new Promise<void>((resolve) => {
					link.onload = () => resolve();
					link.onerror = () => resolve();
				});
			}

			const Leaf = await import("leaflet");
			if (cancelled) return;

			leafletRef.current = Leaf;

			if (!mapContainerRef.current || mapRef.current) return;

			const map = Leaf.map(mapContainerRef.current, {
				center: HARMONY_CENTER,
				zoom: DEFAULT_ZOOM,
				zoomControl: false,
				attributionControl: true,
			});

			Leaf.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
				attribution:
					'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
				subdomains: "abcd",
				maxZoom: 19,
			}).addTo(map);

			Leaf.control.zoom({ position: "topright" }).addTo(map);

			// Town boundary with clickable info popup
			const boundaryLayer = Leaf.geoJSON(harmonyBoundary as GeoJSON.FeatureCollection, {
				style: {
					color: "#3D5038",
					weight: 3,
					opacity: 0.85,
					dashArray: "8, 6",
					fillColor: "#5B7553",
					fillOpacity: 0.06,
				},
			}).addTo(map);

			boundaryLayer.bindPopup(
				`<div style="font-family: system-ui, sans-serif; min-width: 200px;">
					<h3 style="margin:0 0 6px; font-size:15px; font-weight:700; color:#2C3B26;">${settings.siteTitle}</h3>
					<div style="display:flex; gap:16px; margin-bottom:8px;">
						<div>
							<p style="margin:0; font-size:11px; color:#635E56; text-transform:uppercase; letter-spacing:0.5px;">Population</p>
							<p style="margin:2px 0 0; font-size:16px; font-weight:600; color:#2D2A24;">~531</p>
						</div>
						<div>
							<p style="margin:0; font-size:11px; color:#635E56; text-transform:uppercase; letter-spacing:0.5px;">Area</p>
							<p style="margin:2px 0 0; font-size:16px; font-weight:600; color:#2D2A24;">~1.4 sq mi</p>
						</div>
					</div>
					<p style="margin:0 0 6px; font-size:12px; color:#635E56; line-height:1.4;">${settings.branding.county}, ${settings.branding.state}<br/>Incorporated ${settings.branding.established}</p>
					<a href="https://www.townofharmony.org" target="_blank" rel="noopener noreferrer"
						style="display:inline-block; padding:4px 12px; border-radius:9999px; font-size:11px; font-weight:500; color:#fff; background:#3D5038; text-decoration:none;">
						Visit townofharmony.org
					</a>
				</div>`,
				{ closeButton: true, maxWidth: 280 },
			);

			mapRef.current = map;
			setMapReady(true);
		}

		init();

		return () => {
			cancelled = true;
			if (mapRef.current) {
				mapRef.current.remove();
				mapRef.current = null;
			}
			markersRef.current.clear();
			leafletRef.current = null;
			setMapReady(false);
		};
	}, []);

	useImperativeHandle(ref, () => ({
		resetView: () => {
			const map = mapRef.current;
			if (!map) return;
			map.flyTo(HARMONY_CENTER, DEFAULT_ZOOM, { duration: 0.8 });
		},
	}));

	const onMarkerClickRef = useRef(onMarkerClick);
	onMarkerClickRef.current = onMarkerClick;

	useEffect(() => {
		const Leaf = leafletRef.current;
		const map = mapRef.current;
		if (!Leaf || !map || !mapReady) return;

		markersRef.current.forEach((marker) => marker.remove());
		markersRef.current.clear();

		businesses.forEach((biz) => {
			const color = getCategoryColor(biz.category);
			const isSelected = selectedBusiness?.id === biz.id;
			const directionsLink = getDirectionsUrl(biz.address);

			const marker = Leaf.circleMarker([biz.lat, biz.lng], {
				radius: isSelected ? 10 : 7,
				fillColor: color,
				color: isSelected ? "#2C3B26" : "#ffffff",
				weight: isSelected ? 3 : 2,
				opacity: 1,
				fillOpacity: 0.9,
			}).addTo(map);

			marker.bindPopup(
				`<div style="font-family: system-ui, sans-serif; min-width: 180px;">
					<h3 style="margin:0 0 4px; font-size:14px; font-weight:600; color:#2D2A24;">${biz.name}</h3>
					<p style="margin:0 0 3px; font-size:12px; color:#635E56; line-height:1.4;">${biz.address}</p>
					${biz.phone ? `<p style="margin:0 0 3px; font-size:12px; color:#635E56;">${biz.phone}</p>` : ""}
					<span style="display:inline-block; margin-top:4px; padding:2px 8px; border-radius:9999px; font-size:11px; font-weight:500; color:#fff; background:${color};">${biz.category}</span>
					${biz.description ? `<p style="margin:6px 0 0; font-size:11px; color:#635E56; line-height:1.4;">${biz.description}</p>` : ""}
					<a href="${directionsLink}" target="_blank" rel="noopener noreferrer"
						style="display:inline-flex; align-items:center; gap:4px; margin-top:6px; padding:3px 10px; border-radius:9999px; font-size:11px; font-weight:500; color:#3D5038; background:#D4CBBD66; text-decoration:none;">
						&#x2794; Directions
					</a>
				</div>`,
				{ closeButton: true, maxWidth: 260 },
			);

			marker.on("click", () => {
				onMarkerClickRef.current(biz);
			});

			markersRef.current.set(biz.id, marker);
		});
	}, [businesses, selectedBusiness, mapReady]);

	const flyTo = useCallback((business: MapBusiness) => {
		const map = mapRef.current;
		if (!map) return;

		map.flyTo([business.lat, business.lng], 17, {
			duration: 0.8,
		});

		const marker = markersRef.current.get(business.id);
		if (marker) {
			setTimeout(() => marker.openPopup(), 400);
		}
	}, []);

	useEffect(() => {
		if (!mapReady) return;
		if (selectedBusiness && selectedBusiness.id !== prevSelectedRef.current) {
			flyTo(selectedBusiness);
			prevSelectedRef.current = selectedBusiness.id;
		}
		if (!selectedBusiness) {
			prevSelectedRef.current = null;
		}
	}, [selectedBusiness, flyTo, mapReady]);

	return (
		<div
			ref={mapContainerRef}
			className="h-full w-full isolate"
			role="application"
			aria-label="Interactive map of Harmony, NC"
		/>
	);
});
