from flask import Flask, jsonify, send_from_directory, render_template
from flask import send_from_directory, redirect, request
from flask.helpers import send_file
from flask_cors import CORS
from werkzeug.exceptions import abort
import os
from models import mongo
import dns
import json
from config import url
from flask.json import JSONEncoder
class CustomJsonEncoder(JSONEncoder):
    def default(self, o):
        from bson.objectid import ObjectId
        if isinstance(o, ObjectId):
            return str(o)
        return super().default(o)

# f = open('key.json', 'r')
# data = json.load(f)
# user = data["user"]
# password = data["password"]
# db = data["db"]
# url = "mongodb://localhost:27017/hackathon"
# url = "mongodb+srv://"+user+":"+password+db
app = Flask(__name__, )
app.json_encoder=CustomJsonEncoder
app.config['JSON_AS_ASCII'] = False
CORS(app)
app.config["MONGO_URI"] = url
mongo.init_app(app)


from routes import *
app.register_blueprint(routes)
# @app.route('/<string:folder>')
# def pages(folder):
#     print(db.collection_names())
#     url = folder+"/index.html"
#     print(url)
#     # return jsonify(message='it works!')
#     return render_template(url)

# @app.route('/')
# def home():
#     return render_template("index.html")

@app.route('/', defaults={'path': 'index.html'}, methods=['GET'])
@app.route('/<path:path>', methods=['GET'])
def staticHost(path: str):
    # print('request.path', request.path)
    # print('request.url', request.url)
    # print('request.base_url', request.base_url)
    # print('request.url_root', request.url_root+request.path[1:])
    try:
        return send_file(app.static_folder+request.path)
    except Exception:
        if request.path[-1]=='/':
            try:
                return send_file(app.static_folder+request.path+'index.html')
            except Exception as e:
                abort(404)
        else:
            if len(request.base_url) != len(request.url):
                try:
                    # return send_file(app.static_folder+request.path+'/index.html')
                    return redirect(request.path+'/')
                except Exception as e:
                    abort(404)
            else:
                print(request.base_url+'/'+request.url[len(request.base_url):])
                return redirect(request.base_url+'/'+request.url[len(request.base_url):])
            try:
                return send_file(app.static_folder+request.path+'/index.html')
            except Exception as e:
                print('Exception:',e)
                abort(404)

if __name__ == '__main__':
    app.debug = True
    if app.debug:
        app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
    app.run()
    
