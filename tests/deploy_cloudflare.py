"""Offline publication checks; requires requirements-deploy.txt, not a Cloudflare account."""
import hashlib
import importlib.util
import os
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch
import xml.etree.ElementTree as ET
import zipfile

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tools'))
spec = importlib.util.spec_from_file_location('cloudflare_build', ROOT / 'tools/build_cloudflare.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class PublicationTests(unittest.TestCase):
    def test_production_host_from_preview_and_override(self):
        with patch.dict(os.environ, {'CF_PAGES_URL': 'https://abc123.ecosac.pages.dev'}, clear=True):
            self.assertEqual(module.production_url(), 'https://ecosac.pages.dev/')
        with patch.dict(os.environ, {'SITE_URL': 'https://ecosac-lab.pages.dev', 'CF_PAGES_URL': 'https://abc123.ecosac.pages.dev'}, clear=True):
            self.assertEqual(module.production_url(), 'https://ecosac-lab.pages.dev/')
        with patch.dict(os.environ, {}, clear=True):
            with self.assertRaises(ValueError):
                module.production_url()
        with self.assertRaises(ValueError):
            module.production_url('http://ecosac.pages.dev')

    def test_build_rewrites_host_qr_dossier_and_preserves_sources(self):
        originals = {name: hashlib.sha256((ROOT / name).read_bytes()).digest() for name in ('index.html', 'assets/ecoscan-station-qr.svg', 'assets/EcoScan-dossier-concept.zip')}
        with tempfile.TemporaryDirectory() as temporary:
            output = Path(temporary) / 'public'
            base = 'https://ecosac-lab.pages.dev/'
            module.build(base, output)
            html = (output / 'index.html').read_text()
            self.assertIn('rel="canonical" href="' + base + '"', html)
            self.assertIn(base + 'assets/econova-compact-studio.png', html)
            self.assertNotIn(module.GITHUB_URL, html)
            qr = ET.parse(output / 'assets/ecoscan-station-qr.svg')
            self.assertEqual(qr.find('.//{http://www.w3.org/2000/svg}desc').text, base + '?station=ECO-001#demo')
            self.assertNotEqual((output / 'assets/ecoscan-station-qr.svg').read_bytes(), (ROOT / 'assets/ecoscan-station-qr.svg').read_bytes())
            for film in ('econova-film-v2.mp4', 'econova-film-v2-en.mp4'):
                self.assertEqual(hashlib.sha256((output / 'assets' / film).read_bytes()).digest(), hashlib.sha256((ROOT / 'assets' / film).read_bytes()).digest())
            with zipfile.ZipFile(output / 'assets/EcoScan-dossier-concept.zip') as dossier:
                self.assertIsNone(dossier.testzip())
                self.assertIn(base.encode(), dossier.read('EcoScan-dossier/docs/PRESENTATION.md'))
                self.assertEqual(dossier.read('EcoScan-dossier/assets/ecoscan-station-qr.svg'), (output / 'assets/ecoscan-station-qr.svg').read_bytes())
            self.assertFalse((output / '.git').exists())
            self.assertFalse((output / 'tools').exists())
            self.assertFalse((output / 'tests').exists())
            module.build(base, output)  # A second publication must be repeatable.
        for name, expected in originals.items():
            self.assertEqual(hashlib.sha256((ROOT / name).read_bytes()).digest(), expected)

    def test_existing_user_files_are_not_deleted(self):
        with tempfile.TemporaryDirectory() as temporary:
            output = Path(temporary)
            important = output / 'my-file.txt'
            important.write_text('preserve')
            with self.assertRaises(ValueError):
                module.build('https://ecosac.pages.dev/', output)
            self.assertEqual(important.read_text(), 'preserve')
        with self.assertRaises(ValueError):
            module.build('https://ecosac.pages.dev/', ROOT)


if __name__ == '__main__':
    unittest.main()
