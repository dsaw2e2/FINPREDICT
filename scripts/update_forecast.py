"""
FinPredict USD/KZT ML Forecast Pipeline
Prophet + XGBoost ensemble with Brent Oil and News Sentiment features.

Usage:
  python scripts/update_forecast.py

Environment variables:
  SUPABASE_URL - Supabase project URL (for sentiment data)
  SUPABASE_SERVICE_ROLE_KEY - Supabase service role key (for sentiment data)
"""

import json
import os
import sys
from datetime import datetime, timedelta

import numpy as np
import pandas as pd
import yfinance as yf

# ──────────────────────────────────────────────
# 1. Data Fetching
# ──────────────────────────────────────────────

def fetch_usd_kzt_history(years: int = 2) -> pd.DataFrame:
    """Fetch USD/KZT daily history from Yahoo Finance."""
    print(f"[ML] Fetching {years}y USD/KZT history...")
    ticker = yf.Ticker("KZT=X")
    hist = ticker.history(period=f"{years}y")
    if hist.empty:
        raise RuntimeError("Yahoo Finance returned no USD/KZT data")
    df = hist[["Close"]].copy()
    df.columns = ["rate"]
    # KZT=X quotes KZT per 1 USD
    df.index = pd.to_datetime(df.index).tz_localize(None)
    df = df.sort_index()
    print(f"[ML] Got {len(df)} USD/KZT data points ({df.index[0].date()} to {df.index[-1].date()})")
    return df


def fetch_brent_oil_history(years: int = 2) -> pd.DataFrame:
    """Fetch Brent Crude Oil daily history."""
    print(f"[ML] Fetching {years}y Brent Oil history...")
    ticker = yf.Ticker("BZ=F")
    hist = ticker.history(period=f"{years}y")
    if hist.empty:
        print("[ML] WARNING: No Brent Oil data, using empty series")
        return pd.DataFrame(columns=["brent"])
    df = hist[["Close"]].copy()
    df.columns = ["brent"]
    df.index = pd.to_datetime(df.index).tz_localize(None)
    df = df.sort_index()
    print(f"[ML] Got {len(df)} Brent Oil data points")
    return df


def fetch_daily_sentiment() -> pd.DataFrame:
    """Fetch aggregated daily sentiment scores from Supabase."""
    url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

    if not url or not key:
        print("[ML] No Supabase credentials, skipping sentiment data")
        return pd.DataFrame(columns=["avg_sentiment", "article_count"])

    try:
        import requests
        resp = requests.get(
            f"{url}/rest/v1/daily_sentiment?select=date,avg_sentiment,article_count&order=date.asc",
            headers={"apikey": key, "Authorization": f"Bearer {key}"},
            timeout=15,
        )
        resp.raise_for_status()
        data = resp.json()
        if not data:
            print("[ML] No sentiment data available yet")
            return pd.DataFrame(columns=["avg_sentiment", "article_count"])
        df = pd.DataFrame(data)
        df["date"] = pd.to_datetime(df["date"])
        df = df.set_index("date").sort_index()
        print(f"[ML] Got {len(df)} days of sentiment data")
        return df
    except Exception as e:
        print(f"[ML] Sentiment fetch failed: {e}")
        return pd.DataFrame(columns=["avg_sentiment", "article_count"])


# ──────────────────────────────────────────────
# 2. Feature Engineering
# ──────────────────────────────────────────────

def build_features(kzt: pd.DataFrame, brent: pd.DataFrame, sentiment: pd.DataFrame) -> pd.DataFrame:
    """Merge data sources and compute derived features."""
    df = kzt.copy()

    # Join Brent oil (forward-fill weekends)
    if not brent.empty:
        df = df.join(brent, how="left")
        df["brent"] = df["brent"].ffill()
    else:
        df["brent"] = np.nan

    # Join sentiment (forward-fill gaps)
    if not sentiment.empty:
        df = df.join(sentiment[["avg_sentiment", "article_count"]], how="left")
        df["avg_sentiment"] = df["avg_sentiment"].ffill().fillna(0)
        df["article_count"] = df["article_count"].ffill().fillna(0)
    else:
        df["avg_sentiment"] = 0.0
        df["article_count"] = 0.0

    # Rolling features
    df["rate_ma7"] = df["rate"].rolling(7).mean()
    df["rate_ma30"] = df["rate"].rolling(30).mean()
    df["rate_volatility_7d"] = df["rate"].rolling(7).std()
    df["rate_momentum_7d"] = df["rate"].pct_change(7)
    df["rate_momentum_30d"] = df["rate"].pct_change(30)

    if not brent.empty:
        df["brent_ma7"] = df["brent"].rolling(7).mean()
        df["brent_momentum_7d"] = df["brent"].pct_change(7)
        df["brent_rate_corr_30d"] = df["rate"].rolling(30).corr(df["brent"])
    else:
        df["brent_ma7"] = np.nan
        df["brent_momentum_7d"] = np.nan
        df["brent_rate_corr_30d"] = np.nan

    # Sentiment rolling
    df["sentiment_ma7"] = df["avg_sentiment"].rolling(7).mean()

    # Calendar features
    df["day_of_week"] = df.index.dayofweek
    df["month"] = df.index.month
    df["day_of_year"] = df.index.dayofyear

    df = df.dropna()
    print(f"[ML] Feature matrix: {df.shape[0]} rows x {df.shape[1]} columns")
    return df


