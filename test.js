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
  var sym1 = Symbol('foo')
  var sym2 = Symbol('bar')
  obj[sym1] = 'symbol'
  obj[sym2] = { key: 'value' }
  var copyOfObj = copy(obj)
  t.same(obj, copyOfObj, 'copy is the same')
  t.notEqual(obj, copyOfObj, 'copy is not equal')
  t.notEqual(obj.foo, copyOfObj.foo, 'Nested obj is not the same')
  t.equal(copyOfObj[sym1], 'symbol', 'Coppies symbols')
  t.same(obj[sym2], copyOfObj[sym2], 'Nested obj by sym same value')
  t.notEqual(obj[sym2], copyOfObj[sym2], 'Nested obj by sym not the same ref')

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

  var typedA = new Int8Array(8)
  var typedB = copy(typedA)
  t.equal(typedB.length, 8, 'Correct length')
  t.notEqual(typedA, typedB, 'Typed arrays not the same obj.')

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

  // slice
  var bufA = new ArrayBuffer(8)
  var bufB = copy(bufA)
  t.notEqual(bufA, bufB, 'Not the same object')
  t.equal(bufA.byteLength, bufB.byteLength, 'same length')

  // regexp
  var reg = /^asdf asdf/gim
  t.equal('asdf AsDf\nAsdf asdf'.match(copy(reg)).length, 2, 'copy regexp w/ flags')
  t.end()
})
