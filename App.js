if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js')
    .then(() => console.log('Service Worker Registered'));
}

// Example: Load map
document.addEventListener("DOMContentLoaded", () => {
  console.log("Map would load here");
});
