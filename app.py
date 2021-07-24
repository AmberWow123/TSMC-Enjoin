from flask import Flask, jsonify
from models import mongo

app = Flask(__name__)
app.config["MONGO_URI"] = "mongodb://localhost:27017/hackathon"
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
    