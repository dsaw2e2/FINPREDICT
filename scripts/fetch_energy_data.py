"""
finpredict_energy_data_collector_full.py

- Подходит для: широкий мир (энергетика) + Казахстан (публичные + непубличные)
- Что делает:
  1) Проверяет/выгружает данные по публичным тикерам через yfinance
  2) Создаёт папки и шаблоны для непубличных компаний
  3) Пытается скачать годовые/другие PDF-отчеты с KASE/страниц компаний (если найдёт ссылки)
  4) Формирует combined Excel + CSV/JSON и status-отчёт
"""

import os
import time
import json
from pathlib import Path
from typing import Optional, Dict, List
import requests
import pandas as pd
import yfinance as yf
from bs4 import BeautifulSoup

# ---------- Настройки -------------
OUTPUT_ROOT = Path("public/data/energy")
ANALYSIS_DIR = Path("public/data/energy/analysis")
OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)
ANALYSIS_DIR.mkdir(parents=True, exist_ok=True)

HIST_PERIOD = "5y"   # '1y','5y','max' - при необходимости менять
INTERVAL = "1d"

# ------------- Списки (редактируй) -------------
# Широкий мир: примеры — расширяй по необходимости
global_companies = {
    "Saudi_Aramco": "2222.SR",
    "ExxonMobil": "XOM",
    "Chevron": "CVX",
    "Shell": "SHEL",
    "BP": "BP",
    "TotalEnergies": "TTE",
    "PetroChina": "PTR",
    "ConocoPhillips": "COP",
    "Equinor": "EQNR",
    "NextEra": "NEE",
    "Iberdrola": "IBE",
    "Enel": "ENEL.MI",
    "Vestas": "VWS.CO",
    "Siemens_Energy": "ENR.DE",
    "Orsted": "ORSTED.CO",
    "Brookfield_Renewable": "BEP"
}

# Казахстан: включаем и публичные (с тикером/ISIN на KASE/AIX), и непубличные (None)
kaz_companies = {
    "KazMunayGas": {"ticker_yf": None, "kase_code": "KMGZ"},
    "Samruk_Energy": {"ticker_yf": None, "kase_code": None},
    "KEGOC": {"ticker_yf": "KEGC.KZ", "kase_code": "KEGC"},
    "KazTransOil": {"ticker_yf": None, "kase_code": None},
    "KazTransGas": {"ticker_yf": None, "kase_code": None},
    "Ekibastuz_GRES_1": {"ticker_yf": None, "kase_code": None},
    "Ekibastuz_GRES_2": {"ticker_yf": None, "kase_code": None},
    "MAEK": {"ticker_yf": None, "kase_code": None},
}

# ---------- Вспомогательные функции ----------
def safe_mkdir(p: Path):
    p.mkdir(parents=True, exist_ok=True)

def fetch_yfinance(ticker: str):
    """Возвращает history_df, info_dict или (None, None)"""
    try:
        tk = yf.Ticker(ticker)
        hist = tk.history(period=HIST_PERIOD, interval=INTERVAL)
        info = tk.info
        if hist is None or hist.empty:
            return None, info if info else None
        return hist, info
    except Exception as e:
        print("yfinance error:", e)
        return None, None

def compute_metrics(history_df: pd.DataFrame) -> Dict:
    if history_df is None or history_df.empty:
        return {}
    h = history_df['Close'].dropna()
    start, end = float(h.iloc[0]), float(h.iloc[-1])
    pct_change = (end / start - 1) * 100
    returns = h.pct_change().dropna()
    vol = returns.std() * (252 ** 0.5)
    avg_daily_return = returns.mean()
    return {
        "start_date": str(h.index[0].date()),
        "end_date": str(h.index[-1].date()),
        "start_price": start,
        "end_price": end,
        "pct_change_%": float(pct_change),
        "annualized_volatility": float(vol),
        "avg_daily_return": float(avg_daily_return)
    }

def save_json_serializable(obj, path: Path):
    try:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(obj, f, ensure_ascii=False, indent=2, default=str)
    except Exception as e:
        print("JSON save error:", e)
        with open(path, "w", encoding="utf-8") as f:
            f.write(str(obj))

def try_download_kase_pdfs(kase_code: str, save_dir: Path):
    """
    Парсит страницу эмитента на kase.kz по kase_code и пытается скачать pdf-файлы (отчёты),
    сохраняет их в save_dir. Возвращает список скачанных файлов.
    """
    if not kase_code:
        return []
    base = f"https://kase.kz/en/listing/issuers/{kase_code}"
    try:
        resp = requests.get(base, timeout=15)
        if resp.status_code != 200:
            return []
        soup = BeautifulSoup(resp.text, "html.parser")
        links = []
        for a in soup.find_all("a", href=True):
            href = a["href"]
            if href.lower().endswith(".pdf"):
                if href.startswith("http"):
                    links.append(href)
                else:
                    links.append("https://kase.kz" + href)
        saved = []
        for url in set(links):
            try:
                r = requests.get(url, timeout=20)
                if r.status_code == 200:
                    fname = url.split("/")[-1].split("?")[0]
                    p = save_dir / fname
                    with open(p, "wb") as f:
                        f.write(r.content)
                    saved.append(str(p))
                    time.sleep(1)
            except Exception as e:
                print("Error downloading PDF", url, e)
        return saved
    except Exception as e:
        print("Error accessing KASE page", e)
        return []

