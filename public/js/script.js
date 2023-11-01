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
      const data = JSON.parse(eventData);
      if (elDialog) {
        elDialog.innerText = JSON.stringify(data.data);
      } else {
        console.debug(data);
      }
    } catch (err) {
      logger.error(err, event.data);
    }
  };
};

const onLoad = () => {
  console.log(window.configData);
  sendUrl = window.configData.url;
  openWs();
  const elQrApp = document.getElementById("qrApp");
  const elQrConfig = document.getElementById("qrConfig");
  elDialog = document.getElementById("dialog");
  const appUrl = "https://www.cvut.cz";
  elQrApp.innerHTML =
    makeQRSVG(appUrl) + `<br/><a href="${appUrl}">${appUrl}</a>`;
  const strConfigData = JSON.stringify(window.configData);
  elQrConfig.innerHTML = makeQRSVG(strConfigData) + `<br/>${strConfigData}`;
};

addEventListener("load", onLoad);
// addEventListener("hashchange", onHashChange);
