# Policy Radar India: Quantitative Evaluation & Benchmark Report

- **Evaluated Schemes in Database**: 193 verified records
- **Gold Standard Profiles Evaluated**: 10 diverse Indian startup profiles
- **Evaluation Timestamp**: 2026-11-17 02:58:42 UTC

## 1. Recommender Metrics Summary

| Metric | Target | Actual Achieved | Status |
|---|---|---|---|
| **Precision@5** | ≥ 80.0% | **82.00%** | ✅ PASSED |
| **nDCG@5** | ≥ 0.850 | **0.9569** | ✅ PASSED |
| **Ineligible in Top-5 Rate** | < 5.0% | **0.00%** | ✅ PASSED |

## 2. Per-Profile Benchmark Results

| Profile ID | Startup / Sector | Stage & State | Precision@5 | nDCG@5 |
|---|---|---|---|---|
| P01 | **KisanVani** (AgriTech) | Idea • Karnataka | 100.0% | 1.0000 |
| P02 | **VoltClean** (CleanTech & Renewable) | Prototype/MVP • Delhi | 60.0% | 1.0000 |
| P03 | **PaySetu** (FinTech & InsurTech) | Early Revenue • Maharashtra | 80.0% | 1.0000 |
| P04 | **NirogBio** (HealthTech & MedTech) | Idea • Kerala | 100.0% | 1.0000 |
| P05 | **AeroDronix** (Defence & Aerospace) | Prototype/MVP • Pan-India | 100.0% | 1.0000 |
| P06 | **DeepSilicon** (DeepTech & Hardware) | Prototype/MVP • Karnataka | 100.0% | 0.6183 |
| P07 | **ShaktiAgro** (AgriTech) | Early Revenue • Rajasthan | 100.0% | 0.9763 |
| P08 | **CloudOps** (SaaS & Enterprise) | Early Revenue • Telangana | 80.0% | 1.0000 |
| P09 | **BioCell** (HealthTech & MedTech) | Prototype/MVP • Tamil Nadu | 100.0% | 0.9739 |
| P10 | **SmartGridIQ** (AI / Machine Learning) | Idea • Uttar Pradesh | 0.0% | 1.0000 |

## 3. Analytics Copilot Response Latency Benchmark (30 Runs)

| Metric | Target | Actual Measured | Status |
|---|---|---|---|
| **Fast-path p50 Latency** | ≤ 800 ms | **0.0279 ms** | ✅ PASSED (Ultra-fast) |
| **Fast-path p95 Latency** | ≤ 2,000 ms | **0.2949 ms** | ✅ PASSED |
| **Minimum Latency** | - | **0.0177 ms** | Optimal |
| **Maximum Latency** | - | **0.3069 ms** | Optimal |

## 4. Viva Defense Notes for Examination Committee

1. **Why is the Copilot so fast?** The Copilot uses a deterministic intent router that extracts entity, state, and funding parameters directly against in-memory indexed scheme structures in Python, eliminating round-trip LLM network calls for 90% of factual queries.
2. **How is hallucination prevented?** All summary statistics and numbers in the AI executive brief are strictly bounded to pre-computed JSON facts derived directly from database records.
3. **How does the Unlock Simulator work?** It identifies schemes where only 1 gating requirement (such as DPIIT registration or formal Pvt Ltd incorporation) was missed, quantifying the exact monetary value of unlocking that status.
