import logging
import azure.functions as func

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.warning('Blocked request to deprecated get_function_key endpoint.')
    return func.HttpResponse(
        "Endpoint disabled for security reasons.",
        status_code=410
    )