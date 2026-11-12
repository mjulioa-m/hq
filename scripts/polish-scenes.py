"""Turn the full-bleed illustrations into short animated webp loops."""
import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance

ASSETS = Path(r"C:\Users\Factin\.cursor\projects\c-Factin-hq\assets")
OUT = Path(__file__).resolve().parents[1] / "public" / "scenes"
W, H = 1280, 720
FRAMES = 8
DURATION = 160

SOURCES = {
    "inicio": "inicio-src.jpg",
    "tareas": "tareas-src.jpg",
    "contenido": "contenido-src.jpg",
    "proyectos": "proyectos-src.jpg",
    "factin": "factin-src.jpg",
    "marie": "marie-src.jpg",
    "boston-990": "boston-src.jpg",
    "ventas": "ventas-src.jpg",
    "finanzas": "finanzas-src.jpg",
    "decidir": "decidir-src.jpg",
    "aprendido": "aprendido-src.jpg",
    "login": "login-src.jpg",
}


def cover(path: Path) -> Image.Image:
    im = Image.open(path).convert("RGB")
    scale = max(W / im.width, H / im.height)
    resized = im.resize((round(im.width * scale), round(im.height * scale)), Image.Resampling.LANCZOS)
    left = (resized.width - W) // 2
    top = (resized.height - H) // 2
    return resized.crop((left, top, left + W, top + H))


def motes(base: Image.Image, frame: int, color: tuple[int, int, int], count: int, speed: int, radius: int) -> Image.Image:
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    rng = random.Random(count * 17 + speed)
    for i in range(count):
        x = rng.randint(0, W - 1)
        y = rng.randint(0, H - 1)
        phase = rng.random() * math.tau
        drift_x = math.sin(frame / FRAMES * math.tau + phase) * 14
        y2 = (y - frame * speed - i * 3) % H
        alpha = int(50 + 70 * abs(math.sin(frame / FRAMES * math.tau + phase)))
        r = rng.randint(1, radius)
        draw.ellipse((x + drift_x - r, y2 - r, x + drift_x + r, y2 + r), fill=(*color, alpha))
    return Image.alpha_composite(base.convert("RGBA"), overlay).convert("RGB")


def rain(base: Image.Image, frame: int) -> Image.Image:
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    rng = random.Random(3)
    shift = frame * 28
    for _ in range(90):
        x = rng.randint(0, W)
        y = (rng.randint(0, H) + shift) % (H + 30) - 15
        draw.line((x, y, x - 8, y + 22), fill=(214, 226, 242, 80), width=1)
    return Image.alpha_composite(base.convert("RGBA"), overlay).convert("RGB")


def breathe(im: Image.Image, frame: int, amount: float) -> Image.Image:
    factor = 1 + amount * math.sin(frame / FRAMES * math.tau)
    lit = ImageEnhance.Brightness(im).enhance(factor)
    return Image.blend(im, lit, 0.65)


def frames_for(slug: str, base: Image.Image) -> list[Image.Image]:
    out = []
    for i in range(FRAMES):
        frame = base
        if slug == "finanzas":
            frame = rain(frame, i)
            frame = breathe(frame, i, 0.04)
        elif slug == "ventas":
            frame = motes(frame, i, (255, 214, 120), 18, 6, 3)
            frame = breathe(frame, i, 0.07)
        elif slug == "login":
            frame = motes(frame, i, (255, 180, 90), 10, 8, 2)
            frame = breathe(frame, i, 0.09)
        elif slug == "decidir":
            frame = motes(frame, i, (232, 168, 140), 14, 5, 2)
            frame = breathe(frame, i, 0.03)
        elif slug == "factin":
            frame = motes(frame, i, (180, 210, 255), 12, 3, 2)
            frame = breathe(frame, i, 0.05)
        else:
            frame = motes(frame, i, (255, 220, 170), 16, 4, 2)
            frame = breathe(frame, i, 0.045)
        out.append(frame)
    return out


def save(slug: str, frames: list[Image.Image]) -> None:
    anim = OUT / f"{slug}.webp"
    still = OUT / f"{slug}-still.webp"
    tmp = OUT / f"{slug}.tmp.webp"
    frames[0].save(
        tmp,
        save_all=True,
        append_images=frames[1:],
        duration=DURATION,
        loop=0,
        quality=62,
        method=4,
    )
    tmp.replace(anim)
    frames[0].save(still, quality=76, method=4)
    print(f"{slug}: {anim.stat().st_size // 1024} KB")


def main() -> None:
    for slug, name in SOURCES.items():
        base = cover(ASSETS / name)
        save(slug, frames_for(slug, base))


if __name__ == "__main__":
    main()
