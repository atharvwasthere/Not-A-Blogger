import io

from PIL import Image

from services.halftone import HEIGHT, INVERT_BELOW, WIDTH, render_halftone, should_invert


def ink(image: Image.Image) -> int:
    """Total alpha: how much ink the print carries."""
    return sum(image.getchannel("A").getdata())


def test_output_size_and_mode():
    out = render_halftone(Image.new("RGB", (400, 300), "white"))
    assert out.size == (WIDTH, HEIGHT)
    assert out.mode == "RGBA"


def test_white_image_produces_no_ink():
    assert ink(render_halftone(Image.new("RGB", (800, 500), "white"), "never")) == 0


def test_black_image_produces_ink():
    assert ink(render_halftone(Image.new("RGB", (800, 500), "black"), "never")) > 0


def test_ink_lives_only_in_the_alpha_channel():
    out = render_halftone(Image.new("RGB", (800, 500), "black"), "never")
    assert out.getchannel("R").getextrema() == (0, 0)


def test_auto_inverts_below_the_threshold_only():
    assert should_invert(INVERT_BELOW - 1, "auto") is True
    assert should_invert(INVERT_BELOW, "auto") is False
    assert should_invert(250, "always") is True
    assert should_invert(10, "never") is False


def test_auto_prints_a_dark_screenshot_as_a_negative():
    # A dark frame with a light block: inverted, the light block becomes the ink.
    source = Image.new("L", (960, 600), 20)
    source.paste(230, (380, 200, 580, 400))
    out = render_halftone(source, "auto")
    alpha = out.getchannel("A")
    assert alpha.crop((430, 250, 530, 350)).getextrema()[1] > 0  # the block is inked
    assert alpha.crop((20, 20, 120, 120)).getextrema()[1] == 0  # the dark background is paper


def test_never_keeps_a_mid_grey_image_un_inverted():
    # Mid grey sits under the auto threshold; with "never" the dark half must stay the inked half.
    source = Image.new("L", (960, 600), 128)
    source.paste(40, (0, 0, 480, 600))
    alpha = render_halftone(source, "never").getchannel("A")
    left = sum(alpha.crop((40, 40, 440, 560)).getdata())
    right = sum(alpha.crop((520, 40, 920, 560)).getdata())
    assert left > right


def test_transparent_background_prints_as_paper():
    # A diagram export: transparent (stored as black) background, one black stroke.
    diagram = Image.new("RGBA", (800, 500), (0, 0, 0, 0))
    for x in range(100, 700):
        diagram.putpixel((x, 250), (0, 0, 0, 255))
    blank = ink(render_halftone(Image.new("RGB", (800, 500), "white"), "never"))
    printed = ink(render_halftone(diagram, "never"))
    solid = ink(render_halftone(Image.new("RGB", (800, 500), "black"), "never"))
    assert blank < printed < solid / 10


def test_exif_rotation_is_applied():
    photo = Image.new("RGB", (800, 400), "white")
    for x in range(0, 400):
        for y in range(0, 400):
            photo.putpixel((x, y), (0, 0, 0))  # left half dark
    exif = photo.getexif()
    exif[0x0112] = 3  # rotated 180 degrees: the dark half belongs on the right
    rotated = Image.open(_roundtrip(photo, exif))
    out = render_halftone(rotated, "never").getchannel("A")
    left = sum(out.crop((0, 0, 480, 600)).getdata())
    right = sum(out.crop((480, 0, 960, 600)).getdata())
    assert right > left


def _roundtrip(image, exif):
    buffer = io.BytesIO()
    image.save(buffer, format="JPEG", exif=exif)
    buffer.seek(0)
    return buffer
