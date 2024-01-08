import signal, sys
from xmlrpc.server import SimpleXMLRPCServer
from xmlrpc.server import SimpleXMLRPCRequestHandler

from functions.queries import fetch_brands, fetch_years, fetch_models, fetch_vehicles, fetch_countries, fetch_models_by_brand, fetch_brands_by_country, fetch_vehicles_by_brand, fetch_count_brands, fetch_count_models, fetch_count_vehicles_by_country, fetch_stats_models, fetch_stats_models_by_brand

PORT = int(sys.argv[1]) if len(sys.argv) >= 2 else 9000

if __name__ == "__main__":
    class RequestHandler(SimpleXMLRPCRequestHandler):
        rpc_paths = ('/RPC2',)

    with SimpleXMLRPCServer(('0.0.0.0', PORT), requestHandler=RequestHandler) as server:
        server.register_introspection_functions()

        def signal_handler(signum, frame):
            print("received signal")
            server.server_close()

            # perform clean up, etc. here...
            print("exiting, gracefully")
            sys.exit(0)

        # signals
        signal.signal(signal.SIGTERM, signal_handler)
        signal.signal(signal.SIGHUP, signal_handler)
        signal.signal(signal.SIGINT, signal_handler)

        # register both functions
        server.register_function(fetch_brands)
        server.register_function(fetch_years)
        server.register_function(fetch_models)
        server.register_function(fetch_vehicles)
        server.register_function(fetch_countries)
        server.register_function(fetch_models_by_brand)
        server.register_function(fetch_brands_by_country)
        server.register_function(fetch_vehicles_by_brand)
        server.register_function(fetch_count_brands)
        server.register_function(fetch_count_models)
        server.register_function(fetch_count_vehicles_by_country)
        server.register_function(fetch_stats_models)
        server.register_function(fetch_stats_models_by_brand)

        # start the server
        print(f"Starting the RPC Server in port {PORT}...")
        server.serve_forever()