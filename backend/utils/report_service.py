# utils/report_service.py

from typing import List, Dict
from datetime import datetime


def generate_html_report(analysis_results: List[Dict], raw_text: str, filename: str = "contract") -> str:
    """
    분석 결과를 HTML 리포트로 생성
    
    Args:
        analysis_results: GPT 분석 결과 리스트
        raw_text: 원본 계약서 텍스트
        filename: 원본 파일명
    
    Returns:
        HTML 문자열
    """
    
    # 통계 계산
    stats = {
        "CRITICAL": 0,
        "WARNING": 0,
        "DISADVANTAGE": 0,
        "SAFE": 0
    }
    
    for result in analysis_results:
        severity = result.get("severity", "SAFE")
        stats[severity] = stats.get(severity, 0) + 1
    
    # HTML 템플릿
    html_content = f"""<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>계약서 분석 리포트 - {filename}</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
            line-height: 1.6;
            color: #1e293b;
            background: #f8fafc;
            padding: 20px;
        }}
        
        .container {{
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }}
        
        .header {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }}
        
        .header h1 {{
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 10px;
        }}
        
        .header p {{
            opacity: 0.9;
            font-size: 14px;
        }}
        
        .stats {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 40px;
            background: #f8fafc;
        }}
        
        .stat-card {{
            background: white;
            padding: 24px;
            border-radius: 12px;
            text-align: center;
            border: 2px solid #e2e8f0;
        }}
        
        .stat-card.critical {{
            border-color: #ef4444;
            background: #fef2f2;
        }}
        
        .stat-card.warning {{
            border-color: #f97316;
            background: #fff7ed;
        }}
        
        .stat-card.disadvantage {{
            border-color: #eab308;
            background: #fefce8;
        }}
        
        .stat-card.safe {{
            border-color: #22c55e;
            background: #f0fdf4;
        }}
        
        .stat-number {{
            font-size: 48px;
            font-weight: 800;
            margin-bottom: 8px;
        }}
        
        .stat-card.critical .stat-number {{ color: #dc2626; }}
        .stat-card.warning .stat-number {{ color: #ea580c; }}
        .stat-card.disadvantage .stat-number {{ color: #ca8a04; }}
        .stat-card.safe .stat-number {{ color: #16a34a; }}
        
        .stat-label {{
            font-size: 12px;
            text-transform: uppercase;
            font-weight: 700;
            opacity: 0.6;
            letter-spacing: 0.05em;
        }}
        
        .content {{
            padding: 40px;
        }}
        
        .section-title {{
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 24px;
            padding-bottom: 12px;
            border-bottom: 3px solid #667eea;
        }}
        
        .risk-item {{
            background: white;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 20px;
            transition: all 0.2s;
        }}
        
        .risk-item:hover {{
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }}
        
        .risk-item.critical {{
            border-left: 6px solid #ef4444;
            background: #fef2f2;
        }}
        
        .risk-item.warning {{
            border-left: 6px solid #f97316;
            background: #fff7ed;
        }}
        
        .risk-item.disadvantage {{
            border-left: 6px solid #eab308;
            background: #fefce8;
        }}
        
        .risk-header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
        }}
        
        .severity-badge {{
            display: inline-block;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            color: white;
        }}
        
        .severity-badge.critical {{ background: #dc2626; }}
        .severity-badge.warning {{ background: #ea580c; }}
        .severity-badge.disadvantage {{ background: #ca8a04; }}
        
        .clause-number {{
            font-size: 12px;
            font-weight: 700;
            color: #94a3b8;
        }}
        
        .original-text {{
            font-size: 15px;
            font-weight: 600;
            margin-bottom: 12px;
            color: #1e293b;
            line-height: 1.6;
        }}
        
        .explanation {{
            font-size: 14px;
            color: #475569;
            margin-bottom: 16px;
            line-height: 1.7;
        }}
        
        .suggestion {{
            background: #ede9fe;
            border-left: 4px solid #8b5cf6;
            padding: 16px;
            border-radius: 8px;
            margin-top: 12px;
        }}
        
        .suggestion-label {{
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            color: #7c3aed;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 6px;
        }}
        
        .suggestion-text {{
            font-size: 14px;
            color: #1e293b;
            font-weight: 500;
        }}
        
        .footer {{
            background: #f8fafc;
            padding: 24px 40px;
            text-align: center;
            font-size: 13px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
        }}
        
        @media print {{
            body {{
                background: white;
                padding: 0;
            }}
            
            .container {{
                box-shadow: none;
            }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📋 계약서 분석 리포트</h1>
            <p>생성일시: {datetime.now().strftime('%Y년 %m월 %d일 %H:%M')}</p>
            <p>파일명: {filename}</p>
        </div>
        
        <div class="stats">
            <div class="stat-card critical">
                <div class="stat-number">{stats['CRITICAL']}</div>
                <div class="stat-label">Critical</div>
            </div>
            <div class="stat-card warning">
                <div class="stat-number">{stats['WARNING']}</div>
                <div class="stat-label">Warning</div>
            </div>
            <div class="stat-card disadvantage">
                <div class="stat-number">{stats['DISADVANTAGE']}</div>
                <div class="stat-label">Disadvantage</div>
            </div>
            <div class="stat-card safe">
                <div class="stat-number">{stats['SAFE']}</div>
                <div class="stat-label">Safe</div>
            </div>
        </div>
        
        <div class="content">
            <h2 class="section-title">🔍 위험 조항 상세 분석</h2>
"""
    
    # 위험 조항만 필터링
    risky_items = [r for r in analysis_results if r.get("severity") != "SAFE"]
    
    if not risky_items:
        html_content += """
            <div style="text-align: center; padding: 60px 20px; color: #16a34a;">
                <div style="font-size: 48px; margin-bottom: 16px;">✅</div>
                <h3 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">문제 없음</h3>
                <p style="font-size: 16px; opacity: 0.8;">모든 조항이 안전합니다.</p>
            </div>
"""
    else:
        for item in risky_items:
            severity = item.get("severity", "DISADVANTAGE").lower()
            clause_num = item.get("clause_number", "?")
            original = item.get("original_text", "")
            
            # 다국어 필드 처리
            explanation = item.get("explanation", {})
            if isinstance(explanation, dict):
                explanation_text = explanation.get("ko", "")
            else:
                explanation_text = str(explanation)
            
            suggestion = item.get("suggestion", {})
            if isinstance(suggestion, dict):
                suggestion_text = suggestion.get("ko", "")
            else:
                suggestion_text = str(suggestion)
            
            html_content += f"""
            <div class="risk-item {severity}">
                <div class="risk-header">
                    <span class="severity-badge {severity}">{item.get('severity', 'DISADVANTAGE')}</span>
                    <span class="clause-number">#{clause_num}</span>
                </div>
                <div class="original-text">"{original[:200]}{'...' if len(original) > 200 else ''}"</div>
                <div class="explanation">{explanation_text}</div>
"""
            
            if suggestion_text and suggestion_text != "해당 없음" and suggestion_text != "N/A":
                html_content += f"""
                <div class="suggestion">
                    <div class="suggestion-label">💡 개선 제안</div>
                    <div class="suggestion-text">{suggestion_text}</div>
                </div>
"""
            
            html_content += """
            </div>
"""
    
    html_content += f"""
        </div>
        
        <div class="footer">
            <p><strong>LexGuard</strong> - AI 기반 계약서 분석 서비스</p>
            <p style="margin-top: 8px; font-size: 12px;">본 리포트는 참고용이며, 법적 효력을 갖지 않습니다. 중요한 결정은 전문가와 상담하시기 바랍니다.</p>
        </div>
    </div>
</body>
</html>
"""
    
    return html_content
