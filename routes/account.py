from flask import jsonify, request
from . import routes, db
from bson.objectid import ObjectId

# {    # account
#     id: 工號(int) # primary key, not null
#     password: (string) # not null
#     FAB: FAB2(選單) # not null
#     ownOrder: []
#     joinOrder: []
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
@routes.route("/Account/Create", methods=['POST'])
def accountCreate():
    _id = request.form['id']
    password = request.form['password']
    fab = request.form['fab']

    db['account'].insert_one({'id': _id, 'password': password, 'fab': fab})
    
    result = db['account'].find_one({'id': id})
    if result:
        response = jsonify(message="error")
    else:
        response = jsonify(message="success")
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers['Access-Control-Allow-Method'] = '*'
    response.headers['Access-Control-Allow-Headers'] = '*'
    return response

@routes.route("Account/Login", methods=['POST'])
def accountLogin():
    _id = request.form['id']
    password = request.form['password']
    result = db['account'].find_one({'id': id})
    if result:
        if result['password'] == password:
            response = jsonify(message="成功登入")
        else:
            response = jsonify(message="登入失敗")
    else:
        response = jsonify(message="查無此帳號")
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
#     db['account'].update_one({'_id': ObjectId(uuid)}, {"$set": {'joinList': lst}})

#     return jsonify(message="success")
