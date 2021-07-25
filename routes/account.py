from flask import jsonify, request
from . import routes, db
from bson.objectid import ObjectId

# {    # account
#     id: 工號(int) # primary key, not null
#     password: (string) # not null
#     FAB: FAB2(選單) # not null
#     ownList: []
#     joinList: [1,2,3]
# }

#account api
@routes.route('/test', methods=['GET'])
def test():
    print("ok")
    return jsonify(message='it works!')

@routes.route('/testDB', methods=['GET'])
def testDB():
    print(db.collection_names())
    return jsonify(message='it works!')

#create account
@routes.route("/account/create", methods=['POST'])
def add_one():
    json = request.get_json()
    print(json)
    _id = json['id']
    password = json['password']
    fab = json['fab']

    db['account'].insert_one({'id': _id, 'password': password, 'fab': fab})
    return jsonify(message="success")

#update joinlist
@routes.route("/account/updatejoinList/<string:uuid>", methods=['POST'])
def updateList(uuid):
    print("uuid ", uuid)
    json = request.get_json(force=True)
    print(json)
    lst = [json['list']]

    result = db['account'].find_one({'_id': ObjectId(uuid)})
    print(result)
    if 'joinList' in result:
        lst += result['joinList']
    print(lst)
    db['account'].update_one({'_id': ObjectId(uuid)}, {"$set": {'joinList': lst}})

    return jsonify(message="success")
