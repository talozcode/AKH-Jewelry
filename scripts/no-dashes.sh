#!/usr/bin/env bash
# House rule No.1: no em dashes, en dashes, or their Unicode lookalikes
# anywhere - code comments, copy, DB content, or commit messages. Uses
# python3 rather than `grep -P` (matches studio-tooka's convention) because
# BSD grep on macOS has no PCRE support, so `-P` only worked here inside
# the harness's own interactive-shell grep wrapper, not via a plain
# `npm run`.
#
# Widened beyond the two literal characters after an adversarial edge-case
# review found the original check (em/en dash only) trivially defeatable:
# a horizontal bar, minus sign, or fullwidth hyphen-minus reads as a dash
# to a human but wasn't caught. The additions below are look-alikes an
# editor's autocorrect or an LLM's own output can introduce without anyone
# intending a "real" em/en dash; ordinary ASCII hyphen-minus (U+002D) is
# never flagged.
set -u

python3 - "$@" <<'PY'
import sys, pathlib

roots = ["src", "scripts", "supabase"]
extra_files = ["CLAUDE.md"]
# \u escapes, not literal characters, so this file's own bytes never
# trip its own check when it scans the scripts/ directory.
bad = [
    chr(0x2014),  # em dash
    chr(0x2013),  # en dash
    chr(0x2010),  # hyphen (distinct codepoint from ASCII hyphen-minus)
    chr(0x2011),  # non-breaking hyphen
    chr(0x2012),  # figure dash
    chr(0x2015),  # horizontal bar
    chr(0x2212),  # minus sign
    chr(0x2E3A),  # two-em dash
    chr(0x2E3B),  # three-em dash
    chr(0xFE58),  # small em dash
    chr(0xFF0D),  # fullwidth hyphen-minus
]
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
  echo "DASH OR DASH-LOOKALIKE CHARACTERS FOUND (see above)"
  exit 1
fi
echo "no dashes or dash-lookalikes"
