from flask import jsonify, request, Response
from . import routes, db
import json
from bson.objectid import ObjectId
from bson import json_util
from .account import token_required

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
    if len(order_list) ==0:
        return jsonify(message="No IN_PROGRESS Order")
    else:
        #return jsonify(message="Success", data=json.dumps(order_list, default=json_util.default))
        for order in order_list:
            order['_id'] = str(order['_id'])
        return Response(json.dumps(order_list), mimetype="application/json")
# 搜尋hashtag
@routes.route("/Order/SearchByHashtag", methods=['POST'])
def SearchByHashtag():
    order_table = db['order']
    # list of hashtags
    search_key = request.form.get("search_key").split()
    # search key=["FAB18", "starbucks", "美式咖啡"]

    # result = {}
    
    # for s_k in search_key:
    #     search_result = list(db["order"].find({"hashtag":{"$regex":s_k}}))
    #     # result1 += search_result
    #     for search_r in search_result:
    #         group_order_id = str(search_r['_id'])
    #         del search_r['_id']
    #         if group_order_id not in result:
    #             result[ group_order_id ] = search_r

    # return result

    result = []
    for s_k in search_key:
        search_result = list(db["order"].find({"hashtag":{"$regex":s_k}}))
        result += search_result
    for order in result:
            order['_id'] = str(order['_id'])
    return Response(json.dumps(result), mimetype="application/json")


@routes.route("/Order/JoinOrder/<string:uuid>/<string:goid>", methods=["POST"])
@token_required
def JoinOrder(uuid, goid):
    print("uuid",uuid)
    print("goid", goid)

    ## Update account joinOrder, add order id into joinOrder
    account_result = db["account"].find_one({'_id': ObjectId(uuid)})
    join_id_list = [account_result["id"]]
    join_order_list = [ObjectId(goid)]
    if "joinOrder" in account_result:
        if ObjectId(goid) in account_result["joinOrder"]:
            return jsonify(message="you are already in this order")
        join_order_list += account_result["joinOrder"]
    db['account'].update_one({'_id': ObjectId(uuid)}, {"$set": {"joinOrder": join_order_list}})

    ## Update Order join people
    # {
    # "meet_time" : ["2021-07-29T10:00:00.000Z", "2021-07-29T10:10:00.000Z"],
    # "meet_factory" : "FAB18",
    # "store" : "Louisa",
    # "drink" : "特濃小卡布",
    # "hashtag" : ["FAB18", "Louisa", "特濃小卡布"],
    # "title" : "特濃小卡布買四送二",
    # "comment" : "KKKKK",
    # "status" : "IN_PROGRESS",
    # "creator_id" : "1745",
    # "join_people" : "2"
    # "join_people_account": []
    # }
    order_result = db["order"].find_one({'_id': ObjectId(goid)})
    join_people = order_result["join_people"]+1
    if "join_people_id" in order_result:
        join_id_list += order_result["join_people_id"]
    if join_people == order_result["join_people_bound"]:
        db["order"].update_one({'_id': ObjectId(goid)}, {"$set": {"join_people": join_people, "status":"COMPLETED", "join_people_id":join_id_list}})
    else:
        db["order"].update_one({'_id': ObjectId(goid)}, {"$set": {"join_people": join_people, "join_people_id":join_id_list}})
    # db['account'].insert_one({'id': _id, 'password': password, 'fab': fab})
    return jsonify(message="success")

