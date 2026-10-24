"""Draws the fairytale palace on the inside page.

Writes the SVG straight into site/neverland.html, between the
<!-- palace:start --> and <!-- palace:end --> markers, so it shows at once
and the page CSS can animate its windows, pennants and doors. The three
doors must stay where the .door-link overlays expect them: Registry at
x=120, Invitation at x=300, RSVP at x=480, all standing on y=480.

Run from the repo root:  python3 tools/make_palace.py
"""
import math

BOTTOM = 480
out = []


def add(s):
    out.append(s)


def g(n):
    return f"{n:.1f}".rstrip("0").rstrip(".")


def arch(cx, top, w, h):
    r = w / 2
    return f"M{g(cx - r)} {g(top + h)}V{g(top + r)}A{g(r)} {g(r)} 0 0 1 {g(cx + r)} {g(top + r)}V{g(top + h)}Z"


def flared_roof(x0, x1, base, apex):
    """A spire whose sides curve inward and flare out at the eaves."""
    cx = (x0 + x1) / 2
    half = (x1 - x0) / 2
    cy = base - (base - apex) * 0.38
    return (f"M{g(x0)} {g(base)}Q{g(cx - half * 0.22)} {g(cy)} {g(cx)} {g(apex)}"
            f"Q{g(cx + half * 0.22)} {g(cy)} {g(x1)} {g(base)}Z")


def roof(x0, x1, base, apex, dormers=()):
    cx = (x0 + x1) / 2
    d = flared_roof(x0, x1, base, apex)
    add(f'<path d="{d}" fill="url(#pRoof)"/>')
    add(f'<path d="{d}" fill="url(#pShingles)"/>')
    # Moonlight catching the left edge of the spire
    half = (x1 - x0) / 2
    add(f'<path d="M{g(x0 + 2)} {g(base - 1)}Q{g(cx - half * 0.22)} {g(base - (base - apex) * 0.38)} {g(cx)} {g(apex + 2)}" '
        f'fill="none" stroke="#e8f6ff" stroke-width="1.4" opacity=".55"/>')
    for dx, dy, dw in dormers:
        dormer(cx + dx, dy, dw)
    # Gold eave band and finial
    add(f'<rect x="{g(x0 + 1)}" y="{g(base - 3)}" width="{g(x1 - x0 - 2)}" height="7" rx="2.5" fill="url(#pGold)"/>')
    add(f'<path d="M{g(cx)} {g(apex + 4)}V{g(apex - 12)}" stroke="#ffe08a" stroke-width="2"/>'
        f'<circle cx="{g(cx)}" cy="{g(apex - 2)}" r="3.2" fill="url(#pGold)"/>')


def dormer(cx, top, w):
    """A little gabled window poking out of a roof."""
    h = w * 1.1
    add(f'<path d="M{g(cx - w / 2)} {g(top + h)}V{g(top + w * 0.35)}L{g(cx)} {g(top - w * 0.25)}L{g(cx + w / 2)} {g(top + w * 0.35)}V{g(top + h)}Z" fill="url(#pStone)"/>')
    add(f'<path d="M{g(cx - w / 2 - 1.5)} {g(top + w * 0.4)}L{g(cx)} {g(top - w * 0.32)}L{g(cx + w / 2 + 1.5)} {g(top + w * 0.4)}" fill="none" stroke="url(#pRoof)" stroke-width="2.5"/>')
    window(cx, top + w * 0.3, w * 0.5, h * 0.6, frame=False)


windows = []


def window(cx, top, w, h, frame=True, mullion=False):
    """Queue a glowing arched window (drawn later so the glows sit under them)."""
    windows.append((cx, top, w, h, frame, mullion))


def tower(x, y, w, bottom=BOTTOM):
    add(f'<rect x="{g(x)}" y="{g(y)}" width="{g(w)}" height="{g(bottom - y)}" fill="url(#pStone)"/>')
    add(f'<rect x="{g(x)}" y="{g(y)}" width="{g(w)}" height="{g(bottom - y)}" fill="url(#pBricks)"/>')
    add(f'<rect x="{g(x)}" y="{g(y)}" width="2" height="{g(bottom - y)}" fill="#ffffff" opacity=".45"/>')


