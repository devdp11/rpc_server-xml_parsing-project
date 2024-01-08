from utils.database import Database
from decimal import Decimal

def fetch_brands():
    database = Database()
    result_brands = []

    results = database.selectAll("SELECT unnest(xpath('//Brands/Brand/@name', xml)) as result FROM imported_documents WHERE deleted_on IS NULL")
    database.disconnect()

    for brand in results:
        if not brand in result_brands:
            result_brands.append(brand)

    return result_brands

def fetch_years():
    database = Database()
    result_years = []

    results = database.selectAll("SELECT unnest(xpath('//Vehicles/Car/@year', xml)) as result FROM imported_documents WHERE deleted_on IS NULL")
    database.disconnect()

    for year in results:
        if not year in result_years:
            result_years.append(year)
            
    result_years.sort()

    return result_years

def fetch_models():
    database = Database()
    result_models = []

    results = database.selectAll("SELECT unnest(xpath('//Brands/Brand/Models/Model/@name', xml)) as result FROM imported_documents WHERE deleted_on IS NULL")
    database.disconnect()

    for model in results:
        if not model in result_models:
            result_models.append(model)

    return result_models

def fetch_countries():
    database = Database()
    result_countries = []

    results = database.selectAll("SELECT unnest(xpath('//Countries/Country/@name', xml)) as result FROM imported_documents WHERE deleted_on IS NULL")
    database.disconnect()

    for country in results:
        if not country in result_countries:
            result_countries.append(country)

    return result_countries

def fetch_models_by_brand(brand_name):
    database = Database()
    result_models = []

    query = f""" SELECT unnest(xpath('//Brand[@name="{brand_name}"]/Models/Model/@name', xml)) as result FROM imported_documents WHERE deleted_on IS NULL; """

    results = database.selectAll(query)
    database.disconnect()

    for model in results:
        if not model in result_models:
            result_models.append(model)

    return result_models

def fetch_brands_by_country(country_name):
    database = Database()
    result_brands = []

    query = f""" WITH brand_data AS (
            SELECT unnest(xpath('//Brands/Brand/@id', xml))::text as brand_id, 
                unnest(xpath('//Brands/Brand/@name', xml))::text as brand_name, 
                unnest(xpath('//Brands/Brand/@country_ref', xml))::text as country_ref 
                FROM imported_documents WHERE deleted_on IS NULL )

            SELECT brand_name FROM brand_data WHERE country_ref IN ( SELECT country_id
                FROM ( SELECT unnest(xpath('//Countries/Country/@id', xml))::text as country_id, unnest(xpath('//Countries/Country/@name', xml))::text as country_name
                FROM imported_documents WHERE deleted_on IS NULL ) country_data WHERE country_name = '{country_name}' ); """

    results = database.selectAll(query)
    database.disconnect()

    for brand in results:
        if brand not in result_brands:
            result_brands.append(brand)

    return result_brands

def fetch_vehicles(sorting_option, year=None):
    database = Database()
    result_vehicles = []

    sorting_option = sorting_option.lower()
    if sorting_option not in ['asc', 'desc']:
        sorting_option = 'asc'
    
    where_clause = f"WHERE v.year = '{year}'" if year else ""

    query = f""" WITH vehicle_data AS ( SELECT 
        unnest(xpath('//Vehicles/Car/@id', xml))::text as id,
        unnest(xpath('//Vehicles/Car/@year', xml))::text as year,
        unnest(xpath('//Vehicles/Car/Engine_HP/@value', xml))::text as engine_hp,
        unnest(xpath('//Vehicles/Car/Msrp/@value', xml))::text as msrp,
        unnest(xpath('//Vehicles/Car/@brand_ref', xml))::text as brand_ref,
        unnest(xpath('//Vehicles/Car/@model_ref', xml))::text as model_ref
    FROM imported_documents WHERE deleted_on IS NULL ), 
    brand_data AS ( SELECT 
        unnest(xpath('//Brands/Brand/@id', xml))::text as brand_id, 
        unnest(xpath('//Brands/Brand/@name', xml))::text as brand_name,
        unnest(xpath('//Brands/Brand/Models/Model/@id', xml))::text as model_id,
        unnest(xpath('//Brands/Brand/Models/Model/@name', xml))::text as model_name 
    FROM imported_documents WHERE deleted_on IS NULL )
    SELECT b.brand_name, m.model_name, v.year, v.engine_hp, v.msrp FROM vehicle_data v
        JOIN brand_data b ON v.brand_ref = b.brand_id
        LEFT JOIN brand_data m ON v.model_ref = m.model_id
    {where_clause} ORDER BY v.msrp::numeric {sorting_option}"""

    results = database.selectAll(query)
    database.disconnect()

    for vehicle in results:
        result_vehicles.append(vehicle)

    return result_vehicles

