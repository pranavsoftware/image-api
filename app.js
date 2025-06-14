import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDoc,
  getDocs,
  doc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBbpEZD-Hq0bs44lG7PfSER6fg4wbNgtWY",
  authDomain: "standards-club-vitv-74474.firebaseapp.com",
  projectId: "standards-club-vitv-74474",
  storageBucket: "standards-club-vitv-74474.appspot.com",
  messagingSenderId: "313100673493",
  appId: "1:313100673493:web:4f2ba97f24ed95621fdd5c",
  measurementId: "G-KBKCTVQG5K"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Upload image as Base64
window.uploadImage = async function () {
  const fileInput = document.getElementById('imageInput');
  const loader = document.getElementById('loader');

  if (!fileInput.files[0]) {
    alert('Please select an image!');
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();

  loader.classList.remove("hidden");

  reader.onload = async function (e) {
    const base64 = e.target.result;

    try {
      const docRef = await addDoc(collection(db, "images"), {
        base64: base64,
        timestamp: new Date()
      });

      const shareURL = `${window.location.origin}${window.location.pathname}?id=${docRef.id}`;
      alert("Uploaded! Shareable link copied.");
      navigator.clipboard.writeText(shareURL);
      loadAllImages();
    } catch (error) {
      alert("Upload failed: " + error.message);
    } finally {
      loader.classList.add("hidden");
    }
  };

  reader.readAsDataURL(file);
};

// Display all uploaded images
async function loadAllImages() {
  const container = document.getElementById('imageBlock');
  container.innerHTML = '';

  const q = query(collection(db, "images"), orderBy("timestamp", "desc"));
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const shareURL = `${window.location.origin}${window.location.pathname}?id=${docSnap.id}`;
    const imageHTML = `
      <div class="image-card">
        <img src="${data.base64}" />
        <a href="${shareURL}" class="share-link" target="_blank">${shareURL}</a>
        <button class="copy-button" onclick="copyToClipboard('${shareURL}')">Copy Link</button>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', imageHTML);
  });
}

// Show only image if direct share link is opened
window.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');

  if (id) {
    // Show only the image — no UI
    const docRef = doc(db, "images", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      document.body.innerHTML = `<img src="${data.base64}" style="width:100%;height:auto;display:block;margin:auto;" />`;
    } else {
      document.body.innerHTML = `<h2>Image Not Found</h2>`;
    }
  } else {
    // Default UI view
    loadAllImages();
  }
});

// Copy shareable link
window.copyToClipboard = function (link) {
  navigator.clipboard.writeText(link).then(() => {
    alert("Link copied to clipboard!");
  });
}