def ledge(x, y, w):
    add(f'<rect x="{g(x - 3)}" y="{g(y)}" width="{g(w + 6)}" height="5" rx="1.5" fill="url(#pLedge)"/>')


def balcony(x, y, w):
    add(f'<rect x="{g(x - 6)}" y="{g(y)}" width="{g(w + 12)}" height="6" rx="2" fill="url(#pLedge)"/>')
    for bx in range(int(x - 2), int(x + w + 4), 7):
        add(f'<rect x="{bx}" y="{g(y - 12)}" width="2.6" height="12" fill="#e7ebfb"/>')
    add(f'<rect x="{g(x - 6)}" y="{g(y - 15)}" width="{g(w + 12)}" height="4" rx="2" fill="url(#pGold)"/>')
    # Shadowed corbels under the slab
    for bx in range(int(x + 4), int(x + w), 14):
        add(f'<path d="M{bx} {g(y + 6)}h6l-3 7Z" fill="#9aa5d6"/>')


def turret(x, y, w, corbel_y, apex):
    """A turret clinging to the keep, resting on a corbelled cone."""
    cx = x + w / 2
    add(f'<rect x="{g(x)}" y="{g(y)}" width="{g(w)}" height="{g(corbel_y - y)}" fill="url(#pStone)"/>')
    add(f'<rect x="{g(x)}" y="{g(y)}" width="{g(w)}" height="{g(corbel_y - y)}" fill="url(#pBricks)"/>')
    add(f'<path d="M{g(x)} {g(corbel_y)}H{g(x + w)}L{g(cx)} {g(corbel_y + 26)}Z" fill="url(#pStone)"/>')
    add(f'<path d="M{g(x)} {g(corbel_y)}H{g(x + w)}" stroke="url(#pGold)" stroke-width="3"/>')
    roof(x - 5, x + w + 5, y + 2, apex)
    window(cx, y + 26, 8, 18)


def banner(cx, top, h):
    w = 16
    add(f'<path class="banner" d="M{g(cx - w / 2)} {g(top)}H{g(cx + w / 2)}V{g(top + h)}L{g(cx)} {g(top + h - 8)}L{g(cx - w / 2)} {g(top + h)}Z" '
        f'fill="url(#pBanner)" stroke="url(#pGold)" stroke-width="1.6"/>')
    add(f'<path d="M{g(cx - w / 2 - 3)} {g(top)}H{g(cx + w / 2 + 3)}" stroke="url(#pGold)" stroke-width="3" stroke-linecap="round"/>')
    sy = top + h * 0.42
    add(f'<path d="M{g(cx)} {g(sy - 6)}l2 4 4 2-4 2-2 4-2-4-4-2 4-2Z" fill="#ffe08a"/>')


def flag(cx, apex, fill, h=20):
    top = apex - 12 - h
    add(f'<path d="M{g(cx)} {g(apex - 12)}V{g(top)}" stroke="#ffe08a" stroke-width="1.6"/>')
    add(f'<path class="pennant" d="M{g(cx)} {g(top)}Q{g(cx + 14)} {g(top + 1)} {g(cx + 28)} {g(top + 5)}Q{g(cx + 14)} {g(top + 8)} {g(cx)} {g(top + 11)}Z" fill="{fill}"/>')


