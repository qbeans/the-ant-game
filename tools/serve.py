"""Local dev server that tells the browser never to cache, so edited modules always reload.

Usage: python3 tools/serve.py [port]   (default 8080, serves the project folder)
"""
import functools
import http.server
import pathlib
import sys


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    root = pathlib.Path(__file__).resolve().parent.parent
    handler = functools.partial(NoCacheHandler, directory=str(root))
    print(f'Serving {root} at http://localhost:{port}')
    http.server.ThreadingHTTPServer(('', port), handler).serve_forever()
