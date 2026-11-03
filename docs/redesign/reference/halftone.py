"""Reference implementation of the newspaper halftone used for post covers.

Port this into backend/services/halftone.py. The parameters were tuned on the real posts;
change them only with a visual check on several covers.
"""

import math
from typing import Literal

from PIL import Image, ImageDraw, ImageFilter, ImageOps, ImageStat

WIDTH, HEIGHT = 960, 600
CELL = 9                # dot pitch in px
ANGLE = 45              # screen angle, the classic newsprint black screen
GAMMA = 1.15            # pushes light greys towards clean paper
MIN_DARKNESS = 0.04     # below this no dot is drawn, so white stays white
DOT_SCALE = 0.64        # largest dot radius as a share of the pitch
INVERT_BELOW = 145      # mean luminance under which "auto" prints a negative

Invert = Literal["auto", "always", "never"]


def render_halftone(source: Image.Image, invert: Invert = "auto") -> Image.Image:
    """Return a WIDTH x HEIGHT RGBA image whose alpha channel holds the ink dots."""
    gray = ImageOps.fit(source.convert("L"), (WIDTH, HEIGHT), Image.LANCZOS)

    mean = ImageStat.Stat(gray).mean[0]
    if invert == "always" or (invert == "auto" and mean < INVERT_BELOW):
        gray = ImageOps.invert(gray)  # dark UI screenshots read as ink on paper

    gray = ImageOps.autocontrast(gray, cutoff=1)
    darkness = ImageOps.invert(gray).filter(ImageFilter.GaussianBlur(1.6))

    # Draw at 2x and downsample so dot edges are smooth.
    mask = Image.new("L", (WIDTH * 2, HEIGHT * 2), 0)
    draw = ImageDraw.Draw(mask)
    cos_a = sin_a = math.cos(math.radians(ANGLE))
    reach = int(math.hypot(WIDTH, HEIGHT)) + CELL

    for gy in range(-reach, reach, CELL):
        for gx in range(-reach, reach, CELL):
            x = gx * cos_a - gy * sin_a + WIDTH / 2
            y = gx * sin_a + gy * cos_a + HEIGHT / 2
            if not (0 <= x < WIDTH and 0 <= y < HEIGHT):
                continue
            value = (darkness.getpixel((int(x), int(y))) / 255) ** GAMMA
            if value < MIN_DARKNESS:
                continue
            r = CELL * DOT_SCALE * math.sqrt(value)
            draw.ellipse([2 * (x - r), 2 * (y - r), 2 * (x + r), 2 * (y + r)], fill=255)

    mask = mask.resize((WIDTH, HEIGHT), Image.LANCZOS)
    out = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    out.putalpha(mask)
    return out