def door(name, cx, r, spring):
    x0, x1, top = cx - r, cx + r, spring - r
    fr = r + 6
    sr = r + 15
    # Stone arch of wedge-shaped blocks around the gold frame
    add(f'<path d="M{g(cx - sr)} {BOTTOM}V{spring}A{sr} {sr} 0 0 1 {g(cx + sr)} {spring}V{BOTTOM}Z" fill="url(#pStone)"/>')
    for i in range(1, 9):
        a = math.pi * i / 9
        add(f'<path d="M{g(cx - math.cos(a) * fr)} {g(spring - math.sin(a) * fr)}L{g(cx - math.cos(a) * sr)} {g(spring - math.sin(a) * sr)}" stroke="#9aa5d6" stroke-width="1.2"/>')
    add(f'<g class="door door-{name}">')
    add(f'<path class="door-frame" d="M{g(cx - fr)} {BOTTOM}V{spring}A{fr} {fr} 0 0 1 {g(cx + fr)} {spring}V{BOTTOM}Z" fill="url(#pGold)"/>')
    add(f'<path class="door-light" d="M{x0} {BOTTOM}V{spring}A{r} {r} 0 0 1 {x1} {spring}V{BOTTOM}Z" fill="url(#pLight)"/>')
    for side, d in (("l", f"M{x0} {BOTTOM}V{spring}A{r} {r} 0 0 1 {cx} {top}V{BOTTOM}Z"),
                    ("r", f"M{cx} {top}A{r} {r} 0 0 1 {x1} {spring}V{BOTTOM}H{cx}Z")):
        sx = -1 if side == "l" else 1
        inner, outer = (x0 + 4, cx - 3) if side == "l" else (cx + 3, x1 - 4)
        add(f'<g class="leaf leaf-{side}">')
        add(f'<path d="{d}" fill="url(#pDoor)" stroke="#e0a83a" stroke-width="1.5"/>')
        for k in range(1, 4):
            px = cx + sx * (r * k / 4)
            add(f'<path d="M{g(px)} {g(spring - math.sqrt(max(r * r - (px - cx) ** 2, 0)) + 3)}V{BOTTOM}" stroke="#152248" stroke-width="1" opacity=".7"/>')
        add(f'<path d="M{inner} {spring + 14}H{outer}M{inner} {BOTTOM - 22}H{outer}" stroke="#e0a83a" stroke-width="2.2"/>')
        add(f'<circle cx="{cx + sx * 7}" cy="{g((spring + BOTTOM) / 2)}" r="2.8" fill="#ffe08a"/>')
        add("</g>")
    add(f'<path d="M{cx} {g(top - fr + r - 16)}l3 7 7 3-7 3-3 7-3-7-7-3 7-3Z" fill="#fff3c4"/>')
    add("</g>")


# ---------- Document ----------

add('<svg class="palace-art" viewBox="0 0 600 600" aria-hidden="true">')
add("""<defs>
  <linearGradient id="pStone" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="#dfe5fb"/>
    <stop offset="40%" stop-color="#fbfaff"/>
    <stop offset="100%" stop-color="#a7b1e0"/>
  </linearGradient>
  <linearGradient id="pWall" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#e9edfd"/>
    <stop offset="100%" stop-color="#b3bce8"/>
  </linearGradient>
  <linearGradient id="pLedge" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffffff"/>
    <stop offset="100%" stop-color="#aab3e0"/>
  </linearGradient>
  <linearGradient id="pRoof" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="#9adcff"/>
    <stop offset="35%" stop-color="#4b9de3"/>
    <stop offset="100%" stop-color="#1d4a86"/>
  </linearGradient>
  <linearGradient id="pGold" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#fff3c0"/>
    <stop offset="55%" stop-color="#f3c65a"/>
    <stop offset="100%" stop-color="#c88a2a"/>
  </linearGradient>
  <linearGradient id="pWin" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#fff8d8"/>
    <stop offset="100%" stop-color="#ffbb52"/>
  </linearGradient>
  <radialGradient id="pGlow">
    <stop offset="0%" stop-color="#ffd27a" stop-opacity=".55"/>
    <stop offset="100%" stop-color="#ffd27a" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="pDoor" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#3a5a9c"/>
    <stop offset="100%" stop-color="#1a2a5a"/>
  </linearGradient>
  <linearGradient id="pBanner" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#4d8fe0"/>
    <stop offset="100%" stop-color="#20498f"/>
  </linearGradient>
  <radialGradient id="pLight" cx="50%" cy="75%" r="80%">
    <stop offset="0%" stop-color="#fffbe6"/>
    <stop offset="45%" stop-color="#ffd77a"/>
    <stop offset="100%" stop-color="#ff9f3a"/>
  </radialGradient>
  <radialGradient id="pRose">
    <stop offset="0%" stop-color="#ffffff"/>
    <stop offset="35%" stop-color="#bfe8ff"/>
    <stop offset="70%" stop-color="#5fb4f0"/>
    <stop offset="100%" stop-color="#2f6fc0"/>
  </radialGradient>
  <radialGradient id="pHalo">
    <stop offset="0%" stop-color="#ffecaa" stop-opacity=".5"/>
    <stop offset="50%" stop-color="#8fd3ff" stop-opacity=".16"/>
    <stop offset="100%" stop-color="#8fd3ff" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="pCloud" cx="50%" cy="30%" r="75%">
    <stop offset="0%" stop-color="#ffffff"/>
    <stop offset="55%" stop-color="#e6f0ff"/>
    <stop offset="100%" stop-color="#b3c8ee"/>
  </radialGradient>
  <linearGradient id="pPath" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffe08a" stop-opacity=".95"/>
    <stop offset="100%" stop-color="#ffe08a" stop-opacity="0"/>
  </linearGradient>
  <pattern id="pBricks" width="22" height="12" patternUnits="userSpaceOnUse">
    <path d="M0 .5H22M0 6.5H22M.5 0V6M11.5 6V12" fill="none" stroke="#7d89c4" stroke-width=".7" opacity=".28"/>
  </pattern>
  <pattern id="pShingles" width="8" height="7" patternUnits="userSpaceOnUse">
    <path d="M0 7A4 4 0 0 1 8 7M-4 3.5A4 4 0 0 1 4 3.5M4 3.5A4 4 0 0 1 12 3.5" fill="none" stroke="#123a70" stroke-width=".8" opacity=".38"/>
  </pattern>
</defs>""")

