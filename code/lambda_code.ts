export function getCodeLambdaA(): string {
    return "import random\n" +
    "\n" +
    "\n" +
    "def lambda_handler(event, context):\n" +
    "    \"\"\"Generate event for results processing.\"\"\"\n" +
    "    response = {\n" +
    "        \"results\": random.choice([True, False])\n" +
    "    }\n" +
    "    if response[\"results\"]:\n" +
    "        response[\"orders\"] = [\n" +
    "            {\n" +
    "                \"status\": \"accepted\",\n" +
    "                \"power\": 1,\n" +
    "            },\n" +
    "            {\n" +
    "                \"status\": \"rejected\",\n" +
    "                \"power\": 2,\n" +
    "            }\n" +
    "        ]\n" +
    "    return response"
}

export function getCodeLambdaB(): string {
    return "import os\n" +
        "import boto3\n" +
        "import json\n" +
        "from typing import Any\n" +
        "import datetime as dt\n" +
        "\n" +
        "LOG_BUCKET = os.environ['LOG_BUCKET']\n" +
        "\n" +
        "\n" +
        "def save_to_s3(data: dict[str, Any], filename: str):\n" +
        "    \"\"\"Save data to the s3 bucket.\n" +
        "\n" +
        "    Parameters\n" +
        "    ----------\n" +
        "    data: dict[str, Any]\n" +
        "        The data to save to s3 bucket.\n" +
        "    filename: str\n" +
        "        The full object name for the file.\n" +
        "    \"\"\"\n" +
        "    s3 = boto3.client('s3')\n" +
        "    s3.put_object(\n" +
        "        Bucket=LOG_BUCKET,\n" +
        "        Key=f\"{filename}.json\",\n" +
        "        Body=json.dumps(data)\n" +
        "    )\n" +
        "\n" +
        "\n" +
        "def lambda_handler(event, context):\n" +
        "    \"\"\"Process order result.\"\"\"\n" +
        "    if event[\"status\"] == \"rejected\":\n" +
        "        raise ValueError(\"Order status is rejected!\")\n" +
        "    save_to_s3(data=event, filename=f\"orders/order_{dt.datetime.now(dt.timezone.utc).isoformat()}\")"
}

export function getCodePostOrdersLambda(): string {
    return "import logging\n" +
        "import json\n" +
        "import os\n" +
        "from typing import Any\n" +
        "\n" +
        "logger = logging.getLogger()\n" +
        "\n" +
        "TABLE_NAME = os.environ['DYNAMODB_TABLE_NAME']\n" +
        "\n" +
        "\n" +
        "def save_to_db(records: list[dict[str, Any]]):\n" +
        "    \"\"\"Save records to the DynamoDB table.\n" +
        "\n" +
        "    Parameters\n" +
        "    ----------\n" +
        "    records: list[dict[str, Any]]\n" +
        "        The data to save to DynamoDB.\n" +
        "    \"\"\"\n" +
        "    # saving records to the dynamoDB, let's assume it is successful\n" +
        "    logger.info(\"Records are successfully saved to the DB table %s.\", TABLE_NAME)\n" +
        "\n" +
        "\n" +
        "def lambda_handler(event, context):\n" +
        "    \"\"\"Process POST request to the API.\"\"\"\n" +
        "    logger.info(\n" +
        "        'Received %s request to %s endpoint',\n" +
        "        event[\"httpMethod\"],\n" +
        "        event[\"path\"])\n" +
        "\n" +
        "    if (orders := event['body']) is not None:\n" +
        "        logger.info(\"Orders received: %s.\", orders)\n" +
        "        save_to_db(records=orders)\n" +
        "\n" +
        "        return {\n" +
        "            \"isBase64Encoded\": False,\n" +
        "            \"statusCode\": 201,\n" +
        "            \"headers\": {\n" +
        "                \"Content-Type\": \"application/json\"\n" +
        "            },\n" +
        "            \"body\": \"\"\n" +
        "        }\n" +
        "\n" +
        "    return {\n" +
        "        \"isBase64Encoded\": False,\n" +
        "        \"statusCode\": 400,\n" +
        "        \"headers\": {\n" +
        "            \"Content-Type\": \"application/json\"\n" +
        "        },\n" +
        "        \"body\": json.dumps({\"errorMessage\": \"Request body is empty\"})\n" +
        "    }"
}