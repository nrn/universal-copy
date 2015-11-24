# Universal Copy

Deep copy anything. Works on Objects, Arrays, Sets, Maps, RegExp, Dates,
TypedArrays, ArrayBuffers, and more.

```javascript
var universalCopy = require('universal-copy')
```

## API

### universalCopy(anything)

Returns a recursive deep copy of anything. Returns the originals for things
that are passed by value instead of reference, and functions, where the meaning
of copying is ambiguous. For everything else it creates a new object with the
same values as the old one, to the best of its ability. Copy includes symbols
and non-enumerable properties, uses define property to keep the same status as
the property being copied.

