import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDoc, getDocs, doc, query, orderBy } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

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

// Initialize Firebase
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
      displayImage(base64, shareURL);
      loadAllImages(); // refresh the list
    } catch (error) {
      alert("Error uploading image: " + error);
    } finally {
      loader.classList.add("hidden");
    }
  };

  reader.readAsDataURL(file);
};

// Display a single image card
function displayImage(base64, shareURL, append = true) {
  const container = document.getElementById('imageBlock');
  const imageHTML = `
    <div class="image-card">
      <img src="${base64}" />
      <a href="${shareURL}" class="share-link" target="_blank">${shareURL}</a>
      <button class="copy-button" onclick="copyToClipboard('${shareURL}')">Copy Link</button>
    </div>
  `;
  if (append) {
    container.insertAdjacentHTML('afterbegin', imageHTML);
  } else {
    container.innerHTML = imageHTML;
  }
}

// Load all images from Firestore
async function loadAllImages() {
  const container = document.getElementById('imageBlock');
  container.innerHTML = '';

  const q = query(collection(db, "images"), orderBy("timestamp", "desc"));
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const shareURL = `${window.location.origin}${window.location.pathname}?id=${docSnap.id}`;
    displayImage(data.base64, shareURL, true);
  });
}

// Check for shared image ID in URL
window.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  if (id) {
    const docRef = doc(db, "images", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const shareURL = `${window.location.origin}${window.location.pathname}?id=${id}`;
      displayImage(data.base64, shareURL, false);
    } else {
      alert("Image not found.");
    }
  } else {
    await loadAllImages();
  }
});

// Copy to clipboard
window.copyToClipboard = function (link) {
  navigator.clipboard.writeText(link).then(() => {
    alert("Link copied to clipboard!");
  });
}
