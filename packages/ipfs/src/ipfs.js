/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
* https://ijs.network
*-----------------------------------------------------------*/

;(function (globalObject) {
  /*---------------------------------------------------------------------------------------------
  *  Copyright (c) 2020 Protocol Labs
  *  Licensed under the MIT License.
  *  https://github.com/multiformats/js-multiformats/blob/master/LICENSE-MIT
  *--------------------------------------------------------------------------------------------*/
  //https://github.com/multiformats/js-multiformats/blob/bb14a29dd823a517ef0c6c741d265e022591d831/src/hashes/digest.js#L66

  class Digest {
    constructor(code, size, digest, bytes) {
      this.code = code;
      this.size = size;
      this.digest = digest;
      this.bytes = bytes;
    }
  }

  const readonly = { writable: false, configurable: false, enumerable: true }
  const hidden = { writable: false, enumerable: false, configurable: false }

  //https://github.com/multiformats/js-multiformats/blob/bb14a29dd823a517ef0c6c741d265e022591d831/src/bases/base.js#L135
  class ComposedDecoder {

    constructor(decoders) {
      this.decoders = decoders
    }

    or(decoder) {
      return or(this, decoder)
    }

    decode(input) {
      const prefix = /** @type {Prefix} */ (input[0])
      const decoder = this.decoders[prefix]
      if (decoder) {
        return decoder.decode(input)
      } else {
        throw RangeError(`Unable to decode multibase string ${JSON.stringify(input)}, only inputs prefixed with ${Object.keys(this.decoders)} are supported`)
      }
    }
  }

  //https://github.com/multiformats/js-multiformats/blob/bb14a29dd823a517ef0c6c741d265e022591d831/src/bases/base.js#L174
  const or = (left, right) => new ComposedDecoder(/** @type {Decoders<L|R>} */({
    ...(left.decoders || { [/** @type UnibaseDecoder<L> */(left).prefix]: left }),
    ...(right.decoders || { [/** @type UnibaseDecoder<R> */(right).prefix]: right })
  }))

  //https://github.com/multiformats/js-multiformats/blob/bb14a29dd823a517ef0c6c741d265e022591d831/src/bases/base.js#L78
  class Decoder {

    constructor(name, prefix, baseDecode) {
      this.name = name
      this.prefix = prefix
      this.baseDecode = baseDecode
    }

    decode(text) {
      if (typeof text === 'string') {
        switch (text[0]) {
          case this.prefix: {
            return this.baseDecode(text.slice(1))
          }
          default: {
            throw Error(`Unable to decode multibase string ${JSON.stringify(text)}, ${this.name} decoder only supports inputs prefixed with ${this.prefix}`)
          }
        }
      } else {
        throw Error('Can only multibase decode strings')
      }
    }

    or(decoder) {
      return or(this, decoder)
    }
  }

  //https://github.com/multiformats/js-multiformats/blob/bb14a29dd823a517ef0c6c741d265e022591d831/src/bases/base.js#L29
  class Encoder {

    constructor(name, prefix, baseEncode) {
      this.name = name
      this.prefix = prefix
      this.baseEncode = baseEncode
    }

    encode(bytes) {
      if (bytes instanceof Uint8Array) {
        return `${this.prefix}${this.baseEncode(bytes)}`
      } else {
        throw Error('Unknown type, must be binary type')
      }
    }
  }

  //https://github.com/multiformats/js-multiformats/blob/bb14a29dd823a517ef0c6c741d265e022591d831/src/bases/base.js#L195
  class Codec {

    constructor(name, prefix, baseEncode, baseDecode) {
      this.name = name
      this.prefix = prefix
      this.baseEncode = baseEncode
      this.baseDecode = baseDecode
      this.encoder = new Encoder(name, prefix, baseEncode)
      this.decoder = new Decoder(name, prefix, baseDecode)
    }

    encode(input) {
      return this.encoder.encode(input)
    }

    decode(input) {
      return this.decoder.decode(input)
    }
  }

  //https://github.com/multiformats/js-multiformats/blob/bb14a29dd823a517ef0c6c741d265e022591d831/src/bases/base.js#L236
  const from_1 = ({ name, prefix, encode, decode }) =>
    new Codec(name, prefix, encode, decode)

  //https://github.com/multiformats/js-multiformats/blob/bb14a29dd823a517ef0c6c741d265e022591d831/vendor/base-x.js#L6
  function _basex(ALPHABET, name) {
    if (ALPHABET.length >= 255) { throw new TypeError('Alphabet too long') }
    var BASE_MAP = new Uint8Array(256);
    for (var j = 0; j < BASE_MAP.length; j++) {
      BASE_MAP[j] = 255;
    }
    for (var i = 0; i < ALPHABET.length; i++) {
      var x = ALPHABET.charAt(i);
      var xc = x.charCodeAt(0);
      if (BASE_MAP[xc] !== 255) { throw new TypeError(x + ' is ambiguous') }
      BASE_MAP[xc] = i;
    }
    var BASE = ALPHABET.length;
    var LEADER = ALPHABET.charAt(0);
    var FACTOR = Math.log(BASE) / Math.log(256); // log(BASE) / log(256), rounded up
    var iFACTOR = Math.log(256) / Math.log(BASE); // log(256) / log(BASE), rounded up
    function encode(source) {
      if (source instanceof Uint8Array); else if (ArrayBuffer.isView(source)) {
        source = new Uint8Array(source.buffer, source.byteOffset, source.byteLength);
      } else if (Array.isArray(source)) {
        source = Uint8Array.from_1(source);
      }
      if (!(source instanceof Uint8Array)) { throw new TypeError('Expected Uint8Array') }
      if (source.length === 0) { return '' }
      // Skip & count leading zeroes.
      var zeroes = 0;
      var length = 0;
      var pbegin = 0;
      var pend = source.length;
      while (pbegin !== pend && source[pbegin] === 0) {
        pbegin++;
        zeroes++;
      }
      // Allocate enough space in big-endian base58 representation.
      var size = ((pend - pbegin) * iFACTOR + 1) >>> 0;
      var b58 = new Uint8Array(size);
      // Process the bytes.
      while (pbegin !== pend) {
        var carry = source[pbegin];
        // Apply "b58 = b58 * 256 + ch".
        var i = 0;
        for (var it1 = size - 1; (carry !== 0 || i < length) && (it1 !== -1); it1--, i++) {
          carry += (256 * b58[it1]) >>> 0;
          b58[it1] = (carry % BASE) >>> 0;
          carry = (carry / BASE) >>> 0;
        }
        if (carry !== 0) { throw new Error('Non-zero carry') }
        length = i;
        pbegin++;
      }
      // Skip leading zeroes in base58 result.
      var it2 = size - length;
      while (it2 !== size && b58[it2] === 0) {
        it2++;
      }
      // Translate the result into a string.
      var str = LEADER.repeat(zeroes);
      for (; it2 < size; ++it2) { str += ALPHABET.charAt(b58[it2]); }
      return str
    }
    function decodeUnsafe(source) {
      if (typeof source !== 'string') { throw new TypeError('Expected String') }
      if (source.length === 0) { return new Uint8Array() }
      var psz = 0;
      // Skip leading spaces.
      if (source[psz] === ' ') { return }
      // Skip and count leading '1's.
      var zeroes = 0;
      var length = 0;
      while (source[psz] === LEADER) {
        zeroes++;
        psz++;
      }
      // Allocate enough space in big-endian base256 representation.
      var size = (((source.length - psz) * FACTOR) + 1) >>> 0; // log(58) / log(256), rounded up.
      var b256 = new Uint8Array(size);
      // Process the characters.
      while (source[psz]) {
        // Decode character
        var carry = BASE_MAP[source.charCodeAt(psz)];
        // Invalid character
        if (carry === 255) { return }
        var i = 0;
        for (var it3 = size - 1; (carry !== 0 || i < length) && (it3 !== -1); it3--, i++) {
          carry += (BASE * b256[it3]) >>> 0;
          b256[it3] = (carry % 256) >>> 0;
          carry = (carry / 256) >>> 0;
        }
        if (carry !== 0) { throw new Error('Non-zero carry') }
        length = i;
        psz++;
      }
      // Skip trailing spaces.
      if (source[psz] === ' ') { return }
      // Skip leading zeroes in b256.
      var it4 = size - length;
      while (it4 !== size && b256[it4] === 0) {
        it4++;
      }
      var vch = new Uint8Array(zeroes + (size - it4));
      var j = zeroes;
      while (it4 !== size) {
        vch[j++] = b256[it4++];
      }
      return vch
    }
    function decode(string) {
      var buffer = decodeUnsafe(string);
      if (buffer) { return buffer }
      throw new Error(`Non-${name} character`)
    }
    return {
      encode: encode,
      decodeUnsafe: decodeUnsafe,
      decode: decode
    }
  }

  //https://github.com/multiformats/js-multiformats/blob/bb14a29dd823a517ef0c6c741d265e022591d831/src/bases/base.js#L248
  const baseX = ({ prefix, name, alphabet }) => {
    const { encode, decode } = _basex(alphabet, name)
    return from_1({
      prefix,
      name,
      encode,
      decode: text => coerce(decode(text))
    })
  }

  //https://github.com/multiformats/js-multiformats/blob/bb14a29dd823a517ef0c6c741d265e022591d831/src/bases/base.js#L321
  const _encode = (data, alphabet, bitsPerChar) => {
    const pad = alphabet[alphabet.length - 1] === '='
    const mask = (1 << bitsPerChar) - 1
    let out = ''

    let bits = 0 // Number of bits currently in the buffer
    let buffer = 0 // Bits waiting to be written out, MSB first
    for (let i = 0; i < data.length; ++i) {
      // Slurp data into the buffer:
      buffer = (buffer << 8) | data[i]
      bits += 8

      // Write out as much as we can:
      while (bits > bitsPerChar) {
        bits -= bitsPerChar
        out += alphabet[mask & (buffer >> bits)]
      }
    }

    // Partial character:
    if (bits) {
      out += alphabet[mask & (buffer << (bitsPerChar - bits))]
    }

    // Add padding characters until we hit a byte boundary:
    if (pad) {
      while ((out.length * bitsPerChar) & 7) {
        out += '='
      }
    }

    return out
  }

  //https://github.com/multiformats/js-multiformats/blob/bb14a29dd823a517ef0c6c741d265e022591d831/src/bases/base.js#L268
  const _decode = (string, alphabet, bitsPerChar, name) => {
    // Build the character lookup table:
    /** @type {Record<string, number>} */
    const codes = {}
    for (let i = 0; i < alphabet.length; ++i) {
      codes[alphabet[i]] = i
    }

    // Count the padding bytes:
    let end = string.length
    while (string[end - 1] === '=') {
      --end
    }

    const out = new Uint8Array((end * bitsPerChar / 8) | 0)

    let bits = 0
    let buffer = 0
    let written = 0
    for (let i = 0; i < end; ++i) {
      const value = codes[string[i]]
      if (value === undefined) {
        throw new SyntaxError(`Non-${name} character`)
      }

      buffer = (buffer << bitsPerChar) | value
      bits += bitsPerChar

      if (bits >= 8) {
        bits -= 8
        out[written++] = 0xff & (buffer >> bits)
      }
    }

    if (bits >= bitsPerChar || 0xff & (buffer << (8 - bits))) {
      throw new SyntaxError('Unexpected end of data')
    }

    return out
  }

  //https://github.com/multiformats/js-multiformats/blob/bb14a29dd823a517ef0c6c741d265e022591d831/src/bases/base.js#L366
  const rfc4648 = ({ name, prefix, bitsPerChar, alphabet }) => {
    return from_1({
      prefix,
      name,
      encode(input) {
        return _encode(input, alphabet, bitsPerChar)
      },
      decode(input) {
        return _decode(input, alphabet, bitsPerChar, name)
      }
    })
  }

  //https://github.com/multiformats/js-multiformats/blob/bb14a29dd823a517ef0c6c741d265e022591d831/src/bases/base58.js#L3
  const base58btc = baseX({
    name: 'base58btc',
    prefix: 'z',
    alphabet: '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
  })

  //https://github.com/multiformats/js-multiformats/blob/bb14a29dd823a517ef0c6c741d265e022591d831/src/bases/base32.js#L3
  const base32 = rfc4648({
    prefix: 'b',
    name: 'base32',
    alphabet: 'abcdefghijklmnopqrstuvwxyz234567',
    bitsPerChar: 5
  })

  const DAG_PB_CODE = 0x70
  const RAW_CODE = 0x55

  //https://github.com/multiformats/js-multiformats/blob/bb14a29dd823a517ef0c6c741d265e022591d831/vendor/varint.js#L58
  var N1 = Math.pow(2, 7);
  var N2 = Math.pow(2, 14);
  var N3 = Math.pow(2, 21);
  var N4 = Math.pow(2, 28);
  var N5 = Math.pow(2, 35);
  var N6 = Math.pow(2, 42);
  var N7 = Math.pow(2, 49);
  var N8 = Math.pow(2, 56);
  var N9 = Math.pow(2, 63);

  //https://github.com/multiformats/js-multiformats/blob/bb14a29dd823a517ef0c6c741d265e022591d831/vendor/varint.js#L68
  var encodingLength_2 = function (value) {
    return (
      value < N1 ? 1
        : value < N2 ? 2
          : value < N3 ? 3
            : value < N4 ? 4
              : value < N5 ? 5
                : value < N6 ? 6
                  : value < N7 ? 7
                    : value < N8 ? 8
                      : value < N9 ? 9
                        : 10
    )
  };

  //https://github.com/multiformats/js-multiformats/blob/bb14a29dd823a517ef0c6c741d265e022591d831/vendor/varint.js#L30
  var MSB$1 = 0x80
    , REST$1 = 0x7F
    , MSBALL = ~REST
    , INT = Math.pow(2, 31);

  //https://github.com/multiformats/js-multiformats/blob/bb14a29dd823a517ef0c6c741d265e022591d831/vendor/varint.js#L33
  function decode_2(buf, offset) {
    var res = 0
      , offset = offset || 0
      , shift = 0
      , counter = offset
      , b
      , l = buf.length;

    do {
      if (counter >= l) {
        decode_2.bytes = 0;
        throw new RangeError('Could not decode varint')
      }
      b = buf[counter++];
      res += shift < 28
        ? (b & REST$1) << shift
        : (b & REST$1) * Math.pow(2, shift);
      shift += 7;
    } while (b >= MSB$1)

    decode_2.bytes = counter - offset;

    return res
  }

  //https://github.com/multiformats/js-multiformats/blob/bb14a29dd823a517ef0c6c741d265e022591d831/src/varint.js#L7
  const decode_1 = (data) => {
    const code = decode_2(data)
    return [code, decode_2.bytes]
  }

  //https://github.com/multiformats/js-multiformats/blob/bb14a29dd823a517ef0c6c741d265e022591d831/vendor/varint.js#L8
  function encode_2(num, out, offset) {
    out = out || [];
    offset = offset || 0;
    var oldOffset = offset;

    while (num >= INT) {
      out[offset++] = (num & 0xFF) | MSB;
      num /= 128;
    }
    while (num & MSBALL) {
      out[offset++] = (num & 0xFF) | MSB;
      num >>>= 7;
    }
    out[offset] = num | 0;

    encode_2.bytes = offset - oldOffset + 1;

    return out
  }

  //https://github.com/multiformats/js-multiformats/blob/bb14a29dd823a517ef0c6c741d265e022591d831/src/varint.js#L17
  const encodeTo_1 = (int, target, offset = 0) => {
    encode_2(int, target, offset)
    return target
  }

  //https://github.com/multiformats/js-multiformats/blob/bb14a29dd823a517ef0c6c741d265e022591d831/src/varint.js#L26
  const encodingLength_1 = (int) => {
    return encodingLength_2(int)
  }

  //https://github.com/multiformats/js-multiformats/blob/bb14a29dd823a517ef0c6c741d265e022591d831/src/cid.js#L382
  const parseCIDtoBytes = (source, base) => {
    switch (source[0]) {
      case 'Q': {
        const decoder = base || base58btc
        return [base58btc.prefix, decoder.decode(`${base58btc.prefix}${source}`)]
      }
      case base58btc.prefix: {
        const decoder = base || base58btc
        return [base58btc.prefix, decoder.decode(source)]
      }
      case base32.prefix: {
        const decoder = base || base32
        return [base32.prefix, decoder.decode(source)]
      }
      default: {
        if (base == null) {
          throw Error('To parse non base32 or base58btc encoded CID multibase decoder must be provided')
        }
        return [source[0], base.decode(source)]
      }
    }
  }

  //https://github.com/multiformats/js-multiformats/blob/bb14a29dd823a517ef0c6c741d265e022591d831/src/cid.js#L412
  const toStringV0 = (bytes, cache, base) => {
    const { prefix } = base
    if (prefix !== base58btc.prefix) {
      throw Error(`Cannot string encode V0 in ${base.name} encoding`)
    }

    const cid = cache.get(prefix)
    if (cid == null) {
      const cid = base.encode(bytes).slice(1)
      cache.set(prefix, cid)
      return cid
    } else {
      return cid
    }
  }

  //https://github.com/multiformats/js-multiformats/blob/bb14a29dd823a517ef0c6c741d265e022591d831/src/cid.js#L434
  const toStringV1 = (bytes, cache, base) => {
    const { prefix } = base
    const cid = cache.get(prefix)
    if (cid == null) {
      const cid = base.encode(bytes)
      cache.set(prefix, cid)
      return cid
    } else {
      return cid
    }
  }

  //https://github.com/multiformats/js-multiformats/blob/bb14a29dd823a517ef0c6c741d265e022591d831/src/cid.js#L455
  const encodeCID = (version, code, multihash) => {
    const codeOffset = encodingLength_1(version)
    const hashOffset = codeOffset + encodingLength_1(code)
    const bytes = new Uint8Array(hashOffset + multihash.byteLength)
    encodeTo_1(version, bytes, 0)
    encodeTo_1(code, bytes, codeOffset)
    bytes.set(multihash, hashOffset)
    return bytes
  }

  //https://github.com/multiformats/js-multiformats/blob/bb14a29dd823a517ef0c6c741d265e022591d831/src/bytes.js#L39
  const coerce = o => {
    if (o instanceof Uint8Array && o.constructor.name === 'Uint8Array') return o
    if (o instanceof ArrayBuffer) return new Uint8Array(o)
    if (ArrayBuffer.isView(o)) {
      return new Uint8Array(o.buffer, o.byteOffset, o.byteLength)
    }
    throw new Error('Unknown type, must be binary type')
  }

  //https://github.com/multiformats/js-multiformats/blob/bb14a29dd823a517ef0c6c741d265e022591d831/src/cid.js#L22
  class CID {

    constructor(version, code, multihash, bytes) {
      this.code = code
      this.version = version
      this.multihash = multihash
      this.bytes = bytes
      this.byteOffset = bytes.byteOffset
      this.byteLength = bytes.byteLength
      this.asCID = this
      this._baseCache = new Map()

      Object.defineProperties(this, {
        byteOffset: hidden,
        byteLength: hidden,

        code: readonly,
        version: readonly,
        multihash: readonly,
        bytes: readonly,

        _baseCache: hidden,
        asCID: hidden
      })
    }

    toString(base) {
      const { bytes, version, _baseCache } = this
      switch (version) {
        case 0:
          return toStringV0(bytes, _baseCache, base || base58btc.encoder)
        default:
          return toStringV1(bytes, _baseCache, base || base32.encoder)
      }
    }

    static create(version, code, digest) {
      if (typeof code !== 'number') {
        throw new Error('String codecs are no longer supported')
      }

      switch (version) {
        case 0: {
          if (code !== DAG_PB_CODE) {
            throw new Error(`Version 0 CID must use dag-pb (code: ${DAG_PB_CODE}) block encoding`)
          } else {
            return new CID(version, code, digest, digest.bytes)
          }
        }
        case 1: {
          const bytes = encodeCID(version, code, digest.bytes)
          return new CID(version, code, digest, bytes)
        }
        default: {
          throw new Error('Invalid version')
        }
      }
    }

    static parse(source, base) {
      const [prefix, bytes] = parseCIDtoBytes(source, base)

      const cid = CID.decode(bytes)
      cid._baseCache.set(prefix, source)

      return cid
    }

    static decode(bytes) {
      const [cid, remainder] = CID.decodeFirst(bytes)
      if (remainder.length) {
        throw new Error('Incorrect length')
      }
      return cid
    }

    static decodeFirst(bytes) {
      const specs = CID.inspectBytes(bytes)
      const prefixSize = specs.size - specs.multihashSize
      const multihashBytes = coerce(bytes.subarray(prefixSize, prefixSize + specs.multihashSize))
      if (multihashBytes.byteLength !== specs.multihashSize) {
        throw new Error('Incorrect length')
      }
      const digestBytes = multihashBytes.subarray(specs.multihashSize - specs.digestSize)
      const digest = new Digest(specs.multihashCode, specs.digestSize, digestBytes, multihashBytes)
      const cid = specs.version === 0 ? CID.createV0(digest) : CID.createV1(specs.codec, digest)
      return [cid, bytes.subarray(specs.size)]
    }

    static inspectBytes(initialBytes) {
      let offset = 0
      const next = () => {
        const [i, length] = decode_1(initialBytes.subarray(offset))
        offset += length
        return i
      }

      let version = next()
      let codec = DAG_PB_CODE
      if (version === 18) { // CIDv0
        version = 0
        offset = 0
      } else if (version === 1) {
        codec = next()
      }

      if (version !== 0 && version !== 1) {
        throw new RangeError(`Invalid CID version ${version}`)
      }

      const prefixSize = offset
      const multihashCode = next()
      const digestSize = next()
      const size = offset + digestSize
      const multihashSize = size - prefixSize

      return { version, codec, multihashCode, digestSize, multihashSize, size }
    }

    static createV0(digest) {
      return CID.create(0, DAG_PB_CODE, digest)
    }

    static createV1(code, digest) {
      return CID.create(1, code, digest)
    }
  }
  /*---------------------------------------------------------------------------------------------
  *  Copyright (c) 2016, Daniel Wirtz  All rights reserved.
  *  https://github.com/protobufjs/protobuf.js/blob/master/LICENSE
  *--------------------------------------------------------------------------------------------*/
  var protobuf = {};//exports;

  protobuf.build = "minimal";

  //https://github.com/protobufjs/protobuf.js/blob/2cdbba32da9951c1ff14e55e65e4a9a9f24c70fd/lib/inquire/index.js#L10
  const util_inquire = function inquire(moduleName) {
    try {
      var mod = eval("quire".replace(/^/, "re"))(moduleName);
      if (mod && (mod.length || Object.keys(mod).length))
        return mod;
    } catch (e) { }
    return null;
  }

  //https://github.com/protobufjs/protobuf.js/blob/2cdbba32da9951c1ff14e55e65e4a9a9f24c70fd/src/util/minimal.js#L126
  const util_Buffer = (function () {
    try {
      var Buffer = util_inquire("buffer").Buffer;
      return Buffer.prototype.utf8Write ? Buffer : null;
    } catch (e) {
      return null;
    }
  })();

  //https://github.com/protobufjs/protobuf.js/blob/2cdbba32da9951c1ff14e55e65e4a9a9f24c70fd/src/writer.js#L21
  function Op(fn, len, val) {

    this.fn = fn;
    this.len = len;
    this.next = undefined;
    this.val = val;
  }

  //https://github.com/protobufjs/protobuf.js/blob/2cdbba32da9951c1ff14e55e65e4a9a9f24c70fd/src/writer.js#L49
  function noop() { }

  //https://github.com/protobufjs/protobuf.js/blob/2cdbba32da9951c1ff14e55e65e4a9a9f24c70fd/src/writer.js#L91
  function Writer() {

    this.len = 0;
    this.head = new Op(noop, 0, 0);
    this.tail = this.head;
    this.states = null;
  }

  //https://github.com/protobufjs/protobuf.js/blob/2cdbba32da9951c1ff14e55e65e4a9a9f24c70fd/src/util/longbits.js#L14
  function util_LongBits(lo, hi) {
    this.lo = lo >>> 0;
    this.hi = hi >>> 0;
  }

  //https://github.com/protobufjs/protobuf.js/blob/2cdbba32da9951c1ff14e55e65e4a9a9f24c70fd/src/util/longbits.js#L37
  var zero = util_LongBits.zero = new util_LongBits(0, 0);

  //https://github.com/protobufjs/protobuf.js/blob/2cdbba32da9951c1ff14e55e65e4a9a9f24c70fd/src/util/longbits.js#L55
  util_LongBits.fromNumber = function fromNumber(value) {
    if (value === 0)
      return zero;
    var sign = value < 0;
    if (sign)
      value = -value;
    var lo = value >>> 0,
      hi = (value - lo) / 4294967296 >>> 0;
    if (sign) {
      hi = ~hi >>> 0;
      lo = ~lo >>> 0;
      if (++lo > 4294967295) {
        lo = 0;
        if (++hi > 4294967295)
          hi = 0;
      }
    }
    return new util_LongBits(lo, hi);
  };

  //https://github.com/protobufjs/protobuf.js/blob/2cdbba32da9951c1ff14e55e65e4a9a9f24c70fd/src/util/longbits.js#L80
  util_LongBits.from = function from(value) {
    if (typeof value === "number")
      return util_LongBits.fromNumber(value);
    if (util_isString(value)) {
      if (util_Long)
        value = util_Long.fromString(value);
      else
        return util_LongBits.fromNumber(parseInt(value, 10));
    }
    return value.low || value.high ? new util_LongBits(value.low >>> 0, value.high >>> 0) : zero;
  };

  //https://github.com/protobufjs/protobuf.js/blob/2cdbba32da9951c1ff14e55e65e4a9a9f24c70fd/src/util/longbits.js#L187
  util_LongBits.prototype.length = function length() {
    var part0 = this.lo,
      part1 = (this.lo >>> 28 | this.hi << 4) >>> 0,
      part2 = this.hi >>> 24;
    return part2 === 0
      ? part1 === 0
        ? part0 < 16384
          ? part0 < 128 ? 1 : 2
          : part0 < 2097152 ? 3 : 4
        : part1 < 16384
          ? part1 < 128 ? 5 : 6
          : part1 < 2097152 ? 7 : 8
      : part2 < 128 ? 9 : 10;
  };

  //https://github.com/protobufjs/protobuf.js/blob/2cdbba32da9951c1ff14e55e65e4a9a9f24c70fd/src/writer.js#L242
  function writeVarint64(val, buf, pos) {
    while (val.hi) {
      buf[pos++] = val.lo & 127 | 128;
      val.lo = (val.lo >>> 7 | val.hi << 25) >>> 0;
      val.hi >>>= 7;
    }
    while (val.lo > 127) {
      buf[pos++] = val.lo & 127 | 128;
      val.lo = val.lo >>> 7;
    }
    buf[pos++] = val.lo;
  }

  //https://github.com/protobufjs/protobuf.js/blob/2cdbba32da9951c1ff14e55e65e4a9a9f24c70fd/src/writer.js#L261
  Writer.prototype.uint64 = function write_uint64(value) {
    var bits = util_LongBits.from(value);
    return this._push(writeVarint64, bits.length(), bits);
  };

  //https://github.com/protobufjs/protobuf.js/blob/2cdbba32da9951c1ff14e55e65e4a9a9f24c70fd/src/writer.js#L166
  Writer.prototype._push = function push(fn, len, val) {
    this.tail = this.tail.next = new Op(fn, len, val);
    this.len += len;
    return this;
  };

  //https://github.com/protobufjs/protobuf.js/blob/2cdbba32da9951c1ff14e55e65e4a9a9f24c70fd/src/util/minimal.js#L79
  const util_isString = function isString(value) {
    return typeof value === "string" || value instanceof String;
  };

  var invalidEncoding = "invalid encoding";
  var s64 = new Array(123);

  //https://github.com/protobufjs/protobuf.js/blob/2cdbba32da9951c1ff14e55e65e4a9a9f24c70fd/lib/base64/index.js#L96
  const base64_decode = function decode(string, buffer, offset) {
    var start = offset;
    var j = 0,
      t;
    for (var i = 0; i < string.length;) {
      var c = string.charCodeAt(i++);
      if (c === 61 && j > 1)
        break;
      if ((c = s64[c]) === undefined)
        throw Error(invalidEncoding);
      switch (j) {
        case 0:
          t = c;
          j = 1;
          break;
        case 1:
          buffer[offset++] = t << 2 | (c & 48) >> 4;
          t = c;
          j = 2;
          break;
        case 2:
          buffer[offset++] = (t & 15) << 4 | (c & 60) >> 2;
          t = c;
          j = 3;
          break;
        case 3:
          buffer[offset++] = (t & 3) << 6 | c;
          j = 0;
          break;
      }
    }
    if (j === 1)
      throw Error(invalidEncoding);
    return offset - start;
  };

  //https://github.com/protobufjs/protobuf.js/blob/2cdbba32da9951c1ff14e55e65e4a9a9f24c70fd/src/writer.js#L172
  function writeByte(val, buf, pos) {
    buf[pos] = val & 255;
  }

  //https://github.com/protobufjs/protobuf.js/blob/2cdbba32da9951c1ff14e55e65e4a9a9f24c70fd/lib/base64/index.js#L15
  const base64_length = function length(string) {
    var p = string.length;
    if (!p)
      return 0;
    var n = 0;
    while (--p % 4 > 1 && string.charAt(p) === "=")
      ++n;
    return Math.ceil(string.length * 3) / 4 - n;
  };

  var util_Array = typeof Uint8Array !== "undefined" ? Uint8Array : Array;

  //https://github.com/protobufjs/protobuf.js/blob/2cdbba32da9951c1ff14e55e65e4a9a9f24c70fd/src/writer.js#L359
  var writeBytes = util_Array.prototype.set
    ? function writeBytes_set(val, buf, pos) {
      buf.set(val, pos);
    }
    : function writeBytes_for(val, buf, pos) {
      for (var i = 0; i < val.length; ++i)
        buf[pos + i] = val[i];
    };

  //https://github.com/protobufjs/protobuf.js/blob/2cdbba32da9951c1ff14e55e65e4a9a9f24c70fd/src/writer.js#L374
  Writer.prototype.bytes = function write_bytes(value) {
    var len = value.length >>> 0;
    if (!len)
      return this._push(writeByte, 1, 0);
    if (util_isString(value)) {
      var buf = Writer.alloc(len = base64_length(value));
      base64_decode(value, buf, 0);
      value = buf;
    }
    return this.uint32(len)._push(writeBytes, len, value);
  };

  //https://github.com/protobufjs/protobuf.js/blob/2cdbba32da9951c1ff14e55e65e4a9a9f24c70fd/src/writer.js#L124
  var w1_create = function w1_create() {
    return util_Buffer
      ? function create_buffer_setup() {
        return (Writer.create = function create_buffer() {
          return new BufferWriter();
        })();
      }
      : function create_array() {
        return new Writer();
      };
  };

  Writer.create = w1_create();

  //https://github.com/protobufjs/protobuf.js/blob/2cdbba32da9951c1ff14e55e65e4a9a9f24c70fd/src/writer.js#L176
  function writeVarint32(val, buf, pos) {
    while (val > 127) {
      buf[pos++] = val & 127 | 128;
      val >>>= 7;
    }
    buf[pos] = val;
  }

  //https://github.com/protobufjs/protobuf.js/blob/2cdbba32da9951c1ff14e55e65e4a9a9f24c70fd/src/writer.js#L193
  function VarintOp(len, val) {
    this.len = len;
    this.next = undefined;
    this.val = val;
  }

  VarintOp.prototype.fn = writeVarint32;

  //https://github.com/protobufjs/protobuf.js/blob/2cdbba32da9951c1ff14e55e65e4a9a9f24c70fd/src/writer.js#L207
  Writer.prototype.uint32 = function write_uint32(value) {
    this.len += (this.tail = this.tail.next = new VarintOp(
      (value = value >>> 0)
        < 128 ? 1
        : value < 16384 ? 2
          : value < 2097152 ? 3
            : value < 268435456 ? 4
              : 5,
      value)).len;
    return this;
  };

  //https://github.com/protobufjs/protobuf.js/blob/2cdbba32da9951c1ff14e55e65e4a9a9f24c70fd/src/writer.js#L227
  Writer.prototype.int32 = function write_int32(value) {
    return value < 0
      ? this._push(writeVarint64, 10, util_LongBits.fromNumber(value))
      : this.uint32(value);
  };

  //https://github.com/protobufjs/protobuf.js/blob/2cdbba32da9951c1ff14e55e65e4a9a9f24c70fd/src/writer.js#L149
  Writer.alloc = function alloc(size) {
    return new util_Array(size);
  };

  //https://github.com/protobufjs/protobuf.js/blob/2cdbba32da9951c1ff14e55e65e4a9a9f24c70fd/src/writer_buffer.js#L6
  (BufferWriter.prototype = Object.create(Writer.prototype)).constructor = BufferWriter;

  //https://github.com/protobufjs/protobuf.js/blob/2cdbba32da9951c1ff14e55e65e4a9a9f24c70fd/src/writer.js#L448
  Writer.prototype.finish = function finish() {
    var head = this.head.next,
      buf = this.constructor.alloc(this.len),
      pos = 0;
    while (head) {
      head.fn(head.val, buf, pos);
      pos += head.len;
      head = head.next;
    }
    return buf;
  };

  //https://github.com/protobufjs/protobuf.js/blob/2cdbba32da9951c1ff14e55e65e4a9a9f24c70fd/src/writer.js#L461
  Writer._configure = function (BufferWriter_) {
    BufferWriter = BufferWriter_;
    Writer.create = w1_create();
    BufferWriter._configure();
  };

  //https://github.com/protobufjs/protobuf.js/blob/2cdbba32da9951c1ff14e55e65e4a9a9f24c70fd/src/reader.js#L22
  function Reader(buffer) {

    this.buf = buffer;
    this.pos = 0;
    this.len = buffer.length;
  }

  //https://github.com/protobufjs/protobuf.js/blob/2cdbba32da9951c1ff14e55e65e4a9a9f24c70fd/src/reader.js#L43
  var create_array = typeof Uint8Array !== "undefined"
    ? function create_typed_array(buffer) {
      if (buffer instanceof Uint8Array || Array.isArray(buffer))
        return new Reader(buffer);
      throw Error("illegal buffer");
    }
    : function create_array(buffer) {
      if (Array.isArray(buffer))
        return new Reader(buffer);
      throw Error("illegal buffer");
    };

  //https://github.com/protobufjs/protobuf.js/blob/2cdbba32da9951c1ff14e55e65e4a9a9f24c70fd/src/reader.js#L56
  var r1_create = function r1_create() {
    return util_Buffer
      ? function create_buffer_setup(buffer) {
        return (Reader.create = function create_buffer(buffer) {
          return util_Buffer.isBuffer(buffer)
            ? new BufferReader(buffer)
            : create_array(buffer);
        })(buffer);
      }
      : create_array;
  };

  //https://github.com/protobufjs/protobuf.js/blob/2cdbba32da9951c1ff14e55e65e4a9a9f24c70fd/src/util/minimal.js#L237
  function util_merge(dst, src, ifNotSet) {
    for (var keys = Object.keys(src), i = 0; i < keys.length; ++i)
      if (dst[keys[i]] === undefined || !ifNotSet)
        dst[keys[i]] = src[keys[i]];
    return dst;
  }

  //https://github.com/protobufjs/protobuf.js/blob/2cdbba32da9951c1ff14e55e65e4a9a9f24c70fd/src/reader.js#L382
  Reader._configure = function (BufferReader_) {
    BufferReader = BufferReader_;
    Reader.create = r1_create();
    BufferReader._configure();

    var fn = "toLong";
    util_merge(Reader.prototype, {

      int64: function read_int64() {
        return readLongVarint.call(this)[fn](false);
      },

      uint64: function read_uint64() {
        return readLongVarint.call(this)[fn](true);
      },

      sint64: function read_sint64() {
        return readLongVarint.call(this).zzDecode()[fn](false);
      },

      fixed64: function read_fixed64() {
        return readFixed64.call(this)[fn](true);
      },

      sfixed64: function read_sfixed64() {
        return readFixed64.call(this)[fn](false);
      }

    });
  };
  //https://github.com/protobufjs/protobuf.js/blob/2cdbba32da9951c1ff14e55e65e4a9a9f24c70fd/src/writer_buffer.js#L16
  function BufferWriter() {
    Writer.call(this);
  }

  /*---------------------------------------------------------------------------------------------
  *  Copyright (c) Feross Aboukhadijeh, and other contributors.
  *  Licensed under the MIT License.
  *  https://github.com/feross/buffer/blob/master/LICENSE
  *--------------------------------------------------------------------------------------------*/

  //https://github.com/feross/buffer/blob/795bbb5bda1b39f1370ebd784bea6107b087e3a7/index.js#L98
  function Buffer(arg, encodingOrOffset, length) {
    if (typeof arg === 'number') {
      if (typeof encodingOrOffset === 'string') {
        throw new TypeError(
          'The "string" argument must be of type string. Received type number'
        )
      }
      return allocUnsafe(arg)
    }
    return from(arg, encodingOrOffset, length)
  }

  Object.setPrototypeOf(Buffer.prototype, Uint8Array.prototype)
  Object.setPrototypeOf(Buffer, Uint8Array)

  const K_MAX_LENGTH = 0x7fffffff

  //https://github.com/feross/buffer/blob/795bbb5bda1b39f1370ebd784bea6107b087e3a7/index.js#L322
  function checked(length) {
    if (length >= K_MAX_LENGTH) {
      throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
        'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
    }
    return length | 0
  }

  //https://github.com/feross/buffer/blob/795bbb5bda1b39f1370ebd784bea6107b087e3a7/index.js#L78
  function createBuffer(length) {
    if (length > K_MAX_LENGTH) {
      throw new RangeError('The value "' + length + '" is invalid for option "size"')
    }
    const buf = new Uint8Array(length)
    Object.setPrototypeOf(buf, Buffer.prototype)
    return buf
  }

  //https://github.com/feross/buffer/blob/795bbb5bda1b39f1370ebd784bea6107b087e3a7/index.js#L182
  function assertSize(size) {
    if (typeof size !== 'number') {
      throw new TypeError('"size" argument must be of type number')
    } else if (size < 0) {
      throw new RangeError('The value "' + size + '" is invalid for option "size"')
    }
  }

  //https://github.com/feross/buffer/blob/795bbb5bda1b39f1370ebd784bea6107b087e3a7/index.js#L214
  function allocUnsafe(size) {
    assertSize(size)
    return createBuffer(size < 0 ? 0 : checked(size) | 0)
  }

  //https://github.com/feross/buffer/blob/795bbb5bda1b39f1370ebd784bea6107b087e3a7/index.js#L222
  Buffer.allocUnsafe = function (size) {
    return allocUnsafe(size)
  }

  //https://github.com/protobufjs/protobuf.js/blob/2cdbba32da9951c1ff14e55e65e4a9a9f24c70fd/src/writer_buffer.js#L20
  BufferWriter._configure = function () {

    BufferWriter.alloc = Buffer.allocUnsafe

    BufferWriter.writeBytesBuffer = util_Buffer && util_Buffer.prototype instanceof Uint8Array && util_Buffer.prototype.set.name === "set"
      ? function writeBytesBuffer_set(val, buf, pos) {
        buf.set(val, pos);
      }
      : function writeBytesBuffer_copy(val, buf, pos) {
        if (val.copy)
          val.copy(buf, pos, 0, val.length);
        else for (var i = 0; i < val.length;)
          buf[pos++] = val[i++];
      };
  };

  //https://github.com/protobufjs/protobuf.js/blob/2cdbba32da9951c1ff14e55e65e4a9a9f24c70fd/src/reader_buffer.js#L6
  (BufferReader.prototype = Object.create(Reader.prototype)).constructor = BufferReader;

  //https://github.com/protobufjs/protobuf.js/blob/2cdbba32da9951c1ff14e55e65e4a9a9f24c70fd/src/reader_buffer.js#L17
  function BufferReader(buffer) {
    Reader.call(this, buffer);
  }

  //https://github.com/protobufjs/protobuf.js/blob/2cdbba32da9951c1ff14e55e65e4a9a9f24c70fd/src/reader_buffer.js#L27
  BufferReader._configure = function () {
    if (util_Buffer)
      BufferReader.prototype._slice = util_Buffer.prototype.slice;
  };

  //https://github.com/protobufjs/protobuf.js/blob/2cdbba32da9951c1ff14e55e65e4a9a9f24c70fd/src/util/minimal.js#L402
  util_configure = function () {
    var Buffer = util_Buffer;
    if (!Buffer) {
      util_Buffer_from = util_Buffer_allocUnsafe = null;
      return;
    }
    util_Buffer_from = Buffer.from !== Uint8Array.from && Buffer.from ||
      function Buffer_from(value, encoding) {
        return new Buffer(value, encoding);
      };
    util_Buffer_allocUnsafe = Buffer.allocUnsafe ||
      function Buffer_allocUnsafe(size) {
        return new Buffer(size);
      };
  };

  protobuf.rpc = {};
  protobuf.roots = {};
  protobuf.configure = configure;

  //https://github.com/protobufjs/protobuf.js/blob/2cdbba32da9951c1ff14e55e65e4a9a9f24c70fd/src/index-minimal.js#L29
  function configure() {
    util_configure();
    Writer._configure(BufferWriter);
    Reader._configure(BufferReader);
  }

  configure();

  var $protobuf = protobuf;
  var $protobuf__default = _interopDefaultLegacy($protobuf);

  /*---------------------------------------------------------------------------------------------
  *  Licensed under the MIT License.
  *  https://github.com/ipfs/js-ipfs-unixfs/blob/master/LICENSE
  *--------------------------------------------------------------------------------------------*/

  //https://github.com/ipfs/js-ipfs-unixfs/blob/de1a7f0afc144462b374919a44d3af4fae3a49da/packages/ipfs-unixfs/src/unixfs.js#L8
  const $root = $protobuf__default["default"].roots['ipfs-unixfs'] || ($protobuf__default["default"].roots['ipfs-unixfs'] = {});

  //https://github.com/ipfs/js-ipfs-unixfs/blob/de1a7f0afc144462b374919a44d3af4fae3a49da/packages/ipfs-unixfs/src/unixfs.js#L10
  const Data = $root.Data = (() => {
    function Data(p) {
      this.blocksizes = [];
      if (p)
        for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
          if (p[ks[i]] != null)
            this[ks[i]] = p[ks[i]];
    }
    Data.prototype.Type = 0;
    Data.prototype.filesize = 0;
    Data.prototype.hashType = 0;
    Data.prototype.fanout = 0;
    Data.prototype.mode = 0;
    Data.prototype.mtime = null;
    Data.encode = function encode(m, w) {
      if (!w) {
        w = Writer.create();
      }
      w.uint32(8).int32(m.Type);
      if (m.Data != null && Object.hasOwnProperty.call(m, 'Data')) {
        w.uint32(18).bytes(m.Data);
      }
      if (m.filesize != null && Object.hasOwnProperty.call(m, 'filesize')) {
        w.uint32(24).uint64(m.filesize); // here is the bug
      }
      if (m.blocksizes != null && m.blocksizes.length) {
        for (var i = 0; i < m.blocksizes.length; ++i)
          w.uint32(32).uint64(m.blocksizes[i]);
      }
      if (m.hashType != null && Object.hasOwnProperty.call(m, 'hashType')) {
        w.uint32(40).uint64(m.hashType);
      }
      if (m.fanout != null && Object.hasOwnProperty.call(m, 'fanout')) {
        w.uint32(48).uint64(m.fanout);
      }

      if (m.mode != null && Object.hasOwnProperty.call(m, 'mode')) {
        w.uint32(56).uint32(m.mode);
      }

      if (m.mtime != null && Object.hasOwnProperty.call(m, 'mtime')) {
        $root.UnixTime.encode(m.mtime, w.uint32(66).fork()).ldelim();
      }

      return w;
    };
    Data.decode = function decode(r, l) {
      if (!(r instanceof Reader))
        r = Reader.create(r);
      var c = l === undefined ? r.len : r.pos + l, m = new $root.Data();
      while (r.pos < c) {
        var t = r.uint32();
        switch (t >>> 3) {
          case 1:
            m.Type = r.int32();
            break;
          case 2:
            m.Data = r.bytes();
            break;
          case 3:
            m.filesize = r.uint64();
            break;
          case 4:
            if (!(m.blocksizes && m.blocksizes.length))
              m.blocksizes = [];
            if ((t & 7) === 2) {
              var c2 = r.uint32() + r.pos;
              while (r.pos < c2)
                m.blocksizes.push(r.uint64());
            } else
              m.blocksizes.push(r.uint64());
            break;
          case 5:
            m.hashType = r.uint64();
            break;
          case 6:
            m.fanout = r.uint64();
            break;
          case 7:
            m.mode = r.uint32();
            break;
          case 8:
            m.mtime = $root.UnixTime.decode(r, r.uint32());
            break;
          default:
            r.skipType(t & 7);
            break;
        }
      }
      return m;
    };
    Data.fromObject = function fromObject(d) {
      if (d instanceof $root.Data)
        return d;
      var m = new $root.Data();
      switch (d.Type) {
        case 'Raw':
        case 0:
          m.Type = 0;
          break;
        case 'Directory':
        case 1:
          m.Type = 1;
          break;
        case 'File':
        case 2:
          m.Type = 2;
          break;
        case 'Metadata':
        case 3:
          m.Type = 3;
          break;
        case 'Symlink':
        case 4:
          m.Type = 4;
          break;
        case 'HAMTShard':
        case 5:
          m.Type = 5;
          break;
      }
      return m;
    };

    Data.DataType = function () {
      const valuesById = {}, values = Object.create(valuesById);
      values[valuesById[0] = 'Raw'] = 0;
      values[valuesById[1] = 'Directory'] = 1;
      values[valuesById[2] = 'File'] = 2;
      values[valuesById[3] = 'Metadata'] = 3;
      values[valuesById[4] = 'Symlink'] = 4;
      values[valuesById[5] = 'HAMTShard'] = 5;
      return values;
    }();
    return Data;
  })();

  // Retrieve and modify from https://github.com/IndigoUnited/js-err-code/blob/8dd437663a48e833ab70223f8a58a888985d1e3a/index.js#L15
  function assign(obj, props) {
    for (const key in props) {
      Object.defineProperty(obj, key, {
        value: props[key],
        enumerable: true,
        configurable: true,
      });
    }

    return obj;
  }

  // Retrieve and modify from https://github.com/IndigoUnited/js-err-code/blob/8dd437663a48e833ab70223f8a58a888985d1e3a/index.js#L34
  function createError(err, code, props) {
    if (!err || typeof err === 'string') {
      throw new TypeError('Please pass an Error to err-code');
    }

    if (!props) {
      props = {};
    }

    if (typeof code === 'object') {
      props = code;
      code = '';
    }

    if (code) {
      props.code = code;
    }

    try {
      return assign(err, props);
    } catch (_) {
      props.message = err.message;
      props.stack = err.stack;

      const ErrClass = function () { };

      ErrClass.prototype = Object.create(Object.getPrototypeOf(err));

      // @ts-ignore
      const output = assign(new ErrClass(), props);

      return output;
    }
  }

  var errcode = createError;

  function _interopDefaultLegacy(e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }
  var errcode__default = /*#__PURE__*/_interopDefaultLegacy(errcode);

  //https://github.com/ipfs/js-ipfs-unixfs/blob/de1a7f0afc144462b374919a44d3af4fae3a49da/packages/ipfs-unixfs/src/index.js#L10
  const types = [
    'raw',
    'directory',
    'file',
    'metadata',
    'symlink',
    'hamt-sharded-directory'
  ];

  //https://github.com/ipfs/js-ipfs-unixfs/blob/de1a7f0afc144462b374919a44d3af4fae3a49da/packages/ipfs-unixfs/src/index.js#L19
  const dirTypes = [
    'directory',
    'hamt-sharded-directory'
  ];

  //https://github.com/ipfs/js-ipfs-unixfs/blob/de1a7f0afc144462b374919a44d3af4fae3a49da/packages/ipfs-unixfs/src/index.js#L30
  function parseMode(mode) {
    if (mode == null) {
      return undefined;
    }
    if (typeof mode === 'number') {
      return mode & 4095;
    }
    mode = mode.toString();
    if (mode.substring(0, 1) === '0') {
      return parseInt(mode, 8) & 4095;
    }
    return parseInt(mode, 10) & 4095;
  }

  //https://github.com/ipfs/js-ipfs-unixfs/blob/de1a7f0afc144462b374919a44d3af4fae3a49da/packages/ipfs-unixfs/src/index.js#L53
  function parseMtime(input) {
    if (input == null) {
      return undefined;
    }
    let mtime;
    if (input.secs != null) {
      mtime = {
        secs: input.secs,
        nsecs: input.nsecs
      };
    }
    if (input.Seconds != null) {
      mtime = {
        secs: input.Seconds,
        nsecs: input.FractionalNanoseconds
      };
    }
    if (Array.isArray(input)) {
      mtime = {
        secs: input[0],
        nsecs: input[1]
      };
    }
    if (input instanceof Date) {
      const ms = input.getTime();
      const secs = Math.floor(ms / 1000);
      mtime = {
        secs: secs,
        nsecs: (ms - secs * 1000) * 1000
      };
    }
    if (!Object.prototype.hasOwnProperty.call(mtime, 'secs')) {
      return undefined;
    }
    if (mtime != null && mtime.nsecs != null && (mtime.nsecs < 0 || mtime.nsecs > 999999999)) {
      throw errcode__default["default"](new Error('mtime-nsecs must be within the range [0,999999999]'), 'ERR_INVALID_MTIME_NSECS');
    }
    return mtime;
  }

  const PBData = Data;

  //https://github.com/ipfs/js-ipfs-unixfs/blob/de1a7f0afc144462b374919a44d3af4fae3a49da/packages/ipfs-unixfs/src/index.js#L24
  const DEFAULT_FILE_MODE = parseInt('0644', 8);
  const DEFAULT_DIRECTORY_MODE = parseInt('0755', 8);

  //https://github.com/ipfs/js-ipfs-unixfs/blob/de1a7f0afc144462b374919a44d3af4fae3a49da/packages/ipfs-unixfs/src/index.js#L122
  class UnixFS {
    constructor(options = { type: 'file' }) {
      const { type, data, blockSizes, hashType, fanout, mtime, mode } = options;
      if (type && !types.includes(type)) {
        throw errcode__default["default"](new Error('Type: ' + type + ' is not valid'), 'ERR_INVALID_TYPE');
      }
      this.type = type || 'file';
      this.data = data;
      this.hashType = hashType;
      this.fanout = fanout;
      this.blockSizes = blockSizes || [];
      this._originalMode = 0;
      this.mode = parseMode(mode);
      if (mtime) {
        this.mtime = parseMtime(mtime);
        if (this.mtime && !this.mtime.nsecs) {
          this.mtime.nsecs = 0;
        }
      }
    }
    set mode(mode) {
      this._mode = this.isDirectory() ? DEFAULT_DIRECTORY_MODE : DEFAULT_FILE_MODE;
      const parsedMode = parseMode(mode);
      if (parsedMode !== undefined) {
        this._mode = parsedMode;
      }
    }
    get mode() {
      return this._mode;
    }
    isDirectory() {
      return Boolean(this.type && dirTypes.includes(this.type));
    }
    fileSize() {
      if (this.isDirectory()) {
        return 0;
      }
      let sum = 0;
      this.blockSizes.forEach(size => {
        sum += size;
      });
      if (this.data) {
        sum += this.data.length;
      }
      return sum;
    }
    marshal() {
      let type;
      switch (this.type) {
        case 'raw':
          type = PBData.DataType.Raw;
          break;
        case 'directory':
          type = PBData.DataType.Directory;
          break;
        case 'file':
          type = PBData.DataType.File;
          break;
        case 'metadata':
          type = PBData.DataType.Metadata;
          break;
        case 'symlink':
          type = PBData.DataType.Symlink;
          break;
        case 'hamt-sharded-directory':
          type = PBData.DataType.HAMTShard;
          break;
        default:
          throw errcode__default["default"](new Error('Type: ' + type + ' is not valid'), 'ERR_INVALID_TYPE');
      }
      let data = this.data;
      if (!this.data || !this.data.length) {
        data = undefined;
      }
      let mode;
      if (this.mode != null) {
        mode = this._originalMode & 4294963200 | (parseMode(this.mode) || 0);
        if (mode === DEFAULT_FILE_MODE && !this.isDirectory()) {
          mode = undefined;
        }
        if (mode === DEFAULT_DIRECTORY_MODE && this.isDirectory()) {
          mode = undefined;
        }
      }
      let mtime;
      if (this.mtime != null) {
        const parsed = parseMtime(this.mtime);
        if (parsed) {
          mtime = {
            Seconds: parsed.secs,
            FractionalNanoseconds: parsed.nsecs
          };
          if (mtime.FractionalNanoseconds === 0) {
            delete mtime.FractionalNanoseconds;
          }
        }
      }
      const pbData = {
        Type: type,
        Data: data,
        filesize: this.isDirectory() ? undefined : this.fileSize(),
        blocksizes: this.blockSizes,
        hashType: this.hashType,
        fanout: this.fanout,
        mode,
        mtime
      };
      return PBData.encode(pbData).finish();
    }
  }

  /*---------------------------------------------------------------------------------------------
  *  Copyright (c) 2020-2021 Yusuke Kawasaki
  *  Licensed under the MIT License.
  *  https://github.com/kawanet/sha256-uint8array/blob/main/LICENSE
  *--------------------------------------------------------------------------------------------*/
  //https://github.com/kawanet/sha256-uint8array/blob/52e8f1b891c84fcb436f0f2e1103527d3a6465ea/lib/sha256-uint8array.ts#L36
  const algorithms = {
    sha256: 1,
  };

  //https://github.com/kawanet/sha256-uint8array/blob/52e8f1b891c84fcb436f0f2e1103527d3a6465ea/lib/sha256-uint8array.ts#L40
  function createHash(algorithm) {
    if (algorithm && !algorithms[algorithm] && !algorithms[algorithm.toLowerCase()]) {
      throw new Error("Digest method not supported");
    }
    return new Hash();
  }

  //https://github.com/kawanet/sha256-uint8array/blob/52e8f1b891c84fcb436f0f2e1103527d3a6465ea/lib/sha256-uint8array.ts#L6
  const K = [
    0x428a2f98 | 0, 0x71374491 | 0, 0xb5c0fbcf | 0, 0xe9b5dba5 | 0,
    0x3956c25b | 0, 0x59f111f1 | 0, 0x923f82a4 | 0, 0xab1c5ed5 | 0,
    0xd807aa98 | 0, 0x12835b01 | 0, 0x243185be | 0, 0x550c7dc3 | 0,
    0x72be5d74 | 0, 0x80deb1fe | 0, 0x9bdc06a7 | 0, 0xc19bf174 | 0,
    0xe49b69c1 | 0, 0xefbe4786 | 0, 0x0fc19dc6 | 0, 0x240ca1cc | 0,
    0x2de92c6f | 0, 0x4a7484aa | 0, 0x5cb0a9dc | 0, 0x76f988da | 0,
    0x983e5152 | 0, 0xa831c66d | 0, 0xb00327c8 | 0, 0xbf597fc7 | 0,
    0xc6e00bf3 | 0, 0xd5a79147 | 0, 0x06ca6351 | 0, 0x14292967 | 0,
    0x27b70a85 | 0, 0x2e1b2138 | 0, 0x4d2c6dfc | 0, 0x53380d13 | 0,
    0x650a7354 | 0, 0x766a0abb | 0, 0x81c2c92e | 0, 0x92722c85 | 0,
    0xa2bfe8a1 | 0, 0xa81a664b | 0, 0xc24b8b70 | 0, 0xc76c51a3 | 0,
    0xd192e819 | 0, 0xd6990624 | 0, 0xf40e3585 | 0, 0x106aa070 | 0,
    0x19a4c116 | 0, 0x1e376c08 | 0, 0x2748774c | 0, 0x34b0bcb5 | 0,
    0x391c0cb3 | 0, 0x4ed8aa4a | 0, 0x5b9cca4f | 0, 0x682e6ff3 | 0,
    0x748f82ee | 0, 0x78a5636f | 0, 0x84c87814 | 0, 0x8cc70208 | 0,
    0x90befffa | 0, 0xa4506ceb | 0, 0xbef9a3f7 | 0, 0xc67178f2 | 0,
  ];

  //https://github.com/kawanet/sha256-uint8array/blob/52e8f1b891c84fcb436f0f2e1103527d3a6465ea/lib/sha256-uint8array.ts#L48
  class Hash {
    constructor() {
      // first 32 bits of the fractional parts of the square roots of the first 8 primes 2..19
      this.A = 0x6a09e667 | 0;
      this.B = 0xbb67ae85 | 0;
      this.C = 0x3c6ef372 | 0;
      this.D = 0xa54ff53a | 0;
      this.E = 0x510e527f | 0;
      this.F = 0x9b05688c | 0;
      this.G = 0x1f83d9ab | 0;
      this.H = 0x5be0cd19 | 0;
      this._size = 0;
      this._sp = 0; // surrogate pair
      if (!sharedBuffer || sharedOffset >= 8000 /* allocTotal */) {
        sharedBuffer = new ArrayBuffer(8000 /* allocTotal */);
        sharedOffset = 0;
      }
      this._byte = new Uint8Array(sharedBuffer, sharedOffset, 80 /* allocBytes */);
      this._word = new Int32Array(sharedBuffer, sharedOffset, 20 /* allocWords */);
      sharedOffset += 80 /* allocBytes */;
    }
    update(data) {
      // data: string
      if ("string" === typeof data) {
        return this._utf8(data);
      }
      // data: undefined
      if (data == null) {
        throw new TypeError("Invalid type: " + typeof data);
      }
      const byteOffset = data.byteOffset;
      const length = data.byteLength;
      let blocks = (length / 64 /* inputBytes */) | 0;
      let offset = 0;
      // longer than 1 block
      if (blocks && !(byteOffset & 3) && !(this._size % 64 /* inputBytes */)) {
        const block = new Int32Array(data.buffer, byteOffset, blocks * 16 /* inputWords */);
        while (blocks--) {
          this._int32(block, offset >> 2);
          offset += 64 /* inputBytes */;
        }
        this._size += offset;
      }
      // data: TypedArray | DataView
      const BYTES_PER_ELEMENT = data.BYTES_PER_ELEMENT;
      if (BYTES_PER_ELEMENT !== 1 && data.buffer) {
        const rest = new Uint8Array(data.buffer, byteOffset + offset, length - offset);
        return this._uint8(rest);
      }
      // no more bytes
      if (offset === length)
        return this;
      // data: Uint8Array | Int8Array
      return this._uint8(data, offset);
    }
    _uint8(data, offset) {
      const { _byte, _word } = this;
      const length = data.length;
      offset = offset | 0;
      while (offset < length) {
        const start = this._size % 64 /* inputBytes */;
        let index = start;
        while (offset < length && index < 64 /* inputBytes */) {
          _byte[index++] = data[offset++];
        }
        if (index >= 64 /* inputBytes */) {
          this._int32(_word);
        }
        this._size += index - start;
      }
      return this;
    }
    _utf8(text) {
      const { _byte, _word } = this;
      const length = text.length;
      let surrogate = this._sp;
      for (let offset = 0; offset < length;) {
        const start = this._size % 64 /* inputBytes */;
        let index = start;
        while (offset < length && index < 64 /* inputBytes */) {
          let code = text.charCodeAt(offset++) | 0;
          if (code < 0x80) {
            // ASCII characters
            _byte[index++] = code;
          }
          else if (code < 0x800) {
            // 2 bytes
            _byte[index++] = 0xC0 | (code >>> 6);
            _byte[index++] = 0x80 | (code & 0x3F);
          }
          else if (code < 0xD800 || code > 0xDFFF) {
            // 3 bytes
            _byte[index++] = 0xE0 | (code >>> 12);
            _byte[index++] = 0x80 | ((code >>> 6) & 0x3F);
            _byte[index++] = 0x80 | (code & 0x3F);
          }
          else if (surrogate) {
            // 4 bytes - surrogate pair
            code = ((surrogate & 0x3FF) << 10) + (code & 0x3FF) + 0x10000;
            _byte[index++] = 0xF0 | (code >>> 18);
            _byte[index++] = 0x80 | ((code >>> 12) & 0x3F);
            _byte[index++] = 0x80 | ((code >>> 6) & 0x3F);
            _byte[index++] = 0x80 | (code & 0x3F);
            surrogate = 0;
          }
          else {
            surrogate = code;
          }
        }
        if (index >= 64 /* inputBytes */) {
          this._int32(_word);
          _word[0] = _word[16 /* inputWords */];
        }
        this._size += index - start;
      }
      this._sp = surrogate;
      return this;
    }
    _int32(data, offset) {
      let { A, B, C, D, E, F, G, H } = this;
      let i = 0;
      offset = offset | 0;
      while (i < 16 /* inputWords */) {
        W[i++] = swap32(data[offset++]);
      }
      for (i = 16 /* inputWords */; i < 64 /* workWords */; i++) {
        W[i] = (gamma1(W[i - 2]) + W[i - 7] + gamma0(W[i - 15]) + W[i - 16]) | 0;
      }
      for (i = 0; i < 64 /* workWords */; i++) {
        const T1 = (H + sigma1(E) + ch(E, F, G) + K[i] + W[i]) | 0;
        const T2 = (sigma0(A) + maj(A, B, C)) | 0;
        H = G;
        G = F;
        F = E;
        E = (D + T1) | 0;
        D = C;
        C = B;
        B = A;
        A = (T1 + T2) | 0;
      }
      this.A = (A + this.A) | 0;
      this.B = (B + this.B) | 0;
      this.C = (C + this.C) | 0;
      this.D = (D + this.D) | 0;
      this.E = (E + this.E) | 0;
      this.F = (F + this.F) | 0;
      this.G = (G + this.G) | 0;
      this.H = (H + this.H) | 0;
    }
    digest(encoding) {
      const { _byte, _word } = this;
      let i = (this._size % 64 /* inputBytes */) | 0;
      _byte[i++] = 0x80;
      // pad 0 for current word
      while (i & 3) {
        _byte[i++] = 0;
      }
      i >>= 2;
      if (i > 14 /* highIndex */) {
        while (i < 16 /* inputWords */) {
          _word[i++] = 0;
        }
        i = 0;
        this._int32(_word);
      }
      // pad 0 for rest words
      while (i < 16 /* inputWords */) {
        _word[i++] = 0;
      }
      // input size
      const bits64 = this._size * 8;
      const low32 = (bits64 & 0xffffffff) >>> 0;
      const high32 = (bits64 - low32) / 0x100000000;
      if (high32)
        _word[14 /* highIndex */] = swap32(high32);
      if (low32)
        _word[15 /* lowIndex */] = swap32(low32);
      this._int32(_word);
      return (encoding === "hex") ? this._hex() : this._bin();
    }
    _hex() {
      const { A, B, C, D, E, F, G, H } = this;
      return hex32(A) + hex32(B) + hex32(C) + hex32(D) + hex32(E) + hex32(F) + hex32(G) + hex32(H);
    }
    _bin() {
      const { A, B, C, D, E, F, G, H, _byte, _word } = this;
      _word[0] = swap32(A);
      _word[1] = swap32(B);
      _word[2] = swap32(C);
      _word[3] = swap32(D);
      _word[4] = swap32(E);
      _word[5] = swap32(F);
      _word[6] = swap32(G);
      _word[7] = swap32(H);
      return _byte.slice(0, 32);
    }
  }

  //https://github.com/kawanet/sha256-uint8array/blob/52e8f1b891c84fcb436f0f2e1103527d3a6465ea/lib/sha256-uint8array.ts#L290
  const W = new Int32Array(64 /* workWords */);
  let sharedBuffer;
  let sharedOffset = 0;
  const hex32 = num => (num + 0x100000000).toString(16).substr(-8);
  const swapLE = (c => (((c << 24) & 0xff000000) | ((c << 8) & 0xff0000) | ((c >> 8) & 0xff00) | ((c >> 24) & 0xff)));
  const swapBE = (c => c);
  const swap32 = isBE() ? swapBE : swapLE;
  const ch = (x, y, z) => (z ^ (x & (y ^ z)));
  const maj = (x, y, z) => ((x & y) | (z & (x | y)));
  const sigma0 = x => ((x >>> 2 | x << 30) ^ (x >>> 13 | x << 19) ^ (x >>> 22 | x << 10));
  const sigma1 = x => ((x >>> 6 | x << 26) ^ (x >>> 11 | x << 21) ^ (x >>> 25 | x << 7));
  const gamma0 = x => ((x >>> 7 | x << 25) ^ (x >>> 18 | x << 14) ^ (x >>> 3));
  const gamma1 = x => ((x >>> 17 | x << 15) ^ (x >>> 19 | x << 13) ^ (x >>> 10));

  //https://github.com/kawanet/sha256-uint8array/blob/52e8f1b891c84fcb436f0f2e1103527d3a6465ea/lib/sha256-uint8array.ts#L308
  function isBE() {
    const buf = new Uint8Array(new Uint16Array([0xFEFF]).buffer); // BOM
    return (buf[0] === 0xFE);
  }

  var MSB = 0x80
    , REST = 0x7F
    , MSBALL = ~REST
    , INT = Math.pow(2, 31);

  //https://github.com/multiformats/js-multiformats/blob/bb14a29dd823a517ef0c6c741d265e022591d831/src/hashes/digest.js#L10
  const create = (code, digest) => {
    const size = digest.byteLength
    const sizeOffset = encodingLength_1(code)
    const digestOffset = sizeOffset + encodingLength_1(size)

    const bytes = new Uint8Array(digestOffset + size)
    encodeTo_1(code, bytes, 0)
    encodeTo_1(size, bytes, sizeOffset)
    bytes.set(digest, digestOffset)

    return new Digest(code, size, digest, bytes)
  }

  //https://github.com/multiformats/js-multiformats/blob/bb14a29dd823a517ef0c6c741d265e022591d831/src/hashes/hasher.js#L22
  class Hasher {

    constructor(name, code, encode) {
      this.name = name
      this.code = code
      this.encode = encode
    }

    digest(input) {
      if (input instanceof Uint8Array) {
        const result = this.encode(input)
        return result instanceof Uint8Array
          ? create(this.code, result)
          : result.then((digest) => create(this.code, digest))
      } else {
        throw Error('Unknown type, must be binary type')
      }
    }
  }

  const from = ({ name, code, encode }) => new Hasher(name, code, encode)

  //https://github.com/multiformats/js-multiformats/blob/bb14a29dd823a517ef0c6c741d265e022591d831/src/hashes/sha2.js#L7
  s_sha256 = from({
    name: 'sha2-256',
    code: 18,
    //encode: (input) => coerce(crypto__default["default"].createHash('sha256').update(input).digest())
    encode: (input) => {
      return coerce(createHash('sha256').update(input).digest());
    }
  });
  /*---------------------------------------------------------------------------------------------
  *  Copyright 2016-2020 Protocol Labs
  *  Licensed under the MIT License.
  *  https://github.com/ipld/js-dag-pb/blob/master/LICENSE-MIT
  *--------------------------------------------------------------------------------------------*/
  //https://github.com/ipld/js-dag-pb/blob/422f91ea722efdd119b25a8c41087ef9a61f2252/src/util.js#L8
  const pbNodeProperties = ['Data', 'Links']
  const pbLinkProperties = ['Hash', 'Name', 'Tsize']

  //https://github.com/ipld/js-dag-pb/blob/422f91ea722efdd119b25a8c41087ef9a61f2252/src/pb-encode.js#L1
  const textEncoder = new TextEncoder()
  const maxInt32 = 2 ** 32
  const maxUInt32 = 2 ** 31

  //https://github.com/ipld/js-dag-pb/blob/422f91ea722efdd119b25a8c41087ef9a61f2252/src/pb-encode.js#L197
  const len8tab = [
    0, 1, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4,
    5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
    6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6,
    6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6,
    7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
    7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
    7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
    7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
    8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8,
    8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8,
    8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8,
    8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8,
    8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8,
    8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8,
    8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8,
    8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8
  ]

  //https://github.com/ipld/js-dag-pb/blob/422f91ea722efdd119b25a8c41087ef9a61f2252/src/pb-encode.js#L23
  function encodeLink(link, bytes) {
    let i = bytes.length

    if (typeof link.Tsize === 'number') {
      if (link.Tsize < 0) {
        throw new Error('Tsize cannot be negative')
      }
      if (!Number.isSafeInteger(link.Tsize)) {
        throw new Error('Tsize too large for encoding')
      }
      i = encodeVarint(bytes, i, link.Tsize) - 1
      bytes[i] = 0x18
    }

    if (typeof link.Name === 'string') {
      const nameBytes = textEncoder.encode(link.Name)
      i -= nameBytes.length
      bytes.set(nameBytes, i)
      i = encodeVarint(bytes, i, nameBytes.length) - 1
      bytes[i] = 0x12
    }

    if (link.Hash) {
      i -= link.Hash.length
      bytes.set(link.Hash, i)
      i = encodeVarint(bytes, i, link.Hash.length) - 1
      bytes[i] = 0xa
    }

    return bytes.length - i
  }

  //https://github.com/ipld/js-dag-pb/blob/422f91ea722efdd119b25a8c41087ef9a61f2252/src/pb-encode.js#L91
  function sizeLink(link) {
    let n = 0

    if (link.Hash) {
      const l = link.Hash.length
      n += 1 + l + sov(l)
    }

    if (typeof link.Name === 'string') {
      const l = textEncoder.encode(link.Name).length
      n += 1 + l + sov(l)
    }

    if (typeof link.Tsize === 'number') {
      n += 1 + sov(link.Tsize)
    }

    return n
  }

  //https://github.com/ipld/js-dag-pb/blob/422f91ea722efdd119b25a8c41087ef9a61f2252/src/pb-encode.js#L179
  function len64(x) {
    let n = 0
    if (x >= maxInt32) {
      x = Math.floor(x / maxInt32)
      n = 32
    }
    if (x >= (1 << 16)) {
      x >>>= 16
      n += 16
    }
    if (x >= (1 << 8)) {
      x >>>= 8
      n += 8
    }
    return n + len8tab[x]
  }

  //https://github.com/ipld/js-dag-pb/blob/422f91ea722efdd119b25a8c41087ef9a61f2252/src/pb-encode.js#L166
  function sov(x) {
    if (x % 2 === 0) {
      x++
    }
    return Math.floor((len64(x) + 6) / 7)
  }

  //https://github.com/ipld/js-dag-pb/blob/422f91ea722efdd119b25a8c41087ef9a61f2252/src/pb-encode.js#L141
  function encodeVarint(bytes, offset, v) {
    offset -= sov(v)
    const base = offset

    while (v >= maxUInt32) {
      bytes[offset++] = (v & 0x7f) | 0x80
      v /= 128
    }

    while (v >= 128) {
      bytes[offset++] = (v & 0x7f) | 0x80
      v >>>= 7
    }

    bytes[offset] = v

    return base
  }

  //https://github.com/ipld/js-dag-pb/blob/422f91ea722efdd119b25a8c41087ef9a61f2252/src/pb-encode.js#L141
  function sizeNode(node) {
    let n = 0

    if (node.Data) {
      const l = node.Data.length
      n += 1 + l + sov(l)
    }

    if (node.Links) {
      for (const link of node.Links) {
        const l = sizeLink(link)
        n += 1 + l + sov(l)
      }
    }

    return n
  }

  //https://github.com/ipld/js-dag-pb/blob/422f91ea722efdd119b25a8c41087ef9a61f2252/src/pb-encode.js#L61
  function encodeNode(node) {
    const size = sizeNode(node)
    const bytes = new Uint8Array(size)
    let i = size

    if (node.Data) {
      i -= node.Data.length
      bytes.set(node.Data, i)
      i = encodeVarint(bytes, i, node.Data.length) - 1
      bytes[i] = 0xa
    }

    if (node.Links) {
      for (let index = node.Links.length - 1; index >= 0; index--) {
        const size = encodeLink(node.Links[index], bytes.subarray(0, i))
        i -= size
        i = encodeVarint(bytes, i, size) - 1
        bytes[i] = 0x12
      }
    }

    return bytes
  }

  //https://github.com/ipld/js-dag-pb/blob/422f91ea722efdd119b25a8c41087ef9a61f2252/src/util.js#L18
  function linkComparator(a, b) {
    if (a === b) {
      return 0
    }

    const abuf = a.Name ? textEncoder.encode(a.Name) : []
    const bbuf = b.Name ? textEncoder.encode(b.Name) : []

    let x = abuf.length
    let y = bbuf.length

    for (let i = 0, len = Math.min(x, y); i < len; ++i) {
      if (abuf[i] !== bbuf[i]) {
        x = abuf[i]
        y = bbuf[i]
        break
      }
    }

    return x < y ? -1 : y < x ? 1 : 0
  }

  //https://github.com/ipld/js-dag-pb/blob/422f91ea722efdd119b25a8c41087ef9a61f2252/src/util.js#L45
  function hasOnlyProperties(node, properties) {
    return !Object.keys(node).some((p) => !properties.includes(p))
  }

  //https://github.com/ipld/js-dag-pb/blob/422f91ea722efdd119b25a8c41087ef9a61f2252/src/util.js#L147
  function validate(node) {

    if (!node || typeof node !== 'object' || Array.isArray(node)) {
      throw new TypeError('Invalid DAG-PB form')
    }

    if (!hasOnlyProperties(node, pbNodeProperties)) {
      throw new TypeError('Invalid DAG-PB form (extraneous properties)')
    }

    if (node.Data !== undefined && !(node.Data instanceof Uint8Array)) {
      throw new TypeError('Invalid DAG-PB form (Data must be a Uint8Array)')
    }

    if (!Array.isArray(node.Links)) {
      throw new TypeError('Invalid DAG-PB form (Links must be an array)')
    }

    for (let i = 0; i < node.Links.length; i++) {
      const link = node.Links[i]
      if (!link || typeof link !== 'object' || Array.isArray(link)) {
        throw new TypeError('Invalid DAG-PB form (bad link object)')
      }

      if (!hasOnlyProperties(link, pbLinkProperties)) {
        throw new TypeError('Invalid DAG-PB form (extraneous properties on link object)')
      }

      if (!link.Hash) {
        throw new TypeError('Invalid DAG-PB form (link must have a Hash)')
      }

      if (link.Hash.asCID !== link.Hash) {
        throw new TypeError('Invalid DAG-PB form (link Hash must be a CID)')
      }

      if (link.Name !== undefined && typeof link.Name !== 'string') {
        throw new TypeError('Invalid DAG-PB form (link Name must be a string)')
      }

      if (link.Tsize !== undefined && (typeof link.Tsize !== 'number' || link.Tsize % 1 !== 0)) {
        throw new TypeError('Invalid DAG-PB form (link Tsize must be an integer)')
      }

      if (i > 0 && linkComparator(link, node.Links[i - 1]) === -1) {
        throw new TypeError('Invalid DAG-PB form (links must be sorted by Name bytes)')
      }
    }
  }

  //https://github.com/ipld/js-dag-pb/blob/422f91ea722efdd119b25a8c41087ef9a61f2252/src/index.js#L23
  var d_encode = (node) => {
    validate(node)
    const pbn = {}
    if (node.Links) {
      pbn.Links = node.Links.map((l) => {
        const link = {}
        if (l.Hash) {
          link.Hash = l.Hash.bytes // cid -> bytes
        }
        if (l.Name !== undefined) {
          link.Name = l.Name
        }
        if (l.Tsize !== undefined) {
          link.Tsize = l.Tsize
        }
        return link
      })
    }
    if (node.Data) {
      pbn.Data = node.Data
    }

    return encodeNode(pbn)
  }

  const hashItems = async (items, version) => {
    if (version == undefined)
        version = 1;
    let Links = [];
    for (let i = 0; i < items.length; i ++){
        let item = items[i];
        Links.push({
            Name: item.name,
            Hash: parse(item.cid),
            Tsize: item.size
        })
    }; 

    try {
      const dirUnixFS = new UnixFS({
        type: 'directory',
      });
      const bytes = d_encode({
        Data: dirUnixFS.marshal(),
        Links
      });
      const hash = await s_sha256.digest(bytes);
      const dagPB_code = 0x70;
      const cid = CID.create(version, dagPB_code, hash);
      return {
        size: bytes.length + Links.reduce((acc, curr) => acc + (curr.Tsize == null ? 0 : curr.Tsize), 0),
        cid: cid.toString()
      }
    } catch (e) {
      throw e;
    }
  };
  const hashContent = async (value, version) => {
    try {
      if (version == undefined)
        version = 1;
      if (typeof(value) == 'string')
        value = new TextEncoder("utf-8").encode(value);       
      
      var cid;
      if (version == 0){
        const unixFS = new UnixFS({
          type: 'file',
          data: value
        })
        const bytes = d_encode({
          Data: unixFS.marshal(),
          Links: []
        })
        const hash = await s_sha256.digest(bytes);
        cid = CID.create(version, DAG_PB_CODE, hash);
      }
      else{
        const hash = await s_sha256.digest(value);
        if (value.length <= 1048576) //1 MB
          cid = CID.create(version, RAW_CODE, hash)
        else
          cid = CID.create(version, DAG_PB_CODE, hash)
      }
      return cid.toString();
    }
    catch (e) {
      throw e;
    }
  };
  const parse = function(cid){
    return CID.parse(cid)
  };
  // AMD
  if (typeof define == 'function' && define.amd) 
    define('@ijstech/ipfs-utils', function () { return {parse,hashItems,hashContent};})
  // Node.js
  else if (typeof module != 'undefined' && module.exports)
    module.exports = {parse,hashItems,hashContent}
  // Browser
  else {
    if (!globalObject) 
      globalObject = typeof self != 'undefined' && self ? self : window;
    globalObject.IPFSUtils = {parse,hashItems,hashContent};
  };
})(this);