from flask import jsonify, request
from . import routes, db


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
    fab_table = db.factory
    menu_table = db.menu
    
    output = []

    for fab in fab_table.find():
        output.append( {'fab': fab['name'], 'stores': fab['stores']} )
    return jsonify({'output': output})