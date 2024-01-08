import xml.etree.ElementTree as ET

class Transmission:

    def __init__(self, name):
        Transmission.counter += 1
        self._id = Transmission.counter
        self._name = name

    def to_xml(self):
        el = ET.Element("Transmission")
        el.set("id", str(self._id))
        el.set("name", self._name)
        return el

    def get_id(self):
        return self._id

    def __str__(self):
        return f"name: {self._name}, id:{self._id}"


Transmission.counter = 0