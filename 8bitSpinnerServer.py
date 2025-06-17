from http.server import SimpleHTTPRequestHandler, HTTPServer
import requests
import json

class MyHandler(SimpleHTTPRequestHandler):
  def do_GET(self):
    # serve song list from the8bitdrummer.com because cors is not allowed on server
    if self.path == '/json/song_list.php':
      try:
        # fetch list
        response = requests.get('https://the8bitdrummer.com/json/song_list.php')
        # check if the request was successful
        response.raise_for_status()
        data = response.json()
        # send response
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Custom-Server', 'true')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))
      except requests.exceptions.RequestException as e: # else error
        self.send_response(500)
        self.send_header('Content-type', 'text/plain')
        self.end_headers()
        self.wfile.write(str(e).encode('utf-8'))
    else:
      # serve static files
      super().do_GET()

def run(server_class=HTTPServer, handler_class=MyHandler, port=8000):
  server_address = ('', port) # set port
  httpd = server_class(server_address, handler_class) # get server class
  print(f'Starting server http://localhost:{port}') 
  httpd.serve_forever() # start server

if __name__ == "__main__":
  run()