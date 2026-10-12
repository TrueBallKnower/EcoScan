"""Prepare a static Cloudflare Pages publication without changing the GitHub site.

Install requirements-deploy.txt, then run this script. Cloudflare supplies
CF_PAGES_URL; SITE_URL can override the production URL explicitly.
Local example: python3 tools/build_cloudflare.py --site-url https://ecosac.pages.dev
"""
import argparse
import os
from pathlib import Path, PurePosixPath
import shutil
import tempfile
from urllib.parse import urlsplit, urlunsplit
import zipfile

ROOT = Path(__file__).resolve().parents[1]
GITHUB_URL = 'https://trueballknower.github.io/EcoScan/'
MARKER = '.ecoscan-generated'
WEB_FILES = ('index.html', 'styles.css', 'product.css', 'script.js', 'product.js',
             'experience-navigation.css', 'experience-navigation.js',
             'experience-shop.css', 'experience-shop.js', 'README.md')


def production_url(explicit=None):
    candidate = explicit or os.environ.get('SITE_URL')
    if not candidate:
        deployment = urlsplit(os.environ.get('CF_PAGES_URL', ''))
        if deployment.scheme == 'https' and deployment.hostname and deployment.hostname.endswith('.pages.dev'):
            candidate = 'https://' + '.'.join(deployment.hostname.split('.')[-3:])
    if not candidate:
        raise ValueError('Adresse manquante : utiliser SITE_URL ou --site-url. Cloudflare peut fournir CF_PAGES_URL automatiquement.')
    parsed = urlsplit(candidate)
    if parsed.scheme != 'https' or not parsed.hostname or parsed.username or parsed.password or parsed.query or parsed.fragment:
        raise ValueError('SITE_URL doit être une adresse HTTPS sans identifiants, paramètres ni fragment.')
    return urlunsplit((parsed.scheme, parsed.netloc, parsed.path.rstrip('/') + '/', '', ''))


def build(base_url, destination):
    destination = destination.resolve()
    if destination == ROOT or destination in ROOT.parents or (ROOT in destination.parents and destination != ROOT / 'public'):
        raise ValueError('Utiliser public/ ou un dossier de sortie extérieur au dépôt.')
    if destination.exists() and any(destination.iterdir()) and not (destination / MARKER).is_file():
        raise ValueError('Le dossier de sortie contient des fichiers non générés par EcoScan.')
    destination.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='.ecoscan-pages-', dir=destination.parent) as temporary:
        stage = Path(temporary) / 'public'
        stage.mkdir()
        for name in WEB_FILES:
            shutil.copy2(ROOT / name, stage / name)
        for name in ('assets', 'docs'):
            shutil.copytree(ROOT / name, stage / name)
        for path in stage.rglob('*'):
            if path.is_file() and path.suffix in ('.html', '.md'):
                text = path.read_text(encoding='utf-8')
                path.write_text(text.replace(GITHUB_URL, base_url), encoding='utf-8')
        from generate_qr import generate
        generate(base_url + '?station=ECO-001#demo', stage / 'assets/ecoscan-station-qr.svg')
        # Rebuild the downloadable dossier with this host's documents and QR.
        archive = 'assets/EcoScan-dossier-concept.zip'
        with zipfile.ZipFile(ROOT / archive) as original:
            entries = original.namelist()
        with zipfile.ZipFile(stage / archive, 'w', zipfile.ZIP_DEFLATED) as output:
            for entry in entries:
                relative = Path(*PurePosixPath(entry).parts[1:])
                candidate = (stage / relative).resolve()
                if not candidate.is_relative_to(stage.resolve()) or not candidate.is_file():
                    raise ValueError('Document inattendu dans le dossier de présentation.')
                output.write(candidate, entry)
        for path in stage.rglob('*'):
            if path.is_file() and path.stat().st_size > 25 * 1024 * 1024:
                raise ValueError('Fichier supérieur à la limite Pages de 25 Mio : ' + str(path.relative_to(stage)))
        (stage / MARKER).write_text('Static EcoScan Cloudflare Pages output\n', encoding='utf-8')
        if destination.exists():
            shutil.rmtree(destination)
        shutil.move(str(stage), destination)
    print('Site statique préparé : ' + str(destination))
    print('Adresse de production configurée : ' + base_url)
    print('HTML, métadonnées, QR et dossier adaptés ; aucun compte créé ni site externe déployé par cette commande.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--site-url')
    parser.add_argument('--output', type=Path, default=ROOT / 'public')
    args = parser.parse_args()
    try:
        build(production_url(args.site_url), args.output)
    except (ValueError, ImportError) as error:
        parser.exit(1, str(error) + '\nInstaller les outils avec : python3 -m pip install -r requirements-deploy.txt\n')
