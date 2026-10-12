"""Optional offline asset generator: pip install qrcode==8.2 in a tooling environment.
The static website never imports this package or makes a QR service request.
"""
from pathlib import Path
import argparse
from html import escape
import qrcode
import qrcode.image.svg
URL = 'https://trueballknower.github.io/EcoScan/?station=ECO-001#demo'
def generate(url, destination):
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_Q, box_size=10, border=4)
    qr.add_data(url)
    qr.make(fit=True)
    image = qr.make_image(image_factory=qrcode.image.svg.SvgPathImage)
    image.save(destination)
    path = Path(destination)
    svg = path.read_text(encoding='utf-8')
    start = svg.index('<svg')
    end = svg.index('>', start) + 1
    svg = svg[:end] + '<title>EcoScan — station ECO-001</title><desc>' + escape(url) + '</desc>' + svg[end:]
    path.write_text(svg, encoding='utf-8')

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--url', default=URL)
    parser.add_argument('--output', type=Path, default=Path(__file__).resolve().parents[1] / 'assets' / 'ecoscan-station-qr.svg')
    args = parser.parse_args()
    generate(args.url, args.output)