# ---------- Основной процесс ----------
all_histories = []
metrics_list = []
status_rows = []

# 1) Обработка глобальных (публичные)
for company_name, ticker in global_companies.items():
    company_dir = OUTPUT_ROOT / "global" / company_name
    safe_mkdir(company_dir)
    status = {"company": company_name, "region": "global", "ticker": ticker, "fetch_status": None, "note": ""}
    if ticker:
        hist, info = fetch_yfinance(ticker)
        if hist is not None and not hist.empty:
            hist.to_csv(company_dir / "history.csv")
            save_json_serializable(info, company_dir / "info.json")
            m = compute_metrics(hist)
            m.update({"company": company_name, "ticker": ticker, "region": "global"})
            metrics_list.append(m)
            hist_reset = hist.reset_index()
            hist_reset["ticker"] = ticker
            all_histories.append(hist_reset)
            status["fetch_status"] = "ok"
        else:
            status["fetch_status"] = "no_data"
            status["note"] = "yfinance returned no history"
            (company_dir / "history.csv").write_text("")
            save_json_serializable(info if info else {}, company_dir / "info.json")
    else:
        status["fetch_status"] = "no_ticker"
        status["note"] = "no ticker provided"
        (company_dir / "history.csv").write_text("")
        save_json_serializable({}, company_dir / "info.json")
    status_rows.append(status)
    time.sleep(1)

# 2) Обработка Казахстана (публичные/непубличные)
for company_name, meta in kaz_companies.items():
    company_dir = OUTPUT_ROOT / "kazakhstan" / company_name
    reports_dir = company_dir / "reports"
    safe_mkdir(company_dir)
    safe_mkdir(reports_dir)
    ticker = meta.get("ticker_yf") if isinstance(meta, dict) else None
    kase_code = meta.get("kase_code") if isinstance(meta, dict) else None
    status = {"company": company_name, "region": "kazakhstan", "ticker": ticker, "kase_code": kase_code, "fetch_status": None, "note": ""}
    if ticker:
        hist, info = fetch_yfinance(ticker)
        if hist is not None and not hist.empty:
            hist.to_csv(company_dir / "history.csv")
            save_json_serializable(info, company_dir / "info.json")
            m = compute_metrics(hist)
            m.update({"company": company_name, "ticker": ticker, "region": "kazakhstan"})
            metrics_list.append(m)
            hist_reset = hist.reset_index()
            hist_reset["ticker"] = ticker
            all_histories.append(hist_reset)
            status["fetch_status"] = "ok"
        else:
            status["fetch_status"] = "no_data"
            status["note"] = "yfinance found ticker but no history"
            (company_dir / "history.csv").write_text("")
            save_json_serializable(info if info else {}, company_dir / "info.json")
    else:
        status["fetch_status"] = "non_public"
        status["note"] = "created placeholders; attempting to download reports from KASE if code present"
        (company_dir / "history.csv").write_text("")
        save_json_serializable({}, company_dir / "info.json")
    if kase_code:
        saved = try_download_kase_pdfs(kase_code, reports_dir)
        if saved:
            status["note"] += f"; downloaded {len(saved)} PDFs"
        else:
            status["note"] += "; no PDFs found on KASE page"
    status_rows.append(status)
    time.sleep(1)

# 3) Сохранение объединённых файлов
if all_histories:
    combined_history = pd.concat(all_histories, ignore_index=True)
    combined_history.to_csv(ANALYSIS_DIR / "History_All.csv", index=False)
    combined_history_json = combined_history.to_dict(orient="records")
    save_json_serializable(combined_history_json, ANALYSIS_DIR / "history_all.json")
else:
    combined_history = pd.DataFrame()
    
metrics_df = pd.DataFrame(metrics_list)
metrics_df.to_csv(ANALYSIS_DIR / "Metrics.csv", index=False)
save_json_serializable(metrics_list, ANALYSIS_DIR / "metrics.json")

# status
status_df = pd.DataFrame(status_rows)
status_df.to_csv(ANALYSIS_DIR / "fetch_status.csv", index=False)
save_json_serializable(status_rows, ANALYSIS_DIR / "fetch_status.json")

# Summary for web display
summary = {
    "last_updated": str(pd.Timestamp.now()),
    "total_companies": len(status_rows),
    "global_companies": len([s for s in status_rows if s["region"] == "global"]),
    "kazakhstan_companies": len([s for s in status_rows if s["region"] == "kazakhstan"]),
    "successful_fetches": len([s for s in status_rows if s["fetch_status"] == "ok"]),
    "metrics_count": len(metrics_list),
    "status": status_rows,
    "metrics": metrics_list
}
save_json_serializable(summary, ANALYSIS_DIR / "summary.json")

print("DONE")
print("Outputs in:", OUTPUT_ROOT.resolve(), "and", ANALYSIS_DIR.resolve())
