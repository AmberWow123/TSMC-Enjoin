from flask import jsonify
from . import routes, db

#account api
@routes.route('/test', methods=['GET'])
def test():
    print("ok")
    return jsonify(message='it works!')

@routes.route('/testDB', methods=['GET'])
def testDB():
    print(db.collection_names())
    return jsonify(message='it works!')



