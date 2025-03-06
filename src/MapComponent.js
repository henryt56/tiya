import React, { useEffect } from 'react';

function MapComponent() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap`;
    script.async = true;
    script.onload = () => {
      window.initMap = () => {
        const map = new window.google.maps.Map(document.getElementById('map'), {
          center: { lat: 33.7490, lng: -84.3880 }, // Centered on Atlanta, GA
          zoom: 12,
        });

        // Example tutor locations
        const tutorLocations = [
          { name: 'Tutor 1', lat: 33.7490, lng: -84.3880 }, // Example 1
          { name: 'Tutor 2', lat: 33.7610, lng: -84.3910 }, // Example 2
          { name: 'Tutor 3', lat: 33.7570, lng: -84.3790 }, // Example 3
        ];


        tutorLocations.forEach((location) => {
          new window.google.maps.Marker({
            position: { lat: location.lat, lng: location.lng },
            map: map,
            title: location.name,
          });
        });
      };
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div
      id="map"
      style={{ width: '100%', height: '400px' }}
    >
      {/* Google Map will render here */} 
    </div>
  );
}

export default MapComponent;
