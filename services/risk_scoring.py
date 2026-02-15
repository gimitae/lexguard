# services/risk_scoring.py

def calculate_total_risk(results):

    score = 0

    for r in results:
        if r["violation"]:
            if r["severity"] == "HIGH":
                score += 30
            elif r["severity"] == "MEDIUM":
                score += 15
            elif r["severity"] == "LOW":
                score += 5

    return min(score, 100)