"""Draws the London night scene used behind both pages.

Writes site/assets/img/london.svg: a misty far skyline with St Paul's,
the Houses of Parliament and Big Ben, and rooftops with chimneys in
front, all with lit windows. skyline.js loads it into the page so the
page CSS can twinkle the windows and drift the fog.

Run from the repo root:  python3 tools/make_london.py
"""
import math
import random

random.seed(7)  # same scene every time
W, H = 2000, 500
out = []


def add(s):
    out.append(s)


def r(a, b):
    return random.uniform(a, b)


def f(n):
    return f"{n:.1f}".rstrip("0").rstrip(".")


WARM = ["#ffd27f", "#ffc46b", "#ffe3a3", "#ffb85c"]


def window(x, y, w, h, twinkle=False, dim=1.0):
    color = random.choice(WARM)
    op = f(r(0.55, 0.95) * dim)
    if twinkle:
        add(f'<rect class="win" x="{f(x)}" y="{f(y)}" width="{f(w)}" height="{f(h)}" fill="{color}" style="--delay:{f(-r(0, 9))}s"/>')
    else:
        add(f'<rect x="{f(x)}" y="{f(y)}" width="{f(w)}" height="{f(h)}" fill="{color}" opacity="{op}"/>')


def windows_in(x, top, w, chance, size=(3.5, 5), gap=(11, 13), bottom=H, dim=1.0):
    gx, gy = gap
    wx = x + 6
    while wx < x + w - 7:
        wy = top + 10
        while wy < bottom - 8:
            if random.random() < chance:
                window(wx, wy, size[0], size[1], twinkle=random.random() < 0.35, dim=dim)
            wy += gy
        wx += gx


