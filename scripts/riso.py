"""Asset pipeline for makepigs.fly.

Turns public-domain NASA photos into two-ink risograph-style halftones
(fluorescent pink + riso blue on transparent "paper"), generates the paper
grain texture, and packs the Open Graph share card (a screenshot of the
landing scene at 1600x840, taken with the HUD hidden).

Usage (run with isolated mode, sources live outside the repo):
    python3 -I scripts/riso.py photos <raw_dir> <out_dir>
    python3 -I scripts/riso.py noise <out_png>
    python3 -I scripts/riso.py ogpack <screenshot_png> <out_jpg>
    python3 -I scripts/riso.py sky <raw_dir> <out_dir>

Requires Pillow + numpy.
"""

from __future__ import annotations

import math
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

PINK = np.array([255, 72, 176], dtype=np.float32) / 255
BLUE = np.array([40, 140, 230], dtype=np.float32) / 255


def smoothstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0.0, 1.0)
    return t * t * (3 - 2 * t)


def screen(cov: np.ndarray, cell: float, angle: float) -> np.ndarray:
    """Amplitude-modulated halftone: returns ink mask (0..1) for coverage map."""
    h, w = cov.shape
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    a = math.radians(angle)
    u = x * math.cos(a) + y * math.sin(a)
    v = -x * math.sin(a) + y * math.cos(a)
    fu = (u / cell) % 1.0 - 0.5
    fv = (v / cell) % 1.0 - 0.5
    d = np.sqrt(fu * fu + fv * fv)
    r = np.sqrt(np.clip(cov, 0, 1) / math.pi) * 1.08
    aa = 0.75 / cell
    return smoothstep(r + aa, r - aa, d)


def luminance(img: Image.Image) -> np.ndarray:
    g = np.asarray(img.convert("L"), dtype=np.float32) / 255
    return g


def riso_photo(
    img: Image.Image,
    width: int,
    cell: float = 5.0,
    gamma: float = 0.85,
    contrast: float = 1.15,
    alpha_mask: np.ndarray | None = None,
    paper: tuple[int, int, int] | None = None,
) -> Image.Image:
    img = img.convert("RGB")
    h = round(img.height * width / img.width)
    img = img.resize((width, h), Image.LANCZOS)
    L = luminance(img.filter(ImageFilter.GaussianBlur(cell * 0.35)))
    L = np.clip((L - 0.5) * contrast + 0.5, 0, 1) ** gamma

    cov_blue = np.clip(L * 1.05, 0, 1)
    cov_pink = smoothstep(0.42, 0.98, L) * 0.95

    ink_b = screen(cov_blue, cell, 15)
    ink_p = screen(cov_pink, cell * 1.1, 75)


    # screen-blend the two inks over black, then un-premultiply into RGBA
    rgb = 1 - (1 - ink_b[..., None] * BLUE) * (1 - ink_p[..., None] * PINK)
    alpha = 1 - (1 - ink_b) * (1 - ink_p)
    if alpha_mask is not None:
        m = np.asarray(
            Image.fromarray((alpha_mask * 255).astype(np.uint8)).resize((width, h), Image.LANCZOS),
            dtype=np.float32,
        ) / 255
        alpha = alpha * m
    safe = np.maximum(alpha, 1e-4)[..., None]
    col = np.clip(rgb / safe, 0, 1)
    if paper is not None:
        pp = np.array(paper, dtype=np.float32) / 255
        flat = col * alpha[..., None] + pp * (1 - alpha[..., None])
        return Image.fromarray((flat * 255).astype(np.uint8), "RGB")
    out = np.dstack([col, alpha])
    return Image.fromarray((out * 255).astype(np.uint8), "RGBA")


def disc_mask(img: Image.Image, thresh: float = 0.07) -> np.ndarray:
    L = luminance(img.filter(ImageFilter.GaussianBlur(6)))
    m = (L > thresh).astype(np.float32)
    mi = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3))
    return np.asarray(mi, dtype=np.float32) / 255


NAVY = (14, 18, 56)
SAVE = dict(quality=48, method=6, alpha_quality=45)


