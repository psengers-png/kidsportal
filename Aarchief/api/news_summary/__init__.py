import azure.functions as func
import logging
import feedparser
import os

# Azure Functions app
# Je gebruikt hier geen FunctionApp decorator, alleen main() als entrypoint
# dus deze lijn is optioneel
# app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)

# ---- CONFIG ----
RSS_FEEDS = {
    "VoetbalPrimeur – Algemeen": "https://www.voetbalprimeur.nl/feed/news.xml",
    "VoetbalPrimeur – Ajax": "https://www.voetbalprimeur.nl/feed/news.xml?tag=ajax",
    "NU.nl – Algemeen": "https://www.nu.nl/rss/Algemeen"
}
MAX_ARTICLES_PER_FEED = 5

# ---- HELPERS ----
def fetch_news():
    """
    Haal nieuwsartikelen op per bron en return een dict: { bron: [artikelen] }
    Dubbele links worden verwijderd zodat artikelen niet dubbel verschijnen.
    """
    grouped_articles = {}
    seen_links = set()

    for source, url in RSS_FEEDS.items():
        feed = feedparser.parse(url)
        articles = []

        for entry in feed.entries[:MAX_ARTICLES_PER_FEED]:
            link = entry.get("link", "")
            if not link or link in seen_links:
                continue
            seen_links.add(link)

            summary = getattr(entry, "summary", getattr(entry, "description", ""))

            articles.append({
                "title": entry.get("title", ""),
                "summary": summary,
                "link": link
            })

        grouped_articles[source] = articles

    return grouped_articles

def build_html(grouped_articles):
    """
    Bouw de HTML output alleen met originele artikelen per bron
    """
    html_articles = ""
    for source, articles in grouped_articles.items():
        if not articles:
            continue
        html_articles += f"<h2>{source}</h2>"
        for a in articles:
            html_articles += f"""
            <div style="margin-bottom:16px;">
                <a href="{a['link']}" target="_blank" style="font-size:16px; text-decoration:none; color:#1a0dab;">
                    {a['title']}
                </a>
                <div style="color:#555; font-size:14px;">
                    {a['summary']}
                </div>
            </div>
            """

    return f"""
    <html>
    <body style="font-family:Segoe UI, Arial, sans-serif; background-color:#f6f6f6; padding:20px;">
        <div style="max-width:800px; background:#ffffff; padding:24px; border-radius:8px;">
            <h1 style="margin-top:0;">📰 Ochtendnieuws</h1>
            
            <div style="max-width:500px">
  <div style="position:relative;overflow:hidden;width:100%;padding-bottom:calc(100% + 43px)">
    <iframe style="position:absolute;top:0;left:0;bottom:0;right:0;width:100%;height:100%" 
            title="widget" frameBorder="0" scrolling="no" loading="lazy" 
            src="https://www.weeronline.nl/widget/radar?id=4058458&circle=true&noAnalytics=true">
    </iframe>
  </div>
</div>
            {html_articles}
            <hr>
            <div style="font-size:12px; color:#888;">
                Automatisch gegenereerd via Azure Functions
            </div>
        </div>
    </body>
    </html>
    """

# ---- MAIN FUNCTION ----
def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info("News summary triggered")

    try:
        grouped_articles = fetch_news()
        html = build_html(grouped_articles)
        return func.HttpResponse(html, status_code=200, mimetype="text/html")
    except Exception as e:
        logging.exception("Fout bij genereren nieuws")
        return func.HttpResponse(f"Fout: {str(e)}", status_code=500)