add('<circle class="palace-halo" cx="300" cy="300" r="300" fill="url(#pHalo)"/>')

# Distant spires in the haze, for depth
add('<g opacity=".5" fill="#a9bfe8">')
for x, w, top, apex in ((148, 18, 200, 72), (452, 18, 200, 72), (262, 14, 150, 92), (338, 14, 150, 92)):
    add(f'<rect x="{x - w / 2:g}" y="{top}" width="{w}" height="{BOTTOM - top}"/>')
    add(f'<path d="{flared_roof(x - w / 2 - 4, x + w / 2 + 4, top + 1, apex)}" fill="#8fb2e6"/>')
add("</g>")

# Curtain wall with battlements
add(f'<rect x="150" y="330" width="300" height="{BOTTOM - 330}" fill="url(#pWall)"/>')
add(f'<rect x="150" y="330" width="300" height="{BOTTOM - 330}" fill="url(#pBricks)"/>')
add('<g fill="url(#pWall)">' + "".join(f'<rect x="{x}" y="318" width="12" height="14"/>' for x in range(150, 450, 20)) + "</g>")

# Middle towers
for x in (178, 376):
    tower(x, 182, 46)
    ledge(x, 252, 46)
    ledge(x, 340, 46)
    roof(x - 9, x + 55, 184, 62, dormers=((0, 128, 11),))
    window(x + 23, 206, 12, 28)
    window(x + 23, 280, 12, 30)
    window(x + 23, 372, 12, 30)

# Outer towers with balconies
for x in (78, 438):
    tower(x, 262, 84)
    roof(x - 11, x + 95, 264, 128, dormers=((0, 214, 14),))
    window(x + 42, 280, 16, 32, mullion=True)
    balcony(x, 334, 84)

# The keep
tower(240, 162, 120)
ledge(240, 252, 120)
ledge(240, 344, 120)
roof(226, 374, 164, 10, dormers=((-22, 108, 12), (22, 108, 12)))
banner(256, 182, 58)
banner(344, 182, 58)
window(264, 266, 14, 34, mullion=True)
window(336, 266, 14, 34, mullion=True)
window(300, 292, 18, 42, mullion=True)

# Turrets on the keep's corners
turret(226, 182, 24, 292, 112)
turret(350, 182, 24, 292, 112)

