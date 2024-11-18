import React, { useState } from 'react';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';

// Group locations based on proximity or a key
function groupLocations(locations, groupByKey = 'region') {
  const grouped = {};

  locations.forEach(location => {
    const groupKey = location[groupByKey] || 'default';
    if (!grouped[groupKey]) {
      grouped[groupKey] = [];
    }
    grouped[groupKey].push(location);
  });

  return Object.values(grouped).map(group => {
    const latSum = group.reduce((sum, loc) => sum + loc.latitude, 0);
    const lngSum = group.reduce((sum, loc) => sum + loc.longitude, 0);

    return {
      key: group[0][groupByKey], // First item's group key
      latitude: latSum / group.length,
      longitude: lngSum / group.length,
      count: group.length,
      locations: group,
    };
  });
}

export default function MapWithGroupedMarkers({ locationList, initialZoom, initialCoords }) {
  const [mapZoom, setMapZoom] = useState(initialZoom);
  const [mapCoords, setMapCoords] = useState(initialCoords);
  const [showIndividualMarkers, setShowIndividualMarkers] = useState(false);

  const groupedLocations = groupLocations(locationList);

  const handleGroupClick = (group) => {
    setMapZoom(12); // Zoom in when clicking a group
    setMapCoords({ lat: group.latitude, lng: group.longitude });
    setShowIndividualMarkers(group.locations);
  };

  const resetMap = () => {
    setMapZoom(initialZoom);
    setMapCoords(initialCoords);
    setShowIndividualMarkers(false);
  };

  // Update state when the user manually zooms or pans
  const handleCameraChange = (camera) => {
    setMapZoom(camera.zoom);
    setMapCoords({ lat: camera.center.lat, lng: camera.center.lng });
  };

  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_API_KEY}>
      <Map
        className="max-h-[95%] md:h-[40rem] flex-[3_3_0%] md:border"
        mapId="mainMap"
        gestureHandling="greedy"
        disableDefaultUI={true}
        zoom={mapZoom}
        center={mapCoords}
        onCameraChanged={handleCameraChange} // Allow manual zoom and pan
      >
        {/* Render grouped markers if not zoomed in */}
        {!showIndividualMarkers &&
          groupedLocations.map((group, i) => (
            <AdvancedMarker
              onClick={() => handleGroupClick(group)}
              clickable={true}
              key={group.key || `group-${i}`}
              position={{ lat: group.latitude, lng: group.longitude }}
            >
              <div className="flex p-2 text-xl justify-center items-center">
                <i className="fas fa-map-marker-alt flex flex-1 text-4xl text-[orange]"></i>
                <div className="px-2 border rounded flex flex-2 text-nowrap text-[white] text-lg bg-[green]">
                  {group.count} locations
                </div>
              </div>
            </AdvancedMarker>
          ))}

        {/* Render individual markers if zoomed in */}
        {showIndividualMarkers &&
          showIndividualMarkers.map((location, i) => (
            <AdvancedMarker
              onClick={() => console.log('Clicked individual marker', location)}
              clickable={true}
              key={location.longitude}
              position={{ lat: location.latitude, lng: location.longitude }}
            >
              <div className="flex p-2 text-xl justify-center items-center">
                <i className="fas fa-map-marker-alt flex flex-1 text-4xl text-[red]"></i>
                <div className="px-2 border rounded flex flex-2 text-nowrap text-[white] text-lg bg-[blue]">
                  {location.name}
                </div>
              </div>
            </AdvancedMarker>
          ))}

        {/* Add a reset button */}
        <div
          className="absolute top-4 left-4 bg-white text-black p-2 rounded shadow-md cursor-pointer"
          onClick={resetMap}
        >
          Reset Map
        </div>
      </Map>
    </APIProvider>
  );
}
