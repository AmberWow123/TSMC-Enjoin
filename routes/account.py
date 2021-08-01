from flask import jsonify, request
from . import routes, db
from bson.objectid import ObjectId
from bson import json_util
import json
import jwt
import config
from datetime import datetime, timedelta
from functools import wraps

# {    # account
#     id: 工號(int) # primary key, not null
#     password: (string) # not null
#     FAB: FAB2(選單) # not null
#     ownOrder: []
#     joinOrder: []
# }
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']
        if not token:
            return 'Unauthorized Access!', 401
        print("check token ", token)
        data = jwt.decode(token, config.SECRET_KEY, algorithm="HS256")
        print("token decode: ", data)
        current_user = db['account'].find_one({'id': data['id']})
        if not current_user:
            return 'Unauthorized Access!', 401
        return f(*args, **kwargs)
    return decorated

#account api
@routes.route('/Account/LoginTest', methods=['GET'])
@token_required
def test():
    print("authorized")
    return jsonify(message="Authorized, is already logged in")

@routes.route('/testDB', methods=['GET'])
def testDB():
    print(db.collection_names())
    return jsonify(message='it works!')

#create account
@routes.route("/Account/Create", methods=['POST'])
def accountCreate():
    _id = request.form['id']
    password = request.form['password']
    fab = request.form['fab']

    result = db['account'].find_one({'id': _id})
    if result:
        response = jsonify(message="已註冊過的工號")
    else:
        db['account'].insert_one({'id': str(_id), 'password': password, 'fab': fab})
        response = jsonify(message="註冊成功")
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers['Access-Control-Allow-Method'] = '*'
    response.headers['Access-Control-Allow-Headers'] = '*'
    return response

@routes.route("/Account/Login", methods=['POST'])
def accountLogin():
    _id = request.form['id']
    password = request.form['password']
    result = db['account'].find_one({'id': _id})
    if result:
        if result['password'] == password:
            token = jwt.encode({
                'id': _id,
                'exp': datetime.utcnow() + timedelta(hours=24)
            }, config.SECRET_KEY, algorithm="HS256")
            # response["success"] = True
            response = jsonify(message="成功登入", token= token.decode('UTF-8'))
        else:
            response = jsonify(message="登入失敗，密碼錯誤")
    else:
        response = jsonify(message="查無此帳號")
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers['Access-Control-Allow-Method'] = '*'
    response.headers['Access-Control-Allow-Headers'] = '*'
    return response    


@routes.route("/Account/CreateOrder/<string:tsmcid>", methods=['POST'])
@token_required
def createOrder(tsmcid):
    # check 是否已登入?
    form = request.form.to_dict()
    
    # response = jsonify()
    result = db['account'].find_one({'id': tsmcid})
    if result:
        meet_factory = request.form["meet_factory"]
        store = request.form["store"]
        drink = request.form["drink"]
        form['status'] = "IN_PROGRESS"
        form['hashtag'] = [meet_factory, store, drink]
        form['creator_id'] = str(tsmcid)
        form['meet_time'] = [request.form["meet_time_start"], request.form["meet_time_end"]]
        form['join_people_bound'] = int(request.form["join_people_bound"])
        form['join_people'] = 0
        del form['meet_time_start']
        del form['meet_time_end']
        print(form)
        insert = db['order'].insert_one(form)
        orderUuid = insert.inserted_id 

        if 'ownOrder' in result:
            ownOrder = result["ownOrder"] + [orderUuid]
        else:
            ownOrder = [orderUuid]
        
        db["account"].update_one({'id': tsmcid}, {"$set": {'ownOrder': ownOrder}})
        response = jsonify(message="建立揪團單子成功")
    else:
        response = jsonify(message="無此帳號")
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers['Access-Control-Allow-Method'] = '*'
    response.headers['Access-Control-Allow-Headers'] = '*'
    return response   

## 更新自己的單子(擁有者更新時間、地點、....)
@routes.route("/Account/UpdateOrder/<string:tsmcid>/<string:goid>", methods=['POST'])
# @token_required
def editOrder(tsmcid, goid):
    form = request.form.to_dict()
    result = db['account'].find_one({'id': tsmcid})
    if result:
        #確認單子是否為此擁有者
        print(result["ownOrder"])
        print(goid)
        if "ownOrder" in result:
            if ObjectId(goid) in result["ownOrder"]:
                meet_factory = request.form["meet_factory"]
                store = request.form["store"]
                drink = request.form["drink"]
                result["store"] = store
                result["drink"] = drink
                result['hashtag'] = [meet_factory, store, drink]
                result['meet_time'] = [request.form["meet_time_start"], request.form["meet_time_end"]]
                result['join_people_bound'] = int(request.form["join_people_bound"])
                if (result['join_people_bound'] > len(result['join_people'])):
                    result["status"] = "IN_PROGRESS"
                # form['status'] = "IN_PROGRESS"
                # form['creator_id'] = str(tsmcid)
                # form['join_people'] = result['join_people']
                del form['meet_time_start']
                del form['meet_time_end']
                del result['_id']
                print(result)
                db["order"].replace_one({'_id': ObjectId(goid)}, result)
                response = jsonify(message="編輯揪團單子成功")
            else:
                response = jsonify(message="非此揪團單子的擁有者")
        else:
            response = jsonify(message="無創建的單子")
    else:
        response = jsonify(message="無此帳號")
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers['Access-Control-Allow-Method'] = '*'
    response.headers['Access-Control-Allow-Headers'] = '*'
    return response   

