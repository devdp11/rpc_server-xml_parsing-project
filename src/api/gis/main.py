import sys

from flask import Flask, request
from utils.database import Database
from flask_cors import CORS
PORT = int(sys.argv[1]) if len(sys.argv) >= 2 else 9000

app = Flask(__name__)
app.config["DEBUG"] = True

from flask import jsonify
database = Database
CORS(app)

@app.route('/api/markers', methods=['GET'])
def get_markers():
    try:
        sql = (
            'SELECT b.id as brand_id, b.name as brand_name, b.country_id, '
            'c.name as country_name, c.geom as country_geom '
            'FROM brands b '
            'JOIN countries c ON b.country_id = c.id'
        )

        result = list(database.selectAll(sql))

        markers = []
        for data in result:
            if data[4] is not None and 'coordinates' in data[4]:
                coordinates = data[4]['coordinates']
                if isinstance(coordinates, list) and len(coordinates) == 2:
                    marker = {
                        "type": "feature",
                        "geometry": {
                            "type": "Point",
                            "coordinates": [float(coordinates[0]), float(coordinates[1])]
                        },
                        "properties": {
                            "id": data[0],
                            "name": data[1],
                            "country": data[3],
                        }
                    }
                    markers.append(marker)

        return jsonify(markers)

    except Exception as e:
        return f"Ocorreu um erro: {str(e)}"

@app.route('/api/v1/upmarkers', methods=['PATCH'])
def update_markers():
    try:
        data = request.get_json()

        country = data.get("country")
        latitude = data.get("latitude")
        longitude = data.get("longitude")

        print(f"API called with data: Country: {country}, Latitude: {latitude}, Longitude: {longitude}")

        if country and latitude is not None and longitude is not None:
            sql = (
                'UPDATE countries '
                'SET geom = \'{"type": "Point", "coordinates": [' + str(longitude) + ', ' + str(latitude) + ']}\'::jsonb '
                'WHERE name = %s'
            )
            database.update(sql, values=(country,))

            return "Data updated successfully!"
        else:
            return "Invalid data received."

    except Exception as e:
        return f"An error occurred: {str(e)}"
    
@app.route('/api/v1/clear-geom', methods=['DELETE'])
def clear_geom():
    try:
        sql = 'UPDATE countries SET geom = NULL'
        database.update(sql)

        return "Geom Data removed successfully!"
    except Exception as e:
        return f"Error: {str(e)}"


if __name__ == '__main__':
    database = Database()
    app.run(host="0.0.0.0", port=PORT)
