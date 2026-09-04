"""Résumé content contract. Run with python3 -m unittest discover -s tests."""
import re
import unittest
from html import unescape
from pathlib import Path


HTML = (Path(__file__).resolve().parents[1] / "index.html").read_text()


def text(markup):
    return " ".join(unescape(re.sub(r"<[^>]+>", " ", markup)).split())


def section(name):
    return text(re.search(r'<section\b[^>]*id="' + name + r'"[^>]*>(.*?)</section>', HTML, re.S)[1])


class ResumeContentTests(unittest.TestCase):
    def test_founder_positioning(self):
        self.assertIn("Founder", re.search(r"<title>(.*?)</title>", HTML)[1])
        for name in ("hero", "profile"):
            self.assertIn("Founder & CEO", section(name))
            self.assertIn("Ravi", section(name))

    def test_current_roles_and_funding(self):
        experience = section("experience")
        for expected in ("January 2026 - Present", "March 2026 - Present",
                         "November 2025 - March 2026", "South Park Commons", "$400K"):
            self.assertIn(expected, experience)
        self.assertLess(experience.index("Founder & CEO"), experience.index("Cloaked"))

    def test_cloaked_dates_and_impact(self):
        experience = section("experience")
        for expected in ("January 2023 - July 2025", "3 to 15", "120+ data broker sites", "flagship"):
            self.assertIn(expected, experience)
        self.assertNotIn("January 2023 - Present", experience)

    def test_combined_vmware_history(self):
        experience = section("experience")
        self.assertEqual(experience.count("Member of Technical Staff 1 - 3"), 1)
        self.assertEqual(len(re.findall(r"<h3>Member of Technical Staff", HTML)), 1)
        for expected in ("July 2018 - May 2022", "Office of the CTO", "Tanzu", "unit testing", "January 2018 - July 2018"):
            self.assertIn(expected, experience)

    def test_grouped_skills(self):
        skills = section("skills")
        for expected in ("Languages", "Frameworks & APIs", "Infrastructure", "Python", "Go", "SQL", "Java",
                         "Django", "FastAPI", "GraphQL", "REST APIs", "Docker", "Kubernetes", "AWS", "Cloudflare", "PostgreSQL", "Redis"):
            self.assertIn(expected, skills)

    def test_achievements(self):
        achievements = section("achievements")
        for expected in ("Published 12 US patents", "cloud infrastructure", "edge computing", "container security", "30,000+", "<5%"):
            self.assertIn(expected, achievements)

    def test_speaking_education_and_footer(self):
        speaking = section("public-speaking")
        for expected in ("Jamia Millia Islamia", "IIM Bangalore", "IBC Titans", "Orator of the Year"):
            self.assertIn(expected, speaking)
        markup = re.search(r'id="public-speaking".*?</section>', HTML, re.S)[0]
        self.assertLessEqual(markup.count("<li "), 4)
        self.assertIn("August 2014 - May 2018", section("education"))
        self.assertIn("© 2026 Raunak Singwi", text(HTML))

    def test_salesforce_preserved(self):
        experience = section("experience")
        self.assertIn("May 2022 - January 2023", experience)
        self.assertIn("200M+ tests daily", experience)
