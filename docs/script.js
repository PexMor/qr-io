let schema = window.location.protocol.startsWith("https:") ? "https" : "http";
let defQRVal = `${schema}://${window.document.location.host}${window.document.location.pathname}`;
const zero_uuid = "00000000-0000-0000-0000-000000000000";
let ls_uuid = "no-storage";
const smNone = "none";
const smAutoSend = "auto-send";
let scannerMode = smNone;
let sendUrl;
const ovrHidden = "hidden";
const ovrQRShow = "qr-show";
const ovrQRCam = "qr-cam";
const ovrQRConfig = "qr-cfg";
let ovrMode = ovrHidden;
let webSocket;

const wsWeakSend = (data) => {
  let dataStr = JSON.stringify(data);
  if (webSocket.readyState === WebSocket.OPEN) {
    webSocket.send(dataStr);
  } else {
    logger.error("WS not open");
  }
};

const openWs = () => {
  if (webSocket) {
    console.log("Closing previous socket");
    webSocket.close(3001);
  }
  webSocket = new WebSocket(sendUrl);
  webSocket.onopen = function (e) {
    if (elStatus) {
      elStatus.innerHTML = "WS connected";
      elStatus.style.backgroundColor = "#afa";
    }
  };
  webSocket.onclose = function (e) {
    if (elStatus) {
      elStatus.innerHTML = "WS NOT connected";
      elStatus.style.backgroundColor = "#faa";
    }
    setTimeout(openWs, 2000);
  };

  webSocket.onerror = function (err) {
    if (elStatus) {
      elStatus.innerHTML = "WS error";
      elStatus.style.backgroundColor = "#faa";
    }
  };
  webSocket.onmessage = async (event) => {
    let eventData = await event.data.text();
    try {
      const data = JSON.parse(eventData);
      if (data && data.name) {
        console.debug(data.name);
      } else {
        console.error("event w/o .name");
      }
    } catch (err) {
      logger.error(err, event.data);
    }
  };
};

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
  const butConfig = document.getElementById("butConfig");
  const elOvrDiv = document.getElementById("overlay");
  // ---
  const html5QrcodeScanner = new Html5Qrcode("QRCamDiv");
  const elQRCamDiv = document.getElementById("QRCamDiv");
  const elQRImgDiv = document.getElementById("QRImgDiv");
  const elQRImg = document.getElementById("QRImg");
  const elQRValDiv = document.getElementById("QRValDiv");
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
    if (ovrMode === ovrHidden) {
      elOvrDiv.style.display = "block";
      elQRImgDiv.style.display = "block";
      elQRValDiv.style.display = "block";
      const svg = makeQRSVG(defQRVal);
      console.debug(defQRVal, svg);
      elQRImgDiv.innerHTML = svg;
      elQRValDiv.innerText = defQRVal;
      ovrMode = ovrQRShow;
    } else if (ovrMode === ovrQRShow) {
      elOvrDiv.style.display = "none";
      elQRImgDiv.style.display = "none";
      elQRValDiv.style.display = "none";
      elQRImgDiv.innerHTML = "";
      ovrMode = ovrHidden;
    }
  }
  function onScanSuccess(decodedText, decodedResult) {
    if (decodedText !== window.lastResult) {
      console.debug(decodedResult);
      try {
        defQRVal = decodedResult.decodedText;
        elDialog.innerText = decodedResult.decodedText;
        adata = JSON.parse(decodedResult.decodedText);
        console.debug(adata);
        if (ovrMode === ovrQRConfig) {
          if (adata["mode"]) {
            if (adata["mode"] === smAutoSend) {
              scannerMode = smNone;
              if (adata["url"] && adata["url"] !== "") {
                scannerMode = smAutoSend;
                sendUrl = adata["url"];
                console.debug(scannerMode, sendUrl);
                if (sendUrl.startsWith("wss://")) {
                  openWs();
                }
              } else {
                console.error("no url");
              }
            } else {
              console.error(`unknown mode ${adata["mode"]}`);
            }
          } else {
            console.error("no mode");
          }
        } else {
          if (scannerMode === smAutoSend) {
            let dataOut = { id: ls_uuid, data: adata };
            console.debug(scannerMode, dataOut);
            if (sendUrl.startsWith("wss://")) {
              console.debug("using WS");
              wsWeakSend(dataOut);
            } else if (sendUrl.startsWith("https://")) {
              console.debug("using json HTTPS post");
              (async () => {
                const rawResponse = await fetch(sendUrl, {
                  method: "POST",
                  headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(dataOut),
                });
                const content = await rawResponse.json();
                console.log(content);
              })();
            }
          }
        }
      } catch (err) {
        console.error(err.message);
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
          elQRCamDiv.style.display = "none";
        })
        .catch((err) => {
          console.log(err);
        });
    elOvrDiv.style.display = "none";
    ovrMode = ovrHidden;
  }
  function onScanFailure(error) {
    // the scanner is failing periodically
    // console.warn(`Code scan error = ${error}`);
  }
  function startScan(qrScanMode) {
    elOvrDiv.style.display = "flex";
    elQRCamDiv.style.display = "flex";
    ovrMode = qrScanMode;
    html5QrcodeScanner.start(
      { facingMode: "environment" },
      configQr,
      onScanSuccess,
      onScanFailure
    );
  }
  const onShow = (event) => {
    event.preventDefault();
    makeQRCode();
  };
  butScan.addEventListener("click", () => {
    startScan(ovrQRCam);
  });
  butShow.addEventListener("click", onShow);
  butConfig.addEventListener("click", () => {
    startScan(ovrQRConfig);
  });
  elOvrDiv.addEventListener("click", function () {
    if (ovrMode === ovrQRCam) {
      stopScan();
    } else if (ovrMode === ovrQRShow) {
      makeQRCode();
    } else if (ovrMode === ovrQRConfig) {
      stopScan();
    } else {
      console.debug(ovrMode);
    }
  });
};

window.addEventListener("load", onLoad);
window.addEventListener("hashchange", onHashChange);
