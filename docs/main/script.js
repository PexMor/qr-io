﻿let schema = window.location.protocol.startsWith("https:") ? "https" : "http";
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
let elStatus;
let elDialog;

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
      const data0 = JSON.parse(eventData);
      const data = JSON.parse(data0);
      // console.log(eventData);
      console.debug(data);
      if (elDialog && data.data) {
        elDialog.innerText = data.data;
      } else {
        console.log(data);
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

let config = localStorage.getItem("qr-config");
if (config) {
  let adata = JSON.parse(config);
  console.debug(adata);
  saveConfig(adata);
}

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
  const elOvrDiv2 = document.getElementById("overlay2");
  // ---
  const html5QrcodeScanner = new Html5Qrcode("QRCamDiv"); //, configQr);
  const elQRCamDiv = document.getElementById("QRCamDiv");
  const elQRImgDiv = document.getElementById("QRImgDiv");
  const elQRImg = document.getElementById("QRImg");
  const elQRValDiv = document.getElementById("QRValDiv");
  const butClear = document.getElementById("butClear");
  const butSave = document.getElementById("butSave");
  // ---
  const elNotif = document.getElementById("notif");
  const elImgFile = document.getElementById("imgfile");
  elDialog = document.getElementById("dialog");
  elStatus = document.getElementById("status");
  elTa = document.getElementById("toshare");
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
      if (elTa.value !== "") {
        defQRVal = elTa.value;
      }
      // convert the string into UTF-8 bytes
      const theVal = new TextEncoder().encode(defQRVal);
      const svg = makeQRSVG(theVal);
      // console.debug(defQRVal, svg);
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
        elTa.value = decodedResult.decodedText;
        if (ovrMode === ovrQRConfig) {
          const adata = JSON.parse(decodedResult.decodedText);
          console.debug(adata);
          // save configuration data to local storage
          // {"mode":"auto-send","url":"https://<random-url>.ngrok.io"}
          // {"mode":"auto-send","url":"wss://<random-url>.ngrok.io"}
          localStorage.setItem("qr-config", JSON.stringify(adata));
          saveConfig(adata);
        } else {
          if (scannerMode === smAutoSend) {
            let dataOut = { id: ls_uuid, data: decodedResult.decodedText };
            console.debug(scannerMode, dataOut);
            if (sendUrl.startsWith("wss://")) {
              console.debug("using WS", dataOut);
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
  function saveConfig(adata) {
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
      console.error("no mode - config cleanup");
      localStorage.removeItem("qr-config");
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
    elOvrDiv2.style.display = "none";
    ovrMode = ovrHidden;
  }
  function onScanFailure(error) {
    // the scanner is failing periodically
    // console.warn(`Code scan error = ${error}`);
  }
  function startScan(qrScanMode) {
    elOvrDiv2.style.display = "block";
    elQRCamDiv.style.display = "block";
    ovrMode = qrScanMode;
    // html5QrcodeScanner.render(onScanSuccess, onScanFailure);
    html5QrcodeScanner.start(
      { facingMode: "environment" },
      configQr,
      onScanSuccess,
      onScanFailure
    );
  }
  function shareFce() {
    const handleFileLoad = (event) => {
      // https://stackoverflow.com/questions/16505333/get-the-data-of-uploaded-file-in-javascript
      let dataOut = {
        id: ls_uuid,
        data: "image",
        bin: event.target.result,
      };
      console.debug(scannerMode, dataOut);
      if (sendUrl.startsWith("wss://")) {
        console.debug("using WS", dataOut);
        wsWeakSend(dataOut);
      } else if (sendUrl.startsWith("https://")) {
        const formData = new FormData();
        formData.append("image", elImgFile.files[0]);
        console.debug("using json HTTPS post");
        (async () => {
          const rawResponse = await fetch(sendUrl, {
            method: "POST",
            // headers: {
            //   Accept: "application/json",
            //   "Content-Type": "application/json",
            // },
            // body: JSON.stringify(dataOut),
            body: formData,
          });
          const content = await rawResponse.json();
          console.log(content);
        })();
      }
    };
    const reader = new FileReader();
    reader.onload = handleFileLoad;
    reader.readAsDataURL(elImgFile.files[0]);
    // reader.readAsArrayBuffer(elImgFile.files[0]);
  }
  const delItem = (id) => {
    // get current content of data array in local storage
    let dataArr = JSON.parse(window.localStorage.getItem("data")) || [];
    // remove the item from the array
    dataArr.splice(id, 1);
    // save the new data array to local storage
    window.localStorage.setItem("data", JSON.stringify(dataArr));
    showData();
  };
  window.delItem = delItem;
  const showData = () => {
    // get current content of data array in local storage
    let dataArr = JSON.parse(window.localStorage.getItem("data")) || [];
    // convert the array to html buttons
    let html = "";
    for (let i = 0; i < dataArr.length; i++) {
      html += `<div class="but-row"><button onclick="return delItem(${i})">&times;</button><button onclick="elTa.value='${dataArr[i]}'" class="pure-button div-ellipsis">${dataArr[i]}</button></div>`;
    }
    const elSDiv = document.getElementById("saved-data");
    if (elSDiv) {
      elSDiv.innerHTML = html;
    }
  };
  showData();
  const saveData = () => {
    // get the data from the textarea
    const data = elTa.value;
    // get current content of data array in local storage
    let dataArr = JSON.parse(window.localStorage.getItem("data")) || [];
    // add the new data to the array
    dataArr.push(data);
    // save the new data array to local storage
    window.localStorage.setItem("data", JSON.stringify(dataArr));
    showData();
  };

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
  elOvrDiv2.addEventListener("click", function () {
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
  elImgFile.addEventListener("change", (event) => {
    event.preventDefault();
    const output = document.getElementById("imgPreview");
    output.src = URL.createObjectURL(event.target.files[0]);
    output.onload = function () {
      URL.revokeObjectURL(output.src); // free memory
    };
  });
  butClear.addEventListener("click", (event) => {
    event.preventDefault();
    const output = document.getElementById("imgPreview");
    output.src = "";
    elImgFile.value = "";
    elTa.value = "";
  });
  butSave.addEventListener("click", (event) => {
    event.preventDefault();
    saveData();
  });
  butShare.addEventListener("click", (event) => {
    event.preventDefault();
    if (scannerMode === smAutoSend) {
      shareFce();
    } else {
      shareFce();
    }
  });
};

window.addEventListener("load", onLoad);
window.addEventListener("hashchange", onHashChange);