# ──────────────────────────────────────────────
# 3. Model Training & Forecasting
# ──────────────────────────────────────────────

FEATURE_COLS = [
    "brent", "avg_sentiment", "article_count",
    "rate_ma7", "rate_ma30", "rate_volatility_7d",
    "rate_momentum_7d", "rate_momentum_30d",
    "brent_ma7", "brent_momentum_7d", "brent_rate_corr_30d",
    "sentiment_ma7", "day_of_week", "month", "day_of_year",
]


def train_prophet(kzt: pd.DataFrame, forecast_days: int = 30) -> dict:
    """Train Prophet model on USD/KZT time series."""
    from prophet import Prophet

    print("[ML] Training Prophet model...")
    df_prophet = pd.DataFrame({
        "ds": kzt.index,
        "y": kzt["rate"].values,
    })

    model = Prophet(
        daily_seasonality=False,
        weekly_seasonality=True,
        yearly_seasonality=True,
        changepoint_prior_scale=0.05,
        seasonality_mode="multiplicative",
    )
    model.fit(df_prophet)

    future = model.make_future_dataframe(periods=forecast_days)
    pred = model.predict(future)

    forecast_rows = pred.tail(forecast_days)
    result = {
        "dates": forecast_rows["ds"].dt.strftime("%Y-%m-%d").tolist(),
        "yhat": forecast_rows["yhat"].tolist(),
        "yhat_lower": forecast_rows["yhat_lower"].tolist(),
        "yhat_upper": forecast_rows["yhat_upper"].tolist(),
    }

    # In-sample R2
    insample = pred.iloc[:-forecast_days]
    ss_res = ((kzt["rate"].values - insample["yhat"].values) ** 2).sum()
    ss_tot = ((kzt["rate"].values - kzt["rate"].mean()) ** 2).sum()
    r2 = 1 - ss_res / ss_tot if ss_tot > 0 else 0
    result["r2"] = round(float(r2), 4)
    print(f"[ML] Prophet R2: {result['r2']}")
    return result


def train_xgboost(features: pd.DataFrame, forecast_days: int = 30) -> dict:
    """Train XGBoost on engineered features, predict forward."""
    from xgboost import XGBRegressor
    from sklearn.model_selection import TimeSeriesSplit
    from sklearn.metrics import r2_score, mean_absolute_error

    print("[ML] Training XGBoost model...")

    available_features = [c for c in FEATURE_COLS if c in features.columns and features[c].notna().sum() > 10]
    if len(available_features) < 3:
        print("[ML] WARNING: Not enough features for XGBoost, skipping")
        return {}

    X = features[available_features].fillna(0)
    y = features["rate"]

    # Time-series cross-validation
    tscv = TimeSeriesSplit(n_splits=3)
    cv_scores = []
    for train_idx, val_idx in tscv.split(X):
        X_tr, X_val = X.iloc[train_idx], X.iloc[val_idx]
        y_tr, y_val = y.iloc[train_idx], y.iloc[val_idx]
        m = XGBRegressor(
            n_estimators=200, max_depth=5, learning_rate=0.05,
            reg_alpha=0.1, reg_lambda=1.0, random_state=42,
        )
        m.fit(X_tr, y_tr, eval_set=[(X_val, y_val)], verbose=False)
        cv_scores.append(r2_score(y_val, m.predict(X_val)))

    avg_cv_r2 = float(np.mean(cv_scores))
    print(f"[ML] XGBoost CV R2: {avg_cv_r2:.4f}")

    # Train final model on all data
    model = XGBRegressor(
        n_estimators=200, max_depth=5, learning_rate=0.05,
        reg_alpha=0.1, reg_lambda=1.0, random_state=42,
    )
    model.fit(X, y, verbose=False)

    y_pred_train = model.predict(X)
    train_r2 = r2_score(y, y_pred_train)
    train_mae = mean_absolute_error(y, y_pred_train)
    print(f"[ML] XGBoost full-train R2: {train_r2:.4f}, MAE: {train_mae:.2f}")

    # Feature importance
    importances = dict(zip(available_features, model.feature_importances_.tolist()))
    importances = {k: round(v, 4) for k, v in sorted(importances.items(), key=lambda x: -x[1])}

    # Forecast: iteratively extend the last row
    last_row = X.iloc[-1:].copy()
    predictions = []
    current_rate = float(y.iloc[-1])

    for i in range(forecast_days):
        pred = float(model.predict(last_row)[0])
        predictions.append(pred)
        # Shift features forward (approximate)
        current_rate = pred
        if "rate_ma7" in last_row.columns:
            last_row["rate_ma7"] = (last_row["rate_ma7"].values[0] * 6 + pred) / 7
        if "rate_ma30" in last_row.columns:
            last_row["rate_ma30"] = (last_row["rate_ma30"].values[0] * 29 + pred) / 30
        if "day_of_week" in last_row.columns:
            last_row["day_of_week"] = (last_row["day_of_week"].values[0] + 1) % 7
        if "day_of_year" in last_row.columns:
            last_row["day_of_year"] = last_row["day_of_year"].values[0] + 1

    return {
        "predictions": predictions,
        "cv_r2": round(avg_cv_r2, 4),
        "train_r2": round(float(train_r2), 4),
        "mae": round(float(train_mae), 2),
        "feature_importance": importances,
        "features_used": available_features,
    }


