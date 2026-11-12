"""Build animated scene files from CC0 art and the still pixel scenes."""
import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance

ROOT = Path(__file__).resolve().parents[1]
SCENES = ROOT / "public" / "scenes"
TMP = ROOT / "tmp-art"
FRAMES = 16
DURATION = 120


def save_anim(frames: list[Image.Image], slug: str, duration: int = DURATION) -> None:
    frames = [frame.convert("RGB") for frame in frames]
    anim = SCENES / f"{slug}.webp"
    still = SCENES / f"{slug}-still.webp"
    tmp = SCENES / f"{slug}.tmp.webp"
    frames[0].save(
        tmp,
        save_all=True,
        append_images=frames[1:],
        duration=duration,
        loop=0,
        quality=58,
        method=4,
    )
    tmp.replace(anim)
    frames[0].save(still, quality=72, method=4)
    print(f"{slug}: {anim.stat().st_size // 1024} KB, {len(frames)} frames")


def gif_frames(path: Path, width: int, step: int, crop_black: bool = False) -> list[Image.Image]:
    im = Image.open(path)
    total = im.n_frames
    raw = []
    for i in range(0, total, step):
        im.seek(i)
        raw.append(im.convert("RGB"))
    box = None
    if crop_black and raw:
        trimmed = trim_black(raw[0])
        box = (0, 0, trimmed.width, trimmed.height)
    out = []
    for frame in raw:
        if box:
            frame = frame.crop(box)
        h = round(frame.height * width / frame.width)
        out.append(frame.resize((width, h), Image.Resampling.BOX))
    return out


def trim_black(im: Image.Image) -> Image.Image:
    w, h = im.size
    px = im.load()
    bottom = h - 1
    for y in range(h - 1, int(h * 0.45), -1):
        lit = 0
        for x in range(0, w, 6):
            if sum(px[x, y]) > 40:
                lit += 1
        if lit > (w / 6) * 0.04:
            bottom = min(h - 1, y + 12)
            break
    if bottom < h - 8:
        im = im.crop((0, 0, w, bottom))
    return im


def sway(im: Image.Image, frame: int) -> Image.Image:
    w, h = im.size
    shift = int(round(math.sin(frame / FRAMES * math.pi * 2) * 4))
    out = im.copy()
    for box in ((0, 0, int(w * 0.28), int(h * 0.42)), (int(w * 0.72), 0, w, int(h * 0.42))):
        crop = im.crop(box)
        out.paste(crop, (box[0] + shift, box[1]))
    return out


