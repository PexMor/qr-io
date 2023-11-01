import qrcode
import json
from PIL import Image, ImageDraw

from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.moduledrawers import CircleModuleDrawer, SquareModuleDrawer

qr = qrcode.QRCode(
    version=10,
    error_correction=qrcode.constants.ERROR_CORRECT_H,
    box_size=8,
    border=4,
    mask_pattern=4,
)
jdata = json.dumps({"hello": "world"})
qr.add_data(jdata)
qr.make(fit=True)

img = qr.make_image(
    fill_color="white",
    back_color=None,
    image_factory=StyledPilImage,
    module_drawer=CircleModuleDrawer(resample_method=None),
    eye_drawer=SquareModuleDrawer(),
)

img.save("icon.png")
