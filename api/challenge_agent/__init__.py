
import os
import json
import azure.functions as func
from openai import OpenAI

# Haal API key op uit omgeving
api_key = os.environ.get("OPENAI_API_KEY")
if not api_key:
    raise ValueError("OPENAI_API_KEY is not set in environment variables")
client = OpenAI(api_key=api_key)

def main(req: func.HttpRequest) -> func.HttpResponse:
    # CORS headers
    cors_headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
    }

    # Handle preflight OPTIONS
    if req.method == "OPTIONS":
        return func.HttpResponse(status_code=204, headers=cors_headers)

    try:
        # JSON ophalen
        try:
            body = req.get_json()
        except ValueError:
            return func.HttpResponse(
                json.dumps({"error": "❌ HTTP request bevat geen geldige JSON"}),
                status_code=400,
                mimetype="application/json",
                headers=cors_headers
            )

        energie = body.get("energie")
        activiteit_type = body.get("type")

        if not (energie and activiteit_type):
            return func.HttpResponse(
                json.dumps({"error": "❌ Ontbrekende parameters: energie en type zijn verplicht"}),
                status_code=400,
                mimetype="application/json",
                headers=cors_headers
            )

        # Prompt samenstellen
        prompt = (
            f"Genereer één leuke challenge voor een kind van 5-10 jaar met deze kenmerken:\n"
            f"- Energie-niveau: {energie}\n"
            f"- Type activiteit (categorie): {activiteit_type} (keuze uit: Knutselen, Kleuren, Puzzel, Kennis, Buiten, Natuur)\n"
            f"De challenge moet kort, duidelijk en leuk zijn. Geef alleen de challenge-tekst, geen uitleg."
        )

        # OpenAI aanroepen (moderne client)
        try:
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "Je bent een creatieve assistent die leuke challenges bedenkt."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.8
            )

            challenge = response.choices[0].message.content

            return func.HttpResponse(
                json.dumps({"challenge": challenge}),
                status_code=200,
                mimetype="application/json",
                headers=cors_headers
            )

        except Exception as e:
            return func.HttpResponse(
                json.dumps({"error": f"❌ OpenAI fout: {str(e)}"}),
                status_code=500,
                mimetype="application/json",
                headers=cors_headers
            )

    except Exception as e:
        return func.HttpResponse(
            json.dumps({"error": f"❌ Interne serverfout: {str(e)}"}),
            status_code=500,
            mimetype="application/json",
            headers=cors_headers
        )
