const onLoad = () => {
  const elQrApp = document.getElementById("qrApp");
  const elQrConfig = document.getElementById("qrConfig");
  const appUrl = "https://www.cvut.cz";
  elQrApp.innerHTML =
    makeQRSVG(appUrl) + `<br/><a href="${appUrl}">${appUrl}</a>`;
  const strConfigData = JSON.stringify(window.configData);
  elQrConfig.innerHTML = makeQRSVG(strConfigData) + `<br/>${strConfigData}`;
};

addEventListener("load", onLoad);
// addEventListener("hashchange", onHashChange);
