export function hasVisitedBefore() {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open("appDB", 1);

    request.onerror = (event) => {
      console.error("IndexedDB error:", event.target.error);
      reject(false);
    };

    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(["visits"], "readonly");
      const objectStore = transaction.objectStore("visits");

      const getReq = objectStore.getAll();

      getReq.onsuccess = (event) => {
        const visits = event.target.result;
        resolve(visits.length > 0);
      };

      getReq.onerror = (event) => {
        console.error("IndexedDB get error:", event.target.error);
        reject(false);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      const objectStore = db.createObjectStore("visits", {
        autoIncrement: true,
      });
      objectStore.createIndex("timestamp", "timestamp", { unique: false });
    };
  });
}
