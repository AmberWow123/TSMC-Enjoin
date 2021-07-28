from flask import jsonify, request
from . import routes, db
import json
from bson.objectid import ObjectId
from bson import json_util

# {    # account
#     id: 工號(int) # primary key, not null
#     password: (string) # not null
#     FAB: FAB2(選單) # not null
#     ownList: []
#     joinList: [1,2,3]
# }

# 列出所有跟團單子
@routes.route("/Order/ListAllGroupOrder", methods=['GET'])
def ListAllGroupOrder():
    print("ListAllGroupOrder is doing something")
    order_list=list(db["order"].find({"status":"IN_PROGRESS"}))
    return jsonify(message=json.dumps(order_list, default=json_util.default))

# 搜尋hashtag
@routes.route("/Order/SearchByHashtag", methods=['GET'])
def SearchByHashtag():
    print(db.collection_names())
    return jsonify(message='SeatchByHashtag!')


@routes.route("/Order/JoinOrder/<string:uuid>", methods=['POST'])
def JoinOrder():
    json = request.get_json()
    print(json)
    _id = json['id']
    password = json['password']
    fab = json['fab']

    db['account'].insert_one({'id': _id, 'password': password, 'fab': fab})
    return jsonify(message="success")

