import os
import json
import azure.functions as func
from openai import OpenAI

api_key = os.environ.get("OPENAI_API_KEY")
if not api_key:
    raise ValueError("OPENAI_API_KEY is not set in environment variables")
client = OpenAI(api_key=api_key)

def main(req: func.HttpRequest) -> func.HttpResponse:
    cors_headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
    }

    if req.method == "OPTIONS":
        return func.HttpResponse(status_code=204, headers=cors_headers)

    try:
        try:
            body = req.get_json()
        except ValueError:
            return func.HttpResponse(
                json.dumps({"error": "❌ HTTP request bevat geen geldige JSON"}),
                status_code=400,
                mimetype="application/json",
                headers=cors_headers
            )

        onderwerp = body.get("onderwerp")
        stijl = body.get("stijl")
        doelgroep = body.get("doelgroep")

        if not onderwerp or not stijl or not doelgroep:
            return func.HttpResponse(
                json.dumps({"error": "❌ Ontbrekende parameters: onderwerp, stijl, doelgroep zijn verplicht"}),
                status_code=400,
                mimetype="application/json",
                headers=cors_headers
            )

        prompt = (
            f"Vertel één grappige mop over het onderwerp '{onderwerp}', in de stijl van '{stijl}', "
            f"en geschikt voor de doelgroep '{doelgroep}'. Geef alleen de mop, geen uitleg of inleiding."
        )

        try:
            response = client.chat.completions.create(
                model="gpt-4o",  # of gpt-4.1 voor hogere kwaliteit
                messages=[
                    {"role": "system", "content": "Je bent een moppentapper die altijd een leuke mop weet te vertellen."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.9
            )
            mop = response.choices[0].message.content.strip()
            return func.HttpResponse(
                json.dumps({"mop": mop}),
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
