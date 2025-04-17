import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import axios from 'axios';

// Handle ES module path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load credentials and tutor data
const serviceAccount = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../serviceAccountKey.json'), 'utf-8')
);
const tutorsRaw = JSON.parse(
  fs.readFileSync(path.join(__dirname, './tutors.json'), 'utf-8')
);

const tutors = Object.values(tutorsRaw);

const GOOGLE_MAPS_API_KEY = 'AIzaSyCiSXCcoY4t8TQtIPVOFx0fQwlWgsTqUM4';

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

// 🔍 Geocode a location into lat/lng
async function fetchCoordinates(location) {
  try {
    const res = await axios.get(
      'https://maps.googleapis.com/maps/api/geocode/json',
      {
        params: {
          address: location,
          key: GOOGLE_MAPS_API_KEY,
        },
      }
    );

    const result = res.data.results[0];
    if (result) {
      const coords = result.geometry.location;
      console.log(`✅ Found coordinates for ${location}:`, coords);
      return coords; // { lat, lng }
    } else {
      console.warn(`⚠️ No results found for location: ${location}`);
    }
  } catch (err) {
    console.error(`❌ Error fetching coordinates for ${location}:`, err.message);
  }

  return null;
}

// 🌟 Main import function
async function importTutors() {
  const batch = db.batch();

  for (const tutor of tutors) {
    const docRef = db.collection('tutors').doc(); // auto-generated ID

    const coords = await fetchCoordinates(tutor.location);

    const tutorWithCoords = {
      ...tutor,
      coordinates: coords || null,
    };

    batch.set(docRef, tutorWithCoords);
  }

  try {
    await batch.commit();
    console.log('🎉 Tutors imported with coordinates!');
  } catch (error) {
    console.error('❌ Failed to commit tutor batch:', error);
  }
}

importTutors();