## 完成單子(確認揪團成功)
@routes.route("/Account/CloseOrder/<string:tsmcid>/<string:goid>", methods=['POST'])
@token_required
def closeOrder(tsmcid, goid):
    result = db['account'].find_one({'id': tsmcid})
    print(result)
    if result: 
        if "ownOrder" in result:
            if ObjectId(goid) in result["ownOrder"]:
                order = db['order'].find_one({'_id': ObjectId(goid)})
                if order["status"] == "COMPLETED":
                    db["order"].update_one({'_id': ObjectId(goid)}, {"$set": {'status': "CLOSED"}})
                    response = jsonify(message="更新status成功")
                else:
                    response = jsonify(message="status非completed狀態")
            else:
                response = jsonify(message="非此單子的擁有者")
        else:
            response = jsonify(message="無建立的單子")
    else:
        response = jsonify(message="無此帳號")
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers['Access-Control-Allow-Method'] = '*'
    response.headers['Access-Control-Allow-Headers'] = '*'
    return response  

## 棄單(刪除單子)
@routes.route("/Account/DeleteCreatedOrder/<string:tsmcid>/<string:goid>", methods=['DELETE'])
@token_required
def deleteOrder(tsmcid, goid):
    result = db['account'].find_one({'id': tsmcid})
    if result: 
        if "ownOrder" in result:
            if ObjectId(goid) in result["ownOrder"]:
                order = db['order'].find_one({'_id': ObjectId(goid)})
                #移除ownOrder list
                ownOrder = result["ownOrder"]
                ownOrder.remove(ObjectId(goid))
                db["account"].update_one({'id': tsmcid}, {"$set": {'ownOrder': ownOrder}})
                #移除joinOrder list
                for joinPeopleId in order["join_people_id"]:
                    res = db['account'].find_one({'id': joinPeopleId})
                    joinOrder = res["joinOrder"]
                    if ObjectId(goid) in joinOrder:
                        joinOrder.remove(ObjectId(goid))
                        db["account"].update_one({'id': tsmcid}, {"$set": {'joinOrder': joinOrder}})
                db["order"].delete_one({'_id': ObjectId(goid)})
                response = jsonify(message="刪除單子成功")
            else:
                response = jsonify(message="非此單子的擁有者")
        else:
            response = jsonify(message="無建立的單子")
    else:
        response = jsonify(message="無此帳號")
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers['Access-Control-Allow-Method'] = '*'
    response.headers['Access-Control-Allow-Headers'] = '*'
    return response  

## get跟團的所有單子
@routes.route("/Account/ListOwnerGroupOrder/<string:tsmcid>", methods=['GET'])
@token_required
def getJoinOrder(tsmcid):
    result = db['account'].find_one({'id': tsmcid})
    if result: 
        data = []
        if "joinOrder" in result:
            for objectid in result["joinOrder"]:
                order = db["order"].find_one({'_id': objectid})
                if order:
                    order["_id"] = str(order["_id"])
                    data.append(order)
            print(data)
            response = jsonify(message="success", data=data)
            # response = jsonify(message="success", data=json.dumps(data, default=json_util.default))
        else:
            response = jsonify(message="無跟團的單子")
    else:
        response = jsonify(message="無此帳號")
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers['Access-Control-Allow-Method'] = '*'
    response.headers['Access-Control-Allow-Headers'] = '*'
    return response

## get自己創的所有單子
@routes.route("/Account/ListOwnerCreatedGroupOrder/<string:tsmcid>", methods=['GET'])
@token_required
def getOwnerOrder(tsmcid):
    result = db['account'].find_one({'id': tsmcid})
    if result: 
        data = []
        if "ownOrder" in result:
            for objectid in result["ownOrder"]:
                order = db["order"].find_one({'_id': objectid})
                if order:
                    order["_id"] = str(order["_id"])
                    data.append(order)
            print(data)
            response = jsonify(message="success", data=data)
        else:
            response = jsonify(message="無創建的單子")
    else:
        response = jsonify(message="無此帳號")
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers['Access-Control-Allow-Method'] = '*'
    response.headers['Access-Control-Allow-Headers'] = '*'
    return response

#update joinlist
# @routes.route("/Account/updatejoinList/<string:uuid>", methods=['POST'])
# def updateList(uuid):
#     print("uuid ", uuid)
#     json = request.get_json(force=True)
#     print(json)
#     lst = [json['list']]

#     result = db['account'].find_one({'_id': ObjectId(uuid)})
#     print(result)
#     if 'joinList' in result:
#         lst += result['joinList']
#     print(lst)
#     db['account'].update_one({'_id': ObjectId(uuid)}, {"$set": {'joinOrder': lst}})

#     return jsonify(message="success")
