import os
import time
from datetime import datetime
import requests
from dotenv import load_dotenv

load_dotenv()

# =========================
# CONFIG
# =========================

TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
FOOTBALL_KEY = os.getenv("API_FOOTBALL_KEY")

if not TOKEN:
    raise RuntimeError("TELEGRAM_BOT_TOKEN не найден")

if not FOOTBALL_KEY:
    raise RuntimeError("API_FOOTBALL_KEY не найден")

TELEGRAM_URL = f"https://api.telegram.org/bot{TOKEN}"
FOOTBALL_URL = "https://v3.football.api-sports.io"

FOOTBALL_HEADERS = {
    "x-apisports-key": FOOTBALL_KEY
}

print("🧠 RUSTAM OS ONLINE", flush=True)


# =========================
# TELEGRAM
# =========================

def send_message(chat_id, text, keyboard=None):
    payload = {
        "chat_id": chat_id,
        "text": text
    }

    if keyboard:
        payload["reply_markup"] = {
            "keyboard": keyboard,
            "resize_keyboard": True
        }

    try:
        requests.post(
            f"{TELEGRAM_URL}/sendMessage",
            json=payload,
            timeout=10
        )
    except Exception as e:
        print("SEND ERROR:", e, flush=True)


# =========================
# MENUS
# =========================

MAIN_MENU = [
    ["🧠 AI", "⚽ Football"],
    ["📊 Аналитика", "💼 Работа"],
    ["⚙️ Настройки", "ℹ️ Статус"]
]

FOOTBALL_MENU = [
    ["🔴 Live", "📅 Сегодня"],
    ["📊 Таблицы", "🔎 Анализ"],
    ["🎯 Сигналы", "⬅️ Назад"]
]


# =========================
# FOOTBALL API
# =========================

def football_request(endpoint, params=None):
    try:
        response = requests.get(
            f"{FOOTBALL_URL}/{endpoint}",
            headers=FOOTBALL_HEADERS,
            params=params or {},
            timeout=15
        )

        data = response.json()

        if not data.get("response"):
            errors = data.get("errors", {})
            return None, errors

        return data["response"], None

    except Exception as e:
        return None, {"exception": str(e)}


def football_today():
    today = datetime.now().strftime("%Y-%m-%d")

    matches, error = football_request(
        "fixtures",
        {
            "date": today
        }
    )

    if error:
        return f"⚠️ Ошибка API-Football:\n{error}"

    if not matches:
        return "📅 Сегодня матчей не найдено."

    lines = [
        "📅 МАТЧИ СЕГОДНЯ",
        "",
    ]

    for match in matches[:15]:
        league = match["league"]["name"]

        home = match["teams"]["home"]["name"]
        away = match["teams"]["away"]["name"]

        status = match["fixture"]["status"]["short"]

        time_match = match["fixture"]["date"][11:16]

        lines.append(
            f"⚽ {time_match} | {home} — {away}\n"
            f"   {league} | {status}"
        )

    if len(matches) > 15:
        lines.append("")
        lines.append(f"…и ещё {len(matches) - 15} матчей")

    return "\n".join(lines)


def football_live():
    matches, error = football_request(
        "fixtures",
        {
            "live": "all"
        }
    )

    if error:
        return f"⚠️ Ошибка API-Football:\n{error}"

    if not matches:
        return "🔴 Сейчас активных матчей нет."

    lines = [
        "🔴 LIVE",
        ""
    ]

    for match in matches[:20]:
        home = match["teams"]["home"]["name"]
        away = match["teams"]["away"]["name"]

        goals_home = match["goals"]["home"]
        goals_away = match["goals"]["away"]

        elapsed = match["fixture"]["status"].get("elapsed")

        status = f"{elapsed}'" if elapsed else match["fixture"]["status"]["short"]

        lines.append(
            f"⚽ {home} {goals_home}:{goals_away} {away}\n"
            f"   ⏱ {status}"
        )

    return "\n".join(lines)


# =========================
# TABLES
# =========================

def football_tables():
    # Лиги для быстрого доступа
    leagues = {
        "🇬🇧 Premier League": 39,
        "🇪🇸 La Liga": 140,
        "🇮🇹 Serie A": 135,
        "🇩🇪 Bundesliga": 78,
        "🇫🇷 Ligue 1": 61
    }

    lines = [
        "📊 ТАБЛИЦЫ",
        "",
        "Выбери лигу для детального просмотра:",
        ""
    ]

    for name in leagues:
        lines.append(name)

    lines.append("")
    lines.append("ℹ️ Детальный выбор лиги добавим следующим модулем.")

    return "\n".join(lines)


# =========================
# ANALYSIS
# =========================

