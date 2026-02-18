# backend/utils/check_website.py
import requests
from bs4 import BeautifulSoup

url = "https://majunny.github.io/rule/"
response = requests.get(url)
soup = BeautifulSoup(response.text, 'html.parser')

# HTML 구조 확인
print("=== 전체 HTML 미리보기 ===")
print(soup.prettify()[:2000])

print("\n=== 모든 태그 목록 ===")
tags = set([tag.name for tag in soup.find_all()])
print(tags)

print("\n=== h1, h2, h3 태그 ===")
for h in soup.find_all(['h1', 'h2', 'h3']):
    print(f"{h.name}: {h.text[:100]}")

print("\n=== class 속성 목록 ===")
classes = set()
for tag in soup.find_all(class_=True):
    classes.update(tag['class'])
print(classes)