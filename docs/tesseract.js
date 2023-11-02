const recognize = async ({ target: { files } }) => {
  const tt = document.getElementById("textOutput");
  tt.innerHTML = "...please wait for OCR...";
  document.getElementById("imgInput").src = URL.createObjectURL(files[0]);
  const worker = await Tesseract.createWorker("eng", 1);
  const ret = await worker.recognize(
    files[0],
    { rotateAuto: true }
    // { imageColor: true, imageGrey: true, imageBinary: true }
  );
  tt.innerText = ret.data.text;
};
const elm = document.getElementById("uploader");
elm.addEventListener("change", recognize);
