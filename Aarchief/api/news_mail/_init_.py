import logging
import requests
import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import azure.functions as func

def send_email(subject, body):
    """
    Verzendt een HTML-mail via SMTP (Gmail of andere server).
    Verwacht dat de environment variables correct zijn ingesteld.
    """
    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", 587))
    smtp_user = os.getenv("GMAIL_USER")
    smtp_pass = os.getenv("GMAIL_APP_PASSWORD")
    recipient = os.getenv("MAIL_TO")

    if not all([smtp_user, smtp_pass, recipient]):
        raise ValueError("GMAIL_USER, GMAIL_APP_PASSWORD of MAIL_TO niet ingesteld in app settings")

    msg = MIMEMultipart()
    msg["From"] = smtp_user
    msg["To"] = recipient
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "html"))

    try:
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)
        logging.info(f"Email succesvol verzonden naar {recipient}")
    except smtplib.SMTPAuthenticationError:
        logging.error("SMTP-authenticatie mislukt. Controleer GMAIL_APP_PASSWORD en GMAIL_USER.")
        raise
    except Exception as e:
        logging.error(f"Onverwachte fout bij verzenden mail: {e}")
        raise

def fetch_news_html():
    """
    Haal HTML-content op van de nieuws-API.
    NEWS_URL moet ingesteld zijn in local.settings.json of Azure Application Settings.
    """
    url = os.getenv("NEWS_URL")
    if not url:
        raise ValueError("NEWS_URL niet ingesteld in app settings")
    
    try:
        resp = requests.get(url)
        resp.raise_for_status()
        return resp.text
    except requests.RequestException as e:
        logging.error(f"Fout bij ophalen van nieuws: {e}")
        raise

def main(mytimer: func.TimerRequest):
    """
    Timer-triggered function voor dagelijkse mail.
    Zet in function.json de schedule op 0 7 * * * voor 07:00 NL tijd.
    """
    logging.info("Timer-triggered news_mail gestart")
    try:
        html = fetch_news_html()
        send_email("📰 Ochtendnieuws – Samenvatting", html)
    except Exception as e:
        logging.error(f"Fout bij verzenden mail: {e}")
