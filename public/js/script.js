let sendUrl;
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
      console.log(eventData);
      const data0 = JSON.parse(eventData);
      console.log(data0);
      const data = JSON.parse(data0);
      console.log(data);
      if (elDialog && data.data) {
        elDialog.innerText = data.data;
      } else {
        console.debug(data);
      }
    } catch (err) {
      logger.error(err, event.data);
    }
  };
};

const onLoad = () => {
  console.log(window.configDataWS);
  sendUrl = window.configDataWS.url;
  openWs();
  const elQrApp = document.getElementById("qrApp");
  const elQrConfigWS = document.getElementById("qrConfigWS");
  const elQrConfigPost = document.getElementById("qrConfigPost");
  const b2d = {
    butShowPwaQR: "qrApp",
    butShowWSQR: "qrConfigWS",
    butShowPostQR: "qrConfigPost",
  };
  for (let bn of Object.keys(b2d)) {
    const el = document.getElementById(bn);
    const cEl = document.getElementById(b2d[bn]);
    el.addEventListener("click", (event) => {
      event.preventDefault();
      if (cEl.style.display === "none") {
        cEl.style.display = "block";
      } else {
        cEl.style.display = "none";
      }
    });
  }
  elDialog = document.getElementById("dialog");

  const appUrl = "https://pexmor.github.io/qr-io/";
  elQrApp.innerHTML =
    makeQRSVG(appUrl) + `<br/><a href="${appUrl}">${appUrl}</a>`;
  // ---
  const strConfigDataWs = JSON.stringify(window.configDataWS);
  elQrConfigWS.innerHTML =
    makeQRSVG(strConfigDataWs) + `<br/>${strConfigDataWs}`;
  // ---
  const strConfigDataPost = JSON.stringify(window.configDataPost);
  elQrConfigPost.innerHTML =
    makeQRSVG(strConfigDataPost) + `<br/>${strConfigDataPost}`;
};

addEventListener("load", onLoad);
// addEventListener("hashchange", onHashChange);
