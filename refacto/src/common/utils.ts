/**
 * Generate an unique id sortable by date 
 * @param name 
 */
export const genId = (name : string) => {
    return name + "_" + Date.now() + "_" + Math.random().toString(36).substr(2, 11);
}