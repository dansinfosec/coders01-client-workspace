"""Unit tests for the image downloader's pure helpers.

Covers URL resolution, srcset parsing, filtering, and collision-safe filename
generation (plus de-duplication keys and a bonus image-size sniff). No network
access; no images are downloaded.

Run from the image-downloader folder:
    python -m unittest discover -s tests -v
or:
    pytest -v
"""

import struct
import sys
import unittest
import zlib
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from image_downloader import (  # noqa: E402
    build_filename,
    canonical_image_key,
    descriptor_width,
    is_resized_variant,
    parse_srcset,
    resolve_url,
    sanitize_filename,
    should_filter,
    sniff_image_size,
    url_extension,
)

BASE = "https://example.com/blog/post"


class TestResolveUrl(unittest.TestCase):
    def test_absolute_is_preserved(self):
        self.assertEqual(
            resolve_url("https://cdn.example.com/a.jpg", BASE),
            "https://cdn.example.com/a.jpg",
        )

    def test_root_relative(self):
        self.assertEqual(
            resolve_url("/img/a.jpg", BASE), "https://example.com/img/a.jpg"
        )

    def test_document_relative(self):
        self.assertEqual(
            resolve_url("pic.jpg", BASE), "https://example.com/blog/pic.jpg"
        )

    def test_protocol_relative(self):
        self.assertEqual(
            resolve_url("//cdn.example.com/a.jpg", BASE),
            "https://cdn.example.com/a.jpg",
        )

    def test_fragment_dropped_query_kept(self):
        self.assertEqual(
            resolve_url("/a.jpg?v=2#x", BASE), "https://example.com/a.jpg?v=2"
        )

    def test_host_lowercased(self):
        self.assertEqual(
            resolve_url("https://CDN.Example.COM/A.JPG", BASE),
            "https://cdn.example.com/A.JPG",  # path case preserved
        )


class TestParseSrcset(unittest.TestCase):
    def test_width_descriptors(self):
        out = parse_srcset("a.jpg 480w, b.jpg 800w")
        self.assertEqual(out, [("a.jpg", "480w"), ("b.jpg", "800w")])

    def test_density_descriptors(self):
        out = parse_srcset("a.jpg 1x, b.jpg 2x")
        self.assertEqual(out, [("a.jpg", "1x"), ("b.jpg", "2x")])

    def test_bare_url(self):
        self.assertEqual(parse_srcset("a.jpg"), [("a.jpg", "")])

    def test_empty(self):
        self.assertEqual(parse_srcset(""), [])
        self.assertEqual(parse_srcset("   "), [])

    def test_extra_whitespace(self):
        out = parse_srcset("  a.jpg   480w ,  b.jpg 2x ")
        self.assertEqual(out, [("a.jpg", "480w"), ("b.jpg", "2x")])

    def test_descriptor_width_helper(self):
        self.assertEqual(descriptor_width("768w"), 768)
        self.assertIsNone(descriptor_width("2x"))
        self.assertIsNone(descriptor_width(""))


class TestCanonicalKeyAndVariants(unittest.TestCase):
    def test_wp_resize_variant_collapses_to_original(self):
        a = canonical_image_key("https://ex.com/wp/photo-1024x768.jpg")
        b = canonical_image_key("https://ex.com/wp/photo.jpg")
        self.assertEqual(a, b)

    def test_different_images_differ(self):
        a = canonical_image_key("https://ex.com/wp/photo.jpg")
        b = canonical_image_key("https://ex.com/wp/other.jpg")
        self.assertNotEqual(a, b)

    def test_query_and_scheme_ignored_in_key(self):
        a = canonical_image_key("http://EX.com/p/x-300x200.jpg?v=1")
        b = canonical_image_key("https://ex.com/p/x.jpg")
        self.assertEqual(a, b)

    def test_is_resized_variant(self):
        self.assertTrue(is_resized_variant("https://ex.com/a-225x300.jpg"))
        self.assertFalse(is_resized_variant("https://ex.com/a.jpg"))
        # A dimension-like token not immediately before the extension is not a suffix.
        self.assertFalse(is_resized_variant("https://ex.com/1920x1080-hero.jpg"))