def fetch_vehicles_by_brand(brand_name, sorting_option, year=None):
    database = Database()
    result_vehicles = []

    sorting_option = sorting_option.lower()
    if sorting_option not in ['asc', 'desc']:
        sorting_option = 'asc'

    where_clause = f"AND v.year = '{year}'" if year else ""

    query = f""" WITH vehicle_data AS ( SELECT 
        unnest(xpath('//Vehicles/Car/@year', xml))::text as year,
        unnest(xpath('//Vehicles/Car/Engine_HP/@value', xml))::text as engine_hp,
        unnest(xpath('//Vehicles/Car/Msrp/@value', xml))::text as msrp,
        unnest(xpath('//Vehicles/Car/@brand_ref', xml))::text as brand_ref,
        unnest(xpath('//Vehicles/Car/@model_ref', xml))::text as model_ref
    FROM imported_documents WHERE deleted_on IS NULL ), 
    brand_data AS ( SELECT 
        unnest(xpath('//Brands/Brand/@id', xml))::text as brand_id, 
        unnest(xpath('//Brands/Brand/@name', xml))::text as brand_name,
        unnest(xpath('//Brands/Brand/Models/Model/@id', xml))::text as model_id,
        unnest(xpath('//Brands/Brand/Models/Model/@name', xml))::text as model_name 
    FROM imported_documents WHERE deleted_on IS NULL )
    SELECT b.brand_name, m.model_name, v.year, v.engine_hp, v.msrp FROM vehicle_data v
        JOIN brand_data b ON v.brand_ref = b.brand_id
        LEFT JOIN brand_data m ON v.model_ref = m.model_id
        WHERE b.brand_name = '{brand_name}' {where_clause}
        ORDER BY v.msrp::numeric {sorting_option}"""

    results = database.selectAll(query)
    database.disconnect()

    for vehicle in results:
        if vehicle not in result_vehicles:
            result_vehicles.append(vehicle)

    return result_vehicles

def fetch_count_brands(sorting_option):
    database = Database()
    result_brands = []

    sorting_option = sorting_option.lower()
    if sorting_option not in ['asc', 'desc']:
        sorting_option = 'asc'

    query = f""" WITH vehicle_data AS ( SELECT 
        unnest(xpath('//Vehicles/Car/@id', xml))::text as id,
        unnest(xpath('//Vehicles/Car/@brand_ref', xml))::text as brand_ref
    FROM imported_documents WHERE deleted_on IS NULL ), 
    brand_data AS ( SELECT 
        unnest(xpath('//Brands/Brand/@id', xml))::text as brand_id, 
        unnest(xpath('//Brands/Brand/@name', xml))::text as brand_name,
        unnest(xpath('//Brands/Brand/@country_ref', xml))::text as country_ref
    FROM imported_documents WHERE deleted_on IS NULL ),
    country_data AS ( SELECT 
        unnest(xpath('//Countries/Country/@id', xml))::text as country_id,
        unnest(xpath('//Countries/Country/@name', xml))::text as country_name
    FROM imported_documents WHERE deleted_on IS NULL
    ) SELECT b.brand_name, c.country_name, COUNT(b.brand_name) AS num_brands 
    FROM vehicle_data v
    JOIN brand_data b ON v.brand_ref = b.brand_id
    LEFT JOIN country_data c ON b.country_ref = c.country_id
    GROUP BY b.brand_name, c.country_name
    ORDER BY num_brands {sorting_option}"""

    results = database.selectAll(query)
    database.disconnect()

    for brand in results:
        result_brands.append(brand)

    return result_brands

