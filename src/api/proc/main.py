import sys

from flask import Flask, request
from flask_cors import CORS
from xmlrpc.client import ServerProxy

PORT = int(sys.argv[1]) if len(sys.argv) >= 2 else 9000

app = Flask(__name__)
app.config["DEBUG"] = True

CORS(app)

@app.route('/api/brands', methods=['GET'])
def fetch_brands():
    server = ServerProxy("http://rpc-server:9000")

    try:
        return server.fetch_brands()
    except Exception as exception:
        print(exception)
        return []
    
@app.route('/api/years', methods=['GET'])
def fetch_years():
    server = ServerProxy("http://rpc-server:9000")

    try:
        return server.fetch_years()
    except Exception as exception:
        print(exception)
        return []

@app.route('/api/models', methods=['GET'])
def fetch_models():
    server = ServerProxy("http://rpc-server:9000")

    try:
        return server.fetch_models()
    except Exception as exception:
        print(exception)
        return []

@app.route('/api/countries', methods=['GET'])
def fetch_countries():
    server = ServerProxy("http://rpc-server:9000")

    try:
        return server.fetch_countries()
    except Exception as exception:
        print(exception)
        return []

@app.route('/api/modelsByBrand', methods=['GET'])
def fetch_models_by_brand():
    server = ServerProxy("http://rpc-server:9000")

    try:
        brand_name = request.args.get('brand_name')
        return server.fetch_models_by_brand(brand_name)
    except Exception as exception:
        print(exception)
        return []

@app.route('/api/brandsByCountry', methods=['GET'])
def fetch_brands_by_country():
    server = ServerProxy("http://rpc-server:9000")

    try:
        country_name = request.args.get('country_name')
        return server.fetch_brands_by_country(country_name)
    except Exception as exception:
        print(exception)
        return []

@app.route('/api/vehicles', methods=['GET'])
def fetch_vehicles():
    server = ServerProxy("http://rpc-server:9000")

    try:
        sorting_option = request.args.get('sort', 'asc')
        year = request.args.get('year')
        return server.fetch_vehicles(sorting_option, year)
    except Exception as exception:
        print(exception)
        return []

@app.route('/api/vehiclesByBrand', methods=['GET'])
def fetch_vehicles_by_brand():
    server = ServerProxy("http://rpc-server:9000")

    try:
        brand_name = request.args.get('brand_name')
        sorting_option = request.args.get('sort', 'asc')
        year = request.args.get('year')
        return server.fetch_vehicles_by_brand(brand_name, sorting_option, year)
    except Exception as exception:
        print(exception)
        return []

@app.route('/api/brandsCount', methods=['GET'])
def fetch_count_brands():
    server = ServerProxy("http://rpc-server:9000")

    try:
        sorting_option = request.args.get('sort', 'asc')
        return server.fetch_count_brands(sorting_option)
    except Exception as exception:
        print(exception)
        return []
    
@app.route('/api/modelsCount', methods=['GET'])
def fetch_count_models():
    server = ServerProxy("http://rpc-server:9000")

    try:
        sorting_option = request.args.get('sort', 'asc')
        return server.fetch_count_models(sorting_option)
    except Exception as exception:
        print(exception)
        return []

@app.route('/api/vehiclesCountByCountry', methods=['GET'])
def fetch_count_vehicles_by_country():
    server = ServerProxy("http://rpc-server:9000")

    try:
        return server.fetch_count_vehicles_by_country()
    except Exception as exception:
        print(exception)
        return []

@app.route('/api/modelsStats', methods=['GET'])
def fetch_stats_models():
    server = ServerProxy("http://rpc-server:9000")

    try:
        sorting_option = request.args.get('sort', 'asc')
        return server.fetch_stats_models(sorting_option)
    except Exception as exception:
        print(exception)
        return []
    
@app.route('/api/modelsStatsByBrand', methods=['GET'])
def fetch_stats_models_by_brand():
    server = ServerProxy("http://rpc-server:9000")

    try:
        brand_name = request.args.get('brand_name')
        return server.fetch_stats_models_by_brand(brand_name)
    except Exception as exception:
        print(exception)
        return []
    
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=PORT)