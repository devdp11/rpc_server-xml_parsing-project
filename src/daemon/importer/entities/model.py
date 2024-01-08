import xml.etree.ElementTree as ET

class Model:

    def __init__(self, name):
        Model.counter += 1
        self._id = Model.counter
        self._name = name
    
    def get_id(self):
        return self._id
    
    def to_xml(self):
        el = ET.Element("Model")
        el.set("id", str(self._id))
        el.set("name", self._name)
        return el

    def __str__(self):
        return f"{self._name} ({self._id})"

Model.counter = 0