def ensemble_forecast(
    prophet_result: dict,
    xgb_result: dict,
    forecast_days: int = 30,
    last_date: str = "",
) -> list:
    """Combine Prophet + XGBoost predictions using weighted average."""
    # Weight by cross-validated R2
    prophet_r2 = max(prophet_result.get("r2", 0.5), 0.01)
    xgb_r2 = max(xgb_result.get("cv_r2", 0), 0.01)

    has_xgb = bool(xgb_result.get("predictions"))

    if has_xgb:
        total = prophet_r2 + xgb_r2
        w_prophet = prophet_r2 / total
        w_xgb = xgb_r2 / total
    else:
        w_prophet = 1.0
        w_xgb = 0.0

    print(f"[ML] Ensemble weights: Prophet={w_prophet:.2f}, XGBoost={w_xgb:.2f}")

    forecast = []
    for i in range(forecast_days):
        date_str = prophet_result["dates"][i]
        prophet_pred = prophet_result["yhat"][i]
        xgb_pred = xgb_result["predictions"][i] if has_xgb else prophet_pred

        predicted = w_prophet * prophet_pred + w_xgb * xgb_pred

        # Confidence interval from Prophet, widened slightly
        lower = prophet_result["yhat_lower"][i]
        upper = prophet_result["yhat_upper"][i]

        forecast.append({
            "date": date_str,
            "predicted": round(float(predicted), 2),
            "lower": round(float(lower), 2),
            "upper": round(float(upper), 2),
            "prophet": round(float(prophet_pred), 2),
            "xgboost": round(float(xgb_pred), 2),
        })

    return forecast


# ──────────────────────────────────────────────
# 4. Factor Reasoning
# ──────────────────────────────────────────────

