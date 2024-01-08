import csv
from lxml import etree
from csv import DictReader
import xml.dom.minidom as md
import xml.etree.ElementTree as ET


from entities.country import Country
from entities.brand import Brand
from entities.model import Model
from entities.fuel import Fuel
from entities.size import Size
from entities.style import Style
from entities.traction import Traction
from entities.transmission import Transmission
from entities.category import MarketCategoryItem
from entities.vehicle import Vehicle

class CSVReader:
    def __init__(self, path, delimiter=';'):
        self._path = path
        self._delimiter = delimiter

    def loop(self):
        with open(self._path, 'r') as file:
            for row in DictReader(file, delimiter=self._delimiter):
                yield row

    def read_entities(self, attr, builder, after_create=None):
        entities = {}
        for row in self.loop():
            if attr in row:
                e = row[attr]
                if e not in entities:
                    entities[e] = builder(row)
                    if after_create is not None:
                        after_create(entities[e], row)
        return entities
    
class CSVtoXMLConverter:

    def __init__(self, path):
        self.csv_reader = CSVReader(path)

    def to_xml(self):
        
        countries = self.csv_reader.read_entities(
            attr="Country",
            builder=lambda row: Country(row["Country"])
        )

        brands = self.csv_reader.read_entities(
            attr="Brand",
            builder=lambda row: Brand(row["Brand"], countries[row["Country"]])
        )

        models = {}

        def after_creating_model(model, row):
            brands[row["Brand"]].add_model(model)
            models[row["Model"]] = model

        models = self.csv_reader.read_entities(
            attr="Model",
            builder=lambda row: Model(
                name=row["Model"]
            ),
            after_create=after_creating_model
        )

        fuels = self.csv_reader.read_entities(
            attr="Engine Fuel Type",
            builder=lambda row: Fuel(row["Engine Fuel Type"])
        )

        sizes = self.csv_reader.read_entities(
            attr="Vehicle Size",
            builder=lambda row: Size(row["Vehicle Size"])
        )

        styles = self.csv_reader.read_entities(
            attr="Vehicle Style",
            builder=lambda row: Style(row["Vehicle Style"])
        )

        tractions = self.csv_reader.read_entities(
            attr="Driven Wheels",
            builder=lambda row: Traction(row["Driven Wheels"])
        )

        transmissions = self.csv_reader.read_entities(
            attr="Transmission Type",
            builder=lambda row: Transmission(row["Transmission Type"])
        )

        categories = self.csv_reader.read_entities(
            attr="Market Category",
            builder=lambda row: row["Market Category"].split(",") if row["Market Category"] else [],
            after_create=None
        )

        vehicles_dict = {}

        for row in self.csv_reader.loop():
            if "Model" in row:
                model = models[row["Model"]]
                if model not in vehicles_dict:
                    vehicles_dict[model] = []
                vehicles_dict[model].append(
                    Vehicle(
                        brand=brands[row["Brand"]],
                        model=model,
                        year=row.get("Year", ""),
                        engine_fuel_type=fuels.get(row["Engine Fuel Type"], ""),
                        engine_hp=row.get("Engine HP", ""),
                        engine_cylinders=row.get("Engine Cylinders", ""),
                        transmission_type=transmissions.get(row["Transmission Type"], ""),
                        driven_wheels=tractions.get(row["Driven Wheels"], ""),
                        number_of_doors=row.get("Number of Doors", ""),
                        market_category=row.get("Market Category", "").split(",") if row.get("Market Category") else [],
                        vehicle_size=sizes.get(row["Vehicle Size"], ""),
                        vehicle_style=styles.get(row["Vehicle Style"], ""),
                        highway_mpg=row.get("Highway MPG", ""),
                        city_mpg=row.get("City MPG", ""),
                        popularity=row.get("Popularity", ""),
                        msrp=row.get("MSRP", ""),
                        country=countries.get(row["Country"], "")
                    ).to_xml()
                )

        root_el = ET.Element("Data")

        brands_el = ET.Element("Brands")
        for brand in brands.values():
            brands_el.append(brand.to_xml())

        countries_el = ET.Element("Countries")
        for country in countries.values():
            countries_el.append(country.to_xml())
        
        fuels_el = ET.Element("Fuels")
        for fuel in fuels.values():
            fuels_el.append(fuel.to_xml())

        sizes_el = ET.Element("Sizes")
        for size in sizes.values():
            sizes_el.append(size.to_xml())

        styles_el = ET.Element("Styles")
        for style in styles.values():
            styles_el.append(style.to_xml())

        tractions_el = ET.Element("Tractions")
        for traction in tractions.values():
            tractions_el.append(traction.to_xml())

        transmissions_el = ET.Element("Transmissions")
        for transmission in transmissions.values():
            transmissions_el.append(transmission.to_xml())

        categories_el = ET.Element("Categories")
        unique_categories = set()
        for category_list in categories.values():
            for category_name in category_list:
                if category_name not in unique_categories:
                    category_el = ET.Element("market_category")
                    category_el.set("id", str(len(unique_categories) + 1))
                    category_el.set("Name", category_name)
                    categories_el.append(category_el)
                    unique_categories.add(category_name)

        vehicles_el = ET.Element("Vehicles")
        all_vehicles = []

        for vehicle_list in vehicles_dict.values():
            all_vehicles.extend(vehicle_list)

        vehicles_el.extend(all_vehicles)


        root_el.append(brands_el)
        root_el.append(countries_el)
        root_el.append(fuels_el)
        root_el.append(sizes_el)
        root_el.append(styles_el)
        root_el.append(tractions_el)
        root_el.append(transmissions_el)
        root_el.append(categories_el)
        
        root_el.append(vehicles_el)
        
        return root_el

    def to_xml_str(self):
        xml_str = ET.tostring(self.to_xml(), encoding='utf8', method='xml').decode()

        """ self.validate_xml(xml_str) """

        dom = md.parseString(xml_str)
        return dom.toprettyxml()
    
    def validate_xml(self, xml_str, schema_path='schema.xsd'):
        schema = etree.XMLSchema(etree.parse(schema_path))
        root = etree.fromstring(xml_str)
        schema.assertValid(root)