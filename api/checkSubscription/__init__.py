import os
from azure.data.tables import TableServiceClient
import logging
import azure.functions as func

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Processing subscription check request.')

    # Get the user parameter from the query string
    user = req.params.get('user')
    if not user:
        return func.HttpResponse(
            "Missing 'user' parameter.",
            status_code=400
        )

    # Azure Table Storage connection
    connection_string = os.getenv('AZURE_STORAGE_CONNECTION_STRING')
    if not connection_string:
        logging.error("Azure Storage connection string is not set.")
        return func.HttpResponse(
            "Server configuration error.",
            status_code=500
        )

    try:
        # Connect to the table service
        table_service = TableServiceClient.from_connection_string(conn_str=connection_string)
        table_client = table_service.get_table_client(table_name="Kidsportal")

        # Query the table for the user
        try:
            entity = table_client.get_entity(partition_key="subscriptions", row_key=user)
            logging.info(f"User {user} found in storage. Entity: {entity}")

            # Check subscription status
            has_subscription = entity.get("isActive", False)

            # Return the subscription status
            return func.HttpResponse(
                body=f"{{\"hasSubscription\": {str(has_subscription).lower()}}}",
                mimetype="application/json",
                status_code=200
            )
        except Exception as e:
            logging.warning(f"User {user} not found or error retrieving entity: {e}")
            return func.HttpResponse(
                body="{\"error\": \"User not found or no subscription data available.\"}",
                mimetype="application/json",
                status_code=404
            )

    except Exception as e:
        logging.error(f"Error accessing Azure Table Storage: {e}")
        return func.HttpResponse(
            "Error checking subscription status.",
            status_code=500
        )