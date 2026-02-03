import os
from azure.data.tables import TableServiceClient
from azure.core.exceptions import ResourceNotFoundError
import logging
import azure.functions as func

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Processing subscription check request.')

    # Get the user parameter from the query string
    user = req.params.get('user')
    logging.debug(f"Received user parameter: {user}")
    if not user:
        logging.error("Missing 'user' parameter in the request.")
        return func.HttpResponse(
            "Missing 'user' parameter.",
            status_code=400
        )

    # Azure Table Storage connection
    connection_string = os.getenv('AZURE_STORAGE_CONNECTION_STRING')
    logging.debug(f"Retrieved connection string: {connection_string is not None}")
    if not connection_string:
        logging.error("Azure Storage connection string is not set.")
        return func.HttpResponse(
            "Server configuration error.",
            status_code=500
        )

    try:
        # Connect to the table service
        logging.info("Connecting to Azure Table Storage...")
        table_service = TableServiceClient.from_connection_string(conn_str=connection_string)
        table_client = table_service.get_table_client(table_name="Kidsportal")
        logging.info("Connected to Kidsportal table.")

        # Query the table for the user
        try:
            logging.info(f"Attempting to retrieve entity for user: {user}")
            entity = table_client.get_entity(partition_key="subscriptions", row_key=user)
            logging.info(f"User {user} found in storage. Entity: {entity}")

            # Check subscription status
            has_subscription = entity.get("isActive", False)
            logging.debug(f"Subscription status for user {user}: {has_subscription}")

            # Return the subscription status
            return func.HttpResponse(
                body=f"{{\"hasSubscription\": {str(has_subscription).lower()}}}",
                mimetype="application/json",
                status_code=200
            )
        except ResourceNotFoundError:
            logging.warning(f"User {user} not found in storage.")
            return func.HttpResponse(
                body="{\"error\": \"User not found.\"}",
                mimetype="application/json",
                status_code=404
            )

        # Save user data if it doesn't exist
        try:
            logging.info(f"Attempting to save user {user} to storage.")
            entity = {
                "PartitionKey": "subscriptions",
                "RowKey": user,
                "isActive": True  # Default value for new users
            }
            table_client.upsert_entity(entity)
            logging.info(f"User {user} added to storage.")
        except Exception as e:
            logging.error(f"Error saving user data: {e}")
            return func.HttpResponse(
                body="{\"error\": \"Failed to save user data.\"}",
                mimetype="application/json",
                status_code=500
            )

    except Exception as e:
        logging.error(f"Error accessing Azure Table Storage: {e}")
        return func.HttpResponse(
            "Error checking subscription status.",
            status_code=500
        )