# kidsportal/__init__.py
import azure.functions as func
import os

def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        # home.html staat in wwwroot
        html_path = os.path.join(os.getcwd(), "wwwroot", "home.html")
        with open(html_path, "r", encoding="utf-8") as f:
            html_content = f.read()
        return func.HttpResponse(html_content, mimetype="text/html")
    except Exception as e:
        return func.HttpResponse(f"Fout bij laden van HTML: {e}", status_code=500)