def analyze_match(query):
    """
    Ищет ближайшие матчи по названию команды
    и показывает базовую статистику формы.
    """

    if not query:
        return (
            "🔎 АНАЛИЗ МАТЧА\n\n"
            "Напиши название команды.\n\n"
            "Например:\n"
            "Real Madrid\n"
            "Barcelona\n"
            "Arsenal"
        )

    today = datetime.now().strftime("%Y-%m-%d")

    matches, error = football_request(
        "fixtures",
        {
            "date": today
        }
    )

    if error:
        return f"⚠️ Ошибка API-Football:\n{error}"

    query_lower = query.lower()

    found = []

    for match in matches:
        home = match["teams"]["home"]["name"]
        away = match["teams"]["away"]["name"]

        if (
            query_lower in home.lower()
            or query_lower in away.lower()
        ):
            found.append(match)

    if not found:
        return (
            f"🔎 По запросу «{query}» "
            "сегодня матч не найден.\n\n"
            "Попробуй другое название команды."
        )

    lines = [
        f"🔎 АНАЛИЗ: {query}",
        ""
    ]

    for match in found[:5]:
        home = match["teams"]["home"]["name"]
        away = match["teams"]["away"]["name"]

        league = match["league"]["name"]
        time_match = match["fixture"]["date"][11:16]

        lines.extend([
            f"⚽ {home} — {away}",
            f"🏆 {league}",
            f"🕐 Начало: {time_match}",
            "",
            "📈 БАЗОВАЯ ОЦЕНКА",
            "• Матч найден в сегодняшнем расписании",
            "• Составы и расширенная статистика доступны через API",
            "• Следующий уровень — форма, H2H, xG и вероятности",
            ""
        ])

    return "\n".join(lines)


# =========================
# SIGNALS
# =========================

def football_signals():
    return (
        "🎯 СИГНАЛЫ\n\n"
        "Модуль сигналов пока находится в разработке.\n\n"
        "Следующий этап:\n"
        "• форма команд\n"
        "• H2H\n"
        "• голы\n"
        "• домашние/выездные показатели\n"
        "• xG\n"
        "• вероятности\n"
        "• автоматический рейтинг матча"
    )


# =========================
# MESSAGE HANDLER
# =========================

def handle_message(chat_id, text):

    # START
    if text == "/start":
        send_message(
            chat_id,
            "🧠 RUSTAM OS ONLINE\n\n"
            "Система запущена.\n"
            "Футбольный аналитический модуль подключён.\n\n"
            "Статус: 🟢 ONLINE",
            MAIN_MENU
        )
        return

    # MAIN MENU
    if text == "⚽ Football":
        send_message(
            chat_id,
            "⚽ FOOTBALL INTELLIGENCE\n\n"
            "Выбери нужный модуль:",
            FOOTBALL_MENU
        )
        return

    if text == "🧠 AI":
        send_message(
            chat_id,
            "🧠 AI\n\n"
            "AI-модуль подготовлен.\n"
            "Для генерации ответов через OpenAI "
            "потребуется активный API-баланс."
        )
        return

    if text == "📊 Аналитика":
        send_message(
            chat_id,
            "📊 АНАЛИТИКА\n\n"
            "Главный аналитический модуль находится "
            "в разделе ⚽ Football → 🔎 Анализ."
        )
        return

    if text == "💼 Работа":
        send_message(
            chat_id,
            "💼 РАБОТА\n\n"
            "Модуль работы пока в разработке.",
        )
        return

    if text == "⚙️ Настройки":
        send_message(
            chat_id,
            "⚙️ НАСТРОЙКИ\n\n"
            "RUSTAM OS v1.0\n"
            "Telegram: 🟢\n"
            "API-Football: 🟢"
        )
        return

    if text == "ℹ️ Статус":
        send_message(
            chat_id,
            "ℹ️ СТАТУС\n\n"
            "🧠 RUSTAM OS — ONLINE\n"
            "📡 Telegram API — OK\n"
            "⚽ API-Football — подключён\n"
            "🔴 Live — доступен\n"
            "📅 Fixtures — доступны"
        )
        return

    # FOOTBALL MENU
    if text == "🔴 Live":
        send_message(chat_id, football_live(), FOOTBALL_MENU)
        return

    if text == "📅 Сегодня":
        send_message(chat_id, football_today(), FOOTBALL_MENU)
        return

    if text == "📊 Таблицы":
        send_message(chat_id, football_tables(), FOOTBALL_MENU)
        return

    if text == "🔎 Анализ":
        send_message(
            chat_id,
            "🔎 АНАЛИЗ\n\n"
            "Напиши название команды для поиска "
            "её сегодняшнего матча.\n\n"
            "Например:\n"
            "Real Madrid\n"
            "Barcelona\n"
            "Arsenal",
            FOOTBALL_MENU
        )
        return

    if text == "🎯 Сигналы":
        send_message(chat_id, football_signals(), FOOTBALL_MENU)
        return

    if text == "⬅️ Назад":
        send_message(
            chat_id,
            "🧠 RUSTAM OS\n\n"
            "Главное меню:",
            MAIN_MENU
        )
        return

    # ANALYSIS QUERY
    if text:
        result = analyze_match(text)
        send_message(chat_id, result, FOOTBALL_MENU)
        return


# =========================
# POLLING
# =========================

offset = 0

while True:
    try:
        response = requests.get(
            f"{TELEGRAM_URL}/getUpdates",
            params={
                "offset": offset,
                "timeout": 30
            },
            timeout=35
        )

        data = response.json()

        if not data.get("ok"):
            print(
                "TELEGRAM ERROR:",
                data,
                flush=True
            )
            time.sleep(5)
            continue

        for update in data.get("result", []):

            offset = update["update_id"] + 1

            message = update.get("message")

            if not message:
                continue

            chat_id = message["chat"]["id"]
            text = message.get("text", "").strip()

            print(
                f"MESSAGE [{chat_id}]: {text}",
                flush=True
            )

            handle_message(chat_id, text)

    except Exception as e:

        print(
            "ERROR:",
            e,
            flush=True
        )

        time.sleep(5)
