function arrayBufferToWordArray(ab) {
  var i8a = new Uint8Array(ab);
  var a = [];
  for (var i = 0; i < i8a.length; i += 4) {
    a.push(
      (i8a[i] << 24) | (i8a[i + 1] << 16) | (i8a[i + 2] << 8) | i8a[i + 3]
    );
  }
  var CryptoJS = require("crypto-js");
  return CryptoJS.lib.WordArray.create(a, i8a.length);
}

export async function hashFile(fileToHandle, callback, _is256 = true) {
  var CryptoJS = require("crypto-js");
  var reader = new FileReader();

  reader.onloadend = (function () {
    return function (e) {
      // Early iteration of Ambr used SHA1; files < 1st Sept 20:00 GMT will have 40 char fingerprint hash
      let hash;
      if (_is256) {
        hash = CryptoJS.SHA256(
          arrayBufferToWordArray(e.target.result)
        ).toString();
      } else {
        // Use SHA1 if _is256 is false
        hash = CryptoJS.SHA1(
          arrayBufferToWordArray(e.target.result)
        ).toString();
      }
      console.log("Hash result in fileReader: ", hash);
      callback(fileToHandle, hash);
    };
  })(fileToHandle);
  reader.onerror = function (e) {
    console.error(e);
  };
  reader.readAsArrayBuffer(fileToHandle);
}
