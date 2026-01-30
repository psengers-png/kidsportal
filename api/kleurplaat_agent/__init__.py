import os
import json
import base64
from io import BytesIO
import azure.functions as func
from openai import OpenAI, APIError

# Haal API key op uit local.settings of omgeving
api_key = os.environ.get("OPENAI_API_KEY")
client = OpenAI(api_key=api_key)

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
                mimetype="application/json"
            )

        # -----------------------------
        # 3. Prompt samenstellen
        # -----------------------------
        if modus == "prompt":
            prompt = f"Een kleurplaat van {wie} die {activiteit} doet in {waar}"
        else:
            prompt = "Maak er een zwart-wit lijntekening/kleurplaat van deze foto"

        # -----------------------------
        # 4. Foto converteren (indien aanwezig)
        # -----------------------------
        image_file = None
        if modus == "foto":
            try:
                # Base64 omzetten naar bytes
                if "," in foto_base64:
                    header, encoded = foto_base64.split(",", 1)
                else:
                    encoded = foto_base64
                foto_bytes = base64.b64decode(encoded)

                # Bestandstype detecteren
                if "image/png" in foto_base64:
                    fmt = "png"
                elif "image/jpeg" in foto_base64 or "image/jpg" in foto_base64:
                    fmt = "jpeg"
                elif "image/webp" in foto_base64:
                    fmt = "webp"
                else:
                    return func.HttpResponse(
                        json.dumps({"error": "❌ Ongeldig afbeeldingstype, alleen PNG/JPG/WEBP ondersteund"}),
                        status_code=400,
                        mimetype="application/json"
                    )

                # Wrap in BytesIO voor OpenAI
                image_file = BytesIO(foto_bytes)
                image_file.name = f"upload.{fmt}"

            except Exception as e:
                return func.HttpResponse(
                    json.dumps({"error": f"❌ Fout bij verwerken van foto: {str(e)}"}),
                    status_code=400,
                    mimetype="application/json"
                )

        # -----------------------------
        # 5. OpenAI aanroepen
        # -----------------------------
        try:
            if modus == "foto":
                # Image-to-image (edit)
                result = client.images.edit(
                    image=image_file,
                    prompt=prompt,
                    model="dall-e-2",
                    n=1,
                    size="1024x1024",
                    response_format="b64_json"
                )
            else:
                # Prompt-based generation
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
                mimetype="application/json"
            )

        except APIError as e:
            msg = str(e)
            if "moderation" in msg.lower() or "policy" in msg.lower():
                return func.HttpResponse(
                    json.dumps({"error": "❌ Deze combinatie kan helaas geen kleurplaat opleveren"}),
                    status_code=400,
                    mimetype="application/json"
                )
            return func.HttpResponse(
                json.dumps({"error": f"❌ Kleurplaat-agent fout: {msg}"}),
                status_code=500,
                mimetype="application/json"
            )
        except Exception as e:
            return func.HttpResponse(
                json.dumps({"error": f"❌ Kleurplaat-agent fout: {str(e)}"}),
                status_code=500,
                mimetype="application/json"
            )

    except Exception as e:
        return func.HttpResponse(
            json.dumps({"error": f"❌ Interne serverfout: {str(e)}"}),
            status_code=500,
            mimetype="application/json"
        )