def generate_reasoning(
    features: pd.DataFrame,
    xgb_result: dict,
    forecast: list,
) -> list:
    """Generate human-readable explanations for the forecast."""
    reasons = []
    current_rate = float(features["rate"].iloc[-1])
    pred_7d = forecast[min(6, len(forecast) - 1)]["predicted"]
    direction = "strengthen" if pred_7d < current_rate else "weaken"

    reasons.append({
        "factor": "Overall Trend",
        "impact": "bullish" if direction == "strengthen" else "bearish",
        "detail": f"USD/KZT is predicted to move from {current_rate:.2f} to {pred_7d:.2f} in 7 days ({direction} for KZT).",
    })

    # Oil price impact
    if "brent" in features.columns and features["brent"].notna().any():
        brent_now = float(features["brent"].iloc[-1])
        brent_30d_ago = float(features["brent"].iloc[-30]) if len(features) >= 30 else brent_now
        brent_change = ((brent_now - brent_30d_ago) / brent_30d_ago) * 100
        oil_impact = "bullish" if brent_change > 2 else "bearish" if brent_change < -2 else "neutral"
        reasons.append({
            "factor": "Brent Oil Price",
            "impact": oil_impact,
            "detail": f"Brent at ${brent_now:.1f}/bbl ({brent_change:+.1f}% over 30 days). Higher oil prices tend to support KZT.",
        })

    # Sentiment impact
    if "avg_sentiment" in features.columns:
        recent_sentiment = float(features["avg_sentiment"].iloc[-7:].mean())
        sent_impact = "bullish" if recent_sentiment > 0.1 else "bearish" if recent_sentiment < -0.1 else "neutral"
        reasons.append({
            "factor": "News Sentiment",
            "impact": sent_impact,
            "detail": f"Average 7-day news sentiment: {recent_sentiment:.2f} (scale: -1 bearish to +1 bullish).",
        })

    # Volatility
    if "rate_volatility_7d" in features.columns:
        vol = float(features["rate_volatility_7d"].iloc[-1])
        vol_avg = float(features["rate_volatility_7d"].mean())
        vol_level = "elevated" if vol > vol_avg * 1.3 else "low" if vol < vol_avg * 0.7 else "normal"
        reasons.append({
            "factor": "Volatility",
            "impact": "neutral",
            "detail": f"7-day volatility is {vol_level} ({vol:.2f} vs avg {vol_avg:.2f}). Wider prediction intervals expected." if vol_level == "elevated" else f"7-day volatility is {vol_level} ({vol:.2f}). Prediction confidence is {'high' if vol_level == 'low' else 'moderate'}.",
        })

    # Feature importance
    importance = xgb_result.get("feature_importance", {})
    if importance:
        top_features = list(importance.items())[:3]
        detail = ", ".join([f"{k} ({v:.1%})" for k, v in top_features])
        reasons.append({
            "factor": "Model Features",
            "impact": "neutral",
            "detail": f"XGBoost top drivers: {detail}.",
        })

    return reasons


# ──────────────────────────────────────────────
# 5. Main Entry Point
# ──────────────────────────────────────────────

def main():
    forecast_days = 30
    print("=" * 60)
    print("[ML] FinPredict USD/KZT ML Forecast Pipeline")
    print("=" * 60)

    # ── Fetch data ──
    kzt = fetch_usd_kzt_history(years=2)
    brent = fetch_brent_oil_history(years=2)
    sentiment = fetch_daily_sentiment()

    # ── Build features ──
    features = build_features(kzt, brent, sentiment)

    # ── Train models ──
    prophet_result = train_prophet(kzt, forecast_days)
    xgb_result = train_xgboost(features, forecast_days)

    # ── Ensemble ──
    forecast = ensemble_forecast(prophet_result, xgb_result, forecast_days)

    # ── Reasoning ──
    reasoning = generate_reasoning(features, xgb_result, forecast)

    # ── Save historical data ──
    output_dir = os.path.join("public", "data")
    os.makedirs(output_dir, exist_ok=True)

    historical = [
        {"date": d.strftime("%Y-%m-%d"), "rate": round(float(r), 2)}
        for d, r in zip(kzt.index, kzt["rate"])
    ]
    with open(os.path.join(output_dir, "historical-usd-kzt.json"), "w") as f:
        json.dump(historical, f, indent=2)

    # ── Save forecast ──
    current_rate = round(float(kzt["rate"].iloc[-1]), 2)
    forecast_output = {
        "generated_at": datetime.now().isoformat(),
        "current_rate": current_rate,
        "forecast_days": forecast_days,
        "forecast": forecast,
        "model": {
            "name": "Prophet + XGBoost Ensemble",
            "prophet_r2": prophet_result.get("r2", 0),
            "xgboost_cv_r2": xgb_result.get("cv_r2", 0),
            "xgboost_mae": xgb_result.get("mae", 0),
            "feature_importance": xgb_result.get("feature_importance", {}),
            "features_used": xgb_result.get("features_used", []),
            "training_data_points": len(features),
            "sentiment_data_available": not sentiment.empty,
        },
        "reasoning": reasoning,
    }

    with open(os.path.join(output_dir, "forecast-usd-kzt.json"), "w") as f:
        json.dump(forecast_output, f, indent=2)

    print()
    print(f"[ML] Current USD/KZT: {current_rate}")
    print(f"[ML] 7-day prediction: {forecast[6]['predicted']}")
    print(f"[ML] 30-day prediction: {forecast[-1]['predicted']}")
    print(f"[ML] Prophet R2: {prophet_result.get('r2', 'N/A')}")
    print(f"[ML] XGBoost CV R2: {xgb_result.get('cv_r2', 'N/A')}")
    print(f"[ML] Files saved to {output_dir}/")
    print("=" * 60)


if __name__ == "__main__":
    main()