def photos(raw: Path, out: Path) -> None:
    out.mkdir(parents=True, exist_ok=True)

    # Earth limb: crop away the station hardware, keep the curve.
    limb = Image.open(raw / "limb.jpg")
    W, H = limb.size
    limb = limb.crop((int(W * 0.33), int(H * 0.36), W, H))
    m = smoothstep(0.03, 0.16, luminance(limb.filter(ImageFilter.GaussianBlur(8))))
    riso_photo(limb, 1500, cell=6.2, alpha_mask=m).save(out / "earth-limb.webp", **SAVE)

    iss = Image.open(raw / "iss.jpg")
    W, H = iss.size
    iss = iss.crop((int(W * 0.02), int(H * 0.0), int(W * 0.98), int(H * 0.86)))
    riso_photo(iss, 1100, cell=4.6, contrast=1.25, paper=NAVY).save(out / "iss.webp", **SAVE)

    boot = Image.open(raw / "bootprint.jpg")
    W, H = boot.size
    boot = boot.crop((int(W * 0.06), int(H * 0.08), int(W * 0.96), int(H * 0.98)))
    riso_photo(boot, 860, cell=5.0, contrast=1.35, gamma=0.95, paper=NAVY).save(
        out / "bootprint.webp", **SAVE
    )

    moon = Image.open(raw / "moon.jpg")
    W, H = moon.size
    pad = int(W * 0.06)
    moon = moon.crop((pad, pad, W - pad, H - pad))
    riso_photo(moon, 820, cell=4.8, contrast=1.3, alpha_mask=disc_mask(moon)).save(
        out / "moon.webp", **SAVE
    )
    for p in sorted(out.glob("*.webp")):
        print(p.name, p.stat().st_size // 1024, "KB", Image.open(p).size)


def noise(out_png: Path) -> None:
    rng = np.random.default_rng(42)
    n = 192
    a = rng.random((n, n), dtype=np.float32)
    dark = (a < 0.5)
    alpha = np.where(dark, (0.5 - a) * 2, (a - 0.5) * 2) ** 2.2
    rgb = np.where(dark[..., None], np.array([40, 30, 40]), np.array([255, 252, 240]))
    img = np.dstack([rgb, (alpha * 90).astype(np.int64)]).astype(np.uint8)
    Image.fromarray(img, "RGBA").save(out_png, optimize=True)
    print(out_png, out_png.stat().st_size // 1024, "KB")


def ogpack(src_png: Path, out_jpg: Path) -> None:
    """Share card: a 1600x840 screenshot of the landing scene, downscaled to 1200x630."""
    im = Image.open(src_png).convert("RGB").resize((1200, 630), Image.LANCZOS)
    im.save(out_jpg, quality=84, optimize=True, progressive=True)
    print(out_jpg, out_jpg.stat().st_size // 1024, "KB")



# real-view backgrounds: raw key -> (output name, crop box as fractions l, t, r, b)
SKY = {
    "a1": ("field", (0, 0.04, 0.8, 1)),
    "b3": ("canopy", (0, 0, 1, 1)),
    "c2": ("rooftops", (0, 0, 1, 1)),
    "d1": ("river", (0, 0, 1, 1)),
    "g2": ("cumulus", (0, 0, 1, 1)),
    "f2": ("himalaya", (0, 0, 1, 1)),
    "g1": ("cruise", (0, 0, 1, 1)),
    "h1": ("stratosphere", (0, 0, 1, 1)),
    "i3": ("limb", (0, 0, 1, 1)),
    "j1": ("aurora", (0, 0, 1, 1)),
    "k1": ("earthrise", (0.03, 0.03, 0.97, 0.97)),
    "l2": ("cliffs", (0, 0, 1, 1)),
}


def sky(raw: Path, out: Path) -> None:
    """Resize the real-view photos to 1600w + 900w WebP, natural colour."""
    out.mkdir(parents=True, exist_ok=True)
    for key, (name, (l, t, r, b)) in SKY.items():
        src = next((p for p in raw.glob(f"{key}.*")), None)
        if src is None:
            print("skip (missing)", key)
            continue
        im = Image.open(src).convert("RGB")
        w, h = im.size
        im = im.crop((round(l * w), round(t * h), round(r * w), round(b * h)))
        for width, q in ((1600, 64), (900, 64)):
            k = min(1.0, width / im.width)
            sm = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
            dst = out / f"{name}-{width}.webp"
            sm.save(dst, "WEBP", quality=q, method=6)
            print(f"{dst.name:28s} {sm.size[0]}x{sm.size[1]} {dst.stat().st_size // 1024} KB")


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else ""
    if cmd == "photos":
        photos(Path(sys.argv[2]), Path(sys.argv[3]))
    elif cmd == "noise":
        noise(Path(sys.argv[2]))
    elif cmd == "sky":
        sky(Path(sys.argv[2]), Path(sys.argv[3]))
    elif cmd == "ogpack":
        ogpack(Path(sys.argv[2]), Path(sys.argv[3]))
    else:
        print(__doc__)
        sys.exit(1)
