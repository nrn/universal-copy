var test = require('tape')
var copy = require('./index')

test('deep-copy', function (t) {
  // values
  t.equal(copy('bar'), 'bar', 'Returns strings')
  t.equal(copy(2), 2, 'Returns numbers')
  t.equal(copy(undefined), undefined, 'Returns undefined')
  t.equal(copy(null), null, 'Returns null')
  t.equal(copy(Infinity), Infinity, 'Returns Infinity')
  t.ok(isNaN(copy(NaN)), 'Returns NaN')
  t.equal(copy(add), add, 'Return functions as they were passed')
  function add (a, b) { return a + b }

  // objects
  var obj = {
    foo: { bar: 'baz' }
  }
  var copyOfObj = copy(obj)
  t.same(obj, copyOfObj, 'copy is the same')
  t.notEqual(obj, copyOfObj, 'copy is not equal')
  t.notEqual(obj.foo, copyOfObj.foo, 'Nested obj is not the same')

  var circle1 = {}
  var circle2 = {}
  circle1.a = circle2
  circle2.a = circle1
  var circle1B = copy(circle1)
  t.equal(circle1B, circle1B.a.a, 'When encountered multipel times, return same obj')

  var errA = new TypeError('foo')
  var errB = copy(errA)
  t.ok(errB instanceof Error, 'err is Error')
  t.equal(errA.message, errB.message, 'Message is the same')

  var noProtoA = Object.create(null)
  noProtoA.asdf = 'qwerty'
  var noProtoB = copy(noProtoA)
  t.equal(noProtoB.asdf, 'qwerty', 'no proto copy has prop')
  t.equal(typeof noProtoB.toString, 'undefined', 'Does not have a toString')

  // array
  var arrA = [ 1, 2, { asdf: 'aargh' } ]
  var arrB = copy(arrA)
  t.ok(Array.isArray(arrB), 'Copy is a real array')
  t.equal(arrB.length, 3, 'has the correct length')
  t.notEqual(arrA[2], arrB[2], 'Deep copy')
  t.equal(arrB[2].asdf, 'aargh', 'Deep copy gave correct value')

  // copying constructors
  var date = new Date(1234567890)
  t.equal(copy(date).getTime(), date.getTime(), 'copy date')

  var typedA = new Buffer('foobarbaz')
  var typedB = copy(typedA)
  typedB[1] = 122
  t.equal(typedB.length, 9, Buffer.name + ': Correct length')
  t.equal(typedB[0], 102, Buffer.name + ': Correct stuff')
  t.equal(typedA[1], 111, Buffer.name + ': Does not change old array')
  t.notEqual(typedA, typedB, Buffer.name + ': not the same obj.')

  t.test('set and map', { skip: typeof Set !== 'function' }, function (t) {
    // sets and maps
    var setA = new Set()
    setA.add('a')
    setA.add('b')
    setA.add(1)
    setA.add(obj)

    var setB = copy(setA)
    t.ok(setB.has(1) && setB.has('a') && setB.has('b'), 'set works')
    t.notOk(setB.has(obj), 'Same object not in set')

    var mapA = new Map()
    mapA.set(1, 2)
    mapA.set('a', obj)
    var mapB = copy(mapA)
    t.equal(mapB.get(1), 2, 'map works')
    t.same(mapB.get('a'), obj, 'inner object there')
    t.notEqual(mapB.get('a'), obj, 'inner object coppied')

    t.end()
  })

  t.test('arraybuffer', { skip: typeof ArrayBuffer !== 'function' }, function (t) {
    // slice
    var bufA = new ArrayBuffer(8)
    var bufB = copy(bufA)
    t.notEqual(bufA, bufB, 'Not the same object')
    t.equal(bufA.byteLength, bufB.byteLength, 'same length')
    t.end()
  })

  // regexp
  var regA = /^asdf asdf/gim
  var regB = copy(regA)

  t.equal('asdf AsDf\nAsdf asdf'.match(regB).length, 2, 'copy regexp w/ flags')
  t.notEqual(regB, regA, 'Objects not the same')

  t.test('symbols', { skip: typeof Symbol !== 'function' }, function (t) {
    var sym1 = Symbol('foo')
    var sym2 = Symbol('bar')

    t.equal(copy(sym1), sym1, 'symbols return equal')

    var obj = {
      foo: { bar: 'baz' }
    }
    obj[sym1] = 'symbol'
    obj[sym2] = { key: 'value' }
    var copyOfObj = copy(obj)
    t.equal(copyOfObj[sym1], 'symbol', 'Coppies symbols')
    t.same(obj[sym2], copyOfObj[sym2], 'Nested obj by sym same value')
    t.notEqual(obj[sym2], copyOfObj[sym2], 'Nested obj by sym not the same ref')
    t.end()
  })

  t.test('typedArray', { skip: typeof Int8Array !== 'function' }, function (t) {
    ;[
      Int8Array,
      Uint8Array,
      Uint8ClampedArray,
      Int16Array,
      Uint16Array,
      Int32Array,
      Uint32Array,
      Float32Array,
      Float64Array
    ].forEach(function (TypedArr) {
      var typedA = new TypedArr(8)
      typedA[0] = 1
      var typedB = copy(typedA)
      typedB[1] = 1
      t.equal(typedB.length, 8, TypedArr.name + ': Correct length')
      t.equal(typedB[0], 1, TypedArr.name + ': Correct stuff')
      t.equal(typedA[1], 0, TypedArr.name + ': Does not change old array')
      t.notEqual(typedA, typedB, TypedArr.name + ': not the same obj.')
    })
    t.end()
  })

  t.end()
})
