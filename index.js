var values = {
  'string': true,
  'number': true,
  'boolean': true,
  // Kinda a lie, but returning the functions unmodified
  // leads to the least confusing behavior.
  'function': true
}

var validConstructors = [ Date ]

if (typeof Int8Array === 'function') {
  validConstructors.push(Int8Array)
}
if (typeof Uint8Array === 'function') {
  validConstructors.push(Uint8Array)
}
if (typeof Uint8ClampedArray === 'function') {
  validConstructors.push(Uint8ClampedArray)
}
if (typeof Int16Array === 'function') {
  validConstructors.push(Int16Array)
}
if (typeof Uint16Array === 'function') {
  validConstructors.push(Uint16Array)
}
if (typeof Int32Array === 'function') {
  validConstructors.push(Int32Array)
}
if (typeof Uint32Array === 'function') {
  validConstructors.push(Uint32Array)
}
if (typeof Float32Array === 'function') {
  validConstructors.push(Float32Array)
}
if (typeof Float64Array === 'function') {
  validConstructors.push(Float64Array)
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

  var copy
  if (copyingConstructor(original)) {
    copy = new original.constructor(original)
    seen.push(original)
    copies.push(copy)
    return copy
  } else if (shouldSlice(original)) {
    copy = original.slice()
    seen.push(original)
    copies.push(copy)
    return copy
  } else if (original instanceof RegExp) {
    var flags = []
    if (original.global) flags.push('g')
    if (original.ignoreCase) flags.push('i')
    if (original.multiline) flags.push('m')
    copy = new RegExp(original.source, flags.join(''))
    seen.push(original)
    copies.push(copy)
    return copy
  } else if (typeof Set === 'function' && original instanceof Set) {
    copy = new (original.constructor || Set)
    seen.push(original)
    copies.push(copy)
    original.forEach(function (v) {
      copy.add(deepCopy(v, seen, copies))
    })
    return copy
  } else if (typeof Map === 'function' && original instanceof Map) {
    copy = new (original.constructor || Map)
    seen.push(original)
    copies.push(copy)
    original.forEach(function (v, k) {
      copy.set(deepCopy(k, seen, copies), deepCopy(v, seen, copies))
    })
    return copy
  }

  // if none of the special cases hit, copy original as a generic object.
  return objectCopy(original, seen, copies)
}

function objectCopy (original, seen, copies) {
  var copy = new (original.constructor || Object)
  seen.push(original)
  copies.push(copy)

  Object.getOwnPropertyNames(original).forEach(function (key) {
    var descriptor = Object.getOwnPropertyDescriptor(original, key)
    descriptor.value = deepCopy(descriptor.value, seen, copies)
    try {
      Object.defineProperty(copy, key, descriptor)
    } catch (e) {
      // When define property fails it means we shouldn't
      // have been trying to write the property we were.
      // example: the stack of an error object.
    }
  })

  if (typeof Object.getOwnPropertySymbols === 'function') {
    Object.getOwnPropertySymbols(original).forEach(function (sym) {
      copy[sym] = deepCopy(original[sym], seen, copies)
    })
  }

  return copy
}

function copyingConstructor (original) {
  return validConstructors.reduce(function (valid, constructor) {
    if (valid) return valid
    return original instanceof constructor
  }, false)
}

function shouldSlice (original) {
  if (typeof ArrayBuffer === 'function' && original instanceof ArrayBuffer) {
    return true
  }
}
