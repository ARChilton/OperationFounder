//_userAuth design doc
{
    "_id": "_design/_userAuth",
    "_rev": "2-9b5e1697d92174a24c8ceffb3b3775bb",
    "validate_doc_update": "function (newDoc, oldDoc, userCtx, secObj) {\n    var is_server_or_database_admin = function (userCtx, secObj) {\n        // see if the user is a server admin\n        if (userCtx.roles.indexOf('_admin') !== -1) {\n return true; // a server admin\n        }\n        // see if the user a database admin specified by name\n        if (secObj && secObj.admins && secObj.admins.names) {\n            if (secObj.admins.names.indexOf(userCtx.name) !== -1) {\n                return true; // database admin\n            }\n        }\n // see if the user a database admin specified by role\n        if (secObj && secObj.admins && secObj.admins.roles) {\n            var db_roles = secObj.admins.roles;\n            for (var idx = 0; idx < userCtx.roles.length; idx++) {\n                var user_role = userCtx.roles[idx];\n                if (db_roles.indexOf(user_role) !== -1) {\n                    return true; // role matches!\n                }\n            }\n        }\n        return false; // default to no admin\n    }\n    if (!is_server_or_database_admin(userCtx, secObj)) {\n        throw ({\n            forbidden: 'Only admins may update user documents.'\n        });\n    }\n}"
}
// the function written more plainly
var validate_doc_update = function (newDoc, oldDoc, userCtx, secObj) {
    var is_server_or_database_admin = function (userCtx, secObj) {
        // see if the user is a server admin
        if (userCtx.roles.indexOf('_admin') !== -1) {
            return true; // a server admin
        }

        // see if the user a database admin specified by name
        if (secObj && secObj.admins && secObj.admins.names) {
            if (secObj.admins.names.indexOf(userCtx.name) !== -1) {
                return true; // database admin
            }
        }

        // see if the user a database admin specified by role
        if (secObj && secObj.admins && secObj.admins.roles) {
            var db_roles = secObj.admins.roles;
            for (var idx = 0; idx < userCtx.roles.length; idx++) {
                var user_role = userCtx.roles[idx];
                if (db_roles.indexOf(user_role) !== -1) {
                    return true; // role matches!
                }
            }
        }

        return false; // default to no admin
    }
    if (!is_server_or_database_admin(userCtx, secObj)) {
        throw ({
            forbidden: 'Only admins may update user documents.'
        });
    }
}