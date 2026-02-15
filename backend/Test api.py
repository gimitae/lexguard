"""
바른계약 백엔드 API 테스트 스크립트
"""
import requests
import time

BASE_URL = "http://localhost:8000"

def test_health_check():
    """헬스체크 테스트"""
    print("🧪 헬스체크 테스트...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"   ✅ 상태: {response.json()}")
    return response.status_code == 200

def test_root():
    """루트 엔드포인트 테스트"""
    print("🧪 루트 엔드포인트 테스트...")
    response = requests.get(f"{BASE_URL}/")
    data = response.json()
    print(f"   ✅ 버전: {data['version']}")
    print(f"   ✅ 기능: {data['features']}")
    return response.status_code == 200

def test_templates():
    """템플릿 목록 테스트"""
    print("🧪 템플릿 목록 테스트...")
    response = requests.get(f"{BASE_URL}/api/templates")
    data = response.json()
    print(f"   ✅ 템플릿 개수: {len(data['templates'])}")
    return response.status_code == 200

def test_statistics():
    """통계 테스트"""
    print("🧪 통계 테스트...")
    response = requests.get(f"{BASE_URL}/api/statistics")
    data = response.json()
    print(f"   ✅ 총 분석: {data['totalAnalyses']}")
    return response.status_code == 200

def test_file_upload(file_path: str = None):
    """파일 업로드 테스트"""
    print("🧪 파일 업로드 테스트...")
    
    if file_path:
        # 실제 파일 사용
        try:
            with open(file_path, 'rb') as f:
                files = {'file': (file_path, f, 'application/pdf')}
                response = requests.post(f"{BASE_URL}/api/analyze", files=files)
        except FileNotFoundError:
            print(f"   ⚠️  파일을 찾을 수 없습니다: {file_path}")
            return False
    else:
        # 더미 파일 생성 (테스트용)
        print("   ℹ️  더미 파일로 테스트 (실제 파일이 제공되지 않음)")
        dummy_content = b"Sample contract content"
        files = {'file': ('test_contract.pdf', dummy_content, 'application/pdf')}
        response = requests.post(f"{BASE_URL}/api/analyze", files=files)
    
    if response.status_code == 200:
        data = response.json()
        print(f"   ✅ 분석 완료")
        print(f"   - 치명적 리스크: {data['risks']['critical']}")
        print(f"   - 주의 조항: {data['risks']['warning']}")
        print(f"   - 발견된 이슈: {len(data['details'])}개")
        if data.get('metadata'):
            print(f"   - 메타데이터: {data['metadata']}")
        return True
    else:
        print(f"   ❌ 에러: {response.status_code} - {response.text}")
        return False

def test_invalid_file():
    """잘못된 파일 업로드 테스트"""
    print("🧪 잘못된 파일 형식 테스트...")
    
    # .txt 파일 (허용되지 않음)
    files = {'file': ('test.txt', b"text content", 'text/plain')}
    response = requests.post(f"{BASE_URL}/api/analyze", files=files)
    
    if response.status_code == 400:
        print(f"   ✅ 예상대로 거부됨: {response.json()['detail']}")
        return True
    else:
        print(f"   ❌ 예상치 못한 응답: {response.status_code}")
        return False

def run_all_tests(test_file_path: str = None):
    """모든 테스트 실행"""
    print("=" * 50)
    print("🚀 바른계약 API 테스트 시작")
    print("=" * 50)
    print()
    
    tests = [
        ("헬스체크", test_health_check),
        ("루트 엔드포인트", test_root),
        ("템플릿 목록", test_templates),
        ("통계", test_statistics),
        ("파일 업로드", lambda: test_file_upload(test_file_path)),
        ("잘못된 파일", test_invalid_file),
    ]
    
    results = []
    for name, test_func in tests:
        try:
            success = test_func()
            results.append((name, success))
        except Exception as e:
            print(f"   ❌ 테스트 실패: {str(e)}")
            results.append((name, False))
        print()
        time.sleep(0.5)  # 서버 부하 방지
    
    # 결과 요약
    print("=" * 50)
    print("📊 테스트 결과 요약")
    print("=" * 50)
    
    for name, success in results:
        status = "✅ 성공" if success else "❌ 실패"
        print(f"{status} - {name}")
    
    success_count = sum(1 for _, success in results if success)
    total_count = len(results)
    
    print()
    print(f"총 {total_count}개 테스트 중 {success_count}개 성공")
    print(f"성공률: {success_count/total_count*100:.1f}%")
    
    if success_count == total_count:
        print("🎉 모든 테스트 통과!")
    else:
        print("⚠️  일부 테스트 실패")

if __name__ == "__main__":
    import sys
    
    # 명령줄 인자로 테스트 파일 경로 받기
    test_file = sys.argv[1] if len(sys.argv) > 1 else None
    
    if test_file:
        print(f"📄 테스트 파일: {test_file}")
    else:
        print("ℹ️  테스트 파일이 지정되지 않음 (더미 데이터 사용)")
    
    print()
    
    try:
        run_all_tests(test_file)
    except requests.exceptions.ConnectionError:
        print("❌ 서버에 연결할 수 없습니다.")
        print("   서버가 실행 중인지 확인하세요: python main.py")