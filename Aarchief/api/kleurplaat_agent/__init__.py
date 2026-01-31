import os
import json
import base64
from io import BytesIO
import azure.functions as func
from openai import OpenAI

# Haal API key op uit local.settings of omgeving
api_key = os.environ.get("OPENAI_API_KEY")
if not api_key:
    raise ValueError("OPENAI_API_KEY is not set in environment variables")
client = OpenAI(api_key=api_key)

def main(req: func.HttpRequest) -> func.HttpResponse:
    # CORS headers to allow requests from the static site
    cors_headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
    }

    # Handle preflight OPTIONS request
    if req.method == "OPTIONS":
        return func.HttpResponse(status_code=204, headers=cors_headers)

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
                mimetype="application/json",
                headers=cors_headers
            )

        wie = body.get("wie")
        waar = body.get("waar")
        activiteit = body.get("activiteit")
        foto_base64 = body.get("foto_base64")  # optioneel

        # -----------------------------
        # 2. Modus bepalen
        # -----------------------------
        if foto_base64:
            modus = "foto"
        elif wie and waar and activiteit:
            modus = "prompt"
        else:
            return func.HttpResponse(
                json.dumps({"error": "❌ Geen foto en geen geldige prompt ontvangen"}),
                status_code=400,
                mimetype="application/json",
                headers=cors_headers
            )

        # -----------------------------
        # 3. Prompt samenstellen
        # -----------------------------
        if modus == "prompt":
            prompt = (
                f"Een klassieke zwart-witte kleurplaat van {wie} die {activiteit} doet in {waar}. "
"Eenvoudige, rustige lijntekening in traditionele kleurboekstijl. "
<<<<<<< HEAD
"Alleen dikke, duidelijke zwarte lijnen, witte achtergrond. "
=======
>>>>>>> ea4c950e1bfb93078502bb0603a0ff798e167d9f
"Geen kleur, geen grijs, geen schaduwen, geen patronen. "
"Grote vormen, weinig details, kindvriendelijk. "
"Zoals een ouderwets kleurboek voor kinderen van 6 tot 10 jaar."
     
            )
        elif modus == "foto":
            # 1. Foto naar GPT-4 Vision sturen voor beschrijving
            try:
                from openai import OpenAI
                import requests
                # Gebruik de OpenAI Vision API (voorbeeld, vereist juiste endpoint en API key)
                vision_client = OpenAI(api_key=api_key)
                # Zet de afbeelding om naar base64 string (zonder data:image/png;base64, header)
                if "," in foto_base64:
                    _, encoded = foto_base64.split(",", 1)
                else:
                    encoded = foto_base64
                # Maak een prompt voor de vision-analyse
                vision_prompt = [
                    {"type": "text", "text": "Beschrijf deze foto kort en duidelijk, zodat ik er een kleurplaat van kan maken voor kinderen van 6 tot 9 jaar."},
                    {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{encoded}"}}
                ]
                # Probeer eerst gpt-4-vision, anders gpt-4o (OpenAI kan modelnamen wijzigen)
                vision_model = "gpt-4-vision"
                try:
                    vision_response = vision_client.chat.completions.create(
                        model=vision_model,
                        messages=[{"role": "user", "content": vision_prompt}],
                        max_tokens=100
                    )
                except Exception as e:
                    # Fallback naar gpt-4o indien beschikbaar
                    if "model_not_found" in str(e) or "404" in str(e):
                        vision_model = "gpt-4o"
                        vision_response = vision_client.chat.completions.create(
                            model=vision_model,
                            messages=[{"role": "user", "content": vision_prompt}],
                            max_tokens=100
                        )
                    else:
                        raise
                beschrijving = vision_response.choices[0].message.content.strip()
            except Exception as e:
                return func.HttpResponse(
                    json.dumps({"error": f"❌ Fout bij GPT-4 Vision analyse: {str(e)}"}),
                    status_code=400,
                    mimetype="application/json",
                    headers=cors_headers
                )
            # 2. Gebruik deze beschrijving als prompt voor DALL·E
            prompt = (
                f"Een zwart-witte kleurplaat van: {beschrijving}. "
                "Eenvoudige lijntekening in outline-stijl, zoals in een kleurboek. "
                "Alleen dikke, duidelijke zwarte lijnen. "
                "Geen kleur, geen grijswaarden, geen schaduwen, geen texturen. "
                "Witte achtergrond. "
                "Gesloten vormen, weinig details, geen overlappende lijnen. "
                "Vectorstijl, line art, printbaar als werkblad. "
                "Geschikt om in te kleuren voor een kind van 6 tot 9 jaar."
            )
            )

        # -----------------------------
        # 4. Foto converteren (indien aanwezig)
        # -----------------------------
        image_file = None

        # -----------------------------
        # 5. OpenAI aanroepen
        # -----------------------------

        try:
            # Zowel voor prompt als foto nu DALL·E met gegenereerde prompt
            result = client.images.generate(
                model="dall-e-2",
                prompt=prompt,
                n=1,
                size="1024x1024",
                response_format="b64_json"
            )

            # Base64 ophalen
            image_base64_out = result.data[0].b64_json
            image_data_uri = f"data:image/png;base64,{image_base64_out}"

            return func.HttpResponse(
                json.dumps({"image_data_uri": image_data_uri}),
                status_code=200,
                mimetype="application/json",
                headers=cors_headers
            )

        except Exception as e:
            msg = str(e)
            if "moderation" in msg.lower() or "policy" in msg.lower():
                return func.HttpResponse(
                    json.dumps({"error": "❌ Deze combinatie kan helaas geen kleurplaat opleveren"}),
                    status_code=400,
                    mimetype="application/json",
                    headers=cors_headers
                )
            return func.HttpResponse(
                json.dumps({"error": f"❌ Kleurplaat-agent fout: {msg}"}),
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
