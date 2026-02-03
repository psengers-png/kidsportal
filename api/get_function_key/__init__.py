import os
import logging
import azure.functions as func

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Processing request for Azure Function Key.')

    # Retrieve the Azure Function Key from environment variables
    function_key = os.getenv('AZURE_FUNCTION_KEY')

    if not function_key:
        logging.error('Azure Function Key not found in environment variables.')
        return func.HttpResponse(
            "Azure Function Key not configured.",
            status_code=500
        )

    # Return the Azure Function Key
    return func.HttpResponse(function_key, status_code=200)