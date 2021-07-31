from flask import Flask, jsonify
from flask_cors import CORS
from models import mongo
import dns
import json

from flask.json import JSONEncoder
class CustomJsonEncoder(JSONEncoder):
    def default(self, o):
        from bson.objectid import ObjectId
        if isinstance(o, ObjectId):
            return str(o)
        return super().default(o)

f = open('key.json', 'r')
data = json.load(f)
user = data["user"]
password = data["password"]
db = data["db"]
# url = "mongodb://localhost:27017/hackathon"
url = "mongodb+srv://"+user+":"+password+db
app = Flask(__name__)
app.json_encoder=CustomJsonEncoder
app.config['JSON_AS_ASCII'] = False
CORS(app)
app.config["MONGO_URI"] = url
mongo.init_app(app)


from routes import *
app.register_blueprint(routes)
# @app.route('/testDB', methods=['GET'])
# def testDB():
#     print(db.collection_names())
#     return jsonify(message='it works!')

if __name__ == '__main__':
    # app.debug = True
    app.run(debug=True)
    