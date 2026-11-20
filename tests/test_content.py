"""Public website content checks. Run: python3 -B -m unittest discover -s tests."""
import re
import unittest
from html import unescape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / 'index.html').read_text()


def text(markup):
    return ' '.join(unescape(re.sub(r'<[^>]+>', ' ', markup)).split())


def block(tag, name):
    match = re.search(r'<' + tag + r'\b[^>]*id="' + name + r'"[^>]*>(.*?)</' + tag + '>', HTML, re.S)
    return text(match[1]) if match else ''


class PersonalWebsiteTests(unittest.TestCase):
    def test_custom_domain_kept(self):
        self.assertEqual((ROOT / 'CNAME').read_text().strip(), 'raunaksingwi.com')

    def test_no_external_runtime_dependencies(self):
        self.assertNotRegex(HTML, r'<script[^>]+src="https?://')
        self.assertNotRegex(HTML, r'<link[^>]+rel="stylesheet"[^>]+href="https?://')

    def test_local_assets_exist(self):
        for ref in re.findall(r'(?:src|href|srcset)="((?:assets/)[^"#]+)"', HTML):
            self.assertTrue((ROOT / ref).is_file(), ref)

    def test_ravix_is_the_only_project(self):
        ravix = block('section', 'ravix')
        for phrase in ('Ravix', 'Claude Code', 'Codex', 'now multiplayer', 'Rushabh'):
            self.assertIn(phrase, ravix)
        self.assertIn('href="https://ravix.sh"', HTML)
        for stale in ('Ravioli', 'Jino', 'tryravioli.com', 'ravi.app', 'Project Santa Cruz', 'Data Removal'):
            self.assertNotIn(stale, HTML)

    def test_speaking_rail(self):
        rail = block('aside', 'stage')
        self.assertIn('Public speaking', rail)
        self.assertEqual(len(re.findall(r'<li>', re.search(r'<ol class="awards">(.*?)</ol>', HTML, re.S)[1])), 11)
        for phrase in ('Jamia Millia Islamia', 'IIM Bangalore', 'Orator of the Year', 'Toastmasters'):
            self.assertIn(phrase, rail)

    def test_contact_links(self):
        for url in ('mailto:raunaksingwi7@gmail.com', 'https://www.linkedin.com/in/raunak-singwi/',
                    'https://x.com/raunak_singwi', 'https://www.instagram.com/raunaksingwi/',
                    'https://www.youtube.com/@raunaksingwi', 'https://meet.google.com/uqv-ikta-vda',
                    'https://github.com/raunaksingwi'):
            self.assertIn('href="' + url + '"', HTML)

    def test_meta(self):
        for needle in ('og:image', 'twitter:card', 'rel="canonical"', 'name="description"', 'favicon.svg'):
            self.assertIn(needle, HTML)

    def test_shortcut_paths_are_not_files(self):
        for path in ('li', 'insta', 'x', 'meets', 'yt'):
            self.assertFalse((ROOT / path).exists())
            self.assertFalse((ROOT / (path + '.html')).exists())


if __name__ == '__main__':
    unittest.main()