# Window glows, then the windows themselves
for cx, top, w, h, *_ in windows:
    add(f'<ellipse cx="{g(cx)}" cy="{g(top + h * 0.55)}" rx="{g(w * 1.6)}" ry="{g(h * 0.9)}" fill="url(#pGlow)"/>')
add('<g class="palace-windows">')
for i, (cx, top, w, h, frame, mullion) in enumerate(windows):
    if frame:
        add(f'<path d="{arch(cx, top - 2.5, w + 5, h + 4)}" fill="#eef1ff"/>')
    add(f'<path d="{arch(cx, top, w, h)}" fill="url(#pWin)" style="--d:{-i * 0.6:.1f}s"/>')
    if mullion:
        add(f'<path d="M{g(cx)} {g(top + 2)}V{g(top + h)}M{g(cx - w / 2)} {g(top + h * 0.55)}H{g(cx + w / 2)}" stroke="#c9862e" stroke-width="1" opacity=".7"/>')
    if frame:
        add(f'<rect x="{g(cx - w / 2 - 3)}" y="{g(top + h)}" width="{g(w + 6)}" height="3" rx="1" fill="url(#pLedge)"/>')
add("</g>")

# Rose window with stained-glass tracery
add('<circle cx="300" cy="222" r="25" fill="#eef1ff"/>')
add('<circle cx="300" cy="222" r="21" fill="url(#pRose)" stroke="url(#pGold)" stroke-width="3"/>')
add('<g stroke="#e0a83a" stroke-width="1.2" opacity=".85">' + "".join(
    f'<path d="M300 222L{g(300 + math.cos(a) * 20)} {g(222 + math.sin(a) * 20)}"/>' for a in (i * math.pi / 4 for i in range(8))) + "</g>")
add('<circle cx="300" cy="222" r="8" fill="none" stroke="#e0a83a" stroke-width="1.2"/>')
add('<path d="M300 212l3 7 7 3-7 3-3 7-3-7-7-3 7-3Z" fill="#ffffff"/>')

# Pennants
flag(300, 10, "#ffd76a", 22)
flag(201, 62, "#8fd3ff")
flag(399, 62, "#8fd3ff")
flag(120, 128, "#ffd76a")
flag(480, 128, "#ffd76a")

# The three doors
door("registry", 120, 28, 424)
door("invitation", 300, 40, 400)
door("rsvp", 480, 28, 424)

# Clouds: a shadowed layer, then the bright tops, then a golden stair and path
puffs = ((40, 512, 46), (560, 512, 46), (132, 540, 56), (468, 540, 56), (214, 552, 52), (386, 552, 52), (300, 578, 70))
add('<g class="palace-clouds">')
add('<ellipse cx="300" cy="596" rx="312" ry="52" fill="#9fb8e6"/>')
for cx, cy, r in puffs:
    add(f'<circle cx="{cx}" cy="{cy + 7}" r="{r}" fill="#9fb8e6"/>')
add('<ellipse cx="300" cy="590" rx="310" ry="50" fill="url(#pCloud)"/>')
for cx, cy, r in puffs:
    add(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="url(#pCloud)"/>')
add("</g>")
for i, (w, y) in enumerate(((92, 480), (106, 487), (120, 494))):
    add(f'<rect x="{300 - w / 2:g}" y="{y}" width="{w}" height="7" rx="2" fill="url(#pGold)" opacity="{1 - i * 0.15:.2f}"/>')
add('<path d="M240 501H360L404 572H196Z" fill="url(#pPath)"/>')

add("</svg>")

# ---------- Write it into the page ----------

page = "site/neverland.html"
html = open(page).read()
start_tag = "<!-- palace:start (drawn by tools/make_palace.py) -->"
end_tag = "<!-- palace:end -->"
a = html.index(start_tag) + len(start_tag)
b = html.index(end_tag)
indent = "        "
svg = "\n".join(indent + line for line in "\n".join(out).split("\n"))
html = html[:a] + "\n" + svg + "\n" + indent + html[b:]
open(page, "w").write(html)
print(f"palace drawn into {page} ({len(svg) // 1024} KB)")
