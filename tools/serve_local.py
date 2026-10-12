"""Local static server with single byte-range support for native MP4 chapter tests.
Standard library only; never used by GitHub Pages production.
"""
import argparse
import functools
import http.server
import os
import re

class RangeHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Accept-Ranges', 'bytes')
        super().end_headers()

    def send_head(self):
        self._remaining = None
        header = self.headers.get('Range')
        path = self.translate_path(self.path)
        if not header or not os.path.isfile(path):
            return super().send_head()
        match = re.fullmatch(r'bytes=(\d*)-(\d*)', header.strip())
        size = os.path.getsize(path)
        if not match or not any(match.groups()) or not size:
            self.send_error(416, 'Unsupported byte range')
            return None
        first, last = match.groups()
        if first:
            start = int(first)
            end = min(int(last), size - 1) if last else size - 1
        else:
            start, end = max(0, size - int(last)), size - 1
        if start >= size or end < start:
            self.send_response(416)
            self.send_header('Content-Range', f'bytes */{size}')
            self.send_header('Content-Length', '0')
            self.end_headers()
            return None
        source = open(path, 'rb')
        source.seek(start)
        self._remaining = end - start + 1
        self.send_response(206)
        self.send_header('Content-Type', self.guess_type(path))
        self.send_header('Content-Range', f'bytes {start}-{end}/{size}')
        self.send_header('Content-Length', str(self._remaining))
        self.end_headers()
        return source

    def copyfile(self, source, output):
        if self._remaining is None:
            return super().copyfile(source, output)
        remaining = self._remaining
        while remaining:
            chunk = source.read(min(65536, remaining))
            if not chunk:
                break
            try:
                output.write(chunk)
            except (BrokenPipeError, ConnectionResetError):
                break
            remaining -= len(chunk)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--directory', default='.')
    parser.add_argument('--port', type=int, default=8000)
    args = parser.parse_args()
    handler = functools.partial(RangeHandler, directory=args.directory)
    http.server.ThreadingHTTPServer(('127.0.0.1', args.port), handler).serve_forever()
