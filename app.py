from flask import Flask, jsonify
from models import mongo
import dns
import json


f = open('key.json', 'r')
data = json.load(f)
user = data["user"]
password = data["password"]

# url = "mongodb://localhost:27017/hackathon"
url = "mongodb+srv://"+user+":"+password+"@cluster0.56zcf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
app = Flask(__name__)
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
    app.run()
    