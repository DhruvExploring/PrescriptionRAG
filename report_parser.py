from pdf2image import convert_from_path
from PIL import Image
import pytesseract
import json

pages=convert_from_path("docs/report2.pdf")
text=""
for page in pages:
    text+=pytesseract.image_to_string(page)
import re
import pandas as pd

pattern = r"""
(?P<test>[A-Za-z][A-Za-z ():/]*?)     
\s+
(?P<value><?\d+(?:\.\d+)?)             
\s+
(?P<unit>[A-Za-z/]+)                   
\s+
(?P<ref>
    <\s*\d+(?:\.\d+)?                 
    |
    \d+(?:\.\d+)?\s*[–-]\s*\d+(?:\.\d+)? 
)
"""

matches = re.finditer(pattern, text, re.VERBOSE)
data=[]
for m in matches:
    data.append(m.groupdict())
json.dump(data, open("report.json", "w"))

