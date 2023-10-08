/**
 * Utility method to check if an array contains an ID
 * @param array {Array}
 * @param id {any}
 * @returns {boolean} - True if it contains, false otherwise
 */
exports.checkContains = function checkContains(array, id) {
    for (let i = 0; i < array?.length; i++) {
        if (array[i].equals(id)) {
            return true;
        }
    }
    return false;
}