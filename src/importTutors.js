import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import axios from 'axios';

// Resolve __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Firebase credentials
const serviceAccount = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../serviceAccountKey.json'), 'utf-8')
);

const GOOGLE_MAPS_API_KEY = 'AIzaSyDH5lSWgeZDm_UmxMa6PQnEr6IT1xFMdqg';

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

async function fetchCoordinates(location) {
  try {
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/geocode/json',
      {
        params: {
          address: location,
          key: GOOGLE_MAPS_API_KEY,
        },
      }
    );

    const result = response.data.results[0];
    return result?.geometry?.location || null;
  } catch (err) {
    console.error(` Error fetching coordinates for ${location}:`, err.message);
    return null;
  }
}

async function updateMissingCoordinates() {
  const snapshot = await db.collection('tutors').get();
  let updated = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();

    if (!data.coordinates || data.coordinates === null) {
      const coords = await fetchCoordinates(data.location);
      if (coords) {
        await db.collection('tutors').doc(doc.id).update({
          coordinates: coords,
        });
        console.log(` Updated ${data.name} with coordinates:`, coords);
        updated++;
      } else {
        console.warn(` Skipped ${data.name} — couldn't fetch coordinates`);
      }
    }
  }

  console.log(`Finished updating ${updated} tutors with coordinates!`);
}

updateMissingCoordinates();
