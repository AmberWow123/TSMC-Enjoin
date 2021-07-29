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
@routes.route("/Order/SearchByHashtag", methods=['POST'])
def SearchByHashtag():
    search_key = request.form.get("search_key")
    search_result = list(db["order"].find({"hashtag":search_key}))
    # for order in db["order"].find({"hashtag":search_key}):
    #     print(order["_id"])
    return jsonify(message=json.dumps(search_result, default=json_util.default))


@routes.route("/Order/JoinOrder/<string:uuid>/<string:goid>", methods=['POST'])
def JoinOrder(uuid, goid):
    print("uuid",uuid)
    print("goid", goid)
    json = request.form
    # account_result = db["account"].find_one({'_id': ObjectId(uuid)})

    # db['account'].insert_one({'id': _id, 'password': password, 'fab': fab})
    return jsonify(message="success")

