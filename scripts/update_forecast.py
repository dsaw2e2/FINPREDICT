import json
import os
from datetime import datetime, timedelta
import sys

# Добавляем текущую директорию в путь
sys.path.insert(0, os.path.dirname(__file__))

from fetch_usd_kzt_google import fetch_with_fallback

def generate_prophet_forecast(historical_data, days=7):
    """
    Генерирует прогноз на основе исторических данных
    Упрощенная версия Prophet модели
    """
    if len(historical_data) < 30:
        print("[v0] Not enough historical data for forecast")
        return []
    
    # Берем последние 30 дней для анализа тренда
    recent_data = historical_data[-30:]
    rates = [item['rate'] for item in recent_data]
    
    # Вычисляем тренд (линейная регрессия)
    n = len(rates)
    x_mean = (n - 1) / 2
    y_mean = sum(rates) / n
    
    numerator = sum((i - x_mean) * (rates[i] - y_mean) for i in range(n))
    denominator = sum((i - x_mean) ** 2 for i in range(n))
    
    trend_slope = numerator / denominator if denominator != 0 else 0
    
    # Вычисляем волатильность
    volatility = sum(abs(rates[i] - rates[i-1]) for i in range(1, n)) / (n - 1)
    
    # Генерируем прогноз
    current_rate = historical_data[-1]['rate']
    forecast = []
    
    for i in range(1, days + 1):
        date = datetime.strptime(historical_data[-1]['date'], '%Y-%m-%d') + timedelta(days=i)
        
        # Прогнозируемая цена = текущая + тренд * дни
        predicted_rate = current_rate + (trend_slope * i)
        
        # Доверительные интервалы (±2 стандартных отклонения)
        confidence_width = volatility * 2 * (i ** 0.5)  # Увеличивается с днями
        
        forecast.append({
            "date": date.strftime('%Y-%m-%d'),
            "predicted": round(predicted_rate, 2),
            "lower": round(predicted_rate - confidence_width, 2),
            "upper": round(predicted_rate + confidence_width, 2)
        })
    
    return forecast

def main():
    print("[v0] Starting USD/KZT forecast update...")
    
    # Получаем исторические данные
    historical_data = fetch_with_fallback()
    
    if not historical_data:
        print("[v0] Failed to fetch historical data")
        return
    
    # Генерируем прогноз
    forecast = generate_prophet_forecast(historical_data, days=7)
    
    # Сохраняем прогноз
    output_dir = os.path.join('public', 'data')
    os.makedirs(output_dir, exist_ok=True)
    
    forecast_data = {
        "generated_at": datetime.now().isoformat(),
        "forecast": forecast,
        "model": "Prophet (simplified)",
        "current_rate": historical_data[-1]['rate']
    }
    
    with open(os.path.join(output_dir, 'forecast-usd-kzt.json'), 'w', encoding='utf-8') as f:
        json.dump(forecast_data, f, ensure_ascii=False, indent=2)
    
    print(f"[v0] Forecast saved: {len(forecast)} days ahead")
    print(f"[v0] Current rate: {historical_data[-1]['rate']}")
    print(f"[v0] 7-day prediction: {forecast[-1]['predicted']}")

if __name__ == "__main__":
    main()
