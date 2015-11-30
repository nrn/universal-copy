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
  return deepCopy(anything, new FakeMap())
}

function deepCopy (original, seen) {
  var type = typeof original

  // Don't need to do anything for values
  // that aren't passed by reference.
  if (original == null || type in values) {
    return original
  }

  // if this object has already been copied during
  // this deep copy, use that first copy.
  var extantClone = seen.get(original)
  if (typeof extantClone !== 'undefined') {
    return extantClone
  }

  // Copy buffers correctly in pre-TypedArray node versions
  if (original.constructor &&
      original.constructor.isBuffer &&
      original.constructor.isBuffer(original)) {
    return copyConstructor(original, seen)
  }

  var copyX = howDoICopy[toStr(original)]
  // if none of the special cases hit, copy original as a generic object.
  return (copyX || copyObject)(original, seen)
}

function copyConstructor (original, seen) {
  var copy = new original.constructor(original)
  seen.set(original, copy)
  return copy
}

function copySet (original, seen) {
  var copy = new (original.constructor || Set)
  seen.set(original, copy)
  original.forEach(function (v) {
    copy.add(deepCopy(v, seen))
  })
  return copy
}

function copyMap (original, seen) {
  var copy = new (original.constructor || Map)
  seen.set(original, copy)
  original.forEach(function (v, k) {
    copy.set(deepCopy(k, seen), deepCopy(v, seen))
  })
  return copy
}

function copySlice (original, seen) {
  var copy = original.slice()
  seen.set(original, copy)
  return copy
}

function copyObject (original, seen) {
  var copy = new (original.constructor || Object)
  seen.set(original, copy)

  Object.getOwnPropertyNames(original).forEach(originalToCopy)

  if (typeof Object.getOwnPropertySymbols === 'function') {
    Object.getOwnPropertySymbols(original).forEach(originalToCopy)
  }

  function originalToCopy (key) {
    var descriptor = Object.getOwnPropertyDescriptor(original, key)
    descriptor.value = deepCopy(descriptor.value, seen)
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

// Fake map only works for the few scenarios we need it for in this module.
function FakeMap () {
  if (typeof Map === 'function') return new Map()
  this.keys = []
  this.values = []
}
FakeMap.prototype.get = function (obj) {
  var idx = this.keys.indexOf(obj)
  if (idx !== -1) {
    return this.values[idx]
  }
}
FakeMap.prototype.set = function (key, value) {
  this.keys.push(key)
  this.values.push(value)
}
