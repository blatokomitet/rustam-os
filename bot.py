import os
import time
import requests

TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")

if not TOKEN:
    raise RuntimeError("TELEGRAM_BOT_TOKEN не найден")

URL = f"https://api.telegram.org/bot{TOKEN}"

print("🧠 RUSTAM OS ONLINE")

offset = 0

while True:
    try:
        response = requests.get(
            f"{URL}/getUpdates",
            params={
                "offset": offset,
                "timeout": 30
            },
            timeout=35
        )

        data = response.json()

        if not data.get("ok"):
            print("Telegram API error:", data)
            time.sleep(5)
            continue

        for update in data["result"]:
            offset = update["update_id"] + 1

            message = update.get("message")

            if not message:
                continue

            chat_id = message["chat"]["id"]
            text = message.get("text", "")

            if text == "/start":
                reply = (
                    "🧠 RUSTAM OS ONLINE\n\n"
                    "Система запущена.\n"
                    "Это первая версия твоего личного AI-ассистента.\n\n"
                    "Статус: 🟢 ONLINE"
                )
            else:
                reply = f"Получил сообщение:\n\n{text}"

            requests.post(
                f"{URL}/sendMessage",
                json={
                    "chat_id": chat_id,
                    "text": reply
                },
                timeout=10
            )

    except Exception as e:
        print("ERROR:", e)
        time.sleep(5)
