from pypdf import PdfReader

reader = PdfReader("uploads/resume_sample.pdf")

text = ""

for page in reader.pages:
    page_text = page.extract_text()

    if page_text:
        text += page_text

print(text)