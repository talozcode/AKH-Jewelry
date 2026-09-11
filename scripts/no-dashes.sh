#!/usr/bin/env bash
# House rule No.1: no em dashes (U+2014) or en dashes (U+2013) anywhere -
# code comments, copy, DB content, or commit messages. Uses python3 rather
# than `grep -P` (matches studio-tooka's convention) because BSD grep on
# macOS has no PCRE support, so `-P` only worked here inside the harness's
# own interactive-shell grep wrapper, not via a plain `npm run`.
set -u

python3 - "$@" <<'PY'
import sys, pathlib

roots = ["src", "scripts", "supabase"]
extra_files = ["CLAUDE.md"]
# \u escapes, not literal characters, so this file's own bytes never
# trip its own check when it scans the scripts/ directory.
bad = [chr(0x2014), chr(0x2013)]
found = False

paths = []
for root in roots:
    p = pathlib.Path(root)
    if p.is_dir():
        paths.extend(p.rglob("*"))
paths.extend(pathlib.Path(f) for f in extra_files if pathlib.Path(f).is_file())

for path in paths:
    if not path.is_file():
        continue
    try:
        text = path.read_text(encoding="utf-8")
    except (UnicodeDecodeError, OSError):
        continue
    for lineno, line in enumerate(text.splitlines(), start=1):
        if any(ch in line for ch in bad):
            print(f"{path}:{lineno}: {line.strip()}")
            found = True

sys.exit(1 if found else 0)
PY
STATUS=$?
if [ $STATUS -ne 0 ]; then
  echo "EM/EN DASHES FOUND (see above)"
  exit 1
fi
echo "no em/en dashes"
