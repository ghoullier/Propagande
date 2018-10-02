"use strict";
/**
 * Validations functions, executed by CouchDB
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Only admin can write doc
 * @param newDoc
 * @param oldDoc
 * @param userCtx
 */
exports.onlyAdmin = function (newDoc, oldDoc, userCtx) {
    if (userCtx.roles.indexOf('_admin') !== -1) {
        return;
    }
    else {
        throw ({ forbidden: 'Only admins may edit the database' });
    }
};
