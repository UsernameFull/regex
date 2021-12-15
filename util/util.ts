function isEmpty(obj:Object) {
    if (obj == null) return true;
    return Object.entries(obj).length === 0 && obj.constructor === Object
}


export {isEmpty}