def twinkle(im: Image.Image, frame: int) -> Image.Image:
    out = im.copy()
    px = out.load()
    w, h = out.size
    rng = random.Random(frame * 91 + 3)
    for _ in range(160):
        x = rng.randint(int(w * 0.22), int(w * 0.78) - 1)
        y = rng.randint(int(h * 0.12), int(h * 0.58) - 1)
        r, g, b = px[x, y]
        if r > 170 and g > 90 and b < 180:
            bump = 70 if (frame + x // 3) % 4 == 0 else 0
            px[x, y] = (min(255, r + bump), min(255, g + bump // 2), min(255, b + 10))
    return out


def fireflies(im: Image.Image, frame: int) -> Image.Image:
    out = im.copy()
    draw = ImageDraw.Draw(out)
    w, h = out.size
    rng = random.Random(7)
    for i in range(22):
        x0 = rng.random() * w
        y0 = rng.random() * h * 0.85
        x = int(x0 + math.sin(frame / FRAMES * math.pi * 2 + i) * 36)
        y = int(y0 + math.cos(frame / FRAMES * math.pi * 2 + i * 0.6) * 18)
        glow = 0.25 + 0.75 * abs(math.sin(frame / FRAMES * math.pi * 4 + i))
        color = (int(190 * glow), int(240 * glow), int(120 * glow))
        draw.ellipse((x, y, x + 5, y + 5), fill=color)
    return out


def koi(im: Image.Image, frame: int) -> Image.Image:
    out = im.copy()
    draw = ImageDraw.Draw(out)
    w, h = out.size
    school = [
        (0.08, 0.32, 16, (232, 96, 64), 1),
        (0.62, 0.46, 22, (242, 176, 72), -1),
        (0.28, 0.64, 15, (214, 72, 68), 1),
        (0.78, 0.26, 13, (255, 228, 196), -1),
        (0.4, 0.74, 19, (196, 58, 48), 1),
        (0.5, 0.18, 12, (255, 196, 90), -1),
    ]
    for i, (fx, fy, size, color, direction) in enumerate(school):
        speed = 0.035 + i * 0.008
        x = int(((fx + frame * speed * direction) % 1.0) * (w - size * 6))
        y = int(fy * h + math.sin(frame / FRAMES * math.pi * 2 + i) * 12)
        s = size
        if direction > 0:
            body = [(x, y), (x + s * 2, y - s // 2), (x + s * 4, y), (x + s * 2, y + s // 2)]
            tail = [(x, y), (x - s, y - s // 2), (x - s, y + s // 2)]
            eye = (x + s * 3, y - 2, x + s * 3 + 3, y + 1)
        else:
            body = [(x + s * 4, y), (x + s * 2, y - s // 2), (x, y), (x + s * 2, y + s // 2)]
            tail = [(x + s * 4, y), (x + s * 5, y - s // 2), (x + s * 5, y + s // 2)]
            eye = (x + s, y - 2, x + s + 3, y + 1)
        draw.polygon(body, fill=color)
        draw.polygon(tail, fill=tuple(max(0, c - 50) for c in color))
        draw.ellipse(eye, fill=(18, 16, 16))
        rad = 8 + (frame * 4 + i * 6) % 22
        draw.ellipse((x - rad, y + s - rad // 3, x + rad, y + s + rad // 3), outline=(170, 214, 196))
    return out


def flicker(im: Image.Image, frame: int) -> Image.Image:
    out = im.copy()
    w, h = out.size
    box = (int(w * 0.18), int(h * 0.18), int(w * 0.62), int(h * 0.58))
    crop = out.crop(box)
    factor = 0.82 + (0.28 if frame % 5 == 0 else 0.08)
    crop = ImageEnhance.Brightness(crop).enhance(factor)
    out.paste(crop, box[:2])
    return out


def stars(im: Image.Image, frame: int) -> Image.Image:
    out = im.copy()
    px = out.load()
    w, h = out.size
    rng = random.Random(4)
    points = [(rng.randint(0, w - 1), rng.randint(0, int(h * 0.45))) for _ in range(70)]
    for i, (x, y) in enumerate(points):
        on = abs(math.sin(frame / FRAMES * math.pi * 2 + i)) > 0.45
        if on:
            px[x, y] = (255, 244, 220)
            if x + 1 < w:
                px[x + 1, y] = (255, 236, 200)
    return out


def gif_pixel(path: Path, target: int = 560) -> tuple[list[Image.Image], int]:
    im = Image.open(path)
    canvas = Image.new("RGBA", im.size, (0, 0, 0, 0))
    frames: list[Image.Image] = []
    durations: list[int] = []
    for i in range(im.n_frames):
        im.seek(i)
        frame = im.convert("RGBA")
        disposal = int(getattr(im, "disposal_method", 0) or 0)
        if disposal == 2:
            canvas = Image.new("RGBA", im.size, (0, 0, 0, 0))
        else:
            canvas = canvas.copy()
        canvas.alpha_composite(frame)
        frames.append(canvas.copy())
        durations.append(int(im.info.get("duration") or 100))
    w, h = frames[0].size
    scale = max(1, round(target / max(w, h)))
    painted: list[Image.Image] = []
    for frame in frames:
        bg = Image.new("RGB", frame.size, (12, 10, 9))
        bg.paste(frame, mask=frame.getchannel("A"))
        painted.append(bg.resize((w * scale, h * scale), Image.Resampling.NEAREST))
    step = 2 if len(painted) > 16 else 1
    duration = max(80, int(sum(durations) / len(durations)) * step)
    return painted[::step], duration


def main() -> None:
    import zipfile

    mapping = {
        "inicio": "gif/WinterCabin.gif",
        "tareas": "gif/CoffeeBar.gif",
        "contenido": "gif/Greenhouse.gif",
        "proyectos": "gif/CozyAttic.gif",
        "factin": "gif/GamerDesk.gif",
        "marie": "gif/TeaCorner.gif",
        "boston-990": "gif/RecordStore.gif",
        "ventas": "gif/CozyCampfire.gif",
        "finanzas": "gif/RainyWindow.gif",
        "aprendido": "gif/Bookshop.gif",
        "login": "gif/Fireplace.gif",
    }
    # CC0, ErinWave — Phluxel FX Cozy Interiors.
    # Decidir uses CC0 “Animated Forest at dusk” by ShggothSlave (OpenGameArt).
    with zipfile.ZipFile(TMP / "cozy.zip") as archive:
        for slug, name in mapping.items():
            gif = TMP / f"{slug}.gif"
            gif.write_bytes(archive.read(name))
            frames, duration = gif_pixel(gif)
            save_anim(frames, slug, duration)
    woods = gif_frames(TMP / "woods.gif", 1280, 2, crop_black=True)
    save_anim(woods, "decidir", 180)


if __name__ == "__main__":
    main()
