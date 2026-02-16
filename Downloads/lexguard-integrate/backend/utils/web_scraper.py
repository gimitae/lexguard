import requests
from bs4 import BeautifulSoup
import json
import os
import re


def scrape_labor_laws():
    url = "https://majunny.github.io/rule/"

    try:
        print(f"접속 중: {url}")
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        response.encoding = 'utf-8'

        soup = BeautifulSoup(response.text, 'html.parser')

        laws = []

        # h1과 p 태그 쌍으로 처리
        chapters = soup.find_all('h1')

        for chapter in chapters:
            chapter_title = chapter.get_text(strip=True)
            print(f"\n처리 중: {chapter_title}")

            # h1 다음의 p 태그 찾기
            next_p = chapter.find_next('p')

            if next_p:
                full_text = next_p.get_text()

                # "제N조"로 조항 분리
                articles = re.split(r'(제\d+조)', full_text)

                # 분리된 조항 처리
                for i in range(1, len(articles), 2):
                    if i + 1 < len(articles):
                        article_id = articles[i].strip()
                        content = articles[i + 1].strip()

                        # 조항 제목 추출 (괄호 안 내용)
                        title_match = re.search(r'\(([^)]+)\)', content)
                        title = title_match.group(1) if title_match else article_id

                        # 내용 정리 (첫 200자 또는 첫 문장)
                        content_clean = content.split('\n')[0][:500]

                        if len(content_clean) > 10:
                            law = {
                                "article_id": f"근로기준법 {article_id}",
                                "title": title,
                                "content": content_clean
                            }
                            laws.append(law)
                            print(f"  추출: {article_id} - {title[:30]}")

        print(f"\n총 {len(laws)}개 조항 추출 완료")
        return laws

    except Exception as e:
        print(f"스크래핑 실패: {str(e)}")
        import traceback
        traceback.print_exc()
        return []


def save_to_json(laws):
    current_dir = os.path.dirname(__file__)
    data_dir = os.path.join(current_dir, '..', 'data')
    os.makedirs(data_dir, exist_ok=True)

    output_file = os.path.join(data_dir, 'labor_law_articles.json')

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(laws, f, ensure_ascii=False, indent=2)

    print(f"\n저장 완료: {output_file}")
    print(f"총 {len(laws)}개 조항 저장")

    # 샘플 출력
    if laws:
        print("\n샘플 데이터:")
        print(json.dumps(laws[0], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    print("근로기준법 스크래핑 시작\n")
    laws = scrape_labor_laws()

    if laws:
        save_to_json(laws)
        print("\n성공!")
    else:
        print("\n실패 - 조항을 찾을 수 없습니다")