import xml.etree.ElementTree as ET
from entities.country import Country

class Brand:
    counter = 0  # Mova a declaração do contador para fora do construtor

    def __init__(self, name: str, country: Country):
        Brand.counter += 1  # Incrementar o contador ao criar uma nova instância
        self._id = Brand.counter
        self._name = name
        self._country = country
        self._models = []

    def add_model(self, model):
        self._models.append(model)

    def get_id(self):
        return self._id

    def to_xml(self):
        el = ET.Element("Brand")
        el.set("id", str(self._id))
        el.set("name", self._name)
        el.set("country_ref", str(self._country.get_id()))

        models_el = ET.Element("Models")
        for model in self._models:
            models_el.append(model.to_xml())

        el.append(models_el)

        return el

    def __str__(self):
        return f"{self._name} ({self._id})"