def fetch_count_models(sorting_option):
    database = Database()
    result_vehicles = []

    sorting_option = sorting_option.lower()
    if sorting_option not in ['asc', 'desc']:
        sorting_option = 'asc'

    query = f""" WITH vehicle_data AS ( SELECT 
        unnest(xpath('//Vehicles/Car/@id', xml))::text as id,
        unnest(xpath('//Vehicles/Car/@brand_ref', xml))::text as brand_ref,
        unnest(xpath('//Vehicles/Car/@model_ref', xml))::text as model_ref
    FROM imported_documents WHERE deleted_on IS NULL ), 
    brand_data AS ( SELECT 
        unnest(xpath('//Brands/Brand/@id', xml))::text as brand_id, 
        unnest(xpath('//Brands/Brand/@name', xml))::text as brand_name,
        unnest(xpath('//Brands/Brand/@country_ref', xml))::text as country_ref,
        unnest(xpath('//Brands/Brand/Models/Model/@id', xml))::text as model_id,
        unnest(xpath('//Brands/Brand/Models/Model/@name', xml))::text as model_name 
    FROM imported_documents WHERE deleted_on IS NULL ), 
    country_data AS ( SELECT 
        unnest(xpath('//Countries/Country/@id', xml))::text as country_id,
        unnest(xpath('//Countries/Country/@name', xml))::text as country_name
    FROM imported_documents WHERE deleted_on IS NULL
    ) SELECT b.brand_name, m.model_name, c.country_name, COUNT(m.model_name) AS num_models 
    FROM vehicle_data v
    JOIN brand_data b ON v.brand_ref = b.brand_id
    LEFT JOIN brand_data m ON v.model_ref = m.model_id
    LEFT JOIN country_data c ON b.country_ref = c.country_id
    GROUP BY b.brand_name, m.model_name, c.country_name
    ORDER BY num_models {sorting_option}"""

    results = database.selectAll(query)
    database.disconnect()

    for vehicle in results:
        result_vehicles.append(vehicle)

    return result_vehicles

def fetch_count_vehicles_by_country():
    database = Database()
    result_vehicles = []


    query = f""" WITH vehicle_data AS ( SELECT 
        unnest(xpath('//Vehicles/Car/@brand_ref', xml))::text as brand_ref
    FROM imported_documents WHERE deleted_on IS NULL ), 
    brand_country_data AS ( SELECT 
        unnest(xpath('//Brands/Brand/@id', xml))::text as brand_id,
        unnest(xpath('//Brands/Brand/@country_ref', xml))::text as country_ref
    FROM imported_documents WHERE deleted_on IS NULL ), 
    country_data AS ( SELECT 
        unnest(xpath('//Countries/Country/@id', xml))::text as country_id,
        unnest(xpath('//Countries/Country/@name', xml))::text as country_name
    FROM imported_documents WHERE deleted_on IS NULL )
    SELECT c.country_name, COUNT(v.brand_ref) AS num_brands
    FROM vehicle_data v
    JOIN brand_country_data bc ON v.brand_ref = bc.brand_id
    JOIN country_data c ON bc.country_ref = c.country_id
    GROUP BY c.country_name ORDER BY num_brands DESC; """

    results = database.selectAll(query)
    database.disconnect()

    for vehicle in results:
        result_vehicles.append(vehicle)

    return result_vehicles

