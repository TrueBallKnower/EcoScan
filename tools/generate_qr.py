"""Optional offline asset generator: pip install qrcode==8.2 in a tooling environment.
The static website never imports this package or makes a QR service request.
"""
from pathlib import Path
import qrcode
import qrcode.image.svg
URL = 'https://trueballknower.github.io/EcoScan/?station=ECO-001#demo'
qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_Q, box_size=10, border=4)
qr.add_data(URL)
qr.make(fit=True)
image = qr.make_image(image_factory=qrcode.image.svg.SvgPathImage)
image.save(Path(__file__).resolve().parents[1] / 'assets' / 'ecoscan-station-qr.svg')
