import os
import json
import azure.functions as func
from openai import OpenAI

# Haal API key op uit omgeving
api_key = os.environ.get("OPENAI_API_KEY")
if not api_key:
    raise ValueError("OPENAI_API_KEY is not set in environment variables")
client = OpenAI(api_key=api_key)
raw_model_name = (os.environ.get("OPENAI_MODEL") or "gpt-5").strip()
model_name = (raw_model_name.rstrip(" .,;:") or "gpt-5")

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
            f"Acteer als een creatieve assistent en genereer een leuke, unieke challenge voor een kind van 5-10 jaar met deze kenmerken:\n"
            f"- Energie-niveau: {energie}\n"
            f"- Type activiteit (categorie): {activiteit_type} (keuze uit: Knutselen, Kleuren, Puzzel, Kennis, Buiten, Natuur)\n"
            f"Regels:\n"
            f"- De challenge moet kort, duidelijk en leuk zijn (1-2 zinnen).\n"
            f"- Geef alleen de challenge-tekst, geen uitleg of stappenplan.\n"
            f"- Als de categorie NIET 'Buiten' of 'Natuur' is, moet de challenge expliciet BINNEN plaatsvinden.\n"
            f"- Vermijd alles wat buiten, natuur, weer, parken, bos, tuin, strand of straat impliceert tenzij de categorie 'Buiten' of 'Natuur' is.\n"
            f"- Gebruik alleen huis-, kamer- of tafelmaterialen voor binnen-categorieen."
        )

        # OpenAI aanroepen (moderne client)
        try:
            response = client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": "Je bent een creatieve assistent die leuke challenges bedenkt voor kinderen van 5 tot 10 jaar."},
                    {"role": "user", "content": prompt}
                ]
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
