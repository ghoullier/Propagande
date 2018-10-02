/**
 * Validations functions, executed by CouchDB
 */

/**
 * Only admin can write doc
 * @param newDoc 
 * @param oldDoc 
 * @param userCtx 
 */
export const onlyAdmin = function(newDoc: any, oldDoc: any, userCtx: any) {
  if (userCtx.roles.indexOf('_admin') !== -1) {
    return;
  }
  else {
    throw ({ forbidden: 'Only admins may edit the database' });
  }
}