from flask import Flask, jsonify, send_from_directory, render_template
from flask_cors import CORS
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

if __name__ == '__main__':
    app.debug = True
    app.run()
    