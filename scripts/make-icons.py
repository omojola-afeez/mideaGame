from PIL import Image, ImageDraw
import sys

def make_icon(size, maskable, path):
    S = 512
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    pad = 0 if not maskable else 48
    r = 96
    d.rounded_rectangle([pad, pad, S - pad, S - pad], radius=r, fill=(7, 18, 43, 255))
    d.rounded_rectangle(
        [pad + 20, pad + 20, S - pad - 20, S - pad - 20],
        radius=r - 12,
        outline=(40, 64, 111, 255),
        width=6,
    )
    pts = [(110, 320), (160, 320), (185, 200), (225, 375), (260, 265), (300, 340), (340, 320)]
    d.line(pts, fill=(56, 217, 245, 255), width=34, joint="curve")
    d.line(pts, fill=(103, 183, 255, 130), width=14, joint="curve")
    d.ellipse([352, 258, 402, 308], fill=(255, 200, 87, 255))
    d.ellipse([366, 272, 388, 294], fill=(255, 236, 160, 255))
    img = img.resize((size, size), Image.LANCZOS)
    img.save(path)

OUT = "/Users/exquis/Documents/Default Project/brainwave-quest/public"
make_icon(512, False, f"{OUT}/icon-512.png")
make_icon(192, False, f"{OUT}/icon-192.png")
make_icon(512, True, f"{OUT}/maskable-512.png")
make_icon(192, True, f"{OUT}/maskable-192.png")
make_icon(180, False, f"{OUT}/apple-touch-icon.png")
print("icons written")
