#!/usr/bin/env -S python

import json

import qrcode
from PIL import Image, ImageDraw
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.moduledrawers import CircleModuleDrawer, SquareModuleDrawer

qr = qrcode.QRCode(
    version=1,
    error_correction=qrcode.constants.ERROR_CORRECT_L,
    box_size=8,
    border=7,
    mask_pattern=4,
)
jdata: str = json.dumps({"hello": "world"})
jdata = "QR"
qr.add_data(jdata)
qr.make(fit=True)

img = qr.make_image(
    fill_color="white",
    back_color=None,
    image_factory=StyledPilImage,
    module_drawer=SquareModuleDrawer(resample_method=None),
    eye_drawer=SquareModuleDrawer(),
)

img.save("icon.png")
