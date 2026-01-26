
import os
import json
import azure.functions as func
import openai

# Haal API key op uit omgeving
api_key = os.environ.get("OPENAI_API_KEY")
openai.api_key = api_key

def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        # -----------------------------
        # 1. JSON ophalen
        # -----------------------------
        try:
            body = req.get_json()
        except ValueError:
            return func.HttpResponse(
                json.dumps({"error": "❌ HTTP request bevat geen geldige JSON"}),
                status_code=400,
                mimetype="application/json"
            )

        leeftijd = body.get("leeftijd")       # bijv. kind, tiener, volwassene
        energie = body.get("energie")         # laag, gemiddeld, hoog
        activiteit_type = body.get("type")    # creatief, spel, leerzaam, fysiek

        if not (leeftijd and energie and activiteit_type):
            return func.HttpResponse(
                json.dumps({"error": "❌ Ontbrekende parameters: leeftijd, energie, type zijn verplicht"}),
                status_code=400,
                mimetype="application/json"
            )

        # -----------------------------
        # 2. Prompt samenstellen
        # -----------------------------
        prompt = (
            f"Genereer één leuke challenge voor iemand met deze kenmerken:\n"
            f"- Leeftijd: {leeftijd}\n"
            f"- Energie-niveau: {energie}\n"
            f"- Type activiteit: {activiteit_type}\n"
            f"De challenge moet kort, duidelijk en leuk zijn. Geef alleen de challenge-tekst, geen uitleg."
        )

        # -----------------------------
        # 3. OpenAI aanroepen
        # -----------------------------
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4o-mini",  # of gpt-4.1 voor hogere kwaliteit
                messages=[
                    {"role": "system", "content": "Je bent een creatieve assistent die leuke challenges bedenkt."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.8  # iets creatiever
            )

            challenge = response.choices[0].message["content"]

            return func.HttpResponse(
                json.dumps({"challenge": challenge}),
                status_code=200,
                mimetype="application/json"
            )

        except Exception as e:
            return func.HttpResponse(
                json.dumps({"error": f"❌ OpenAI fout: {str(e)}"}),
                status_code=500,
                mimetype="application/json"
            )

    except Exception as e:
        return func.HttpResponse(
            json.dumps({"error": f"❌ Interne serverfout: {str(e)}"}),
            status_code=500,
            mimetype="application/json"
        )
