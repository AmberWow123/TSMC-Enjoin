from flask import jsonify, request
from . import routes, db
import json
from bson import json_util


# factory table 
# {
#     name: (string)
#     stores: []
# }

# menu table
# {
#     store: (string)
#     drinks: []
# }

@routes.route('/Menu/ListFactory/', methods=['GET'])
def show_all_factories():
    fab_table = db['factory']
    menu_table = db['menu']
    
    output = {}

    for fab in fab_table.find():
        store_menu = {}
        for store in fab['stores']:
            fd_dr = menu_table.find({'name': store}, { "_id": 0, "name": 0 })[0]
            store_menu[store] = fd_dr

        output[fab['name']] = store_menu
    

    result = json.loads(json_util.dumps(output))
    return result

@routes.route('/Menu/ListRestaurant/', methods=['GET'])
def list_restaurants():
    menu_table = db['menu']

    output = {}
    output['store'] = []

    for store in menu_table.find():
        print(store['name'])
        output['store'].append(store['name'])
    
    return output