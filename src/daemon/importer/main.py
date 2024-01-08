import asyncio
import time
import uuid

import os
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler, FileCreatedEvent

from utils.csv_to_xml import CSVtoXMLConverter
from utils.database import Database

def get_csv_files_in_input_folder():
    return [os.path.join(dp, f) for dp, dn, filenames in os.walk(CSV_INPUT_PATH) for f in filenames if
            os.path.splitext(f)[1] == '.csv']

def generate_unique_file_name(directory):
    return f"{directory}/{str(uuid.uuid4())}.xml"

def convert_csv_to_xml(in_path, out_path):
    converter = CSVtoXMLConverter(in_path)
    file = open(out_path, "w")
    file.write(converter.to_xml_str())

def insert_imported_doc(file_name, xml):
    database = Database()
    try:
        database.insert(
            "INSERT INTO imported_documents (file_name, xml) VALUES (%s,%s)", (file_name, xml))
    except Exception as error:
        print(error)
        raise error
    
def insert_converted_doc(src, dst, filesize):
    database = Database()
    try:
        database.insert(
            "INSERT INTO converted_documents(src, dst, file_size) VALUES (%s,%s,%s)", (src, dst, filesize))
    except Exception as error:
        print(error)
        raise error
    
class CSVHandler(FileSystemEventHandler):
    def __init__(self, input_path, output_path):
        self._output_path = output_path
        self._input_path = input_path

        # generate file creation events for existing files
        for file in [os.path.join(dp, f) for dp, dn, filenames in os.walk(input_path) for f in filenames]:
            event = FileCreatedEvent(os.path.join(CSV_INPUT_PATH, file))
            event.event_type = "created"
            self.dispatch(event)

    async def convert_csv(self, csv_path):
        # here we avoid converting the same file again
        if csv_path in await self.get_converted_files():
            return

        print(f"CSV file to convert: '{csv_path}'")

        # we generate a unique file name for the XML file
        xml_path = generate_unique_file_name(self._output_path)

        # we do the convertion
        convert_csv_to_xml(csv_path, xml_path)

        try:
            insert_converted_doc(src = csv_path, dst = xml_path, filesize = os.stat(xml_path).st_size)

            with open(xml_path, 'r', encoding='utf-8') as xml_file:
                xml_content = xml_file.read()

            insert_imported_doc(file_name = csv_path, xml = xml_content)


            print(f"XML file generated: '{xml_path}'")
        except:
            os.remove(xml_path)

    async def get_converted_files(self):
        files = []
        database = Database()
        for file in database.selectAll("SELECT src FROM converted_documents WHERE deleted_on IS NULL"):
            files.append(file[0])

        return files

    def on_created(self, event):
        if not event.is_directory and event.src_path.endswith(".csv"):
            asyncio.run(self.convert_csv(event.src_path))


if __name__ == "__main__":

    CSV_INPUT_PATH = "/csv"
    XML_OUTPUT_PATH = "/xml"

    # create the file observer
    observer = Observer()
    observer.schedule(
        CSVHandler(CSV_INPUT_PATH, XML_OUTPUT_PATH),
        path=CSV_INPUT_PATH,
        recursive=True)
    observer.start()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
        observer.join()