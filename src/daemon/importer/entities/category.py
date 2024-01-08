import xml.etree.ElementTree as ET

class MarketCategoryItem:
    counter = 1
    aux_name = ""
    aux_dict = {}

    def __init__(self, name):
        self._id = MarketCategoryItem.counter
        self._name = name
        aux_name = self._name

        if self._name not in self.aux_dict:
            self.aux_dict [self._name] = self._id
            MarketCategoryItem.counter += 1

    def to_xml(self):
        el = ET.Element("market_category")
        el.set("id", str(self._id))
        el.set("Name", self._name)
        return el

    def get_id(self):
        if self._name in self.aux_dict:
            return self.aux_dict.get(self._name)

    def get_name(self):
        if self._name in self.aux_dict:
            return self._name

    def __str__(self):
        return f"Market Category {self._id}: {self._name}"