add(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMax slice">')
add("""<defs>
  <radialGradient id="cityGlow" cx="50%" cy="100%" r="60%">
    <stop offset="0%" stop-color="#ffb070" stop-opacity=".42"/>
    <stop offset="45%" stop-color="#f08a4a" stop-opacity=".14"/>
    <stop offset="100%" stop-color="#f08a4a" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="far" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#245679"/>
    <stop offset="100%" stop-color="#163b59"/>
  </linearGradient>
  <linearGradient id="mid" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#143352"/>
    <stop offset="100%" stop-color="#0b2039"/>
  </linearGradient>
  <linearGradient id="tower" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="#0c223c"/>
    <stop offset="55%" stop-color="#163a5c"/>
    <stop offset="100%" stop-color="#0a1c33"/>
  </linearGradient>
  <linearGradient id="near" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#081a2e"/>
    <stop offset="100%" stop-color="#040c18"/>
  </linearGradient>
  <linearGradient id="mist" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#b9dcea" stop-opacity="0"/>
    <stop offset="60%" stop-color="#b9dcea" stop-opacity=".26"/>
    <stop offset="100%" stop-color="#b9dcea" stop-opacity="0"/>
  </linearGradient>
  <radialGradient id="fog">
    <stop offset="0%" stop-color="#cfe6f0" stop-opacity=".28"/>
    <stop offset="100%" stop-color="#cfe6f0" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="clockFace">
    <stop offset="0%" stop-color="#fffbe6"/>
    <stop offset="60%" stop-color="#ffe29a"/>
    <stop offset="100%" stop-color="#e0a64a"/>
  </radialGradient>
  <radialGradient id="clockGlow">
    <stop offset="0%" stop-color="#ffe7a8" stop-opacity=".75"/>
    <stop offset="100%" stop-color="#ffcf70" stop-opacity="0"/>
  </radialGradient>
</defs>""")

# ---------- Warm glow of the city on the horizon ----------
add(f'<rect x="0" y="180" width="{W}" height="{H - 180}" fill="url(#cityGlow)"/>')

# ---------- Far skyline, misty ----------
add('<g class="far" fill="url(#far)">')
x = 0
while x < W:
    w = r(30, 90)
    top = r(285, 385)
    add(f'<rect x="{f(x)}" y="{f(top)}" width="{f(w + 1)}" height="{f(H - top)}"/>')
    roll = random.random()
    if roll < 0.12:
        sw = w * r(0.25, 0.4)
        sx = x + w / 2
        add(f'<path d="M{f(sx - sw / 2)} {f(top)}L{f(sx)} {f(top - r(40, 90))}L{f(sx + sw / 2)} {f(top)}Z"/>')
    elif roll < 0.18:
        add(f'<ellipse cx="{f(x + w / 2)}" cy="{f(top)}" rx="{f(w * 0.35)}" ry="{f(w * 0.3)}"/>')
    x += w
# St Paul's Cathedral
add('<g transform="translate(0 -50)"><rect x="1515" y="330" width="90" height="170"/>'
    '<rect x="1530" y="300" width="60" height="32"/>'
    '<path d="M1522 302A38 44 0 0 1 1598 302Z"/>'
    '<rect x="1554" y="246" width="12" height="16"/>'
    '<path d="M1556 246L1560 226L1564 246Z"/>'
    '<rect x="1478" y="318" width="16" height="40"/><path d="M1478 318L1486 296L1494 318Z"/>'
    '<rect x="1626" y="318" width="16" height="40"/><path d="M1626 318L1634 296L1642 318Z"/></g>')
add("</g>")
add('<g opacity=".55">')
x = 0
while x < W:
    if random.random() < 0.6:
        window(x, r(392, 470), 3, 4, twinkle=random.random() < 0.3, dim=0.6)
    x += r(6, 16)
add("</g>")

# Mist over the far skyline
add(f'<rect x="0" y="280" width="{W}" height="220" fill="url(#mist)"/>')
add('<g class="fog fog-back">')
for i in range(7):
    add(f'<ellipse cx="{f(i * 330 + r(-60, 60))}" cy="{f(r(350, 400))}" rx="{f(r(240, 340))}" ry="{f(r(26, 40))}" fill="url(#fog)"/>')
add("</g>")

# ---------- Middle: Parliament and neighbours ----------
add('<g class="mid" fill="url(#mid)">')


def mid_buildings(x0, x1):
    x = x0
    while x < x1:
        w = min(r(40, 110), x1 - x)
        top = r(330, 410)
        add(f'<rect x="{f(x)}" y="{f(top)}" width="{f(w + 1)}" height="{f(H - top)}"/>')
        windows_in(x, top, w, 0.24)
        roll = random.random()
        if roll < 0.22:
            add(f'<path d="M{f(x)} {f(top)}L{f(x + w / 2)} {f(top - r(18, 34))}L{f(x + w)} {f(top)}Z"/>')
        elif roll < 0.36:
            for px in (x + 4, x + w - 10):
                add(f'<rect x="{f(px)}" y="{f(top - 14)}" width="6" height="14"/><path d="M{f(px)} {f(top - 14)}L{f(px + 3)} {f(top - 28)}L{f(px + 6)} {f(top - 14)}Z"/>')
        x += w


mid_buildings(0, 822)
mid_buildings(1334, W)

# Palace of Westminster (lifted 30 units)
add('<g transform="translate(0 -30)">')
add('<rect x="896" y="398" width="440" height="132"/>')
for px in range(900, 1334, 16):
    add(f'<path d="M{px} 398L{px + 3} {f(r(380, 386))}L{px + 6} 398Z"/>')
for px in range(930, 1250, 64):
    add(f'<rect x="{px}" y="378" width="10" height="20"/><path d="M{px} 378L{px + 5} 360L{px + 10} 378Z"/>')
# Central lantern tower
add('<rect x="1074" y="330" width="32" height="70"/>'
    '<path d="M1072 332L1090 268L1108 332Z"/>'
    '<path d="M1070 340L1074 322L1078 340Z"/><path d="M1102 340L1106 322L1110 340Z"/>')
# Victoria Tower
add('<rect x="1270" y="250" width="56" height="150"/>'
    '<rect x="1266" y="236" width="12" height="20"/><path d="M1266 236L1272 218L1278 236Z"/>'
    '<rect x="1318" y="236" width="12" height="20"/><path d="M1318 236L1324 218L1330 236Z"/>'
    '<rect x="1290" y="238" width="16" height="14"/><path d="M1290 238L1298 222L1306 238Z"/>'
    '<rect x="1297" y="196" width="2" height="28"/>')
add("</g>")
add("</g>")

# Mid windows
add("<g>")
# Palace: rows of tall gothic windows
add('<g transform="translate(0 -30)">')
for row_y in (408, 428, 448, 468, 488):
    px = 902
    while px < 1330:
        if random.random() < 0.42:
            window(px, row_y, 3, 9, twinkle=random.random() < 0.3)
        px += 9
for wy in range(342, 396, 14):
    window(1086, wy, 4, 8)
for wy in range(262, 396, 16):
    for wx in (1282, 1296, 1310):
        if random.random() < 0.5:
            window(wx, wy, 3, 9, twinkle=random.random() < 0.3)
add("</g>")
add("</g>")

# ---------- Big Ben ----------
add('<g class="big-ben">')
add('<circle class="clock-glow" cx="860" cy="182" r="62" fill="url(#clockGlow)"/>')
add('<g fill="url(#tower)">'
    '<rect x="834" y="214" width="52" height="286"/>'
    '<rect x="826" y="150" width="68" height="66"/>'
    '<rect x="821" y="140" width="10" height="76"/><path d="M821 140L826 124L831 140Z"/>'
    '<rect x="889" y="140" width="10" height="76"/><path d="M889 140L894 124L899 140Z"/>'
    '<rect x="830" y="112" width="60" height="40"/>'
    '<path d="M826 114L894 114L876 70L844 70Z"/>'
    '<path d="M847 72L873 72L860 34Z"/>'
    '<path d="M826 114L830 96L834 114Z"/><path d="M886 114L890 96L894 114Z"/>'
    '<rect x="853" y="56" width="14" height="16"/>'
    '<rect x="859.3" y="20" width="1.4" height="16"/>'
    '</g>')
# Pilasters down the shaft
for px in (840, 850, 860, 870, 880):
    add(f'<rect x="{px - 0.6}" y="218" width="1.2" height="282" fill="#2a4f73" opacity=".55"/>')
# Belfry arches, softly lit
for ax in (838, 856, 874):
    add(f'<path d="M{ax} 146V126A4 4 0 0 1 {ax + 8} 126V146Z" fill="#ffd27f" opacity=".5"/>')
add('<rect x="855.5" y="60" width="9" height="9" fill="#ffe3a3" opacity=".7"/>')
# Slit windows up the shaft
for wy in range(232, 492, 26):
    for wx in (845, 871):
        if random.random() < 0.55:
            window(wx, wy, 3.5, 9, twinkle=random.random() < 0.25)
# The clock
add('<circle cx="860" cy="182" r="26" fill="#2a1c0a"/>'
    '<circle class="clock" cx="860" cy="182" r="23" fill="url(#clockFace)"/>')
for i in range(12):
    a = i / 12 * math.tau
    x1, y1 = 860 + math.sin(a) * 19, 182 - math.cos(a) * 19
    x2, y2 = 860 + math.sin(a) * 22, 182 - math.cos(a) * 22
    add(f'<line x1="{f(x1)}" y1="{f(y1)}" x2="{f(x2)}" y2="{f(y2)}" stroke="#5a3d12" stroke-width="1.4"/>')
add('<line x1="860" y1="182" x2="860" y2="167" stroke="#3b2708" stroke-width="2.4" stroke-linecap="round"/>'
    '<line x1="860" y1="182" x2="873" y2="188" stroke="#3b2708" stroke-width="1.6" stroke-linecap="round"/>'
    '<circle cx="860" cy="182" r="1.8" fill="#3b2708"/>')
add("</g>")

# Fog drifting in front of the middle layer
add('<g class="fog fog-front">')
for i in range(6):
    add(f'<ellipse cx="{f(i * 380 + r(-80, 80))}" cy="{f(r(440, 470))}" rx="{f(r(260, 380))}" ry="{f(r(22, 34))}" fill="url(#fog)"/>')
add("</g>")

# ---------- Near rooftops with chimneys ----------
add('<g class="near" fill="url(#near)">')
x = -10
roofs = []
while x < W:
    w = r(70, 140)
    base = r(436, 456)
    peak = base - r(20, 38)
    add(f'<path d="M{f(x)} {H}V{f(base)}L{f(x + w / 2)} {f(peak)}L{f(x + w)} {f(base)}V{H}Z"/>')
    for _ in range(random.choice((1, 1, 2))):
        cx = x + r(0.15, 0.75) * w
        ch = r(16, 28)
        cw = r(10, 16)
        cy = base - r(8, 16) - ch
        add(f'<rect x="{f(cx)}" y="{f(cy)}" width="{f(cw)}" height="{f(ch + 20)}"/>')
        for k in range(int(cw // 5)):
            add(f'<rect x="{f(cx + 1.5 + k * 5)}" y="{f(cy - 5)}" width="3" height="6"/>')
    roofs.append((x, w, base))
    x += w
add("</g>")
add("<g>")
for x, w, base in roofs:
    if random.random() < 0.45:
        window(x + r(0.2, 0.7) * w, base + r(4, 10), 6, 7, twinkle=random.random() < 0.3)
    if random.random() < 0.4:
        window(x + r(0.15, 0.75) * w, base + r(20, 32), 6, 8, twinkle=random.random() < 0.3)
add("</g>")

add("</svg>")

with open("site/assets/img/london.svg", "w") as fh:
    fh.write("\n".join(out) + "\n")
print("wrote site/assets/img/london.svg")
