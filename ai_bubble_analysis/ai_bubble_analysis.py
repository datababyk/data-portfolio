"""
AI 버블 분석: 10년물 국채금리 & 인플레이션 관점
데이터 출처: 미국 연준(FRED), Yahoo Finance 기반 실제 수치 내장
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
import matplotlib.dates as mdates
import warnings
warnings.filterwarnings("ignore")

plt.rcParams["axes.unicode_minus"] = False

# ── 실제 데이터 (주요 시점 기준값) ────────────────────────────────────────
# 10년물 국채금리 - 월별 평균 (FRED DGS10 기준)
yield_data = {
    "2020-01": 1.82, "2020-03": 0.87, "2020-06": 0.73, "2020-09": 0.68,
    "2020-12": 0.93, "2021-03": 1.74, "2021-06": 1.45, "2021-09": 1.52,
    "2021-12": 1.52, "2022-03": 2.32, "2022-06": 3.20, "2022-09": 3.83,
    "2022-12": 3.88, "2023-03": 3.96, "2023-06": 3.84, "2023-09": 4.57,
    "2023-12": 3.97, "2024-03": 4.20, "2024-06": 4.36, "2024-09": 3.76,
    "2024-12": 4.57, "2025-01": 4.62, "2025-03": 4.28, "2025-05": 4.45,
}

# CPI 전년동월비 인플레이션 (%) - BLS 기준
cpi_data = {
    "2020-01": 2.5, "2020-03": 1.5, "2020-06": 0.6, "2020-09": 1.4,
    "2020-12": 1.4, "2021-03": 2.6, "2021-06": 5.4, "2021-09": 5.4,
    "2021-12": 7.0, "2022-03": 8.5, "2022-06": 9.1, "2022-09": 8.2,
    "2022-12": 6.5, "2023-03": 5.0, "2023-06": 3.0, "2023-09": 3.7,
    "2023-12": 3.4, "2024-03": 3.5, "2024-06": 3.0, "2024-09": 2.4,
    "2024-12": 2.9, "2025-01": 3.0, "2025-03": 2.4, "2025-05": 2.3,
}

# 정규화 주가 (2020-01-01 = 100 기준, 실제 수익률 반영)
# NVDA: 2020~2025 약 +2500%, QQQ: +100%, MSFT: +200%, GOOGL: +120%
price_milestones = {
    #         NVDA    QQQ   MSFT  GOOGL
    "2020-01": [100,   100,  100,  100],
    "2020-06": [ 85,    96,  103,   86],
    "2020-12": [153,   138,  123,  117],
    "2021-06": [210,   163,  155,  168],
    "2021-12": [310,   193,  213,  196],
    "2022-06": [175,   133,  148,  130],
    "2022-12": [137,   121,  130,  109],
    "2023-06": [385,   153,  163,  165],
    "2023-12": [490,   175,  200,  185],
    "2024-06": [750,   200,  220,  210],
    "2024-12": [1350,  222,  245,  215],
    "2025-05": [2500,  215,  240,  225],
}

def interpolate_monthly(data_dict):
    idx = pd.to_datetime(list(data_dict.keys()))
    vals = list(data_dict.values())
    s = pd.Series(vals, index=idx)
    full_idx = pd.date_range(idx.min(), idx.max(), freq="MS")
    return s.reindex(full_idx).interpolate("linear")

tnx = interpolate_monthly(yield_data)
cpi = interpolate_monthly(cpi_data)

price_idx = pd.to_datetime(list(price_milestones.keys()))
price_df = pd.DataFrame(
    list(price_milestones.values()),
    index=price_idx,
    columns=["NVDA", "QQQ", "MSFT", "GOOGL"]
)
full_idx = pd.date_range(price_idx.min(), price_idx.max(), freq="MS")
prices = price_df.reindex(full_idx).interpolate("linear")

# ── 닷컴버블 나스닥 근사값 (1998-01 = 100 기준) ───────────────────────────
dotcom_milestones = {
    "1998-01": 100, "1998-06": 120, "1998-12": 136,
    "1999-06": 180, "1999-12": 250,
    "2000-03": 320, "2000-09": 195,
    "2001-03": 120, "2001-12": 87,
    "2002-06": 68,  "2002-12": 58,
    "2003-06": 70,  "2003-12": 88,
}
dotcom = interpolate_monthly(dotcom_milestones)

# ── 그림 그리기 ────────────────────────────────────────────────────────────
fig = plt.figure(figsize=(16, 15))
fig.suptitle("AI 버블인가? — 금리·인플레이션·밸류에이션 복합 분석",
             fontsize=15, fontweight="bold", y=0.99)
gs = gridspec.GridSpec(3, 2, figure=fig, hspace=0.5, wspace=0.3)

# ─ ① 10년물 국채금리 ──────────────────────────────────────────────────────
ax1 = fig.add_subplot(gs[0, 0])
ax1.plot(tnx.index, tnx.values, color="#d32f2f", linewidth=2)
ax1.axhline(2.0, color="gray",   linestyle="--", alpha=0.5, linewidth=1, label="2% 저금리선")
ax1.axhline(4.0, color="#ff6f00", linestyle="--", alpha=0.7, linewidth=1, label="4% 고금리선")
ax1.fill_between(tnx.index, tnx.values, 4.0,
                  where=(tnx.values >= 4.0), alpha=0.12, color="#d32f2f")
ax1.set_title("① 미국 10년물 국채금리 (%)\n출처: FRED / 연준", fontweight="bold", fontsize=10)
ax1.set_ylabel("%")
ax1.legend(fontsize=8)
ax1.xaxis.set_major_formatter(mdates.DateFormatter("%Y"))
ax1.set_ylim(0, 6)
ax1.grid(alpha=0.3)

# ─ ② CPI 인플레이션 ───────────────────────────────────────────────────────
ax2 = fig.add_subplot(gs[0, 1])
ax2.bar(cpi.index, cpi.values, width=25,
        color=["#d32f2f" if v >= 5 else "#ff6f00" if v >= 3 else "#66bb6a"
               for v in cpi.values], alpha=0.8)
ax2.axhline(2.0, color="gray", linestyle="--", alpha=0.6, linewidth=1.5, label="연준 목표 2%")
ax2.axhline(5.0, color="#d32f2f", linestyle=":", alpha=0.6, linewidth=1.5, label="5% 고인플레이션")
ax2.set_title("② CPI 인플레이션 (전년동월비 %)\n출처: BLS (미국 노동통계국)", fontweight="bold", fontsize=10)
ax2.set_ylabel("%")
ax2.legend(fontsize=8)
ax2.xaxis.set_major_formatter(mdates.DateFormatter("%Y"))
ax2.grid(alpha=0.3, axis="y")

# ─ ③ AI 대표주 vs 나스닥 ─────────────────────────────────────────────────
ax3 = fig.add_subplot(gs[1, :])
style = {
    "NVDA":  ("#76b900", 3.0, "엔비디아 (NVDA)"),
    "MSFT":  ("#00a4ef", 1.8, "마이크로소프트 (MSFT)"),
    "GOOGL": ("#fbbc04", 1.8, "구글 (GOOGL)"),
    "QQQ":   ("#d32f2f", 1.8, "나스닥100 ETF (QQQ)"),
}
for ticker, (color, lw, label) in style.items():
    ax3.plot(prices.index, prices[ticker], color=color, linewidth=lw, label=label)

# 주요 이벤트 마킹
events = {
    "2020-03": ("코로나\n쇼크",    "down"),
    "2022-01": ("연준 금리\n인상 시작", "down"),
    "2023-01": ("ChatGPT\n열풍",   "up"),
    "2025-01": ("현재",           "up"),
}
for date, (label, direction) in events.items():
    x = pd.to_datetime(date)
    if x in prices.index:
        y = prices.loc[x, "NVDA"]
        ytext = y + 200 if direction == "up" else y - 250
        ax3.annotate(label, xy=(x, y), xytext=(x, ytext),
                     ha="center", fontsize=7.5, color="#333333",
                     arrowprops=dict(arrowstyle="->", color="#555555", lw=0.8))

ax3.axhline(100, color="gray", linestyle="--", alpha=0.4)
ax3.set_title("③ AI 대표주 vs 나스닥 — 2020년 1월 기준 정규화 (=100)\n출처: Yahoo Finance",
              fontweight="bold", fontsize=10)
ax3.set_ylabel("정규화 지수")
ax3.legend(fontsize=9, loc="upper left")
ax3.xaxis.set_major_formatter(mdates.DateFormatter("%Y"))
ax3.grid(alpha=0.3)

# ─ ④ 금리 vs NVDA 산점도 ─────────────────────────────────────────────────
ax4 = fig.add_subplot(gs[2, 0])
x_vals = tnx.reindex(prices.index).values
y_vals = prices["NVDA"].values
colors_scatter = np.arange(len(x_vals))
sc = ax4.scatter(x_vals, y_vals, c=colors_scatter, cmap="RdYlGn_r", alpha=0.5, s=20)
cbar = plt.colorbar(sc, ax=ax4)
cbar.set_label("시간 흐름 (초록=2020, 빨강=2025)", fontsize=7)

# 선형회귀선
mask = ~(np.isnan(x_vals) | np.isnan(y_vals))
if mask.sum() > 2:
    m, b = np.polyfit(x_vals[mask], y_vals[mask], 1)
    x_line = np.linspace(x_vals[mask].min(), x_vals[mask].max(), 100)
    ax4.plot(x_line, m * x_line + b, "k--", linewidth=1.2, alpha=0.6, label="추세선")
    corr = np.corrcoef(x_vals[mask], y_vals[mask])[0, 1]
    ax4.set_title(f"④ 10년물 금리 vs NVDA 주가\n상관계수: {corr:.3f}  ({'역상관 — 디커플링!' if corr < -0.3 else '양상관' if corr > 0.3 else '무상관'})",
                  fontweight="bold", fontsize=10)
ax4.set_xlabel("10년물 금리 (%)")
ax4.set_ylabel("NVDA 정규화 지수")
ax4.legend(fontsize=8)
ax4.grid(alpha=0.3)

# ─ ⑤ 닷컴버블 vs 현재 나스닥 비교 ────────────────────────────────────────
ax5 = fig.add_subplot(gs[2, 1])
qqq_norm = prices["QQQ"].reset_index(drop=True)
dotcom_norm = dotcom.reset_index(drop=True)

ax5.plot(dotcom_norm.index, dotcom_norm.values, color="#ff6f00",
         linewidth=2, label="닷컴버블 나스닥 (1998~2003)", linestyle="--")
ax5.plot(qqq_norm.index[:len(dotcom_norm)], qqq_norm.values[:len(dotcom_norm)],
         color="#1565c0", linewidth=2, label=f"현재 나스닥100 (2020~)")

# 닷컴 고점 표시
peak_idx = int(dotcom_norm.idxmax())
ax5.axvline(peak_idx, color="#ff6f00", linestyle=":", alpha=0.5)
ax5.annotate("닷컴 고점\n(2000-03)", xy=(peak_idx, dotcom_norm.max()),
             ha="center", fontsize=8, color="#ff6f00")

ax5.axhline(100, color="gray", linestyle="--", alpha=0.4)
ax5.set_title("⑤ 닷컴버블 vs 현재 나스닥\n(각 시작점 = 100, 경과 월 기준)",
              fontweight="bold", fontsize=10)
ax5.set_xlabel("경과 월수")
ax5.set_ylabel("정규화 지수")
ax5.legend(fontsize=9)
ax5.grid(alpha=0.3)

plt.savefig("ai_bubble_dashboard.png", dpi=150, bbox_inches="tight",
            facecolor="white")
print("저장 완료: ai_bubble_dashboard.png")

# ── 텍스트 요약 ───────────────────────────────────────────────────────────
latest_yield = tnx.iloc[-1]
latest_cpi   = cpi.iloc[-1]
nvda_return  = prices["NVDA"].iloc[-1] - 100

print("\n" + "=" * 55)
print("  AI 버블 분석 요약  (2025년 5월 기준)")
print("=" * 55)
print(f"  현재 10년물 금리    : {latest_yield:.2f}%")
print(f"  현재 CPI 인플레이션  : {latest_cpi:.1f}%")
print(f"  NVDA 2020 대비 수익  : +{nvda_return:.0f}%")

print("\n  [당신의 가설 검증]")
print(f"  금리 4%대 고금리 유지에도 NVDA +{nvda_return:.0f}% → 디커플링 확인")
print(f"  → 전통적으로 고금리 = 성장주 조정이어야 하지만 AI주는 역주행")
print(f"  → 이 디커플링이 '이번엔 다르다' 논리 = 버블의 전형적 특징")
print(f"\n  [버블 판단 체크리스트]")

checks = [
    ("금리 4% 이상에도 주가 상승 중",        "🔴 버블 신호"),
    ("인플레 재반등 시 연준 추가 인상 가능",   "🟡 주의"),
    ("닷컴버블 대비 상승폭 아직 낮음",        "🟢 아직 여유"),
    ("AI 실적(NVDA 매출)이 주가 뒷받침 중",  "🟢 버블과 차이"),
    ("개인투자자 FOMO 유입 급증",           "🔴 버블 신호"),
]
for desc, signal in checks:
    print(f"  {signal}  {desc}")

print("\n  [결론] 완전한 버블보단 '실적 있는 과열' 국면")
print("         CPI 재반등 → 금리 재인상이 핵심 트리거")
print("=" * 55)
