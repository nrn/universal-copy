var OPtoString = Object.prototype.toString
var values = {
  'string': true,
  'number': true,
  'boolean': true,
  'symbol': true,
  // Kinda a lie, but returning the functions unmodified
  // leads to the least confusing behavior.
  'function': true
}

var howDoICopy = {
  '[object Object]': copyObject,
  '[object Array]': copyObject,
  '[object Map]': copyMap,
  '[object Set]': copySet,
  '[object Date]': copyConstructor,
  '[object RegExp]': copyConstructor,
  '[object ArrayBuffer]': copySlice,
  '[object Int8Array]': copyConstructor,
  '[object Uint8Array]': copyConstructor,
  '[object Uint8ClampedArray]': copyConstructor,
  '[object Int16Array]': copyConstructor,
  '[object Uint16Array]': copyConstructor,
  '[object Int32Array]': copyConstructor,
  '[object Uint32Array]': copyConstructor,
  '[object Float32Array]': copyConstructor,
  '[object Float64Array]': copyConstructor
}

module.exports = universalCopy

function universalCopy (anything) {
  return deepCopy(anything, [], [])
}

function deepCopy (original, seen, copies) {
  var type = typeof original

  // Don't need to do anything for values
  // that aren't passed by reference.
  if (original == null || type in values) {
    return original
  }

  // if this object has already been copied during
  // this deep copy, use that first copy.
  var idx = seen.indexOf(original)
  if (idx !== -1) {
    return copies[idx]
  }

  var copyX = howDoICopy[toStr(original)]
  // if none of the special cases hit, copy original as a generic object.
  return (copyX || copyObject)(original, seen, copies)
}

function copyConstructor (original, seen, copies) {
  var copy = new original.constructor(original)
  seen.push(original)
  copies.push(copy)
  return copy
}

function copySet (original, seen, copies) {
  var copy = new (original.constructor || Set)
  seen.push(original)
  copies.push(copy)
  original.forEach(function (v) {
    copy.add(deepCopy(v, seen, copies))
  })
  return copy
}

function copyMap (original, seen, copies) {
  var copy = new (original.constructor || Map)
  seen.push(original)
  copies.push(copy)
  original.forEach(function (v, k) {
    copy.set(deepCopy(k, seen, copies), deepCopy(v, seen, copies))
  })
  return copy
}

function copySlice (original, seen, copies) {
  var copy = original.slice()
  seen.push(original)
  copies.push(copy)
  return copy
}

function copyObject (original, seen, copies) {
  var copy = new (original.constructor || Object)
  seen.push(original)
  copies.push(copy)

  Object.getOwnPropertyNames(original).forEach(originalToCopy)

  if (typeof Object.getOwnPropertySymbols === 'function') {
    Object.getOwnPropertySymbols(original).forEach(originalToCopy)
  }

  function originalToCopy (key) {
    var descriptor = Object.getOwnPropertyDescriptor(original, key)
    descriptor.value = deepCopy(descriptor.value, seen, copies)
    try {
      Object.defineProperty(copy, key, descriptor)
    } catch (e) {
      // When define property fails it means we shouldn't
      // have been trying to write the property we were.
      // example: the stack of an error object.
    }
  }

  return copy
}

function toStr (thing) {
  return OPtoString.call(thing)
}
