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

# Configurações do RabbitMQ
rabbitmq_user = "is"
rabbitmq_password = "is"
rabbitmq_host = "rabbitmq"
rabbitmq_port = 5672
queue_name = "queue"

# URL de conexão com o RabbitMQ
rabbitmq_url = f"amqp://is:is@rabbitmq:5672/is"

# Coordenadas geográficas específicas para alguns países
country_coordinates = {
    "Germany": {"latitude": 51.1657, "longitude": 10.4515},
    "Italy": {"latitude": 41.8719, "longitude": 12.5674},
    "USA": {"latitude": 37.0902, "longitude": -95.7129},
    "Japan": {"latitude": 36.2048, "longitude": 138.2529},
    "Sweden": {"latitude": 60.1282, "longitude": 18.6435},
    "United Kingdom": {"latitude": 55.3781, "longitude": -3.4360},
    "South Korea": {"latitude": 35.9078, "longitude": 127.7669},
    "Netherlands": {"latitude": 52.3676, "longitude": 4.9041},
    "France": {"latitude": 46.6031, "longitude": 1.8883},
}

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

            # Atribuir coordenadas geográficas específicas para alguns países
            coordinates = country_coordinates.get(country_name, {"latitude": "N/A", "longitude": "N/A"})

            print(f"País: {country_name}, Latitude: {coordinates['latitude']}, Longitude: {coordinates['longitude']}")

    except ET.ParseError as e:
        print(f"Erro ao analisar o arquivo XML '{file_name}': {e}")
    except psycopg2.Error as e:
        print(f"Erro ao executar a query SQL: {e}")

if __name__ == "__main__":
    rabbitmq_connection, rabbitmq_channel = connect_rabbitmq()
    postgresql_connection = connect_postgresql()

    try:
        consume_message(rabbitmq_channel, postgresql_connection)
    finally:
        rabbitmq_connection.close()
        postgresql_connection.close()