def convert_decimal_to_float(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    return obj

def fetch_stats_models(sorting_option):
    database = Database()
    result_brand_percentages = []

    sorting_option = sorting_option.lower()
    if sorting_option not in ['asc', 'desc']:
        sorting_option = 'asc'

    query = f"""
        WITH vehicle_data AS (
            SELECT 
                unnest(xpath('//Vehicles/Car/@id', xml))::text as id,
                unnest(xpath('//Vehicles/Car/@brand_ref', xml))::text as brand_ref
            FROM imported_documents WHERE deleted_on IS NULL
        ), 
        brand_data AS (
            SELECT 
                unnest(xpath('//Brands/Brand/@id', xml))::text as brand_id, 
                unnest(xpath('//Brands/Brand/@name', xml))::text as brand_name,
                unnest(xpath('//Brands/Brand/@country_ref', xml))::text as country_ref
            FROM imported_documents WHERE deleted_on IS NULL
        ),
        country_data AS (
            SELECT 
                unnest(xpath('//Countries/Country/@id', xml))::text as country_id,
                unnest(xpath('//Countries/Country/@name', xml))::text as country_name
            FROM imported_documents WHERE deleted_on IS NULL
        ) 
        SELECT 
            b.brand_name, 
            c.country_name, 
            ROUND(CAST(COUNT(b.brand_name) AS DECIMAL) / CAST((SELECT COUNT(*) FROM vehicle_data) AS DECIMAL) * 100, 2) AS percentage
        FROM vehicle_data v
        JOIN brand_data b ON v.brand_ref = b.brand_id
        LEFT JOIN country_data c ON b.country_ref = c.country_id
        GROUP BY b.brand_name, c.country_name
        ORDER BY percentage {sorting_option};
    """

    results = database.selectAll(query)
    database.disconnect()

    result_brand_percentages = [
        {'brand_name': vehicle[0], 'country_name': vehicle[1], 'percentage': convert_decimal_to_float(vehicle[2])}
        for vehicle in results
    ]

    return result_brand_percentages

def fetch_stats_models_by_brand(brand_name):
    database = Database()
    result_brand_percentages = []

    query = f"""
    WITH brand_id AS (
        SELECT unnest(xpath('//Brands/Brand[@name="{brand_name}"]/@id', xml))::text as brand_id
        FROM imported_documents WHERE deleted_on IS NULL LIMIT 1
    ),
    vehicle_data AS (
        SELECT unnest(xpath('//Vehicles/Car/@id', xml))::text as id, unnest(xpath('//Vehicles/Car/@brand_ref', xml))::text as brand_ref, unnest(xpath('//Vehicles/Car/@model_ref', xml))::text as model_ref 
        FROM imported_documents WHERE deleted_on IS NULL
    ),
    filtered_vehicle_data AS ( SELECT * FROM vehicle_data WHERE brand_ref IN (SELECT brand_id FROM brand_id)
    ),
    model_counts AS (
        SELECT brand.brand_name, md.model_name, COUNT(*) as model_count
        FROM filtered_vehicle_data fvd
        LEFT JOIN ( SELECT unnest(xpath('//Brands/Brand/@id', xml))::text as brand_id, unnest(xpath('//Brands/Brand/@name', xml))::text as brand_name
        FROM imported_documents WHERE deleted_on IS NULL ) brand ON fvd.brand_ref = brand.brand_id
        LEFT JOIN ( SELECT unnest(xpath('//Brands/Brand/Models/Model/@id', xml))::text as model_id, unnest(xpath('//Brands/Brand/Models/Model/@name', xml))::text as model_name
        FROM imported_documents WHERE deleted_on IS NULL ) md ON fvd.model_ref = md.model_id
        GROUP BY brand.brand_name, md.model_name
    ),
    total_count_per_brand AS ( SELECT brand.brand_name, COUNT(DISTINCT fvd.id) as total
        FROM filtered_vehicle_data fvd
        LEFT JOIN ( SELECT unnest(xpath('//Brands/Brand/@id', xml))::text as brand_id, unnest(xpath('//Brands/Brand/@name', xml))::text as brand_name
        FROM imported_documents WHERE deleted_on IS NULL ) brand ON fvd.brand_ref = brand.brand_id
        GROUP BY brand.brand_name
    )

    SELECT mc.brand_name, mc.model_name, mc.model_count as count, ROUND(CAST(mc.model_count AS DECIMAL) / CAST(tc.total AS DECIMAL) * 100, 2) as percentage
    FROM model_counts mc JOIN total_count_per_brand tc ON mc.brand_name = tc.brand_name 
    ORDER BY mc.model_name, mc.brand_name; """

    results = database.selectAll(query)
    database.disconnect()

    result_brand_percentages = [
        {'brand_name': vehicle[0], 'model_name': vehicle[1], 'count': vehicle[2], 'percentage': convert_decimal_to_float(vehicle[3])}
        for vehicle in results
    ]

    return result_brand_percentages