class TestFiltering(unittest.TestCase):
    common = dict(
        root_host="example.com", formats=("jpg", "jpeg", "png", "webp", "avif"),
        min_dimension=100, include_external=False, include_ui=False,
    )

    def test_data_url_skipped(self):
        self.assertEqual(
            should_filter("data:image/png;base64,AAAA", width=None, height=None, **self.common),
            "data_url",
        )

    def test_off_domain_skipped(self):
        self.assertEqual(
            should_filter("https://other.com/a.jpg", width=None, height=None, **self.common),
            "off_domain",
        )

    def test_off_domain_allowed_when_external(self):
        opts = {**self.common, "include_external": True}
        self.assertIsNone(
            should_filter("https://other.com/a.jpg", width=500, height=500, **opts)
        )

    def test_svg_skipped(self):
        self.assertEqual(
            should_filter("https://example.com/icon.svg", width=None, height=None, **self.common),
            "svg",
        )

    def test_unsupported_format_skipped(self):
        self.assertEqual(
            should_filter("https://example.com/a.bmp", width=None, height=None, **self.common),
            "unsupported_format",
        )

    def test_ui_name_skipped(self):
        self.assertEqual(
            should_filter("https://example.com/uploads/logo.png", width=None, height=None, **self.common),
            "ui_name",
        )

    def test_ui_path_skipped(self):
        self.assertEqual(
            should_filter("https://example.com/wp-content/themes/x/hero.jpg",
                          width=None, height=None, **self.common),
            "ui_path",
        )

    def test_ui_kept_when_include_ui(self):
        opts = {**self.common, "include_ui": True}
        self.assertIsNone(
            should_filter("https://example.com/uploads/logo.png", width=400, height=400, **opts)
        )

    def test_tracking_pixel_skipped(self):
        self.assertEqual(
            should_filter("https://example.com/p.png", width=1, height=1, **self.common),
            "tracking_pixel",
        )

    def test_too_small_skipped(self):
        self.assertEqual(
            should_filter("https://example.com/thumb.jpg", width=54, height=55, **self.common),
            "too_small",
        )

    def test_large_content_image_passes(self):
        self.assertIsNone(
            should_filter("https://example.com/uploads/photo.jpg", width=1536, height=2048, **self.common)
        )

    def test_unknown_dimensions_pass_when_not_ui(self):
        self.assertIsNone(
            should_filter("https://example.com/uploads/photo.jpg", width=None, height=None, **self.common)
        )

    def test_min_dimension_zero_keeps_small(self):
        opts = {**self.common, "min_dimension": 0}
        self.assertIsNone(
            should_filter("https://example.com/uploads/small.jpg", width=10, height=10, **opts)
        )

    def test_url_extension_helper(self):
        self.assertEqual(url_extension("https://x.com/a/b.JPEG?y=1"), "jpeg")
        self.assertEqual(url_extension("https://x.com/a/b"), "")


class TestFilenameGeneration(unittest.TestCase):
    def test_preserves_basename(self):
        taken = {}
        self.assertEqual(
            build_filename("https://ex.com/uploads/IMG_7440.jpg", taken), "IMG_7440.jpg"
        )

    def test_sanitizes_unsafe_characters(self):
        name = build_filename("https://ex.com/a/My Photo (1).jpg", {})
        self.assertRegex(name, r"^[A-Za-z0-9._-]+\.jpg$")
        self.assertNotIn(" ", name)

    def test_collision_same_url_is_stable(self):
        taken = {}
        a = build_filename("https://ex.com/a/photo.jpg", taken)
        b = build_filename("https://ex.com/a/photo.jpg", taken)
        self.assertEqual(a, b)

    def test_collision_different_urls_get_unique_names(self):
        taken = {}
        a = build_filename("https://ex.com/a/photo.jpg", taken)  # photo.jpg
        b = build_filename("https://ex.com/b/photo.jpg", taken)  # different URL, same basename
        self.assertEqual(a, "photo.jpg")
        self.assertNotEqual(a, b)
        self.assertTrue(b.startswith("photo-") and b.endswith(".jpg"))

    def test_extensionless_gets_placeholder_ext(self):
        name = build_filename("https://ex.com/download", {})
        self.assertTrue(name.endswith(".img"))

    def test_sanitize_filename_empty(self):
        self.assertEqual(sanitize_filename("///"), "image")


class TestSniffImageSize(unittest.TestCase):
    def test_png(self):
        # Build a minimal valid PNG header (IHDR) for a 120x80 image.
        ihdr = struct.pack(">II", 120, 80) + b"\x08\x06\x00\x00\x00"
        chunk = struct.pack(">I", len(ihdr)) + b"IHDR" + ihdr
        chunk += struct.pack(">I", zlib.crc32(b"IHDR" + ihdr) & 0xFFFFFFFF)
        data = b"\x89PNG\r\n\x1a\n" + chunk
        self.assertEqual(sniff_image_size(data), (120, 80))

    def test_gif(self):
        data = b"GIF89a" + struct.pack("<HH", 200, 150) + b"\x00" * 20
        self.assertEqual(sniff_image_size(data), (200, 150))

    def test_unknown_returns_none(self):
        self.assertIsNone(sniff_image_size(b"not an image at all........"))


if __name__ == "__main__":
    unittest.main()
