"""Public website content checks. Run: python3 -B -m unittest discover -s tests."""
import re
import unittest
from html import unescape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / 'index.html').read_text()

def text(markup):
    return ' '.join(unescape(re.sub(r'<[^>]+>', ' ', markup)).split())

def section(name):
    match = re.search(r'<section\b[^>]*id="' + name + r'"[^>]*>(.*?)</section>', HTML, re.S)
    return text(match[1]) if match else ''

class PersonalWebsiteTests(unittest.TestCase):
    def test_reading_order(self):
        ids = re.findall(r'<section\b[^>]*id="([^"]+)"', HTML)
        self.assertEqual(ids, ['hero', 'now', 'work', 'about', 'contact'])

    def test_personal_intro(self):
        self.assertIn('collaborative AI', section('hero'))
        self.assertIn('Google Docs moment', section('hero'))
        self.assertIn('Raunak Singwi', section('hero'))
        self.assertNotIn('Problem Solver', section('hero'))

    def test_current_work(self):
        for phrase in ('Ravioli', 'Jino', 'group', 'South Park Commons'):
            self.assertIn(phrase, section('now'))
        self.assertIn('href="https://tryravioli.com"', HTML)
        self.assertIn('href="https://ravi.app"', HTML)
        self.assertIn('identities for AI agents', section('now'))
        for stale in ('Ask me about Ravi', 'Before Ravi,'):
            self.assertNotIn(stale, text(HTML))

    def test_selected_work_retains_evidence(self):
        for phrase in ('Cloaked', '120', 'Project Santa Cruz', 'Office of the CTO'):
            self.assertIn(phrase, section('work'))
        self.assertIn('https://www.cloaked.com/features/data-removal', HTML)
        self.assertIn('https://www.youtube.com/watch?v=deMUBez9Nrc', HTML)

    def test_personal_background(self):
        for phrase in ('debate', 'Toastmasters', 'Salesforce', 'VMware', '12 US patents'):
            self.assertIn(phrase, section('about'))

    def test_no_resume_sections_or_ranking_language(self):
        for phrase in ('Work Experience', 'Key Achievements', 'acceptance rate', 'US O1 Visa', 'Show More'):
            self.assertNotIn(phrase, text(HTML))
        self.assertNotIn('id="skills"', HTML)
        self.assertNotIn("getElementById('expand-experience')", HTML)

    def test_contact_and_resume(self):
        self.assertIn('mailto:raunaksingwi7@gmail.com', HTML)
        self.assertIn('Get in touch', section('contact'))
        self.assertRegex(HTML, r'href="Raunak_Singwi_Resume.pdf"[^>]*download')
        self.assertTrue((ROOT / 'Raunak_Singwi_Resume.pdf').is_file())

    def test_no_em_dashes(self):
        self.assertNotIn(chr(0x2014), unescape(HTML))

    def test_internal_links_have_targets(self):
        ids = set(re.findall(r'\bid="([^"]+)"', HTML))
        for target in re.findall(r'href="#([^"]+)"', HTML):
            self.assertIn(target, ids)
