let schema = window.location.protocol.startsWith("https:") ? "https" : "http";
let defQRVal = `${schema}://${window.document.location.host}${window.document.location.pathname}`;
const zero_uuid = "00000000-0000-0000-0000-000000000000";
let ls_uuid = "no-storage";
const ovrHidden = "hidden";
const ovrQRShow = "qr-show";
const ovrQRCam = "qr-cam";
let ovrMode = ovrHidden;

function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}
function storageAvailable(type) {
  let storage;
  try {
    storage = window[type];
    let x = "__storage_test__";
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return (
      e instanceof DOMException &&
      // everything except Firefox
      (e.code === 22 ||
        // Firefox
        e.code === 1014 ||
        // test name field too, because code might not be present
        // everything except Firefox
        e.name === "QuotaExceededError" ||
        // Firefox
        e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
      // acknowledge QuotaExceededError only if there's something already stored
      storage &&
      storage.length !== 0
    );
  }
}
const refreshStorage = () => {
  if (storageAvailable("localStorage")) {
    let x_ls_uuid = window.localStorage.getItem("uuid");
    if (typeof x_ls_uuid === "undefined" || x_ls_uuid === null) {
      ls_uuid = uuidv4();
      window.localStorage.setItem("uuid", ls_uuid);
    }
  } else {
    console.debug("localStorage not available");
  }
};
refreshStorage();

const onHashChange = (event) => {
  // place holder
};

const log = (message) => {
  console.log("callLog", message);
};

let qrcode;

const configQr = {
  fps: 10,
  facingMode: "environment",
  formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
  qrbox: { width: "90%", height: "90%" },
};

const onLoad = (event) => {
  // if ("serviceWorker" in navigator) {
  //   navigator.serviceWorker.register("worker.js").then(
  //     (reg) => {
  //       console.log("Service worker registered : ", reg);
  //     },
  //     (err) => {
  //       console.error("Service worker not registered : ", err);
  //     }
  //   );
  // }
  const butShow = document.getElementById("butShow");
  const butScan = document.getElementById("butScan");
  const butShare = document.getElementById("butShare");
  const butConnect = document.getElementById("butConnect");
  const elOvr = document.getElementById("overlay");
  // ---
  const html5QrcodeScanner = new Html5Qrcode("QRCam");
  const elQRCam = document.getElementById("QRCam");
  const elQRImg = document.getElementById("QRImg");
  const elQRVal = document.getElementById("QRVal");
  // ---
  const elNotif = document.getElementById("notif");
  const elDialog = document.getElementById("dialog");
  // ====
  function insert_qr(url, el_qr, el_val) {
    if (typeof qrcode !== "undefined") {
      qrcode.clear();
    }
    el_qr.innerHTML = "";
    qrcode = new window.QRCode(el_qr, {
      text: url,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: window.QRCode.CorrectLevel.H,
    });
    el_val.innerHTML = url;
  }
  function makeQRCode() {
    url = defQRVal;
    if (ovrMode === ovrHidden) {
      if (typeof qrcode !== "undefined") {
        qrcode.clear();
      }
      elOvr.style.display = "block";
      elQRImg.style.display = "block";
      elQRVal.style.display = "block";
      insert_qr(url, elQRImg, elQRVal);
      ovrMode = ovrQRShow;
    } else if (ovrMode === ovrQRShow) {
      elOvr.style.display = "none";
      elQRImg.style.display = "none";
      elQRVal.style.display = "none";
      if (typeof qrcode !== "undefined") {
        qrcode.clear();
      }
      ovrMode = ovrHidden;
    }
  }
  function onScanSuccess(decodedText, decodedResult) {
    if (decodedText !== window.lastResult) {
      const el = document.getElementById("scan_res");
      if (el) {
        console.log(decodedResult);
        try {
          defQRVal = decodedResult.decodedText;
          elDialog.innerText = decodedResult.decodedText;
          adata = JSON.parse(decodedResult.decodedText);
          console.debug(adata);
        } catch (err) {
          console.error(err);
        }
      } else {
        console.error("scan_res not found");
      }
      stopScan();
    }
  }
  function stopScan() {
    if (html5QrcodeScanner.isScanning)
      html5QrcodeScanner
        .stop()
        .then((ignore) => {
          console.debug("stopped qr scanner");
          elQRCam.style.display = "none";
        })
        .catch((err) => {
          console.log(err);
        });
    elOvr.style.display = "none";
    ovrMode = ovrHidden;
  }
  function onScanFailure(error) {
    // console.warn(`Code scan error = ${error}`);
  }
  function startScan() {
    elOvr.style.display = "flex";
    elQRCam.style.display = "flex";
    ovrMode = ovrQRCam;
    html5QrcodeScanner.start(
      { facingMode: "environment" },
      configQr,
      onScanSuccess,
      onScanFailure
    );
  }
  // function toggleScan(event) {
  //   if (html5QrcodeScanner && html5QrcodeScanner.isScanning) {
  //     console.log("stop");
  //     stopScan();
  //   } else {
  //     console.log("start");
  //     startScan();
  //   }
  // }
  const onScan = (event) => {
    event.preventDefault();
    // log("scan");
    // toggleScan();
    startScan();
  };
  const onShow = (event) => {
    event.preventDefault();
    // log("show");
    makeQRCode();
  };
  butScan.addEventListener("click", onScan);
  elOvr.addEventListener("click", function () {
    if (ovrMode === ovrQRCam) {
      stopScan();
    } else if (ovrMode === ovrQRShow) {
      makeQRCode();
    } else {
      console.debug(ovrMode);
    }
  });
  butShow.addEventListener("click", onShow);
};

window.addEventListener("load", onLoad);
window.addEventListener("hashchange", onHashChange);
