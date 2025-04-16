const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json"); // Go up one level to access from root
const data = require("./tutors.json"); // tutors.json is in the same folder

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Import tutors from tutors.json into Firestore
async function importTutors() {
  for (const id in data) {
    await db.collection("tutors").doc(id).set(data[id]);
    console.log(` Imported tutor with ID: ${id}`);
  }
  console.log(" All tutors successfully imported!");
}

importTutors();
