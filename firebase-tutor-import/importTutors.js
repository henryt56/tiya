
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");
const data = require("./tutors.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function importTutors() {
  for (const id in data) {
    await db.collection("tutors").doc(id).set(data[id]);
    console.log(`Imported ${id}`);
  }
  console.log("✅ All tutors imported!");
}

importTutors();
