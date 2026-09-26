#!/bin/zsh
# Marketing imagery for meetosmos.com, generated with Higgsfield (GPT Image 2.5).
# Re-runnable: skips names that already have a PNG. Masters land in design/generated/ (gitignored);
# scripts/optimise-images.mjs turns them into the AVIF/WebP files under public/.
# Usage: design/tools/higgsfield-generate.sh [name ...]   (no names = everything)
set -u
export PATH="/opt/homebrew/bin:$PATH"
cd "$(dirname "$0")/../.."
OUT=design/generated; mkdir -p "$OUT"
REF_MARK=design/ref/osmos-mark.png          # the brand mark, for the glass mark render
REF_STYLE="${REF_STYLE_ID:-$OUT/icon-shield.png}"   # first icon = material reference (an upload id also works)

# One material for every object, so the set reads as a family.
MAT="premium 3D product render, frosted translucent violet glass (#7C5CFF) with a luminous lavender inner glow, a thin bright white-lavender rim light along every edge, glossy obsidian-black accents, soft rounded bevels, subtle refraction and studio reflections, ultra detailed, three-quarter view, centred, floating, isolated on a transparent background, no text, no letters, no logos"

typeset -A PROMPTS RATIO KIND
PROMPTS[icon-shield]="A rounded shield with a softly embossed check mark, with a small glossy obsidian-black rounded speech bubble tucked behind it. $MAT"
PROMPTS[icon-envelope]="A closed envelope with a folded letter peeking out of the top. $MAT, same material and lighting as the reference"
PROMPTS[icon-ticket]="A boarding pass ticket, slightly curved, with a perforated tear-off stub. $MAT, same material and lighting as the reference"
PROMPTS[icon-calendar]="A small desk calendar with two rings on top and a single highlighted day tile. $MAT, same material and lighting as the reference"
PROMPTS[icon-card]="A payment card standing at an angle with a small chip, in front of a second obsidian-black card. $MAT, same material and lighting as the reference"
PROMPTS[icon-notebook]="A small hardback notebook closed with an elastic band and a ribbon bookmark. $MAT, same material and lighting as the reference"
PROMPTS[icon-bolt]="A chunky rounded lightning bolt. $MAT, same material and lighting as the reference"
for n in icon-shield icon-envelope icon-ticket icon-calendar icon-card icon-notebook icon-bolt; do RATIO[$n]="1:1"; KIND[$n]=icon; done

PROMPTS[mark-glass]="The exact shape of the reference logo (a soft rounded four-lobed ring with a round hole in the middle) as a thick 3D object, straight-on front view, facing the camera. $MAT"
RATIO[mark-glass]="1:1"; KIND[mark-glass]=mark

# Backgrounds (opaque).
PROMPTS[horizon]="Cinematic photograph from orbit: the curved horizon of a dark planet at the very bottom of the frame, a thin intensely glowing violet and lavender atmosphere rim arcing across the frame, soft bloom rising above the rim into deep black space, a few faint stars, minimal, vast negative space, no sun disc, no text"
PROMPTS[stage]="Minimal dark product-photography studio: a single white matte cylindrical plinth in the centre, low and wide, standing on a dark floor, one dramatic diagonal beam of soft violet-lavender light falling from the top left onto the plinth, faint haze and a few floating dust particles in the beam, deep charcoal-violet background, empty stage with nothing on the plinth, lots of negative space, cinematic, no text"
RATIO[horizon]="16:9"; KIND[horizon]=bg
RATIO[stage]="16:9"; KIND[stage]=bg

names=("$@"); [ ${#names} -eq 0 ] && names=(${(k)PROMPTS})
run_one() {
  local n=$1; local json="$OUT/$n.json"; local png="$OUT/$n.png"
  [ -s "$png" ] && { echo "skip $n (exists)"; return; }
  local -a args
  args=(generate create gpt_image_2_5 --prompt "${PROMPTS[$n]}" --aspect_ratio "${RATIO[$n]}" --resolution 2k --quality high --wait --wait-timeout 20m --json)
  case "${KIND[$n]}" in
    icon) args+=(--background transparent); [ "$n" != icon-shield ] && { [ -n "${REF_STYLE_ID:-}" ] || [ -s "$REF_STYLE" ]; } && args+=(--image "$REF_STYLE") ;;
    mark) args+=(--background transparent --image "$REF_MARK"); { [ -n "${REF_STYLE_ID:-}" ] || [ -s "$REF_STYLE" ]; } && args+=(--image "$REF_STYLE") ;;
    bg)   args+=(--background opaque) ;;
  esac
  echo "start $n"
  higgsfield "${args[@]}" > "$json" 2> "$OUT/$n.err"
  local url
  url=$(python3 - "$json" <<'PY'
import json,sys
try:
    d=json.load(open(sys.argv[1]))
except Exception:
    print(""); sys.exit()
j=d[0] if isinstance(d,list) else d
print(j.get("result_url") or "")
PY
)
  if [ -n "$url" ]; then curl -sL "$url" -o "$png" && echo "done $n -> $png ($(stat -f %z "$png") bytes)"; else echo "FAILED $n (see $json / $OUT/$n.err)"; fi
}
for n in $names; do run_one "$n" & ; while [ $(jobs -r | wc -l) -ge 2 ]; do sleep 2; done; done
wait
echo "all done"
