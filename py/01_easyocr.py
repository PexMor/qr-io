import easyocr
import os
import os.path
import PIL
import json
import cv2

BD = os.path.join(os.getenv("HOME"), "tmp", "qr-io")


if __name__ == "__main__":
    # this needs to run only once to load the model into memory
    reader = easyocr.Reader(["en"])
    imgFn = os.path.join(BD, "test.jpg")
    imgFnOut = os.path.join(BD, "test_out.jpg")
    result = reader.readtext(imgFn)
    print(result)
    img = cv2.imread(imgFn)
    font = cv2.FONT_HERSHEY_SIMPLEX
    spacer = 100
    for detection in result:
        top_left = tuple(detection[0][0])
        bottom_right = tuple(detection[0][2])
        text = detection[1]
        print(top_left, bottom_right)
        img = cv2.rectangle(img, top_left, bottom_right, (0, 255, 0), 1)
        img = cv2.putText(img, text, top_left, font, 0.5, (0, 0, 127), 1, cv2.LINE_AA)
        # img = cv2.putText(
        #     img, text, (20, spacer), font, 0.5, (0, 255, 0), 2, cv2.LINE_AA
        # )
        spacer += 15
    cv2.imwrite(imgFnOut, img)
