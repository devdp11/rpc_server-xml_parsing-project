import json
import pika
import xml.etree.ElementTree as ET
import psycopg2
import requests

rabbitmq_user = "is"
rabbitmq_password = "is"
rabbitmq_host = "rabbitmq"
rabbitmq_port = 5672
queue_name = "UPDATE_GIS"

rabbitmq_url = f"amqp://is:is@rabbitmq:5672/is"

db_user = "is"
db_password = "is"
db_name = "is"
db_host = "db-xml"
db_port = "5432"

def connectrabbitmq():
    parameters = pika.URLParameters(rabbitmq_url)
    connection = pika.BlockingConnection(parameters)
    channel = connection.channel()
    print("Conection sucessfull with rabbitMQ.")
    return connection, channel

def connectdatabase():
    conn_str = f"host={db_host} port={db_port} user={db_user} password={db_password} dbname={db_name} sslmode=disable"
    try:
        connection = psycopg2.connect(conn_str)
        print("Conection sucessfull with database.")
        return connection
    except psycopg2.Error as e:
        print(f"Error conecting to database. {e}")
        raise

def consume_message(ch, db_connection):
    def callback(ch, method, properties, body):
        message = json.loads(body.decode('utf-8'))
        print("\nReceived successfully filename:", message["file_name"])
        parse_and_assign_geolocation(message["file_name"], db_connection)

    ch.queue_declare(queue="UPDATE_GIS", durable=True)
    ch.basic_consume(queue="UPDATE_GIS", on_message_callback=callback, auto_ack=True)
    print("Waiting for messages on 'UPDATE_GIS'.")
    ch.start_consuming()

def parse_and_assign_geolocation(file_name, db_connection):
    try:
        query = "SELECT xml FROM imported_documents WHERE file_name = %s"
        with db_connection.cursor() as cursor:
            cursor.execute(query, (file_name,))
            result = cursor.fetchone()
            if result is None:
                print(f"No data found for arquive: {file_name}")
                return

            xml_data = result[0]

        tree = ET.ElementTree(ET.fromstring(xml_data))
        root = tree.getroot()

        countries = root.findall(".//Countries/Country")

        for country in countries:
            country_name = country.get("name")
            
            location_name = country_name
            
            latitude, longitude = update_coordinates_with_nominatim(location_name)

            print(f"Country: {country_name}, Latitude: {latitude}, Longitude: {longitude}")

            send_data_to_api(country_name, latitude, longitude)

    except ET.ParseError as e:
        print(f"Error analyzing XML file: '{file_name}'. {e}")

def update_coordinates_with_nominatim(location_name):
    nominatim_url = "https://nominatim.openstreetmap.org/search"
    params = {
        "country": location_name,
        "format": "json",
    }

    try:
        response = requests.get(nominatim_url, params=params)
        response.raise_for_status()

        data = response.json()
        if data:
            latitude = data[0]["lat"]
            longitude = data[0]["lon"]
            return latitude, longitude
        else:
            print(f"No coordinates available for: {location_name}")
            return None, None

    except requests.exceptions.RequestException as e:
        print(f"Error requesting data to API Nominatim: {e}")
        return None, None
    
def send_data_to_api(country_name, latitude, longitude):
    api_url = "http://api-gis:8080/api/v1/upmarkers"

    data = {
        "country": country_name,
        "latitude": latitude,
        "longitude": longitude
    }

    try:
        response = requests.patch(api_url, json=data)
        response.raise_for_status()
        print(response.text)
    except requests.exceptions.RequestException as e:
        print(f"Error sending data to API: {e}")

if __name__ == "__main__":
    rabbitmq, rabbitmq_channel = connectrabbitmq()
    database = connectdatabase()

    try:
        consume_message(rabbitmq_channel, database)
    finally:
        rabbitmq.close()
        database.close()