'''import sys
import time

POLLING_FREQ = int(sys.argv[1]) if len(sys.argv) >= 2 else 60
ENTITIES_PER_ITERATION = int(sys.argv[2]) if len(sys.argv) >= 3 else 10

if __name__ == "__main__":

    while True:
        print(f"Getting up to {ENTITIES_PER_ITERATION} entities without coordinates...")
        # !TODO: 1- Use api-gis to retrieve a fixed amount of entities without coordinates (e.g. 100 entities per iteration, use ENTITIES_PER_ITERATION)
        # !TODO: 2- Use the entity information to retrieve coordinates from an external API
        # !TODO: 3- Submit the changes
        time.sleep(POLLING_FREQ)'''

import json
import pika
import xml.etree.ElementTree as ET
import psycopg2
import requests

# Configurações do RabbitMQ
rabbitmq_user = "is"
rabbitmq_password = "is"
rabbitmq_host = "rabbitmq"
rabbitmq_port = 5672
queue_name = "queue"

# URL de conexão com o RabbitMQ
rabbitmq_url = f"amqp://is:is@rabbitmq:5672/is"

# Configurações do PostgreSQL
db_user = "is"
db_password = "is"
db_name = "is"
db_host = "db-xml"
db_port = "5432"

def connect_rabbitmq():
    parameters = pika.URLParameters(rabbitmq_url)
    connection = pika.BlockingConnection(parameters)
    channel = connection.channel()
    print("Conexão bem-sucedida com o RabbitMQ")
    return connection, channel

def connect_postgresql():
    conn_str = f"host={db_host} port={db_port} user={db_user} password={db_password} dbname={db_name} sslmode=disable"
    try:
        connection = psycopg2.connect(conn_str)
        print("Conexão bem-sucedida com o PostgreSQL")
        return connection
    except psycopg2.Error as e:
        print(f"Erro ao conectar ao PostgreSQL: {e}")
        raise

def consume_message(ch, db_connection):
    def callback(ch, method, properties, body):
        message = json.loads(body.decode('utf-8'))
        print("\nRecebido o nome do arquivo da fila:", message["file_name"])
        parse_and_assign_geolocation(message["file_name"], db_connection)

    ch.basic_consume(queue=queue_name, on_message_callback=callback, auto_ack=True)
    print(f"Aguardando mensagens da fila '{queue_name}'. Para sair, pressione CTRL+C")
    ch.start_consuming()

def parse_and_assign_geolocation(file_name, db_connection):
    try:
        # Executar a query SQL para obter o XML do banco de dados
        query = "SELECT xml FROM imported_documents WHERE file_name = %s"
        with db_connection.cursor() as cursor:
            cursor.execute(query, (file_name,))
            result = cursor.fetchone()
            if result is None:
                print(f"Não foi encontrado nenhum registro para o arquivo: {file_name}")
                return

            xml_data = result[0]

        tree = ET.ElementTree(ET.fromstring(xml_data))
        root = tree.getroot()

        countries = root.findall(".//Countries/Country")

        for country in countries:
            country_name = country.get("name")
            
            # Use apenas o nome do país para a localização
            location_name = country_name
            
            # Atualiza as coordenadas usando a API Nominatim
            latitude, longitude = update_coordinates_with_nominatim(location_name)

            print(f"País: {country_name}, Latitude: {latitude}, Longitude: {longitude}")



    except ET.ParseError as e:
        print(f"Erro ao analisar o arquivo XML '{file_name}': {e}")
    except psycopg2.Error as e:
        print(f"Erro ao executar a query SQL: {e}")

def update_coordinates_with_nominatim(location_name):
    nominatim_url = "https://nominatim.openstreetmap.org/search"
    params = {
        "q": location_name,
        "format": "json",
    }

    try:
        response = requests.get(nominatim_url, params=params)
        response.raise_for_status()  # Verifica se houve erro na requisição

        data = response.json()
        if data:
            # Assume a primeira correspondência como a mais relevante
            latitude = data[0]["lat"]
            longitude = data[0]["lon"]
            return latitude, longitude
        else:
            print(f"Não foi possível encontrar coordenadas para: {location_name}")
            return None, None

    except requests.exceptions.RequestException as e:
        print(f"Erro ao fazer requisição para a API Nominatim: {e}")
        return None, None

if __name__ == "__main__":
    rabbitmq_connection, rabbitmq_channel = connect_rabbitmq()
    postgresql_connection = connect_postgresql()

    try:
        consume_message(rabbitmq_channel, postgresql_connection)
    finally:
        rabbitmq_connection.close()
        postgresql_connection.close()
