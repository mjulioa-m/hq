from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parents[1] / "public" / "icons"
FONT = Path(r"C:\Windows\Fonts\segoeuib.ttf")
BG = "#1c1410"
INK = "#f6efe8"


def draw_mark(size: int, scale: float) -> Image.Image:
    image = Image.new("RGB", (size, size), BG)
    draw = ImageDraw.Draw(image)
    font = ImageFont.truetype(str(FONT), int(size * scale))
    text = "HQ"
    box = draw.textbbox((0, 0), text, font=font)
    width = box[2] - box[0]
    height = box[3] - box[1]
    x = (size - width) / 2 - box[0]
    y = (size - height) / 2 - box[1]
    draw.text((x, y), text, font=font, fill=INK)
    return image


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    draw_mark(192, 0.42).save(OUT / "icon-192.png")
    draw_mark(512, 0.42).save(OUT / "icon-512.png")
    draw_mark(512, 0.28).save(OUT / "icon-512-maskable.png")
    draw_mark(180, 0.42).save(OUT / "apple-touch-icon.png")


if __name__ == "__main__":
    main()
