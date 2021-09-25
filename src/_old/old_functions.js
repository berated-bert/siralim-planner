// _.isEqual() doesn't seem to work for sets
// yoinked this from here: https://stackoverflow.com/questions/31128855/comparing-ecma6-sets-for-equality
function eqSet(as, bs) {
    if (as.size !== bs.size) return false;
    for (var a of as) if (!bs.has(a)) return false;
    return true;
}