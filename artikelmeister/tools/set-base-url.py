#!/usr/bin/env python3
"""Change the site's base URL everywhere (static site, no build step).

Usage: python3 artikelmeister/tools/set-base-url.py https://new.example.com/ [--dry-run]
"""
import argparse
import json
import re
import sys
from pathlib import Path
from urllib.parse import urlparse

SITE = Path(__file__).resolve().parent.parent
CONFIG = SITE / "site.config.json"
EXTENSIONS = {".html", ".xml", ".txt", ".json", ".webmanifest"}


def normalize(url):
    url = url.strip()
    parts = urlparse(url)
    if parts.scheme not in ("http", "https") or not parts.netloc:
        sys.exit("error: base URL must look like https://host/path/ (got %r)" % url)
    return url.rstrip("/") + "/"


def url_path(base):
    return urlparse(base).path or "/"


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("new_base")
    ap.add_argument("--dry-run", action="store_true", help="show what would change, write nothing")
    args = ap.parse_args()

    old = normalize(json.loads(CONFIG.read_text(encoding="utf-8"))["baseUrl"])
    new = normalize(args.new_base)
    if old == new:
        print("Base URL is already %s, nothing to do." % new)
        return

    old_path, new_path = url_path(old), url_path(new)
    # root-absolute attribute values such as href="/artikelmeister/x" (used by 404.html)
    lookahead = "(?!/)" if old_path == "/" else ""
    attr_re = re.compile(r'((?:href|src|content)=["\'])' + re.escape(old_path) + lookahead)

    total = 0
    for path in sorted(SITE.rglob("*")):
        rel = path.relative_to(SITE)
        if not path.is_file() or path.suffix not in EXTENSIONS:
            continue
        if rel.parts[0] == "tools" or rel.name == "site.config.json":
            continue
        text = path.read_text(encoding="utf-8")
        count = text.count(old)
        updated = text.replace(old, new)
        if rel.name == "404.html":
            updated, n = attr_re.subn(lambda m: m.group(1) + new_path, updated)
            count += n
        if count:
            total += count
            print("%-28s %d replacement(s)" % (rel, count))
            if not args.dry_run:
                path.write_text(updated, encoding="utf-8")

    if not args.dry_run:
        CONFIG.write_text(json.dumps({"baseUrl": new}, indent=2) + "\n", encoding="utf-8")
    print("%s -> %s" % (old, new))
    print("%s: %d replacement(s) in total%s" % ("Dry run" if args.dry_run else "Done", total,
          "" if args.dry_run else ", site.config.json updated"))


if __name__ == "__main__":
    main()
