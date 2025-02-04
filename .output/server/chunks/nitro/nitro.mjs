import process from 'node:process';globalThis._importMeta_=globalThis._importMeta_||{url:"file:///_entry.js",env:process.env};import http, { Server as Server$1 } from 'node:http';
import https, { Server } from 'node:https';
import { promises, existsSync } from 'node:fs';
import { dirname as dirname$1, resolve as resolve$1, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const suspectProtoRx = /"(?:_|\\u0{2}5[Ff]){2}(?:p|\\u0{2}70)(?:r|\\u0{2}72)(?:o|\\u0{2}6[Ff])(?:t|\\u0{2}74)(?:o|\\u0{2}6[Ff])(?:_|\\u0{2}5[Ff]){2}"\s*:/;
const suspectConstructorRx = /"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/;
const JsonSigRx = /^\s*["[{]|^\s*-?\d{1,16}(\.\d{1,17})?([Ee][+-]?\d+)?\s*$/;
function jsonParseTransform(key, value) {
  if (key === "__proto__" || key === "constructor" && value && typeof value === "object" && "prototype" in value) {
    warnKeyDropped(key);
    return;
  }
  return value;
}
function warnKeyDropped(key) {
  console.warn(`[destr] Dropping "${key}" key to prevent prototype pollution.`);
}
function destr(value, options = {}) {
  if (typeof value !== "string") {
    return value;
  }
  const _value = value.trim();
  if (
    // eslint-disable-next-line unicorn/prefer-at
    value[0] === '"' && value.endsWith('"') && !value.includes("\\")
  ) {
    return _value.slice(1, -1);
  }
  if (_value.length <= 9) {
    const _lval = _value.toLowerCase();
    if (_lval === "true") {
      return true;
    }
    if (_lval === "false") {
      return false;
    }
    if (_lval === "undefined") {
      return void 0;
    }
    if (_lval === "null") {
      return null;
    }
    if (_lval === "nan") {
      return Number.NaN;
    }
    if (_lval === "infinity") {
      return Number.POSITIVE_INFINITY;
    }
    if (_lval === "-infinity") {
      return Number.NEGATIVE_INFINITY;
    }
  }
  if (!JsonSigRx.test(value)) {
    if (options.strict) {
      throw new SyntaxError("[destr] Invalid JSON");
    }
    return value;
  }
  try {
    if (suspectProtoRx.test(value) || suspectConstructorRx.test(value)) {
      if (options.strict) {
        throw new Error("[destr] Possible prototype pollution");
      }
      return JSON.parse(value, jsonParseTransform);
    }
    return JSON.parse(value);
  } catch (error) {
    if (options.strict) {
      throw error;
    }
    return value;
  }
}

const HASH_RE = /#/g;
const AMPERSAND_RE = /&/g;
const SLASH_RE = /\//g;
const EQUAL_RE = /=/g;
const PLUS_RE = /\+/g;
const ENC_CARET_RE = /%5e/gi;
const ENC_BACKTICK_RE = /%60/gi;
const ENC_PIPE_RE = /%7c/gi;
const ENC_SPACE_RE = /%20/gi;
const ENC_SLASH_RE = /%2f/gi;
function encode(text) {
  return encodeURI("" + text).replace(ENC_PIPE_RE, "|");
}
function encodeQueryValue(input) {
  return encode(typeof input === "string" ? input : JSON.stringify(input)).replace(PLUS_RE, "%2B").replace(ENC_SPACE_RE, "+").replace(HASH_RE, "%23").replace(AMPERSAND_RE, "%26").replace(ENC_BACKTICK_RE, "`").replace(ENC_CARET_RE, "^").replace(SLASH_RE, "%2F");
}
function encodeQueryKey(text) {
  return encodeQueryValue(text).replace(EQUAL_RE, "%3D");
}
function decode$1(text = "") {
  try {
    return decodeURIComponent("" + text);
  } catch {
    return "" + text;
  }
}
function decodePath(text) {
  return decode$1(text.replace(ENC_SLASH_RE, "%252F"));
}
function decodeQueryKey(text) {
  return decode$1(text.replace(PLUS_RE, " "));
}
function decodeQueryValue(text) {
  return decode$1(text.replace(PLUS_RE, " "));
}

function parseQuery(parametersString = "") {
  const object = {};
  if (parametersString[0] === "?") {
    parametersString = parametersString.slice(1);
  }
  for (const parameter of parametersString.split("&")) {
    const s = parameter.match(/([^=]+)=?(.*)/) || [];
    if (s.length < 2) {
      continue;
    }
    const key = decodeQueryKey(s[1]);
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = decodeQueryValue(s[2] || "");
    if (object[key] === void 0) {
      object[key] = value;
    } else if (Array.isArray(object[key])) {
      object[key].push(value);
    } else {
      object[key] = [object[key], value];
    }
  }
  return object;
}
function encodeQueryItem(key, value) {
  if (typeof value === "number" || typeof value === "boolean") {
    value = String(value);
  }
  if (!value) {
    return encodeQueryKey(key);
  }
  if (Array.isArray(value)) {
    return value.map((_value) => `${encodeQueryKey(key)}=${encodeQueryValue(_value)}`).join("&");
  }
  return `${encodeQueryKey(key)}=${encodeQueryValue(value)}`;
}
function stringifyQuery(query) {
  return Object.keys(query).filter((k) => query[k] !== void 0).map((k) => encodeQueryItem(k, query[k])).filter(Boolean).join("&");
}

const PROTOCOL_STRICT_REGEX = /^[\s\w\0+.-]{2,}:([/\\]{1,2})/;
const PROTOCOL_REGEX = /^[\s\w\0+.-]{2,}:([/\\]{2})?/;
const PROTOCOL_RELATIVE_REGEX = /^([/\\]\s*){2,}[^/\\]/;
const PROTOCOL_SCRIPT_RE = /^[\s\0]*(blob|data|javascript|vbscript):$/i;
const TRAILING_SLASH_RE = /\/$|\/\?|\/#/;
const JOIN_LEADING_SLASH_RE = /^\.?\//;
function hasProtocol(inputString, opts = {}) {
  if (typeof opts === "boolean") {
    opts = { acceptRelative: opts };
  }
  if (opts.strict) {
    return PROTOCOL_STRICT_REGEX.test(inputString);
  }
  return PROTOCOL_REGEX.test(inputString) || (opts.acceptRelative ? PROTOCOL_RELATIVE_REGEX.test(inputString) : false);
}
function isScriptProtocol(protocol) {
  return !!protocol && PROTOCOL_SCRIPT_RE.test(protocol);
}
function hasTrailingSlash(input = "", respectQueryAndFragment) {
  if (!respectQueryAndFragment) {
    return input.endsWith("/");
  }
  return TRAILING_SLASH_RE.test(input);
}
function withoutTrailingSlash(input = "", respectQueryAndFragment) {
  if (!respectQueryAndFragment) {
    return (hasTrailingSlash(input) ? input.slice(0, -1) : input) || "/";
  }
  if (!hasTrailingSlash(input, true)) {
    return input || "/";
  }
  let path = input;
  let fragment = "";
  const fragmentIndex = input.indexOf("#");
  if (fragmentIndex >= 0) {
    path = input.slice(0, fragmentIndex);
    fragment = input.slice(fragmentIndex);
  }
  const [s0, ...s] = path.split("?");
  const cleanPath = s0.endsWith("/") ? s0.slice(0, -1) : s0;
  return (cleanPath || "/") + (s.length > 0 ? `?${s.join("?")}` : "") + fragment;
}
function withTrailingSlash(input = "", respectQueryAndFragment) {
  if (!respectQueryAndFragment) {
    return input.endsWith("/") ? input : input + "/";
  }
  if (hasTrailingSlash(input, true)) {
    return input || "/";
  }
  let path = input;
  let fragment = "";
  const fragmentIndex = input.indexOf("#");
  if (fragmentIndex >= 0) {
    path = input.slice(0, fragmentIndex);
    fragment = input.slice(fragmentIndex);
    if (!path) {
      return fragment;
    }
  }
  const [s0, ...s] = path.split("?");
  return s0 + "/" + (s.length > 0 ? `?${s.join("?")}` : "") + fragment;
}
function hasLeadingSlash(input = "") {
  return input.startsWith("/");
}
function withLeadingSlash(input = "") {
  return hasLeadingSlash(input) ? input : "/" + input;
}
function withBase(input, base) {
  if (isEmptyURL(base) || hasProtocol(input)) {
    return input;
  }
  const _base = withoutTrailingSlash(base);
  if (input.startsWith(_base)) {
    return input;
  }
  return joinURL(_base, input);
}
function withoutBase(input, base) {
  if (isEmptyURL(base)) {
    return input;
  }
  const _base = withoutTrailingSlash(base);
  if (!input.startsWith(_base)) {
    return input;
  }
  const trimmed = input.slice(_base.length);
  return trimmed[0] === "/" ? trimmed : "/" + trimmed;
}
function withQuery(input, query) {
  const parsed = parseURL(input);
  const mergedQuery = { ...parseQuery(parsed.search), ...query };
  parsed.search = stringifyQuery(mergedQuery);
  return stringifyParsedURL(parsed);
}
function getQuery$1(input) {
  return parseQuery(parseURL(input).search);
}
function isEmptyURL(url) {
  return !url || url === "/";
}
function isNonEmptyURL(url) {
  return url && url !== "/";
}
function joinURL(base, ...input) {
  let url = base || "";
  for (const segment of input.filter((url2) => isNonEmptyURL(url2))) {
    if (url) {
      const _segment = segment.replace(JOIN_LEADING_SLASH_RE, "");
      url = withTrailingSlash(url) + _segment;
    } else {
      url = segment;
    }
  }
  return url;
}
function joinRelativeURL(..._input) {
  const JOIN_SEGMENT_SPLIT_RE = /\/(?!\/)/;
  const input = _input.filter(Boolean);
  const segments = [];
  let segmentsDepth = 0;
  for (const i of input) {
    if (!i || i === "/") {
      continue;
    }
    for (const [sindex, s] of i.split(JOIN_SEGMENT_SPLIT_RE).entries()) {
      if (!s || s === ".") {
        continue;
      }
      if (s === "..") {
        if (segments.length === 1 && hasProtocol(segments[0])) {
          continue;
        }
        segments.pop();
        segmentsDepth--;
        continue;
      }
      if (sindex === 1 && segments[segments.length - 1]?.endsWith(":/")) {
        segments[segments.length - 1] += "/" + s;
        continue;
      }
      segments.push(s);
      segmentsDepth++;
    }
  }
  let url = segments.join("/");
  if (segmentsDepth >= 0) {
    if (input[0]?.startsWith("/") && !url.startsWith("/")) {
      url = "/" + url;
    } else if (input[0]?.startsWith("./") && !url.startsWith("./")) {
      url = "./" + url;
    }
  } else {
    url = "../".repeat(-1 * segmentsDepth) + url;
  }
  if (input[input.length - 1]?.endsWith("/") && !url.endsWith("/")) {
    url += "/";
  }
  return url;
}

const protocolRelative = Symbol.for("ufo:protocolRelative");
function parseURL(input = "", defaultProto) {
  const _specialProtoMatch = input.match(
    /^[\s\0]*(blob:|data:|javascript:|vbscript:)(.*)/i
  );
  if (_specialProtoMatch) {
    const [, _proto, _pathname = ""] = _specialProtoMatch;
    return {
      protocol: _proto.toLowerCase(),
      pathname: _pathname,
      href: _proto + _pathname,
      auth: "",
      host: "",
      search: "",
      hash: ""
    };
  }
  if (!hasProtocol(input, { acceptRelative: true })) {
    return parsePath(input);
  }
  const [, protocol = "", auth, hostAndPath = ""] = input.replace(/\\/g, "/").match(/^[\s\0]*([\w+.-]{2,}:)?\/\/([^/@]+@)?(.*)/) || [];
  let [, host = "", path = ""] = hostAndPath.match(/([^#/?]*)(.*)?/) || [];
  if (protocol === "file:") {
    path = path.replace(/\/(?=[A-Za-z]:)/, "");
  }
  const { pathname, search, hash } = parsePath(path);
  return {
    protocol: protocol.toLowerCase(),
    auth: auth ? auth.slice(0, Math.max(0, auth.length - 1)) : "",
    host,
    pathname,
    search,
    hash,
    [protocolRelative]: !protocol
  };
}
function parsePath(input = "") {
  const [pathname = "", search = "", hash = ""] = (input.match(/([^#?]*)(\?[^#]*)?(#.*)?/) || []).splice(1);
  return {
    pathname,
    search,
    hash
  };
}
function stringifyParsedURL(parsed) {
  const pathname = parsed.pathname || "";
  const search = parsed.search ? (parsed.search.startsWith("?") ? "" : "?") + parsed.search : "";
  const hash = parsed.hash || "";
  const auth = parsed.auth ? parsed.auth + "@" : "";
  const host = parsed.host || "";
  const proto = parsed.protocol || parsed[protocolRelative] ? (parsed.protocol || "") + "//" : "";
  return proto + auth + host + pathname + search + hash;
}

function parse$1(str, options) {
  if (typeof str !== "string") {
    throw new TypeError("argument str must be a string");
  }
  const obj = {};
  const opt = options || {};
  const dec = opt.decode || decode;
  let index = 0;
  while (index < str.length) {
    const eqIdx = str.indexOf("=", index);
    if (eqIdx === -1) {
      break;
    }
    let endIdx = str.indexOf(";", index);
    if (endIdx === -1) {
      endIdx = str.length;
    } else if (endIdx < eqIdx) {
      index = str.lastIndexOf(";", eqIdx - 1) + 1;
      continue;
    }
    const key = str.slice(index, eqIdx).trim();
    if (opt?.filter && !opt?.filter(key)) {
      index = endIdx + 1;
      continue;
    }
    if (void 0 === obj[key]) {
      let val = str.slice(eqIdx + 1, endIdx).trim();
      if (val.codePointAt(0) === 34) {
        val = val.slice(1, -1);
      }
      obj[key] = tryDecode(val, dec);
    }
    index = endIdx + 1;
  }
  return obj;
}
function decode(str) {
  return str.includes("%") ? decodeURIComponent(str) : str;
}
function tryDecode(str, decode2) {
  try {
    return decode2(str);
  } catch {
    return str;
  }
}

const fieldContentRegExp = /^[\u0009\u0020-\u007E\u0080-\u00FF]+$/;
function serialize(name, value, options) {
  const opt = options || {};
  const enc = opt.encode || encodeURIComponent;
  if (typeof enc !== "function") {
    throw new TypeError("option encode is invalid");
  }
  if (!fieldContentRegExp.test(name)) {
    throw new TypeError("argument name is invalid");
  }
  const encodedValue = enc(value);
  if (encodedValue && !fieldContentRegExp.test(encodedValue)) {
    throw new TypeError("argument val is invalid");
  }
  let str = name + "=" + encodedValue;
  if (void 0 !== opt.maxAge && opt.maxAge !== null) {
    const maxAge = opt.maxAge - 0;
    if (Number.isNaN(maxAge) || !Number.isFinite(maxAge)) {
      throw new TypeError("option maxAge is invalid");
    }
    str += "; Max-Age=" + Math.floor(maxAge);
  }
  if (opt.domain) {
    if (!fieldContentRegExp.test(opt.domain)) {
      throw new TypeError("option domain is invalid");
    }
    str += "; Domain=" + opt.domain;
  }
  if (opt.path) {
    if (!fieldContentRegExp.test(opt.path)) {
      throw new TypeError("option path is invalid");
    }
    str += "; Path=" + opt.path;
  }
  if (opt.expires) {
    if (!isDate(opt.expires) || Number.isNaN(opt.expires.valueOf())) {
      throw new TypeError("option expires is invalid");
    }
    str += "; Expires=" + opt.expires.toUTCString();
  }
  if (opt.httpOnly) {
    str += "; HttpOnly";
  }
  if (opt.secure) {
    str += "; Secure";
  }
  if (opt.priority) {
    const priority = typeof opt.priority === "string" ? opt.priority.toLowerCase() : opt.priority;
    switch (priority) {
      case "low": {
        str += "; Priority=Low";
        break;
      }
      case "medium": {
        str += "; Priority=Medium";
        break;
      }
      case "high": {
        str += "; Priority=High";
        break;
      }
      default: {
        throw new TypeError("option priority is invalid");
      }
    }
  }
  if (opt.sameSite) {
    const sameSite = typeof opt.sameSite === "string" ? opt.sameSite.toLowerCase() : opt.sameSite;
    switch (sameSite) {
      case true: {
        str += "; SameSite=Strict";
        break;
      }
      case "lax": {
        str += "; SameSite=Lax";
        break;
      }
      case "strict": {
        str += "; SameSite=Strict";
        break;
      }
      case "none": {
        str += "; SameSite=None";
        break;
      }
      default: {
        throw new TypeError("option sameSite is invalid");
      }
    }
  }
  if (opt.partitioned) {
    str += "; Partitioned";
  }
  return str;
}
function isDate(val) {
  return Object.prototype.toString.call(val) === "[object Date]" || val instanceof Date;
}

const defaults = Object.freeze({
  ignoreUnknown: false,
  respectType: false,
  respectFunctionNames: false,
  respectFunctionProperties: false,
  unorderedObjects: true,
  unorderedArrays: false,
  unorderedSets: false,
  excludeKeys: void 0,
  excludeValues: void 0,
  replacer: void 0
});
function objectHash(object, options) {
  if (options) {
    options = { ...defaults, ...options };
  } else {
    options = defaults;
  }
  const hasher = createHasher(options);
  hasher.dispatch(object);
  return hasher.toString();
}
const defaultPrototypesKeys = Object.freeze([
  "prototype",
  "__proto__",
  "constructor"
]);
function createHasher(options) {
  let buff = "";
  let context = /* @__PURE__ */ new Map();
  const write = (str) => {
    buff += str;
  };
  return {
    toString() {
      return buff;
    },
    getContext() {
      return context;
    },
    dispatch(value) {
      if (options.replacer) {
        value = options.replacer(value);
      }
      const type = value === null ? "null" : typeof value;
      return this[type](value);
    },
    object(object) {
      if (object && typeof object.toJSON === "function") {
        return this.object(object.toJSON());
      }
      const objString = Object.prototype.toString.call(object);
      let objType = "";
      const objectLength = objString.length;
      if (objectLength < 10) {
        objType = "unknown:[" + objString + "]";
      } else {
        objType = objString.slice(8, objectLength - 1);
      }
      objType = objType.toLowerCase();
      let objectNumber = null;
      if ((objectNumber = context.get(object)) === void 0) {
        context.set(object, context.size);
      } else {
        return this.dispatch("[CIRCULAR:" + objectNumber + "]");
      }
      if (typeof Buffer !== "undefined" && Buffer.isBuffer && Buffer.isBuffer(object)) {
        write("buffer:");
        return write(object.toString("utf8"));
      }
      if (objType !== "object" && objType !== "function" && objType !== "asyncfunction") {
        if (this[objType]) {
          this[objType](object);
        } else if (!options.ignoreUnknown) {
          this.unkown(object, objType);
        }
      } else {
        let keys = Object.keys(object);
        if (options.unorderedObjects) {
          keys = keys.sort();
        }
        let extraKeys = [];
        if (options.respectType !== false && !isNativeFunction(object)) {
          extraKeys = defaultPrototypesKeys;
        }
        if (options.excludeKeys) {
          keys = keys.filter((key) => {
            return !options.excludeKeys(key);
          });
          extraKeys = extraKeys.filter((key) => {
            return !options.excludeKeys(key);
          });
        }
        write("object:" + (keys.length + extraKeys.length) + ":");
        const dispatchForKey = (key) => {
          this.dispatch(key);
          write(":");
          if (!options.excludeValues) {
            this.dispatch(object[key]);
          }
          write(",");
        };
        for (const key of keys) {
          dispatchForKey(key);
        }
        for (const key of extraKeys) {
          dispatchForKey(key);
        }
      }
    },
    array(arr, unordered) {
      unordered = unordered === void 0 ? options.unorderedArrays !== false : unordered;
      write("array:" + arr.length + ":");
      if (!unordered || arr.length <= 1) {
        for (const entry of arr) {
          this.dispatch(entry);
        }
        return;
      }
      const contextAdditions = /* @__PURE__ */ new Map();
      const entries = arr.map((entry) => {
        const hasher = createHasher(options);
        hasher.dispatch(entry);
        for (const [key, value] of hasher.getContext()) {
          contextAdditions.set(key, value);
        }
        return hasher.toString();
      });
      context = contextAdditions;
      entries.sort();
      return this.array(entries, false);
    },
    date(date) {
      return write("date:" + date.toJSON());
    },
    symbol(sym) {
      return write("symbol:" + sym.toString());
    },
    unkown(value, type) {
      write(type);
      if (!value) {
        return;
      }
      write(":");
      if (value && typeof value.entries === "function") {
        return this.array(
          Array.from(value.entries()),
          true
          /* ordered */
        );
      }
    },
    error(err) {
      return write("error:" + err.toString());
    },
    boolean(bool) {
      return write("bool:" + bool);
    },
    string(string) {
      write("string:" + string.length + ":");
      write(string);
    },
    function(fn) {
      write("fn:");
      if (isNativeFunction(fn)) {
        this.dispatch("[native]");
      } else {
        this.dispatch(fn.toString());
      }
      if (options.respectFunctionNames !== false) {
        this.dispatch("function-name:" + String(fn.name));
      }
      if (options.respectFunctionProperties) {
        this.object(fn);
      }
    },
    number(number) {
      return write("number:" + number);
    },
    xml(xml) {
      return write("xml:" + xml.toString());
    },
    null() {
      return write("Null");
    },
    undefined() {
      return write("Undefined");
    },
    regexp(regex) {
      return write("regex:" + regex.toString());
    },
    uint8array(arr) {
      write("uint8array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    uint8clampedarray(arr) {
      write("uint8clampedarray:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    int8array(arr) {
      write("int8array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    uint16array(arr) {
      write("uint16array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    int16array(arr) {
      write("int16array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    uint32array(arr) {
      write("uint32array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    int32array(arr) {
      write("int32array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    float32array(arr) {
      write("float32array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    float64array(arr) {
      write("float64array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    arraybuffer(arr) {
      write("arraybuffer:");
      return this.dispatch(new Uint8Array(arr));
    },
    url(url) {
      return write("url:" + url.toString());
    },
    map(map) {
      write("map:");
      const arr = [...map];
      return this.array(arr, options.unorderedSets !== false);
    },
    set(set) {
      write("set:");
      const arr = [...set];
      return this.array(arr, options.unorderedSets !== false);
    },
    file(file) {
      write("file:");
      return this.dispatch([file.name, file.size, file.type, file.lastModfied]);
    },
    blob() {
      if (options.ignoreUnknown) {
        return write("[blob]");
      }
      throw new Error(
        'Hashing Blob objects is currently not supported\nUse "options.replacer" or "options.ignoreUnknown"\n'
      );
    },
    domwindow() {
      return write("domwindow");
    },
    bigint(number) {
      return write("bigint:" + number.toString());
    },
    /* Node.js standard native objects */
    process() {
      return write("process");
    },
    timer() {
      return write("timer");
    },
    pipe() {
      return write("pipe");
    },
    tcp() {
      return write("tcp");
    },
    udp() {
      return write("udp");
    },
    tty() {
      return write("tty");
    },
    statwatcher() {
      return write("statwatcher");
    },
    securecontext() {
      return write("securecontext");
    },
    connection() {
      return write("connection");
    },
    zlib() {
      return write("zlib");
    },
    context() {
      return write("context");
    },
    nodescript() {
      return write("nodescript");
    },
    httpparser() {
      return write("httpparser");
    },
    dataview() {
      return write("dataview");
    },
    signal() {
      return write("signal");
    },
    fsevent() {
      return write("fsevent");
    },
    tlswrap() {
      return write("tlswrap");
    }
  };
}
const nativeFunc = "[native code] }";
const nativeFuncLength = nativeFunc.length;
function isNativeFunction(f) {
  if (typeof f !== "function") {
    return false;
  }
  return Function.prototype.toString.call(f).slice(-nativeFuncLength) === nativeFunc;
}

var __defProp$1 = Object.defineProperty;
var __defNormalProp$1 = (obj, key, value) => key in obj ? __defProp$1(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$1 = (obj, key, value) => {
  __defNormalProp$1(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class WordArray {
  constructor(words, sigBytes) {
    __publicField$1(this, "words");
    __publicField$1(this, "sigBytes");
    words = this.words = words || [];
    this.sigBytes = sigBytes === void 0 ? words.length * 4 : sigBytes;
  }
  toString(encoder) {
    return (encoder || Hex).stringify(this);
  }
  concat(wordArray) {
    this.clamp();
    if (this.sigBytes % 4) {
      for (let i = 0; i < wordArray.sigBytes; i++) {
        const thatByte = wordArray.words[i >>> 2] >>> 24 - i % 4 * 8 & 255;
        this.words[this.sigBytes + i >>> 2] |= thatByte << 24 - (this.sigBytes + i) % 4 * 8;
      }
    } else {
      for (let j = 0; j < wordArray.sigBytes; j += 4) {
        this.words[this.sigBytes + j >>> 2] = wordArray.words[j >>> 2];
      }
    }
    this.sigBytes += wordArray.sigBytes;
    return this;
  }
  clamp() {
    this.words[this.sigBytes >>> 2] &= 4294967295 << 32 - this.sigBytes % 4 * 8;
    this.words.length = Math.ceil(this.sigBytes / 4);
  }
  clone() {
    return new WordArray([...this.words]);
  }
}
const Hex = {
  stringify(wordArray) {
    const hexChars = [];
    for (let i = 0; i < wordArray.sigBytes; i++) {
      const bite = wordArray.words[i >>> 2] >>> 24 - i % 4 * 8 & 255;
      hexChars.push((bite >>> 4).toString(16), (bite & 15).toString(16));
    }
    return hexChars.join("");
  }
};
const Base64 = {
  stringify(wordArray) {
    const keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const base64Chars = [];
    for (let i = 0; i < wordArray.sigBytes; i += 3) {
      const byte1 = wordArray.words[i >>> 2] >>> 24 - i % 4 * 8 & 255;
      const byte2 = wordArray.words[i + 1 >>> 2] >>> 24 - (i + 1) % 4 * 8 & 255;
      const byte3 = wordArray.words[i + 2 >>> 2] >>> 24 - (i + 2) % 4 * 8 & 255;
      const triplet = byte1 << 16 | byte2 << 8 | byte3;
      for (let j = 0; j < 4 && i * 8 + j * 6 < wordArray.sigBytes * 8; j++) {
        base64Chars.push(keyStr.charAt(triplet >>> 6 * (3 - j) & 63));
      }
    }
    return base64Chars.join("");
  }
};
const Latin1 = {
  parse(latin1Str) {
    const latin1StrLength = latin1Str.length;
    const words = [];
    for (let i = 0; i < latin1StrLength; i++) {
      words[i >>> 2] |= (latin1Str.charCodeAt(i) & 255) << 24 - i % 4 * 8;
    }
    return new WordArray(words, latin1StrLength);
  }
};
const Utf8 = {
  parse(utf8Str) {
    return Latin1.parse(unescape(encodeURIComponent(utf8Str)));
  }
};
class BufferedBlockAlgorithm {
  constructor() {
    __publicField$1(this, "_data", new WordArray());
    __publicField$1(this, "_nDataBytes", 0);
    __publicField$1(this, "_minBufferSize", 0);
    __publicField$1(this, "blockSize", 512 / 32);
  }
  reset() {
    this._data = new WordArray();
    this._nDataBytes = 0;
  }
  _append(data) {
    if (typeof data === "string") {
      data = Utf8.parse(data);
    }
    this._data.concat(data);
    this._nDataBytes += data.sigBytes;
  }
  _doProcessBlock(_dataWords, _offset) {
  }
  _process(doFlush) {
    let processedWords;
    let nBlocksReady = this._data.sigBytes / (this.blockSize * 4);
    if (doFlush) {
      nBlocksReady = Math.ceil(nBlocksReady);
    } else {
      nBlocksReady = Math.max((nBlocksReady | 0) - this._minBufferSize, 0);
    }
    const nWordsReady = nBlocksReady * this.blockSize;
    const nBytesReady = Math.min(nWordsReady * 4, this._data.sigBytes);
    if (nWordsReady) {
      for (let offset = 0; offset < nWordsReady; offset += this.blockSize) {
        this._doProcessBlock(this._data.words, offset);
      }
      processedWords = this._data.words.splice(0, nWordsReady);
      this._data.sigBytes -= nBytesReady;
    }
    return new WordArray(processedWords, nBytesReady);
  }
}
class Hasher extends BufferedBlockAlgorithm {
  update(messageUpdate) {
    this._append(messageUpdate);
    this._process();
    return this;
  }
  finalize(messageUpdate) {
    if (messageUpdate) {
      this._append(messageUpdate);
    }
  }
}

var __defProp$3 = Object.defineProperty;
var __defNormalProp$3 = (obj, key, value) => key in obj ? __defProp$3(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$3 = (obj, key, value) => {
  __defNormalProp$3(obj, key + "" , value);
  return value;
};
const H = [
  1779033703,
  -1150833019,
  1013904242,
  -1521486534,
  1359893119,
  -1694144372,
  528734635,
  1541459225
];
const K = [
  1116352408,
  1899447441,
  -1245643825,
  -373957723,
  961987163,
  1508970993,
  -1841331548,
  -1424204075,
  -670586216,
  310598401,
  607225278,
  1426881987,
  1925078388,
  -2132889090,
  -1680079193,
  -1046744716,
  -459576895,
  -272742522,
  264347078,
  604807628,
  770255983,
  1249150122,
  1555081692,
  1996064986,
  -1740746414,
  -1473132947,
  -1341970488,
  -1084653625,
  -958395405,
  -710438585,
  113926993,
  338241895,
  666307205,
  773529912,
  1294757372,
  1396182291,
  1695183700,
  1986661051,
  -2117940946,
  -1838011259,
  -1564481375,
  -1474664885,
  -1035236496,
  -949202525,
  -778901479,
  -694614492,
  -200395387,
  275423344,
  430227734,
  506948616,
  659060556,
  883997877,
  958139571,
  1322822218,
  1537002063,
  1747873779,
  1955562222,
  2024104815,
  -2067236844,
  -1933114872,
  -1866530822,
  -1538233109,
  -1090935817,
  -965641998
];
const W = [];
class SHA256 extends Hasher {
  constructor() {
    super(...arguments);
    __publicField$3(this, "_hash", new WordArray([...H]));
  }
  /**
   * Resets the internal state of the hash object to initial values.
   */
  reset() {
    super.reset();
    this._hash = new WordArray([...H]);
  }
  _doProcessBlock(M, offset) {
    const H2 = this._hash.words;
    let a = H2[0];
    let b = H2[1];
    let c = H2[2];
    let d = H2[3];
    let e = H2[4];
    let f = H2[5];
    let g = H2[6];
    let h = H2[7];
    for (let i = 0; i < 64; i++) {
      if (i < 16) {
        W[i] = M[offset + i] | 0;
      } else {
        const gamma0x = W[i - 15];
        const gamma0 = (gamma0x << 25 | gamma0x >>> 7) ^ (gamma0x << 14 | gamma0x >>> 18) ^ gamma0x >>> 3;
        const gamma1x = W[i - 2];
        const gamma1 = (gamma1x << 15 | gamma1x >>> 17) ^ (gamma1x << 13 | gamma1x >>> 19) ^ gamma1x >>> 10;
        W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16];
      }
      const ch = e & f ^ ~e & g;
      const maj = a & b ^ a & c ^ b & c;
      const sigma0 = (a << 30 | a >>> 2) ^ (a << 19 | a >>> 13) ^ (a << 10 | a >>> 22);
      const sigma1 = (e << 26 | e >>> 6) ^ (e << 21 | e >>> 11) ^ (e << 7 | e >>> 25);
      const t1 = h + sigma1 + ch + K[i] + W[i];
      const t2 = sigma0 + maj;
      h = g;
      g = f;
      f = e;
      e = d + t1 | 0;
      d = c;
      c = b;
      b = a;
      a = t1 + t2 | 0;
    }
    H2[0] = H2[0] + a | 0;
    H2[1] = H2[1] + b | 0;
    H2[2] = H2[2] + c | 0;
    H2[3] = H2[3] + d | 0;
    H2[4] = H2[4] + e | 0;
    H2[5] = H2[5] + f | 0;
    H2[6] = H2[6] + g | 0;
    H2[7] = H2[7] + h | 0;
  }
  /**
   * Finishes the hash calculation and returns the hash as a WordArray.
   *
   * @param {string} messageUpdate - Additional message content to include in the hash.
   * @returns {WordArray} The finalised hash as a WordArray.
   */
  finalize(messageUpdate) {
    super.finalize(messageUpdate);
    const nBitsTotal = this._nDataBytes * 8;
    const nBitsLeft = this._data.sigBytes * 8;
    this._data.words[nBitsLeft >>> 5] |= 128 << 24 - nBitsLeft % 32;
    this._data.words[(nBitsLeft + 64 >>> 9 << 4) + 14] = Math.floor(
      nBitsTotal / 4294967296
    );
    this._data.words[(nBitsLeft + 64 >>> 9 << 4) + 15] = nBitsTotal;
    this._data.sigBytes = this._data.words.length * 4;
    this._process();
    return this._hash;
  }
}
function sha256base64(message) {
  return new SHA256().finalize(message).toString(Base64);
}

function hash(object, options = {}) {
  const hashed = typeof object === "string" ? object : objectHash(object, options);
  return sha256base64(hashed).slice(0, 10);
}

function isEqual(object1, object2, hashOptions = {}) {
  if (object1 === object2) {
    return true;
  }
  if (objectHash(object1, hashOptions) === objectHash(object2, hashOptions)) {
    return true;
  }
  return false;
}

const NODE_TYPES = {
  NORMAL: 0,
  WILDCARD: 1,
  PLACEHOLDER: 2
};

function createRouter$1(options = {}) {
  const ctx = {
    options,
    rootNode: createRadixNode(),
    staticRoutesMap: {}
  };
  const normalizeTrailingSlash = (p) => options.strictTrailingSlash ? p : p.replace(/\/$/, "") || "/";
  if (options.routes) {
    for (const path in options.routes) {
      insert(ctx, normalizeTrailingSlash(path), options.routes[path]);
    }
  }
  return {
    ctx,
    lookup: (path) => lookup(ctx, normalizeTrailingSlash(path)),
    insert: (path, data) => insert(ctx, normalizeTrailingSlash(path), data),
    remove: (path) => remove(ctx, normalizeTrailingSlash(path))
  };
}
function lookup(ctx, path) {
  const staticPathNode = ctx.staticRoutesMap[path];
  if (staticPathNode) {
    return staticPathNode.data;
  }
  const sections = path.split("/");
  const params = {};
  let paramsFound = false;
  let wildcardNode = null;
  let node = ctx.rootNode;
  let wildCardParam = null;
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    if (node.wildcardChildNode !== null) {
      wildcardNode = node.wildcardChildNode;
      wildCardParam = sections.slice(i).join("/");
    }
    const nextNode = node.children.get(section);
    if (nextNode === void 0) {
      if (node && node.placeholderChildren.length > 1) {
        const remaining = sections.length - i;
        node = node.placeholderChildren.find((c) => c.maxDepth === remaining) || null;
      } else {
        node = node.placeholderChildren[0] || null;
      }
      if (!node) {
        break;
      }
      if (node.paramName) {
        params[node.paramName] = section;
      }
      paramsFound = true;
    } else {
      node = nextNode;
    }
  }
  if ((node === null || node.data === null) && wildcardNode !== null) {
    node = wildcardNode;
    params[node.paramName || "_"] = wildCardParam;
    paramsFound = true;
  }
  if (!node) {
    return null;
  }
  if (paramsFound) {
    return {
      ...node.data,
      params: paramsFound ? params : void 0
    };
  }
  return node.data;
}
function insert(ctx, path, data) {
  let isStaticRoute = true;
  const sections = path.split("/");
  let node = ctx.rootNode;
  let _unnamedPlaceholderCtr = 0;
  const matchedNodes = [node];
  for (const section of sections) {
    let childNode;
    if (childNode = node.children.get(section)) {
      node = childNode;
    } else {
      const type = getNodeType(section);
      childNode = createRadixNode({ type, parent: node });
      node.children.set(section, childNode);
      if (type === NODE_TYPES.PLACEHOLDER) {
        childNode.paramName = section === "*" ? `_${_unnamedPlaceholderCtr++}` : section.slice(1);
        node.placeholderChildren.push(childNode);
        isStaticRoute = false;
      } else if (type === NODE_TYPES.WILDCARD) {
        node.wildcardChildNode = childNode;
        childNode.paramName = section.slice(
          3
          /* "**:" */
        ) || "_";
        isStaticRoute = false;
      }
      matchedNodes.push(childNode);
      node = childNode;
    }
  }
  for (const [depth, node2] of matchedNodes.entries()) {
    node2.maxDepth = Math.max(matchedNodes.length - depth, node2.maxDepth || 0);
  }
  node.data = data;
  if (isStaticRoute === true) {
    ctx.staticRoutesMap[path] = node;
  }
  return node;
}
function remove(ctx, path) {
  let success = false;
  const sections = path.split("/");
  let node = ctx.rootNode;
  for (const section of sections) {
    node = node.children.get(section);
    if (!node) {
      return success;
    }
  }
  if (node.data) {
    const lastSection = sections.at(-1) || "";
    node.data = null;
    if (Object.keys(node.children).length === 0 && node.parent) {
      node.parent.children.delete(lastSection);
      node.parent.wildcardChildNode = null;
      node.parent.placeholderChildren = [];
    }
    success = true;
  }
  return success;
}
function createRadixNode(options = {}) {
  return {
    type: options.type || NODE_TYPES.NORMAL,
    maxDepth: 0,
    parent: options.parent || null,
    children: /* @__PURE__ */ new Map(),
    data: options.data || null,
    paramName: options.paramName || null,
    wildcardChildNode: null,
    placeholderChildren: []
  };
}
function getNodeType(str) {
  if (str.startsWith("**")) {
    return NODE_TYPES.WILDCARD;
  }
  if (str[0] === ":" || str === "*") {
    return NODE_TYPES.PLACEHOLDER;
  }
  return NODE_TYPES.NORMAL;
}

function toRouteMatcher(router) {
  const table = _routerNodeToTable("", router.ctx.rootNode);
  return _createMatcher(table, router.ctx.options.strictTrailingSlash);
}
function _createMatcher(table, strictTrailingSlash) {
  return {
    ctx: { table },
    matchAll: (path) => _matchRoutes(path, table, strictTrailingSlash)
  };
}
function _createRouteTable() {
  return {
    static: /* @__PURE__ */ new Map(),
    wildcard: /* @__PURE__ */ new Map(),
    dynamic: /* @__PURE__ */ new Map()
  };
}
function _matchRoutes(path, table, strictTrailingSlash) {
  if (strictTrailingSlash !== true && path.endsWith("/")) {
    path = path.slice(0, -1) || "/";
  }
  const matches = [];
  for (const [key, value] of _sortRoutesMap(table.wildcard)) {
    if (path === key || path.startsWith(key + "/")) {
      matches.push(value);
    }
  }
  for (const [key, value] of _sortRoutesMap(table.dynamic)) {
    if (path.startsWith(key + "/")) {
      const subPath = "/" + path.slice(key.length).split("/").splice(2).join("/");
      matches.push(..._matchRoutes(subPath, value));
    }
  }
  const staticMatch = table.static.get(path);
  if (staticMatch) {
    matches.push(staticMatch);
  }
  return matches.filter(Boolean);
}
function _sortRoutesMap(m) {
  return [...m.entries()].sort((a, b) => a[0].length - b[0].length);
}
function _routerNodeToTable(initialPath, initialNode) {
  const table = _createRouteTable();
  function _addNode(path, node) {
    if (path) {
      if (node.type === NODE_TYPES.NORMAL && !(path.includes("*") || path.includes(":"))) {
        if (node.data) {
          table.static.set(path, node.data);
        }
      } else if (node.type === NODE_TYPES.WILDCARD) {
        table.wildcard.set(path.replace("/**", ""), node.data);
      } else if (node.type === NODE_TYPES.PLACEHOLDER) {
        const subTable = _routerNodeToTable("", node);
        if (node.data) {
          subTable.static.set("/", node.data);
        }
        table.dynamic.set(path.replace(/\/\*|\/:\w+/, ""), subTable);
        return;
      }
    }
    for (const [childPath, child] of node.children.entries()) {
      _addNode(`${path}/${childPath}`.replace("//", "/"), child);
    }
  }
  _addNode(initialPath, initialNode);
  return table;
}

function isPlainObject(value) {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== null && prototype !== Object.prototype && Object.getPrototypeOf(prototype) !== null) {
    return false;
  }
  if (Symbol.iterator in value) {
    return false;
  }
  if (Symbol.toStringTag in value) {
    return Object.prototype.toString.call(value) === "[object Module]";
  }
  return true;
}

function _defu(baseObject, defaults, namespace = ".", merger) {
  if (!isPlainObject(defaults)) {
    return _defu(baseObject, {}, namespace, merger);
  }
  const object = Object.assign({}, defaults);
  for (const key in baseObject) {
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = baseObject[key];
    if (value === null || value === void 0) {
      continue;
    }
    if (merger && merger(object, key, value, namespace)) {
      continue;
    }
    if (Array.isArray(value) && Array.isArray(object[key])) {
      object[key] = [...value, ...object[key]];
    } else if (isPlainObject(value) && isPlainObject(object[key])) {
      object[key] = _defu(
        value,
        object[key],
        (namespace ? `${namespace}.` : "") + key.toString(),
        merger
      );
    } else {
      object[key] = value;
    }
  }
  return object;
}
function createDefu(merger) {
  return (...arguments_) => (
    // eslint-disable-next-line unicorn/no-array-reduce
    arguments_.reduce((p, c) => _defu(p, c, "", merger), {})
  );
}
const defu = createDefu();
const defuFn = createDefu((object, key, currentValue) => {
  if (object[key] !== void 0 && typeof currentValue === "function") {
    object[key] = currentValue(object[key]);
    return true;
  }
});

function rawHeaders(headers) {
  const rawHeaders2 = [];
  for (const key in headers) {
    if (Array.isArray(headers[key])) {
      for (const h of headers[key]) {
        rawHeaders2.push(key, h);
      }
    } else {
      rawHeaders2.push(key, headers[key]);
    }
  }
  return rawHeaders2;
}
function mergeFns(...functions) {
  return function(...args) {
    for (const fn of functions) {
      fn(...args);
    }
  };
}
function createNotImplementedError(name) {
  throw new Error(`[unenv] ${name} is not implemented yet!`);
}

let defaultMaxListeners = 10;
let EventEmitter$1 = class EventEmitter {
  __unenv__ = true;
  _events = /* @__PURE__ */ Object.create(null);
  _maxListeners;
  static get defaultMaxListeners() {
    return defaultMaxListeners;
  }
  static set defaultMaxListeners(arg) {
    if (typeof arg !== "number" || arg < 0 || Number.isNaN(arg)) {
      throw new RangeError(
        'The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + "."
      );
    }
    defaultMaxListeners = arg;
  }
  setMaxListeners(n) {
    if (typeof n !== "number" || n < 0 || Number.isNaN(n)) {
      throw new RangeError(
        'The value of "n" is out of range. It must be a non-negative number. Received ' + n + "."
      );
    }
    this._maxListeners = n;
    return this;
  }
  getMaxListeners() {
    return _getMaxListeners(this);
  }
  emit(type, ...args) {
    if (!this._events[type] || this._events[type].length === 0) {
      return false;
    }
    if (type === "error") {
      let er;
      if (args.length > 0) {
        er = args[0];
      }
      if (er instanceof Error) {
        throw er;
      }
      const err = new Error(
        "Unhandled error." + (er ? " (" + er.message + ")" : "")
      );
      err.context = er;
      throw err;
    }
    for (const _listener of this._events[type]) {
      (_listener.listener || _listener).apply(this, args);
    }
    return true;
  }
  addListener(type, listener) {
    return _addListener(this, type, listener, false);
  }
  on(type, listener) {
    return _addListener(this, type, listener, false);
  }
  prependListener(type, listener) {
    return _addListener(this, type, listener, true);
  }
  once(type, listener) {
    return this.on(type, _wrapOnce(this, type, listener));
  }
  prependOnceListener(type, listener) {
    return this.prependListener(type, _wrapOnce(this, type, listener));
  }
  removeListener(type, listener) {
    return _removeListener(this, type, listener);
  }
  off(type, listener) {
    return this.removeListener(type, listener);
  }
  removeAllListeners(type) {
    return _removeAllListeners(this, type);
  }
  listeners(type) {
    return _listeners(this, type, true);
  }
  rawListeners(type) {
    return _listeners(this, type, false);
  }
  listenerCount(type) {
    return this.rawListeners(type).length;
  }
  eventNames() {
    return Object.keys(this._events);
  }
};
function _addListener(target, type, listener, prepend) {
  _checkListener(listener);
  if (target._events.newListener !== void 0) {
    target.emit("newListener", type, listener.listener || listener);
  }
  if (!target._events[type]) {
    target._events[type] = [];
  }
  if (prepend) {
    target._events[type].unshift(listener);
  } else {
    target._events[type].push(listener);
  }
  const maxListeners = _getMaxListeners(target);
  if (maxListeners > 0 && target._events[type].length > maxListeners && !target._events[type].warned) {
    target._events[type].warned = true;
    const warning = new Error(
      `[unenv] Possible EventEmitter memory leak detected. ${target._events[type].length} ${type} listeners added. Use emitter.setMaxListeners() to increase limit`
    );
    warning.name = "MaxListenersExceededWarning";
    warning.emitter = target;
    warning.type = type;
    warning.count = target._events[type]?.length;
    console.warn(warning);
  }
  return target;
}
function _removeListener(target, type, listener) {
  _checkListener(listener);
  if (!target._events[type] || target._events[type].length === 0) {
    return target;
  }
  const lenBeforeFilter = target._events[type].length;
  target._events[type] = target._events[type].filter((fn) => fn !== listener);
  if (lenBeforeFilter === target._events[type].length) {
    return target;
  }
  if (target._events.removeListener) {
    target.emit("removeListener", type, listener.listener || listener);
  }
  if (target._events[type].length === 0) {
    delete target._events[type];
  }
  return target;
}
function _removeAllListeners(target, type) {
  if (!target._events[type] || target._events[type].length === 0) {
    return target;
  }
  if (target._events.removeListener) {
    for (const _listener of target._events[type]) {
      target.emit("removeListener", type, _listener.listener || _listener);
    }
  }
  delete target._events[type];
  return target;
}
function _wrapOnce(target, type, listener) {
  let fired = false;
  const wrapper = (...args) => {
    if (fired) {
      return;
    }
    target.removeListener(type, wrapper);
    fired = true;
    return args.length === 0 ? listener.call(target) : listener.apply(target, args);
  };
  wrapper.listener = listener;
  return wrapper;
}
function _getMaxListeners(target) {
  return target._maxListeners ?? EventEmitter$1.defaultMaxListeners;
}
function _listeners(target, type, unwrap) {
  let listeners = target._events[type];
  if (typeof listeners === "function") {
    listeners = [listeners];
  }
  return unwrap ? listeners.map((l) => l.listener || l) : listeners;
}
function _checkListener(listener) {
  if (typeof listener !== "function") {
    throw new TypeError(
      'The "listener" argument must be of type Function. Received type ' + typeof listener
    );
  }
}

const EventEmitter = globalThis.EventEmitter || EventEmitter$1;

class _Readable extends EventEmitter {
  __unenv__ = true;
  readableEncoding = null;
  readableEnded = true;
  readableFlowing = false;
  readableHighWaterMark = 0;
  readableLength = 0;
  readableObjectMode = false;
  readableAborted = false;
  readableDidRead = false;
  closed = false;
  errored = null;
  readable = false;
  destroyed = false;
  static from(_iterable, options) {
    return new _Readable(options);
  }
  constructor(_opts) {
    super();
  }
  _read(_size) {
  }
  read(_size) {
  }
  setEncoding(_encoding) {
    return this;
  }
  pause() {
    return this;
  }
  resume() {
    return this;
  }
  isPaused() {
    return true;
  }
  unpipe(_destination) {
    return this;
  }
  unshift(_chunk, _encoding) {
  }
  wrap(_oldStream) {
    return this;
  }
  push(_chunk, _encoding) {
    return false;
  }
  _destroy(_error, _callback) {
    this.removeAllListeners();
  }
  destroy(error) {
    this.destroyed = true;
    this._destroy(error);
    return this;
  }
  pipe(_destenition, _options) {
    return {};
  }
  compose(stream, options) {
    throw new Error("[unenv] Method not implemented.");
  }
  [Symbol.asyncDispose]() {
    this.destroy();
    return Promise.resolve();
  }
  // eslint-disable-next-line require-yield
  async *[Symbol.asyncIterator]() {
    throw createNotImplementedError("Readable.asyncIterator");
  }
  iterator(options) {
    throw createNotImplementedError("Readable.iterator");
  }
  map(fn, options) {
    throw createNotImplementedError("Readable.map");
  }
  filter(fn, options) {
    throw createNotImplementedError("Readable.filter");
  }
  forEach(fn, options) {
    throw createNotImplementedError("Readable.forEach");
  }
  reduce(fn, initialValue, options) {
    throw createNotImplementedError("Readable.reduce");
  }
  find(fn, options) {
    throw createNotImplementedError("Readable.find");
  }
  findIndex(fn, options) {
    throw createNotImplementedError("Readable.findIndex");
  }
  some(fn, options) {
    throw createNotImplementedError("Readable.some");
  }
  toArray(options) {
    throw createNotImplementedError("Readable.toArray");
  }
  every(fn, options) {
    throw createNotImplementedError("Readable.every");
  }
  flatMap(fn, options) {
    throw createNotImplementedError("Readable.flatMap");
  }
  drop(limit, options) {
    throw createNotImplementedError("Readable.drop");
  }
  take(limit, options) {
    throw createNotImplementedError("Readable.take");
  }
  asIndexedPairs(options) {
    throw createNotImplementedError("Readable.asIndexedPairs");
  }
}
const Readable = globalThis.Readable || _Readable;

class _Writable extends EventEmitter {
  __unenv__ = true;
  writable = true;
  writableEnded = false;
  writableFinished = false;
  writableHighWaterMark = 0;
  writableLength = 0;
  writableObjectMode = false;
  writableCorked = 0;
  closed = false;
  errored = null;
  writableNeedDrain = false;
  destroyed = false;
  _data;
  _encoding = "utf-8";
  constructor(_opts) {
    super();
  }
  pipe(_destenition, _options) {
    return {};
  }
  _write(chunk, encoding, callback) {
    if (this.writableEnded) {
      if (callback) {
        callback();
      }
      return;
    }
    if (this._data === void 0) {
      this._data = chunk;
    } else {
      const a = typeof this._data === "string" ? Buffer.from(this._data, this._encoding || encoding || "utf8") : this._data;
      const b = typeof chunk === "string" ? Buffer.from(chunk, encoding || this._encoding || "utf8") : chunk;
      this._data = Buffer.concat([a, b]);
    }
    this._encoding = encoding;
    if (callback) {
      callback();
    }
  }
  _writev(_chunks, _callback) {
  }
  _destroy(_error, _callback) {
  }
  _final(_callback) {
  }
  write(chunk, arg2, arg3) {
    const encoding = typeof arg2 === "string" ? this._encoding : "utf-8";
    const cb = typeof arg2 === "function" ? arg2 : typeof arg3 === "function" ? arg3 : void 0;
    this._write(chunk, encoding, cb);
    return true;
  }
  setDefaultEncoding(_encoding) {
    return this;
  }
  end(arg1, arg2, arg3) {
    const callback = typeof arg1 === "function" ? arg1 : typeof arg2 === "function" ? arg2 : typeof arg3 === "function" ? arg3 : void 0;
    if (this.writableEnded) {
      if (callback) {
        callback();
      }
      return this;
    }
    const data = arg1 === callback ? void 0 : arg1;
    if (data) {
      const encoding = arg2 === callback ? void 0 : arg2;
      this.write(data, encoding, callback);
    }
    this.writableEnded = true;
    this.writableFinished = true;
    this.emit("close");
    this.emit("finish");
    return this;
  }
  cork() {
  }
  uncork() {
  }
  destroy(_error) {
    this.destroyed = true;
    delete this._data;
    this.removeAllListeners();
    return this;
  }
  compose(stream, options) {
    throw new Error("[h3] Method not implemented.");
  }
}
const Writable = globalThis.Writable || _Writable;

const __Duplex = class {
  allowHalfOpen = true;
  _destroy;
  constructor(readable = new Readable(), writable = new Writable()) {
    Object.assign(this, readable);
    Object.assign(this, writable);
    this._destroy = mergeFns(readable._destroy, writable._destroy);
  }
};
function getDuplex() {
  Object.assign(__Duplex.prototype, Readable.prototype);
  Object.assign(__Duplex.prototype, Writable.prototype);
  return __Duplex;
}
const _Duplex = /* @__PURE__ */ getDuplex();
const Duplex = globalThis.Duplex || _Duplex;

class Socket extends Duplex {
  __unenv__ = true;
  bufferSize = 0;
  bytesRead = 0;
  bytesWritten = 0;
  connecting = false;
  destroyed = false;
  pending = false;
  localAddress = "";
  localPort = 0;
  remoteAddress = "";
  remoteFamily = "";
  remotePort = 0;
  autoSelectFamilyAttemptedAddresses = [];
  readyState = "readOnly";
  constructor(_options) {
    super();
  }
  write(_buffer, _arg1, _arg2) {
    return false;
  }
  connect(_arg1, _arg2, _arg3) {
    return this;
  }
  end(_arg1, _arg2, _arg3) {
    return this;
  }
  setEncoding(_encoding) {
    return this;
  }
  pause() {
    return this;
  }
  resume() {
    return this;
  }
  setTimeout(_timeout, _callback) {
    return this;
  }
  setNoDelay(_noDelay) {
    return this;
  }
  setKeepAlive(_enable, _initialDelay) {
    return this;
  }
  address() {
    return {};
  }
  unref() {
    return this;
  }
  ref() {
    return this;
  }
  destroySoon() {
    this.destroy();
  }
  resetAndDestroy() {
    const err = new Error("ERR_SOCKET_CLOSED");
    err.code = "ERR_SOCKET_CLOSED";
    this.destroy(err);
    return this;
  }
}

class IncomingMessage extends Readable {
  __unenv__ = {};
  aborted = false;
  httpVersion = "1.1";
  httpVersionMajor = 1;
  httpVersionMinor = 1;
  complete = true;
  connection;
  socket;
  headers = {};
  trailers = {};
  method = "GET";
  url = "/";
  statusCode = 200;
  statusMessage = "";
  closed = false;
  errored = null;
  readable = false;
  constructor(socket) {
    super();
    this.socket = this.connection = socket || new Socket();
  }
  get rawHeaders() {
    return rawHeaders(this.headers);
  }
  get rawTrailers() {
    return [];
  }
  setTimeout(_msecs, _callback) {
    return this;
  }
  get headersDistinct() {
    return _distinct(this.headers);
  }
  get trailersDistinct() {
    return _distinct(this.trailers);
  }
}
function _distinct(obj) {
  const d = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key) {
      d[key] = (Array.isArray(value) ? value : [value]).filter(
        Boolean
      );
    }
  }
  return d;
}

class ServerResponse extends Writable {
  __unenv__ = true;
  statusCode = 200;
  statusMessage = "";
  upgrading = false;
  chunkedEncoding = false;
  shouldKeepAlive = false;
  useChunkedEncodingByDefault = false;
  sendDate = false;
  finished = false;
  headersSent = false;
  strictContentLength = false;
  connection = null;
  socket = null;
  req;
  _headers = {};
  constructor(req) {
    super();
    this.req = req;
  }
  assignSocket(socket) {
    socket._httpMessage = this;
    this.socket = socket;
    this.connection = socket;
    this.emit("socket", socket);
    this._flush();
  }
  _flush() {
    this.flushHeaders();
  }
  detachSocket(_socket) {
  }
  writeContinue(_callback) {
  }
  writeHead(statusCode, arg1, arg2) {
    if (statusCode) {
      this.statusCode = statusCode;
    }
    if (typeof arg1 === "string") {
      this.statusMessage = arg1;
      arg1 = void 0;
    }
    const headers = arg2 || arg1;
    if (headers) {
      if (Array.isArray(headers)) ; else {
        for (const key in headers) {
          this.setHeader(key, headers[key]);
        }
      }
    }
    this.headersSent = true;
    return this;
  }
  writeProcessing() {
  }
  setTimeout(_msecs, _callback) {
    return this;
  }
  appendHeader(name, value) {
    name = name.toLowerCase();
    const current = this._headers[name];
    const all = [
      ...Array.isArray(current) ? current : [current],
      ...Array.isArray(value) ? value : [value]
    ].filter(Boolean);
    this._headers[name] = all.length > 1 ? all : all[0];
    return this;
  }
  setHeader(name, value) {
    this._headers[name.toLowerCase()] = value;
    return this;
  }
  getHeader(name) {
    return this._headers[name.toLowerCase()];
  }
  getHeaders() {
    return this._headers;
  }
  getHeaderNames() {
    return Object.keys(this._headers);
  }
  hasHeader(name) {
    return name.toLowerCase() in this._headers;
  }
  removeHeader(name) {
    delete this._headers[name.toLowerCase()];
  }
  addTrailers(_headers) {
  }
  flushHeaders() {
  }
  writeEarlyHints(_headers, cb) {
    if (typeof cb === "function") {
      cb();
    }
  }
}

function hasProp(obj, prop) {
  try {
    return prop in obj;
  } catch {
    return false;
  }
}

var __defProp$2 = Object.defineProperty;
var __defNormalProp$2 = (obj, key, value) => key in obj ? __defProp$2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$2 = (obj, key, value) => {
  __defNormalProp$2(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class H3Error extends Error {
  constructor(message, opts = {}) {
    super(message, opts);
    __publicField$2(this, "statusCode", 500);
    __publicField$2(this, "fatal", false);
    __publicField$2(this, "unhandled", false);
    __publicField$2(this, "statusMessage");
    __publicField$2(this, "data");
    __publicField$2(this, "cause");
    if (opts.cause && !this.cause) {
      this.cause = opts.cause;
    }
  }
  toJSON() {
    const obj = {
      message: this.message,
      statusCode: sanitizeStatusCode(this.statusCode, 500)
    };
    if (this.statusMessage) {
      obj.statusMessage = sanitizeStatusMessage(this.statusMessage);
    }
    if (this.data !== void 0) {
      obj.data = this.data;
    }
    return obj;
  }
}
__publicField$2(H3Error, "__h3_error__", true);
function createError$1(input) {
  if (typeof input === "string") {
    return new H3Error(input);
  }
  if (isError(input)) {
    return input;
  }
  const err = new H3Error(input.message ?? input.statusMessage ?? "", {
    cause: input.cause || input
  });
  if (hasProp(input, "stack")) {
    try {
      Object.defineProperty(err, "stack", {
        get() {
          return input.stack;
        }
      });
    } catch {
      try {
        err.stack = input.stack;
      } catch {
      }
    }
  }
  if (input.data) {
    err.data = input.data;
  }
  if (input.statusCode) {
    err.statusCode = sanitizeStatusCode(input.statusCode, err.statusCode);
  } else if (input.status) {
    err.statusCode = sanitizeStatusCode(input.status, err.statusCode);
  }
  if (input.statusMessage) {
    err.statusMessage = input.statusMessage;
  } else if (input.statusText) {
    err.statusMessage = input.statusText;
  }
  if (err.statusMessage) {
    const originalMessage = err.statusMessage;
    const sanitizedMessage = sanitizeStatusMessage(err.statusMessage);
    if (sanitizedMessage !== originalMessage) {
      console.warn(
        "[h3] Please prefer using `message` for longer error messages instead of `statusMessage`. In the future, `statusMessage` will be sanitized by default."
      );
    }
  }
  if (input.fatal !== void 0) {
    err.fatal = input.fatal;
  }
  if (input.unhandled !== void 0) {
    err.unhandled = input.unhandled;
  }
  return err;
}
function sendError(event, error, debug) {
  if (event.handled) {
    return;
  }
  const h3Error = isError(error) ? error : createError$1(error);
  const responseBody = {
    statusCode: h3Error.statusCode,
    statusMessage: h3Error.statusMessage,
    stack: [],
    data: h3Error.data
  };
  if (debug) {
    responseBody.stack = (h3Error.stack || "").split("\n").map((l) => l.trim());
  }
  if (event.handled) {
    return;
  }
  const _code = Number.parseInt(h3Error.statusCode);
  setResponseStatus(event, _code, h3Error.statusMessage);
  event.node.res.setHeader("content-type", MIMES.json);
  event.node.res.end(JSON.stringify(responseBody, void 0, 2));
}
function isError(input) {
  return input?.constructor?.__h3_error__ === true;
}

function parse(multipartBodyBuffer, boundary) {
  let lastline = "";
  let state = 0 /* INIT */;
  let buffer = [];
  const allParts = [];
  let currentPartHeaders = [];
  for (let i = 0; i < multipartBodyBuffer.length; i++) {
    const prevByte = i > 0 ? multipartBodyBuffer[i - 1] : null;
    const currByte = multipartBodyBuffer[i];
    const newLineChar = currByte === 10 || currByte === 13;
    if (!newLineChar) {
      lastline += String.fromCodePoint(currByte);
    }
    const newLineDetected = currByte === 10 && prevByte === 13;
    if (0 /* INIT */ === state && newLineDetected) {
      if ("--" + boundary === lastline) {
        state = 1 /* READING_HEADERS */;
      }
      lastline = "";
    } else if (1 /* READING_HEADERS */ === state && newLineDetected) {
      if (lastline.length > 0) {
        const i2 = lastline.indexOf(":");
        if (i2 > 0) {
          const name = lastline.slice(0, i2).toLowerCase();
          const value = lastline.slice(i2 + 1).trim();
          currentPartHeaders.push([name, value]);
        }
      } else {
        state = 2 /* READING_DATA */;
        buffer = [];
      }
      lastline = "";
    } else if (2 /* READING_DATA */ === state) {
      if (lastline.length > boundary.length + 4) {
        lastline = "";
      }
      if ("--" + boundary === lastline) {
        const j = buffer.length - lastline.length;
        const part = buffer.slice(0, j - 1);
        allParts.push(process$1(part, currentPartHeaders));
        buffer = [];
        currentPartHeaders = [];
        lastline = "";
        state = 3 /* READING_PART_SEPARATOR */;
      } else {
        buffer.push(currByte);
      }
      if (newLineDetected) {
        lastline = "";
      }
    } else if (3 /* READING_PART_SEPARATOR */ === state && newLineDetected) {
      state = 1 /* READING_HEADERS */;
    }
  }
  return allParts;
}
function process$1(data, headers) {
  const dataObj = {};
  const contentDispositionHeader = headers.find((h) => h[0] === "content-disposition")?.[1] || "";
  for (const i of contentDispositionHeader.split(";")) {
    const s = i.split("=");
    if (s.length !== 2) {
      continue;
    }
    const key = (s[0] || "").trim();
    if (key === "name" || key === "filename") {
      const _value = (s[1] || "").trim().replace(/"/g, "");
      dataObj[key] = Buffer.from(_value, "latin1").toString("utf8");
    }
  }
  const contentType = headers.find((h) => h[0] === "content-type")?.[1] || "";
  if (contentType) {
    dataObj.type = contentType;
  }
  dataObj.data = Buffer.from(data);
  return dataObj;
}

function getQuery(event) {
  return getQuery$1(event.path || "");
}
function isMethod(event, expected, allowHead) {
  if (typeof expected === "string") {
    if (event.method === expected) {
      return true;
    }
  } else if (expected.includes(event.method)) {
    return true;
  }
  return false;
}
function assertMethod(event, expected, allowHead) {
  if (!isMethod(event, expected)) {
    throw createError$1({
      statusCode: 405,
      statusMessage: "HTTP method is not allowed."
    });
  }
}
function getRequestHeaders(event) {
  const _headers = {};
  for (const key in event.node.req.headers) {
    const val = event.node.req.headers[key];
    _headers[key] = Array.isArray(val) ? val.filter(Boolean).join(", ") : val;
  }
  return _headers;
}
function getRequestHeader(event, name) {
  const headers = getRequestHeaders(event);
  const value = headers[name.toLowerCase()];
  return value;
}
function getRequestHost(event, opts = {}) {
  if (opts.xForwardedHost) {
    const xForwardedHost = event.node.req.headers["x-forwarded-host"];
    if (xForwardedHost) {
      return xForwardedHost;
    }
  }
  return event.node.req.headers.host || "localhost";
}
function getRequestProtocol(event, opts = {}) {
  if (opts.xForwardedProto !== false && event.node.req.headers["x-forwarded-proto"] === "https") {
    return "https";
  }
  return event.node.req.connection?.encrypted ? "https" : "http";
}
function getRequestURL(event, opts = {}) {
  const host = getRequestHost(event, opts);
  const protocol = getRequestProtocol(event, opts);
  const path = (event.node.req.originalUrl || event.path).replace(
    /^[/\\]+/g,
    "/"
  );
  return new URL(path, `${protocol}://${host}`);
}

const RawBodySymbol = Symbol.for("h3RawBody");
const ParsedBodySymbol = Symbol.for("h3ParsedBody");
const PayloadMethods$1 = ["PATCH", "POST", "PUT", "DELETE"];
function readRawBody(event, encoding = "utf8") {
  assertMethod(event, PayloadMethods$1);
  const _rawBody = event._requestBody || event.web?.request?.body || event.node.req[RawBodySymbol] || event.node.req.rawBody || event.node.req.body;
  if (_rawBody) {
    const promise2 = Promise.resolve(_rawBody).then((_resolved) => {
      if (Buffer.isBuffer(_resolved)) {
        return _resolved;
      }
      if (typeof _resolved.pipeTo === "function") {
        return new Promise((resolve, reject) => {
          const chunks = [];
          _resolved.pipeTo(
            new WritableStream({
              write(chunk) {
                chunks.push(chunk);
              },
              close() {
                resolve(Buffer.concat(chunks));
              },
              abort(reason) {
                reject(reason);
              }
            })
          ).catch(reject);
        });
      } else if (typeof _resolved.pipe === "function") {
        return new Promise((resolve, reject) => {
          const chunks = [];
          _resolved.on("data", (chunk) => {
            chunks.push(chunk);
          }).on("end", () => {
            resolve(Buffer.concat(chunks));
          }).on("error", reject);
        });
      }
      if (_resolved.constructor === Object) {
        return Buffer.from(JSON.stringify(_resolved));
      }
      if (_resolved instanceof URLSearchParams) {
        return Buffer.from(_resolved.toString());
      }
      return Buffer.from(_resolved);
    });
    return encoding ? promise2.then((buff) => buff.toString(encoding)) : promise2;
  }
  if (!Number.parseInt(event.node.req.headers["content-length"] || "") && !String(event.node.req.headers["transfer-encoding"] ?? "").split(",").map((e) => e.trim()).filter(Boolean).includes("chunked")) {
    return Promise.resolve(void 0);
  }
  const promise = event.node.req[RawBodySymbol] = new Promise(
    (resolve, reject) => {
      const bodyData = [];
      event.node.req.on("error", (err) => {
        reject(err);
      }).on("data", (chunk) => {
        bodyData.push(chunk);
      }).on("end", () => {
        resolve(Buffer.concat(bodyData));
      });
    }
  );
  const result = encoding ? promise.then((buff) => buff.toString(encoding)) : promise;
  return result;
}
async function readBody(event, options = {}) {
  const request = event.node.req;
  if (hasProp(request, ParsedBodySymbol)) {
    return request[ParsedBodySymbol];
  }
  const contentType = request.headers["content-type"] || "";
  const body = await readRawBody(event);
  let parsed;
  if (contentType === "application/json") {
    parsed = _parseJSON(body, options.strict ?? true);
  } else if (contentType.startsWith("application/x-www-form-urlencoded")) {
    parsed = _parseURLEncodedBody(body);
  } else if (contentType.startsWith("text/")) {
    parsed = body;
  } else {
    parsed = _parseJSON(body, options.strict ?? false);
  }
  request[ParsedBodySymbol] = parsed;
  return parsed;
}
async function readMultipartFormData(event) {
  const contentType = getRequestHeader(event, "content-type");
  if (!contentType || !contentType.startsWith("multipart/form-data")) {
    return;
  }
  const boundary = contentType.match(/boundary=([^;]*)(;|$)/i)?.[1];
  if (!boundary) {
    return;
  }
  const body = await readRawBody(event, false);
  if (!body) {
    return;
  }
  return parse(body, boundary);
}
function getRequestWebStream(event) {
  if (!PayloadMethods$1.includes(event.method)) {
    return;
  }
  const bodyStream = event.web?.request?.body || event._requestBody;
  if (bodyStream) {
    return bodyStream;
  }
  const _hasRawBody = RawBodySymbol in event.node.req || "rawBody" in event.node.req || "body" in event.node.req || "__unenv__" in event.node.req;
  if (_hasRawBody) {
    return new ReadableStream({
      async start(controller) {
        const _rawBody = await readRawBody(event, false);
        if (_rawBody) {
          controller.enqueue(_rawBody);
        }
        controller.close();
      }
    });
  }
  return new ReadableStream({
    start: (controller) => {
      event.node.req.on("data", (chunk) => {
        controller.enqueue(chunk);
      });
      event.node.req.on("end", () => {
        controller.close();
      });
      event.node.req.on("error", (err) => {
        controller.error(err);
      });
    }
  });
}
function _parseJSON(body = "", strict) {
  if (!body) {
    return void 0;
  }
  try {
    return destr(body, { strict });
  } catch {
    throw createError$1({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Invalid JSON body"
    });
  }
}
function _parseURLEncodedBody(body) {
  const form = new URLSearchParams(body);
  const parsedForm = /* @__PURE__ */ Object.create(null);
  for (const [key, value] of form.entries()) {
    if (hasProp(parsedForm, key)) {
      if (!Array.isArray(parsedForm[key])) {
        parsedForm[key] = [parsedForm[key]];
      }
      parsedForm[key].push(value);
    } else {
      parsedForm[key] = value;
    }
  }
  return parsedForm;
}

function handleCacheHeaders(event, opts) {
  const cacheControls = ["public", ...opts.cacheControls || []];
  let cacheMatched = false;
  if (opts.maxAge !== void 0) {
    cacheControls.push(`max-age=${+opts.maxAge}`, `s-maxage=${+opts.maxAge}`);
  }
  if (opts.modifiedTime) {
    const modifiedTime = new Date(opts.modifiedTime);
    const ifModifiedSince = event.node.req.headers["if-modified-since"];
    event.node.res.setHeader("last-modified", modifiedTime.toUTCString());
    if (ifModifiedSince && new Date(ifModifiedSince) >= opts.modifiedTime) {
      cacheMatched = true;
    }
  }
  if (opts.etag) {
    event.node.res.setHeader("etag", opts.etag);
    const ifNonMatch = event.node.req.headers["if-none-match"];
    if (ifNonMatch === opts.etag) {
      cacheMatched = true;
    }
  }
  event.node.res.setHeader("cache-control", cacheControls.join(", "));
  if (cacheMatched) {
    event.node.res.statusCode = 304;
    if (!event.handled) {
      event.node.res.end();
    }
    return true;
  }
  return false;
}

const MIMES = {
  html: "text/html",
  json: "application/json"
};

const DISALLOWED_STATUS_CHARS = /[^\u0009\u0020-\u007E]/g;
function sanitizeStatusMessage(statusMessage = "") {
  return statusMessage.replace(DISALLOWED_STATUS_CHARS, "");
}
function sanitizeStatusCode(statusCode, defaultStatusCode = 200) {
  if (!statusCode) {
    return defaultStatusCode;
  }
  if (typeof statusCode === "string") {
    statusCode = Number.parseInt(statusCode, 10);
  }
  if (statusCode < 100 || statusCode > 999) {
    return defaultStatusCode;
  }
  return statusCode;
}

function parseCookies(event) {
  return parse$1(event.node.req.headers.cookie || "");
}
function getCookie(event, name) {
  return parseCookies(event)[name];
}
function setCookie(event, name, value, serializeOptions) {
  serializeOptions = { path: "/", ...serializeOptions };
  const cookieStr = serialize(name, value, serializeOptions);
  let setCookies = event.node.res.getHeader("set-cookie");
  if (!Array.isArray(setCookies)) {
    setCookies = [setCookies];
  }
  const _optionsHash = objectHash(serializeOptions);
  setCookies = setCookies.filter((cookieValue) => {
    return cookieValue && _optionsHash !== objectHash(parse$1(cookieValue));
  });
  event.node.res.setHeader("set-cookie", [...setCookies, cookieStr]);
}
function deleteCookie(event, name, serializeOptions) {
  setCookie(event, name, "", {
    ...serializeOptions,
    maxAge: 0
  });
}
function splitCookiesString(cookiesString) {
  if (Array.isArray(cookiesString)) {
    return cookiesString.flatMap((c) => splitCookiesString(c));
  }
  if (typeof cookiesString !== "string") {
    return [];
  }
  const cookiesStrings = [];
  let pos = 0;
  let start;
  let ch;
  let lastComma;
  let nextStart;
  let cookiesSeparatorFound;
  const skipWhitespace = () => {
    while (pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos))) {
      pos += 1;
    }
    return pos < cookiesString.length;
  };
  const notSpecialChar = () => {
    ch = cookiesString.charAt(pos);
    return ch !== "=" && ch !== ";" && ch !== ",";
  };
  while (pos < cookiesString.length) {
    start = pos;
    cookiesSeparatorFound = false;
    while (skipWhitespace()) {
      ch = cookiesString.charAt(pos);
      if (ch === ",") {
        lastComma = pos;
        pos += 1;
        skipWhitespace();
        nextStart = pos;
        while (pos < cookiesString.length && notSpecialChar()) {
          pos += 1;
        }
        if (pos < cookiesString.length && cookiesString.charAt(pos) === "=") {
          cookiesSeparatorFound = true;
          pos = nextStart;
          cookiesStrings.push(cookiesString.slice(start, lastComma));
          start = pos;
        } else {
          pos = lastComma + 1;
        }
      } else {
        pos += 1;
      }
    }
    if (!cookiesSeparatorFound || pos >= cookiesString.length) {
      cookiesStrings.push(cookiesString.slice(start));
    }
  }
  return cookiesStrings;
}

const defer = typeof setImmediate === "undefined" ? (fn) => fn() : setImmediate;
function send(event, data, type) {
  if (type) {
    defaultContentType(event, type);
  }
  return new Promise((resolve) => {
    defer(() => {
      if (!event.handled) {
        event.node.res.end(data);
      }
      resolve();
    });
  });
}
function sendNoContent(event, code) {
  if (event.handled) {
    return;
  }
  if (!code && event.node.res.statusCode !== 200) {
    code = event.node.res.statusCode;
  }
  const _code = sanitizeStatusCode(code, 204);
  if (_code === 204) {
    event.node.res.removeHeader("content-length");
  }
  event.node.res.writeHead(_code);
  event.node.res.end();
}
function setResponseStatus(event, code, text) {
  if (code) {
    event.node.res.statusCode = sanitizeStatusCode(
      code,
      event.node.res.statusCode
    );
  }
  if (text) {
    event.node.res.statusMessage = sanitizeStatusMessage(text);
  }
}
function getResponseStatus(event) {
  return event.node.res.statusCode;
}
function getResponseStatusText(event) {
  return event.node.res.statusMessage;
}
function defaultContentType(event, type) {
  if (type && event.node.res.statusCode !== 304 && !event.node.res.getHeader("content-type")) {
    event.node.res.setHeader("content-type", type);
  }
}
function sendRedirect(event, location, code = 302) {
  event.node.res.statusCode = sanitizeStatusCode(
    code,
    event.node.res.statusCode
  );
  event.node.res.setHeader("location", location);
  const encodedLoc = location.replace(/"/g, "%22");
  const html = `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${encodedLoc}"></head></html>`;
  return send(event, html, MIMES.html);
}
function getResponseHeader(event, name) {
  return event.node.res.getHeader(name);
}
function setResponseHeaders(event, headers) {
  for (const [name, value] of Object.entries(headers)) {
    event.node.res.setHeader(
      name,
      value
    );
  }
}
const setHeaders = setResponseHeaders;
function setResponseHeader(event, name, value) {
  event.node.res.setHeader(name, value);
}
function appendResponseHeader(event, name, value) {
  let current = event.node.res.getHeader(name);
  if (!current) {
    event.node.res.setHeader(name, value);
    return;
  }
  if (!Array.isArray(current)) {
    current = [current.toString()];
  }
  event.node.res.setHeader(name, [...current, value]);
}
function removeResponseHeader(event, name) {
  return event.node.res.removeHeader(name);
}
function isStream(data) {
  if (!data || typeof data !== "object") {
    return false;
  }
  if (typeof data.pipe === "function") {
    if (typeof data._read === "function") {
      return true;
    }
    if (typeof data.abort === "function") {
      return true;
    }
  }
  if (typeof data.pipeTo === "function") {
    return true;
  }
  return false;
}
function isWebResponse(data) {
  return typeof Response !== "undefined" && data instanceof Response;
}
function sendStream(event, stream) {
  if (!stream || typeof stream !== "object") {
    throw new Error("[h3] Invalid stream provided.");
  }
  event.node.res._data = stream;
  if (!event.node.res.socket) {
    event._handled = true;
    return Promise.resolve();
  }
  if (hasProp(stream, "pipeTo") && typeof stream.pipeTo === "function") {
    return stream.pipeTo(
      new WritableStream({
        write(chunk) {
          event.node.res.write(chunk);
        }
      })
    ).then(() => {
      event.node.res.end();
    });
  }
  if (hasProp(stream, "pipe") && typeof stream.pipe === "function") {
    return new Promise((resolve, reject) => {
      stream.pipe(event.node.res);
      if (stream.on) {
        stream.on("end", () => {
          event.node.res.end();
          resolve();
        });
        stream.on("error", (error) => {
          reject(error);
        });
      }
      event.node.res.on("close", () => {
        if (stream.abort) {
          stream.abort();
        }
      });
    });
  }
  throw new Error("[h3] Invalid or incompatible stream provided.");
}
function sendWebResponse(event, response) {
  for (const [key, value] of response.headers) {
    if (key === "set-cookie") {
      event.node.res.appendHeader(key, splitCookiesString(value));
    } else {
      event.node.res.setHeader(key, value);
    }
  }
  if (response.status) {
    event.node.res.statusCode = sanitizeStatusCode(
      response.status,
      event.node.res.statusCode
    );
  }
  if (response.statusText) {
    event.node.res.statusMessage = sanitizeStatusMessage(response.statusText);
  }
  if (response.redirected) {
    event.node.res.setHeader("location", response.url);
  }
  if (!response.body) {
    event.node.res.end();
    return;
  }
  return sendStream(event, response.body);
}

const PayloadMethods = /* @__PURE__ */ new Set(["PATCH", "POST", "PUT", "DELETE"]);
const ignoredHeaders = /* @__PURE__ */ new Set([
  "transfer-encoding",
  "connection",
  "keep-alive",
  "upgrade",
  "expect",
  "host",
  "accept"
]);
async function proxyRequest(event, target, opts = {}) {
  let body;
  let duplex;
  if (PayloadMethods.has(event.method)) {
    if (opts.streamRequest) {
      body = getRequestWebStream(event);
      duplex = "half";
    } else {
      body = await readRawBody(event, false).catch(() => void 0);
    }
  }
  const method = opts.fetchOptions?.method || event.method;
  const fetchHeaders = mergeHeaders$1(
    getProxyRequestHeaders(event),
    opts.fetchOptions?.headers,
    opts.headers
  );
  return sendProxy(event, target, {
    ...opts,
    fetchOptions: {
      method,
      body,
      duplex,
      ...opts.fetchOptions,
      headers: fetchHeaders
    }
  });
}
async function sendProxy(event, target, opts = {}) {
  let response;
  try {
    response = await _getFetch(opts.fetch)(target, {
      headers: opts.headers,
      ignoreResponseError: true,
      // make $ofetch.raw transparent
      ...opts.fetchOptions
    });
  } catch (error) {
    throw createError$1({
      status: 502,
      statusMessage: "Bad Gateway",
      cause: error
    });
  }
  event.node.res.statusCode = sanitizeStatusCode(
    response.status,
    event.node.res.statusCode
  );
  event.node.res.statusMessage = sanitizeStatusMessage(response.statusText);
  const cookies = [];
  for (const [key, value] of response.headers.entries()) {
    if (key === "content-encoding") {
      continue;
    }
    if (key === "content-length") {
      continue;
    }
    if (key === "set-cookie") {
      cookies.push(...splitCookiesString(value));
      continue;
    }
    event.node.res.setHeader(key, value);
  }
  if (cookies.length > 0) {
    event.node.res.setHeader(
      "set-cookie",
      cookies.map((cookie) => {
        if (opts.cookieDomainRewrite) {
          cookie = rewriteCookieProperty(
            cookie,
            opts.cookieDomainRewrite,
            "domain"
          );
        }
        if (opts.cookiePathRewrite) {
          cookie = rewriteCookieProperty(
            cookie,
            opts.cookiePathRewrite,
            "path"
          );
        }
        return cookie;
      })
    );
  }
  if (opts.onResponse) {
    await opts.onResponse(event, response);
  }
  if (response._data !== void 0) {
    return response._data;
  }
  if (event.handled) {
    return;
  }
  if (opts.sendStream === false) {
    const data = new Uint8Array(await response.arrayBuffer());
    return event.node.res.end(data);
  }
  if (response.body) {
    for await (const chunk of response.body) {
      event.node.res.write(chunk);
    }
  }
  return event.node.res.end();
}
function getProxyRequestHeaders(event) {
  const headers = /* @__PURE__ */ Object.create(null);
  const reqHeaders = getRequestHeaders(event);
  for (const name in reqHeaders) {
    if (!ignoredHeaders.has(name)) {
      headers[name] = reqHeaders[name];
    }
  }
  return headers;
}
function fetchWithEvent(event, req, init, options) {
  return _getFetch(options?.fetch)(req, {
    ...init,
    context: init?.context || event.context,
    headers: {
      ...getProxyRequestHeaders(event),
      ...init?.headers
    }
  });
}
function _getFetch(_fetch) {
  if (_fetch) {
    return _fetch;
  }
  if (globalThis.fetch) {
    return globalThis.fetch;
  }
  throw new Error(
    "fetch is not available. Try importing `node-fetch-native/polyfill` for Node.js."
  );
}
function rewriteCookieProperty(header, map, property) {
  const _map = typeof map === "string" ? { "*": map } : map;
  return header.replace(
    new RegExp(`(;\\s*${property}=)([^;]+)`, "gi"),
    (match, prefix, previousValue) => {
      let newValue;
      if (previousValue in _map) {
        newValue = _map[previousValue];
      } else if ("*" in _map) {
        newValue = _map["*"];
      } else {
        return match;
      }
      return newValue ? prefix + newValue : "";
    }
  );
}
function mergeHeaders$1(defaults, ...inputs) {
  const _inputs = inputs.filter(Boolean);
  if (_inputs.length === 0) {
    return defaults;
  }
  const merged = new Headers(defaults);
  for (const input of _inputs) {
    for (const [key, value] of Object.entries(input)) {
      if (value !== void 0) {
        merged.set(key, value);
      }
    }
  }
  return merged;
}

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class H3Event {
  constructor(req, res) {
    __publicField(this, "__is_event__", true);
    // Context
    __publicField(this, "node");
    // Node
    __publicField(this, "web");
    // Web
    __publicField(this, "context", {});
    // Shared
    // Request
    __publicField(this, "_method");
    __publicField(this, "_path");
    __publicField(this, "_headers");
    __publicField(this, "_requestBody");
    // Response
    __publicField(this, "_handled", false);
    // Hooks
    __publicField(this, "_onBeforeResponseCalled");
    __publicField(this, "_onAfterResponseCalled");
    this.node = { req, res };
  }
  // --- Request ---
  get method() {
    if (!this._method) {
      this._method = (this.node.req.method || "GET").toUpperCase();
    }
    return this._method;
  }
  get path() {
    return this._path || this.node.req.url || "/";
  }
  get headers() {
    if (!this._headers) {
      this._headers = _normalizeNodeHeaders(this.node.req.headers);
    }
    return this._headers;
  }
  // --- Respoonse ---
  get handled() {
    return this._handled || this.node.res.writableEnded || this.node.res.headersSent;
  }
  respondWith(response) {
    return Promise.resolve(response).then(
      (_response) => sendWebResponse(this, _response)
    );
  }
  // --- Utils ---
  toString() {
    return `[${this.method}] ${this.path}`;
  }
  toJSON() {
    return this.toString();
  }
  // --- Deprecated ---
  /** @deprecated Please use `event.node.req` instead. */
  get req() {
    return this.node.req;
  }
  /** @deprecated Please use `event.node.res` instead. */
  get res() {
    return this.node.res;
  }
}
function isEvent(input) {
  return hasProp(input, "__is_event__");
}
function createEvent(req, res) {
  return new H3Event(req, res);
}
function _normalizeNodeHeaders(nodeHeaders) {
  const headers = new Headers();
  for (const [name, value] of Object.entries(nodeHeaders)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(name, item);
      }
    } else if (value) {
      headers.set(name, value);
    }
  }
  return headers;
}

function defineEventHandler(handler) {
  if (typeof handler === "function") {
    handler.__is_handler__ = true;
    return handler;
  }
  const _hooks = {
    onRequest: _normalizeArray(handler.onRequest),
    onBeforeResponse: _normalizeArray(handler.onBeforeResponse)
  };
  const _handler = (event) => {
    return _callHandler(event, handler.handler, _hooks);
  };
  _handler.__is_handler__ = true;
  _handler.__resolve__ = handler.handler.__resolve__;
  _handler.__websocket__ = handler.websocket;
  return _handler;
}
function _normalizeArray(input) {
  return input ? Array.isArray(input) ? input : [input] : void 0;
}
async function _callHandler(event, handler, hooks) {
  if (hooks.onRequest) {
    for (const hook of hooks.onRequest) {
      await hook(event);
      if (event.handled) {
        return;
      }
    }
  }
  const body = await handler(event);
  const response = { body };
  if (hooks.onBeforeResponse) {
    for (const hook of hooks.onBeforeResponse) {
      await hook(event, response);
    }
  }
  return response.body;
}
const eventHandler = defineEventHandler;
function isEventHandler(input) {
  return hasProp(input, "__is_handler__");
}
function toEventHandler(input, _, _route) {
  if (!isEventHandler(input)) {
    console.warn(
      "[h3] Implicit event handler conversion is deprecated. Use `eventHandler()` or `fromNodeMiddleware()` to define event handlers.",
      _route && _route !== "/" ? `
     Route: ${_route}` : "",
      `
     Handler: ${input}`
    );
  }
  return input;
}
function defineLazyEventHandler(factory) {
  let _promise;
  let _resolved;
  const resolveHandler = () => {
    if (_resolved) {
      return Promise.resolve(_resolved);
    }
    if (!_promise) {
      _promise = Promise.resolve(factory()).then((r) => {
        const handler2 = r.default || r;
        if (typeof handler2 !== "function") {
          throw new TypeError(
            "Invalid lazy handler result. It should be a function:",
            handler2
          );
        }
        _resolved = { handler: toEventHandler(r.default || r) };
        return _resolved;
      });
    }
    return _promise;
  };
  const handler = eventHandler((event) => {
    if (_resolved) {
      return _resolved.handler(event);
    }
    return resolveHandler().then((r) => r.handler(event));
  });
  handler.__resolve__ = resolveHandler;
  return handler;
}
const lazyEventHandler = defineLazyEventHandler;

function createApp(options = {}) {
  const stack = [];
  const handler = createAppEventHandler(stack, options);
  const resolve = createResolver(stack);
  handler.__resolve__ = resolve;
  const getWebsocket = cachedFn(() => websocketOptions(resolve, options));
  const app = {
    // @ts-expect-error
    use: (arg1, arg2, arg3) => use(app, arg1, arg2, arg3),
    resolve,
    handler,
    stack,
    options,
    get websocket() {
      return getWebsocket();
    }
  };
  return app;
}
function use(app, arg1, arg2, arg3) {
  if (Array.isArray(arg1)) {
    for (const i of arg1) {
      use(app, i, arg2, arg3);
    }
  } else if (Array.isArray(arg2)) {
    for (const i of arg2) {
      use(app, arg1, i, arg3);
    }
  } else if (typeof arg1 === "string") {
    app.stack.push(
      normalizeLayer({ ...arg3, route: arg1, handler: arg2 })
    );
  } else if (typeof arg1 === "function") {
    app.stack.push(normalizeLayer({ ...arg2, handler: arg1 }));
  } else {
    app.stack.push(normalizeLayer({ ...arg1 }));
  }
  return app;
}
function createAppEventHandler(stack, options) {
  const spacing = options.debug ? 2 : void 0;
  return eventHandler(async (event) => {
    event.node.req.originalUrl = event.node.req.originalUrl || event.node.req.url || "/";
    const _reqPath = event._path || event.node.req.url || "/";
    let _layerPath;
    if (options.onRequest) {
      await options.onRequest(event);
    }
    for (const layer of stack) {
      if (layer.route.length > 1) {
        if (!_reqPath.startsWith(layer.route)) {
          continue;
        }
        _layerPath = _reqPath.slice(layer.route.length) || "/";
      } else {
        _layerPath = _reqPath;
      }
      if (layer.match && !layer.match(_layerPath, event)) {
        continue;
      }
      event._path = _layerPath;
      event.node.req.url = _layerPath;
      const val = await layer.handler(event);
      const _body = val === void 0 ? void 0 : await val;
      if (_body !== void 0) {
        const _response = { body: _body };
        if (options.onBeforeResponse) {
          event._onBeforeResponseCalled = true;
          await options.onBeforeResponse(event, _response);
        }
        await handleHandlerResponse(event, _response.body, spacing);
        if (options.onAfterResponse) {
          event._onAfterResponseCalled = true;
          await options.onAfterResponse(event, _response);
        }
        return;
      }
      if (event.handled) {
        if (options.onAfterResponse) {
          event._onAfterResponseCalled = true;
          await options.onAfterResponse(event, void 0);
        }
        return;
      }
    }
    if (!event.handled) {
      throw createError$1({
        statusCode: 404,
        statusMessage: `Cannot find any path matching ${event.path || "/"}.`
      });
    }
    if (options.onAfterResponse) {
      event._onAfterResponseCalled = true;
      await options.onAfterResponse(event, void 0);
    }
  });
}
function createResolver(stack) {
  return async (path) => {
    let _layerPath;
    for (const layer of stack) {
      if (layer.route === "/" && !layer.handler.__resolve__) {
        continue;
      }
      if (!path.startsWith(layer.route)) {
        continue;
      }
      _layerPath = path.slice(layer.route.length) || "/";
      if (layer.match && !layer.match(_layerPath, void 0)) {
        continue;
      }
      let res = { route: layer.route, handler: layer.handler };
      if (res.handler.__resolve__) {
        const _res = await res.handler.__resolve__(_layerPath);
        if (!_res) {
          continue;
        }
        res = {
          ...res,
          ..._res,
          route: joinURL(res.route || "/", _res.route || "/")
        };
      }
      return res;
    }
  };
}
function normalizeLayer(input) {
  let handler = input.handler;
  if (handler.handler) {
    handler = handler.handler;
  }
  if (input.lazy) {
    handler = lazyEventHandler(handler);
  } else if (!isEventHandler(handler)) {
    handler = toEventHandler(handler, void 0, input.route);
  }
  return {
    route: withoutTrailingSlash(input.route),
    match: input.match,
    handler
  };
}
function handleHandlerResponse(event, val, jsonSpace) {
  if (val === null) {
    return sendNoContent(event);
  }
  if (val) {
    if (isWebResponse(val)) {
      return sendWebResponse(event, val);
    }
    if (isStream(val)) {
      return sendStream(event, val);
    }
    if (val.buffer) {
      return send(event, val);
    }
    if (val.arrayBuffer && typeof val.arrayBuffer === "function") {
      return val.arrayBuffer().then((arrayBuffer) => {
        return send(event, Buffer.from(arrayBuffer), val.type);
      });
    }
    if (val instanceof Error) {
      throw createError$1(val);
    }
    if (typeof val.end === "function") {
      return true;
    }
  }
  const valType = typeof val;
  if (valType === "string") {
    return send(event, val, MIMES.html);
  }
  if (valType === "object" || valType === "boolean" || valType === "number") {
    return send(event, JSON.stringify(val, void 0, jsonSpace), MIMES.json);
  }
  if (valType === "bigint") {
    return send(event, val.toString(), MIMES.json);
  }
  throw createError$1({
    statusCode: 500,
    statusMessage: `[h3] Cannot send ${valType} as response.`
  });
}
function cachedFn(fn) {
  let cache;
  return () => {
    if (!cache) {
      cache = fn();
    }
    return cache;
  };
}
function websocketOptions(evResolver, appOptions) {
  return {
    ...appOptions.websocket,
    async resolve(info) {
      const url = info.request?.url || info.url || "/";
      const { pathname } = typeof url === "string" ? parseURL(url) : url;
      const resolved = await evResolver(pathname);
      return resolved?.handler?.__websocket__ || {};
    }
  };
}

const RouterMethods = [
  "connect",
  "delete",
  "get",
  "head",
  "options",
  "post",
  "put",
  "trace",
  "patch"
];
function createRouter(opts = {}) {
  const _router = createRouter$1({});
  const routes = {};
  let _matcher;
  const router = {};
  const addRoute = (path, handler, method) => {
    let route = routes[path];
    if (!route) {
      routes[path] = route = { path, handlers: {} };
      _router.insert(path, route);
    }
    if (Array.isArray(method)) {
      for (const m of method) {
        addRoute(path, handler, m);
      }
    } else {
      route.handlers[method] = toEventHandler(handler, void 0, path);
    }
    return router;
  };
  router.use = router.add = (path, handler, method) => addRoute(path, handler, method || "all");
  for (const method of RouterMethods) {
    router[method] = (path, handle) => router.add(path, handle, method);
  }
  const matchHandler = (path = "/", method = "get") => {
    const qIndex = path.indexOf("?");
    if (qIndex !== -1) {
      path = path.slice(0, Math.max(0, qIndex));
    }
    const matched = _router.lookup(path);
    if (!matched || !matched.handlers) {
      return {
        error: createError$1({
          statusCode: 404,
          name: "Not Found",
          statusMessage: `Cannot find any route matching ${path || "/"}.`
        })
      };
    }
    let handler = matched.handlers[method] || matched.handlers.all;
    if (!handler) {
      if (!_matcher) {
        _matcher = toRouteMatcher(_router);
      }
      const _matches = _matcher.matchAll(path).reverse();
      for (const _match of _matches) {
        if (_match.handlers[method]) {
          handler = _match.handlers[method];
          matched.handlers[method] = matched.handlers[method] || handler;
          break;
        }
        if (_match.handlers.all) {
          handler = _match.handlers.all;
          matched.handlers.all = matched.handlers.all || handler;
          break;
        }
      }
    }
    if (!handler) {
      return {
        error: createError$1({
          statusCode: 405,
          name: "Method Not Allowed",
          statusMessage: `Method ${method} is not allowed on this route.`
        })
      };
    }
    return { matched, handler };
  };
  const isPreemptive = opts.preemptive || opts.preemtive;
  router.handler = eventHandler((event) => {
    const match = matchHandler(
      event.path,
      event.method.toLowerCase()
    );
    if ("error" in match) {
      if (isPreemptive) {
        throw match.error;
      } else {
        return;
      }
    }
    event.context.matchedRoute = match.matched;
    const params = match.matched.params || {};
    event.context.params = params;
    return Promise.resolve(match.handler(event)).then((res) => {
      if (res === void 0 && isPreemptive) {
        return null;
      }
      return res;
    });
  });
  router.handler.__resolve__ = async (path) => {
    path = withLeadingSlash(path);
    const match = matchHandler(path);
    if ("error" in match) {
      return;
    }
    let res = {
      route: match.matched.path,
      handler: match.handler
    };
    if (match.handler.__resolve__) {
      const _res = await match.handler.__resolve__(path);
      if (!_res) {
        return;
      }
      res = { ...res, ..._res };
    }
    return res;
  };
  return router;
}
function toNodeListener(app) {
  const toNodeHandle = async function(req, res) {
    const event = createEvent(req, res);
    try {
      await app.handler(event);
    } catch (_error) {
      const error = createError$1(_error);
      if (!isError(_error)) {
        error.unhandled = true;
      }
      setResponseStatus(event, error.statusCode, error.statusMessage);
      if (app.options.onError) {
        await app.options.onError(error, event);
      }
      if (event.handled) {
        return;
      }
      if (error.unhandled || error.fatal) {
        console.error("[h3]", error.fatal ? "[fatal]" : "[unhandled]", error);
      }
      if (app.options.onBeforeResponse && !event._onBeforeResponseCalled) {
        await app.options.onBeforeResponse(event, { body: error });
      }
      await sendError(event, error, !!app.options.debug);
      if (app.options.onAfterResponse && !event._onAfterResponseCalled) {
        await app.options.onAfterResponse(event, { body: error });
      }
    }
  };
  return toNodeHandle;
}

function flatHooks(configHooks, hooks = {}, parentName) {
  for (const key in configHooks) {
    const subHook = configHooks[key];
    const name = parentName ? `${parentName}:${key}` : key;
    if (typeof subHook === "object" && subHook !== null) {
      flatHooks(subHook, hooks, name);
    } else if (typeof subHook === "function") {
      hooks[name] = subHook;
    }
  }
  return hooks;
}
const defaultTask = { run: (function_) => function_() };
const _createTask = () => defaultTask;
const createTask = typeof console.createTask !== "undefined" ? console.createTask : _createTask;
function serialTaskCaller(hooks, args) {
  const name = args.shift();
  const task = createTask(name);
  return hooks.reduce(
    (promise, hookFunction) => promise.then(() => task.run(() => hookFunction(...args))),
    Promise.resolve()
  );
}
function parallelTaskCaller(hooks, args) {
  const name = args.shift();
  const task = createTask(name);
  return Promise.all(hooks.map((hook) => task.run(() => hook(...args))));
}
function callEachWith(callbacks, arg0) {
  for (const callback of [...callbacks]) {
    callback(arg0);
  }
}

class Hookable {
  constructor() {
    this._hooks = {};
    this._before = void 0;
    this._after = void 0;
    this._deprecatedMessages = void 0;
    this._deprecatedHooks = {};
    this.hook = this.hook.bind(this);
    this.callHook = this.callHook.bind(this);
    this.callHookWith = this.callHookWith.bind(this);
  }
  hook(name, function_, options = {}) {
    if (!name || typeof function_ !== "function") {
      return () => {
      };
    }
    const originalName = name;
    let dep;
    while (this._deprecatedHooks[name]) {
      dep = this._deprecatedHooks[name];
      name = dep.to;
    }
    if (dep && !options.allowDeprecated) {
      let message = dep.message;
      if (!message) {
        message = `${originalName} hook has been deprecated` + (dep.to ? `, please use ${dep.to}` : "");
      }
      if (!this._deprecatedMessages) {
        this._deprecatedMessages = /* @__PURE__ */ new Set();
      }
      if (!this._deprecatedMessages.has(message)) {
        console.warn(message);
        this._deprecatedMessages.add(message);
      }
    }
    if (!function_.name) {
      try {
        Object.defineProperty(function_, "name", {
          get: () => "_" + name.replace(/\W+/g, "_") + "_hook_cb",
          configurable: true
        });
      } catch {
      }
    }
    this._hooks[name] = this._hooks[name] || [];
    this._hooks[name].push(function_);
    return () => {
      if (function_) {
        this.removeHook(name, function_);
        function_ = void 0;
      }
    };
  }
  hookOnce(name, function_) {
    let _unreg;
    let _function = (...arguments_) => {
      if (typeof _unreg === "function") {
        _unreg();
      }
      _unreg = void 0;
      _function = void 0;
      return function_(...arguments_);
    };
    _unreg = this.hook(name, _function);
    return _unreg;
  }
  removeHook(name, function_) {
    if (this._hooks[name]) {
      const index = this._hooks[name].indexOf(function_);
      if (index !== -1) {
        this._hooks[name].splice(index, 1);
      }
      if (this._hooks[name].length === 0) {
        delete this._hooks[name];
      }
    }
  }
  deprecateHook(name, deprecated) {
    this._deprecatedHooks[name] = typeof deprecated === "string" ? { to: deprecated } : deprecated;
    const _hooks = this._hooks[name] || [];
    delete this._hooks[name];
    for (const hook of _hooks) {
      this.hook(name, hook);
    }
  }
  deprecateHooks(deprecatedHooks) {
    Object.assign(this._deprecatedHooks, deprecatedHooks);
    for (const name in deprecatedHooks) {
      this.deprecateHook(name, deprecatedHooks[name]);
    }
  }
  addHooks(configHooks) {
    const hooks = flatHooks(configHooks);
    const removeFns = Object.keys(hooks).map(
      (key) => this.hook(key, hooks[key])
    );
    return () => {
      for (const unreg of removeFns.splice(0, removeFns.length)) {
        unreg();
      }
    };
  }
  removeHooks(configHooks) {
    const hooks = flatHooks(configHooks);
    for (const key in hooks) {
      this.removeHook(key, hooks[key]);
    }
  }
  removeAllHooks() {
    for (const key in this._hooks) {
      delete this._hooks[key];
    }
  }
  callHook(name, ...arguments_) {
    arguments_.unshift(name);
    return this.callHookWith(serialTaskCaller, name, ...arguments_);
  }
  callHookParallel(name, ...arguments_) {
    arguments_.unshift(name);
    return this.callHookWith(parallelTaskCaller, name, ...arguments_);
  }
  callHookWith(caller, name, ...arguments_) {
    const event = this._before || this._after ? { name, args: arguments_, context: {} } : void 0;
    if (this._before) {
      callEachWith(this._before, event);
    }
    const result = caller(
      name in this._hooks ? [...this._hooks[name]] : [],
      arguments_
    );
    if (result instanceof Promise) {
      return result.finally(() => {
        if (this._after && event) {
          callEachWith(this._after, event);
        }
      });
    }
    if (this._after && event) {
      callEachWith(this._after, event);
    }
    return result;
  }
  beforeEach(function_) {
    this._before = this._before || [];
    this._before.push(function_);
    return () => {
      if (this._before !== void 0) {
        const index = this._before.indexOf(function_);
        if (index !== -1) {
          this._before.splice(index, 1);
        }
      }
    };
  }
  afterEach(function_) {
    this._after = this._after || [];
    this._after.push(function_);
    return () => {
      if (this._after !== void 0) {
        const index = this._after.indexOf(function_);
        if (index !== -1) {
          this._after.splice(index, 1);
        }
      }
    };
  }
}
function createHooks() {
  return new Hookable();
}

const s=globalThis.Headers,i=globalThis.AbortController,l=globalThis.fetch||(()=>{throw new Error("[node-fetch-native] Failed to fetch: `globalThis.fetch` is not available!")});

class FetchError extends Error {
  constructor(message, opts) {
    super(message, opts);
    this.name = "FetchError";
    if (opts?.cause && !this.cause) {
      this.cause = opts.cause;
    }
  }
}
function createFetchError(ctx) {
  const errorMessage = ctx.error?.message || ctx.error?.toString() || "";
  const method = ctx.request?.method || ctx.options?.method || "GET";
  const url = ctx.request?.url || String(ctx.request) || "/";
  const requestStr = `[${method}] ${JSON.stringify(url)}`;
  const statusStr = ctx.response ? `${ctx.response.status} ${ctx.response.statusText}` : "<no response>";
  const message = `${requestStr}: ${statusStr}${errorMessage ? ` ${errorMessage}` : ""}`;
  const fetchError = new FetchError(
    message,
    ctx.error ? { cause: ctx.error } : void 0
  );
  for (const key of ["request", "options", "response"]) {
    Object.defineProperty(fetchError, key, {
      get() {
        return ctx[key];
      }
    });
  }
  for (const [key, refKey] of [
    ["data", "_data"],
    ["status", "status"],
    ["statusCode", "status"],
    ["statusText", "statusText"],
    ["statusMessage", "statusText"]
  ]) {
    Object.defineProperty(fetchError, key, {
      get() {
        return ctx.response && ctx.response[refKey];
      }
    });
  }
  return fetchError;
}

const payloadMethods = new Set(
  Object.freeze(["PATCH", "POST", "PUT", "DELETE"])
);
function isPayloadMethod(method = "GET") {
  return payloadMethods.has(method.toUpperCase());
}
function isJSONSerializable(value) {
  if (value === void 0) {
    return false;
  }
  const t = typeof value;
  if (t === "string" || t === "number" || t === "boolean" || t === null) {
    return true;
  }
  if (t !== "object") {
    return false;
  }
  if (Array.isArray(value)) {
    return true;
  }
  if (value.buffer) {
    return false;
  }
  return value.constructor && value.constructor.name === "Object" || typeof value.toJSON === "function";
}
const textTypes = /* @__PURE__ */ new Set([
  "image/svg",
  "application/xml",
  "application/xhtml",
  "application/html"
]);
const JSON_RE = /^application\/(?:[\w!#$%&*.^`~-]*\+)?json(;.+)?$/i;
function detectResponseType(_contentType = "") {
  if (!_contentType) {
    return "json";
  }
  const contentType = _contentType.split(";").shift() || "";
  if (JSON_RE.test(contentType)) {
    return "json";
  }
  if (textTypes.has(contentType) || contentType.startsWith("text/")) {
    return "text";
  }
  return "blob";
}
function resolveFetchOptions(request, input, defaults, Headers) {
  const headers = mergeHeaders(
    input?.headers ?? request?.headers,
    defaults?.headers,
    Headers
  );
  let query;
  if (defaults?.query || defaults?.params || input?.params || input?.query) {
    query = {
      ...defaults?.params,
      ...defaults?.query,
      ...input?.params,
      ...input?.query
    };
  }
  return {
    ...defaults,
    ...input,
    query,
    params: query,
    headers
  };
}
function mergeHeaders(input, defaults, Headers) {
  if (!defaults) {
    return new Headers(input);
  }
  const headers = new Headers(defaults);
  if (input) {
    for (const [key, value] of Symbol.iterator in input || Array.isArray(input) ? input : new Headers(input)) {
      headers.set(key, value);
    }
  }
  return headers;
}
async function callHooks(context, hooks) {
  if (hooks) {
    if (Array.isArray(hooks)) {
      for (const hook of hooks) {
        await hook(context);
      }
    } else {
      await hooks(context);
    }
  }
}

const retryStatusCodes = /* @__PURE__ */ new Set([
  408,
  // Request Timeout
  409,
  // Conflict
  425,
  // Too Early (Experimental)
  429,
  // Too Many Requests
  500,
  // Internal Server Error
  502,
  // Bad Gateway
  503,
  // Service Unavailable
  504
  // Gateway Timeout
]);
const nullBodyResponses$1 = /* @__PURE__ */ new Set([101, 204, 205, 304]);
function createFetch$1(globalOptions = {}) {
  const {
    fetch = globalThis.fetch,
    Headers = globalThis.Headers,
    AbortController = globalThis.AbortController
  } = globalOptions;
  async function onError(context) {
    const isAbort = context.error && context.error.name === "AbortError" && !context.options.timeout || false;
    if (context.options.retry !== false && !isAbort) {
      let retries;
      if (typeof context.options.retry === "number") {
        retries = context.options.retry;
      } else {
        retries = isPayloadMethod(context.options.method) ? 0 : 1;
      }
      const responseCode = context.response && context.response.status || 500;
      if (retries > 0 && (Array.isArray(context.options.retryStatusCodes) ? context.options.retryStatusCodes.includes(responseCode) : retryStatusCodes.has(responseCode))) {
        const retryDelay = typeof context.options.retryDelay === "function" ? context.options.retryDelay(context) : context.options.retryDelay || 0;
        if (retryDelay > 0) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
        return $fetchRaw(context.request, {
          ...context.options,
          retry: retries - 1
        });
      }
    }
    const error = createFetchError(context);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(error, $fetchRaw);
    }
    throw error;
  }
  const $fetchRaw = async function $fetchRaw2(_request, _options = {}) {
    const context = {
      request: _request,
      options: resolveFetchOptions(
        _request,
        _options,
        globalOptions.defaults,
        Headers
      ),
      response: void 0,
      error: void 0
    };
    if (context.options.method) {
      context.options.method = context.options.method.toUpperCase();
    }
    if (context.options.onRequest) {
      await callHooks(context, context.options.onRequest);
    }
    if (typeof context.request === "string") {
      if (context.options.baseURL) {
        context.request = withBase(context.request, context.options.baseURL);
      }
      if (context.options.query) {
        context.request = withQuery(context.request, context.options.query);
        delete context.options.query;
      }
      if ("query" in context.options) {
        delete context.options.query;
      }
      if ("params" in context.options) {
        delete context.options.params;
      }
    }
    if (context.options.body && isPayloadMethod(context.options.method)) {
      if (isJSONSerializable(context.options.body)) {
        context.options.body = typeof context.options.body === "string" ? context.options.body : JSON.stringify(context.options.body);
        context.options.headers = new Headers(context.options.headers || {});
        if (!context.options.headers.has("content-type")) {
          context.options.headers.set("content-type", "application/json");
        }
        if (!context.options.headers.has("accept")) {
          context.options.headers.set("accept", "application/json");
        }
      } else if (
        // ReadableStream Body
        "pipeTo" in context.options.body && typeof context.options.body.pipeTo === "function" || // Node.js Stream Body
        typeof context.options.body.pipe === "function"
      ) {
        if (!("duplex" in context.options)) {
          context.options.duplex = "half";
        }
      }
    }
    let abortTimeout;
    if (!context.options.signal && context.options.timeout) {
      const controller = new AbortController();
      abortTimeout = setTimeout(() => {
        const error = new Error(
          "[TimeoutError]: The operation was aborted due to timeout"
        );
        error.name = "TimeoutError";
        error.code = 23;
        controller.abort(error);
      }, context.options.timeout);
      context.options.signal = controller.signal;
    }
    try {
      context.response = await fetch(
        context.request,
        context.options
      );
    } catch (error) {
      context.error = error;
      if (context.options.onRequestError) {
        await callHooks(
          context,
          context.options.onRequestError
        );
      }
      return await onError(context);
    } finally {
      if (abortTimeout) {
        clearTimeout(abortTimeout);
      }
    }
    const hasBody = (context.response.body || // https://github.com/unjs/ofetch/issues/324
    // https://github.com/unjs/ofetch/issues/294
    // https://github.com/JakeChampion/fetch/issues/1454
    context.response._bodyInit) && !nullBodyResponses$1.has(context.response.status) && context.options.method !== "HEAD";
    if (hasBody) {
      const responseType = (context.options.parseResponse ? "json" : context.options.responseType) || detectResponseType(context.response.headers.get("content-type") || "");
      switch (responseType) {
        case "json": {
          const data = await context.response.text();
          const parseFunction = context.options.parseResponse || destr;
          context.response._data = parseFunction(data);
          break;
        }
        case "stream": {
          context.response._data = context.response.body || context.response._bodyInit;
          break;
        }
        default: {
          context.response._data = await context.response[responseType]();
        }
      }
    }
    if (context.options.onResponse) {
      await callHooks(
        context,
        context.options.onResponse
      );
    }
    if (!context.options.ignoreResponseError && context.response.status >= 400 && context.response.status < 600) {
      if (context.options.onResponseError) {
        await callHooks(
          context,
          context.options.onResponseError
        );
      }
      return await onError(context);
    }
    return context.response;
  };
  const $fetch = async function $fetch2(request, options) {
    const r = await $fetchRaw(request, options);
    return r._data;
  };
  $fetch.raw = $fetchRaw;
  $fetch.native = (...args) => fetch(...args);
  $fetch.create = (defaultOptions = {}, customGlobalOptions = {}) => createFetch$1({
    ...globalOptions,
    ...customGlobalOptions,
    defaults: {
      ...globalOptions.defaults,
      ...customGlobalOptions.defaults,
      ...defaultOptions
    }
  });
  return $fetch;
}

function createNodeFetch() {
  const useKeepAlive = JSON.parse(process.env.FETCH_KEEP_ALIVE || "false");
  if (!useKeepAlive) {
    return l;
  }
  const agentOptions = { keepAlive: true };
  const httpAgent = new http.Agent(agentOptions);
  const httpsAgent = new https.Agent(agentOptions);
  const nodeFetchOptions = {
    agent(parsedURL) {
      return parsedURL.protocol === "http:" ? httpAgent : httpsAgent;
    }
  };
  return function nodeFetchWithKeepAlive(input, init) {
    return l(input, { ...nodeFetchOptions, ...init });
  };
}
const fetch = globalThis.fetch ? (...args) => globalThis.fetch(...args) : createNodeFetch();
const Headers$1 = globalThis.Headers || s;
const AbortController = globalThis.AbortController || i;
const ofetch = createFetch$1({ fetch, Headers: Headers$1, AbortController });
const $fetch = ofetch;

const nullBodyResponses = /* @__PURE__ */ new Set([101, 204, 205, 304]);
function createCall(handle) {
  return function callHandle(context) {
    const req = new IncomingMessage();
    const res = new ServerResponse(req);
    req.url = context.url || "/";
    req.method = context.method || "GET";
    req.headers = {};
    if (context.headers) {
      const headerEntries = typeof context.headers.entries === "function" ? context.headers.entries() : Object.entries(context.headers);
      for (const [name, value] of headerEntries) {
        if (!value) {
          continue;
        }
        req.headers[name.toLowerCase()] = value;
      }
    }
    req.headers.host = req.headers.host || context.host || "localhost";
    req.connection.encrypted = // @ts-ignore
    req.connection.encrypted || context.protocol === "https";
    req.body = context.body || null;
    req.__unenv__ = context.context;
    return handle(req, res).then(() => {
      let body = res._data;
      if (nullBodyResponses.has(res.statusCode) || req.method.toUpperCase() === "HEAD") {
        body = null;
        delete res._headers["content-length"];
      }
      const r = {
        body,
        headers: res._headers,
        status: res.statusCode,
        statusText: res.statusMessage
      };
      req.destroy();
      res.destroy();
      return r;
    });
  };
}

function createFetch(call, _fetch = global.fetch) {
  return async function ufetch(input, init) {
    const url = input.toString();
    if (!url.startsWith("/")) {
      return _fetch(url, init);
    }
    try {
      const r = await call({ url, ...init });
      return new Response(r.body, {
        status: r.status,
        statusText: r.statusText,
        headers: Object.fromEntries(
          Object.entries(r.headers).map(([name, value]) => [
            name,
            Array.isArray(value) ? value.join(",") : String(value) || ""
          ])
        )
      });
    } catch (error) {
      return new Response(error.toString(), {
        status: Number.parseInt(error.statusCode || error.code) || 500,
        statusText: error.statusText
      });
    }
  };
}

function hasReqHeader(event, name, includes) {
  const value = getRequestHeader(event, name);
  return value && typeof value === "string" && value.toLowerCase().includes(includes);
}
function isJsonRequest(event) {
  if (hasReqHeader(event, "accept", "text/html")) {
    return false;
  }
  return hasReqHeader(event, "accept", "application/json") || hasReqHeader(event, "user-agent", "curl/") || hasReqHeader(event, "user-agent", "httpie/") || hasReqHeader(event, "sec-fetch-mode", "cors") || event.path.startsWith("/api/") || event.path.endsWith(".json");
}
function normalizeError(error, isDev) {
  const cwd = typeof process.cwd === "function" ? process.cwd() : "/";
  const stack = (error.unhandled || error.fatal) ? [] : (error.stack || "").split("\n").splice(1).filter((line) => line.includes("at ")).map((line) => {
    const text = line.replace(cwd + "/", "./").replace("webpack:/", "").replace("file://", "").trim();
    return {
      text,
      internal: line.includes("node_modules") && !line.includes(".cache") || line.includes("internal") || line.includes("new Promise")
    };
  });
  const statusCode = error.statusCode || 500;
  const statusMessage = error.statusMessage ?? (statusCode === 404 ? "Not Found" : "");
  const message = error.unhandled ? "internal server error" : error.message || error.toString();
  return {
    stack,
    statusCode,
    statusMessage,
    message
  };
}
function _captureError(error, type) {
  console.error(`[nitro] [${type}]`, error);
  useNitroApp().captureError(error, { tags: [type] });
}
function trapUnhandledNodeErrors() {
  process.on(
    "unhandledRejection",
    (error) => _captureError(error, "unhandledRejection")
  );
  process.on(
    "uncaughtException",
    (error) => _captureError(error, "uncaughtException")
  );
}
function joinHeaders(value) {
  return Array.isArray(value) ? value.join(", ") : String(value);
}
function normalizeFetchResponse(response) {
  if (!response.headers.has("set-cookie")) {
    return response;
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: normalizeCookieHeaders(response.headers)
  });
}
function normalizeCookieHeader(header = "") {
  return splitCookiesString(joinHeaders(header));
}
function normalizeCookieHeaders(headers) {
  const outgoingHeaders = new Headers();
  for (const [name, header] of headers) {
    if (name === "set-cookie") {
      for (const cookie of normalizeCookieHeader(header)) {
        outgoingHeaders.append("set-cookie", cookie);
      }
    } else {
      outgoingHeaders.set(name, joinHeaders(header));
    }
  }
  return outgoingHeaders;
}

const errorHandler = (async function errorhandler(error, event) {
  const { stack, statusCode, statusMessage, message } = normalizeError(error);
  const errorObject = {
    url: event.path,
    statusCode,
    statusMessage,
    message,
    stack: "",
    // TODO: check and validate error.data for serialisation into query
    data: error.data
  };
  if (error.unhandled || error.fatal) {
    const tags = [
      "[nuxt]",
      "[request error]",
      error.unhandled && "[unhandled]",
      error.fatal && "[fatal]",
      Number(errorObject.statusCode) !== 200 && `[${errorObject.statusCode}]`
    ].filter(Boolean).join(" ");
    console.error(tags, (error.message || error.toString() || "internal server error") + "\n" + stack.map((l) => "  " + l.text).join("  \n"));
  }
  if (event.handled) {
    return;
  }
  setResponseStatus(event, errorObject.statusCode !== 200 && errorObject.statusCode || 500, errorObject.statusMessage);
  if (isJsonRequest(event)) {
    setResponseHeader(event, "Content-Type", "application/json");
    return send(event, JSON.stringify(errorObject));
  }
  const reqHeaders = getRequestHeaders(event);
  const isRenderingError = event.path.startsWith("/__nuxt_error") || !!reqHeaders["x-nuxt-error"];
  const res = isRenderingError ? null : await useNitroApp().localFetch(
    withQuery(joinURL(useRuntimeConfig(event).app.baseURL, "/__nuxt_error"), errorObject),
    {
      headers: { ...reqHeaders, "x-nuxt-error": "true" },
      redirect: "manual"
    }
  ).catch(() => null);
  if (!res) {
    const { template } = await import('../_/error-500.mjs');
    if (event.handled) {
      return;
    }
    setResponseHeader(event, "Content-Type", "text/html;charset=UTF-8");
    return send(event, template(errorObject));
  }
  const html = await res.text();
  if (event.handled) {
    return;
  }
  for (const [header, value] of res.headers.entries()) {
    setResponseHeader(event, header, value);
  }
  setResponseStatus(event, res.status && res.status !== 200 ? res.status : void 0, res.statusText);
  return send(event, html);
});

const plugins = [
  
];

const assets$1 = {
  "/favicon.ico": {
    "type": "image/vnd.microsoft.icon",
    "etag": "\"10be-n8egyE9tcb7sKGr/pYCaQ4uWqxI\"",
    "mtime": "2025-02-04T06:49:50.827Z",
    "size": 4286,
    "path": "../public/favicon.ico"
  },
  "/robots.txt": {
    "type": "text/plain; charset=utf-8",
    "etag": "\"1-rcg7GeeTSRscbqD9i0bNnzLlkvw\"",
    "mtime": "2025-02-04T06:49:50.827Z",
    "size": 1,
    "path": "../public/robots.txt"
  },
  "/_nuxt/-Y7sLU6M.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"14a8-Yitkj9N8xUPCV4me8jfuCbQ9SkE\"",
    "mtime": "2025-02-04T06:49:50.778Z",
    "size": 5288,
    "path": "../public/_nuxt/-Y7sLU6M.js"
  },
  "/_nuxt/0cvrggvQ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"efc-rJI3FM4KVma04TQa/TVKqWTGkFc\"",
    "mtime": "2025-02-04T06:49:50.768Z",
    "size": 3836,
    "path": "../public/_nuxt/0cvrggvQ.js"
  },
  "/_nuxt/25W9uPmb.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2f0e-s0SnIjkaMLmzWyoV0ImrAXt7Y1g\"",
    "mtime": "2025-02-04T06:49:50.768Z",
    "size": 12046,
    "path": "../public/_nuxt/25W9uPmb.js"
  },
  "/_nuxt/2FA3A7nw.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"ac8d-bq3TwnzbafMFDuAXSau0gOhpRUE\"",
    "mtime": "2025-02-04T06:49:50.768Z",
    "size": 44173,
    "path": "../public/_nuxt/2FA3A7nw.js"
  },
  "/_nuxt/4Ik7cdeQ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"19ff-d6ynD3zNQz9bTQmZKuIswpuPEoU\"",
    "mtime": "2025-02-04T06:49:50.768Z",
    "size": 6655,
    "path": "../public/_nuxt/4Ik7cdeQ.js"
  },
  "/_nuxt/5Rap-vPy.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"681-j8rGZtox85UZWKM+JE7/0Rrh3UA\"",
    "mtime": "2025-02-04T06:49:50.769Z",
    "size": 1665,
    "path": "../public/_nuxt/5Rap-vPy.js"
  },
  "/_nuxt/6FYcDZls.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"cf-4CEVx3y5HgDj1O631qxMevuVKMw\"",
    "mtime": "2025-02-04T06:49:50.768Z",
    "size": 207,
    "path": "../public/_nuxt/6FYcDZls.js"
  },
  "/_nuxt/9_-bLW4_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3ff2-ZtyGPu2p413ZN3Y/t1gYpVw1Mpg\"",
    "mtime": "2025-02-04T06:49:50.769Z",
    "size": 16370,
    "path": "../public/_nuxt/9_-bLW4_.js"
  },
  "/_nuxt/B03wrqEc.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"789-Q1rHnR5vqUT5G3Wr3x9KXLNulkM\"",
    "mtime": "2025-02-04T06:49:50.769Z",
    "size": 1929,
    "path": "../public/_nuxt/B03wrqEc.js"
  },
  "/_nuxt/B5zXfXm9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"a58-3IZ6RqicFk7B5svb/zCOxHcgXzk\"",
    "mtime": "2025-02-04T06:49:50.769Z",
    "size": 2648,
    "path": "../public/_nuxt/B5zXfXm9.js"
  },
  "/_nuxt/B9Xyijhd.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1ea9-2VcUEOUz8T0vpibwI7mpeZvUzVA\"",
    "mtime": "2025-02-04T06:49:50.769Z",
    "size": 7849,
    "path": "../public/_nuxt/B9Xyijhd.js"
  },
  "/_nuxt/BC30jlDP.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"16f4-w3m/E3yWpdxkerR2ip7yoKn+xoo\"",
    "mtime": "2025-02-04T06:49:50.769Z",
    "size": 5876,
    "path": "../public/_nuxt/BC30jlDP.js"
  },
  "/_nuxt/BFG1Mk7z.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"97f-hKpzMDxwfN8HiMW5IW0nfLCgYuw\"",
    "mtime": "2025-02-04T06:49:50.769Z",
    "size": 2431,
    "path": "../public/_nuxt/BFG1Mk7z.js"
  },
  "/_nuxt/BKlk5iyT.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1fa6-0hzSfuGSBvnY/exsOChmzKTbIcg\"",
    "mtime": "2025-02-04T06:49:50.769Z",
    "size": 8102,
    "path": "../public/_nuxt/BKlk5iyT.js"
  },
  "/_nuxt/BSLRm2uL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2357-uvhTrY+LJQic7JMCil8N91aoCB4\"",
    "mtime": "2025-02-04T06:49:50.769Z",
    "size": 9047,
    "path": "../public/_nuxt/BSLRm2uL.js"
  },
  "/_nuxt/BSkB5QuD.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"e65-VWmvRcrrl3PagVc7kpAE3aDeccU\"",
    "mtime": "2025-02-04T06:49:50.769Z",
    "size": 3685,
    "path": "../public/_nuxt/BSkB5QuD.js"
  },
  "/_nuxt/B_c3zf-v.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b09-AniztXTCW2EZ7bLCjEh6Pzr19Uw\"",
    "mtime": "2025-02-04T06:49:50.769Z",
    "size": 2825,
    "path": "../public/_nuxt/B_c3zf-v.js"
  },
  "/_nuxt/B_fMsGYe.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"d8b-wdaYMOcILU5ZsiUc6j5Yz/vvZT8\"",
    "mtime": "2025-02-04T06:49:50.773Z",
    "size": 3467,
    "path": "../public/_nuxt/B_fMsGYe.js"
  },
  "/_nuxt/BaJupSGV.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"13d2-oHQ+WoyeOdX453C1t18DuA7yUiw\"",
    "mtime": "2025-02-04T06:49:50.769Z",
    "size": 5074,
    "path": "../public/_nuxt/BaJupSGV.js"
  },
  "/_nuxt/BaLxmfj-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"446-DfwxHi1Nkvq1wUEp3wYw7R1nVsI\"",
    "mtime": "2025-02-04T06:49:50.771Z",
    "size": 1094,
    "path": "../public/_nuxt/BaLxmfj-.js"
  },
  "/_nuxt/Bc-ZgV77.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"8c6-4wKGjOyNZ9Owd6sxuXqrFp0kNww\"",
    "mtime": "2025-02-04T06:49:50.769Z",
    "size": 2246,
    "path": "../public/_nuxt/Bc-ZgV77.js"
  },
  "/_nuxt/BcTueDZh.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1216-KaSPk+xwW6yrGk9h650aLgwQWFY\"",
    "mtime": "2025-02-04T06:49:50.769Z",
    "size": 4630,
    "path": "../public/_nuxt/BcTueDZh.js"
  },
  "/_nuxt/BcW51KGl.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"328-+XoJWlz5nFQPte2JZhaLNWDRlek\"",
    "mtime": "2025-02-04T06:49:50.769Z",
    "size": 808,
    "path": "../public/_nuxt/BcW51KGl.js"
  },
  "/_nuxt/Bdm_BXVE.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"495-ev7bv9pXgCg0FrSY/bGneEa+1QY\"",
    "mtime": "2025-02-04T06:49:50.769Z",
    "size": 1173,
    "path": "../public/_nuxt/Bdm_BXVE.js"
  },
  "/_nuxt/BfEKNvv3.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"ade-yeSBdhNR8jepAh6/fGH1krfMtuA\"",
    "mtime": "2025-02-04T06:49:50.769Z",
    "size": 2782,
    "path": "../public/_nuxt/BfEKNvv3.js"
  },
  "/_nuxt/Bhzvs7bI.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4321-m7JWyPeAWCVLrCl1gc38gCU5P3g\"",
    "mtime": "2025-02-04T06:49:50.769Z",
    "size": 17185,
    "path": "../public/_nuxt/Bhzvs7bI.js"
  },
  "/_nuxt/Bio4gycK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"7dd-LtMCBf2r+H05bMIkS5FijYeOh5o\"",
    "mtime": "2025-02-04T06:49:50.769Z",
    "size": 2013,
    "path": "../public/_nuxt/Bio4gycK.js"
  },
  "/_nuxt/BnNUpaKn.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4d2e-ozYQz/7sw+1Nv7m0bavt2cU7NTI\"",
    "mtime": "2025-02-04T06:49:50.770Z",
    "size": 19758,
    "path": "../public/_nuxt/BnNUpaKn.js"
  },
  "/_nuxt/BnNnnUmG.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"180-7qkclx+YQFWOfRe0aGBYsxS7kOc\"",
    "mtime": "2025-02-04T06:49:50.769Z",
    "size": 384,
    "path": "../public/_nuxt/BnNnnUmG.js"
  },
  "/_nuxt/BoFRg7Ot.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1d8c-x7eoF6/B5LJBQC45QcS+X82hwXg\"",
    "mtime": "2025-02-04T06:49:50.769Z",
    "size": 7564,
    "path": "../public/_nuxt/BoFRg7Ot.js"
  },
  "/_nuxt/Bqgm2twL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1ce3-2qEJX7PQQQUSX23UkO9qRvEtOOw\"",
    "mtime": "2025-02-04T06:49:50.769Z",
    "size": 7395,
    "path": "../public/_nuxt/Bqgm2twL.js"
  },
  "/_nuxt/BrgZPUOV.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3849-icb4pT04ATOyvhm69I+tvfu18vM\"",
    "mtime": "2025-02-04T06:49:50.769Z",
    "size": 14409,
    "path": "../public/_nuxt/BrgZPUOV.js"
  },
  "/_nuxt/BsTHnhdd.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1030-7KDisvL9YUyd7qbbHO1wzr27YJE\"",
    "mtime": "2025-02-04T06:49:50.770Z",
    "size": 4144,
    "path": "../public/_nuxt/BsTHnhdd.js"
  },
  "/_nuxt/Bu8X0-T4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"d52-QQuBHtaXapVO4ToIwStyY0X/wpM\"",
    "mtime": "2025-02-04T06:49:50.770Z",
    "size": 3410,
    "path": "../public/_nuxt/Bu8X0-T4.js"
  },
  "/_nuxt/BzVPr-WJ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"174-jKdqSzXP36XxyhNBYiyKh1hG3b4\"",
    "mtime": "2025-02-04T06:49:50.770Z",
    "size": 372,
    "path": "../public/_nuxt/BzVPr-WJ.js"
  },
  "/_nuxt/BzanNYvx.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"349-9lq/SKSMPRmbLz+sCKJC8eDoW64\"",
    "mtime": "2025-02-04T06:49:50.770Z",
    "size": 841,
    "path": "../public/_nuxt/BzanNYvx.js"
  },
  "/_nuxt/C-5zPJiT.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"26f-t4EkrhExw2d2gHIKMwYxFv30+cE\"",
    "mtime": "2025-02-04T06:49:50.770Z",
    "size": 623,
    "path": "../public/_nuxt/C-5zPJiT.js"
  },
  "/_nuxt/C5WLch3f.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"bc2-qGSUhYfhvOJwmpIaIMIvzbhl9D4\"",
    "mtime": "2025-02-04T06:49:50.770Z",
    "size": 3010,
    "path": "../public/_nuxt/C5WLch3f.js"
  },
  "/_nuxt/CCSDG5nI.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"292f-Pke4IVT3PZYEP6wHLq+u8Ghq4os\"",
    "mtime": "2025-02-04T06:49:50.770Z",
    "size": 10543,
    "path": "../public/_nuxt/CCSDG5nI.js"
  },
  "/_nuxt/CDGzqUPQ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"efc-Yv/rg2gfTTWYMTlvkYomAqsoyio\"",
    "mtime": "2025-02-04T06:49:50.770Z",
    "size": 3836,
    "path": "../public/_nuxt/CDGzqUPQ.js"
  },
  "/_nuxt/CDntyWJ8.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"81b-rz2B8NskY2hBKQP1ozorJrPLIqo\"",
    "mtime": "2025-02-04T06:49:50.770Z",
    "size": 2075,
    "path": "../public/_nuxt/CDntyWJ8.js"
  },
  "/_nuxt/CEkUUQav.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"59-L62eaxQId010MGQAETWtjPLk8ro\"",
    "mtime": "2025-02-04T06:49:50.770Z",
    "size": 89,
    "path": "../public/_nuxt/CEkUUQav.js"
  },
  "/_nuxt/CEyntFtY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"648-8PkKm/KZrnkOW/usHmkPzwlI91k\"",
    "mtime": "2025-02-04T06:49:50.770Z",
    "size": 1608,
    "path": "../public/_nuxt/CEyntFtY.js"
  },
  "/_nuxt/CFKIUWau.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1190-t4tOX4CzeQDYK7wfoXoHlBKNeIw\"",
    "mtime": "2025-02-04T06:49:50.770Z",
    "size": 4496,
    "path": "../public/_nuxt/CFKIUWau.js"
  },
  "/_nuxt/CFOPXBzS.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"82b-rLhbwmJOfKjpGFcT0QLKgPj84SQ\"",
    "mtime": "2025-02-04T06:49:50.770Z",
    "size": 2091,
    "path": "../public/_nuxt/CFOPXBzS.js"
  },
  "/_nuxt/CFz9vvrK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1174-hXgRFXw0tDOewQfsjX1LB1W+Ngk\"",
    "mtime": "2025-02-04T06:49:50.770Z",
    "size": 4468,
    "path": "../public/_nuxt/CFz9vvrK.js"
  },
  "/_nuxt/CLLBncYj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"15aa-BmXptzaHA8OcOjHRWHqLyMw+4qI\"",
    "mtime": "2025-02-04T06:49:50.770Z",
    "size": 5546,
    "path": "../public/_nuxt/CLLBncYj.js"
  },
  "/_nuxt/COyEY5Pt.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"244c-sVdjQcz+5gNm2dTCoRVru1PFIwE\"",
    "mtime": "2025-02-04T06:49:50.770Z",
    "size": 9292,
    "path": "../public/_nuxt/COyEY5Pt.js"
  },
  "/_nuxt/CPajHgWi.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"184b-0mnXppglu4funVUyTKRU9wVM51o\"",
    "mtime": "2025-02-04T06:49:50.770Z",
    "size": 6219,
    "path": "../public/_nuxt/CPajHgWi.js"
  },
  "/_nuxt/CTyF8K5y.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1b88-mqUH320zmjAqossQLhnBGXJ7DcY\"",
    "mtime": "2025-02-04T06:49:50.770Z",
    "size": 7048,
    "path": "../public/_nuxt/CTyF8K5y.js"
  },
  "/_nuxt/CVwtpugi.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"eda-V1UhNGZrP5fONJChkn+jlW9Ta9E\"",
    "mtime": "2025-02-04T06:49:50.770Z",
    "size": 3802,
    "path": "../public/_nuxt/CVwtpugi.js"
  },
  "/_nuxt/CX-rkNHf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"cf7-4tnpSwdJzMGOYoTdyObiOt0dHWM\"",
    "mtime": "2025-02-04T06:49:50.770Z",
    "size": 3319,
    "path": "../public/_nuxt/CX-rkNHf.js"
  },
  "/_nuxt/CXOwvkN_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"ca9-uRMf1coJqqNXNeXD9Ej5kus6azo\"",
    "mtime": "2025-02-04T06:49:50.770Z",
    "size": 3241,
    "path": "../public/_nuxt/CXOwvkN_.js"
  },
  "/_nuxt/Cb57c6r3.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"9c1-LgfCyRvyV45ULI+ScWrDKvy7jL4\"",
    "mtime": "2025-02-04T06:49:50.770Z",
    "size": 2497,
    "path": "../public/_nuxt/Cb57c6r3.js"
  },
  "/_nuxt/CdQndTaG.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"d31-2sYV2Pa9sj22Mg8J5eQisaRrrNY\"",
    "mtime": "2025-02-04T06:49:50.771Z",
    "size": 3377,
    "path": "../public/_nuxt/CdQndTaG.js"
  },
  "/_nuxt/Ce3n6wWz.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"15d4-wdVJAn7TRWtJZFuUu855HOGzJu0\"",
    "mtime": "2025-02-04T06:49:50.770Z",
    "size": 5588,
    "path": "../public/_nuxt/Ce3n6wWz.js"
  },
  "/_nuxt/Cg7bfA9N.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"9ca-xsj0QDi5DjJNLbrS7iOPZXl0WJo\"",
    "mtime": "2025-02-04T06:49:50.771Z",
    "size": 2506,
    "path": "../public/_nuxt/Cg7bfA9N.js"
  },
  "/_nuxt/Cl10qDTF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"a34b-0suQnOgeTpLbBfSVYc4JUnrN8mA\"",
    "mtime": "2025-02-04T06:49:50.771Z",
    "size": 41803,
    "path": "../public/_nuxt/Cl10qDTF.js"
  },
  "/_nuxt/Cp1zYvxS.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"222e-nOOrp7RMhTDtjnwFsnq0rumowPM\"",
    "mtime": "2025-02-04T06:49:50.771Z",
    "size": 8750,
    "path": "../public/_nuxt/Cp1zYvxS.js"
  },
  "/_nuxt/CpIb_Oan.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2051-rgRgtw3zWjZRZjudCbF33AGeECo\"",
    "mtime": "2025-02-04T06:49:50.771Z",
    "size": 8273,
    "path": "../public/_nuxt/CpIb_Oan.js"
  },
  "/_nuxt/Cpb6xl2v.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"bf7-9azmYcI2peWZp6TQCQm1u9keDX4\"",
    "mtime": "2025-02-04T06:49:50.771Z",
    "size": 3063,
    "path": "../public/_nuxt/Cpb6xl2v.js"
  },
  "/_nuxt/Cphgjts3.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b57-sUDXc9V38mpJy/VoZF16IPK2jZQ\"",
    "mtime": "2025-02-04T06:49:50.771Z",
    "size": 2903,
    "path": "../public/_nuxt/Cphgjts3.js"
  },
  "/_nuxt/Csxt4HGg.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"155-c6vP0VOFPj0Qikg6f3kVL+gCgG4\"",
    "mtime": "2025-02-04T06:49:50.771Z",
    "size": 341,
    "path": "../public/_nuxt/Csxt4HGg.js"
  },
  "/_nuxt/Cw-qlAIB.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1631-SjZHfm5xsXMg2WiDvyfdgdHQO6k\"",
    "mtime": "2025-02-04T06:49:50.771Z",
    "size": 5681,
    "path": "../public/_nuxt/Cw-qlAIB.js"
  },
  "/_nuxt/CwNk8-XU.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2135-/Qcx0wAi+4LGxI3qUDtHmm9/x+Q\"",
    "mtime": "2025-02-04T06:49:50.771Z",
    "size": 8501,
    "path": "../public/_nuxt/CwNk8-XU.js"
  },
  "/_nuxt/CzKuDChf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"c9d-XY7TDPHcaLK8YmDWccNEPGnZe7A\"",
    "mtime": "2025-02-04T06:49:50.771Z",
    "size": 3229,
    "path": "../public/_nuxt/CzKuDChf.js"
  },
  "/_nuxt/D-MeaMDU.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"be2-xiWLcmanCIP8fOEu9HVUVUr+aWw\"",
    "mtime": "2025-02-04T06:49:50.771Z",
    "size": 3042,
    "path": "../public/_nuxt/D-MeaMDU.js"
  },
  "/_nuxt/D-sMymdb.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1c9b-OFOy9xHtwujs3hnYYXg1OIUOAdM\"",
    "mtime": "2025-02-04T06:49:50.771Z",
    "size": 7323,
    "path": "../public/_nuxt/D-sMymdb.js"
  },
  "/_nuxt/D0HDIZlK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"108a-ZV61W+P+05wrYlZy/nZx++zZjHg\"",
    "mtime": "2025-02-04T06:49:50.771Z",
    "size": 4234,
    "path": "../public/_nuxt/D0HDIZlK.js"
  },
  "/_nuxt/D3h14YRZ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1294-6d50YJMYH5eiulIhlDOPQdy6ZV8\"",
    "mtime": "2025-02-04T06:49:50.771Z",
    "size": 4756,
    "path": "../public/_nuxt/D3h14YRZ.js"
  },
  "/_nuxt/D4ZzQ0Dr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5a49-ycrPEWd1vgXD8J1OV+Q+A2EolQc\"",
    "mtime": "2025-02-04T06:49:50.771Z",
    "size": 23113,
    "path": "../public/_nuxt/D4ZzQ0Dr.js"
  },
  "/_nuxt/D5C2fndG.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1136-mXipPz1mCKcAf7IPYjFnGWjeRjk\"",
    "mtime": "2025-02-04T06:49:50.771Z",
    "size": 4406,
    "path": "../public/_nuxt/D5C2fndG.js"
  },
  "/_nuxt/DAPVH9sK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"a7f-SKkhVCI86FPh76Zw7Fa5LOqNZ3U\"",
    "mtime": "2025-02-04T06:49:50.771Z",
    "size": 2687,
    "path": "../public/_nuxt/DAPVH9sK.js"
  },
  "/_nuxt/DDbY1xVK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4a7-wmj3dWq7TwdINt1hD8JRzX9RIo0\"",
    "mtime": "2025-02-04T06:49:50.771Z",
    "size": 1191,
    "path": "../public/_nuxt/DDbY1xVK.js"
  },
  "/_nuxt/DDwshQtU.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2d00-jz/0rwo3/1zr9O1qpGkppGRYj0c\"",
    "mtime": "2025-02-04T06:49:50.771Z",
    "size": 11520,
    "path": "../public/_nuxt/DDwshQtU.js"
  },
  "/_nuxt/DHaeiCBh.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"aee-ESrMw6IMSTb61CCMrqIf26ElWd0\"",
    "mtime": "2025-02-04T06:49:50.771Z",
    "size": 2798,
    "path": "../public/_nuxt/DHaeiCBh.js"
  },
  "/_nuxt/DSZPf7rp.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"fc2-JySsH5mq/KjcPjJw+bUGl2IRN2U\"",
    "mtime": "2025-02-04T06:49:50.771Z",
    "size": 4034,
    "path": "../public/_nuxt/DSZPf7rp.js"
  },
  "/_nuxt/DTECt2xU.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"26a1-ThvAAqyI33IkeBdcWyX2PC++Sts\"",
    "mtime": "2025-02-04T06:49:50.771Z",
    "size": 9889,
    "path": "../public/_nuxt/DTECt2xU.js"
  },
  "/_nuxt/DWJ3u7bO.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"13a1-y28lmIf6XKBTzf9rxRxzt9zapDA\"",
    "mtime": "2025-02-04T06:49:50.771Z",
    "size": 5025,
    "path": "../public/_nuxt/DWJ3u7bO.js"
  },
  "/_nuxt/DXyYeYxl.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"d6b-sGcrGYRsW9PkSr0hPYr/OCH89WA\"",
    "mtime": "2025-02-04T06:49:50.771Z",
    "size": 3435,
    "path": "../public/_nuxt/DXyYeYxl.js"
  },
  "/_nuxt/DYQUnd45.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1d97-q+rCO2oBidKt5zs1IFnjSYqY6aU\"",
    "mtime": "2025-02-04T06:49:50.775Z",
    "size": 7575,
    "path": "../public/_nuxt/DYQUnd45.js"
  },
  "/_nuxt/Db14qHM2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"9b6-Df6aIXNbI5G9toGWr728hYMWmcU\"",
    "mtime": "2025-02-04T06:49:50.772Z",
    "size": 2486,
    "path": "../public/_nuxt/Db14qHM2.js"
  },
  "/_nuxt/Dd3NCNK9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"dbb-BL2YGPNp0pJZI5sBLvKEV/VNutI\"",
    "mtime": "2025-02-04T06:49:50.772Z",
    "size": 3515,
    "path": "../public/_nuxt/Dd3NCNK9.js"
  },
  "/_nuxt/DfE0G0pJ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"40e8-rnRuI4MgT9zOK7+VubHrz6OWruE\"",
    "mtime": "2025-02-04T06:49:50.772Z",
    "size": 16616,
    "path": "../public/_nuxt/DfE0G0pJ.js"
  },
  "/_nuxt/DfzH4Xui.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"102b-wepaSEW2W4Que/z/1mzhV7R4hCM\"",
    "mtime": "2025-02-04T06:49:50.775Z",
    "size": 4139,
    "path": "../public/_nuxt/DfzH4Xui.js"
  },
  "/_nuxt/DgyLZaXg.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1795-cfyCJPyF4vOcXLix07/vfssQgeY\"",
    "mtime": "2025-02-04T06:49:50.772Z",
    "size": 6037,
    "path": "../public/_nuxt/DgyLZaXg.js"
  },
  "/_nuxt/DiPuShzu.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3274f5-VQGWmlGu8nbfEDAWh03BGjpZHI4\"",
    "mtime": "2025-02-04T06:49:50.775Z",
    "size": 3306741,
    "path": "../public/_nuxt/DiPuShzu.js"
  },
  "/_nuxt/DnHyzjbg.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"ee9-p6U584ZsOSDUCu7f/WYSFPHAzAk\"",
    "mtime": "2025-02-04T06:49:50.772Z",
    "size": 3817,
    "path": "../public/_nuxt/DnHyzjbg.js"
  },
  "/_nuxt/DoqI01cQ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"8f0-oxQ8jROMH9eia7ftQhHheOD20qc\"",
    "mtime": "2025-02-04T06:49:50.772Z",
    "size": 2288,
    "path": "../public/_nuxt/DoqI01cQ.js"
  },
  "/_nuxt/DrQuvNYM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"e2f-Hi6ee13MJ41g0r5dDUX8ibxSDig\"",
    "mtime": "2025-02-04T06:49:50.772Z",
    "size": 3631,
    "path": "../public/_nuxt/DrQuvNYM.js"
  },
  "/_nuxt/Drc7WvVn.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"543-VxiaQueavWaUxN54xIhdS3J11EQ\"",
    "mtime": "2025-02-04T06:49:50.772Z",
    "size": 1347,
    "path": "../public/_nuxt/Drc7WvVn.js"
  },
  "/_nuxt/DvF23Exx.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"334-KGpJZ8blohSqkeNnhxsswBRAW14\"",
    "mtime": "2025-02-04T06:49:50.772Z",
    "size": 820,
    "path": "../public/_nuxt/DvF23Exx.js"
  },
  "/_nuxt/DwJ7jVG9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1529-SoyYHSor0XMw7l/ikS3lFJNmKyk\"",
    "mtime": "2025-02-04T06:49:50.772Z",
    "size": 5417,
    "path": "../public/_nuxt/DwJ7jVG9.js"
  },
  "/_nuxt/DyHieQzF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"471-/1u7IrRm0hlzVw0etSUliZkdyMQ\"",
    "mtime": "2025-02-04T06:49:50.772Z",
    "size": 1137,
    "path": "../public/_nuxt/DyHieQzF.js"
  },
  "/_nuxt/DyP6w7ZV.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1066-fJ0kHM8xQ/aKGZ4dw6sq8RzRSog\"",
    "mtime": "2025-02-04T06:49:50.773Z",
    "size": 4198,
    "path": "../public/_nuxt/DyP6w7ZV.js"
  },
  "/_nuxt/DyTulhq3.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3db-V2s6r9DHVLrfUnD/bXzqXzGyJys\"",
    "mtime": "2025-02-04T06:49:50.775Z",
    "size": 987,
    "path": "../public/_nuxt/DyTulhq3.js"
  },
  "/_nuxt/IShi1APO.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2235-5lkVGY2dbux6Ox9kKpq07eSkCRs\"",
    "mtime": "2025-02-04T06:49:50.773Z",
    "size": 8757,
    "path": "../public/_nuxt/IShi1APO.js"
  },
  "/_nuxt/JqZd4KxG.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1edd30-tGHodJNcc6t+bUzgDzimkyhbA2s\"",
    "mtime": "2025-02-04T06:49:50.775Z",
    "size": 2022704,
    "path": "../public/_nuxt/JqZd4KxG.js"
  },
  "/_nuxt/PC-EZuwh.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"7e7b-cZMyRGOOhFeosxISgkIQhKIuU6M\"",
    "mtime": "2025-02-04T06:49:50.775Z",
    "size": 32379,
    "path": "../public/_nuxt/PC-EZuwh.js"
  },
  "/_nuxt/S1POHWLv.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"235c-WwmD4rQqEEvp9ajUIk4boTIYEko\"",
    "mtime": "2025-02-04T06:49:50.775Z",
    "size": 9052,
    "path": "../public/_nuxt/S1POHWLv.js"
  },
  "/_nuxt/Tw7wswEv.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"499b-ShgFKXXCUnT0uAhY6eB8K/X2JbA\"",
    "mtime": "2025-02-04T06:49:50.775Z",
    "size": 18843,
    "path": "../public/_nuxt/Tw7wswEv.js"
  },
  "/_nuxt/UP5ODb_V.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"49f88-lAACy3Q6w/INzdC1x4KLT6wENZI\"",
    "mtime": "2025-02-04T06:49:50.775Z",
    "size": 302984,
    "path": "../public/_nuxt/UP5ODb_V.js"
  },
  "/_nuxt/YPfwZRXF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1413-J3gWJ4GZoDfGENxMEH+8k6lttqM\"",
    "mtime": "2025-02-04T06:49:50.775Z",
    "size": 5139,
    "path": "../public/_nuxt/YPfwZRXF.js"
  },
  "/_nuxt/YWi4-JPR.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"a7b-30G1uyS9B4ih29ASw11LmnEHXcA\"",
    "mtime": "2025-02-04T06:49:50.775Z",
    "size": 2683,
    "path": "../public/_nuxt/YWi4-JPR.js"
  },
  "/_nuxt/Zznr-cwX.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"843-kDCj3SHg3KwlN+8QlTEoCcxJw3M\"",
    "mtime": "2025-02-04T06:49:50.775Z",
    "size": 2115,
    "path": "../public/_nuxt/Zznr-cwX.js"
  },
  "/_nuxt/codicon.DCmgc-ay.ttf": {
    "type": "font/ttf",
    "etag": "\"139d4-58fQ8Ohjcapek6AgDzlcXTeWfi4\"",
    "mtime": "2025-02-04T06:49:50.776Z",
    "size": 80340,
    "path": "../public/_nuxt/codicon.DCmgc-ay.ttf"
  },
  "/_nuxt/dUCx_-0o.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"12a2-1V/ZFPnJ9eaEu0BsdaW9GFpzVao\"",
    "mtime": "2025-02-04T06:49:50.775Z",
    "size": 4770,
    "path": "../public/_nuxt/dUCx_-0o.js"
  },
  "/_nuxt/deUWdS0T.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2907-3ZCDnQWierm8758gx+xuKtgepf8\"",
    "mtime": "2025-02-04T06:49:50.776Z",
    "size": 10503,
    "path": "../public/_nuxt/deUWdS0T.js"
  },
  "/_nuxt/editor.CLKKZHsQ.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"2034c-n6+kUblk2FOI+AqfYgb2BiJapKw\"",
    "mtime": "2025-02-04T06:49:50.776Z",
    "size": 131916,
    "path": "../public/_nuxt/editor.CLKKZHsQ.css"
  },
  "/_nuxt/eqSfBvmI.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"10c1-3meYXllpSvtEsTORyxRzjicqGWQ\"",
    "mtime": "2025-02-04T06:49:50.776Z",
    "size": 4289,
    "path": "../public/_nuxt/eqSfBvmI.js"
  },
  "/_nuxt/error-404.CM9RWU39.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"dce-42cGHOH0FTAPc2CxbsKalaz4+bg\"",
    "mtime": "2025-02-04T06:49:50.776Z",
    "size": 3534,
    "path": "../public/_nuxt/error-404.CM9RWU39.css"
  },
  "/_nuxt/error-500.D6506J9O.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"75c-tP5N9FT3eOu7fn6vCvyZRfUcniY\"",
    "mtime": "2025-02-04T06:49:50.776Z",
    "size": 1884,
    "path": "../public/_nuxt/error-500.D6506J9O.css"
  },
  "/_nuxt/i9-g7ZhI.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"808-vjR89VB50h49Ha8qKqho4bXlkxg\"",
    "mtime": "2025-02-04T06:49:50.776Z",
    "size": 2056,
    "path": "../public/_nuxt/i9-g7ZhI.js"
  },
  "/_nuxt/izZSugn_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"504-Bj+AqwToQfl75DM7ttrn0HfgzwU\"",
    "mtime": "2025-02-04T06:49:50.776Z",
    "size": 1284,
    "path": "../public/_nuxt/izZSugn_.js"
  },
  "/_nuxt/nf6ki56Z.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"941-JxOKAmhVxTjoK4S7GtjR5Q3bs6o\"",
    "mtime": "2025-02-04T06:49:50.776Z",
    "size": 2369,
    "path": "../public/_nuxt/nf6ki56Z.js"
  },
  "/_nuxt/notification-queue.DOQbEM-f.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"a8-afBbTV3r5BFRArg0YDIz71u9bCY\"",
    "mtime": "2025-02-04T06:49:50.776Z",
    "size": 168,
    "path": "../public/_nuxt/notification-queue.DOQbEM-f.css"
  },
  "/_nuxt/pnP8ivHi.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1ddd-UGxKj6HS6GsHtUUQC3pwYBj1KXQ\"",
    "mtime": "2025-02-04T06:49:50.776Z",
    "size": 7645,
    "path": "../public/_nuxt/pnP8ivHi.js"
  },
  "/_nuxt/rUNN04Wq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1426-2ukGkxGdVD5OdDQiiaX5WNoVx1w\"",
    "mtime": "2025-02-04T06:49:50.776Z",
    "size": 5158,
    "path": "../public/_nuxt/rUNN04Wq.js"
  },
  "/_nuxt/tGk8EFnU.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"358e-u4kNxCRvmu8Xfuy+ozQ8RBPGXJQ\"",
    "mtime": "2025-02-04T06:49:50.776Z",
    "size": 13710,
    "path": "../public/_nuxt/tGk8EFnU.js"
  },
  "/_nuxt/xzxld_d9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"80a2-Bb3XEXJPp4PmIqEeU/uiL6aNKVU\"",
    "mtime": "2025-02-04T06:49:50.776Z",
    "size": 32930,
    "path": "../public/_nuxt/xzxld_d9.js"
  },
  "/_nuxt/builds/latest.json": {
    "type": "application/json",
    "etag": "\"47-EtJFtXNkmrMLyYVu2ncGGJ5Xcu0\"",
    "mtime": "2025-02-04T06:49:50.409Z",
    "size": 71,
    "path": "../public/_nuxt/builds/latest.json"
  },
  "/_nuxt/nuxt-monaco-editor/metadata.d.ts": {
    "type": "video/mp2t",
    "etag": "\"e66-RRdOvwUHpvwVT/xOrHlsCmYES7E\"",
    "mtime": "2025-02-04T06:49:50.671Z",
    "size": 3686,
    "path": "../public/_nuxt/nuxt-monaco-editor/metadata.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/metadata.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3c53-O99Cz4sXMOH3xIvYk8cHV10HETw\"",
    "mtime": "2025-02-04T06:49:50.662Z",
    "size": 15443,
    "path": "../public/_nuxt/nuxt-monaco-editor/metadata.js"
  },
  "/_nuxt/builds/meta/ec57849c-f492-4aff-9bf5-253be261ba55.json": {
    "type": "application/json",
    "etag": "\"8b-z2MgeCtQhKgVODbt03Sk0xX//9A\"",
    "mtime": "2025-02-04T06:49:50.377Z",
    "size": 139,
    "path": "../public/_nuxt/builds/meta/ec57849c-f492-4aff-9bf5-253be261ba55.json"
  },
  "/_nuxt/nuxt-monaco-editor/vs/nls.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"aaa-lvx1HsB4eBSGd9oWW3myALySFVQ\"",
    "mtime": "2025-02-04T06:49:50.699Z",
    "size": 2730,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/nls.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/nls.messages.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2f0-9wxKdH0LyCYVfsqq5BCOFC6fFY8\"",
    "mtime": "2025-02-04T06:49:50.699Z",
    "size": 752,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/nls.messages.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/edcore.main.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3df-6rMnrjw3CpU4H3xoZHOKmHlddNc\"",
    "mtime": "2025-02-04T06:49:50.681Z",
    "size": 991,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/edcore.main.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/editor.all.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1077-LsIxt5DXl4y4J3R6RxSVZvIxSOs\"",
    "mtime": "2025-02-04T06:49:50.699Z",
    "size": 4215,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/editor.all.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/editor.api.d.ts": {
    "type": "video/mp2t",
    "etag": "\"5215a-P3RVBG96I6vi4XAFep0VAgHQDWQ\"",
    "mtime": "2025-02-04T06:49:50.743Z",
    "size": 336218,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/editor.api.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/editor.api.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"aca-yeIEqcSiFB8XCXNksPOL1XEhO2k\"",
    "mtime": "2025-02-04T06:49:50.699Z",
    "size": 2762,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/editor.api.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/editor.main.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"111-ZahMRjGyRXO68Hw0/sB1RqLYc9s\"",
    "mtime": "2025-02-04T06:49:50.699Z",
    "size": 273,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/editor.main.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/editor.worker.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"499-X07xhJ5VgEkOEn57mRtIgO5ZBl4\"",
    "mtime": "2025-02-04T06:49:50.699Z",
    "size": 1177,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/editor.worker.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/_.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"c4a-h1Nvjljh9RUly+0z0mKkKUwOrDU\"",
    "mtime": "2025-02-04T06:49:50.699Z",
    "size": 3146,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/_.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/monaco.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"ecd-rCD1Hrsy+FPt6xK9eCjvpF8Q8Ug\"",
    "mtime": "2025-02-04T06:49:50.699Z",
    "size": 3789,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/monaco.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/browser.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"9d4-XCS80E2gInSi740+Kxu88m3Zipg\"",
    "mtime": "2025-02-04T06:49:50.682Z",
    "size": 2516,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/browser.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/canIUse.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"698-sua1aGdkfnIhLZ4oiDMa8CRlbrs\"",
    "mtime": "2025-02-04T06:49:50.699Z",
    "size": 1688,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/canIUse.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/contextmenu.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"16b-EowE4pZYkCnO5xAyY6EVxovwQ0M\"",
    "mtime": "2025-02-04T06:49:50.699Z",
    "size": 363,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/contextmenu.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/defaultWorkerFactory.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2330-c6dJ4woXF6qBMhs75Ik9wQqstPc\"",
    "mtime": "2025-02-04T06:49:50.699Z",
    "size": 9008,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/defaultWorkerFactory.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/dnd.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2cd-WR0ubCOGeFsWWDwImwkMXuZgVOQ\"",
    "mtime": "2025-02-04T06:49:50.699Z",
    "size": 717,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/dnd.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/dom.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"d88a-0ul2HgvV7xV/oHoNKBG4dARqefk\"",
    "mtime": "2025-02-04T06:49:50.699Z",
    "size": 55434,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/dom.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/domObservable.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2ed-MUxZDcHbrtjtyzCkN5bjTrXxlV0\"",
    "mtime": "2025-02-04T06:49:50.699Z",
    "size": 749,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/domObservable.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/event.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"366-JHNldDVPix6dpJNf5p8L4CSoshc\"",
    "mtime": "2025-02-04T06:49:50.699Z",
    "size": 870,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/event.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/fastDomNode.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1eb9-Kmp0eq2A1rQ5TWAPosNyN4YxYi8\"",
    "mtime": "2025-02-04T06:49:50.699Z",
    "size": 7865,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/fastDomNode.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/fonts.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3a7-plkOWf3quqxKfw9PHg7xN1MKbnk\"",
    "mtime": "2025-02-04T06:49:50.699Z",
    "size": 935,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/fonts.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/formattedTextRenderer.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1742-6fKQiZQvjdJLWuy6+we0D0fYV14\"",
    "mtime": "2025-02-04T06:49:50.699Z",
    "size": 5954,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/formattedTextRenderer.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/globalPointerMoveMonitor.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"db4-b559om4zbOqT/q993HdaM+WbVfw\"",
    "mtime": "2025-02-04T06:49:50.699Z",
    "size": 3508,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/globalPointerMoveMonitor.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/history.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"16b-EowE4pZYkCnO5xAyY6EVxovwQ0M\"",
    "mtime": "2025-02-04T06:49:50.699Z",
    "size": 363,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/history.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/iframe.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"ce2-1IFL2Kl/CmvGupcMmm6vi3tCIzE\"",
    "mtime": "2025-02-04T06:49:50.699Z",
    "size": 3298,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/iframe.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/keyboardEvent.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"13e8-2SkrVIqomRKSN2uswZIsJSR361o\"",
    "mtime": "2025-02-04T06:49:50.710Z",
    "size": 5096,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/keyboardEvent.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/markdownRenderer.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"7c32-sZ/w1nc9NsX83Jj/9OoKweGUz20\"",
    "mtime": "2025-02-04T06:49:50.699Z",
    "size": 31794,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/markdownRenderer.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/mouseEvent.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"189d-FWwtwIOLg/dhayuovZ0pzqyuO1M\"",
    "mtime": "2025-02-04T06:49:50.699Z",
    "size": 6301,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/mouseEvent.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/performance.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"265e-iQ2hjJjPCeM8ZtY/J4BuJWwDrmM\"",
    "mtime": "2025-02-04T06:49:50.699Z",
    "size": 9822,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/performance.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/pixelRatio.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"f06-UPcPc/M/zblHcW6Kva0TlYNszG8\"",
    "mtime": "2025-02-04T06:49:50.699Z",
    "size": 3846,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/pixelRatio.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/touch.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3021-SUi8YEIRPkw24W+vGUB5HjqbJKc\"",
    "mtime": "2025-02-04T06:49:50.699Z",
    "size": 12321,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/touch.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/trustedTypes.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3e1-PZGihzsPRjgikrUKMtKtwYfJhDY\"",
    "mtime": "2025-02-04T06:49:50.699Z",
    "size": 993,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/trustedTypes.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/window.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2cf-yiZecyIapcsgBwkVSYpmAE60QUM\"",
    "mtime": "2025-02-04T06:49:50.699Z",
    "size": 719,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/window.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/actions.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"132a-cAu8pv9Gp8BeoarPnz6aWvmDL64\"",
    "mtime": "2025-02-04T06:49:50.699Z",
    "size": 4906,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/actions.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/arrays.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4014-LC/kUhIxJt7smkCJU8SjhRpNIAQ\"",
    "mtime": "2025-02-04T06:49:50.699Z",
    "size": 16404,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/arrays.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/arraysFind.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"17ac-KHWxw+c2//7iYSJWEKG0o9ZW6Pw\"",
    "mtime": "2025-02-04T06:49:50.699Z",
    "size": 6060,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/arraysFind.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/assert.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"79d-AFJcUz8t/sfJasOcKULT5AXas3w\"",
    "mtime": "2025-02-04T06:49:50.699Z",
    "size": 1949,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/assert.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/async.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"6b34-4JmPlN29ltytHHe7/HbNmPA6v70\"",
    "mtime": "2025-02-04T06:49:50.699Z",
    "size": 27444,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/async.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/buffer.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"a2b-Y4QiUBRXlZW2Dze01ch0Q9KfwiM\"",
    "mtime": "2025-02-04T06:49:50.699Z",
    "size": 2603,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/buffer.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/cache.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5ee-LMr9vfZpR2HjpPlZs79Jw3F9pr4\"",
    "mtime": "2025-02-04T06:49:50.699Z",
    "size": 1518,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/cache.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/cancellation.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"eb3-my63pRKRAwwlpzvZXq/QR8ZIQQQ\"",
    "mtime": "2025-02-04T06:49:50.699Z",
    "size": 3763,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/cancellation.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/charCode.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"16b-EowE4pZYkCnO5xAyY6EVxovwQ0M\"",
    "mtime": "2025-02-04T06:49:50.699Z",
    "size": 363,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/charCode.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/codicons.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"9ca-e+7LTXgFarn6rj0C5O7g2B8d4uE\"",
    "mtime": "2025-02-04T06:49:50.699Z",
    "size": 2506,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/codicons.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/codiconsLibrary.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"71cf-oZaTSFO7fzpGSu3/KSbglX6/Mno\"",
    "mtime": "2025-02-04T06:49:50.699Z",
    "size": 29135,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/codiconsLibrary.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/codiconsUtil.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"252-ym8Dj7zWsdDLKl3k1z0192SWdbo\"",
    "mtime": "2025-02-04T06:49:50.699Z",
    "size": 594,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/codiconsUtil.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/collections.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"461-AT070fIp6mCq0Iwe0DCnwBE6GpM\"",
    "mtime": "2025-02-04T06:49:50.700Z",
    "size": 1121,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/collections.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/color.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4506-xgPFmLq6ruoR6I8GVZr9y9eDImo\"",
    "mtime": "2025-02-04T06:49:50.700Z",
    "size": 17670,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/color.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/comparers.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"e2a-ar1b3kBbdDjTH2HL4qrmJcOYVVA\"",
    "mtime": "2025-02-04T06:49:50.700Z",
    "size": 3626,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/comparers.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/dataTransfer.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"f9b-xUgT56lciguO6U+Bu5lFAHh4kMk\"",
    "mtime": "2025-02-04T06:49:50.700Z",
    "size": 3995,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/dataTransfer.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/decorators.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"395-XFuXhkiu20ho+SBNneYHG45yuDM\"",
    "mtime": "2025-02-04T06:49:50.700Z",
    "size": 917,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/decorators.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/equals.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"acf-MTDGyqmeDhvLtI6YjyKK0hPkzEw\"",
    "mtime": "2025-02-04T06:49:50.700Z",
    "size": 2767,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/equals.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/errorMessage.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"bd3-WPfffIl1GSguF6LjvIjww1rjxaM\"",
    "mtime": "2025-02-04T06:49:50.700Z",
    "size": 3027,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/errorMessage.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/errors.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"11dc-sBUwm1TdtlgINW7HIaFmQok1pTE\"",
    "mtime": "2025-02-04T06:49:50.700Z",
    "size": 4572,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/errors.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/event.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b88a-2+hAXEz8/Jh97vA3U5mIQrLNh0k\"",
    "mtime": "2025-02-04T06:49:50.700Z",
    "size": 47242,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/event.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/extpath.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1571-nVJOoHEk5zerpjj0B0O141Zt/bQ\"",
    "mtime": "2025-02-04T06:49:50.700Z",
    "size": 5489,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/extpath.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/filters.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"749c-atT/6fFTTxC5E1Q3TWEjKo6z6Tw\"",
    "mtime": "2025-02-04T06:49:50.700Z",
    "size": 29852,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/filters.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/functional.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3d9-0vMlwu52ST+TKfCswTd+xRESkDw\"",
    "mtime": "2025-02-04T06:49:50.700Z",
    "size": 985,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/functional.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/fuzzyScorer.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"164d-EjK79zbPTNBcHCFmiEz9PA79ve0\"",
    "mtime": "2025-02-04T06:49:50.700Z",
    "size": 5709,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/fuzzyScorer.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/glob.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"587b-vryzHb98gkHF/Pm3mpYMvTa4fSQ\"",
    "mtime": "2025-02-04T06:49:50.700Z",
    "size": 22651,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/glob.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/hash.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2714-fNQYprZKkbnWaQ8qJIjXPDAlWHw\"",
    "mtime": "2025-02-04T06:49:50.700Z",
    "size": 10004,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/hash.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/hierarchicalKind.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"431-wcbTx1g2pgBRwPPuqHvTfNXrgw4\"",
    "mtime": "2025-02-04T06:49:50.700Z",
    "size": 1073,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/hierarchicalKind.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/history.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"7b9-JvRvriowcoxiFZpmhFfei0/KpTM\"",
    "mtime": "2025-02-04T06:49:50.700Z",
    "size": 1977,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/history.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/hotReload.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"cd1-0PMkOaCyCBgiuVj9BmD6JuQkh98\"",
    "mtime": "2025-02-04T06:49:50.700Z",
    "size": 3281,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/hotReload.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/hotReloadHelpers.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"459-bY0zTWnRiSyQdXetPZHwb6jVmrM\"",
    "mtime": "2025-02-04T06:49:50.700Z",
    "size": 1113,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/hotReloadHelpers.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/htmlContent.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1740-Sy+IgKj/6nFEYk7U4hJ3acrLjyg\"",
    "mtime": "2025-02-04T06:49:50.700Z",
    "size": 5952,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/htmlContent.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/iconLabels.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"f57-X+tDmvThtc1YHX655pfc2oGxa4s\"",
    "mtime": "2025-02-04T06:49:50.700Z",
    "size": 3927,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/iconLabels.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/idGenerator.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"253-gyZfLYil8hx36SHMIjdFsszmWYw\"",
    "mtime": "2025-02-04T06:49:50.700Z",
    "size": 595,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/idGenerator.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/ime.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"381-+uAmPIUHxY92qq/HV9SVD6sBatg\"",
    "mtime": "2025-02-04T06:49:50.700Z",
    "size": 897,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/ime.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/iterator.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1168-qajeJW9bz3puF09vOCYjj1Ykcag\"",
    "mtime": "2025-02-04T06:49:50.700Z",
    "size": 4456,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/iterator.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/jsonSchema.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"16b-EowE4pZYkCnO5xAyY6EVxovwQ0M\"",
    "mtime": "2025-02-04T06:49:50.700Z",
    "size": 363,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/jsonSchema.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/keyCodes.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"7e4c-+qJVY3zYfdUjwpfz/tAptGv+zWM\"",
    "mtime": "2025-02-04T06:49:50.700Z",
    "size": 32332,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/keyCodes.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/keybindingLabels.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1775-0t0WwYtVEaXVm1Wf2ZrDppgGBEg\"",
    "mtime": "2025-02-04T06:49:50.700Z",
    "size": 6005,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/keybindingLabels.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/keybindings.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"13f3-+C76AqDrB4t+KyxkZHmNvQawINE\"",
    "mtime": "2025-02-04T06:49:50.700Z",
    "size": 5107,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/keybindings.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/labels.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"157-ACQSNHNgaMDGW5poz062Zl/gGCw\"",
    "mtime": "2025-02-04T06:49:50.700Z",
    "size": 343,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/labels.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/lazy.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4ce-kXrIpi30R5cpISa6AR306HP0PMc\"",
    "mtime": "2025-02-04T06:49:50.700Z",
    "size": 1230,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/lazy.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/lifecycle.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"27dc-Bj3P+4RdDjlPB1NcvSOUDRFWOME\"",
    "mtime": "2025-02-04T06:49:50.700Z",
    "size": 10204,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/lifecycle.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/linkedList.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"e1b-NN63tHI84IoJWLPUuGuT3eoM6fQ\"",
    "mtime": "2025-02-04T06:49:50.700Z",
    "size": 3611,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/linkedList.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/linkedText.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"7a7-kdw13lin3rLldi39/1Gii6byv0A\"",
    "mtime": "2025-02-04T06:49:50.700Z",
    "size": 1959,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/linkedText.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/map.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3eb3-rHJ4RlVxwDq52htnSccGIASPB/w\"",
    "mtime": "2025-02-04T06:49:50.700Z",
    "size": 16051,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/map.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/marshalling.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"71b-JmIM4KYgSobIJc2da1KUMMmr6jY\"",
    "mtime": "2025-02-04T06:49:50.700Z",
    "size": 1819,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/marshalling.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/marshallingIds.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"16b-EowE4pZYkCnO5xAyY6EVxovwQ0M\"",
    "mtime": "2025-02-04T06:49:50.700Z",
    "size": 363,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/marshallingIds.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/mime.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"e3-qWdpQjsKTZQUaf9hU+4KVpaToQ4\"",
    "mtime": "2025-02-04T06:49:50.700Z",
    "size": 227,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/mime.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/navigator.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"46e-xkRElqf3usgN60dCPb9vnPG7gHQ\"",
    "mtime": "2025-02-04T06:49:50.700Z",
    "size": 1134,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/navigator.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/network.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"28cc-vbtJQSaC9Qa639KA9dARiGLRZAk\"",
    "mtime": "2025-02-04T06:49:50.700Z",
    "size": 10444,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/network.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/numbers.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"59e-yNKhE/FXxfGlybHidXaPjglAZrs\"",
    "mtime": "2025-02-04T06:49:50.700Z",
    "size": 1438,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/numbers.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/objects.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"14d5-2v4iKN+en9C4KOqQW/D/gAbkdCc\"",
    "mtime": "2025-02-04T06:49:50.701Z",
    "size": 5333,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/objects.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/observable.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"556-4nKMlnrm/fe8MfR8//8aJOFDQS8\"",
    "mtime": "2025-02-04T06:49:50.700Z",
    "size": 1366,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/observable.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/paging.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b-uHjBGncSjnTDzxXJPvLO3fKqCzg\"",
    "mtime": "2025-02-04T06:49:50.704Z",
    "size": 11,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/paging.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/path.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"d249-JcEuyN0z4iihRBXsblzvWZSqwuw\"",
    "mtime": "2025-02-04T06:49:50.701Z",
    "size": 53833,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/path.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/platform.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"188c-Dw4ub2UCqsFbmaaMxwby8nFNVYE\"",
    "mtime": "2025-02-04T06:49:50.701Z",
    "size": 6284,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/platform.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/process.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"844-RS92UTIWmKapiMIhpO1xKn7p4bs\"",
    "mtime": "2025-02-04T06:49:50.701Z",
    "size": 2116,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/process.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/range.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"691-50YVUqnweKnRO8hPc2cXJL6nTI8\"",
    "mtime": "2025-02-04T06:49:50.701Z",
    "size": 1681,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/range.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/resources.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2c96-KN019fap6+jgo3MyhT37/9HWY7w\"",
    "mtime": "2025-02-04T06:49:50.701Z",
    "size": 11414,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/resources.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/scrollable.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3446-Y6+w2vZiQAPvyyKO2V4IIQn31IA\"",
    "mtime": "2025-02-04T06:49:50.701Z",
    "size": 13382,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/scrollable.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/search.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"a07-yA2TBtr6o5NjmgzFPrPbwCj/ajY\"",
    "mtime": "2025-02-04T06:49:50.701Z",
    "size": 2567,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/search.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/sequence.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b-uHjBGncSjnTDzxXJPvLO3fKqCzg\"",
    "mtime": "2025-02-04T06:49:50.701Z",
    "size": 11,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/sequence.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/severity.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"70d-pGMkm//iJiQjo3jqrcVGtgY29Eo\"",
    "mtime": "2025-02-04T06:49:50.701Z",
    "size": 1805,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/severity.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/stopwatch.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"468-BX2XL+gEAPRPM9nl4YuGgbk2OTU\"",
    "mtime": "2025-02-04T06:49:50.701Z",
    "size": 1128,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/stopwatch.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/strings.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"14052-X+CAxh3GWbwrIlNV3YczB4+ORtk\"",
    "mtime": "2025-02-04T06:49:50.701Z",
    "size": 82002,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/strings.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/symbols.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1df-IzXQhtn0oeH+DqR7jOkC0w4iE14\"",
    "mtime": "2025-02-04T06:49:50.701Z",
    "size": 479,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/symbols.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/ternarySearchTree.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4d0b-YJlQ4KScrRHCRpRdcvyCGHnKroI\"",
    "mtime": "2025-02-04T06:49:50.701Z",
    "size": 19723,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/ternarySearchTree.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/tfIdf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1a54-zrzBXbtFoeoKlvaWDsDWb0gh0DI\"",
    "mtime": "2025-02-04T06:49:50.701Z",
    "size": 6740,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/tfIdf.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/themables.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"c82-qBvYQSgiYytnShA3bqQ+CqB0Gac\"",
    "mtime": "2025-02-04T06:49:50.701Z",
    "size": 3202,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/themables.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/types.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"f7b-RoI3JeJBa+wIxEvd5pIIfPr6iG8\"",
    "mtime": "2025-02-04T06:49:50.701Z",
    "size": 3963,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/types.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/uint.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2eb-+Es965cixj6d7ChNfU7Z/WcTzk8\"",
    "mtime": "2025-02-04T06:49:50.701Z",
    "size": 747,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/uint.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/uri.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5784-W7E2esOo1hNS2gBjdiyWkRajzHY\"",
    "mtime": "2025-02-04T06:49:50.701Z",
    "size": 22404,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/uri.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/uuid.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"715-vEdNxNhMi9WgB7Esr0WZlunrYbE\"",
    "mtime": "2025-02-04T06:49:50.701Z",
    "size": 1813,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/uuid.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/coreCommands.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.743Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/coreCommands.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/coreCommands.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"12626-sxjPxmFn5R802f9U7K3VDSe+Y6U\"",
    "mtime": "2025-02-04T06:49:50.682Z",
    "size": 75302,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/coreCommands.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/dnd.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"cf7-tmwir60twEIs2rNpXmyBURo5gOM\"",
    "mtime": "2025-02-04T06:49:50.701Z",
    "size": 3319,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/dnd.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/editorBrowser.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"58f-bu6/FDI1dsjHhaMSfOl1tJO4TxM\"",
    "mtime": "2025-02-04T06:49:50.701Z",
    "size": 1423,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/editorBrowser.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/editorDom.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2c7d-/cifTEwrtI9+pFsCMOHgtQe1sYk\"",
    "mtime": "2025-02-04T06:49:50.701Z",
    "size": 11389,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/editorDom.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/editorExtensions.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"45e0-sm0KnduCS6gxdXd6iPASg0Vutqg\"",
    "mtime": "2025-02-04T06:49:50.701Z",
    "size": 17888,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/editorExtensions.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/observableCodeEditor.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"262e-zLAw/G0hTaD78pLaa68xq4hjqEU\"",
    "mtime": "2025-02-04T06:49:50.701Z",
    "size": 9774,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/observableCodeEditor.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/stableEditorScroll.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"c06-JYA35DGSPDsQ+TfbD7XIz53XIUo\"",
    "mtime": "2025-02-04T06:49:50.701Z",
    "size": 3078,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/stableEditorScroll.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/view.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"71e2-e/i0w78sZkemdNkQWCA6VMw3sjw\"",
    "mtime": "2025-02-04T06:49:50.701Z",
    "size": 29154,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/view.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/cursorCommon.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2f49-jjOW7RpWBv93yxafC4E1w+YQOzc\"",
    "mtime": "2025-02-04T06:49:50.701Z",
    "size": 12105,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/cursorCommon.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/cursorEvents.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"16b-EowE4pZYkCnO5xAyY6EVxovwQ0M\"",
    "mtime": "2025-02-04T06:49:50.701Z",
    "size": 363,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/cursorEvents.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/editorAction.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3cb-XX0JpL0sOSiklcPs8ecgZHPgGw4\"",
    "mtime": "2025-02-04T06:49:50.702Z",
    "size": 971,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/editorAction.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/editorCommon.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1f8-hc4g36TV5IxEURdSqoYcW3soDcs\"",
    "mtime": "2025-02-04T06:49:50.702Z",
    "size": 504,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/editorCommon.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/editorContextKeys.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2b95-Gfhv5FAmBkqMGi+qugHCUGjpW4g\"",
    "mtime": "2025-02-04T06:49:50.702Z",
    "size": 11157,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/editorContextKeys.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/editorFeatures.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2a3-hEGQFk2b1DoLmHd05qzgfSJRFjw\"",
    "mtime": "2025-02-04T06:49:50.702Z",
    "size": 675,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/editorFeatures.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/editorTheme.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2a4-Ne4qmskHjdy5ssgVmhhOfclXc3Y\"",
    "mtime": "2025-02-04T06:49:50.702Z",
    "size": 676,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/editorTheme.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/encodedTokenAttributes.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"ce9-IJUHbQfII/w+l/Z1BsMlBVkzAXQ\"",
    "mtime": "2025-02-04T06:49:50.702Z",
    "size": 3305,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/encodedTokenAttributes.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/languageFeatureRegistry.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"181f-Fk0xUKR/Dudv3O/cbLKfI1Nbqlg\"",
    "mtime": "2025-02-04T06:49:50.702Z",
    "size": 6175,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/languageFeatureRegistry.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/languageSelector.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"f3a-V5mZVBrgYLKel2ecoO4bqfi3Tlg\"",
    "mtime": "2025-02-04T06:49:50.702Z",
    "size": 3898,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/languageSelector.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/languages.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4188-MO2eclk74E5FZHURzx5CRSYa2+s\"",
    "mtime": "2025-02-04T06:49:50.702Z",
    "size": 16776,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/languages.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/model.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"127e-LLgC/I4ZbM0h6UlRwTskBGseYC0\"",
    "mtime": "2025-02-04T06:49:50.702Z",
    "size": 4734,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/model.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/modelLineProjectionData.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3365-5bbx9Aritj4UfKGuphq1Vr4zcAY\"",
    "mtime": "2025-02-04T06:49:50.702Z",
    "size": 13157,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/modelLineProjectionData.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/standaloneStrings.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"967-hm/t0WH6g44IkVkQw87FG9V41mw\"",
    "mtime": "2025-02-04T06:49:50.702Z",
    "size": 2407,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/standaloneStrings.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/textModelBracketPairs.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"76e-59X8TMDJja0nA0NrlwAnMyaMBT8\"",
    "mtime": "2025-02-04T06:49:50.702Z",
    "size": 1902,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/textModelBracketPairs.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/textModelEvents.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"189d-2yvLe+ClS/iwcPrYVoIWw9wyT+w\"",
    "mtime": "2025-02-04T06:49:50.702Z",
    "size": 6301,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/textModelEvents.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/textModelGuides.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"6ce-ks9D5IulEvsSd07sbUBb+4yCImk\"",
    "mtime": "2025-02-04T06:49:50.702Z",
    "size": 1742,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/textModelGuides.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/tokenizationRegistry.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"103d-Hi5UTm3v7wJ511RkdEQtSeND47M\"",
    "mtime": "2025-02-04T06:49:50.702Z",
    "size": 4157,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/tokenizationRegistry.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/tokenizationTextModelPart.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"16b-EowE4pZYkCnO5xAyY6EVxovwQ0M\"",
    "mtime": "2025-02-04T06:49:50.702Z",
    "size": 363,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/tokenizationTextModelPart.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/viewEventHandler.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1894-2+apWqgFoUf5C2QpC+2O7UsS3aQ\"",
    "mtime": "2025-02-04T06:49:50.702Z",
    "size": 6292,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/viewEventHandler.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/viewEvents.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1576-Dtx407ed4tCOofTGBZzY4Ct0DrI\"",
    "mtime": "2025-02-04T06:49:50.702Z",
    "size": 5494,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/viewEvents.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/viewModel.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"11cb-aPQvVOscSn/Yyg5LuLo73jXM6sY\"",
    "mtime": "2025-02-04T06:49:50.702Z",
    "size": 4555,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/viewModel.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/viewModelEventDispatcher.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2da2-xcU/5dX233L5f8VdLyIxQJXf3YQ\"",
    "mtime": "2025-02-04T06:49:50.702Z",
    "size": 11682,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/viewModelEventDispatcher.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/language/css/css.worker.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"131322-X+2H3EOjwFIz5m2b6oUGhAyTBG4\"",
    "mtime": "2025-02-04T06:49:50.678Z",
    "size": 1250082,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/language/css/css.worker.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/language/css/cssMode.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"10e25-U3/JtPsNJe7nNw5deuUqWPnypDM\"",
    "mtime": "2025-02-04T06:49:50.710Z",
    "size": 69157,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/language/css/cssMode.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/language/css/monaco.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.742Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/language/css/monaco.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/language/css/monaco.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1203-g6+0HveUyUu0kpH02UGp6gBNAQ4\"",
    "mtime": "2025-02-04T06:49:50.710Z",
    "size": 4611,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/language/css/monaco.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/language/html/html.worker.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"a5b77-lqOFHsfE/xT2hGTZ932oWKmH6ts\"",
    "mtime": "2025-02-04T06:49:50.686Z",
    "size": 678775,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/language/html/html.worker.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/language/html/htmlMode.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1121d-/66WRVRNtBbOVPyDV/QQNBnLRGg\"",
    "mtime": "2025-02-04T06:49:50.710Z",
    "size": 70173,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/language/html/htmlMode.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/language/html/monaco.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.742Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/language/html/monaco.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/language/html/monaco.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1454-Io3eXO1/YrkyH8+9ThkWKQDX37A\"",
    "mtime": "2025-02-04T06:49:50.734Z",
    "size": 5204,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/language/html/monaco.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/language/json/json.worker.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"45e79-s+hyNQPmAVudh31dO028P2hylEk\"",
    "mtime": "2025-02-04T06:49:50.711Z",
    "size": 286329,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/language/json/json.worker.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/language/json/jsonMode.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"169b7-RkROzd9qaH72+D5PJUOv19zJ93g\"",
    "mtime": "2025-02-04T06:49:50.684Z",
    "size": 92599,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/language/json/jsonMode.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/language/json/monaco.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.743Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/language/json/monaco.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/language/json/monaco.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"e2e-m57niNNSU0sUsmSzJfga82i5D64\"",
    "mtime": "2025-02-04T06:49:50.710Z",
    "size": 3630,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/language/json/monaco.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/language/typescript/monaco.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.743Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/language/typescript/monaco.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/language/typescript/monaco.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2701-Ur67Q220rdLY1Md5Pz+DsljHqyg\"",
    "mtime": "2025-02-04T06:49:50.685Z",
    "size": 9985,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/language/typescript/monaco.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/language/typescript/ts.worker.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"aac179-Re2u/dBpf+EfMG3xZIQsJeqtqn0\"",
    "mtime": "2025-02-04T06:49:50.721Z",
    "size": 11190649,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/language/typescript/ts.worker.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/language/typescript/tsMode.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"ab3f-Io6ulbi5yNISoWY2JFlcAjtmnDc\"",
    "mtime": "2025-02-04T06:49:50.710Z",
    "size": 43839,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/language/typescript/tsMode.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/abap/abap.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.743Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/abap/abap.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/abap/abap.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"326-xWtX2pBJx0QBuVqocptvwxdJWc4\"",
    "mtime": "2025-02-04T06:49:50.671Z",
    "size": 806,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/abap/abap.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/abap/abap.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5b63-cqGsqqCqqeFACOZEZDGbg+uJc5E\"",
    "mtime": "2025-02-04T06:49:50.702Z",
    "size": 23395,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/abap/abap.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/apex/apex.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.743Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/apex/apex.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/apex/apex.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"359-wzz7uIuBI5/NPUEtl6lIwIqYIsc\"",
    "mtime": "2025-02-04T06:49:50.682Z",
    "size": 857,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/apex/apex.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/apex/apex.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1a97-YUIcSSw3gH6Mxu8F7zY/gskbi8s\"",
    "mtime": "2025-02-04T06:49:50.703Z",
    "size": 6807,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/apex/apex.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/azcli/azcli.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.743Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/azcli/azcli.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/azcli/azcli.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"333-Sb7BuXyPCjNrGFL0IdZbyZixL6E\"",
    "mtime": "2025-02-04T06:49:50.682Z",
    "size": 819,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/azcli/azcli.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/azcli/azcli.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"6bf-Fd83gelEW/r6VffPukznU0QrH1c\"",
    "mtime": "2025-02-04T06:49:50.703Z",
    "size": 1727,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/azcli/azcli.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/bat/bat.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.743Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/bat/bat.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/bat/bat.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"327-EIMl5v+CqMegpxkJ55x3gSC7QoI\"",
    "mtime": "2025-02-04T06:49:50.682Z",
    "size": 807,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/bat/bat.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/bat/bat.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"c02-e6dfnK9X871EP1wR4JCX3Ud+93k\"",
    "mtime": "2025-02-04T06:49:50.703Z",
    "size": 3074,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/bat/bat.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/bicep/bicep.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.743Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/bicep/bicep.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/bicep/bicep.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"326-26flxx8YRBwkQbnrQHvCb7KFIQU\"",
    "mtime": "2025-02-04T06:49:50.682Z",
    "size": 806,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/bicep/bicep.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/bicep/bicep.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"f09-Be15+sRJ2+HfH1SXQ3REiVj5OJw\"",
    "mtime": "2025-02-04T06:49:50.703Z",
    "size": 3849,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/bicep/bicep.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/cameligo/cameligo.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.743Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/cameligo/cameligo.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/cameligo/cameligo.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"33b-Wt76DV+c9wwSiLBjHoGG9hUd1GU\"",
    "mtime": "2025-02-04T06:49:50.682Z",
    "size": 827,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/cameligo/cameligo.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/cameligo/cameligo.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"f64-OrMQ3B+mt+dF+ieyu9cvOuxngRo\"",
    "mtime": "2025-02-04T06:49:50.703Z",
    "size": 3940,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/cameligo/cameligo.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/clojure/clojure.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.743Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/clojure/clojure.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/clojure/clojure.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"357-cFkw0gKqOkAgCA7cyuHzdR+5tKM\"",
    "mtime": "2025-02-04T06:49:50.682Z",
    "size": 855,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/clojure/clojure.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/clojure/clojure.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3823-rxYeeT1Ax8IX6qojcG+ob9uYrJQ\"",
    "mtime": "2025-02-04T06:49:50.703Z",
    "size": 14371,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/clojure/clojure.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/coffee/coffee.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.750Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/coffee/coffee.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/coffee/coffee.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"38f-B+6x28mNajEToqvzBuNN38vdxzc\"",
    "mtime": "2025-02-04T06:49:50.682Z",
    "size": 911,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/coffee/coffee.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/coffee/coffee.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1731-tOpocu6Wbd4gVYOD3RJA5rmq4RM\"",
    "mtime": "2025-02-04T06:49:50.703Z",
    "size": 5937,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/coffee/coffee.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/cpp/cpp.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.743Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/cpp/cpp.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/cpp/cpp.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"478-yUaDKjNEoxcgeBSGZuxbjUg/pJc\"",
    "mtime": "2025-02-04T06:49:50.682Z",
    "size": 1144,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/cpp/cpp.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/cpp/cpp.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"21bb-2pn9H7NPE3g/w7X62YZG4Vjj/Sk\"",
    "mtime": "2025-02-04T06:49:50.703Z",
    "size": 8635,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/cpp/cpp.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/csharp/csharp.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.743Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/csharp/csharp.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/csharp/csharp.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"341-XtGQ8PVU6zWC9ytJCvr0PWv1TCk\"",
    "mtime": "2025-02-04T06:49:50.682Z",
    "size": 833,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/csharp/csharp.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/csharp/csharp.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1ced-xfzQ8Ys543cKPZWu5xXMGTG1zqU\"",
    "mtime": "2025-02-04T06:49:50.704Z",
    "size": 7405,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/csharp/csharp.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/csp/csp.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.743Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/csp/csp.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/csp/csp.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"31d-gDqek/RndrP53s8f3SKXWhuZQjY\"",
    "mtime": "2025-02-04T06:49:50.703Z",
    "size": 797,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/csp/csp.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/csp/csp.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"84b-7L9p5Y+3eU7DrhxbQ7Y5aqwHVs4\"",
    "mtime": "2025-02-04T06:49:50.682Z",
    "size": 2123,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/csp/csp.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/css/css.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.743Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/css/css.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/css/css.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"338-fPF9rpubkb+nhGU/gcS1QPWbJbY\"",
    "mtime": "2025-02-04T06:49:50.682Z",
    "size": 824,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/css/css.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/css/css.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"197a-c4R2v3O5vUHbadvdqC6WDPXHl6U\"",
    "mtime": "2025-02-04T06:49:50.703Z",
    "size": 6522,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/css/css.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/cypher/cypher.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.743Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/cypher/cypher.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/cypher/cypher.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"344-h9gC/F4icPO9c8RPY2L7SFCxnmw\"",
    "mtime": "2025-02-04T06:49:50.682Z",
    "size": 836,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/cypher/cypher.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/cypher/cypher.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"15cb-9W4RJ898ru2u9vAvZPWUmraJ/4A\"",
    "mtime": "2025-02-04T06:49:50.703Z",
    "size": 5579,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/cypher/cypher.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/dart/dart.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.743Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/dart/dart.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/dart/dart.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"35a-gbkH5SQ5JHqexmlU7LCgwnsSQIU\"",
    "mtime": "2025-02-04T06:49:50.682Z",
    "size": 858,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/dart/dart.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/dart/dart.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1af8-N6vIjU514YcXoxTAqPc/55Io1YU\"",
    "mtime": "2025-02-04T06:49:50.703Z",
    "size": 6904,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/dart/dart.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/dockerfile/dockerfile.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.743Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/dockerfile/dockerfile.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/dockerfile/dockerfile.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"36b-VF5fGgoybhCvhJAXoGK6P2NzqcA\"",
    "mtime": "2025-02-04T06:49:50.682Z",
    "size": 875,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/dockerfile/dockerfile.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/dockerfile/dockerfile.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"d7c-WyfZaF/VIRo51cn4mzHQWlel9pc\"",
    "mtime": "2025-02-04T06:49:50.703Z",
    "size": 3452,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/dockerfile/dockerfile.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/ecl/ecl.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.743Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/ecl/ecl.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/ecl/ecl.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"324-Pk37vttHhxQMla9ZO6MJclUZ+e8\"",
    "mtime": "2025-02-04T06:49:50.682Z",
    "size": 804,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/ecl/ecl.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/ecl/ecl.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"20a7-Kfz4vY8OFMnEd+Kbtu6ieJOC4KI\"",
    "mtime": "2025-02-04T06:49:50.710Z",
    "size": 8359,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/ecl/ecl.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/elixir/elixir.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.743Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/elixir/elixir.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/elixir/elixir.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"342-LSu/L8yZBxa+0JkX67bktpIEaFE\"",
    "mtime": "2025-02-04T06:49:50.682Z",
    "size": 834,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/elixir/elixir.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/elixir/elixir.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4ad9-izdHCxXfDXPQ6iVUWWfWaKQ7BX4\"",
    "mtime": "2025-02-04T06:49:50.703Z",
    "size": 19161,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/elixir/elixir.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/flow9/flow9.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.743Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/flow9/flow9.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/flow9/flow9.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"33e-Wnjj2r+6L10OZVEJ5QyFpOk8BlI\"",
    "mtime": "2025-02-04T06:49:50.682Z",
    "size": 830,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/flow9/flow9.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/flow9/flow9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"c6f-ZisqIzwKlf71Wc+VUnIINb1kl2E\"",
    "mtime": "2025-02-04T06:49:50.703Z",
    "size": 3183,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/flow9/flow9.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/freemarker2/freemarker2.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.743Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/freemarker2/freemarker2.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/freemarker2/freemarker2.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"f30-OzFESG1d3piLec/ysOuA8v0Z0P4\"",
    "mtime": "2025-02-04T06:49:50.682Z",
    "size": 3888,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/freemarker2/freemarker2.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/freemarker2/freemarker2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"a9dd-ih6PYI8QUKtRHrrBQaExXfxYWns\"",
    "mtime": "2025-02-04T06:49:50.703Z",
    "size": 43485,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/freemarker2/freemarker2.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/fsharp/fsharp.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.743Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/fsharp/fsharp.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/fsharp/fsharp.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"366-uuDeeiVTfIDTYSgNHxJ8PiiBoNQ\"",
    "mtime": "2025-02-04T06:49:50.682Z",
    "size": 870,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/fsharp/fsharp.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/fsharp/fsharp.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1348-PeMazNjpVgxquOH4gh8quz1064k\"",
    "mtime": "2025-02-04T06:49:50.703Z",
    "size": 4936,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/fsharp/fsharp.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/go/go.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.750Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/go/go.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/go/go.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"30e-ov+Ni0K3vXopMte9CQe/tOlQGyg\"",
    "mtime": "2025-02-04T06:49:50.682Z",
    "size": 782,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/go/go.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/go/go.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"132d-j3j6g48lp0HqBKfs2d4EDu9bCl4\"",
    "mtime": "2025-02-04T06:49:50.703Z",
    "size": 4909,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/go/go.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/graphql/graphql.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.750Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/graphql/graphql.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/graphql/graphql.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"376-WqVWJ1DIL4EMdyaERk8VNqnVPwc\"",
    "mtime": "2025-02-04T06:49:50.682Z",
    "size": 886,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/graphql/graphql.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/graphql/graphql.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1064-QeAhDfXf2l5vtTQPJGYNgBp0fNU\"",
    "mtime": "2025-02-04T06:49:50.703Z",
    "size": 4196,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/graphql/graphql.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/handlebars/handlebars.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.750Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/handlebars/handlebars.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/handlebars/handlebars.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"398-eNs+e10MsYG380X+oJrM1/i2OdA\"",
    "mtime": "2025-02-04T06:49:50.682Z",
    "size": 920,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/handlebars/handlebars.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/handlebars/handlebars.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2dab-mOdBiDyjZjcN1Cn05MtTEZmPEts\"",
    "mtime": "2025-02-04T06:49:50.703Z",
    "size": 11691,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/handlebars/handlebars.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/hcl/hcl.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.750Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/hcl/hcl.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/hcl/hcl.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"342-d0QFAOcR0WAwTBFYllxMD+OtkBs\"",
    "mtime": "2025-02-04T06:49:50.682Z",
    "size": 834,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/hcl/hcl.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/hcl/hcl.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"15f9-bvfZ87nIDPXDitVk4F1MkcVwJ9g\"",
    "mtime": "2025-02-04T06:49:50.703Z",
    "size": 5625,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/hcl/hcl.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/html/html.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.750Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/html/html.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/html/html.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3cf-NZm61nJ682ySqFVN1xX3ofBJq3k\"",
    "mtime": "2025-02-04T06:49:50.682Z",
    "size": 975,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/html/html.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/html/html.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"22c1-kIFifozeA4YFMLWLKTKZNI6gLQQ\"",
    "mtime": "2025-02-04T06:49:50.703Z",
    "size": 8897,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/html/html.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/ini/ini.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.750Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/ini/ini.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/ini/ini.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"384-x7py5s+ubt45EIeg+I0iqxRQnz4\"",
    "mtime": "2025-02-04T06:49:50.683Z",
    "size": 900,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/ini/ini.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/ini/ini.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"827-NH+lAgeF4u3BWKpGQ8i81AIvk/Q\"",
    "mtime": "2025-02-04T06:49:50.703Z",
    "size": 2087,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/ini/ini.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/java/java.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.750Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/java/java.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/java/java.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"362-OV3BTPj8mI77rTuE4WERqblUS2o\"",
    "mtime": "2025-02-04T06:49:50.683Z",
    "size": 866,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/java/java.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/java/java.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"15cc-5CDfyorqiiiZ04EJSVVAKhsATxU\"",
    "mtime": "2025-02-04T06:49:50.703Z",
    "size": 5580,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/java/java.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/javascript/javascript.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.750Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/javascript/javascript.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/javascript/javascript.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3d4-l+rEd3iHRwn/lDmMnH3urjNKmGI\"",
    "mtime": "2025-02-04T06:49:50.703Z",
    "size": 980,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/javascript/javascript.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/javascript/javascript.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"6ae-2InhgQ9bCYuul6BlG3nu4U/Zt+o\"",
    "mtime": "2025-02-04T06:49:50.683Z",
    "size": 1710,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/javascript/javascript.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/julia/julia.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.750Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/julia/julia.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/julia/julia.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"32c-BE9N8m7t/bS25H+rAORCpJDtKDI\"",
    "mtime": "2025-02-04T06:49:50.683Z",
    "size": 812,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/julia/julia.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/julia/julia.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2b24-Ah1IX9NsR6lNz93Rzhyu1GztyHU\"",
    "mtime": "2025-02-04T06:49:50.703Z",
    "size": 11044,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/julia/julia.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/kotlin/kotlin.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.750Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/kotlin/kotlin.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/kotlin/kotlin.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"374-sAjIC0w5AJBX8Odt19prCfBbdMs\"",
    "mtime": "2025-02-04T06:49:50.683Z",
    "size": 884,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/kotlin/kotlin.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/kotlin/kotlin.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1625-j1cDChHCGidhW9VPOAk9EcU4NhU\"",
    "mtime": "2025-02-04T06:49:50.703Z",
    "size": 5669,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/kotlin/kotlin.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/less/less.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.750Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/less/less.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/less/less.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"351-H+4mOhR15whMkMhXMkQCUY/NCiQ\"",
    "mtime": "2025-02-04T06:49:50.703Z",
    "size": 849,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/less/less.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/less/less.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"152e-2bT4cdMYDbaIHw8FGXLvLE/ER3A\"",
    "mtime": "2025-02-04T06:49:50.683Z",
    "size": 5422,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/less/less.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/lexon/lexon.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.750Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/lexon/lexon.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/lexon/lexon.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"324-yg6SsY5INqzlCBY0jpM3duQYYuE\"",
    "mtime": "2025-02-04T06:49:50.683Z",
    "size": 804,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/lexon/lexon.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/lexon/lexon.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1089-5BK6iRSSllf6yceZSk29IeoXN+g\"",
    "mtime": "2025-02-04T06:49:50.703Z",
    "size": 4233,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/lexon/lexon.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/liquid/liquid.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.750Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/liquid/liquid.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/liquid/liquid.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"36d-Sso5ZXkNwpGxRD/CghFtZkeJlWc\"",
    "mtime": "2025-02-04T06:49:50.703Z",
    "size": 877,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/liquid/liquid.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/liquid/liquid.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1918-59vJN6y1yUk0OuURz3g4quJzxhU\"",
    "mtime": "2025-02-04T06:49:50.683Z",
    "size": 6424,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/liquid/liquid.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/lua/lua.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.750Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/lua/lua.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/lua/lua.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"31d-pbw8NERrIdqb88bmkrINv7lZ1cc\"",
    "mtime": "2025-02-04T06:49:50.703Z",
    "size": 797,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/lua/lua.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/lua/lua.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"f0a-4vKDaFNAMaWlPiLdUnw6fQh9bzk\"",
    "mtime": "2025-02-04T06:49:50.683Z",
    "size": 3850,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/lua/lua.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/m3/m3.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.754Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/m3/m3.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/m3/m3.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"345-aF3mklrH+Z3YZsBEvIjg+bnQT1c\"",
    "mtime": "2025-02-04T06:49:50.683Z",
    "size": 837,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/m3/m3.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/m3/m3.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"11d9-WeJO5g8im3Cjb88CerQyPDnLQTE\"",
    "mtime": "2025-02-04T06:49:50.703Z",
    "size": 4569,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/m3/m3.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/markdown/markdown.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.754Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/markdown/markdown.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/markdown/markdown.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"38a-E3xjzwKe7TNqvrqCGJdGh3uL9NM\"",
    "mtime": "2025-02-04T06:49:50.683Z",
    "size": 906,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/markdown/markdown.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/markdown/markdown.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1ba6-AGms5Lvd9hhAweg9vOHMSUiR4oQ\"",
    "mtime": "2025-02-04T06:49:50.704Z",
    "size": 7078,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/markdown/markdown.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/mdx/mdx.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.750Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/mdx/mdx.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/mdx/mdx.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"31d-tpemBZOpSo8FUwekv5shz/2rDa8\"",
    "mtime": "2025-02-04T06:49:50.704Z",
    "size": 797,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/mdx/mdx.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/mdx/mdx.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1c6b-Looxz9fZUDPoRQEnuxk/hb1hXAU\"",
    "mtime": "2025-02-04T06:49:50.683Z",
    "size": 7275,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/mdx/mdx.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/mips/mips.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.754Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/mips/mips.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/mips/mips.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"362-MqU0HpRps/IKwetmL9k9WSyNzeE\"",
    "mtime": "2025-02-04T06:49:50.683Z",
    "size": 866,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/mips/mips.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/mips/mips.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"11ce-zb3Y8Pv82Op+qDa8jIip+CLu+ys\"",
    "mtime": "2025-02-04T06:49:50.704Z",
    "size": 4558,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/mips/mips.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/msdax/msdax.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.754Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/msdax/msdax.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/msdax/msdax.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"335-FOL+cqGMiwRPNDzZjxRYzj33ItQ\"",
    "mtime": "2025-02-04T06:49:50.683Z",
    "size": 821,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/msdax/msdax.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/msdax/msdax.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1cca-3LmsJ4ui40r543rDclTTdDFv4bQ\"",
    "mtime": "2025-02-04T06:49:50.704Z",
    "size": 7370,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/msdax/msdax.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/mysql/mysql.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.759Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/mysql/mysql.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/mysql/mysql.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"327-8r483JNjMs+AZHkhiyIelI93QTU\"",
    "mtime": "2025-02-04T06:49:50.683Z",
    "size": 807,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/mysql/mysql.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/mysql/mysql.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"40c3-FfwXuWAaC4gWhm6d+EFQL0XcZ7k\"",
    "mtime": "2025-02-04T06:49:50.704Z",
    "size": 16579,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/mysql/mysql.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/objective-c/objective-c.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.754Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/objective-c/objective-c.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/objective-c/objective-c.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"34c-IShckXGg98xQPFQJtA73KyxtcZs\"",
    "mtime": "2025-02-04T06:49:50.683Z",
    "size": 844,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/objective-c/objective-c.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/objective-c/objective-c.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"f4c-t2cJ6c91csjhDRxNd4pDoZ1jjDY\"",
    "mtime": "2025-02-04T06:49:50.704Z",
    "size": 3916,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/objective-c/objective-c.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/pascal/pascal.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.754Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/pascal/pascal.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/pascal/pascal.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"377-qbsxIv1ieMoSq4pjQxfYYi7QqH0\"",
    "mtime": "2025-02-04T06:49:50.683Z",
    "size": 887,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/pascal/pascal.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/pascal/pascal.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1411-P68+UdziRlzv5qxFoq+o8NGqD+M\"",
    "mtime": "2025-02-04T06:49:50.704Z",
    "size": 5137,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/pascal/pascal.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/pascaligo/pascaligo.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.754Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/pascaligo/pascaligo.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/pascaligo/pascaligo.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"349-N5eztNfDIsyo4wA5Bj0KECY6vqo\"",
    "mtime": "2025-02-04T06:49:50.683Z",
    "size": 841,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/pascaligo/pascaligo.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/pascaligo/pascaligo.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"e60-DIzb/LlMF3Fp2KJoY2A4L2Iw9YA\"",
    "mtime": "2025-02-04T06:49:50.704Z",
    "size": 3680,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/pascaligo/pascaligo.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/perl/perl.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.754Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/perl/perl.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/perl/perl.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"329-1eYDMFVrh1Kdt4TRRGKmmSC7iqg\"",
    "mtime": "2025-02-04T06:49:50.683Z",
    "size": 809,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/perl/perl.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/perl/perl.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"33b7-m5PmrX0t9BtMJfs3sSK2oLHOmOw\"",
    "mtime": "2025-02-04T06:49:50.704Z",
    "size": 13239,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/perl/perl.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/pgsql/pgsql.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.754Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/pgsql/pgsql.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/pgsql/pgsql.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"340-63742YEvjkw7RpLor2hA0Gxnn0o\"",
    "mtime": "2025-02-04T06:49:50.683Z",
    "size": 832,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/pgsql/pgsql.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/pgsql/pgsql.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"48ed-fQYOQIfN37wgVYlKPVTj2cHOKTM\"",
    "mtime": "2025-02-04T06:49:50.704Z",
    "size": 18669,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/pgsql/pgsql.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/php/php.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.754Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/php/php.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/php/php.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"365-of0iiKk6cnyVG3UiqnBkR4B+kmw\"",
    "mtime": "2025-02-04T06:49:50.683Z",
    "size": 869,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/php/php.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/php/php.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3265-S3t6ji8r+vewP6TFLv2mJeXf3F4\"",
    "mtime": "2025-02-04T06:49:50.704Z",
    "size": 12901,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/php/php.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/pla/pla.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.754Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/pla/pla.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/pla/pla.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"302-6dAVtbcMvw6qNCFx1ugacMtoGsU\"",
    "mtime": "2025-02-04T06:49:50.683Z",
    "size": 770,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/pla/pla.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/pla/pla.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"cdd-owW9cFPa7PMOepcWxZocX7GFOpQ\"",
    "mtime": "2025-02-04T06:49:50.710Z",
    "size": 3293,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/pla/pla.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/postiats/postiats.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.754Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/postiats/postiats.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/postiats/postiats.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"357-FwLdWUg1VgqaddEziZUvFTpvwtY\"",
    "mtime": "2025-02-04T06:49:50.683Z",
    "size": 855,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/postiats/postiats.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/postiats/postiats.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4d14-QI5AdpGMo0nEffEm4mwbKfAtlu4\"",
    "mtime": "2025-02-04T06:49:50.704Z",
    "size": 19732,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/postiats/postiats.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/powerquery/powerquery.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.754Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/powerquery/powerquery.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/powerquery/powerquery.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"36b-uc4Yovq7gnEW18w7W+GtXn8ODfo\"",
    "mtime": "2025-02-04T06:49:50.683Z",
    "size": 875,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/powerquery/powerquery.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/powerquery/powerquery.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"563e-Q8WLnIaDhcO3JJMJL5MvfDSynsY\"",
    "mtime": "2025-02-04T06:49:50.704Z",
    "size": 22078,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/powerquery/powerquery.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/powershell/powershell.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.754Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/powershell/powershell.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/powershell/powershell.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"374-Q7htGE5rPdQpwfyOcUDCNGyfAO0\"",
    "mtime": "2025-02-04T06:49:50.683Z",
    "size": 884,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/powershell/powershell.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/powershell/powershell.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"16bd-zwbMqs2Dwh4FWfVLm06N8e+yB4Y\"",
    "mtime": "2025-02-04T06:49:50.704Z",
    "size": 5821,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/powershell/powershell.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/protobuf/protobuf.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.754Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/protobuf/protobuf.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/protobuf/protobuf.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"34c-dbo50IfWT1sCIU0mo1EGKbBGm4c\"",
    "mtime": "2025-02-04T06:49:50.683Z",
    "size": 844,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/protobuf/protobuf.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/protobuf/protobuf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3334-wa5C5I/zK3NxuVUup07OCfswQz0\"",
    "mtime": "2025-02-04T06:49:50.704Z",
    "size": 13108,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/protobuf/protobuf.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/pug/pug.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.754Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/pug/pug.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/pug/pug.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"32f-gQlDEKcVgrnkUM/s7W3OhvlMwIM\"",
    "mtime": "2025-02-04T06:49:50.683Z",
    "size": 815,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/pug/pug.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/pug/pug.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"21ea-ELpK6rX6H/p5FI3kNeK2LrRBqhA\"",
    "mtime": "2025-02-04T06:49:50.704Z",
    "size": 8682,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/pug/pug.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/python/python.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.758Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/python/python.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/python/python.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"384-tY8KbeVtP2bHuFtA61p/eONhlCQ\"",
    "mtime": "2025-02-04T06:49:50.683Z",
    "size": 900,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/python/python.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/python/python.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1e4a-2++o2508APM5NW1FmlkoJxTluDk\"",
    "mtime": "2025-02-04T06:49:50.704Z",
    "size": 7754,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/python/python.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/qsharp/qsharp.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.758Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/qsharp/qsharp.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/qsharp/qsharp.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"330-f5iDtGDv2iFJRauZqxO/fSWjl9c\"",
    "mtime": "2025-02-04T06:49:50.683Z",
    "size": 816,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/qsharp/qsharp.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/qsharp/qsharp.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"15bf-2C8WNC0jcXLJ595lk67sUNoS/+w\"",
    "mtime": "2025-02-04T06:49:50.704Z",
    "size": 5567,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/qsharp/qsharp.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/r/r.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.758Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/r/r.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/r/r.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"334-QUvEzkoViDPQybkE1SSQKMNl/wU\"",
    "mtime": "2025-02-04T06:49:50.683Z",
    "size": 820,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/r/r.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/r/r.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1460-ymmj3l0wqj+lhrB1J3JF/Ygf9Ik\"",
    "mtime": "2025-02-04T06:49:50.710Z",
    "size": 5216,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/r/r.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/razor/razor.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.758Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/razor/razor.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/razor/razor.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"350-daUdIiE48ZoVM3yiu+ASTpFrztc\"",
    "mtime": "2025-02-04T06:49:50.683Z",
    "size": 848,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/razor/razor.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/razor/razor.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3911-Gh8C1XI4mL8r5taY2kyyNzHcBd8\"",
    "mtime": "2025-02-04T06:49:50.710Z",
    "size": 14609,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/razor/razor.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/redis/redis.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.758Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/redis/redis.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/redis/redis.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"326-0um7xXkfp9wqqt5x7ujlPtaPibs\"",
    "mtime": "2025-02-04T06:49:50.684Z",
    "size": 806,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/redis/redis.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/redis/redis.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1629-iXrBEAKAh6KArLYxVcIiFxaoMd8\"",
    "mtime": "2025-02-04T06:49:50.710Z",
    "size": 5673,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/redis/redis.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/redshift/redshift.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.758Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/redshift/redshift.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/redshift/redshift.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"33f-LtYRvpVXbM2k+Ru0CnswCUv+2u4\"",
    "mtime": "2025-02-04T06:49:50.684Z",
    "size": 831,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/redshift/redshift.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/redshift/redshift.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4174-aGoWU588FZdh8grk+DEAtHGD9uk\"",
    "mtime": "2025-02-04T06:49:50.710Z",
    "size": 16756,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/redshift/redshift.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/restructuredtext/restructuredtext.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.758Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/restructuredtext/restructuredtext.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/restructuredtext/restructuredtext.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"385-qCIGm9ysjpuXcVIdjdTfQMfCzng\"",
    "mtime": "2025-02-04T06:49:50.684Z",
    "size": 901,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/restructuredtext/restructuredtext.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/restructuredtext/restructuredtext.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"168b-tHvNfz2uLrozUdOSu2U6eZm9RJk\"",
    "mtime": "2025-02-04T06:49:50.710Z",
    "size": 5771,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/restructuredtext/restructuredtext.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/ruby/ruby.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.758Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/ruby/ruby.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/ruby/ruby.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"36b-+CTn7FHk6aYxP32oBYOtYSRdn1g\"",
    "mtime": "2025-02-04T06:49:50.684Z",
    "size": 875,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/ruby/ruby.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/ruby/ruby.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3d77-cQC1R8Qo/E1YTBq3/rr+1TzMcE8\"",
    "mtime": "2025-02-04T06:49:50.718Z",
    "size": 15735,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/ruby/ruby.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/rust/rust.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.758Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/rust/rust.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/rust/rust.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"32d-1iL1UFKWMDIBuZuJvtyuKQ84f/s\"",
    "mtime": "2025-02-04T06:49:50.684Z",
    "size": 813,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/rust/rust.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/rust/rust.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1a25-LGd0xfAhwgHoAF2DFzv+BvDCMEQ\"",
    "mtime": "2025-02-04T06:49:50.710Z",
    "size": 6693,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/rust/rust.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/sb/sb.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.758Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/sb/sb.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/sb/sb.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"31d-ywV8mowSdqSSt8r45PpdqeY14pE\"",
    "mtime": "2025-02-04T06:49:50.710Z",
    "size": 797,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/sb/sb.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/sb/sb.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"c9d-7bC3fdDkz5KwgdvQUgkRVFEqgzs\"",
    "mtime": "2025-02-04T06:49:50.684Z",
    "size": 3229,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/sb/sb.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/scala/scala.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.758Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/scala/scala.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/scala/scala.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3b9-T/eE6wJXyZV8q4p0+BkKaAsT9GM\"",
    "mtime": "2025-02-04T06:49:50.684Z",
    "size": 953,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/scala/scala.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/scala/scala.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2b73-c8Wnomm8XbySCabGUYw9D2ylrMM\"",
    "mtime": "2025-02-04T06:49:50.710Z",
    "size": 11123,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/scala/scala.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/scheme/scheme.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.758Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/scheme/scheme.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/scheme/scheme.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"34c-26BvOLAKzcIIYMDkdCX+E5yIRgM\"",
    "mtime": "2025-02-04T06:49:50.684Z",
    "size": 844,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/scheme/scheme.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/scheme/scheme.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"adc-d+A32nHsQe+RQl0uRJATuvFyVs4\"",
    "mtime": "2025-02-04T06:49:50.710Z",
    "size": 2780,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/scheme/scheme.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/scss/scss.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.758Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/scss/scss.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/scss/scss.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"359-Eh9lZ++uQDGwF8SK65kKmiLYkEQ\"",
    "mtime": "2025-02-04T06:49:50.684Z",
    "size": 857,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/scss/scss.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/scss/scss.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2511-975yOvYd5manwUhSiKHiipAieuE\"",
    "mtime": "2025-02-04T06:49:50.710Z",
    "size": 9489,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/scss/scss.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/shell/shell.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.758Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/shell/shell.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/shell/shell.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"332-3fLLrupdkgqkc4d0zwjtowo3RCw\"",
    "mtime": "2025-02-04T06:49:50.684Z",
    "size": 818,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/shell/shell.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/shell/shell.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1329-IRp49ysxROxjQYjMocD+Qya/v/o\"",
    "mtime": "2025-02-04T06:49:50.710Z",
    "size": 4905,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/shell/shell.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/solidity/solidity.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.758Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/solidity/solidity.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/solidity/solidity.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"347-pSUhDNuYK/g3GCjTshAl0Vy3KdY\"",
    "mtime": "2025-02-04T06:49:50.684Z",
    "size": 839,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/solidity/solidity.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/solidity/solidity.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"6756-IKdqRkiD8tnWu8y49T8gGA+V9ag\"",
    "mtime": "2025-02-04T06:49:50.710Z",
    "size": 26454,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/solidity/solidity.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/sophia/sophia.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.758Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/sophia/sophia.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/sophia/sophia.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"339-2tmyr/zuprhFFx9E1aNS3Ki9w7Y\"",
    "mtime": "2025-02-04T06:49:50.684Z",
    "size": 825,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/sophia/sophia.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/sophia/sophia.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1258-kZk0mjpsuMcY3fIouoo575L9MMk\"",
    "mtime": "2025-02-04T06:49:50.710Z",
    "size": 4696,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/sophia/sophia.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/sparql/sparql.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.758Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/sparql/sparql.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/sparql/sparql.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"334-SbRKrBgEb/0Iu5CqqoLfpzWh120\"",
    "mtime": "2025-02-04T06:49:50.684Z",
    "size": 820,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/sparql/sparql.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/sparql/sparql.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1108-2H0wao97jjGJJc5Y0GufARoZnK8\"",
    "mtime": "2025-02-04T06:49:50.710Z",
    "size": 4360,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/sparql/sparql.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/sql/sql.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.758Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/sql/sql.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/sql/sql.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"316-yQ6xWdZPzmzdaIaEdSN2mdBGjs8\"",
    "mtime": "2025-02-04T06:49:50.710Z",
    "size": 790,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/sql/sql.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/sql/sql.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3e69-XiaKAMpGI8vEPbHBylfzV4/4918\"",
    "mtime": "2025-02-04T06:49:50.684Z",
    "size": 15977,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/sql/sql.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/st/st.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.759Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/st/st.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/st/st.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"36f-N3B27t022KWRQMjwYK9Yub2KHKU\"",
    "mtime": "2025-02-04T06:49:50.684Z",
    "size": 879,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/st/st.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/st/st.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2949-0p5JrRDRsQ1wj2LtDpPxR+z8yw4\"",
    "mtime": "2025-02-04T06:49:50.710Z",
    "size": 10569,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/st/st.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/swift/swift.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.758Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/swift/swift.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/swift/swift.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"34c-SKwlZZ2T2zVZLD+skAfaKAw37P0\"",
    "mtime": "2025-02-04T06:49:50.684Z",
    "size": 844,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/swift/swift.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/swift/swift.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1db0-M51bQGnotL8jPvpAf7ZfIdneXLY\"",
    "mtime": "2025-02-04T06:49:50.710Z",
    "size": 7600,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/swift/swift.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/systemverilog/systemverilog.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.758Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/systemverilog/systemverilog.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/systemverilog/systemverilog.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4e9-HA9sCvbvo7Hb5PW6igx48hP1/9Y\"",
    "mtime": "2025-02-04T06:49:50.684Z",
    "size": 1257,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/systemverilog/systemverilog.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/systemverilog/systemverilog.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2f23-ZaSvlgv9QIP7WVgvv0u+NDu8ZXE\"",
    "mtime": "2025-02-04T06:49:50.710Z",
    "size": 12067,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/systemverilog/systemverilog.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/tcl/tcl.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.758Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/tcl/tcl.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/tcl/tcl.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"343-ODNHc2BK+iKMP0LuvCmDuuqRL7k\"",
    "mtime": "2025-02-04T06:49:50.684Z",
    "size": 835,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/tcl/tcl.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/tcl/tcl.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"155b-R3bF3L7CQ/nhnA/CzfRrEUrDatw\"",
    "mtime": "2025-02-04T06:49:50.710Z",
    "size": 5467,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/tcl/tcl.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/twig/twig.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.759Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/twig/twig.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/twig/twig.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"344-7FtLzAIcBSV8FD2ALQZWPXjj1mA\"",
    "mtime": "2025-02-04T06:49:50.684Z",
    "size": 836,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/twig/twig.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/twig/twig.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"29b6-39XWXxUqG14bGXg5gmJiCJONFAo\"",
    "mtime": "2025-02-04T06:49:50.710Z",
    "size": 10678,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/twig/twig.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/typescript/typescript.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.759Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/typescript/typescript.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/typescript/typescript.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"394-OCZ0EcmueMJsXWSwYb/tnuNV8WY\"",
    "mtime": "2025-02-04T06:49:50.684Z",
    "size": 916,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/typescript/typescript.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/typescript/typescript.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2421-QjC2+LZ25C5Cy0MbfAfqK0FnSpE\"",
    "mtime": "2025-02-04T06:49:50.710Z",
    "size": 9249,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/typescript/typescript.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/typespec/typespec.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.759Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/typespec/typespec.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/typespec/typespec.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"339-WGBQgNEg+eRj/NONdgHZ3o/LHfg\"",
    "mtime": "2025-02-04T06:49:50.684Z",
    "size": 825,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/typespec/typespec.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/typespec/typespec.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"10d5-qNfW0K87KIHD/ThGZ8qmNDlQACU\"",
    "mtime": "2025-02-04T06:49:50.710Z",
    "size": 4309,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/typespec/typespec.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/vb/vb.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.759Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/vb/vb.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/vb/vb.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"31e-Qd6JZ9eQiD3pRy09KPEbKfc4AAA\"",
    "mtime": "2025-02-04T06:49:50.684Z",
    "size": 798,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/vb/vb.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/vb/vb.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2229-yfRP6Nq5IxW8cdw1yXqHeTNJV2g\"",
    "mtime": "2025-02-04T06:49:50.710Z",
    "size": 8745,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/vb/vb.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/wgsl/wgsl.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.759Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/wgsl/wgsl.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/wgsl/wgsl.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"341-lRsBSTLa1MnvrM1Nrq1dfcSlxpk\"",
    "mtime": "2025-02-04T06:49:50.684Z",
    "size": 833,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/wgsl/wgsl.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/wgsl/wgsl.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"27af-cz9+wPRxRwgb9eLE+Y9g5f9e/fQ\"",
    "mtime": "2025-02-04T06:49:50.710Z",
    "size": 10159,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/wgsl/wgsl.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/xml/xml.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.759Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/xml/xml.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/xml/xml.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"490-RCs3msavJg/P8tQ/W7dZCitWSog\"",
    "mtime": "2025-02-04T06:49:50.684Z",
    "size": 1168,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/xml/xml.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/xml/xml.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"ffb-YQ04ljGUGjnO9vZUKKct87fOw8o\"",
    "mtime": "2025-02-04T06:49:50.710Z",
    "size": 4091,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/xml/xml.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/yaml/yaml.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.759Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/yaml/yaml.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/yaml/yaml.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"370-dsH7u97zL0TMM0NOjT5iQ1EjSvw\"",
    "mtime": "2025-02-04T06:49:50.684Z",
    "size": 880,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/yaml/yaml.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/basic-languages/yaml/yaml.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1bd8-qSPFdwxqdgW7QCvZu7N8w7boWVg\"",
    "mtime": "2025-02-04T06:49:50.710Z",
    "size": 7128,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/basic-languages/yaml/yaml.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/dompurify/dompurify.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"fc7e-d+KTDILYTxMwP3nbzyRr89/Hv/w\"",
    "mtime": "2025-02-04T06:49:50.678Z",
    "size": 64638,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/dompurify/dompurify.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/widget.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"8b6-f06DSzv8Nh10HWfIP5iOXEe6XyI\"",
    "mtime": "2025-02-04T06:49:50.711Z",
    "size": 2230,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/widget.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/diff/diff.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"c705-JzMpl41B7QV3TCXZqbgqmyQS6ms\"",
    "mtime": "2025-02-04T06:49:50.678Z",
    "size": 50949,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/diff/diff.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/diff/diffChange.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"51f-l8iA/0DM7FeHhShLhKPSC/7EciA\"",
    "mtime": "2025-02-04T06:49:50.711Z",
    "size": 1311,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/diff/diffChange.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/marked/marked.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"123a7-g1YLBkNZkhR/ydTUklLe7L9emCg\"",
    "mtime": "2025-02-04T06:49:50.685Z",
    "size": 74663,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/marked/marked.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/naturalLanguage/korean.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3050-+lrD4tleHyh1mS+f2DK9ncp0AuI\"",
    "mtime": "2025-02-04T06:49:50.685Z",
    "size": 12368,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/naturalLanguage/korean.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/observableInternal/api.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3af-BrRI4Dw3gBzDBMUA3ffnfN4hmbM\"",
    "mtime": "2025-02-04T06:49:50.685Z",
    "size": 943,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/observableInternal/api.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/observableInternal/autorun.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1de4-W6A5fY3S5ZCNG6PlqRsrC8OAgOg\"",
    "mtime": "2025-02-04T06:49:50.711Z",
    "size": 7652,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/observableInternal/autorun.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/observableInternal/base.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"220c-63XqCQr8F9Mg9PgXzZDQcJ6o9E0\"",
    "mtime": "2025-02-04T06:49:50.711Z",
    "size": 8716,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/observableInternal/base.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/observableInternal/debugName.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"c93-s8aWGreuB8V1bk2NCx+qvYC9Mjs\"",
    "mtime": "2025-02-04T06:49:50.711Z",
    "size": 3219,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/observableInternal/debugName.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/observableInternal/derived.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3059-k+okTDUYlVUJQpKCTlDfAo2TWhc\"",
    "mtime": "2025-02-04T06:49:50.711Z",
    "size": 12377,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/observableInternal/derived.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/observableInternal/lazyObservableValue.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"fd5-BNloUejArDcMJ3gRZEFr5OkKxI4\"",
    "mtime": "2025-02-04T06:49:50.711Z",
    "size": 4053,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/observableInternal/lazyObservableValue.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/observableInternal/logging.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"201f-6V9vfMLrttk9B+kBS63ydmXz1Ag\"",
    "mtime": "2025-02-04T06:49:50.711Z",
    "size": 8223,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/observableInternal/logging.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/observableInternal/promise.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"dad-t8QBSUMrT7kDg7x+lAM6W9ju8N0\"",
    "mtime": "2025-02-04T06:49:50.711Z",
    "size": 3501,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/observableInternal/promise.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/observableInternal/utils.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2f1b-Nkx5yO1ui5AmVX6yXnZcaLI/XGc\"",
    "mtime": "2025-02-04T06:49:50.711Z",
    "size": 12059,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/observableInternal/utils.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/common/worker/simpleWorker.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"469c-0RuEsPWyUKbvaW4PZlv3d9YlNEE\"",
    "mtime": "2025-02-04T06:49:50.685Z",
    "size": 18076,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/common/worker/simpleWorker.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/config/charWidthReader.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"f82-UGXXcb3T+fYX+f0AL2UD11MYyFI\"",
    "mtime": "2025-02-04T06:49:50.678Z",
    "size": 3970,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/config/charWidthReader.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/config/domFontInfo.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"591-2pjU8z80TonqLEfCPZwIcVf9dFA\"",
    "mtime": "2025-02-04T06:49:50.711Z",
    "size": 1425,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/config/domFontInfo.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/config/editorConfiguration.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2f43-FcM+ltBpNXmyCOGhp3TMFmdIFao\"",
    "mtime": "2025-02-04T06:49:50.711Z",
    "size": 12099,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/config/editorConfiguration.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/config/elementSizeObserver.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"10ab-/LCTIYHRD2/e7ARFDks0YMnO4rA\"",
    "mtime": "2025-02-04T06:49:50.711Z",
    "size": 4267,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/config/elementSizeObserver.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/config/fontMeasurements.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2831-OXAPZ/A/0YZbmNTOibEdYeU8/io\"",
    "mtime": "2025-02-04T06:49:50.711Z",
    "size": 10289,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/config/fontMeasurements.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/config/migrateOptions.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"20aa-0C2g0BN0FNjH6bTs5kMezG6x/j4\"",
    "mtime": "2025-02-04T06:49:50.711Z",
    "size": 8362,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/config/migrateOptions.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/config/tabFocus.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"429-8ZLJEncD//m8+spJ540p4nJDLgw\"",
    "mtime": "2025-02-04T06:49:50.711Z",
    "size": 1065,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/config/tabFocus.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/controller/mouseHandler.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"7a6f-ayMadqZ3dcnGH6fhnona8OCE6Uk\"",
    "mtime": "2025-02-04T06:49:50.685Z",
    "size": 31343,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/controller/mouseHandler.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/controller/mouseTarget.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b7c2-YWSXkO3z7uiFMNUtanBTpSkl8tY\"",
    "mtime": "2025-02-04T06:49:50.711Z",
    "size": 47042,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/controller/mouseTarget.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/controller/pointerHandler.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1a30-D+kwfrYPIFPwD/0MKdkR3/T3v2A\"",
    "mtime": "2025-02-04T06:49:50.711Z",
    "size": 6704,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/controller/pointerHandler.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/controller/textAreaHandler.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"454-V7obZokFlCYXWFqDn0qutCSLI8c\"",
    "mtime": "2025-02-04T06:49:50.711Z",
    "size": 1108,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/controller/textAreaHandler.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/controller/textAreaHandler.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"aba7-AuTdu9RB8VcVKVa5HgEadb4qUH8\"",
    "mtime": "2025-02-04T06:49:50.711Z",
    "size": 43943,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/controller/textAreaHandler.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/controller/textAreaInput.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"7c1f-kxNGOvsSpzYoyMD7JhNOSarRXDI\"",
    "mtime": "2025-02-04T06:49:50.711Z",
    "size": 31775,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/controller/textAreaInput.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/controller/textAreaState.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"314c-ea64tHAYvDsdE4PzsGE+gytlHx4\"",
    "mtime": "2025-02-04T06:49:50.711Z",
    "size": 12620,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/controller/textAreaState.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/services/abstractCodeEditorService.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"13f1-WWrxRz9gXTtF8vHn/mXDNky3DV8\"",
    "mtime": "2025-02-04T06:49:50.711Z",
    "size": 5105,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/services/abstractCodeEditorService.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/services/bulkEditService.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"a31-/nT0ag2sXoacv4paep4MMwIpwXg\"",
    "mtime": "2025-02-04T06:49:50.711Z",
    "size": 2609,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/services/bulkEditService.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/services/codeEditorService.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"203-Dp6hmCvpBAmD52Lr+7O3NrlPx+c\"",
    "mtime": "2025-02-04T06:49:50.711Z",
    "size": 515,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/services/codeEditorService.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/services/editorWorkerService.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4097-WddvDsDARw4DwkO6eLQCmoX6NoM\"",
    "mtime": "2025-02-04T06:49:50.711Z",
    "size": 16535,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/services/editorWorkerService.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/services/markerDecorations.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"7b1-oN5NBICFBQoyyB8C+4mvnMZg8Wg\"",
    "mtime": "2025-02-04T06:49:50.711Z",
    "size": 1969,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/services/markerDecorations.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/services/openerService.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"23f9-B4RSxryZP66B1F9tiF9H6xra9q0\"",
    "mtime": "2025-02-04T06:49:50.711Z",
    "size": 9209,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/services/openerService.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/view/domLineBreaksComputer.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"35b5-wPea1R84a06LX20T6CXlEd9+KcA\"",
    "mtime": "2025-02-04T06:49:50.685Z",
    "size": 13749,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/view/domLineBreaksComputer.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/view/dynamicViewOverlay.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1e2-cmnWWA6Af/B6usAs/LDRgA+eqOs\"",
    "mtime": "2025-02-04T06:49:50.711Z",
    "size": 482,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/view/dynamicViewOverlay.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/view/renderingContext.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"ed4-maW8j5ck+nLHwBsBitCKenTapA4\"",
    "mtime": "2025-02-04T06:49:50.711Z",
    "size": 3796,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/view/renderingContext.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/view/viewController.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2a47-C237J3qqzuL+a9dPSI8PQrGNxIE\"",
    "mtime": "2025-02-04T06:49:50.711Z",
    "size": 10823,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/view/viewController.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/view/viewLayer.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4afa-KPS7xXcgvuURGrCMSthJVGqqjUE\"",
    "mtime": "2025-02-04T06:49:50.712Z",
    "size": 19194,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/view/viewLayer.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/view/viewOverlays.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1bf8-HAcJ7l9x+nrthhWDJmmr8km1c/g\"",
    "mtime": "2025-02-04T06:49:50.712Z",
    "size": 7160,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/view/viewOverlays.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/view/viewPart.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"643-5OSZMgM8Rq/nxjhqHhp0P4KBr0g\"",
    "mtime": "2025-02-04T06:49:50.712Z",
    "size": 1603,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/view/viewPart.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/view/viewUserInputEvents.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"de6-yxhXpcSVyuJchJPmYEPMabKheNc\"",
    "mtime": "2025-02-04T06:49:50.712Z",
    "size": 3558,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/view/viewUserInputEvents.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/commands/replaceCommand.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"dd2-pok3pdX3xjLexgkg0jSIdgx7A5Y\"",
    "mtime": "2025-02-04T06:49:50.678Z",
    "size": 3538,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/commands/replaceCommand.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/commands/shiftCommand.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3386-S5SMU3mSYypLzEdFa7X5iiE92sA\"",
    "mtime": "2025-02-04T06:49:50.712Z",
    "size": 13190,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/commands/shiftCommand.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/commands/surroundSelectionCommand.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"95b-/gYsWQU+62SE58vmEA4TjA8gers\"",
    "mtime": "2025-02-04T06:49:50.712Z",
    "size": 2395,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/commands/surroundSelectionCommand.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/commands/trimTrailingWhitespaceCommand.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"10ed-6X/YT2R3xACP7FlygDzMZRJxetw\"",
    "mtime": "2025-02-04T06:49:50.712Z",
    "size": 4333,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/commands/trimTrailingWhitespaceCommand.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/config/diffEditor.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"50e-uXOqmrNoAHkZNKvEVhot0yywV5o\"",
    "mtime": "2025-02-04T06:49:50.685Z",
    "size": 1294,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/config/diffEditor.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/config/editorConfiguration.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"16b-EowE4pZYkCnO5xAyY6EVxovwQ0M\"",
    "mtime": "2025-02-04T06:49:50.712Z",
    "size": 363,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/config/editorConfiguration.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/config/editorConfigurationSchema.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4033-iBMyUv3cr9jT9B3TMOkUU0XiLtM\"",
    "mtime": "2025-02-04T06:49:50.712Z",
    "size": 16435,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/config/editorConfigurationSchema.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/config/editorOptions.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2b79b-iaOhOc2OU5Y9LAnzdtya/cRNDkY\"",
    "mtime": "2025-02-04T06:49:50.712Z",
    "size": 178075,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/config/editorOptions.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/config/editorZoom.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3b7-/oXuuvMwT1+67HZf5Mgq1iItcSg\"",
    "mtime": "2025-02-04T06:49:50.712Z",
    "size": 951,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/config/editorZoom.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/config/fontInfo.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"19cc-7OF88ys1Xn4m//5BX3zFX34Tc1c\"",
    "mtime": "2025-02-04T06:49:50.712Z",
    "size": 6604,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/config/fontInfo.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/core/characterClassifier.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"73d-ZcqjbdKOOWelbDUPvXyehc+PkoM\"",
    "mtime": "2025-02-04T06:49:50.685Z",
    "size": 1853,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/core/characterClassifier.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/core/cursorColumns.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1219-xVPOtdpU5RIzHS3Ix0mGAzTWNk8\"",
    "mtime": "2025-02-04T06:49:50.712Z",
    "size": 4633,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/core/cursorColumns.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/core/dimension.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"16b-EowE4pZYkCnO5xAyY6EVxovwQ0M\"",
    "mtime": "2025-02-04T06:49:50.712Z",
    "size": 363,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/core/dimension.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/core/editOperation.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"40e-z014hSIbA7UdT/aPEMJfD9YOaV0\"",
    "mtime": "2025-02-04T06:49:50.712Z",
    "size": 1038,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/core/editOperation.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/core/editorColorRegistry.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4bd7-k5JKSAf4p32Cbu2t0rTTmfSm4KY\"",
    "mtime": "2025-02-04T06:49:50.712Z",
    "size": 19415,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/core/editorColorRegistry.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/core/eolCounter.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"61c-NYVuVpCgzxq+Rv5XPqTgClS+NFw\"",
    "mtime": "2025-02-04T06:49:50.712Z",
    "size": 1564,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/core/eolCounter.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/core/indentation.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5ee-sMugd0P1q8L//rgvkpyMlODgSJA\"",
    "mtime": "2025-02-04T06:49:50.712Z",
    "size": 1518,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/core/indentation.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/core/lineRange.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"31d5-8m90DXFFbZBc3fd8+FyDvLmMw14\"",
    "mtime": "2025-02-04T06:49:50.712Z",
    "size": 12757,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/core/lineRange.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/core/offsetRange.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1a82-hmLBV/q3ZyzmwJog+q+NDVZNXXY\"",
    "mtime": "2025-02-04T06:49:50.712Z",
    "size": 6786,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/core/offsetRange.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/core/position.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"fb9-ty1ppEOIrmZplYNavMiYJ2rHyZI\"",
    "mtime": "2025-02-04T06:49:50.712Z",
    "size": 4025,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/core/position.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/core/positionToOffset.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"39d-q1xrzLtZWW0motg7jvJ5U9Qt+j8\"",
    "mtime": "2025-02-04T06:49:50.712Z",
    "size": 925,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/core/positionToOffset.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/core/range.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3ac4-rAx47X2xJrExNXlMG0XCR5u1vLQ\"",
    "mtime": "2025-02-04T06:49:50.712Z",
    "size": 15044,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/core/range.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/core/rgba.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"42c-cwls9xxx2Vs+A3rXBee5z0j3fpA\"",
    "mtime": "2025-02-04T06:49:50.712Z",
    "size": 1068,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/core/rgba.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/core/selection.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"154b-58KtTI94IctZth0EWUbgcfoPnOc\"",
    "mtime": "2025-02-04T06:49:50.712Z",
    "size": 5451,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/core/selection.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/core/stringBuilder.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"10db-qxKeLi8y+ZAYSetmssNBW6xMh3k\"",
    "mtime": "2025-02-04T06:49:50.712Z",
    "size": 4315,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/core/stringBuilder.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/core/textChange.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"25b8-/X9iGO/ACyVHpauwhZToU+VB7GE\"",
    "mtime": "2025-02-04T06:49:50.712Z",
    "size": 9656,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/core/textChange.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/core/textEdit.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"e90-IkmxVASObEZjZQmiSW2TX7mCoBo\"",
    "mtime": "2025-02-04T06:49:50.712Z",
    "size": 3728,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/core/textEdit.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/core/textLength.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"9a8-nVrZgUIpJmnXKRSs12C7hc91WoY\"",
    "mtime": "2025-02-04T06:49:50.712Z",
    "size": 2472,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/core/textLength.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/core/textModelDefaults.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"299-PjXAubv2JS5mDDe2/one1lA0qnk\"",
    "mtime": "2025-02-04T06:49:50.712Z",
    "size": 665,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/core/textModelDefaults.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/core/wordCharacterClassifier.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"c98-RkcFTkTyQNFv9hzAOd96TiB8ZVo\"",
    "mtime": "2025-02-04T06:49:50.712Z",
    "size": 3224,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/core/wordCharacterClassifier.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/core/wordHelper.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1190-iq59FkJuGi2OcrpJZytIlVobFaQ\"",
    "mtime": "2025-02-04T06:49:50.714Z",
    "size": 4496,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/core/wordHelper.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/cursor/cursor.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"a270-64eNh2czyYcAUKuTCKXS0dJcro8\"",
    "mtime": "2025-02-04T06:49:50.685Z",
    "size": 41584,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/cursor/cursor.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/cursor/cursorAtomicMoveOperations.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"197c-qGibBm+ZW9ErgOwu/oIc2HJcZO4\"",
    "mtime": "2025-02-04T06:49:50.713Z",
    "size": 6524,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/cursor/cursorAtomicMoveOperations.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/cursor/cursorCollection.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"22e3-Ix/eFQ4CgGUHCUm0hpQgNPp8m80\"",
    "mtime": "2025-02-04T06:49:50.713Z",
    "size": 8931,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/cursor/cursorCollection.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/cursor/cursorColumnSelection.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1608-La0X4O82v6NmarJlqSwgTku0v1U\"",
    "mtime": "2025-02-04T06:49:50.713Z",
    "size": 5640,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/cursor/cursorColumnSelection.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/cursor/cursorContext.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"29f-fPuQWxr5KPMEwiOXk7ieavAuYkQ\"",
    "mtime": "2025-02-04T06:49:50.713Z",
    "size": 671,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/cursor/cursorContext.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/cursor/cursorDeleteOperations.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2a74-DWxRaLeavzAZ5+jc0zjvRPYDohQ\"",
    "mtime": "2025-02-04T06:49:50.713Z",
    "size": 10868,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/cursor/cursorDeleteOperations.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/cursor/cursorMoveCommands.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"8530-oYvQnWLzFTbd24aVHMO7biBulws\"",
    "mtime": "2025-02-04T06:49:50.713Z",
    "size": 34096,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/cursor/cursorMoveCommands.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/cursor/cursorMoveOperations.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3bbf-uvCOe0jii8xn+BynyJxzOkKvKS8\"",
    "mtime": "2025-02-04T06:49:50.713Z",
    "size": 15295,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/cursor/cursorMoveOperations.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/cursor/cursorTypeEditOperations.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"bb8a-H/sl+NK0q6g+8WPjCr+akT2T2Wc\"",
    "mtime": "2025-02-04T06:49:50.713Z",
    "size": 48010,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/cursor/cursorTypeEditOperations.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/cursor/cursorTypeOperations.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2206-dp90/OsMWrjwFC2cGGMEOffDjes\"",
    "mtime": "2025-02-04T06:49:50.713Z",
    "size": 8710,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/cursor/cursorTypeOperations.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/cursor/cursorWordOperations.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"8a31-JD+iWoJAdBRR035Jk6vrXpCwC0g\"",
    "mtime": "2025-02-04T06:49:50.713Z",
    "size": 35377,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/cursor/cursorWordOperations.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/cursor/oneCursor.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1bdf-veJyVmOaqc22brRc/slOdU5DtOg\"",
    "mtime": "2025-02-04T06:49:50.713Z",
    "size": 7135,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/cursor/oneCursor.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/diff/documentDiffProvider.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"16b-EowE4pZYkCnO5xAyY6EVxovwQ0M\"",
    "mtime": "2025-02-04T06:49:50.713Z",
    "size": 363,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/diff/documentDiffProvider.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/diff/legacyLinesDiffComputer.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"6143-kXWATPGSLfgws1Bq2fnL6IVsi/s\"",
    "mtime": "2025-02-04T06:49:50.714Z",
    "size": 24899,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/diff/legacyLinesDiffComputer.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/diff/linesDiffComputer.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"40d-5FN28MEwvvTNPdhqzCBNLP2VUqc\"",
    "mtime": "2025-02-04T06:49:50.714Z",
    "size": 1037,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/diff/linesDiffComputer.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/diff/linesDiffComputers.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"29c-vGRzhDVqwhhawDxlGWFVUxuD2hU\"",
    "mtime": "2025-02-04T06:49:50.714Z",
    "size": 668,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/diff/linesDiffComputers.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/diff/rangeMapping.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"23c2-tBYVWkgSJqBNvzyIFAIQkjC2jAM\"",
    "mtime": "2025-02-04T06:49:50.714Z",
    "size": 9154,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/diff/rangeMapping.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/languages/autoIndent.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4c51-Hb6Xa58q6X+4R+vIfrYha09EHFA\"",
    "mtime": "2025-02-04T06:49:50.714Z",
    "size": 19537,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/languages/autoIndent.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/languages/defaultDocumentColorsComputer.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"178e-mQzb06Q7EcbC0T/X4sWRdsn6/2A\"",
    "mtime": "2025-02-04T06:49:50.714Z",
    "size": 6030,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/languages/defaultDocumentColorsComputer.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/languages/enterAction.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"a3a-pJMfFXG2ismjyispSz3ZHnxlxCM\"",
    "mtime": "2025-02-04T06:49:50.714Z",
    "size": 2618,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/languages/enterAction.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/languages/language.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1ff-TPAkYHU+AxdYte34PZY236MRkBM\"",
    "mtime": "2025-02-04T06:49:50.714Z",
    "size": 511,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/languages/language.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/languages/languageConfiguration.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"14b5-uXeoeZZFJ8DgsNOhjIKSqJt9VCo\"",
    "mtime": "2025-02-04T06:49:50.714Z",
    "size": 5301,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/languages/languageConfiguration.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/languages/languageConfigurationRegistry.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3be8-Ja6ULcWe8o/ODmrQFAvHeDGUYtU\"",
    "mtime": "2025-02-04T06:49:50.714Z",
    "size": 15336,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/languages/languageConfigurationRegistry.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/languages/linkComputer.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3454-8b/XxtbzpLMLhV2KZZXbnmjCSTU\"",
    "mtime": "2025-02-04T06:49:50.714Z",
    "size": 13396,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/languages/linkComputer.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/languages/modesRegistry.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"8c5-uE2ryBjNt8BpzxMGCOjmoafnVNQ\"",
    "mtime": "2025-02-04T06:49:50.714Z",
    "size": 2245,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/languages/modesRegistry.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/languages/nullTokenize.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"53d-fDw200hmb8aBzzm9hLqsM3f+o5M\"",
    "mtime": "2025-02-04T06:49:50.714Z",
    "size": 1341,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/languages/nullTokenize.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/languages/supports.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"a9b-DBd3brT1V7hCUS8O9E2Q0geJp80\"",
    "mtime": "2025-02-04T06:49:50.714Z",
    "size": 2715,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/languages/supports.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/languages/textToHtmlTokenizer.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1665-r9uRFm0UZeP8IU8d1ZzWTF8/slc\"",
    "mtime": "2025-02-04T06:49:50.714Z",
    "size": 5733,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/languages/textToHtmlTokenizer.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/model/decorationProvider.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b-uHjBGncSjnTDzxXJPvLO3fKqCzg\"",
    "mtime": "2025-02-04T06:49:50.714Z",
    "size": 11,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/model/decorationProvider.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/model/editStack.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"38bd-wV7Bk4Cf88Rc+s7+VLz8kjjz76g\"",
    "mtime": "2025-02-04T06:49:50.714Z",
    "size": 14525,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/model/editStack.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/model/fixedArray.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"89d-PoChARuPDmdeNylgmOapOb7TMrY\"",
    "mtime": "2025-02-04T06:49:50.714Z",
    "size": 2205,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/model/fixedArray.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/model/guidesTextModelPart.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4f5d-tN0pJfkTRXnxrXSGghm6I82YUMA\"",
    "mtime": "2025-02-04T06:49:50.714Z",
    "size": 20317,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/model/guidesTextModelPart.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/model/indentationGuesser.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1e57-+4B+kPd15i+7zrkaYYaASvsdQxQ\"",
    "mtime": "2025-02-04T06:49:50.714Z",
    "size": 7767,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/model/indentationGuesser.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/model/intervalTree.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"8a8f-vK4jUxEbOhsYFwV0QBAaCw5Wfg8\"",
    "mtime": "2025-02-04T06:49:50.715Z",
    "size": 35471,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/model/intervalTree.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/model/mirrorTextModel.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"138c-Xmj/Aibo0ZZTcgy8JkzmcsWvDnI\"",
    "mtime": "2025-02-04T06:49:50.715Z",
    "size": 5004,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/model/mirrorTextModel.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/model/prefixSumComputer.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1e25-GOdsMGLJqPOSATmO419yIFXBtqc\"",
    "mtime": "2025-02-04T06:49:50.715Z",
    "size": 7717,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/model/prefixSumComputer.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/model/textModel.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"165b5-xElzbELH9Fsl2BS0y7zagFp7n00\"",
    "mtime": "2025-02-04T06:49:50.715Z",
    "size": 91573,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/model/textModel.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/model/textModelPart.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"300-JjWahvkfcYpNTc+tMNDpBISXCdc\"",
    "mtime": "2025-02-04T06:49:50.715Z",
    "size": 768,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/model/textModelPart.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/model/textModelSearch.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5105-3EAwCW/VQ8Ps1FZm4fyu5oY4Ztk\"",
    "mtime": "2025-02-04T06:49:50.715Z",
    "size": 20741,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/model/textModelSearch.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/model/textModelText.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"394-E4ZAo/tJkDWoDj0mfmHZ93krCbk\"",
    "mtime": "2025-02-04T06:49:50.715Z",
    "size": 916,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/model/textModelText.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/model/textModelTokens.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"48fa-TB++umLX/9ohAd3CoFKF5JwFtFs\"",
    "mtime": "2025-02-04T06:49:50.715Z",
    "size": 18682,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/model/textModelTokens.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/model/tokenizationTextModelPart.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"6546-wJacWcCykl1T2XPiwvfuh2jenGI\"",
    "mtime": "2025-02-04T06:49:50.715Z",
    "size": 25926,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/model/tokenizationTextModelPart.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/model/tokens.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"db0-hxCZIdqz+MrZ9nSju3noKqy+kpQ\"",
    "mtime": "2025-02-04T06:49:50.715Z",
    "size": 3504,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/model/tokens.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/model/treeSitterTokens.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"cd4-r7tASRogkWek3naY8yY0MUVD3hs\"",
    "mtime": "2025-02-04T06:49:50.715Z",
    "size": 3284,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/model/treeSitterTokens.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/model/utils.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3fb-c9JYdAo6/1lsHIBrc5QFRwXbZxI\"",
    "mtime": "2025-02-04T06:49:50.715Z",
    "size": 1019,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/model/utils.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/services/editorBaseApi.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"727-GZurlvtt2Fcicmn2RFspISCiZeQ\"",
    "mtime": "2025-02-04T06:49:50.715Z",
    "size": 1831,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/services/editorBaseApi.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/services/editorSimpleWorker.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3a73-xwCtxWtj4PZWqyZ1KvgqfxGSYmA\"",
    "mtime": "2025-02-04T06:49:50.715Z",
    "size": 14963,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/services/editorSimpleWorker.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/services/editorWorker.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"207-+OG63+bibn64CzZQVLLvmxhtdb8\"",
    "mtime": "2025-02-04T06:49:50.715Z",
    "size": 519,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/services/editorWorker.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/services/editorWorkerHost.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2a2-Kt6+ZCfIH+S4ONtl+HowU7WUpqk\"",
    "mtime": "2025-02-04T06:49:50.715Z",
    "size": 674,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/services/editorWorkerHost.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/services/findSectionHeaders.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"d16-utj1JudtLux8p62A/O4H/doAPgc\"",
    "mtime": "2025-02-04T06:49:50.715Z",
    "size": 3350,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/services/findSectionHeaders.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/services/getIconClasses.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"12a6-2sG9I+brcyiLiYI9bilCSUvlvH4\"",
    "mtime": "2025-02-04T06:49:50.715Z",
    "size": 4774,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/services/getIconClasses.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/services/languageFeatureDebounce.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1616-b19JEXLmyzXfWc3+Yd4J78/ASaA\"",
    "mtime": "2025-02-04T06:49:50.715Z",
    "size": 5654,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/services/languageFeatureDebounce.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/services/languageFeatures.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"210-8BK2avjsZbf7pXCjpTsOr7XOu2U\"",
    "mtime": "2025-02-04T06:49:50.715Z",
    "size": 528,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/services/languageFeatures.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/services/languageFeaturesService.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"de3-ckG7PJQPKUz5B+hUaDxVAjh9lbA\"",
    "mtime": "2025-02-04T06:49:50.715Z",
    "size": 3555,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/services/languageFeaturesService.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/services/languageService.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"10db-deapAuJtGaFN+j4OA/AK/6N++RY\"",
    "mtime": "2025-02-04T06:49:50.715Z",
    "size": 4315,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/services/languageService.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/services/languagesAssociations.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"216c-Xw2Bea8rh+EiIHsfIeScWLygqs8\"",
    "mtime": "2025-02-04T06:49:50.715Z",
    "size": 8556,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/services/languagesAssociations.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/services/languagesRegistry.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"25d2-jkQUylKHpA9AWLuG/nE5ei+JfZQ\"",
    "mtime": "2025-02-04T06:49:50.715Z",
    "size": 9682,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/services/languagesRegistry.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/services/markerDecorations.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"211-ymRTV1/Lc8e/4AR0TdF4hHsewTk\"",
    "mtime": "2025-02-04T06:49:50.715Z",
    "size": 529,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/services/markerDecorations.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/services/markerDecorationsService.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"29a1-Ev+chhe/Lh/UfgEIGHcQiqOBR3k\"",
    "mtime": "2025-02-04T06:49:50.715Z",
    "size": 10657,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/services/markerDecorationsService.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/services/model.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1f9-Q7wnECr3G/EVUpQrxLlnmjUBsHQ\"",
    "mtime": "2025-02-04T06:49:50.716Z",
    "size": 505,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/services/model.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/services/modelService.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"560f-pROb541kZVPzx/+cgCDEJBpkw5Q\"",
    "mtime": "2025-02-04T06:49:50.716Z",
    "size": 22031,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/services/modelService.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/services/resolverService.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"a1-WrpJe5dvsM0UINUHGglro+GC6qU\"",
    "mtime": "2025-02-04T06:49:50.716Z",
    "size": 161,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/services/resolverService.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/services/semanticTokensDto.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"ae0-Pv8u9Nral84PJUHkdS3gn6AGZAA\"",
    "mtime": "2025-02-04T06:49:50.716Z",
    "size": 2784,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/services/semanticTokensDto.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/services/semanticTokensProviderStyling.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3b08-pyV6vDfGCdbr2SrAzqoxVLiHXFo\"",
    "mtime": "2025-02-04T06:49:50.716Z",
    "size": 15112,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/services/semanticTokensProviderStyling.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/services/semanticTokensStyling.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"219-RMaMtFyIfPuYxLEh8mRNMVWCcnI\"",
    "mtime": "2025-02-04T06:49:50.716Z",
    "size": 537,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/services/semanticTokensStyling.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/services/semanticTokensStylingService.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"a84-JWqOHzSFMGipuFR8rVMWzPrkfV4\"",
    "mtime": "2025-02-04T06:49:50.716Z",
    "size": 2692,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/services/semanticTokensStylingService.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/services/textResourceConfiguration.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"121-v7zER9VnX9wOhnymePCMbq8aBZg\"",
    "mtime": "2025-02-04T06:49:50.716Z",
    "size": 289,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/services/textResourceConfiguration.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/services/treeSitterParserService.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"af-1d6gnfTgDKyCbvk2nGB+gZSwod4\"",
    "mtime": "2025-02-04T06:49:50.716Z",
    "size": 175,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/services/treeSitterParserService.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/services/treeViewsDnd.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"354-nGOuKN4JLwAhN43ee0Ki9EOuqPQ\"",
    "mtime": "2025-02-04T06:49:50.716Z",
    "size": 852,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/services/treeViewsDnd.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/services/treeViewsDndService.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2fb-5I7RXSERLccIduSDRknCLtQqZmg\"",
    "mtime": "2025-02-04T06:49:50.716Z",
    "size": 763,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/services/treeViewsDndService.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/services/unicodeTextModelHighlighter.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"230a-3VtB64t5QDqmutOaYYhYdOgSoGM\"",
    "mtime": "2025-02-04T06:49:50.716Z",
    "size": 8970,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/services/unicodeTextModelHighlighter.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/standalone/standaloneEnums.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b900-7u7unQnlKINRVoeL+lD4SrX/dZY\"",
    "mtime": "2025-02-04T06:49:50.685Z",
    "size": 47360,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/standalone/standaloneEnums.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/tokens/contiguousMultilineTokens.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"30d-1BuKJHzpTJ1fvNvTYXbpMci2J4w\"",
    "mtime": "2025-02-04T06:49:50.685Z",
    "size": 781,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/tokens/contiguousMultilineTokens.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/tokens/contiguousMultilineTokensBuilder.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"280-gT93Vj7oRXIt3MmsMEpNqoBlgVE\"",
    "mtime": "2025-02-04T06:49:50.716Z",
    "size": 640,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/tokens/contiguousMultilineTokensBuilder.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/tokens/contiguousTokensEditing.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"13f5-NoHBE/6BBn3/BW/A2/JcMbcwyHw\"",
    "mtime": "2025-02-04T06:49:50.716Z",
    "size": 5109,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/tokens/contiguousTokensEditing.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/tokens/contiguousTokensStore.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2318-Xk2/+HimV+jQzztlmizIyImnnko\"",
    "mtime": "2025-02-04T06:49:50.716Z",
    "size": 8984,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/tokens/contiguousTokensStore.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/tokens/lineTokens.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2d6e-hQpXTMMxQocIaGf0dv4RkbgwA9w\"",
    "mtime": "2025-02-04T06:49:50.716Z",
    "size": 11630,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/tokens/lineTokens.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/tokens/sparseMultilineTokens.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5d7b-wzdp0UoU3FZUsR+2HaFeOGP5ZtQ\"",
    "mtime": "2025-02-04T06:49:50.716Z",
    "size": 23931,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/tokens/sparseMultilineTokens.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/tokens/sparseTokensStore.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2146-do7Gw+ZIEXeUH8HRJ5Nde6+Y9n0\"",
    "mtime": "2025-02-04T06:49:50.717Z",
    "size": 8518,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/tokens/sparseTokensStore.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/viewLayout/lineDecorations.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"200a-izdQBv30AFR01k1Wsrglnbz1mhE\"",
    "mtime": "2025-02-04T06:49:50.685Z",
    "size": 8202,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/viewLayout/lineDecorations.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/viewLayout/linePart.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3a3-MhQ0+OTbaoI3C5qJxhwqnGaCWdk\"",
    "mtime": "2025-02-04T06:49:50.716Z",
    "size": 931,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/viewLayout/linePart.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/viewLayout/linesLayout.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"7b57-Goqq8f6Kn3sHcv7OnAv8Rtjv5FM\"",
    "mtime": "2025-02-04T06:49:50.716Z",
    "size": 31575,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/viewLayout/linesLayout.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/viewLayout/viewLayout.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3ea5-GqjaH9016g/Uey981hBqk0vO0Co\"",
    "mtime": "2025-02-04T06:49:50.716Z",
    "size": 16037,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/viewLayout/viewLayout.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/viewLayout/viewLineRenderer.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"a885-1aGCUdPsaV9Vb67ztwLvvnlc7eg\"",
    "mtime": "2025-02-04T06:49:50.716Z",
    "size": 43141,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/viewLayout/viewLineRenderer.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/viewLayout/viewLinesViewportData.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5ca-BFzxUTl4QG2KhkCO/i7oAhfwLUk\"",
    "mtime": "2025-02-04T06:49:50.716Z",
    "size": 1482,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/viewLayout/viewLinesViewportData.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/viewModel/glyphLanesModel.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"858-9svNHHd9kn3ZZobH+jL0OzfOjAE\"",
    "mtime": "2025-02-04T06:49:50.685Z",
    "size": 2136,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/viewModel/glyphLanesModel.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/viewModel/minimapTokensColorTracker.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"8f2-kkJmzmVL52QMPKtnGXttA+hIbGM\"",
    "mtime": "2025-02-04T06:49:50.717Z",
    "size": 2290,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/viewModel/minimapTokensColorTracker.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/viewModel/modelLineProjection.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3a4d-e4L3c4eZjCYZC5+o/mTPxLX+j4M\"",
    "mtime": "2025-02-04T06:49:50.716Z",
    "size": 14925,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/viewModel/modelLineProjection.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/viewModel/monospaceLineBreaksComputer.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"59f6-KOl9L3IzcncO/Yfz+/VnOTbOqIs\"",
    "mtime": "2025-02-04T06:49:50.717Z",
    "size": 23030,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/viewModel/monospaceLineBreaksComputer.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/viewModel/overviewZoneManager.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"174b-2osX4WSM/KOctxx1KcRtZNcrRXQ\"",
    "mtime": "2025-02-04T06:49:50.717Z",
    "size": 5963,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/viewModel/overviewZoneManager.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/viewModel/viewContext.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"356-ci9pYw5EOKtBEEX/qVcjbCRXHYE\"",
    "mtime": "2025-02-04T06:49:50.717Z",
    "size": 854,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/viewModel/viewContext.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/viewModel/viewModelDecorations.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"23dc-/zP3o6dl4d3ax6NLUG2Fg5giDKE\"",
    "mtime": "2025-02-04T06:49:50.717Z",
    "size": 9180,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/viewModel/viewModelDecorations.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/viewModel/viewModelImpl.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"d966-g5CgxzTr3dTmXpY2WlhpzwbtdXY\"",
    "mtime": "2025-02-04T06:49:50.717Z",
    "size": 55654,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/viewModel/viewModelImpl.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/viewModel/viewModelLines.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"c787-dXKUbNeHVQwKDZ/hHFCIzoXCbuw\"",
    "mtime": "2025-02-04T06:49:50.717Z",
    "size": 51079,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/viewModel/viewModelLines.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/standalone/browser/colorizer.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1995-kTBufpYRI6lkM5ulkY3ClS+RRp4\"",
    "mtime": "2025-02-04T06:49:50.685Z",
    "size": 6549,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/standalone/browser/colorizer.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/standalone/browser/standalone-tokens.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"8b1-Am9Rc5or1+dnaLRgW46rnz78Ykw\"",
    "mtime": "2025-02-04T06:49:50.717Z",
    "size": 2225,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/standalone/browser/standalone-tokens.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/standalone/browser/standaloneCodeEditor.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"429f-j/EuLIwXvEAK9Uq1eM2DTrpezdM\"",
    "mtime": "2025-02-04T06:49:50.717Z",
    "size": 17055,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/standalone/browser/standaloneCodeEditor.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/standalone/browser/standaloneCodeEditorService.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"11ad-YxASjI0QWAqF8VN/CadgvbieQ3Q\"",
    "mtime": "2025-02-04T06:49:50.717Z",
    "size": 4525,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/standalone/browser/standaloneCodeEditorService.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/standalone/browser/standaloneEditor.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4d01-VpfApgrPfbtuqIOtNorhNZf1uh0\"",
    "mtime": "2025-02-04T06:49:50.717Z",
    "size": 19713,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/standalone/browser/standaloneEditor.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/standalone/browser/standaloneLanguages.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"6a44-LGJc6yA/2dWlU/ihlNCs+QZ5XrY\"",
    "mtime": "2025-02-04T06:49:50.717Z",
    "size": 27204,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/standalone/browser/standaloneLanguages.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/standalone/browser/standaloneLayoutService.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"e77-Rp5bXE6kcEcy9JOHpL1664cEMKQ\"",
    "mtime": "2025-02-04T06:49:50.717Z",
    "size": 3703,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/standalone/browser/standaloneLayoutService.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/standalone/browser/standaloneServices.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"94cc-gG8KcEfOzhiNxiPWlOtE0Sum7T0\"",
    "mtime": "2025-02-04T06:49:50.717Z",
    "size": 38092,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/standalone/browser/standaloneServices.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/standalone/browser/standaloneThemeService.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"36bd-VQaMdoLtEd3xc7l/Kxrv/w3/AnQ\"",
    "mtime": "2025-02-04T06:49:50.717Z",
    "size": 14013,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/standalone/browser/standaloneThemeService.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/standalone/browser/standaloneTreeSitterService.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"10b-CgoqxC361fwcUlwNVbEiom3AkI8\"",
    "mtime": "2025-02-04T06:49:50.717Z",
    "size": 267,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/standalone/browser/standaloneTreeSitterService.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/standalone/browser/standaloneWebWorker.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"d69-x3vk1S9VTyc9qqnmtTW/ys2ECkA\"",
    "mtime": "2025-02-04T06:49:50.717Z",
    "size": 3433,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/standalone/browser/standaloneWebWorker.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/standalone/common/standaloneTheme.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"203-AIUo4VLvB9Aaxs9vKUItQUOIr2I\"",
    "mtime": "2025-02-04T06:49:50.717Z",
    "size": 515,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/standalone/common/standaloneTheme.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/standalone/common/themes.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2dd3-xQHkG84PS4m1tPSZilFqVDhcWTk\"",
    "mtime": "2025-02-04T06:49:50.717Z",
    "size": 11731,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/standalone/common/themes.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/accessibility/browser/accessibilityService.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"180e-1dD+MPCWm8/1TkNVfM/tJ3EdHyg\"",
    "mtime": "2025-02-04T06:49:50.776Z",
    "size": 6158,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/accessibility/browser/accessibilityService.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/accessibility/browser/accessibleViewRegistry.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"38a-/tl77Kr0JDtULtGjQFK5AqhUgLA\"",
    "mtime": "2025-02-04T06:49:50.789Z",
    "size": 906,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/accessibility/browser/accessibleViewRegistry.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/accessibility/common/accessibility.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2ac-QFs0ZW3wriCyDLddr/YrtW9OxPY\"",
    "mtime": "2025-02-04T06:49:50.718Z",
    "size": 684,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/accessibility/common/accessibility.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/accessibilitySignal/browser/accessibilitySignalService.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3ee9-EiibJX1nVPJo/6hhL1EzvWrp3ec\"",
    "mtime": "2025-02-04T06:49:50.765Z",
    "size": 16105,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/accessibilitySignal/browser/accessibilitySignalService.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/action/common/action.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"28d-Zo92Ge5OXFHbkIGz3Fw8Tlr/AAY\"",
    "mtime": "2025-02-04T06:49:50.765Z",
    "size": 653,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/action/common/action.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/action/common/actionCommonCategories.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"314-Mv5M//DkOpt2SNel48TDF6GGP34\"",
    "mtime": "2025-02-04T06:49:50.778Z",
    "size": 788,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/action/common/actionCommonCategories.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/actionWidget/browser/actionList.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"30d4-+TgcMx8uydbXsgd9t1iG7+DDwKA\"",
    "mtime": "2025-02-04T06:49:50.778Z",
    "size": 12500,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/actionWidget/browser/actionList.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/actionWidget/browser/actionWidget.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"11dc-nQec5kaC0lxTgKLFx4lC6IOeeVQ\"",
    "mtime": "2025-02-04T06:49:50.765Z",
    "size": 4572,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/actionWidget/browser/actionWidget.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/actionWidget/browser/actionWidget.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2907-EycgZ7xVYCtU1aeMgZ2KEa8s36k\"",
    "mtime": "2025-02-04T06:49:50.779Z",
    "size": 10503,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/actionWidget/browser/actionWidget.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/actionWidget/common/actionWidget.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"16b-EowE4pZYkCnO5xAyY6EVxovwQ0M\"",
    "mtime": "2025-02-04T06:49:50.776Z",
    "size": 363,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/actionWidget/common/actionWidget.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/actions/browser/menuEntryActionViewItem.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"783-gazpPLExaWotXPDT1yJuGIxNOgY\"",
    "mtime": "2025-02-04T06:49:50.765Z",
    "size": 1923,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/actions/browser/menuEntryActionViewItem.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/actions/browser/menuEntryActionViewItem.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5ead-jqUxqFz93WWtDXuRssazgSBWSgU\"",
    "mtime": "2025-02-04T06:49:50.779Z",
    "size": 24237,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/actions/browser/menuEntryActionViewItem.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/actions/browser/toolbar.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"34c5-Aka5VH6PBcXZ3ywQKT6DVehujIM\"",
    "mtime": "2025-02-04T06:49:50.779Z",
    "size": 13509,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/actions/browser/toolbar.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/actions/common/actions.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"61fe-pCtzGVPTy4GiD2xeQsenUcv5WgQ\"",
    "mtime": "2025-02-04T06:49:50.776Z",
    "size": 25086,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/actions/common/actions.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/actions/common/menuService.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4a9c-tHRhC+1P0eOeTk/7CMuyqGaJPR0\"",
    "mtime": "2025-02-04T06:49:50.779Z",
    "size": 19100,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/actions/common/menuService.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/clipboard/browser/clipboardService.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"26f3-kftfT7HysplCXZ/9iKNp81MY278\"",
    "mtime": "2025-02-04T06:49:50.765Z",
    "size": 9971,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/clipboard/browser/clipboardService.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/clipboard/common/clipboardService.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1f5-rYLQZYrMoeZKmwf9pJOPlFO6Gco\"",
    "mtime": "2025-02-04T06:49:50.777Z",
    "size": 501,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/clipboard/common/clipboardService.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/commands/common/commands.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"cf7-oSqwHg6Uh26+tR6/qhFLco6imQo\"",
    "mtime": "2025-02-04T06:49:50.765Z",
    "size": 3319,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/commands/common/commands.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/configuration/common/configuration.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"d9d-naRftKVWn0flxWA3fUy50xGh7Zk\"",
    "mtime": "2025-02-04T06:49:50.765Z",
    "size": 3485,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/configuration/common/configuration.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/configuration/common/configurationModels.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"6c9a-wIlkQkx+CsWpqQwi7zl2FWmWk3k\"",
    "mtime": "2025-02-04T06:49:50.779Z",
    "size": 27802,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/configuration/common/configurationModels.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/configuration/common/configurationRegistry.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"50cc-vgmRIyBsWvg6UsLz6FQijyC2rcc\"",
    "mtime": "2025-02-04T06:49:50.779Z",
    "size": 20684,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/configuration/common/configurationRegistry.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/configuration/common/configurations.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"6d8-G8zPj7HklS5WyCoD+v9E9vtUca0\"",
    "mtime": "2025-02-04T06:49:50.779Z",
    "size": 1752,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/configuration/common/configurations.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/contextkey/browser/contextKeyService.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3c69-oPigQ08cXBVSQnNABQw+BE+ZWv8\"",
    "mtime": "2025-02-04T06:49:50.765Z",
    "size": 15465,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/contextkey/browser/contextKeyService.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/contextkey/common/contextkey.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"d2e6-x2MDA+OEEkfc91U/CToFPz/7USM\"",
    "mtime": "2025-02-04T06:49:50.788Z",
    "size": 53990,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/contextkey/common/contextkey.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/contextkey/common/contextkeys.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"7a7-vCuXBWJzQ52+toMxc0sGWfMzm1Y\"",
    "mtime": "2025-02-04T06:49:50.777Z",
    "size": 1959,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/contextkey/common/contextkeys.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/contextkey/common/scanner.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2e68-rZFuVOi8eoejZ8ARR9A5b5iH0Bc\"",
    "mtime": "2025-02-04T06:49:50.779Z",
    "size": 11880,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/contextkey/common/scanner.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/contextview/browser/contextMenuHandler.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"193c-VSJJ/nCpMgWmdqVnGx87yvqjGK4\"",
    "mtime": "2025-02-04T06:49:50.765Z",
    "size": 6460,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/contextview/browser/contextMenuHandler.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/contextview/browser/contextMenuService.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"136e-0eDWU+GkuXJe1WT9n7i/6JUnxec\"",
    "mtime": "2025-02-04T06:49:50.779Z",
    "size": 4974,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/contextview/browser/contextMenuService.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/contextview/browser/contextView.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"243-a6D94JZYgjW/Ve10unwcHU0R1Vc\"",
    "mtime": "2025-02-04T06:49:50.788Z",
    "size": 579,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/contextview/browser/contextView.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/contextview/browser/contextViewService.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"cc3-TgsZoLGg4+BWzUcqgWt1TkwGbVI\"",
    "mtime": "2025-02-04T06:49:50.788Z",
    "size": 3267,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/contextview/browser/contextViewService.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/dialogs/common/dialogs.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"8f-Nq2T1oSuf+0LM6qWa2YDwq71jaU\"",
    "mtime": "2025-02-04T06:49:50.765Z",
    "size": 143,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/dialogs/common/dialogs.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/dnd/browser/dnd.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"412-651u2Z3hb6m4qL1JxYUnB6ItSfc\"",
    "mtime": "2025-02-04T06:49:50.765Z",
    "size": 1042,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/dnd/browser/dnd.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/editor/common/editor.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"327-UrEY11em6JvE8KlpCjSup1G83Vg\"",
    "mtime": "2025-02-04T06:49:50.765Z",
    "size": 807,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/editor/common/editor.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/environment/common/environment.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"99-6bscL0lcq5RQC9Q4D3twDewc+pw\"",
    "mtime": "2025-02-04T06:49:50.765Z",
    "size": 153,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/environment/common/environment.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/extensions/common/extensions.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5fd-41RHWE0Vg1ENu0WbnauLvPQwkrI\"",
    "mtime": "2025-02-04T06:49:50.765Z",
    "size": 1533,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/extensions/common/extensions.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/files/common/files.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"114-pWvaIoxWBIP+CVAq/Jvz4AECqwA\"",
    "mtime": "2025-02-04T06:49:50.765Z",
    "size": 276,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/files/common/files.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/history/browser/contextScopedHistoryWidget.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1785-qtvtXqb56lZ+ENeRSb9hAAONJKw\"",
    "mtime": "2025-02-04T06:49:50.765Z",
    "size": 6021,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/history/browser/contextScopedHistoryWidget.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/history/browser/historyWidgetKeybindingHint.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"26a-FuZbr1oMwEzH55/u0/CQy4VmQg4\"",
    "mtime": "2025-02-04T06:49:50.788Z",
    "size": 618,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/history/browser/historyWidgetKeybindingHint.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/hover/browser/hover.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1185-40LLy0mJ4d4btI6byrfWnfdW6uI\"",
    "mtime": "2025-02-04T06:49:50.765Z",
    "size": 4485,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/hover/browser/hover.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/instantiation/common/descriptors.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"26e-EF2eLpsMtHQ+/IDLYhNtrwZ5h+I\"",
    "mtime": "2025-02-04T06:49:50.788Z",
    "size": 622,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/instantiation/common/descriptors.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/instantiation/common/extensions.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"325-+PS3WB6sSXWMj80nT304xLo+iM8\"",
    "mtime": "2025-02-04T06:49:50.765Z",
    "size": 805,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/instantiation/common/extensions.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/instantiation/common/graph.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"ab8-n2cshzOkjH9qrHPcmPrCSyGAIJw\"",
    "mtime": "2025-02-04T06:49:50.788Z",
    "size": 2744,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/instantiation/common/graph.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/instantiation/common/instantiation.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"65e-iVk9XqJo4NwCfqu6clQYCd/Eg7o\"",
    "mtime": "2025-02-04T06:49:50.788Z",
    "size": 1630,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/instantiation/common/instantiation.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/instantiation/common/instantiationService.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4215-4jYo+tSSF/k4kSsXe5LAizCePJ4\"",
    "mtime": "2025-02-04T06:49:50.788Z",
    "size": 16917,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/instantiation/common/instantiationService.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/instantiation/common/serviceCollection.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"304-H8OjoPXNbX2YJ4+tG4xxX1gVfqU\"",
    "mtime": "2025-02-04T06:49:50.788Z",
    "size": 772,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/instantiation/common/serviceCollection.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/jsonschemas/common/jsonContributionRegistry.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4db-rhtdupPjyaO4NVpcTFd7mleUwOA\"",
    "mtime": "2025-02-04T06:49:50.765Z",
    "size": 1243,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/jsonschemas/common/jsonContributionRegistry.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/keybinding/common/abstractKeybindingService.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3a10-7Fqm8PS15aOnHGBJQXRMbVvUO08\"",
    "mtime": "2025-02-04T06:49:50.765Z",
    "size": 14864,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/keybinding/common/abstractKeybindingService.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/keybinding/common/baseResolvedKeybinding.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"9ee-8oF13RCDpoEZYGisWDCFab1eHXg\"",
    "mtime": "2025-02-04T06:49:50.788Z",
    "size": 2542,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/keybinding/common/baseResolvedKeybinding.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/keybinding/common/keybinding.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1f7-gQLY6M03L3qvmX8jQNyURWYeUHo\"",
    "mtime": "2025-02-04T06:49:50.788Z",
    "size": 503,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/keybinding/common/keybinding.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/keybinding/common/keybindingResolver.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2d79-zQVz0qSVJ8Dcr6C3hIB9ijuUwho\"",
    "mtime": "2025-02-04T06:49:50.788Z",
    "size": 11641,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/keybinding/common/keybindingResolver.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/keybinding/common/keybindingsRegistry.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1029-uf+vxSp8DZmQXkuhE6qHyPZWB0s\"",
    "mtime": "2025-02-04T06:49:50.788Z",
    "size": 4137,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/keybinding/common/keybindingsRegistry.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/keybinding/common/resolvedKeybindingItem.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"646-Rbv2kIbbgi7M2wAeNSwgN26D7eQ\"",
    "mtime": "2025-02-04T06:49:50.788Z",
    "size": 1606,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/keybinding/common/resolvedKeybindingItem.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/keybinding/common/usLayoutResolvedKeybinding.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2023-6vBFYKLSRm30WVKOfGGSKg/qMb0\"",
    "mtime": "2025-02-04T06:49:50.788Z",
    "size": 8227,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/keybinding/common/usLayoutResolvedKeybinding.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/label/common/label.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"8d-liVLTNJcS4lLgYK8SGWwhjUYUXM\"",
    "mtime": "2025-02-04T06:49:50.765Z",
    "size": 141,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/label/common/label.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/layout/browser/layoutService.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1ef-1qN3FjEdTSiIz8csZA68CRuPXvI\"",
    "mtime": "2025-02-04T06:49:50.765Z",
    "size": 495,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/layout/browser/layoutService.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/list/browser/listService.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"df5f-ApdpMEXTLTrhMOQK4vvb/P45xPw\"",
    "mtime": "2025-02-04T06:49:50.765Z",
    "size": 57183,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/list/browser/listService.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/log/common/log.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1243-nKUOS5A1gCL36hayKiyMEjr3vQg\"",
    "mtime": "2025-02-04T06:49:50.765Z",
    "size": 4675,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/log/common/log.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/log/common/logService.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"553-D/HZ0f7eq4CuKitXlgO4gzvGip0\"",
    "mtime": "2025-02-04T06:49:50.788Z",
    "size": 1363,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/log/common/logService.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/markers/common/markerService.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"286c-DX+Ee0MRFW3trog1pWVxQFEbccg\"",
    "mtime": "2025-02-04T06:49:50.765Z",
    "size": 10348,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/markers/common/markerService.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/markers/common/markers.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1267-WxKMELxOGHs5gPzGfI+RQh7cFyc\"",
    "mtime": "2025-02-04T06:49:50.788Z",
    "size": 4711,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/markers/common/markers.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/notification/common/notification.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"11e-ceqzzUtdUnOdQfZqfToOpbo4obQ\"",
    "mtime": "2025-02-04T06:49:50.765Z",
    "size": 286,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/notification/common/notification.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/observable/common/platformObservableUtils.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"50a-YeoKzp2fO+xX8FB0ku7Vayet8NM\"",
    "mtime": "2025-02-04T06:49:50.765Z",
    "size": 1290,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/observable/common/platformObservableUtils.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/observable/common/wrapInReloadableClass.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"a24-lTJZD6QOcELKPd7h1KtZ70EbjeA\"",
    "mtime": "2025-02-04T06:49:50.788Z",
    "size": 2596,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/observable/common/wrapInReloadableClass.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/opener/browser/link.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"1e7-EGJNqQca7TTKzi6PdN/rzlWOpkg\"",
    "mtime": "2025-02-04T06:49:50.765Z",
    "size": 487,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/opener/browser/link.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/opener/browser/link.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1166-AwmvZNnajDVl5s9IZtB8+aZMMp4\"",
    "mtime": "2025-02-04T06:49:50.788Z",
    "size": 4454,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/opener/browser/link.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/opener/common/opener.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"514-I6fcAWtmN8tACQErbCkjlTX1kpQ\"",
    "mtime": "2025-02-04T06:49:50.777Z",
    "size": 1300,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/opener/common/opener.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/policy/common/policy.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b-uHjBGncSjnTDzxXJPvLO3fKqCzg\"",
    "mtime": "2025-02-04T06:49:50.765Z",
    "size": 11,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/policy/common/policy.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/progress/common/progress.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"23f-fOiWXm2uv6SmTybgH5HZw2IedWo\"",
    "mtime": "2025-02-04T06:49:50.765Z",
    "size": 575,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/progress/common/progress.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/quickinput/browser/commandsQuickAccess.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4911-2oFlVTEMhaIfVlE2UjGb6QNRjUw\"",
    "mtime": "2025-02-04T06:49:50.788Z",
    "size": 18705,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/quickinput/browser/commandsQuickAccess.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/quickinput/browser/helpQuickAccess.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"fef-fxKBqhr7uPDZqA7xjJQARRYWlrM\"",
    "mtime": "2025-02-04T06:49:50.788Z",
    "size": 4079,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/quickinput/browser/helpQuickAccess.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/quickinput/browser/pickerQuickAccess.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3232-Q5xpXXGgvehX4vqaRRUfZaC1sR4\"",
    "mtime": "2025-02-04T06:49:50.788Z",
    "size": 12850,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/quickinput/browser/pickerQuickAccess.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/quickinput/browser/quickAccess.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"29b8-+RXnb+crKrEbTTz+AgbKwuTHoUs\"",
    "mtime": "2025-02-04T06:49:50.788Z",
    "size": 10680,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/quickinput/browser/quickAccess.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/quickinput/browser/quickInput.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"91ad-HrduXB5TVnNm+IPmiBRdPl8gbuA\"",
    "mtime": "2025-02-04T06:49:50.788Z",
    "size": 37293,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/quickinput/browser/quickInput.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/quickinput/browser/quickInputActions.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"24d8-3lfTxMuZCTmQa3jVAVZbM1Nn2AY\"",
    "mtime": "2025-02-04T06:49:50.788Z",
    "size": 9432,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/quickinput/browser/quickInputActions.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/quickinput/browser/quickInputBox.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"f63-FOHVKKBKhjwDWrdrFKoLCrDudeQ\"",
    "mtime": "2025-02-04T06:49:50.788Z",
    "size": 3939,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/quickinput/browser/quickInputBox.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/quickinput/browser/quickInputController.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"7c50-bW+RYHn7194CLwy6WoEkMiOHGuU\"",
    "mtime": "2025-02-04T06:49:50.788Z",
    "size": 31824,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/quickinput/browser/quickInputController.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/quickinput/browser/quickInputService.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2163-Isdw95W7QLmvPyufwUw0djKyvbU\"",
    "mtime": "2025-02-04T06:49:50.788Z",
    "size": 8547,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/quickinput/browser/quickInputService.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/quickinput/browser/quickInputTree.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"e785-P/uhPXJxup9I6kGIUqqo6KuCASk\"",
    "mtime": "2025-02-04T06:49:50.788Z",
    "size": 59269,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/quickinput/browser/quickInputTree.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/quickinput/browser/quickInputUtils.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"f96-KMjuTWg3GuNS8n7hI3PzapgsXb4\"",
    "mtime": "2025-02-04T06:49:50.788Z",
    "size": 3990,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/quickinput/browser/quickInputUtils.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/quickinput/common/quickAccess.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"98e-ODKWpQ4talr2VvZ25AriPP57mHc\"",
    "mtime": "2025-02-04T06:49:50.777Z",
    "size": 2446,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/quickinput/common/quickAccess.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/quickinput/common/quickInput.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"e35-kBPBpg8ln7zblbMsMDi3pZbUbLs\"",
    "mtime": "2025-02-04T06:49:50.788Z",
    "size": 3637,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/quickinput/common/quickInput.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/registry/common/platform.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"36b-dB1432J59GFYiao7rwiB6QEtMVU\"",
    "mtime": "2025-02-04T06:49:50.765Z",
    "size": 875,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/registry/common/platform.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/severityIcon/browser/severityIcon.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4ca-O8aCpk+/KpL8fPenvHUO+9Oki+Y\"",
    "mtime": "2025-02-04T06:49:50.788Z",
    "size": 1226,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/severityIcon/browser/severityIcon.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/storage/common/storage.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1dd3-C5jpcXDhJ+jQSiRNuhi2V2NMKjI\"",
    "mtime": "2025-02-04T06:49:50.765Z",
    "size": 7635,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/storage/common/storage.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/telemetry/common/gdprTypings.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b-uHjBGncSjnTDzxXJPvLO3fKqCzg\"",
    "mtime": "2025-02-04T06:49:50.765Z",
    "size": 11,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/telemetry/common/gdprTypings.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/telemetry/common/telemetry.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1f5-ZrcpuXyQEpTiR/TbqYhItV2ETkc\"",
    "mtime": "2025-02-04T06:49:50.788Z",
    "size": 501,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/telemetry/common/telemetry.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/theme/browser/defaultStyles.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2f27-J4ZK/SwzQKakS2XEasJApEodhkU\"",
    "mtime": "2025-02-04T06:49:50.777Z",
    "size": 12071,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/theme/browser/defaultStyles.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/theme/browser/iconsStyleSheet.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"e9b-N92xD3k3XyDE1GAkn90lQIkNxGs\"",
    "mtime": "2025-02-04T06:49:50.788Z",
    "size": 3739,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/theme/browser/iconsStyleSheet.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/theme/common/colorRegistry.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"34a-jI5UdlQh2EAbVDGSQtUhyuH0L/8\"",
    "mtime": "2025-02-04T06:49:50.788Z",
    "size": 842,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/theme/common/colorRegistry.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/theme/common/colorUtils.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2203-6TWgHMwgfovEdNSJDlmrSmiKXbQ\"",
    "mtime": "2025-02-04T06:49:50.788Z",
    "size": 8707,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/theme/common/colorUtils.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/theme/common/iconRegistry.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"207e-sVOL240NeePynqYqekM4xGh21N8\"",
    "mtime": "2025-02-04T06:49:50.788Z",
    "size": 8318,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/theme/common/iconRegistry.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/theme/common/theme.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3a8-+/Eq7YMB5VKyPGvPCGBiaPKsmTg\"",
    "mtime": "2025-02-04T06:49:50.788Z",
    "size": 936,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/theme/common/theme.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/theme/common/themeService.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"8ac-zcUxZtdkXCOTRTq7c+SyHY01Yk8\"",
    "mtime": "2025-02-04T06:49:50.788Z",
    "size": 2220,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/theme/common/themeService.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/undoRedo/common/undoRedo.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4ff-oTFyjvA721wxxX4/OnZSj9ZwoAI\"",
    "mtime": "2025-02-04T06:49:50.766Z",
    "size": 1279,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/undoRedo/common/undoRedo.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/undoRedo/common/undoRedoService.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"bda0-P9+i1F1usnvzR/elbMVkrqMC5oY\"",
    "mtime": "2025-02-04T06:49:50.788Z",
    "size": 48544,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/undoRedo/common/undoRedoService.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/workspace/common/workspace.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1337-vtZihc/9htE4/mvk5Zw/IVn/ZNk\"",
    "mtime": "2025-02-04T06:49:50.766Z",
    "size": 4919,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/workspace/common/workspace.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/workspace/common/workspaceTrust.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"213-swxGex+13UaT4a19ant5zfT0vHI\"",
    "mtime": "2025-02-04T06:49:50.788Z",
    "size": 531,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/workspace/common/workspaceTrust.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/actionbar/actionViewItems.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3491-Enbj7VQGBbrzyua7CEfnJGXBQko\"",
    "mtime": "2025-02-04T06:49:50.678Z",
    "size": 13457,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/actionbar/actionViewItems.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/actionbar/actionbar.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"a7d-NV6bu5sxgGB4IWn3d8AGSo9UTWA\"",
    "mtime": "2025-02-04T06:49:50.718Z",
    "size": 2685,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/actionbar/actionbar.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/actionbar/actionbar.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"473c-a8RloU00aTtacAXINH+u79G75c0\"",
    "mtime": "2025-02-04T06:49:50.718Z",
    "size": 18236,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/actionbar/actionbar.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/aria/aria.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"1d8-r4RHtmOfRPnPFt+qF2G8TH8yJGY\"",
    "mtime": "2025-02-04T06:49:50.691Z",
    "size": 472,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/aria/aria.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/aria/aria.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"bc7-i37KmPDT5ZCbIy149jG1kKva0bI\"",
    "mtime": "2025-02-04T06:49:50.718Z",
    "size": 3015,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/aria/aria.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/breadcrumbs/breadcrumbsWidget.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"3dc-oo4gnffNJXt+x/1fboiXGgMtz/k\"",
    "mtime": "2025-02-04T06:49:50.691Z",
    "size": 988,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/breadcrumbs/breadcrumbsWidget.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/breadcrumbs/breadcrumbsWidget.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"22-eXPOlXr5K+PgEyxSvOkoZn7+qoE\"",
    "mtime": "2025-02-04T06:49:50.718Z",
    "size": 34,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/breadcrumbs/breadcrumbsWidget.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/button/button.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"1236-QIfuWJG0kxbf2KSMbdm5mfwLNDc\"",
    "mtime": "2025-02-04T06:49:50.691Z",
    "size": 4662,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/button/button.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/button/button.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"231a-kIGJ5EFI3AgGNXzNkuFHxAIvZkE\"",
    "mtime": "2025-02-04T06:49:50.718Z",
    "size": 8986,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/button/button.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/codicons/codiconStyles.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1aa-KL8borS1vVHgRTqziHsSU7VeRlo\"",
    "mtime": "2025-02-04T06:49:50.718Z",
    "size": 426,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/codicons/codiconStyles.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/contextview/contextview.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"1fc-xfLclfWtMlim5W506Z3TC1OFVtc\"",
    "mtime": "2025-02-04T06:49:50.691Z",
    "size": 508,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/contextview/contextview.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/contextview/contextview.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"39f9-pdV0IrKo9Yz8bOd6pht3Vr8vzro\"",
    "mtime": "2025-02-04T06:49:50.718Z",
    "size": 14841,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/contextview/contextview.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/countBadge/countBadge.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"2b8-3ITWWmzHRi6H/yQhCgH0UVtWFT4\"",
    "mtime": "2025-02-04T06:49:50.696Z",
    "size": 696,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/countBadge/countBadge.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/countBadge/countBadge.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5db-PZ9C+29NuX8PX4QrPSVah3e4wDc\"",
    "mtime": "2025-02-04T06:49:50.718Z",
    "size": 1499,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/countBadge/countBadge.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/dialog/dialog.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"f69-3ZZNqIzS6OwKRumeIgm7O54TA7Y\"",
    "mtime": "2025-02-04T06:49:50.718Z",
    "size": 3945,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/dialog/dialog.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/dialog/dialog.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"17-EiMAzijWx9qF5bQvw+E5dsF2EuI\"",
    "mtime": "2025-02-04T06:49:50.696Z",
    "size": 23,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/dialog/dialog.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/dropdown/dropdown.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"4f6-Iuj4xwfYp3Oh5uEfNiKzGH01irg\"",
    "mtime": "2025-02-04T06:49:50.696Z",
    "size": 1270,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/dropdown/dropdown.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/dropdown/dropdown.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"160f-WkWAQ2hTzltk1kZKQPsp3dPCvWo\"",
    "mtime": "2025-02-04T06:49:50.718Z",
    "size": 5647,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/dropdown/dropdown.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/dropdown/dropdownActionViewItem.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"11f1-hQ5WTcgYdNxJ7Sy1KVikQBUsG6Y\"",
    "mtime": "2025-02-04T06:49:50.718Z",
    "size": 4593,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/dropdown/dropdownActionViewItem.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/findinput/findInput.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"85a-Sqg/yfFECF1R4dKQZYB+oloqYMI\"",
    "mtime": "2025-02-04T06:49:50.696Z",
    "size": 2138,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/findinput/findInput.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/findinput/findInput.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2f22-nEGLhs/TYko2yi7l4a6HmshXApY\"",
    "mtime": "2025-02-04T06:49:50.719Z",
    "size": 12066,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/findinput/findInput.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/findinput/findInputToggles.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"9ba-bJDVut47jiEVB0OLfrgs76nkXUc\"",
    "mtime": "2025-02-04T06:49:50.719Z",
    "size": 2490,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/findinput/findInputToggles.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/findinput/replaceInput.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1c6a-ts1HQJehnkzCPFG7ZW9bPKUnOR8\"",
    "mtime": "2025-02-04T06:49:50.718Z",
    "size": 7274,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/findinput/replaceInput.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/highlightedlabel/highlightedLabel.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"13a1-sBW9jz7lYOX72Pciq7vDZVJwbdk\"",
    "mtime": "2025-02-04T06:49:50.696Z",
    "size": 5025,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/highlightedlabel/highlightedLabel.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/hover/hover.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"187-Pxleseo3HNpcIvLYN4oVo/Sgy5c\"",
    "mtime": "2025-02-04T06:49:50.696Z",
    "size": 391,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/hover/hover.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/hover/hoverDelegate.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"16b-EowE4pZYkCnO5xAyY6EVxovwQ0M\"",
    "mtime": "2025-02-04T06:49:50.718Z",
    "size": 363,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/hover/hoverDelegate.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/hover/hoverDelegate2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"48e-s2UjeKfHHezrzNXxGo7JMWz3RfM\"",
    "mtime": "2025-02-04T06:49:50.718Z",
    "size": 1166,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/hover/hoverDelegate2.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/hover/hoverDelegateFactory.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"612-RmuEHpAwQ+9P1JDmk7o5Se2CRic\"",
    "mtime": "2025-02-04T06:49:50.718Z",
    "size": 1554,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/hover/hoverDelegateFactory.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/hover/hoverWidget.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"1057-fr0akxcjiL+iH/8ms3RsWoNZhEM\"",
    "mtime": "2025-02-04T06:49:50.719Z",
    "size": 4183,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/hover/hoverWidget.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/hover/hoverWidget.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1013-//f4wTVV7ov+w9wiJHA5OcjkfSU\"",
    "mtime": "2025-02-04T06:49:50.718Z",
    "size": 4115,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/hover/hoverWidget.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/iconLabel/iconLabel.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2fb3-S7MoD89W4SHfCDdr5PCK9ezOa6E\"",
    "mtime": "2025-02-04T06:49:50.696Z",
    "size": 12211,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/iconLabel/iconLabel.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/iconLabel/iconLabels.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"560-etUdLpLpNxPxGgkVVpwQwsXhnFA\"",
    "mtime": "2025-02-04T06:49:50.719Z",
    "size": 1376,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/iconLabel/iconLabels.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/iconLabel/iconlabel.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"de9-EkCp0l7W4pX4XymXlPBLpMLr1Ww\"",
    "mtime": "2025-02-04T06:49:50.719Z",
    "size": 3561,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/iconLabel/iconlabel.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/inputbox/inputBox.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"8b1-k+IlTy4r5QJtsEtYOQzItpXMOGM\"",
    "mtime": "2025-02-04T06:49:50.719Z",
    "size": 2225,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/inputbox/inputBox.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/inputbox/inputBox.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"55af-FEu5liBaayf8dqgy9bTameGc2X0\"",
    "mtime": "2025-02-04T06:49:50.696Z",
    "size": 21935,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/inputbox/inputBox.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/keybindingLabel/keybindingLabel.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"3c5-oXp3LzwLi3mxG7cXxyS/JtAIm1g\"",
    "mtime": "2025-02-04T06:49:50.696Z",
    "size": 965,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/keybindingLabel/keybindingLabel.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/keybindingLabel/keybindingLabel.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1534-j+d8Fyw5aK33+hH5YMfj9oNABjI\"",
    "mtime": "2025-02-04T06:49:50.719Z",
    "size": 5428,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/keybindingLabel/keybindingLabel.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/list/list.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"75b-uhVxlIEWa8j3uxPdNsFDUHMBMjA\"",
    "mtime": "2025-02-04T06:49:50.719Z",
    "size": 1883,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/list/list.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/list/list.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1e1-QVK6Fh0Y5rzuey7gDQJFSHSAHBs\"",
    "mtime": "2025-02-04T06:49:50.696Z",
    "size": 481,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/list/list.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/list/listPaging.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"11dc-/vyf2al+72GM9cvN6Ox5436lKKg\"",
    "mtime": "2025-02-04T06:49:50.719Z",
    "size": 4572,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/list/listPaging.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/list/listView.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"c15e-2QoL/MRKm8K5SYh4UxTwJj7VLXI\"",
    "mtime": "2025-02-04T06:49:50.719Z",
    "size": 49502,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/list/listView.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/list/listWidget.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"f8f1-GFAV4EwydgBKsENKmAKrsMdvwXM\"",
    "mtime": "2025-02-04T06:49:50.719Z",
    "size": 63729,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/list/listWidget.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/list/rangeMap.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1386-yQ1hOAwZoAz+sIhYr8gXiSAw2so\"",
    "mtime": "2025-02-04T06:49:50.719Z",
    "size": 4998,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/list/rangeMap.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/list/rowCache.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"e57-YW8XVZlHf09HcoUNPBhkjEENths\"",
    "mtime": "2025-02-04T06:49:50.719Z",
    "size": 3671,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/list/rowCache.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/list/splice.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"251-RYS1rgrTf45+SBG12U+ST/Cq5A8\"",
    "mtime": "2025-02-04T06:49:50.719Z",
    "size": 593,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/list/splice.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/menu/menu.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"ada1-cxnUdtAG8qvYENO+VtQAClmGpZU\"",
    "mtime": "2025-02-04T06:49:50.696Z",
    "size": 44449,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/menu/menu.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/mouseCursor/mouseCursor.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"18e-Twz1GNwFhiSuI7qfVMrZix0zwhg\"",
    "mtime": "2025-02-04T06:49:50.696Z",
    "size": 398,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/mouseCursor/mouseCursor.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/mouseCursor/mouseCursor.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1c8-cnPQLtGGhUuUOZn9oPDbt6FjPbQ\"",
    "mtime": "2025-02-04T06:49:50.719Z",
    "size": 456,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/mouseCursor/mouseCursor.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/progressbar/progressbar.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"7c4-zx7dTvfqQX5nfactLR3HyIHKlRA\"",
    "mtime": "2025-02-04T06:49:50.719Z",
    "size": 1988,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/progressbar/progressbar.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/progressbar/progressbar.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"fa5-iocr+jL6da9UU2NEUnSwrBxxsZk\"",
    "mtime": "2025-02-04T06:49:50.696Z",
    "size": 4005,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/progressbar/progressbar.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/radio/radio.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"896-Ob8RQ+Npv0VyFFik76y5ZArjjuI\"",
    "mtime": "2025-02-04T06:49:50.696Z",
    "size": 2198,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/radio/radio.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/radio/radio.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"16-iP63oxa5rU6dQnZffX/CxqxXKe0\"",
    "mtime": "2025-02-04T06:49:50.719Z",
    "size": 22,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/radio/radio.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/resizable/resizable.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1b7c-gr7JEAUqbPzKGka1DetiVXOTcr0\"",
    "mtime": "2025-02-04T06:49:50.696Z",
    "size": 7036,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/resizable/resizable.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/sash/sash.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"ce9-w1AKYyAIRoW6HeI0jFyzCR9OM1Y\"",
    "mtime": "2025-02-04T06:49:50.696Z",
    "size": 3305,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/sash/sash.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/sash/sash.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4bfd-Rf2B4AEKk16coAzIMeStg7gFfsw\"",
    "mtime": "2025-02-04T06:49:50.720Z",
    "size": 19453,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/sash/sash.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/scrollbar/abstractScrollbar.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"23d7-awI25EAOFCiNF01Opx926fj14GQ\"",
    "mtime": "2025-02-04T06:49:50.720Z",
    "size": 9175,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/scrollbar/abstractScrollbar.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/scrollbar/horizontalScrollbar.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1104-DLWciS40Ik/MTen145a4Jk0JlL4\"",
    "mtime": "2025-02-04T06:49:50.720Z",
    "size": 4356,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/scrollbar/horizontalScrollbar.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/scrollbar/scrollableElement.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"6357-KNQV9XxeBB9rO6oO4LJju7r/T6w\"",
    "mtime": "2025-02-04T06:49:50.720Z",
    "size": 25431,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/scrollbar/scrollableElement.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/scrollbar/scrollableElementOptions.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"16b-EowE4pZYkCnO5xAyY6EVxovwQ0M\"",
    "mtime": "2025-02-04T06:49:50.720Z",
    "size": 363,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/scrollbar/scrollableElementOptions.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/scrollbar/scrollbarArrow.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"df5-TBMJi1C5tk2/WCGevAn2JSe1GIk\"",
    "mtime": "2025-02-04T06:49:50.720Z",
    "size": 3573,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/scrollbar/scrollbarArrow.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/scrollbar/scrollbarState.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1bfe-hVS/IxEOC+Hlrh4NvQ6Y+J0dfwQ\"",
    "mtime": "2025-02-04T06:49:50.720Z",
    "size": 7166,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/scrollbar/scrollbarState.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/scrollbar/scrollbarVisibilityController.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"c8a-M5sqLpmJ1DNloeRqZ9vBGeBV82c\"",
    "mtime": "2025-02-04T06:49:50.720Z",
    "size": 3210,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/scrollbar/scrollbarVisibilityController.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/scrollbar/verticalScrollbar.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1112-UtCPgirtPnBwcmtmCVqJsCbcQS0\"",
    "mtime": "2025-02-04T06:49:50.720Z",
    "size": 4370,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/scrollbar/verticalScrollbar.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/selectBox/selectBox.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"35f-TQq+R+nW5Gw/iCaT6/5yQiDfyho\"",
    "mtime": "2025-02-04T06:49:50.696Z",
    "size": 863,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/selectBox/selectBox.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/selectBox/selectBox.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"6fb-n9ZdtCEp1nIx5bQ0O7lbEvB0PjQ\"",
    "mtime": "2025-02-04T06:49:50.720Z",
    "size": 1787,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/selectBox/selectBox.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/selectBox/selectBoxCustom.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"efe-R57NySoYhrc/7coz3CDV4HQItbk\"",
    "mtime": "2025-02-04T06:49:50.720Z",
    "size": 3838,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/selectBox/selectBoxCustom.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/selectBox/selectBoxCustom.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"a93e-LP+s7dnibIMxFTYWBBYYpbazazY\"",
    "mtime": "2025-02-04T06:49:50.720Z",
    "size": 43326,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/selectBox/selectBoxCustom.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/selectBox/selectBoxNative.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"165f-u+dSPrxiCT6wr8CNnZ/3zJh3Foo\"",
    "mtime": "2025-02-04T06:49:50.727Z",
    "size": 5727,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/selectBox/selectBoxNative.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/splitview/splitview.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"7d2-KOkSxqoVxuOj2Ajgbt+KaYtMkK8\"",
    "mtime": "2025-02-04T06:49:50.720Z",
    "size": 2002,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/splitview/splitview.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/splitview/splitview.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"9419-EoGIAF6NPGRYHcVCJXHTikipECw\"",
    "mtime": "2025-02-04T06:49:50.696Z",
    "size": 37913,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/splitview/splitview.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/table/table.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"556-ijkid+ba/MEJDSt8jW3RxMynbk0\"",
    "mtime": "2025-02-04T06:49:50.696Z",
    "size": 1366,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/table/table.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/table/table.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"16b-EowE4pZYkCnO5xAyY6EVxovwQ0M\"",
    "mtime": "2025-02-04T06:49:50.727Z",
    "size": 363,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/table/table.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/table/tableWidget.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1fd7-oVDlh+5ahYu7kJ0AHwm8NyFHhNI\"",
    "mtime": "2025-02-04T06:49:50.727Z",
    "size": 8151,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/table/tableWidget.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/toggle/toggle.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"70a-H919iOOJ6gWRf4Ypm3IBX1I4G6E\"",
    "mtime": "2025-02-04T06:49:50.696Z",
    "size": 1802,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/toggle/toggle.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/toggle/toggle.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"fe7-B9yAumSpG3R4Ffpno5trO7Jd8tE\"",
    "mtime": "2025-02-04T06:49:50.727Z",
    "size": 4071,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/toggle/toggle.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/toolbar/toolbar.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"1d3-oYX/CiGYPZC5SdhddTW1Hbe+VZ8\"",
    "mtime": "2025-02-04T06:49:50.696Z",
    "size": 467,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/toolbar/toolbar.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/toolbar/toolbar.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1b59-F80yEwYKZ6WKLpbvFGx8MEMTCFE\"",
    "mtime": "2025-02-04T06:49:50.727Z",
    "size": 7001,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/toolbar/toolbar.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/tree/abstractTree.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1730c-RUS//XZ1s0AOxEAH1jm1DZqYcvQ\"",
    "mtime": "2025-02-04T06:49:50.727Z",
    "size": 94988,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/tree/abstractTree.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/tree/asyncDataTree.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"8ce7-oFPrdH2fy0eQvI9ZJ4RoAPau9aY\"",
    "mtime": "2025-02-04T06:49:50.727Z",
    "size": 36071,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/tree/asyncDataTree.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/tree/compressedObjectTreeModel.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"39fc-YT7uzJHhlKCXaoBGqSnjgjkypyA\"",
    "mtime": "2025-02-04T06:49:50.727Z",
    "size": 14844,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/tree/compressedObjectTreeModel.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/tree/dataTree.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"36f-SBPyvrKvhZLB51pR/jv/yAY6x5w\"",
    "mtime": "2025-02-04T06:49:50.727Z",
    "size": 879,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/tree/dataTree.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/tree/indexTreeModel.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5ad8-x8nvDjg3E9CZlil5o5nP4OJe8XE\"",
    "mtime": "2025-02-04T06:49:50.727Z",
    "size": 23256,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/tree/indexTreeModel.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/tree/objectTree.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2475-6KRrIBWb8iowMhngMANK93hZR2U\"",
    "mtime": "2025-02-04T06:49:50.727Z",
    "size": 9333,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/tree/objectTree.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/tree/objectTreeModel.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1fb5-xv+K8rCd/JR7dzzS+vqEbWFSo5Y\"",
    "mtime": "2025-02-04T06:49:50.727Z",
    "size": 8117,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/tree/objectTreeModel.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/tree/tree.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"7e7-jkQDZtgIufNFa68m3803b3YvFBY\"",
    "mtime": "2025-02-04T06:49:50.727Z",
    "size": 2023,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/tree/tree.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/parts/storage/common/storage.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1c1b-czK8M6fo1OlcitHxw9zfmZx3nXg\"",
    "mtime": "2025-02-04T06:49:50.727Z",
    "size": 7195,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/parts/storage/common/storage.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/services/hoverService/hover.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"ee5-l7ZM1XtwyTOdET6BOvPD/RRJ0YY\"",
    "mtime": "2025-02-04T06:49:50.679Z",
    "size": 3813,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/services/hoverService/hover.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/services/hoverService/hoverService.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4206-lGKWI6OuuCNnfR5vXipvEDLw7gY\"",
    "mtime": "2025-02-04T06:49:50.727Z",
    "size": 16902,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/services/hoverService/hoverService.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/services/hoverService/hoverWidget.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"72c4-72XxC25m7Wi1Zj0FP04eN8aQCcs\"",
    "mtime": "2025-02-04T06:49:50.727Z",
    "size": 29380,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/services/hoverService/hoverWidget.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/services/hoverService/updatableHoverWidget.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"f33-jSSk8We8rSVBVtqmiptBunl1W5k\"",
    "mtime": "2025-02-04T06:49:50.727Z",
    "size": 3891,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/services/hoverService/updatableHoverWidget.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/blockDecorations/blockDecorations.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"21f-ddFGUGOf8qSa5oRI6KYY96EPIOg\"",
    "mtime": "2025-02-04T06:49:50.679Z",
    "size": 543,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/blockDecorations/blockDecorations.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/blockDecorations/blockDecorations.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"f8c-ASz55AoFdg8ZERHqrW7Zb26S4/0\"",
    "mtime": "2025-02-04T06:49:50.727Z",
    "size": 3980,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/blockDecorations/blockDecorations.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/contentWidgets/contentWidgets.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"535b-U2axwJ7GY4vPMo10z47dI8Dq92Q\"",
    "mtime": "2025-02-04T06:49:50.696Z",
    "size": 21339,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/contentWidgets/contentWidgets.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/currentLineHighlight/currentLineHighlight.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"304-EyuAGeXwPM5/YCQivbysWqpMI+I\"",
    "mtime": "2025-02-04T06:49:50.696Z",
    "size": 772,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/currentLineHighlight/currentLineHighlight.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/currentLineHighlight/currentLineHighlight.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"24b2-0V0ZK6DOCN7SURP+jrL/Ya1g1Zw\"",
    "mtime": "2025-02-04T06:49:50.727Z",
    "size": 9394,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/currentLineHighlight/currentLineHighlight.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/decorations/decorations.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"202-894TCPNwdjQUc2djJcapRBT/mLE\"",
    "mtime": "2025-02-04T06:49:50.696Z",
    "size": 514,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/decorations/decorations.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/decorations/decorations.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"22aa-9QIvwHUjGGPU318GkmBu6R1vg6g\"",
    "mtime": "2025-02-04T06:49:50.727Z",
    "size": 8874,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/decorations/decorations.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/editorScrollbar/editorScrollbar.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1e25-3bX8jZJxsYf3x/TIGgqk6236cgk\"",
    "mtime": "2025-02-04T06:49:50.696Z",
    "size": 7717,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/editorScrollbar/editorScrollbar.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/glyphMargin/glyphMargin.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"3c9-hITmCkEZA4vmW+1TnP44SG7odtg\"",
    "mtime": "2025-02-04T06:49:50.696Z",
    "size": 969,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/glyphMargin/glyphMargin.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/glyphMargin/glyphMargin.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"43e4-P01ZaGFRuraiLKDdCiF4frMMF2k\"",
    "mtime": "2025-02-04T06:49:50.727Z",
    "size": 17380,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/glyphMargin/glyphMargin.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/indentGuides/indentGuides.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"1cc-GRm7rkJlDAa1WNPTY++gVhf3nMc\"",
    "mtime": "2025-02-04T06:49:50.696Z",
    "size": 460,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/indentGuides/indentGuides.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/indentGuides/indentGuides.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3b0d-I7c9Z7tfNTjPh0ZRScSvy8biwMs\"",
    "mtime": "2025-02-04T06:49:50.727Z",
    "size": 15117,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/indentGuides/indentGuides.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/lineNumbers/lineNumbers.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"3cd-m84rB2aipitVNi6ZLsjewwbuoWo\"",
    "mtime": "2025-02-04T06:49:50.696Z",
    "size": 973,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/lineNumbers/lineNumbers.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/lineNumbers/lineNumbers.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1fd8-9xWZ2uO8b96o7joO3nUPdZch9Fg\"",
    "mtime": "2025-02-04T06:49:50.727Z",
    "size": 8152,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/lineNumbers/lineNumbers.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/lines/domReadingContext.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"59d-CdCiGHI2riZziuRSLm3VQHBB2PI\"",
    "mtime": "2025-02-04T06:49:50.727Z",
    "size": 1437,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/lines/domReadingContext.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/lines/rangeUtil.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"15df-RNHECnrvCigQX9ZkPGC0pp5e+Ng\"",
    "mtime": "2025-02-04T06:49:50.696Z",
    "size": 5599,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/lines/rangeUtil.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/lines/viewLine.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"6656-PWe/nxpxWi0XFPvP3IRZRtssQPA\"",
    "mtime": "2025-02-04T06:49:50.727Z",
    "size": 26198,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/lines/viewLine.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/lines/viewLines.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"97f-YYsmPbhaeeTL65gnFlyQFjRwfm0\"",
    "mtime": "2025-02-04T06:49:50.727Z",
    "size": 2431,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/lines/viewLines.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/lines/viewLines.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"88f9-gVYonT6P2zjf6oG01WCGZixsUhs\"",
    "mtime": "2025-02-04T06:49:50.734Z",
    "size": 35065,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/lines/viewLines.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/linesDecorations/linesDecorations.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"268-qU5vt70DUaU5LxoILGBeZ0xpkiU\"",
    "mtime": "2025-02-04T06:49:50.697Z",
    "size": 616,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/linesDecorations/linesDecorations.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/linesDecorations/linesDecorations.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1096-tgt9NwayJ2N1vnlnQZyBKdZqg8U\"",
    "mtime": "2025-02-04T06:49:50.727Z",
    "size": 4246,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/linesDecorations/linesDecorations.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/margin/margin.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"1b6-/JZ1883bmxpToDSjKiqxO+025M8\"",
    "mtime": "2025-02-04T06:49:50.697Z",
    "size": 438,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/margin/margin.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/margin/margin.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"be1-h/m7bk7yCY8qXAf9VqWh/CeP2h4\"",
    "mtime": "2025-02-04T06:49:50.728Z",
    "size": 3041,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/margin/margin.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/marginDecorations/marginDecorations.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"229-hMQNcELju+q8q6lbIELEvyJ0vg4\"",
    "mtime": "2025-02-04T06:49:50.728Z",
    "size": 553,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/marginDecorations/marginDecorations.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/marginDecorations/marginDecorations.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b5a-TTpyUtohGyyCRodjAPxhPWakPHs\"",
    "mtime": "2025-02-04T06:49:50.697Z",
    "size": 2906,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/marginDecorations/marginDecorations.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/minimap/minimap.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"693-gpy4kxkxh5vLIlGbRlxT3Jd9Mhw\"",
    "mtime": "2025-02-04T06:49:50.697Z",
    "size": 1683,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/minimap/minimap.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/minimap/minimap.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"13b2c-JIaen9vMmLKGPwdWiRMkWBy79Ug\"",
    "mtime": "2025-02-04T06:49:50.728Z",
    "size": 80684,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/minimap/minimap.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/minimap/minimapCharRenderer.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1126-h2IP82MzO38oi9t02UWVicqSiGQ\"",
    "mtime": "2025-02-04T06:49:50.728Z",
    "size": 4390,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/minimap/minimapCharRenderer.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/minimap/minimapCharRendererFactory.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1c0a-LH94HC2k2kHuSkDeCw4U8pk8ViE\"",
    "mtime": "2025-02-04T06:49:50.728Z",
    "size": 7178,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/minimap/minimapCharRendererFactory.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/minimap/minimapCharSheet.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"433-gDQ0jH6UEI1bsGJAuF3mBDQ/a7Q\"",
    "mtime": "2025-02-04T06:49:50.728Z",
    "size": 1075,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/minimap/minimapCharSheet.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/minimap/minimapPreBaked.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"d49-Y6STygxsTzQTW8FBoivFw1P+EO8\"",
    "mtime": "2025-02-04T06:49:50.728Z",
    "size": 3401,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/minimap/minimapPreBaked.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/overviewRuler/decorationsOverviewRuler.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4a64-at9N4u9UE0ImXka7RBl4DbK/SNU\"",
    "mtime": "2025-02-04T06:49:50.697Z",
    "size": 19044,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/overviewRuler/decorationsOverviewRuler.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/overviewRuler/overviewRuler.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"152b-0vziSjntJzCIyLzgKH3wUR9VdXY\"",
    "mtime": "2025-02-04T06:49:50.728Z",
    "size": 5419,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/overviewRuler/overviewRuler.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/rulers/rulers.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"1e1-WkGGMLggydLyPwY+m93AHZzLocw\"",
    "mtime": "2025-02-04T06:49:50.697Z",
    "size": 481,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/rulers/rulers.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/rulers/rulers.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"c74-2pP1X9CZKJ4Wf8XK94WAabSVhy4\"",
    "mtime": "2025-02-04T06:49:50.728Z",
    "size": 3188,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/rulers/rulers.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/overlayWidgets/overlayWidgets.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"1a9-ttCU36fkiQgULAeRJfhh7AWhzzE\"",
    "mtime": "2025-02-04T06:49:50.697Z",
    "size": 425,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/overlayWidgets/overlayWidgets.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/overlayWidgets/overlayWidgets.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1e78-p04oJgNGLocMKtfDc4fb2+ZCY+s\"",
    "mtime": "2025-02-04T06:49:50.728Z",
    "size": 7800,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/overlayWidgets/overlayWidgets.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/scrollDecoration/scrollDecoration.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"1ff-ln2LrUHP55BA31QWtacJEDbN354\"",
    "mtime": "2025-02-04T06:49:50.697Z",
    "size": 511,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/scrollDecoration/scrollDecoration.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/scrollDecoration/scrollDecoration.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"a41-5uJhYMOPc+ARUilL59xrn7FnhYM\"",
    "mtime": "2025-02-04T06:49:50.728Z",
    "size": 2625,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/scrollDecoration/scrollDecoration.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/selections/selections.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"653-SDRifX2wYvR1x+Yj2Ss/k9ShS6U\"",
    "mtime": "2025-02-04T06:49:50.697Z",
    "size": 1619,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/selections/selections.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/selections/selections.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4023-rmmZu41KI032HQHIn83S9zohVLI\"",
    "mtime": "2025-02-04T06:49:50.728Z",
    "size": 16419,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/selections/selections.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/viewCursors/viewCursor.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"263d-baXVnYgu/4n+RlCxV+p76rTxQ9U\"",
    "mtime": "2025-02-04T06:49:50.697Z",
    "size": 9789,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/viewCursors/viewCursor.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/viewCursors/viewCursors.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"711-LuQI8W3AYMNKR97MbLBRV1KX/K4\"",
    "mtime": "2025-02-04T06:49:50.728Z",
    "size": 1809,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/viewCursors/viewCursors.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/viewCursors/viewCursors.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"36f7-aJllyNDSKVSO4vPKZSkb63Hv+mY\"",
    "mtime": "2025-02-04T06:49:50.728Z",
    "size": 14071,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/viewCursors/viewCursors.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/viewZones/viewZones.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"35d5-WcVWIVsUD2tfzMpbW+jZVRMF5B4\"",
    "mtime": "2025-02-04T06:49:50.697Z",
    "size": 13781,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/viewZones/viewZones.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/whitespace/whitespace.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"1cc-8jFLgxDvLKUtqFRWoP0JyKEAnNY\"",
    "mtime": "2025-02-04T06:49:50.697Z",
    "size": 460,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/whitespace/whitespace.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/whitespace/whitespace.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"32fb-HE7WHVlBpdosqaH3svvGsq9T4xk\"",
    "mtime": "2025-02-04T06:49:50.728Z",
    "size": 13051,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/viewParts/whitespace/whitespace.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/codeEditor/codeEditorContributions.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"175f-97/ykKJ0IvJfwo878jivH+YVPro\"",
    "mtime": "2025-02-04T06:49:50.679Z",
    "size": 5983,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/codeEditor/codeEditorContributions.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/codeEditor/codeEditorWidget.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.759Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/codeEditor/codeEditorWidget.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/codeEditor/codeEditorWidget.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"153fe-lXPDR4ZJ3dOK2VlfZBEJ5WmB+2k\"",
    "mtime": "2025-02-04T06:49:50.728Z",
    "size": 87038,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/codeEditor/codeEditorWidget.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/codeEditor/editor.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"bdd-pVZMcsprJqqTXD8hUY98AxHZe6s\"",
    "mtime": "2025-02-04T06:49:50.728Z",
    "size": 3037,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/codeEditor/editor.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/codeEditor/embeddedCodeEditorWidget.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"f09-xUg/choXXFOsBDvbgQrAD3eWQxA\"",
    "mtime": "2025-02-04T06:49:50.728Z",
    "size": 3849,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/codeEditor/embeddedCodeEditorWidget.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/diffEditor/commands.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"25eb-0HL5FfP8cCCZCW4nTxZpzh8RhEQ\"",
    "mtime": "2025-02-04T06:49:50.728Z",
    "size": 9707,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/diffEditor/commands.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/diffEditor/delegatingEditorImpl.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1460-UU+qUCLADLlmWog4rtfv+OKAj+8\"",
    "mtime": "2025-02-04T06:49:50.728Z",
    "size": 5216,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/diffEditor/delegatingEditorImpl.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/diffEditor/diffEditor.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.759Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/diffEditor/diffEditor.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/diffEditor/diffEditor.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1067-AjwTuNXHNiN5CBWdG+mPSC4ud5A\"",
    "mtime": "2025-02-04T06:49:50.728Z",
    "size": 4199,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/diffEditor/diffEditor.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/diffEditor/diffEditorOptions.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2d0f-QX5CJXrk86/ojE2Ho1ZOnhg8LuE\"",
    "mtime": "2025-02-04T06:49:50.728Z",
    "size": 11535,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/diffEditor/diffEditorOptions.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/diffEditor/diffEditorViewModel.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"8407-87fF/Pm7wUqfRT6rbGckq8OB7kc\"",
    "mtime": "2025-02-04T06:49:50.728Z",
    "size": 33799,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/diffEditor/diffEditorViewModel.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/diffEditor/diffEditorWidget.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"7a2a-/N/F3NF3wPEtwOeqTzNPrePDC2s\"",
    "mtime": "2025-02-04T06:49:50.728Z",
    "size": 31274,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/diffEditor/diffEditorWidget.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/diffEditor/diffProviderFactoryService.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1bd9-3lJpxzEhaBJgKDT7XTIXwbhRusc\"",
    "mtime": "2025-02-04T06:49:50.728Z",
    "size": 7129,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/diffEditor/diffProviderFactoryService.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/diffEditor/registrations.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"ee8-wSaPetbnGOU20u35/tyA7fcvUN0\"",
    "mtime": "2025-02-04T06:49:50.728Z",
    "size": 3816,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/diffEditor/registrations.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/diffEditor/style.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"2d30-E+BRrWa2NZXCRodX7Ix6K6/TOS8\"",
    "mtime": "2025-02-04T06:49:50.728Z",
    "size": 11568,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/diffEditor/style.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/diffEditor/utils.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"38f6-vzHfEzrwm5FsmoUcDECPV5Hw/Y4\"",
    "mtime": "2025-02-04T06:49:50.728Z",
    "size": 14582,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/diffEditor/utils.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/multiDiffEditor/colors.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"517-7lghpqLE5YjgwY9rxQ2ew9+CFqw\"",
    "mtime": "2025-02-04T06:49:50.728Z",
    "size": 1303,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/multiDiffEditor/colors.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/multiDiffEditor/diffEditorItemTemplate.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3695-JQrmaSjSJugd9Zkxp5DBGxhntk8\"",
    "mtime": "2025-02-04T06:49:50.697Z",
    "size": 13973,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/multiDiffEditor/diffEditorItemTemplate.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/multiDiffEditor/model.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"16b-EowE4pZYkCnO5xAyY6EVxovwQ0M\"",
    "mtime": "2025-02-04T06:49:50.728Z",
    "size": 363,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/multiDiffEditor/model.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/multiDiffEditor/multiDiffEditorViewModel.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"162d-Fn8WuW+5rygvDryvIDkXNHlGBXo\"",
    "mtime": "2025-02-04T06:49:50.728Z",
    "size": 5677,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/multiDiffEditor/multiDiffEditorViewModel.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/multiDiffEditor/multiDiffEditorWidget.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"a68-rl8VaEXA5D+F8b954V896hkphgw\"",
    "mtime": "2025-02-04T06:49:50.730Z",
    "size": 2664,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/multiDiffEditor/multiDiffEditorWidget.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/multiDiffEditor/multiDiffEditorWidgetImpl.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3d34-P8mcZcNeRPvsToe+0sGi9UFdf04\"",
    "mtime": "2025-02-04T06:49:50.730Z",
    "size": 15668,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/multiDiffEditor/multiDiffEditorWidgetImpl.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/multiDiffEditor/objectPool.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4e1-AyuBbBDzFV5PEgmVxLiaxy3smlo\"",
    "mtime": "2025-02-04T06:49:50.733Z",
    "size": 1249,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/multiDiffEditor/objectPool.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/multiDiffEditor/style.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"a28-dAgxkAxv9RxXxhl8VKJkPo2upEI\"",
    "mtime": "2025-02-04T06:49:50.732Z",
    "size": 2600,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/multiDiffEditor/style.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/multiDiffEditor/utils.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2bc-roxOI4KrtSy19+vriRgqXNdqdAk\"",
    "mtime": "2025-02-04T06:49:50.733Z",
    "size": 700,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/multiDiffEditor/utils.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/multiDiffEditor/workbenchUIElementFactory.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"16b-EowE4pZYkCnO5xAyY6EVxovwQ0M\"",
    "mtime": "2025-02-04T06:49:50.733Z",
    "size": 363,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/multiDiffEditor/workbenchUIElementFactory.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/diff/defaultLinesDiffComputer/computeMovedLines.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3360-kqrI1P0Q9QQpMAUHOxzOwvJIkBs\"",
    "mtime": "2025-02-04T06:49:50.697Z",
    "size": 13152,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/diff/defaultLinesDiffComputer/computeMovedLines.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/diff/defaultLinesDiffComputer/defaultLinesDiffComputer.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"38ae-rvJZSoIKK2+Aj0iR8KmFys+jcNI\"",
    "mtime": "2025-02-04T06:49:50.733Z",
    "size": 14510,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/diff/defaultLinesDiffComputer/defaultLinesDiffComputer.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/diff/defaultLinesDiffComputer/heuristicSequenceOptimizations.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"428d-dqqgTihLyxDLaqwNV1eFk7QKKcw\"",
    "mtime": "2025-02-04T06:49:50.733Z",
    "size": 17037,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/diff/defaultLinesDiffComputer/heuristicSequenceOptimizations.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/diff/defaultLinesDiffComputer/lineSequence.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"540-nGwrnh9Vf6gDzFbmYP8Sp16bh58\"",
    "mtime": "2025-02-04T06:49:50.733Z",
    "size": 1344,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/diff/defaultLinesDiffComputer/lineSequence.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/diff/defaultLinesDiffComputer/linesSliceCharSequence.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1f0e-pARUodmZsfNHYbtKRCp86kDnZTQ\"",
    "mtime": "2025-02-04T06:49:50.733Z",
    "size": 7950,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/diff/defaultLinesDiffComputer/linesSliceCharSequence.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/diff/defaultLinesDiffComputer/utils.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"8c6-d4oqk69afQw8HQ+CAfjchPHHY2M\"",
    "mtime": "2025-02-04T06:49:50.733Z",
    "size": 2246,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/diff/defaultLinesDiffComputer/utils.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/languages/supports/characterPair.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"8ae-7j697MI1Y6f/egPOou4msF+npt4\"",
    "mtime": "2025-02-04T06:49:50.679Z",
    "size": 2222,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/languages/supports/characterPair.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/languages/supports/electricCharacter.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"8f8-oEVgk4QwD1Jhx+0KJzdmrwr+vlc\"",
    "mtime": "2025-02-04T06:49:50.733Z",
    "size": 2296,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/languages/supports/electricCharacter.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/languages/supports/indentRules.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"a06-NXb/XX+OYKh+DXeVsDI8IOLSYP0\"",
    "mtime": "2025-02-04T06:49:50.733Z",
    "size": 2566,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/languages/supports/indentRules.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/languages/supports/indentationLineProcessor.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2a6d-F1JxfZGItzBqCN7vRZy/S+GCPzU\"",
    "mtime": "2025-02-04T06:49:50.733Z",
    "size": 10861,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/languages/supports/indentationLineProcessor.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/languages/supports/inplaceReplaceSupport.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b8b-dEcw8SYmk/wKDsTJOZpJZmKgke8\"",
    "mtime": "2025-02-04T06:49:50.733Z",
    "size": 2955,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/languages/supports/inplaceReplaceSupport.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/languages/supports/languageBracketsConfiguration.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"14c8-aKRdcE9CBhpRHBuCRIbkFKJN73Q\"",
    "mtime": "2025-02-04T06:49:50.733Z",
    "size": 5320,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/languages/supports/languageBracketsConfiguration.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/languages/supports/onEnter.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"10a5-VOi8DMW2Vf+lfTo/mEv+IzadSMA\"",
    "mtime": "2025-02-04T06:49:50.734Z",
    "size": 4261,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/languages/supports/onEnter.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/languages/supports/richEditBrackets.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3336-4vBVjGL6F8VpqhifkeZ8b396dKo\"",
    "mtime": "2025-02-04T06:49:50.734Z",
    "size": 13110,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/languages/supports/richEditBrackets.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/languages/supports/tokenization.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"28b2-u6BC0N1z6U/3lkp7gVYd+CKDNXc\"",
    "mtime": "2025-02-04T06:49:50.733Z",
    "size": 10418,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/languages/supports/tokenization.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/model/bracketPairsTextModelPart/bracketPairsImpl.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"8f76-sRZP/yZuDtmhlnmld/ZfjlpgzIY\"",
    "mtime": "2025-02-04T06:49:50.697Z",
    "size": 36726,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/model/bracketPairsTextModelPart/bracketPairsImpl.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/model/bracketPairsTextModelPart/colorizedBracketPairsDecorationProvider.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"11d5-hfTEuyInIWlrHXJulm5klS47zkk\"",
    "mtime": "2025-02-04T06:49:50.734Z",
    "size": 4565,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/model/bracketPairsTextModelPart/colorizedBracketPairsDecorationProvider.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/model/bracketPairsTextModelPart/fixBrackets.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"ca0-Ddj3YEpyQCBPVih5xa6Ae6/nvBM\"",
    "mtime": "2025-02-04T06:49:50.734Z",
    "size": 3232,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/model/bracketPairsTextModelPart/fixBrackets.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/model/pieceTreeTextBuffer/pieceTreeBase.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"f74f-508ES2GyFhH/79XUx7ZYgRfkat8\"",
    "mtime": "2025-02-04T06:49:50.697Z",
    "size": 63311,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/model/pieceTreeTextBuffer/pieceTreeBase.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/model/pieceTreeTextBuffer/pieceTreeTextBuffer.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"520f-Zd3IcW/+cSQYSS1dxwj+ymeBMnc\"",
    "mtime": "2025-02-04T06:49:50.734Z",
    "size": 21007,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/model/pieceTreeTextBuffer/pieceTreeTextBuffer.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/model/pieceTreeTextBuffer/pieceTreeTextBufferBuilder.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1665-06EeNcchu1dMyt3dY4+8vPleqSM\"",
    "mtime": "2025-02-04T06:49:50.734Z",
    "size": 5733,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/model/pieceTreeTextBuffer/pieceTreeTextBufferBuilder.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/model/pieceTreeTextBuffer/rbTreeBase.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2af1-nzEYW+DBnLoFbKb/8JsukUOy3Qo\"",
    "mtime": "2025-02-04T06:49:50.734Z",
    "size": 10993,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/model/pieceTreeTextBuffer/rbTreeBase.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/services/textModelSync/textModelSync.impl.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2bfb-BOYEdITsRS0qr73ksNQwnFT5JDo\"",
    "mtime": "2025-02-04T06:49:50.679Z",
    "size": 11259,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/services/textModelSync/textModelSync.impl.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/services/textModelSync/textModelSync.protocol.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"16b-EowE4pZYkCnO5xAyY6EVxovwQ0M\"",
    "mtime": "2025-02-04T06:49:50.734Z",
    "size": 363,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/services/textModelSync/textModelSync.protocol.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/standalone/browser/iPadShowKeyboard/iPadShowKeyboard.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"f7c-KKIOy+pefFQO3wuvZdimMjPZZ6c\"",
    "mtime": "2025-02-04T06:49:50.681Z",
    "size": 3964,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/standalone/browser/iPadShowKeyboard/iPadShowKeyboard.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/standalone/browser/iPadShowKeyboard/iPadShowKeyboard.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.764Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/standalone/browser/iPadShowKeyboard/iPadShowKeyboard.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/standalone/browser/iPadShowKeyboard/iPadShowKeyboard.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"a46-T8thsvRJcDD9p2ZKp6PqMSkRqGI\"",
    "mtime": "2025-02-04T06:49:50.734Z",
    "size": 2630,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/standalone/browser/iPadShowKeyboard/iPadShowKeyboard.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/standalone/browser/inspectTokens/inspectTokens.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"59b-HthYUqrMha+vYWokPch8XU3tJsk\"",
    "mtime": "2025-02-04T06:49:50.698Z",
    "size": 1435,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/standalone/browser/inspectTokens/inspectTokens.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/standalone/browser/inspectTokens/inspectTokens.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.764Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/standalone/browser/inspectTokens/inspectTokens.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/standalone/browser/inspectTokens/inspectTokens.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2d39-4eeg84ORPsJ31BGC0BfLb/UstlY\"",
    "mtime": "2025-02-04T06:49:50.734Z",
    "size": 11577,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/standalone/browser/inspectTokens/inspectTokens.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/standalone/browser/quickAccess/standaloneCommandsQuickAccess.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.764Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/standalone/browser/quickAccess/standaloneCommandsQuickAccess.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/standalone/browser/quickAccess/standaloneCommandsQuickAccess.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1148-rvn0h0altC3jATBlubIW5JWsKU0\"",
    "mtime": "2025-02-04T06:49:50.698Z",
    "size": 4424,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/standalone/browser/quickAccess/standaloneCommandsQuickAccess.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/standalone/browser/quickAccess/standaloneGotoLineQuickAccess.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.764Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/standalone/browser/quickAccess/standaloneGotoLineQuickAccess.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/standalone/browser/quickAccess/standaloneGotoLineQuickAccess.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"da3-MEuxr8+0Ie6JwXW4TAsP7VdxgSE\"",
    "mtime": "2025-02-04T06:49:50.734Z",
    "size": 3491,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/standalone/browser/quickAccess/standaloneGotoLineQuickAccess.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/standalone/browser/quickAccess/standaloneGotoSymbolQuickAccess.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.764Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/standalone/browser/quickAccess/standaloneGotoSymbolQuickAccess.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/standalone/browser/quickAccess/standaloneGotoSymbolQuickAccess.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"11a1-S5ROg1CUPcUhmsJALjqvnYMTf90\"",
    "mtime": "2025-02-04T06:49:50.734Z",
    "size": 4513,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/standalone/browser/quickAccess/standaloneGotoSymbolQuickAccess.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/standalone/browser/quickAccess/standaloneHelpQuickAccess.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.764Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/standalone/browser/quickAccess/standaloneHelpQuickAccess.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/standalone/browser/quickAccess/standaloneHelpQuickAccess.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"371-nMtGIjMUH4IQzntnLi2roalOqy0\"",
    "mtime": "2025-02-04T06:49:50.742Z",
    "size": 881,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/standalone/browser/quickAccess/standaloneHelpQuickAccess.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/standalone/browser/quickInput/standaloneQuickInput.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"7e9-UUwGIIJSxx2aEL5hZw9ME5h7E4Q\"",
    "mtime": "2025-02-04T06:49:50.698Z",
    "size": 2025,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/standalone/browser/quickInput/standaloneQuickInput.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/standalone/browser/quickInput/standaloneQuickInputService.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1c9b-z4uyx/dQAd8d49GOxd6yK0EjpP4\"",
    "mtime": "2025-02-04T06:49:50.734Z",
    "size": 7323,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/standalone/browser/quickInput/standaloneQuickInputService.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/standalone/browser/referenceSearch/standaloneReferenceSearch.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.764Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/standalone/browser/referenceSearch/standaloneReferenceSearch.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/standalone/browser/referenceSearch/standaloneReferenceSearch.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"a86-q58oKWmVgBEIdr30UGIk2n7sGos\"",
    "mtime": "2025-02-04T06:49:50.698Z",
    "size": 2694,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/standalone/browser/referenceSearch/standaloneReferenceSearch.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/standalone/browser/toggleHighContrast/toggleHighContrast.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.764Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/standalone/browser/toggleHighContrast/toggleHighContrast.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/standalone/browser/toggleHighContrast/toggleHighContrast.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"75f-X/NmFPwDAlKVClAsiP9rs8gGIjE\"",
    "mtime": "2025-02-04T06:49:50.698Z",
    "size": 1887,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/standalone/browser/toggleHighContrast/toggleHighContrast.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/standalone/common/monarch/monarchCommon.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"110f-N8t8v2Pf9FRQNjzyPb2eSl/rGj8\"",
    "mtime": "2025-02-04T06:49:50.681Z",
    "size": 4367,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/standalone/common/monarch/monarchCommon.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/standalone/common/monarch/monarchCompile.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"51e7-d8E+ox869tLsRASX5SlEuKs6Bbw\"",
    "mtime": "2025-02-04T06:49:50.735Z",
    "size": 20967,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/standalone/common/monarch/monarchCompile.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/standalone/common/monarch/monarchLexer.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"84e4-C4EPoil/tqgjQEUE0v7ndUdaV1Y\"",
    "mtime": "2025-02-04T06:49:50.735Z",
    "size": 34020,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/standalone/common/monarch/monarchLexer.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/standalone/common/monarch/monarchTypes.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"16b-EowE4pZYkCnO5xAyY6EVxovwQ0M\"",
    "mtime": "2025-02-04T06:49:50.735Z",
    "size": 363,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/standalone/common/monarch/monarchTypes.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/anchorSelect/browser/anchorSelect.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"1ba-W/SBisxxkXFlWNy3VAPvT9lYtms\"",
    "mtime": "2025-02-04T06:49:50.734Z",
    "size": 442,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/anchorSelect/browser/anchorSelect.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/anchorSelect/browser/anchorSelect.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.812Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/anchorSelect/browser/anchorSelect.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/anchorSelect/browser/anchorSelect.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1db8-i+op3ulhTd/lRSOATMKGFiBzm00\"",
    "mtime": "2025-02-04T06:49:50.789Z",
    "size": 7608,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/anchorSelect/browser/anchorSelect.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/bracketMatching/browser/bracketMatching.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"218-roSPN3u6B8g5NSDGGxYAX3UkA70\"",
    "mtime": "2025-02-04T06:49:50.766Z",
    "size": 536,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/bracketMatching/browser/bracketMatching.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/bracketMatching/browser/bracketMatching.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.812Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/bracketMatching/browser/bracketMatching.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/bracketMatching/browser/bracketMatching.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3dcf-vIgUEJ6gaBC1KPOKlRVAmkCZmu4\"",
    "mtime": "2025-02-04T06:49:50.788Z",
    "size": 15823,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/bracketMatching/browser/bracketMatching.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/caretOperations/browser/caretOperations.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.812Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/caretOperations/browser/caretOperations.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/caretOperations/browser/caretOperations.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"79d-QLv0L7WaLc4OXKkg7BRUMdNSU/Q\"",
    "mtime": "2025-02-04T06:49:50.766Z",
    "size": 1949,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/caretOperations/browser/caretOperations.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/caretOperations/browser/moveCaretCommand.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"92e-+N2CsbEGJU+UCpoM8gZVMoJDFe4\"",
    "mtime": "2025-02-04T06:49:50.789Z",
    "size": 2350,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/caretOperations/browser/moveCaretCommand.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/caretOperations/browser/transpose.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.812Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/caretOperations/browser/transpose.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/caretOperations/browser/transpose.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"caf-FNwRhHNLYvQ2CbweO4HSVu/bxW0\"",
    "mtime": "2025-02-04T06:49:50.788Z",
    "size": 3247,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/caretOperations/browser/transpose.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/clipboard/browser/clipboard.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.812Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/clipboard/browser/clipboard.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/clipboard/browser/clipboard.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2fc2-6YCYRnNlnZK81OwiQ0hc6GhdyGE\"",
    "mtime": "2025-02-04T06:49:50.766Z",
    "size": 12226,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/clipboard/browser/clipboard.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/codeAction/browser/codeAction.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"317f-DbQY8QCP4uCURDQz+YmEID3svaU\"",
    "mtime": "2025-02-04T06:49:50.789Z",
    "size": 12671,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/codeAction/browser/codeAction.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/codeAction/browser/codeActionCommands.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2fcf-IHBRUgCurgoPBsnpWgP7h7L3Xus\"",
    "mtime": "2025-02-04T06:49:50.766Z",
    "size": 12239,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/codeAction/browser/codeActionCommands.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/codeAction/browser/codeActionContributions.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.817Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/codeAction/browser/codeActionContributions.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/codeAction/browser/codeActionContributions.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"c25-E3REV/04fx9LMIsmWqr7xpfZvXc\"",
    "mtime": "2025-02-04T06:49:50.789Z",
    "size": 3109,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/codeAction/browser/codeActionContributions.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/codeAction/browser/codeActionController.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"49a6-qCCF4noxjpsy5FzQciCDyZSQmJY\"",
    "mtime": "2025-02-04T06:49:50.789Z",
    "size": 18854,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/codeAction/browser/codeActionController.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/codeAction/browser/codeActionKeybindingResolver.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"114c-sRP3vQ2fjDCvd04BSGUpH2gANMQ\"",
    "mtime": "2025-02-04T06:49:50.789Z",
    "size": 4428,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/codeAction/browser/codeActionKeybindingResolver.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/codeAction/browser/codeActionMenu.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"ec8-9s7G21kQ2N+jlT0u5+bUWUI3gKo\"",
    "mtime": "2025-02-04T06:49:50.789Z",
    "size": 3784,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/codeAction/browser/codeActionMenu.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/codeAction/browser/codeActionModel.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"47e7-U4I27sIWmr8O1OF/tX0C+0oZd+c\"",
    "mtime": "2025-02-04T06:49:50.789Z",
    "size": 18407,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/codeAction/browser/codeActionModel.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/codeAction/browser/lightBulbWidget.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"81d-Csz/TWFAM34zjrFyjfMJoJZxz5M\"",
    "mtime": "2025-02-04T06:49:50.789Z",
    "size": 2077,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/codeAction/browser/lightBulbWidget.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/codeAction/browser/lightBulbWidget.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"517c-RkdNDcBaoRd2+4arA1zz8C32XGU\"",
    "mtime": "2025-02-04T06:49:50.789Z",
    "size": 20860,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/codeAction/browser/lightBulbWidget.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/codeAction/common/types.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"16c0-Q8j3mG6Tjn8GNvDSNZCixurNAD4\"",
    "mtime": "2025-02-04T06:49:50.777Z",
    "size": 5824,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/codeAction/common/types.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/codelens/browser/codeLensCache.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"13e3-mxbVf9irHy61oK7pKVe8u3D031c\"",
    "mtime": "2025-02-04T06:49:50.766Z",
    "size": 5091,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/codelens/browser/codeLensCache.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/codelens/browser/codelens.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"10a7-FEUl8BdOWAfh23Qgm64znbRm0kg\"",
    "mtime": "2025-02-04T06:49:50.789Z",
    "size": 4263,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/codelens/browser/codelens.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/codelens/browser/codelensController.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.812Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/codelens/browser/codelensController.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/codelens/browser/codelensController.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5882-foJFdNSQgqaPtadswrqROYm4H+E\"",
    "mtime": "2025-02-04T06:49:50.789Z",
    "size": 22658,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/codelens/browser/codelensController.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/codelens/browser/codelensWidget.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"774-oPIZW3Ln+79o2uPWTkAyixju5RM\"",
    "mtime": "2025-02-04T06:49:50.789Z",
    "size": 1908,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/codelens/browser/codelensWidget.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/codelens/browser/codelensWidget.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2711-epKjvK7fXIwJPMO0Ft11zqr0XnE\"",
    "mtime": "2025-02-04T06:49:50.789Z",
    "size": 10001,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/codelens/browser/codelensWidget.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/colorPicker/browser/color.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"15a8-Iiad/IFcU2aEPUIOYGzDm90PZ20\"",
    "mtime": "2025-02-04T06:49:50.766Z",
    "size": 5544,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/colorPicker/browser/color.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/colorPicker/browser/colorContributions.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.818Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/colorPicker/browser/colorContributions.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/colorPicker/browser/colorContributions.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"a08-8Q5OTUHBVPM5VVj/9jbgezICXyk\"",
    "mtime": "2025-02-04T06:49:50.789Z",
    "size": 2568,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/colorPicker/browser/colorContributions.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/colorPicker/browser/colorDetector.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2dc7-hYzm2SH3DUJNdTK7HaMe1/CVKww\"",
    "mtime": "2025-02-04T06:49:50.789Z",
    "size": 11719,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/colorPicker/browser/colorDetector.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/colorPicker/browser/colorHoverParticipant.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2bc0-HbaJBcfJW3BDBbgR5jpzEMHdJj0\"",
    "mtime": "2025-02-04T06:49:50.789Z",
    "size": 11200,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/colorPicker/browser/colorHoverParticipant.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/colorPicker/browser/colorPicker.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"12e7-LJCpLU5hXfXho2qKcB4t1TzUgrU\"",
    "mtime": "2025-02-04T06:49:50.789Z",
    "size": 4839,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/colorPicker/browser/colorPicker.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/colorPicker/browser/colorPickerModel.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"c06-Ac3M0QOASf4JLEtuGt+h3dEd+SA\"",
    "mtime": "2025-02-04T06:49:50.789Z",
    "size": 3078,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/colorPicker/browser/colorPickerModel.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/colorPicker/browser/colorPickerWidget.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4041-L/BXce/M8deXehYIW++EJW5QV9g\"",
    "mtime": "2025-02-04T06:49:50.789Z",
    "size": 16449,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/colorPicker/browser/colorPickerWidget.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/colorPicker/browser/defaultDocumentColorProvider.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"d98-2TBS+kEofqerg32/IYoB514SVzQ\"",
    "mtime": "2025-02-04T06:49:50.789Z",
    "size": 3480,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/colorPicker/browser/defaultDocumentColorProvider.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/colorPicker/browser/standaloneColorPickerActions.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.817Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/colorPicker/browser/standaloneColorPickerActions.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/colorPicker/browser/standaloneColorPickerActions.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"f3c-wbNrj7Kdj2+OEdbqhRFUxPREg8Q\"",
    "mtime": "2025-02-04T06:49:50.789Z",
    "size": 3900,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/colorPicker/browser/standaloneColorPickerActions.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/colorPicker/browser/standaloneColorPickerWidget.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3037-eXKWRfFP3v1UMIqecWcOvooDNqo\"",
    "mtime": "2025-02-04T06:49:50.789Z",
    "size": 12343,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/colorPicker/browser/standaloneColorPickerWidget.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/comment/browser/blockCommentCommand.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1eee-jPRpJDTsxvq37rrzqAIGYJM6X7o\"",
    "mtime": "2025-02-04T06:49:50.766Z",
    "size": 7918,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/comment/browser/blockCommentCommand.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/comment/browser/comment.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.817Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/comment/browser/comment.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/comment/browser/comment.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1a68-wV+k5rhNbr/MqprbZvinnhafUN4\"",
    "mtime": "2025-02-04T06:49:50.789Z",
    "size": 6760,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/comment/browser/comment.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/comment/browser/lineCommentCommand.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"40c5-Nt+pxyxHtVnRDDRMBH4mY/XSrfY\"",
    "mtime": "2025-02-04T06:49:50.789Z",
    "size": 16581,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/comment/browser/lineCommentCommand.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/contextmenu/browser/contextmenu.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.817Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/contextmenu/browser/contextmenu.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/contextmenu/browser/contextmenu.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"407c-S7Hvcv/9mzn8C+fCrG7zIruZBxo\"",
    "mtime": "2025-02-04T06:49:50.766Z",
    "size": 16508,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/contextmenu/browser/contextmenu.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/cursorUndo/browser/cursorUndo.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.817Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/cursorUndo/browser/cursorUndo.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/cursorUndo/browser/cursorUndo.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"143e-YPbgX7/HC5vltHsnU0Xep8g0Q3I\"",
    "mtime": "2025-02-04T06:49:50.766Z",
    "size": 5182,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/cursorUndo/browser/cursorUndo.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/diffEditorBreadcrumbs/browser/contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.817Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/diffEditorBreadcrumbs/browser/contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/diffEditorBreadcrumbs/browser/contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"f72-3RbDJpzdq5/CtMeb2xfjf0Z3iHE\"",
    "mtime": "2025-02-04T06:49:50.766Z",
    "size": 3954,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/diffEditorBreadcrumbs/browser/contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/dnd/browser/dnd.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"48a-Wt+TYiPr0J1sdJkzv0hLk9ei5jI\"",
    "mtime": "2025-02-04T06:49:50.766Z",
    "size": 1162,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/dnd/browser/dnd.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/dnd/browser/dnd.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.817Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/dnd/browser/dnd.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/dnd/browser/dnd.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"22a9-b/6LNyiv34+VmL17eNSL+nPO4QM\"",
    "mtime": "2025-02-04T06:49:50.789Z",
    "size": 8873,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/dnd/browser/dnd.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/dnd/browser/dragAndDropCommand.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"117e-PaHJc505vXIHAlWP55j/us6QnJQ\"",
    "mtime": "2025-02-04T06:49:50.789Z",
    "size": 4478,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/dnd/browser/dragAndDropCommand.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/documentSymbols/browser/documentSymbols.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.818Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/documentSymbols/browser/documentSymbols.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/documentSymbols/browser/documentSymbols.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"535-lYlsloAJno/QmaF/1ovblOPOvlU\"",
    "mtime": "2025-02-04T06:49:50.766Z",
    "size": 1333,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/documentSymbols/browser/documentSymbols.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/documentSymbols/browser/outlineModel.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2a89-3Ta8tBT7s6fKhs5ZXSfG6GmzM8E\"",
    "mtime": "2025-02-04T06:49:50.789Z",
    "size": 10889,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/documentSymbols/browser/outlineModel.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/dropOrPasteInto/browser/copyPasteContribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.817Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/dropOrPasteInto/browser/copyPasteContribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/dropOrPasteInto/browser/copyPasteContribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"f87-37ruRqm6rvkVFPePTf6f41Wr00Q\"",
    "mtime": "2025-02-04T06:49:50.766Z",
    "size": 3975,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/dropOrPasteInto/browser/copyPasteContribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/dropOrPasteInto/browser/copyPasteController.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"66ff-d8cusHyM+LmHUwwCI8FISN2+xBc\"",
    "mtime": "2025-02-04T06:49:50.789Z",
    "size": 26367,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/dropOrPasteInto/browser/copyPasteController.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/dropOrPasteInto/browser/defaultProviders.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"25e9-e2fvM7wIQZUzt4ea89dAVwkdmYw\"",
    "mtime": "2025-02-04T06:49:50.789Z",
    "size": 9705,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/dropOrPasteInto/browser/defaultProviders.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/dropOrPasteInto/browser/dropIntoEditorContribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.818Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/dropOrPasteInto/browser/dropIntoEditorContribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/dropOrPasteInto/browser/dropIntoEditorContribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"aff-XVsNED3V7l/HKJ/8nYqi+nwR+ag\"",
    "mtime": "2025-02-04T06:49:50.789Z",
    "size": 2815,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/dropOrPasteInto/browser/dropIntoEditorContribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/dropOrPasteInto/browser/dropIntoEditorController.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"25a6-LFM+lDnA5bTd7HtMnON3tk+ZC/A\"",
    "mtime": "2025-02-04T06:49:50.789Z",
    "size": 9638,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/dropOrPasteInto/browser/dropIntoEditorController.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/dropOrPasteInto/browser/edit.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"bc2-EjaDTflR0zIfS4h7y0Gotg0JYyc\"",
    "mtime": "2025-02-04T06:49:50.789Z",
    "size": 3010,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/dropOrPasteInto/browser/edit.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/dropOrPasteInto/browser/postEditWidget.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"357-U+I5FIBX1qk7eNDo+W5dXc7Jliw\"",
    "mtime": "2025-02-04T06:49:50.789Z",
    "size": 855,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/dropOrPasteInto/browser/postEditWidget.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/dropOrPasteInto/browser/postEditWidget.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"251f-Ze29nzIALKjERvDo+a2zXuCalkY\"",
    "mtime": "2025-02-04T06:49:50.789Z",
    "size": 9503,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/dropOrPasteInto/browser/postEditWidget.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/editorState/browser/editorState.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"11b7-rHzhzsTi5LJiQxaFP9vYd7jrcBI\"",
    "mtime": "2025-02-04T06:49:50.766Z",
    "size": 4535,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/editorState/browser/editorState.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/editorState/browser/keybindingCancellation.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"cb8-Vl/r3Rcn+mCEsuewlL4daODeXDk\"",
    "mtime": "2025-02-04T06:49:50.789Z",
    "size": 3256,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/editorState/browser/keybindingCancellation.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/find/browser/findController.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.818Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/find/browser/findController.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/find/browser/findController.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"a631-n+2oH6DY91DUKWXuCEU4AoKUb9k\"",
    "mtime": "2025-02-04T06:49:50.789Z",
    "size": 42545,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/find/browser/findController.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/find/browser/findDecorations.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"369a-MxjbvHHP+UEwQyP8zYrLmaBv1c4\"",
    "mtime": "2025-02-04T06:49:50.766Z",
    "size": 13978,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/find/browser/findDecorations.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/find/browser/findModel.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5c4e-QUHWdq+ADmrDuIB20RrAAlMmNfc\"",
    "mtime": "2025-02-04T06:49:50.789Z",
    "size": 23630,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/find/browser/findModel.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/find/browser/findOptionsWidget.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"257-FdGayGGSBO8uXjhyfl0iX1KmeYg\"",
    "mtime": "2025-02-04T06:49:50.789Z",
    "size": 599,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/find/browser/findOptionsWidget.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/find/browser/findOptionsWidget.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"169d-MyU2OfO2HEZyuchsMy2XLDr4XC4\"",
    "mtime": "2025-02-04T06:49:50.790Z",
    "size": 5789,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/find/browser/findOptionsWidget.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/find/browser/findState.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"27f8-4lihvVgKma+HBNgnNpq7PjYYR78\"",
    "mtime": "2025-02-04T06:49:50.789Z",
    "size": 10232,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/find/browser/findState.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/find/browser/findWidget.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"1be1-33bpg1iovHCY0wHVUv2fzB+lUlk\"",
    "mtime": "2025-02-04T06:49:50.789Z",
    "size": 7137,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/find/browser/findWidget.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/find/browser/findWidget.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"d3bf-biNv3LL2FRjePRfrK3YBxWaEr+I\"",
    "mtime": "2025-02-04T06:49:50.789Z",
    "size": 54207,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/find/browser/findWidget.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/find/browser/replaceAllCommand.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"918-lr+Fn/A22+bqOKdS7W7TYLqN+rU\"",
    "mtime": "2025-02-04T06:49:50.790Z",
    "size": 2328,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/find/browser/replaceAllCommand.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/find/browser/replacePattern.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2b6d-0dnb2whMTf1G0JrUEwBmQJqSNbk\"",
    "mtime": "2025-02-04T06:49:50.790Z",
    "size": 11117,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/find/browser/replacePattern.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/folding/browser/folding.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"85f-BK+NPnMpn9ihUxpX9p8bOxwNti4\"",
    "mtime": "2025-02-04T06:49:50.766Z",
    "size": 2143,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/folding/browser/folding.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/folding/browser/folding.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.824Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/folding/browser/folding.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/folding/browser/folding.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"cbf7-KPvp0eXn2vmrk6cL0fMk9bEehFc\"",
    "mtime": "2025-02-04T06:49:50.790Z",
    "size": 52215,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/folding/browser/folding.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/folding/browser/foldingDecorations.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2534-TsiuFCrPA+ihG5iOQokOTgC0mi8\"",
    "mtime": "2025-02-04T06:49:50.790Z",
    "size": 9524,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/folding/browser/foldingDecorations.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/folding/browser/foldingModel.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5ce6-9OKtrawYQyhrlRU3uvNBlkj0Wsg\"",
    "mtime": "2025-02-04T06:49:50.790Z",
    "size": 23782,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/folding/browser/foldingModel.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/folding/browser/foldingRanges.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3765-sgDzd4UIpf7R7A/ploX1Odrxh7Q\"",
    "mtime": "2025-02-04T06:49:50.790Z",
    "size": 14181,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/folding/browser/foldingRanges.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/folding/browser/hiddenRangeModel.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"144c-T4Mhe9skSc+lsvFV+nhP+mu74bs\"",
    "mtime": "2025-02-04T06:49:50.790Z",
    "size": 5196,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/folding/browser/hiddenRangeModel.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/folding/browser/indentRangeProvider.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1cc6-QCV5WpxMsJGzdTI8Mytc/Z4qF34\"",
    "mtime": "2025-02-04T06:49:50.790Z",
    "size": 7366,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/folding/browser/indentRangeProvider.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/folding/browser/syntaxRangeProvider.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1b47-m20kvqQWzP+MuUJpzvIAWaQtMIE\"",
    "mtime": "2025-02-04T06:49:50.790Z",
    "size": 6983,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/folding/browser/syntaxRangeProvider.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/fontZoom/browser/fontZoom.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.818Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/fontZoom/browser/fontZoom.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/fontZoom/browser/fontZoom.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"76f-fEiFYpj9SzeeviT1DI++a3Fpo8Y\"",
    "mtime": "2025-02-04T06:49:50.766Z",
    "size": 1903,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/fontZoom/browser/fontZoom.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/format/browser/format.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"45ca-dpGy4TLSIqH02TUqB0MOD7tG9NA\"",
    "mtime": "2025-02-04T06:49:50.769Z",
    "size": 17866,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/format/browser/format.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/format/browser/formatActions.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.818Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/format/browser/formatActions.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/format/browser/formatActions.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"32a1-+PMfPHkQsf4xUwMGfjzRb4EeqKU\"",
    "mtime": "2025-02-04T06:49:50.790Z",
    "size": 12961,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/format/browser/formatActions.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/format/browser/formattingEdit.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"941-Lmh7tlNLSuRBadyrkt0uXIbp8fs\"",
    "mtime": "2025-02-04T06:49:50.790Z",
    "size": 2369,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/format/browser/formattingEdit.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/gotoError/browser/gotoError.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.818Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/gotoError/browser/gotoError.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/gotoError/browser/gotoError.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"314c-di/pmG1UP6ceHQaDqBvLpeB5i/g\"",
    "mtime": "2025-02-04T06:49:50.790Z",
    "size": 12620,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/gotoError/browser/gotoError.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/gotoError/browser/gotoErrorWidget.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4a93-B2IRSePj64o3ild2EbegQge6PAY\"",
    "mtime": "2025-02-04T06:49:50.790Z",
    "size": 19091,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/gotoError/browser/gotoErrorWidget.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/gotoError/browser/markerNavigationService.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2002-Cs+skJ0Z0oJ2JV0y476yjunSGg0\"",
    "mtime": "2025-02-04T06:49:50.790Z",
    "size": 8194,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/gotoError/browser/markerNavigationService.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/gotoSymbol/browser/goToCommands.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.818Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/gotoSymbol/browser/goToCommands.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/gotoSymbol/browser/goToCommands.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"8063-IKLvow7Im0/bQWzN0tFqzdq5Msk\"",
    "mtime": "2025-02-04T06:49:50.790Z",
    "size": 32867,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/gotoSymbol/browser/goToCommands.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/gotoSymbol/browser/goToSymbol.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1e31-bpaw99BGXPVpdvJxJ8/V2MCPhL4\"",
    "mtime": "2025-02-04T06:49:50.790Z",
    "size": 7729,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/gotoSymbol/browser/goToSymbol.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/gotoSymbol/browser/referencesModel.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2450-Idan+9rxNu/r9RDKxxLQIwjyFHQ\"",
    "mtime": "2025-02-04T06:49:50.790Z",
    "size": 9296,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/gotoSymbol/browser/referencesModel.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/gotoSymbol/browser/symbolNavigation.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"200c-cdddQZEk5vzS3UttyBfesR5Njws\"",
    "mtime": "2025-02-04T06:49:50.790Z",
    "size": 8204,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/gotoSymbol/browser/symbolNavigation.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inPlaceReplace/browser/inPlaceReplace.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"1ca-1LsdZUywEkkCyaPKJu0gG/3Mkpg\"",
    "mtime": "2025-02-04T06:49:50.790Z",
    "size": 458,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inPlaceReplace/browser/inPlaceReplace.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inPlaceReplace/browser/inPlaceReplace.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.818Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inPlaceReplace/browser/inPlaceReplace.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inPlaceReplace/browser/inPlaceReplace.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1cc6-X6paY/vDLnou+VKBqnWgKA7tZbo\"",
    "mtime": "2025-02-04T06:49:50.767Z",
    "size": 7366,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inPlaceReplace/browser/inPlaceReplace.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inPlaceReplace/browser/inPlaceReplaceCommand.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"57b-KN6LRMbBPPpu8LaD6Htv3gMMO90\"",
    "mtime": "2025-02-04T06:49:50.790Z",
    "size": 1403,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inPlaceReplace/browser/inPlaceReplaceCommand.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/hover/browser/contentHoverComputer.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"e20-YKY94/pRY6r7Nwj84/E1CcX3EWo\"",
    "mtime": "2025-02-04T06:49:50.767Z",
    "size": 3616,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/hover/browser/contentHoverComputer.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/hover/browser/contentHoverController2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"36cf-9UJRIzrkS61hfmeBjIon110jti4\"",
    "mtime": "2025-02-04T06:49:50.790Z",
    "size": 14031,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/hover/browser/contentHoverController2.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/hover/browser/contentHoverRendered.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2f8e-IT4I6mKvnjO/PINugkRDNgXNwNY\"",
    "mtime": "2025-02-04T06:49:50.790Z",
    "size": 12174,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/hover/browser/contentHoverRendered.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/hover/browser/contentHoverStatusBar.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"a09-Iwuxey0954KqAuTtqNaTqN2jFZI\"",
    "mtime": "2025-02-04T06:49:50.790Z",
    "size": 2569,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/hover/browser/contentHoverStatusBar.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/hover/browser/contentHoverTypes.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"474-oPFq2avJIZbeXOza4DC6sXTUw0s\"",
    "mtime": "2025-02-04T06:49:50.790Z",
    "size": 1140,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/hover/browser/contentHoverTypes.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/hover/browser/contentHoverWidget.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4c6c-c3KDCnC1Covb905F8I7ZqMIt+mw\"",
    "mtime": "2025-02-04T06:49:50.790Z",
    "size": 19564,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/hover/browser/contentHoverWidget.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/hover/browser/contentHoverWidgetWrapper.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3d58-Le8FO/OhX4R4saPJAbZHwg8N61I\"",
    "mtime": "2025-02-04T06:49:50.790Z",
    "size": 15704,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/hover/browser/contentHoverWidgetWrapper.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/hover/browser/getHover.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"acd-R07Wg5MuWOAknthQHFw0H7pnJOY\"",
    "mtime": "2025-02-04T06:49:50.790Z",
    "size": 2765,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/hover/browser/getHover.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/hover/browser/hover.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"78e-eOlJjP0zCwa0+RzoIGI/S2f46i0\"",
    "mtime": "2025-02-04T06:49:50.790Z",
    "size": 1934,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/hover/browser/hover.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/hover/browser/hoverAccessibleViews.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"75-/yzCLm1wRAo0gGY5rGinZrcxxUI\"",
    "mtime": "2025-02-04T06:49:50.790Z",
    "size": 117,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/hover/browser/hoverAccessibleViews.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/hover/browser/hoverActionIds.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"6f6-paCSR2M0z+LZbmpYcAs1HbFM4fg\"",
    "mtime": "2025-02-04T06:49:50.790Z",
    "size": 1782,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/hover/browser/hoverActionIds.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/hover/browser/hoverActions.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4510-fNPslw0GQfQXZ45l701u+l5YlpI\"",
    "mtime": "2025-02-04T06:49:50.790Z",
    "size": 17680,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/hover/browser/hoverActions.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/hover/browser/hoverContribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.818Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/hover/browser/hoverContribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/hover/browser/hoverContribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"cba-7lRbiNWQsKqWCSUKFNAdriQpWdQ\"",
    "mtime": "2025-02-04T06:49:50.790Z",
    "size": 3258,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/hover/browser/hoverContribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/hover/browser/hoverOperation.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"18b7-UGCf45DgGL1OkvM55eWz2/b3Dww\"",
    "mtime": "2025-02-04T06:49:50.790Z",
    "size": 6327,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/hover/browser/hoverOperation.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/hover/browser/hoverTypes.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"90f-EmLRe7fu7d2J/rmq1ZDsw9UgmSI\"",
    "mtime": "2025-02-04T06:49:50.790Z",
    "size": 2319,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/hover/browser/hoverTypes.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/hover/browser/hoverUtils.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2fb-dJ8NcfO77TXauJh6qT23oKggeKE\"",
    "mtime": "2025-02-04T06:49:50.790Z",
    "size": 763,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/hover/browser/hoverUtils.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/hover/browser/marginHoverComputer.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"790-Td9z4pjarT2AgIE1IVoj+B6P4Jw\"",
    "mtime": "2025-02-04T06:49:50.790Z",
    "size": 1936,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/hover/browser/marginHoverComputer.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/hover/browser/marginHoverController.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1d81-novL2ZmmSbFLLxyYNgoStTe5jmU\"",
    "mtime": "2025-02-04T06:49:50.790Z",
    "size": 7553,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/hover/browser/marginHoverController.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/hover/browser/marginHoverWidget.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1ec5-twQU0Ds6IXJfEKBIahDtavcqt2k\"",
    "mtime": "2025-02-04T06:49:50.790Z",
    "size": 7877,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/hover/browser/marginHoverWidget.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/hover/browser/markdownHoverParticipant.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5375-KMmvfYy2Jpj9UFi+zAbpf5XHEjU\"",
    "mtime": "2025-02-04T06:49:50.790Z",
    "size": 21365,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/hover/browser/markdownHoverParticipant.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/hover/browser/markerHoverParticipant.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3486-PqOcAXxOH4H61ovmdxU3qtiohvY\"",
    "mtime": "2025-02-04T06:49:50.791Z",
    "size": 13446,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/hover/browser/markerHoverParticipant.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/hover/browser/resizableContentWidget.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"10a0-rsVq9I+Q5esFHF/1IrMZeuqmbJM\"",
    "mtime": "2025-02-04T06:49:50.790Z",
    "size": 4256,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/hover/browser/resizableContentWidget.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/indentation/browser/indentation.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.818Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/indentation/browser/indentation.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/indentation/browser/indentation.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"684b-21qS5zBsdMO3qWbJ3gGWqtn8szY\"",
    "mtime": "2025-02-04T06:49:50.767Z",
    "size": 26699,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/indentation/browser/indentation.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/indentation/common/indentUtils.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"426-zfVpfia791v7ogX9zu0jITkXokk\"",
    "mtime": "2025-02-04T06:49:50.777Z",
    "size": 1062,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/indentation/common/indentUtils.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/indentation/common/indentation.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"142c-p3gXT4hea8pMLbTli6zzl4DG3vo\"",
    "mtime": "2025-02-04T06:49:50.791Z",
    "size": 5164,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/indentation/common/indentation.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlayHints/browser/inlayHints.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"186e-9Li5F/7Iwn7o8wbGWUxQgKQuuXA\"",
    "mtime": "2025-02-04T06:49:50.767Z",
    "size": 6254,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlayHints/browser/inlayHints.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlayHints/browser/inlayHintsContribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.818Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlayHints/browser/inlayHintsContribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlayHints/browser/inlayHintsContribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"334-t0iRBkbfXF89erJmLIyWtGjRo08\"",
    "mtime": "2025-02-04T06:49:50.790Z",
    "size": 820,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlayHints/browser/inlayHintsContribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlayHints/browser/inlayHintsController.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"6de3-YG1q9CXwdwv04WhnQIyY2rlQUc8\"",
    "mtime": "2025-02-04T06:49:50.791Z",
    "size": 28131,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlayHints/browser/inlayHintsController.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlayHints/browser/inlayHintsHover.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2277-q+aWNtP6BQcXd8FbokZjJ4ow2yU\"",
    "mtime": "2025-02-04T06:49:50.791Z",
    "size": 8823,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlayHints/browser/inlayHintsHover.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlayHints/browser/inlayHintsLocations.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"14b1-GcDY5QeY5L8AWaij0xJoKTGaxvQ\"",
    "mtime": "2025-02-04T06:49:50.791Z",
    "size": 5297,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlayHints/browser/inlayHintsLocations.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineCompletions/browser/inlineCompletions.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.818Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineCompletions/browser/inlineCompletions.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineCompletions/browser/inlineCompletions.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"7cf-2raMg3DYRaaoEGq1aEeuNFNAL+Q\"",
    "mtime": "2025-02-04T06:49:50.792Z",
    "size": 1999,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineCompletions/browser/inlineCompletions.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineCompletions/browser/inlineCompletionsAccessibleView.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"31-Exw6muYsOXyaQel6hYw9PjdrZ+o\"",
    "mtime": "2025-02-04T06:49:50.791Z",
    "size": 49,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineCompletions/browser/inlineCompletionsAccessibleView.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineCompletions/browser/utils.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"8db-LfRH7vl+lq0kbJNa/GD5BJvRMPc\"",
    "mtime": "2025-02-04T06:49:50.791Z",
    "size": 2267,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineCompletions/browser/utils.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineEdit/browser/commandIds.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"278-9UWdHHK+0FFdNiv47vt8kPoHMMQ\"",
    "mtime": "2025-02-04T06:49:50.767Z",
    "size": 632,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineEdit/browser/commandIds.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineEdit/browser/commands.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1651-c4bEeqlU51EXICMlPrnxzF9ZNzA\"",
    "mtime": "2025-02-04T06:49:50.791Z",
    "size": 5713,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineEdit/browser/commands.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineEdit/browser/ghostTextWidget.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2627-aDz8g9+Z+8BN7ffLAx3O10qk45Q\"",
    "mtime": "2025-02-04T06:49:50.791Z",
    "size": 9767,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineEdit/browser/ghostTextWidget.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineEdit/browser/inlineEdit.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.818Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineEdit/browser/inlineEdit.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineEdit/browser/inlineEdit.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4d5-2ks/kcPRBfEuyrykh5SBWpd6OHk\"",
    "mtime": "2025-02-04T06:49:50.791Z",
    "size": 1237,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineEdit/browser/inlineEdit.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineEdit/browser/inlineEdit.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"44b-lPcA1Mt1tG35P6vSSH9p5OiEqCg\"",
    "mtime": "2025-02-04T06:49:50.791Z",
    "size": 1099,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineEdit/browser/inlineEdit.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineEdit/browser/inlineEditController.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4004-7z/M7RzYUAog3OFE4A6e45tRf5c\"",
    "mtime": "2025-02-04T06:49:50.791Z",
    "size": 16388,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineEdit/browser/inlineEditController.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineEdit/browser/inlineEditHintsWidget.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"3f9-Gn3XF//8jgwATwDeJ9WuGhNl194\"",
    "mtime": "2025-02-04T06:49:50.791Z",
    "size": 1017,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineEdit/browser/inlineEditHintsWidget.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineEdit/browser/inlineEditHintsWidget.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"29dd-CN5gMiJ0tq0SRXlZRq3CWxpdWrE\"",
    "mtime": "2025-02-04T06:49:50.791Z",
    "size": 10717,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineEdit/browser/inlineEditHintsWidget.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineEdit/browser/inlineEditSideBySideWidget.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"259-SXpDk7Veg8U2N8eZyD6ZD1dqDmM\"",
    "mtime": "2025-02-04T06:49:50.791Z",
    "size": 601,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineEdit/browser/inlineEditSideBySideWidget.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineEdit/browser/inlineEditSideBySideWidget.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3e48-Rmc/PwcelayUx6Ppajb1HT7Hxgo\"",
    "mtime": "2025-02-04T06:49:50.791Z",
    "size": 15944,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineEdit/browser/inlineEditSideBySideWidget.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineEdits/browser/commands.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"18aa-uzLAsajKsM+LQCHKIAT2YfXzJmw\"",
    "mtime": "2025-02-04T06:49:50.767Z",
    "size": 6314,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineEdits/browser/commands.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineEdits/browser/consts.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3f7-1iqxqIRQttzNVTZUN5QBw55RGXI\"",
    "mtime": "2025-02-04T06:49:50.811Z",
    "size": 1015,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineEdits/browser/consts.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineEdits/browser/inlineEdits.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.818Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineEdits/browser/inlineEdits.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineEdits/browser/inlineEdits.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"402-JLkMJVl5DbtNPqTWfr6VHjbRcw0\"",
    "mtime": "2025-02-04T06:49:50.791Z",
    "size": 1026,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineEdits/browser/inlineEdits.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineEdits/browser/inlineEditsController.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"16e1-9ECaILsE1bJvJsx7DGHoQnspt0A\"",
    "mtime": "2025-02-04T06:49:50.791Z",
    "size": 5857,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineEdits/browser/inlineEditsController.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineEdits/browser/inlineEditsModel.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"311c-yL0QlH/SyzyTTw1CMVT5KBzXdko\"",
    "mtime": "2025-02-04T06:49:50.791Z",
    "size": 12572,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineEdits/browser/inlineEditsModel.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineEdits/browser/inlineEditsWidget.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"494-pGoWBA6JRaKlnSpvriQXqy8zoBI\"",
    "mtime": "2025-02-04T06:49:50.791Z",
    "size": 1172,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineEdits/browser/inlineEditsWidget.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineEdits/browser/inlineEditsWidget.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3fff-ADyab5q4pXdP8co0w0XdRNAewMQ\"",
    "mtime": "2025-02-04T06:49:50.791Z",
    "size": 16383,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineEdits/browser/inlineEditsWidget.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineProgress/browser/inlineProgress.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.818Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineProgress/browser/inlineProgress.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineProgress/browser/inlineProgress.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"17db-vbfaXNdU3XoWBjrf2xALd2HnMUw\"",
    "mtime": "2025-02-04T06:49:50.767Z",
    "size": 6107,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineProgress/browser/inlineProgress.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineProgress/browser/inlineProgressWidget.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"343-CtoVKe3oCH/BXZh/GdG+G2iwBnc\"",
    "mtime": "2025-02-04T06:49:50.791Z",
    "size": 835,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineProgress/browser/inlineProgressWidget.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/lineSelection/browser/lineSelection.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.818Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/lineSelection/browser/lineSelection.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/lineSelection/browser/lineSelection.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"698-0q4MjRdc9q01boXKgqJY21aRKSw\"",
    "mtime": "2025-02-04T06:49:50.767Z",
    "size": 1688,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/lineSelection/browser/lineSelection.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/linesOperations/browser/copyLinesCommand.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"d1d-kvs1V9nwoyy6SZHWjMX46YiDDHg\"",
    "mtime": "2025-02-04T06:49:50.792Z",
    "size": 3357,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/linesOperations/browser/copyLinesCommand.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/linesOperations/browser/linesOperations.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.818Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/linesOperations/browser/linesOperations.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/linesOperations/browser/linesOperations.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b927-wb8q6ZsOk2mclaKJCqC99FO0ato\"",
    "mtime": "2025-02-04T06:49:50.767Z",
    "size": 47399,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/linesOperations/browser/linesOperations.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/linesOperations/browser/moveLinesCommand.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5a6c-GEUmhf5U+MP4sM4RFvJwrLujGd8\"",
    "mtime": "2025-02-04T06:49:50.811Z",
    "size": 23148,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/linesOperations/browser/moveLinesCommand.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/linesOperations/browser/sortLinesCommand.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"bd5-ed3wVSgCc8oAZ/31dgmT/Klk6B0\"",
    "mtime": "2025-02-04T06:49:50.792Z",
    "size": 3029,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/linesOperations/browser/sortLinesCommand.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/linkedEditing/browser/linkedEditing.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"21d-k6HTyz/zHF2dEq8FECHmIJoC9dU\"",
    "mtime": "2025-02-04T06:49:50.767Z",
    "size": 541,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/linkedEditing/browser/linkedEditing.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/linkedEditing/browser/linkedEditing.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.818Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/linkedEditing/browser/linkedEditing.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/linkedEditing/browser/linkedEditing.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"47c2-m25TbFa4tDvCe6jBzdAJvm4Msus\"",
    "mtime": "2025-02-04T06:49:50.792Z",
    "size": 18370,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/linkedEditing/browser/linkedEditing.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/links/browser/getLinks.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1533-V7BN6FLZmeHVAcEssf+nieyQnFE\"",
    "mtime": "2025-02-04T06:49:50.767Z",
    "size": 5427,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/links/browser/getLinks.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/links/browser/links.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"260-z/KK1nG3/98zbAckmi+Uk3kvECM\"",
    "mtime": "2025-02-04T06:49:50.792Z",
    "size": 608,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/links/browser/links.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/links/browser/links.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.818Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/links/browser/links.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/links/browser/links.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4167-gFeFElxqrvSQiD74WMyRQ3U5Yo4\"",
    "mtime": "2025-02-04T06:49:50.792Z",
    "size": 16743,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/links/browser/links.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/longLinesHelper/browser/longLinesHelper.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.818Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/longLinesHelper/browser/longLinesHelper.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/longLinesHelper/browser/longLinesHelper.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"506-ta2h/jnBnBmV4B0yIBElPxsqAMQ\"",
    "mtime": "2025-02-04T06:49:50.767Z",
    "size": 1286,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/longLinesHelper/browser/longLinesHelper.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/message/browser/messageController.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"914-t0T+0i4uerLLY8bWD1/KvOkg7HU\"",
    "mtime": "2025-02-04T06:49:50.767Z",
    "size": 2324,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/message/browser/messageController.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/message/browser/messageController.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"234a-NYW5+EG8nbnc7E6JTVZEf1s//Uc\"",
    "mtime": "2025-02-04T06:49:50.792Z",
    "size": 9034,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/message/browser/messageController.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/multicursor/browser/multicursor.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.769Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/multicursor/browser/multicursor.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/multicursor/browser/multicursor.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"addb-i1PYenp/xIgGXcP/qjkE4krk+5g\"",
    "mtime": "2025-02-04T06:49:50.824Z",
    "size": 44507,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/multicursor/browser/multicursor.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/parameterHints/browser/parameterHints.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"f08-vEGTYyz3LcFJWYB+Jw5I04HZm3g\"",
    "mtime": "2025-02-04T06:49:50.767Z",
    "size": 3848,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/parameterHints/browser/parameterHints.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/parameterHints/browser/parameterHints.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.818Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/parameterHints/browser/parameterHints.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/parameterHints/browser/parameterHints.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1814-upzBRQNSfkuddg3jVyObuYL5Gu4\"",
    "mtime": "2025-02-04T06:49:50.792Z",
    "size": 6164,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/parameterHints/browser/parameterHints.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/parameterHints/browser/parameterHintsModel.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"29cd-6QGeTSAkfqNjy2VLQRwEc3Yl6FM\"",
    "mtime": "2025-02-04T06:49:50.792Z",
    "size": 10701,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/parameterHints/browser/parameterHintsModel.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/parameterHints/browser/parameterHintsWidget.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3b8e-6u84nynR+q4fXk9+v8sMKXBjxsA\"",
    "mtime": "2025-02-04T06:49:50.792Z",
    "size": 15246,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/parameterHints/browser/parameterHintsWidget.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/parameterHints/browser/provideSignatureHelp.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"a9a-DPuDQQZp8M5GC2rdsjF+qjHmDEo\"",
    "mtime": "2025-02-04T06:49:50.811Z",
    "size": 2714,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/parameterHints/browser/provideSignatureHelp.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/peekView/browser/peekView.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"386f-HOq3bFwyCyKe7oSFKDe/qB9ZUC4\"",
    "mtime": "2025-02-04T06:49:50.811Z",
    "size": 14447,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/peekView/browser/peekView.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/placeholderText/browser/placeholderText.contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.824Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/placeholderText/browser/placeholderText.contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/placeholderText/browser/placeholderText.contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4a9-erg2b1cOhmtwKbNf2L7mS5+ymYc\"",
    "mtime": "2025-02-04T06:49:50.767Z",
    "size": 1193,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/placeholderText/browser/placeholderText.contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/placeholderText/browser/placeholderText.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"296-4FibjePQdD0WqxFR8tgii3k8vAo\"",
    "mtime": "2025-02-04T06:49:50.812Z",
    "size": 662,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/placeholderText/browser/placeholderText.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/placeholderText/browser/placeholderTextContribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"e54-wBR0xiJWFscDbA109QQUwxLtp+Q\"",
    "mtime": "2025-02-04T06:49:50.811Z",
    "size": 3668,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/placeholderText/browser/placeholderTextContribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/quickAccess/browser/commandsQuickAccess.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"7e0-vKpbJcy3LXFGjTQcFWSWV0DK164\"",
    "mtime": "2025-02-04T06:49:50.767Z",
    "size": 2016,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/quickAccess/browser/commandsQuickAccess.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/quickAccess/browser/editorNavigationQuickAccess.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1bac-SjV/bdzhq9SDTqaVkhp17PDWUSY\"",
    "mtime": "2025-02-04T06:49:50.811Z",
    "size": 7084,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/quickAccess/browser/editorNavigationQuickAccess.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/quickAccess/browser/gotoLineQuickAccess.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1700-mRyEb95H6THrwu4hlaD3VFO+wsk\"",
    "mtime": "2025-02-04T06:49:50.811Z",
    "size": 5888,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/quickAccess/browser/gotoLineQuickAccess.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/quickAccess/browser/gotoSymbolQuickAccess.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4fcf-mAZJrzV2JvbUfgVAeWYMae/ro9M\"",
    "mtime": "2025-02-04T06:49:50.811Z",
    "size": 20431,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/quickAccess/browser/gotoSymbolQuickAccess.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/readOnlyMessage/browser/contribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.818Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/readOnlyMessage/browser/contribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/readOnlyMessage/browser/contribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"771-PpTOxXxrp46GaUHhhYIOgUXwtHI\"",
    "mtime": "2025-02-04T06:49:50.767Z",
    "size": 1905,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/readOnlyMessage/browser/contribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/rename/browser/rename.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.818Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/rename/browser/rename.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/rename/browser/rename.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5ab9-1hdTPWxZGXPp2Wn2kVMKsFaaWqI\"",
    "mtime": "2025-02-04T06:49:50.767Z",
    "size": 23225,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/rename/browser/rename.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/rename/browser/renameWidget.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"581-SlFh5lkyMCkyH0UbMcBsDPEkU8s\"",
    "mtime": "2025-02-04T06:49:50.811Z",
    "size": 1409,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/rename/browser/renameWidget.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/rename/browser/renameWidget.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"8f89-59qSVeTt9fdAD/Z6BnNcq8CBqlc\"",
    "mtime": "2025-02-04T06:49:50.811Z",
    "size": 36745,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/rename/browser/renameWidget.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/sectionHeaders/browser/sectionHeaders.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.824Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/sectionHeaders/browser/sectionHeaders.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/sectionHeaders/browser/sectionHeaders.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2251-uCurEusjPJb5bEzNLt/VSvWpnf8\"",
    "mtime": "2025-02-04T06:49:50.767Z",
    "size": 8785,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/sectionHeaders/browser/sectionHeaders.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/semanticTokens/browser/documentSemanticTokens.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.824Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/semanticTokens/browser/documentSemanticTokens.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/semanticTokens/browser/documentSemanticTokens.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"46dc-/MCv2fux2sSyrAwoxPe8rcImj14\"",
    "mtime": "2025-02-04T06:49:50.767Z",
    "size": 18140,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/semanticTokens/browser/documentSemanticTokens.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/semanticTokens/browser/viewportSemanticTokens.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.824Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/semanticTokens/browser/viewportSemanticTokens.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/semanticTokens/browser/viewportSemanticTokens.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1c28-UwXYkltkz/XifNffmATL1HJqV/E\"",
    "mtime": "2025-02-04T06:49:50.811Z",
    "size": 7208,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/semanticTokens/browser/viewportSemanticTokens.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/semanticTokens/common/getSemanticTokens.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"21d2-9vsa+w4D4gN0MEBtvtyR2kZ8mQ8\"",
    "mtime": "2025-02-04T06:49:50.811Z",
    "size": 8658,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/semanticTokens/common/getSemanticTokens.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/semanticTokens/common/semanticTokensConfig.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"32e-KR6IuiZN0ulDBDvQFbWZNJgTRjc\"",
    "mtime": "2025-02-04T06:49:50.778Z",
    "size": 814,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/semanticTokens/common/semanticTokensConfig.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/smartSelect/browser/bracketSelections.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1908-UcGWyuEY5syEvi2o4eC6Kisk4lU\"",
    "mtime": "2025-02-04T06:49:50.767Z",
    "size": 6408,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/smartSelect/browser/bracketSelections.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/smartSelect/browser/smartSelect.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.824Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/smartSelect/browser/smartSelect.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/smartSelect/browser/smartSelect.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"355d-vGMRU9DwsOpEmNafUDz6gXXVL/k\"",
    "mtime": "2025-02-04T06:49:50.811Z",
    "size": 13661,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/smartSelect/browser/smartSelect.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/smartSelect/browser/wordSelections.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"c8d-3Z+M4oYCDdGoLbnv5ApN/QTF+dg\"",
    "mtime": "2025-02-04T06:49:50.811Z",
    "size": 3213,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/smartSelect/browser/wordSelections.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/snippet/browser/snippetController2.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.824Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/snippet/browser/snippetController2.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/snippet/browser/snippetController2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"33bf-2MAstzdVWDYXKPtCzexI0IkqXKo\"",
    "mtime": "2025-02-04T06:49:50.767Z",
    "size": 13247,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/snippet/browser/snippetController2.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/snippet/browser/snippetParser.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"75a3-7ndsXmsad/MUprLZ46VXVQ0g0lo\"",
    "mtime": "2025-02-04T06:49:50.811Z",
    "size": 30115,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/snippet/browser/snippetParser.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/snippet/browser/snippetSession.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"37e-SW+y+siyvrhZ4TeHdHw/kkVOQ1w\"",
    "mtime": "2025-02-04T06:49:50.811Z",
    "size": 894,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/snippet/browser/snippetSession.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/snippet/browser/snippetSession.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"895e-VcUahkqHOdjUMMIP3hFVW0ufO3o\"",
    "mtime": "2025-02-04T06:49:50.811Z",
    "size": 35166,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/snippet/browser/snippetSession.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/snippet/browser/snippetVariables.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3e65-QT0c4slUvN5hht5ZGzO9CFCuUNg\"",
    "mtime": "2025-02-04T06:49:50.811Z",
    "size": 15973,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/snippet/browser/snippetVariables.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/stickyScroll/browser/stickyScroll.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"7f5-a9zO/CtKGOC/Sdc2ls4zn+23Sfw\"",
    "mtime": "2025-02-04T06:49:50.768Z",
    "size": 2037,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/stickyScroll/browser/stickyScroll.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/stickyScroll/browser/stickyScrollActions.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"15d5-o9/WbkX5B1NZNX+ZLrrXWCCljKI\"",
    "mtime": "2025-02-04T06:49:50.811Z",
    "size": 5589,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/stickyScroll/browser/stickyScrollActions.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/stickyScroll/browser/stickyScrollContribution.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.824Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/stickyScroll/browser/stickyScrollContribution.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/stickyScroll/browser/stickyScrollContribution.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"473-7ygU5fKM5hQq8NL09i701p7Wmx4\"",
    "mtime": "2025-02-04T06:49:50.811Z",
    "size": 1139,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/stickyScroll/browser/stickyScrollContribution.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/stickyScroll/browser/stickyScrollController.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"6c4f-qNTay0EQGNHtYAYnKEHD+kRwNew\"",
    "mtime": "2025-02-04T06:49:50.811Z",
    "size": 27727,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/stickyScroll/browser/stickyScrollController.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/stickyScroll/browser/stickyScrollElement.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"470-jDYscUOzixLgzdYU7YYHJ9Ij4yM\"",
    "mtime": "2025-02-04T06:49:50.811Z",
    "size": 1136,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/stickyScroll/browser/stickyScrollElement.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/stickyScroll/browser/stickyScrollModelProvider.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3d20-+DjSCM4UxTMmhbSAg7hBySypP5s\"",
    "mtime": "2025-02-04T06:49:50.811Z",
    "size": 15648,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/stickyScroll/browser/stickyScrollModelProvider.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/stickyScroll/browser/stickyScrollProvider.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1fbd-WHi7H4Msht5GZq9FZkBkRQLfhrE\"",
    "mtime": "2025-02-04T06:49:50.811Z",
    "size": 8125,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/stickyScroll/browser/stickyScrollProvider.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/stickyScroll/browser/stickyScrollWidget.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"54f3-6u5xJBUoDjS361j5pMb7MiyFaDM\"",
    "mtime": "2025-02-04T06:49:50.811Z",
    "size": 21747,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/stickyScroll/browser/stickyScrollWidget.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/symbolIcons/browser/symbolIcons.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"1565-C4Y+ht3R7b04jYR4oklM9MsOiRM\"",
    "mtime": "2025-02-04T06:49:50.768Z",
    "size": 5477,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/symbolIcons/browser/symbolIcons.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/symbolIcons/browser/symbolIcons.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"26e8-LT/4pHRCwTNzyI1wrUd26xvW2+c\"",
    "mtime": "2025-02-04T06:49:50.811Z",
    "size": 9960,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/symbolIcons/browser/symbolIcons.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/suggest/browser/completionModel.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"25cf-mc9hJbH+e+wg70U80AKpFWsXnW4\"",
    "mtime": "2025-02-04T06:49:50.811Z",
    "size": 9679,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/suggest/browser/completionModel.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/suggest/browser/suggest.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"430a-SBSKxXgYWJWnKju0ipIGifexTks\"",
    "mtime": "2025-02-04T06:49:50.811Z",
    "size": 17162,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/suggest/browser/suggest.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/suggest/browser/suggestAlternatives.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"e80-B6O7eb6ygAtHZ7hV8YKlEm63KPg\"",
    "mtime": "2025-02-04T06:49:50.811Z",
    "size": 3712,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/suggest/browser/suggestAlternatives.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/suggest/browser/suggestCommitCharacters.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"9a3-E7zMCTQevqKBfJK6NLnVn8vlJGQ\"",
    "mtime": "2025-02-04T06:49:50.811Z",
    "size": 2467,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/suggest/browser/suggestCommitCharacters.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/suggest/browser/suggestController.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.824Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/suggest/browser/suggestController.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/suggest/browser/suggestController.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b045-isD0mZTjkx1LwYxRmU4xBBm0izQ\"",
    "mtime": "2025-02-04T06:49:50.811Z",
    "size": 45125,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/suggest/browser/suggestController.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/suggest/browser/suggestInlineCompletions.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.824Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/suggest/browser/suggestInlineCompletions.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/suggest/browser/suggestInlineCompletions.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"292c-uOYqKZ3K1HDcarQ+NQddeKcvFog\"",
    "mtime": "2025-02-04T06:49:50.811Z",
    "size": 10540,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/suggest/browser/suggestInlineCompletions.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/suggest/browser/suggestMemory.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"26ce-CwP8H30XxsSZu1iUtFxvsOXKD94\"",
    "mtime": "2025-02-04T06:49:50.811Z",
    "size": 9934,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/suggest/browser/suggestMemory.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/suggest/browser/suggestModel.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"7bc4-TQXiX2tiBz1SaoQbv5CX/iN84tQ\"",
    "mtime": "2025-02-04T06:49:50.811Z",
    "size": 31684,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/suggest/browser/suggestModel.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/suggest/browser/suggestOvertypingCapturer.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"99c-DgZsGv5w++alH++pKW+g71eWOG0\"",
    "mtime": "2025-02-04T06:49:50.811Z",
    "size": 2460,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/suggest/browser/suggestOvertypingCapturer.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/suggest/browser/suggestWidget.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"9b62-8zTlQ/T/zUiwOHfTk5/tJrivV3s\"",
    "mtime": "2025-02-04T06:49:50.811Z",
    "size": 39778,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/suggest/browser/suggestWidget.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/suggest/browser/suggestWidgetDetails.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4452-6UcbE42zGiTWLsxgFl+Ff+Ca+nM\"",
    "mtime": "2025-02-04T06:49:50.811Z",
    "size": 17490,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/suggest/browser/suggestWidgetDetails.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/suggest/browser/suggestWidgetRenderer.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2b9a-YjpAT9j/iFXmPaAB5Nhk1aWuluQ\"",
    "mtime": "2025-02-04T06:49:50.811Z",
    "size": 11162,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/suggest/browser/suggestWidgetRenderer.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/suggest/browser/suggestWidgetStatus.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"ed4-JGnXYyZ1DNtE5c5lAadnMWTcGoI\"",
    "mtime": "2025-02-04T06:49:50.811Z",
    "size": 3796,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/suggest/browser/suggestWidgetStatus.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/suggest/browser/wordContextKey.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"ca0-0LPi7wtI/k0T7RmhT0cEYzk34D8\"",
    "mtime": "2025-02-04T06:49:50.811Z",
    "size": 3232,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/suggest/browser/wordContextKey.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/suggest/browser/wordDistance.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"aec-cMQuQdy/TMjTSIPevCLootqqIvY\"",
    "mtime": "2025-02-04T06:49:50.811Z",
    "size": 2796,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/suggest/browser/wordDistance.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/toggleTabFocusMode/browser/toggleTabFocusMode.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.824Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/toggleTabFocusMode/browser/toggleTabFocusMode.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/toggleTabFocusMode/browser/toggleTabFocusMode.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"860-Ho/V4zx1oZgLY6uSmW9rNNiUB/0\"",
    "mtime": "2025-02-04T06:49:50.768Z",
    "size": 2144,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/toggleTabFocusMode/browser/toggleTabFocusMode.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/tokenization/browser/tokenization.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.824Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/tokenization/browser/tokenization.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/tokenization/browser/tokenization.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"50a-OUK+YmO6F/Unn9KdSN1RbE0ANOQ\"",
    "mtime": "2025-02-04T06:49:50.768Z",
    "size": 1290,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/tokenization/browser/tokenization.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/unicodeHighlighter/browser/bannerController.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"729-r1biRH2HORcPB/U1mRCZTGLqEg0\"",
    "mtime": "2025-02-04T06:49:50.768Z",
    "size": 1833,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/unicodeHighlighter/browser/bannerController.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/unicodeHighlighter/browser/bannerController.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"14d7-+2EvEAKWSefuYpt2X6fwA1i6g0M\"",
    "mtime": "2025-02-04T06:49:50.811Z",
    "size": 5335,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/unicodeHighlighter/browser/bannerController.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/unicodeHighlighter/browser/unicodeHighlighter.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"224-s406It7R/2RRW4ygqARtGMknypw\"",
    "mtime": "2025-02-04T06:49:50.812Z",
    "size": 548,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/unicodeHighlighter/browser/unicodeHighlighter.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/unicodeHighlighter/browser/unicodeHighlighter.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.824Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/unicodeHighlighter/browser/unicodeHighlighter.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/unicodeHighlighter/browser/unicodeHighlighter.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"7d7a-YpVaMeVhNU4H3EC8FsZUhVk/YF8\"",
    "mtime": "2025-02-04T06:49:50.812Z",
    "size": 32122,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/unicodeHighlighter/browser/unicodeHighlighter.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/unusualLineTerminators/browser/unusualLineTerminators.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.824Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/unusualLineTerminators/browser/unusualLineTerminators.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/unusualLineTerminators/browser/unusualLineTerminators.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1689-O3OibAOlC+YNlW2wrl064OSxXCg\"",
    "mtime": "2025-02-04T06:49:50.768Z",
    "size": 5769,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/unusualLineTerminators/browser/unusualLineTerminators.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/wordOperations/browser/wordOperations.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.824Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/wordOperations/browser/wordOperations.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/wordOperations/browser/wordOperations.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4aa0-/CCyQzxqxZwersinWtDwEJfi0pc\"",
    "mtime": "2025-02-04T06:49:50.768Z",
    "size": 19104,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/wordOperations/browser/wordOperations.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/wordHighlighter/browser/highlightDecorations.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"656-jnxMjceSnrHywpL5+VFp9ReNdkg\"",
    "mtime": "2025-02-04T06:49:50.768Z",
    "size": 1622,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/wordHighlighter/browser/highlightDecorations.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/wordHighlighter/browser/highlightDecorations.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1a0e-P+P8B1Eg7SZZG//xpK5h5ONVfNc\"",
    "mtime": "2025-02-04T06:49:50.812Z",
    "size": 6670,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/wordHighlighter/browser/highlightDecorations.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/wordHighlighter/browser/textualHighlightProvider.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"e3a-k/KyTDus2vjdhpGSg9vqj1RrFrA\"",
    "mtime": "2025-02-04T06:49:50.812Z",
    "size": 3642,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/wordHighlighter/browser/textualHighlightProvider.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/wordHighlighter/browser/wordHighlighter.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.824Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/wordHighlighter/browser/wordHighlighter.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/wordHighlighter/browser/wordHighlighter.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"886a-m+UOoSOIaZO+gqOXIyKOtd0OElY\"",
    "mtime": "2025-02-04T06:49:50.812Z",
    "size": 34922,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/wordHighlighter/browser/wordHighlighter.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/wordPartOperations/browser/wordPartOperations.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.824Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/wordPartOperations/browser/wordPartOperations.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/wordPartOperations/browser/wordPartOperations.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1807-w9dP1Kh5yIxa5PPXylaPyeAuOns\"",
    "mtime": "2025-02-04T06:49:50.768Z",
    "size": 6151,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/wordPartOperations/browser/wordPartOperations.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/zoneWidget/browser/zoneWidget.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"257-DH+8rMxp2Na0kiTh3M4lmMlaJAo\"",
    "mtime": "2025-02-04T06:49:50.768Z",
    "size": 599,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/zoneWidget/browser/zoneWidget.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/zoneWidget/browser/zoneWidget.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3b54-zNtou5HWmo5dhx/t5loVh95qoW4\"",
    "mtime": "2025-02-04T06:49:50.812Z",
    "size": 15188,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/zoneWidget/browser/zoneWidget.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/quickinput/browser/media/quickInput.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"20e4-J5RFdGXbUMEAkcLiZyb4D8kjHZk\"",
    "mtime": "2025-02-04T06:49:50.735Z",
    "size": 8420,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/quickinput/browser/media/quickInput.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/severityIcon/browser/media/severityIcon.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"639-OUpzl8qNBcHvlb8SMzeAqCitEZs\"",
    "mtime": "2025-02-04T06:49:50.735Z",
    "size": 1593,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/severityIcon/browser/media/severityIcon.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/theme/common/colors/baseColors.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"13ed-zLZn4FJqVBgu8sVX4mEJzEA23sg\"",
    "mtime": "2025-02-04T06:49:50.735Z",
    "size": 5101,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/theme/common/colors/baseColors.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/theme/common/colors/chartsColors.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"7fd-c/3lglgKzucBgwo1rteSc0MwkNY\"",
    "mtime": "2025-02-04T06:49:50.812Z",
    "size": 2045,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/theme/common/colors/chartsColors.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/theme/common/colors/editorColors.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"68f2-9OhtVJSye5X0Mr4kpLXNNxdqW98\"",
    "mtime": "2025-02-04T06:49:50.812Z",
    "size": 26866,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/theme/common/colors/editorColors.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/theme/common/colors/inputColors.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2e79-1mgPu8nUf8q0YBr4mvA1wLU+fvQ\"",
    "mtime": "2025-02-04T06:49:50.812Z",
    "size": 11897,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/theme/common/colors/inputColors.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/theme/common/colors/listColors.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2b88-QIbt7sWwjlGeTT6gPDotVvB1AJE\"",
    "mtime": "2025-02-04T06:49:50.812Z",
    "size": 11144,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/theme/common/colors/listColors.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/theme/common/colors/menuColors.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"86d-bFwSqdMbY1grhbjp0t22hcRhMl0\"",
    "mtime": "2025-02-04T06:49:50.812Z",
    "size": 2157,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/theme/common/colors/menuColors.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/theme/common/colors/minimapColors.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"dda-pN/qjHxPkTXpWrQ5brdxdzmh/so\"",
    "mtime": "2025-02-04T06:49:50.812Z",
    "size": 3546,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/theme/common/colors/minimapColors.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/theme/common/colors/miscColors.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"be0-dXo8GHQYEU48tRBTYGA7Yrrb1gk\"",
    "mtime": "2025-02-04T06:49:50.812Z",
    "size": 3040,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/theme/common/colors/miscColors.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/theme/common/colors/quickpickColors.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"cb7-fkzlZXy9u+R54jmuBrAVtyIPiaw\"",
    "mtime": "2025-02-04T06:49:50.812Z",
    "size": 3255,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/theme/common/colors/quickpickColors.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/platform/theme/common/colors/searchColors.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"70b-76wCPMJhIZqm4YfEnakK7W/E1FQ\"",
    "mtime": "2025-02-04T06:49:50.812Z",
    "size": 1803,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/platform/theme/common/colors/searchColors.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/codicons/codicon/codicon-modifiers.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"3ef-yQb9N40FF8uFtMVmHb5LbmgzSvg\"",
    "mtime": "2025-02-04T06:49:50.681Z",
    "size": 1007,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/codicons/codicon/codicon-modifiers.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/codicons/codicon/codicon.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"368-4BiQIDEfYh7H3r5SEV89Wr0MSUM\"",
    "mtime": "2025-02-04T06:49:50.735Z",
    "size": 872,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/codicons/codicon/codicon.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/codicons/codicon/codicon.ttf": {
    "type": "font/ttf",
    "etag": "\"139d4-58fQ8Ohjcapek6AgDzlcXTeWfi4\"",
    "mtime": "2025-02-04T06:49:50.742Z",
    "size": 80340,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/codicons/codicon/codicon.ttf"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/scrollbar/media/scrollbars.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"781-CsJTZD//pzp1d4LPkH5b4f0WzaE\"",
    "mtime": "2025-02-04T06:49:50.681Z",
    "size": 1921,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/scrollbar/media/scrollbars.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/tree/media/tree.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"1001-8P7JLb6DlOnSyHnwGsWIB+Q8QQw\"",
    "mtime": "2025-02-04T06:49:50.681Z",
    "size": 4097,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/base/browser/ui/tree/media/tree.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/diffEditor/components/accessibleDiffViewer.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"682-YWKoLRbprI/hlwt8c06vcb7u6tg\"",
    "mtime": "2025-02-04T06:49:50.742Z",
    "size": 1666,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/diffEditor/components/accessibleDiffViewer.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/diffEditor/components/accessibleDiffViewer.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"74ac-c482tmgWE8W/z0Yo6No0qKMm1Ow\"",
    "mtime": "2025-02-04T06:49:50.698Z",
    "size": 29868,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/diffEditor/components/accessibleDiffViewer.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/diffEditor/components/diffEditorDecorations.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1e0c-dXV/VBx/1XHi4MckSdDkdLYxBFQ\"",
    "mtime": "2025-02-04T06:49:50.742Z",
    "size": 7692,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/diffEditor/components/diffEditorDecorations.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/diffEditor/components/diffEditorEditors.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"27ae-EG3jE9mDpY+RU5hCJipBNk5/KIc\"",
    "mtime": "2025-02-04T06:49:50.742Z",
    "size": 10158,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/diffEditor/components/diffEditorEditors.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/diffEditor/components/diffEditorSash.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"f24-Kfii6XKRGaI1iGZ8isgEySEsuRA\"",
    "mtime": "2025-02-04T06:49:50.742Z",
    "size": 3876,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/diffEditor/components/diffEditorSash.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/diffEditor/features/gutterFeature.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"34bb-VkUVrQeJ3NVq4AY5iNHxfgY2sFU\"",
    "mtime": "2025-02-04T06:49:50.698Z",
    "size": 13499,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/diffEditor/features/gutterFeature.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/diffEditor/features/hideUnchangedRegionsFeature.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5ee7-MRjUhLSOzX5/ECLMGT2dquRcW9I\"",
    "mtime": "2025-02-04T06:49:50.742Z",
    "size": 24295,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/diffEditor/features/hideUnchangedRegionsFeature.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/diffEditor/features/movedBlocksLinesFeature.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3e2a-D0Zsg6OrnOzSZ012Smtr7+AvJ4Q\"",
    "mtime": "2025-02-04T06:49:50.742Z",
    "size": 15914,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/diffEditor/features/movedBlocksLinesFeature.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/diffEditor/features/overviewRulerFeature.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"283d-pB7XJ6IBzqGsnmujjrqDikc2GMQ\"",
    "mtime": "2025-02-04T06:49:50.742Z",
    "size": 10301,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/diffEditor/features/overviewRulerFeature.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/diffEditor/features/revertButtonsFeature.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"19a3-ENazpkbJBVr+AVx9CV3Exl4Ltvc\"",
    "mtime": "2025-02-04T06:49:50.742Z",
    "size": 6563,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/diffEditor/features/revertButtonsFeature.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/diffEditor/utils/editorGutter.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"181b-d8TwvpuXFTzGrb6k8QaUYydCnhc\"",
    "mtime": "2025-02-04T06:49:50.698Z",
    "size": 6171,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/diffEditor/utils/editorGutter.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/markdownRenderer/browser/markdownRenderer.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"17a1-02CNfj+yLr/fcbGsbF9MzTMKOMU\"",
    "mtime": "2025-02-04T06:49:50.681Z",
    "size": 6049,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/markdownRenderer/browser/markdownRenderer.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/markdownRenderer/browser/renderedMarkdown.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"362-2wcgEn1zwXEqEKHoltbKCQ+Tuds\"",
    "mtime": "2025-02-04T06:49:50.742Z",
    "size": 866,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/markdownRenderer/browser/renderedMarkdown.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/diff/defaultLinesDiffComputer/algorithms/diffAlgorithm.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1479-mvMOGV+KCoToQ3kHNR76Q/NWKAw\"",
    "mtime": "2025-02-04T06:49:50.681Z",
    "size": 5241,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/diff/defaultLinesDiffComputer/algorithms/diffAlgorithm.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/diff/defaultLinesDiffComputer/algorithms/dynamicProgrammingDiffing.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"11b7-6iV4Xfa2lI0sX4DYScVFOT3Xx+4\"",
    "mtime": "2025-02-04T06:49:50.742Z",
    "size": 4535,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/diff/defaultLinesDiffComputer/algorithms/dynamicProgrammingDiffing.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/diff/defaultLinesDiffComputer/algorithms/myersDiffAlgorithm.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1798-2mEvQrBBttdfePjYCCDvkpzfVew\"",
    "mtime": "2025-02-04T06:49:50.742Z",
    "size": 6040,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/diff/defaultLinesDiffComputer/algorithms/myersDiffAlgorithm.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/ast.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"406b-Myn3eENTRbI/ZWb5wqZTda38xb0\"",
    "mtime": "2025-02-04T06:49:50.681Z",
    "size": 16491,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/ast.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/beforeEditPositionMapper.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1458-sTIz9rXZW4Wy3d+z6h2Yd8n+zvg\"",
    "mtime": "2025-02-04T06:49:50.742Z",
    "size": 5208,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/beforeEditPositionMapper.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/bracketPairsTree.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4349-iJaCyqk7/RFX9pAv5kM18NDixPQ\"",
    "mtime": "2025-02-04T06:49:50.742Z",
    "size": 17225,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/bracketPairsTree.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/brackets.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"125f-KVwykQgXipJLnDe4mj8xB7CH9vQ\"",
    "mtime": "2025-02-04T06:49:50.742Z",
    "size": 4703,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/brackets.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/combineTextEditInfos.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"13e0-jydHKtnpKg6fR1tcHBFZB/AIBWw\"",
    "mtime": "2025-02-04T06:49:50.742Z",
    "size": 5088,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/combineTextEditInfos.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/concat23Trees.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1b9b-hkUlIcqm4skjLbk3IAxh4x6ImOc\"",
    "mtime": "2025-02-04T06:49:50.742Z",
    "size": 7067,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/concat23Trees.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/length.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1063-7a4mAFeCcb3ZcuU+Nl4j4Nhj6Yg\"",
    "mtime": "2025-02-04T06:49:50.742Z",
    "size": 4195,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/length.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/nodeReader.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"13fe-grBBIz+NaQ/6m+nM51GUcR6IuuI\"",
    "mtime": "2025-02-04T06:49:50.742Z",
    "size": 5118,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/nodeReader.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/parser.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"15cf-alnHx26DF4jmZyuYK84A4Pg0Bw4\"",
    "mtime": "2025-02-04T06:49:50.742Z",
    "size": 5583,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/parser.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/smallImmutableSet.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"e96-LkLD8UTBv/kGDK7JNiwtrlcanjE\"",
    "mtime": "2025-02-04T06:49:50.742Z",
    "size": 3734,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/smallImmutableSet.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/tokenizer.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3513-owAIJt1HjnDdLouY3N6oiNknztE\"",
    "mtime": "2025-02-04T06:49:50.742Z",
    "size": 13587,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/tokenizer.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/gotoError/browser/media/gotoErrorWidget.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"7e4-xa4JL3sYOeMiqlwalB9vNFjis14\"",
    "mtime": "2025-02-04T06:49:50.742Z",
    "size": 2020,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/gotoError/browser/media/gotoErrorWidget.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/gotoSymbol/browser/link/clickLinkGesture.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1e60-MVGn3HMMVDuoeeZDDZ3pV0jVANc\"",
    "mtime": "2025-02-04T06:49:50.742Z",
    "size": 7776,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/gotoSymbol/browser/link/clickLinkGesture.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/gotoSymbol/browser/link/goToDefinitionAtPosition.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"1f7-0iNafzi7MoAjQLicD5zsEY3s+64\"",
    "mtime": "2025-02-04T06:49:50.812Z",
    "size": 503,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/gotoSymbol/browser/link/goToDefinitionAtPosition.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/gotoSymbol/browser/link/goToDefinitionAtPosition.d.ts": {
    "type": "video/mp2t",
    "etag": "\"a-Hr+tQ49o/dtNuE2e9cC5IrWfiVs\"",
    "mtime": "2025-02-04T06:49:50.824Z",
    "size": 10,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/gotoSymbol/browser/link/goToDefinitionAtPosition.d.ts"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/gotoSymbol/browser/link/goToDefinitionAtPosition.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"370a-RibUQAWQtNK/5iiLpp7WqF7SHrw\"",
    "mtime": "2025-02-04T06:49:50.812Z",
    "size": 14090,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/gotoSymbol/browser/link/goToDefinitionAtPosition.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/gotoSymbol/browser/peek/referencesController.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"46f8-HfKbtu4DzJAwq4LR0igZlNzrsnc\"",
    "mtime": "2025-02-04T06:49:50.778Z",
    "size": 18168,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/gotoSymbol/browser/peek/referencesController.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/gotoSymbol/browser/peek/referencesTree.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2061-Nh1BgpnNfN1CqCzUi/xwhFinBok\"",
    "mtime": "2025-02-04T06:49:50.812Z",
    "size": 8289,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/gotoSymbol/browser/peek/referencesTree.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/gotoSymbol/browser/peek/referencesWidget.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"b85-QemfFppwlcbwRdFCtqSw/yMTFsU\"",
    "mtime": "2025-02-04T06:49:50.812Z",
    "size": 2949,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/gotoSymbol/browser/peek/referencesWidget.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/gotoSymbol/browser/peek/referencesWidget.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"502a-cfQpXBoZhmS3dLBZ9/+n1cM2LRY\"",
    "mtime": "2025-02-04T06:49:50.812Z",
    "size": 20522,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/gotoSymbol/browser/peek/referencesWidget.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineCompletions/browser/controller/commandIds.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"263-VnUJgTdpgktOjmg/Gqm2dgOCgmI\"",
    "mtime": "2025-02-04T06:49:50.742Z",
    "size": 611,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineCompletions/browser/controller/commandIds.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineCompletions/browser/controller/commands.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"231f-LwoGn87kxGuLoAGDOsKZmYkpizw\"",
    "mtime": "2025-02-04T06:49:50.812Z",
    "size": 8991,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineCompletions/browser/controller/commands.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineCompletions/browser/controller/inlineCompletionContextKeys.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"12af-PrQ2YrAsmTcbGlfF7W9ZXdTbMBU\"",
    "mtime": "2025-02-04T06:49:50.812Z",
    "size": 4783,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineCompletions/browser/controller/inlineCompletionContextKeys.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineCompletions/browser/controller/inlineCompletionsController.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3f45-2wVM5s3aeI7X1B2DpvhV2WDe37Y\"",
    "mtime": "2025-02-04T06:49:50.812Z",
    "size": 16197,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineCompletions/browser/controller/inlineCompletionsController.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineCompletions/browser/hintsWidget/hoverParticipant.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"20d3-MJZhpulzLyPhK/0rTyP5+4d8lUM\"",
    "mtime": "2025-02-04T06:49:50.778Z",
    "size": 8403,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineCompletions/browser/hintsWidget/hoverParticipant.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineCompletions/browser/hintsWidget/inlineCompletionsHintsWidget.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"4a6-txSOMPDi0KuEjypgjH0Txmzy+Bk\"",
    "mtime": "2025-02-04T06:49:50.812Z",
    "size": 1190,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineCompletions/browser/hintsWidget/inlineCompletionsHintsWidget.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineCompletions/browser/hintsWidget/inlineCompletionsHintsWidget.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4384-kyvBu5HdBVQ5Ty/gtlSnH01wzdg\"",
    "mtime": "2025-02-04T06:49:50.812Z",
    "size": 17284,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineCompletions/browser/hintsWidget/inlineCompletionsHintsWidget.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineCompletions/browser/view/ghostTextView.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"52c-p1kwerTlrpCerAF3Scw+Byo6GP0\"",
    "mtime": "2025-02-04T06:49:50.778Z",
    "size": 1324,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineCompletions/browser/view/ghostTextView.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineCompletions/browser/view/ghostTextView.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3437-tCTQRQovS9KDurDPUgUi1kQJD0c\"",
    "mtime": "2025-02-04T06:49:50.812Z",
    "size": 13367,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineCompletions/browser/view/ghostTextView.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineCompletions/browser/model/ghostText.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"eef-XNhtWqfhHxSWWkqLSPUDw34EZqw\"",
    "mtime": "2025-02-04T06:49:50.812Z",
    "size": 3823,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineCompletions/browser/model/ghostText.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineCompletions/browser/model/inlineCompletionsModel.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"67f0-pIjfQbwnIzoB5xN2SbL3tpSW+4c\"",
    "mtime": "2025-02-04T06:49:50.778Z",
    "size": 26608,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineCompletions/browser/model/inlineCompletionsModel.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineCompletions/browser/model/inlineCompletionsSource.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3579-ej5XbXtSputtolts6WLo9SqJmH4\"",
    "mtime": "2025-02-04T06:49:50.812Z",
    "size": 13689,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineCompletions/browser/model/inlineCompletionsSource.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineCompletions/browser/model/provideInlineCompletions.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2c61-L2EvFSh4h3UNwDdXY0B+pixKYsI\"",
    "mtime": "2025-02-04T06:49:50.812Z",
    "size": 11361,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineCompletions/browser/model/provideInlineCompletions.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineCompletions/browser/model/singleTextEdit.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"254b-WJXNFf6Un5wHp5TOWX/AsJhJFNA\"",
    "mtime": "2025-02-04T06:49:50.812Z",
    "size": 9547,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineCompletions/browser/model/singleTextEdit.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineCompletions/browser/model/suggestWidgetAdaptor.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2271-j07D/dNL5zo1vkZlzrF8ird6NxI\"",
    "mtime": "2025-02-04T06:49:50.812Z",
    "size": 8817,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/inlineCompletions/browser/model/suggestWidgetAdaptor.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/peekView/browser/media/peekViewWidget.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"85c-o1yVeuoqMpL86MgRwS8TveQ438o\"",
    "mtime": "2025-02-04T06:49:50.742Z",
    "size": 2140,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/peekView/browser/media/peekViewWidget.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/contrib/suggest/browser/media/suggest.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"3436-MRkRbm/mj1L3nAFOc5z5pvwNLs0\"",
    "mtime": "2025-02-04T06:49:50.743Z",
    "size": 13366,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/contrib/suggest/browser/media/suggest.css"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/diffEditor/components/diffEditorViewZones/diffEditorViewZones.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"7a6e-GvzXdlOfJo2jrRHQBKYokjGCSfg\"",
    "mtime": "2025-02-04T06:49:50.681Z",
    "size": 31342,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/diffEditor/components/diffEditorViewZones/diffEditorViewZones.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/diffEditor/components/diffEditorViewZones/inlineDiffDeletedCodeMargin.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1f5e-J5Ll2x3sqF/ZFdPT7V5vEdM8PsM\"",
    "mtime": "2025-02-04T06:49:50.742Z",
    "size": 8030,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/diffEditor/components/diffEditorViewZones/inlineDiffDeletedCodeMargin.js"
  },
  "/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/diffEditor/components/diffEditorViewZones/renderLines.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"19be-dEDeejb5JVe+u2eaP+QTjJ2VBR0\"",
    "mtime": "2025-02-04T06:49:50.742Z",
    "size": 6590,
    "path": "../public/_nuxt/nuxt-monaco-editor/vs/editor/browser/widget/diffEditor/components/diffEditorViewZones/renderLines.js"
  }
};

const _DRIVE_LETTER_START_RE = /^[A-Za-z]:\//;
function normalizeWindowsPath(input = "") {
  if (!input) {
    return input;
  }
  return input.replace(/\\/g, "/").replace(_DRIVE_LETTER_START_RE, (r) => r.toUpperCase());
}
const _IS_ABSOLUTE_RE = /^[/\\](?![/\\])|^[/\\]{2}(?!\.)|^[A-Za-z]:[/\\]/;
const _DRIVE_LETTER_RE = /^[A-Za-z]:$/;
function cwd() {
  if (typeof process !== "undefined" && typeof process.cwd === "function") {
    return process.cwd().replace(/\\/g, "/");
  }
  return "/";
}
const resolve = function(...arguments_) {
  arguments_ = arguments_.map((argument) => normalizeWindowsPath(argument));
  let resolvedPath = "";
  let resolvedAbsolute = false;
  for (let index = arguments_.length - 1; index >= -1 && !resolvedAbsolute; index--) {
    const path = index >= 0 ? arguments_[index] : cwd();
    if (!path || path.length === 0) {
      continue;
    }
    resolvedPath = `${path}/${resolvedPath}`;
    resolvedAbsolute = isAbsolute(path);
  }
  resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute);
  if (resolvedAbsolute && !isAbsolute(resolvedPath)) {
    return `/${resolvedPath}`;
  }
  return resolvedPath.length > 0 ? resolvedPath : ".";
};
function normalizeString(path, allowAboveRoot) {
  let res = "";
  let lastSegmentLength = 0;
  let lastSlash = -1;
  let dots = 0;
  let char = null;
  for (let index = 0; index <= path.length; ++index) {
    if (index < path.length) {
      char = path[index];
    } else if (char === "/") {
      break;
    } else {
      char = "/";
    }
    if (char === "/") {
      if (lastSlash === index - 1 || dots === 1) ; else if (dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res[res.length - 1] !== "." || res[res.length - 2] !== ".") {
          if (res.length > 2) {
            const lastSlashIndex = res.lastIndexOf("/");
            if (lastSlashIndex === -1) {
              res = "";
              lastSegmentLength = 0;
            } else {
              res = res.slice(0, lastSlashIndex);
              lastSegmentLength = res.length - 1 - res.lastIndexOf("/");
            }
            lastSlash = index;
            dots = 0;
            continue;
          } else if (res.length > 0) {
            res = "";
            lastSegmentLength = 0;
            lastSlash = index;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          res += res.length > 0 ? "/.." : "..";
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0) {
          res += `/${path.slice(lastSlash + 1, index)}`;
        } else {
          res = path.slice(lastSlash + 1, index);
        }
        lastSegmentLength = index - lastSlash - 1;
      }
      lastSlash = index;
      dots = 0;
    } else if (char === "." && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}
const isAbsolute = function(p) {
  return _IS_ABSOLUTE_RE.test(p);
};
const dirname = function(p) {
  const segments = normalizeWindowsPath(p).replace(/\/$/, "").split("/").slice(0, -1);
  if (segments.length === 1 && _DRIVE_LETTER_RE.test(segments[0])) {
    segments[0] += "/";
  }
  return segments.join("/") || (isAbsolute(p) ? "/" : ".");
};

function readAsset (id) {
  const serverDir = dirname(fileURLToPath(globalThis._importMeta_.url));
  return promises.readFile(resolve(serverDir, assets$1[id].path))
}

const publicAssetBases = {"/_nuxt/builds/meta/":{"maxAge":31536000},"/_nuxt/builds/":{"maxAge":1},"/_nuxt/":{"maxAge":31536000}};

function isPublicAssetURL(id = '') {
  if (assets$1[id]) {
    return true
  }
  for (const base in publicAssetBases) {
    if (id.startsWith(base)) { return true }
  }
  return false
}

function getAsset (id) {
  return assets$1[id]
}

const METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
const EncodingMap = { gzip: ".gz", br: ".br" };
const _nK9Rqt = eventHandler((event) => {
  if (event.method && !METHODS.has(event.method)) {
    return;
  }
  let id = decodePath(
    withLeadingSlash(withoutTrailingSlash(parseURL(event.path).pathname))
  );
  let asset;
  const encodingHeader = String(
    getRequestHeader(event, "accept-encoding") || ""
  );
  const encodings = [
    ...encodingHeader.split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(),
    ""
  ];
  if (encodings.length > 1) {
    appendResponseHeader(event, "Vary", "Accept-Encoding");
  }
  for (const encoding of encodings) {
    for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
      const _asset = getAsset(_id);
      if (_asset) {
        asset = _asset;
        id = _id;
        break;
      }
    }
  }
  if (!asset) {
    if (isPublicAssetURL(id)) {
      removeResponseHeader(event, "Cache-Control");
      throw createError$1({
        statusMessage: "Cannot find static asset " + id,
        statusCode: 404
      });
    }
    return;
  }
  const ifNotMatch = getRequestHeader(event, "if-none-match") === asset.etag;
  if (ifNotMatch) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  const ifModifiedSinceH = getRequestHeader(event, "if-modified-since");
  const mtimeDate = new Date(asset.mtime);
  if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  if (asset.type && !getResponseHeader(event, "Content-Type")) {
    setResponseHeader(event, "Content-Type", asset.type);
  }
  if (asset.etag && !getResponseHeader(event, "ETag")) {
    setResponseHeader(event, "ETag", asset.etag);
  }
  if (asset.mtime && !getResponseHeader(event, "Last-Modified")) {
    setResponseHeader(event, "Last-Modified", mtimeDate.toUTCString());
  }
  if (asset.encoding && !getResponseHeader(event, "Content-Encoding")) {
    setResponseHeader(event, "Content-Encoding", asset.encoding);
  }
  if (asset.size > 0 && !getResponseHeader(event, "Content-Length")) {
    setResponseHeader(event, "Content-Length", asset.size);
  }
  return readAsset(id);
});

const _lazy_nkK0Pj = () => import('../routes/api/auth/login.post.mjs');
const _lazy_Vk7JDj = () => import('../routes/api/auth/logout.post.mjs');
const _lazy_LOx8JO = () => import('../routes/api/auth/me.get.mjs');
const _lazy_aROv2d = () => import('../routes/api/auth/signup.post.mjs');
const _lazy_rNONRW = () => import('../routes/api/convert-to-markdown-v2.post.mjs');
const _lazy_tP1jiu = () => import('../routes/api/convert-to-markdown.post.mjs');
const _lazy_3Rvsln = () => import('../routes/api/execute-flow.post.mjs');
const _lazy_V3nbOU = () => import('../routes/api/execute/stream.mjs');
const _lazy_ScDfoi = () => import('../routes/api/flow-store/flows/_id_.delete.mjs');
const _lazy_8MHc9C = () => import('../routes/api/flow-store/flows/_id_.get.mjs');
const _lazy_Xk90Qm = () => import('../routes/api/flow-store/get-flow-list.get.mjs');
const _lazy_G648xx = () => import('../routes/api/flow-store/save-flow.post.mjs');
const _lazy_APTyYQ = () => import('../routes/api/gen-ai/execute.mjs');
const _lazy_PQV5x1 = () => import('../routes/api/publish-flow/execute/_userId/_flowItemId_.mjs');
const _lazy_sPxlLx = () => import('../routes/api/publish-flow/exist-check/_userId/_flowItemId_.mjs');
const _lazy_7glk7w = () => import('../routes/api/publish-flow/register.post.mjs');
const _lazy_ZvTofm = () => import('../routes/api/rag/execute.post.mjs');
const _lazy_KLFDPz = () => import('../routes/api/rag/get-document-list.post.mjs');
const _lazy_SPUTpE = () => import('../routes/api/rag/get-document-meta-data.mjs');
const _lazy_rmEkVY = () => import('../routes/api/rag/get-document.mjs');
const _lazy_5wSUOy = () => import('../routes/api/rag/upsert-chunks.post.mjs');
const _lazy_SbLauh = () => import('../routes/api/stream-example.get.mjs');
const _lazy_R07TJe = () => import('../routes/renderer.mjs').then(function (n) { return n.r; });

const handlers = [
  { route: '', handler: _nK9Rqt, lazy: false, middleware: true, method: undefined },
  { route: '/api/auth/login', handler: _lazy_nkK0Pj, lazy: true, middleware: false, method: "post" },
  { route: '/api/auth/logout', handler: _lazy_Vk7JDj, lazy: true, middleware: false, method: "post" },
  { route: '/api/auth/me', handler: _lazy_LOx8JO, lazy: true, middleware: false, method: "get" },
  { route: '/api/auth/signup', handler: _lazy_aROv2d, lazy: true, middleware: false, method: "post" },
  { route: '/api/convert-to-markdown-v2', handler: _lazy_rNONRW, lazy: true, middleware: false, method: "post" },
  { route: '/api/convert-to-markdown', handler: _lazy_tP1jiu, lazy: true, middleware: false, method: "post" },
  { route: '/api/execute-flow', handler: _lazy_3Rvsln, lazy: true, middleware: false, method: "post" },
  { route: '/api/execute/stream', handler: _lazy_V3nbOU, lazy: true, middleware: false, method: undefined },
  { route: '/api/flow-store/flows/:id', handler: _lazy_ScDfoi, lazy: true, middleware: false, method: "delete" },
  { route: '/api/flow-store/flows/:id', handler: _lazy_8MHc9C, lazy: true, middleware: false, method: "get" },
  { route: '/api/flow-store/get-flow-list', handler: _lazy_Xk90Qm, lazy: true, middleware: false, method: "get" },
  { route: '/api/flow-store/save-flow', handler: _lazy_G648xx, lazy: true, middleware: false, method: "post" },
  { route: '/api/gen-ai/execute', handler: _lazy_APTyYQ, lazy: true, middleware: false, method: undefined },
  { route: '/api/publish-flow/execute/:userId/:flowItemId', handler: _lazy_PQV5x1, lazy: true, middleware: false, method: undefined },
  { route: '/api/publish-flow/exist-check/:userId/:flowItemId', handler: _lazy_sPxlLx, lazy: true, middleware: false, method: undefined },
  { route: '/api/publish-flow/register', handler: _lazy_7glk7w, lazy: true, middleware: false, method: "post" },
  { route: '/api/rag/execute', handler: _lazy_ZvTofm, lazy: true, middleware: false, method: "post" },
  { route: '/api/rag/get-document-list', handler: _lazy_KLFDPz, lazy: true, middleware: false, method: "post" },
  { route: '/api/rag/get-document-meta-data', handler: _lazy_SPUTpE, lazy: true, middleware: false, method: undefined },
  { route: '/api/rag/get-document', handler: _lazy_rmEkVY, lazy: true, middleware: false, method: undefined },
  { route: '/api/rag/upsert-chunks', handler: _lazy_5wSUOy, lazy: true, middleware: false, method: "post" },
  { route: '/api/stream-example', handler: _lazy_SbLauh, lazy: true, middleware: false, method: "get" },
  { route: '/__nuxt_error', handler: _lazy_R07TJe, lazy: true, middleware: false, method: undefined },
  { route: '/**', handler: _lazy_R07TJe, lazy: true, middleware: false, method: undefined }
];

function wrapToPromise(value) {
  if (!value || typeof value.then !== "function") {
    return Promise.resolve(value);
  }
  return value;
}
function asyncCall(function_, ...arguments_) {
  try {
    return wrapToPromise(function_(...arguments_));
  } catch (error) {
    return Promise.reject(error);
  }
}
function isPrimitive(value) {
  const type = typeof value;
  return value === null || type !== "object" && type !== "function";
}
function isPureObject(value) {
  const proto = Object.getPrototypeOf(value);
  return !proto || proto.isPrototypeOf(Object);
}
function stringify(value) {
  if (isPrimitive(value)) {
    return String(value);
  }
  if (isPureObject(value) || Array.isArray(value)) {
    return JSON.stringify(value);
  }
  if (typeof value.toJSON === "function") {
    return stringify(value.toJSON());
  }
  throw new Error("[unstorage] Cannot stringify value!");
}
function checkBufferSupport() {
  if (typeof Buffer === "undefined") {
    throw new TypeError("[unstorage] Buffer is not supported!");
  }
}
const BASE64_PREFIX = "base64:";
function serializeRaw(value) {
  if (typeof value === "string") {
    return value;
  }
  checkBufferSupport();
  const base64 = Buffer.from(value).toString("base64");
  return BASE64_PREFIX + base64;
}
function deserializeRaw(value) {
  if (typeof value !== "string") {
    return value;
  }
  if (!value.startsWith(BASE64_PREFIX)) {
    return value;
  }
  checkBufferSupport();
  return Buffer.from(value.slice(BASE64_PREFIX.length), "base64");
}

const storageKeyProperties = [
  "hasItem",
  "getItem",
  "getItemRaw",
  "setItem",
  "setItemRaw",
  "removeItem",
  "getMeta",
  "setMeta",
  "removeMeta",
  "getKeys",
  "clear",
  "mount",
  "unmount"
];
function prefixStorage(storage, base) {
  base = normalizeBaseKey(base);
  if (!base) {
    return storage;
  }
  const nsStorage = { ...storage };
  for (const property of storageKeyProperties) {
    nsStorage[property] = (key = "", ...args) => (
      // @ts-ignore
      storage[property](base + key, ...args)
    );
  }
  nsStorage.getKeys = (key = "", ...arguments_) => storage.getKeys(base + key, ...arguments_).then((keys) => keys.map((key2) => key2.slice(base.length)));
  return nsStorage;
}
function normalizeKey$1(key) {
  if (!key) {
    return "";
  }
  return key.split("?")[0].replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "");
}
function joinKeys(...keys) {
  return normalizeKey$1(keys.join(":"));
}
function normalizeBaseKey(base) {
  base = normalizeKey$1(base);
  return base ? base + ":" : "";
}

function defineDriver$1(factory) {
  return factory;
}

const DRIVER_NAME$1 = "memory";
const memory = defineDriver$1(() => {
  const data = /* @__PURE__ */ new Map();
  return {
    name: DRIVER_NAME$1,
    getInstance: () => data,
    hasItem(key) {
      return data.has(key);
    },
    getItem(key) {
      return data.get(key) ?? null;
    },
    getItemRaw(key) {
      return data.get(key) ?? null;
    },
    setItem(key, value) {
      data.set(key, value);
    },
    setItemRaw(key, value) {
      data.set(key, value);
    },
    removeItem(key) {
      data.delete(key);
    },
    getKeys() {
      return [...data.keys()];
    },
    clear() {
      data.clear();
    },
    dispose() {
      data.clear();
    }
  };
});

function createStorage(options = {}) {
  const context = {
    mounts: { "": options.driver || memory() },
    mountpoints: [""],
    watching: false,
    watchListeners: [],
    unwatch: {}
  };
  const getMount = (key) => {
    for (const base of context.mountpoints) {
      if (key.startsWith(base)) {
        return {
          base,
          relativeKey: key.slice(base.length),
          driver: context.mounts[base]
        };
      }
    }
    return {
      base: "",
      relativeKey: key,
      driver: context.mounts[""]
    };
  };
  const getMounts = (base, includeParent) => {
    return context.mountpoints.filter(
      (mountpoint) => mountpoint.startsWith(base) || includeParent && base.startsWith(mountpoint)
    ).map((mountpoint) => ({
      relativeBase: base.length > mountpoint.length ? base.slice(mountpoint.length) : void 0,
      mountpoint,
      driver: context.mounts[mountpoint]
    }));
  };
  const onChange = (event, key) => {
    if (!context.watching) {
      return;
    }
    key = normalizeKey$1(key);
    for (const listener of context.watchListeners) {
      listener(event, key);
    }
  };
  const startWatch = async () => {
    if (context.watching) {
      return;
    }
    context.watching = true;
    for (const mountpoint in context.mounts) {
      context.unwatch[mountpoint] = await watch(
        context.mounts[mountpoint],
        onChange,
        mountpoint
      );
    }
  };
  const stopWatch = async () => {
    if (!context.watching) {
      return;
    }
    for (const mountpoint in context.unwatch) {
      await context.unwatch[mountpoint]();
    }
    context.unwatch = {};
    context.watching = false;
  };
  const runBatch = (items, commonOptions, cb) => {
    const batches = /* @__PURE__ */ new Map();
    const getBatch = (mount) => {
      let batch = batches.get(mount.base);
      if (!batch) {
        batch = {
          driver: mount.driver,
          base: mount.base,
          items: []
        };
        batches.set(mount.base, batch);
      }
      return batch;
    };
    for (const item of items) {
      const isStringItem = typeof item === "string";
      const key = normalizeKey$1(isStringItem ? item : item.key);
      const value = isStringItem ? void 0 : item.value;
      const options2 = isStringItem || !item.options ? commonOptions : { ...commonOptions, ...item.options };
      const mount = getMount(key);
      getBatch(mount).items.push({
        key,
        value,
        relativeKey: mount.relativeKey,
        options: options2
      });
    }
    return Promise.all([...batches.values()].map((batch) => cb(batch))).then(
      (r) => r.flat()
    );
  };
  const storage = {
    // Item
    hasItem(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      return asyncCall(driver.hasItem, relativeKey, opts);
    },
    getItem(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      return asyncCall(driver.getItem, relativeKey, opts).then(
        (value) => destr(value)
      );
    },
    getItems(items, commonOptions) {
      return runBatch(items, commonOptions, (batch) => {
        if (batch.driver.getItems) {
          return asyncCall(
            batch.driver.getItems,
            batch.items.map((item) => ({
              key: item.relativeKey,
              options: item.options
            })),
            commonOptions
          ).then(
            (r) => r.map((item) => ({
              key: joinKeys(batch.base, item.key),
              value: destr(item.value)
            }))
          );
        }
        return Promise.all(
          batch.items.map((item) => {
            return asyncCall(
              batch.driver.getItem,
              item.relativeKey,
              item.options
            ).then((value) => ({
              key: item.key,
              value: destr(value)
            }));
          })
        );
      });
    },
    getItemRaw(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (driver.getItemRaw) {
        return asyncCall(driver.getItemRaw, relativeKey, opts);
      }
      return asyncCall(driver.getItem, relativeKey, opts).then(
        (value) => deserializeRaw(value)
      );
    },
    async setItem(key, value, opts = {}) {
      if (value === void 0) {
        return storage.removeItem(key);
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (!driver.setItem) {
        return;
      }
      await asyncCall(driver.setItem, relativeKey, stringify(value), opts);
      if (!driver.watch) {
        onChange("update", key);
      }
    },
    async setItems(items, commonOptions) {
      await runBatch(items, commonOptions, async (batch) => {
        if (batch.driver.setItems) {
          return asyncCall(
            batch.driver.setItems,
            batch.items.map((item) => ({
              key: item.relativeKey,
              value: stringify(item.value),
              options: item.options
            })),
            commonOptions
          );
        }
        if (!batch.driver.setItem) {
          return;
        }
        await Promise.all(
          batch.items.map((item) => {
            return asyncCall(
              batch.driver.setItem,
              item.relativeKey,
              stringify(item.value),
              item.options
            );
          })
        );
      });
    },
    async setItemRaw(key, value, opts = {}) {
      if (value === void 0) {
        return storage.removeItem(key, opts);
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (driver.setItemRaw) {
        await asyncCall(driver.setItemRaw, relativeKey, value, opts);
      } else if (driver.setItem) {
        await asyncCall(driver.setItem, relativeKey, serializeRaw(value), opts);
      } else {
        return;
      }
      if (!driver.watch) {
        onChange("update", key);
      }
    },
    async removeItem(key, opts = {}) {
      if (typeof opts === "boolean") {
        opts = { removeMeta: opts };
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (!driver.removeItem) {
        return;
      }
      await asyncCall(driver.removeItem, relativeKey, opts);
      if (opts.removeMeta || opts.removeMata) {
        await asyncCall(driver.removeItem, relativeKey + "$", opts);
      }
      if (!driver.watch) {
        onChange("remove", key);
      }
    },
    // Meta
    async getMeta(key, opts = {}) {
      if (typeof opts === "boolean") {
        opts = { nativeOnly: opts };
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      const meta = /* @__PURE__ */ Object.create(null);
      if (driver.getMeta) {
        Object.assign(meta, await asyncCall(driver.getMeta, relativeKey, opts));
      }
      if (!opts.nativeOnly) {
        const value = await asyncCall(
          driver.getItem,
          relativeKey + "$",
          opts
        ).then((value_) => destr(value_));
        if (value && typeof value === "object") {
          if (typeof value.atime === "string") {
            value.atime = new Date(value.atime);
          }
          if (typeof value.mtime === "string") {
            value.mtime = new Date(value.mtime);
          }
          Object.assign(meta, value);
        }
      }
      return meta;
    },
    setMeta(key, value, opts = {}) {
      return this.setItem(key + "$", value, opts);
    },
    removeMeta(key, opts = {}) {
      return this.removeItem(key + "$", opts);
    },
    // Keys
    async getKeys(base, opts = {}) {
      base = normalizeBaseKey(base);
      const mounts = getMounts(base, true);
      let maskedMounts = [];
      const allKeys = [];
      for (const mount of mounts) {
        const rawKeys = await asyncCall(
          mount.driver.getKeys,
          mount.relativeBase,
          opts
        );
        for (const key of rawKeys) {
          const fullKey = mount.mountpoint + normalizeKey$1(key);
          if (!maskedMounts.some((p) => fullKey.startsWith(p))) {
            allKeys.push(fullKey);
          }
        }
        maskedMounts = [
          mount.mountpoint,
          ...maskedMounts.filter((p) => !p.startsWith(mount.mountpoint))
        ];
      }
      return base ? allKeys.filter(
        (key) => key.startsWith(base) && key[key.length - 1] !== "$"
      ) : allKeys.filter((key) => key[key.length - 1] !== "$");
    },
    // Utils
    async clear(base, opts = {}) {
      base = normalizeBaseKey(base);
      await Promise.all(
        getMounts(base, false).map(async (m) => {
          if (m.driver.clear) {
            return asyncCall(m.driver.clear, m.relativeBase, opts);
          }
          if (m.driver.removeItem) {
            const keys = await m.driver.getKeys(m.relativeBase || "", opts);
            return Promise.all(
              keys.map((key) => m.driver.removeItem(key, opts))
            );
          }
        })
      );
    },
    async dispose() {
      await Promise.all(
        Object.values(context.mounts).map((driver) => dispose(driver))
      );
    },
    async watch(callback) {
      await startWatch();
      context.watchListeners.push(callback);
      return async () => {
        context.watchListeners = context.watchListeners.filter(
          (listener) => listener !== callback
        );
        if (context.watchListeners.length === 0) {
          await stopWatch();
        }
      };
    },
    async unwatch() {
      context.watchListeners = [];
      await stopWatch();
    },
    // Mount
    mount(base, driver) {
      base = normalizeBaseKey(base);
      if (base && context.mounts[base]) {
        throw new Error(`already mounted at ${base}`);
      }
      if (base) {
        context.mountpoints.push(base);
        context.mountpoints.sort((a, b) => b.length - a.length);
      }
      context.mounts[base] = driver;
      if (context.watching) {
        Promise.resolve(watch(driver, onChange, base)).then((unwatcher) => {
          context.unwatch[base] = unwatcher;
        }).catch(console.error);
      }
      return storage;
    },
    async unmount(base, _dispose = true) {
      base = normalizeBaseKey(base);
      if (!base || !context.mounts[base]) {
        return;
      }
      if (context.watching && base in context.unwatch) {
        context.unwatch[base]();
        delete context.unwatch[base];
      }
      if (_dispose) {
        await dispose(context.mounts[base]);
      }
      context.mountpoints = context.mountpoints.filter((key) => key !== base);
      delete context.mounts[base];
    },
    getMount(key = "") {
      key = normalizeKey$1(key) + ":";
      const m = getMount(key);
      return {
        driver: m.driver,
        base: m.base
      };
    },
    getMounts(base = "", opts = {}) {
      base = normalizeKey$1(base);
      const mounts = getMounts(base, opts.parents);
      return mounts.map((m) => ({
        driver: m.driver,
        base: m.mountpoint
      }));
    },
    // Aliases
    keys: (base, opts = {}) => storage.getKeys(base, opts),
    get: (key, opts = {}) => storage.getItem(key, opts),
    set: (key, value, opts = {}) => storage.setItem(key, value, opts),
    has: (key, opts = {}) => storage.hasItem(key, opts),
    del: (key, opts = {}) => storage.removeItem(key, opts),
    remove: (key, opts = {}) => storage.removeItem(key, opts)
  };
  return storage;
}
function watch(driver, onChange, base) {
  return driver.watch ? driver.watch((event, key) => onChange(event, base + key)) : () => {
  };
}
async function dispose(driver) {
  if (typeof driver.dispose === "function") {
    await asyncCall(driver.dispose);
  }
}

const _assets = {

};

const normalizeKey = function normalizeKey(key) {
  if (!key) {
    return "";
  }
  return key.split("?")[0].replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "");
};

const assets = {
  getKeys() {
    return Promise.resolve(Object.keys(_assets))
  },
  hasItem (id) {
    id = normalizeKey(id);
    return Promise.resolve(id in _assets)
  },
  getItem (id) {
    id = normalizeKey(id);
    return Promise.resolve(_assets[id] ? _assets[id].import() : null)
  },
  getMeta (id) {
    id = normalizeKey(id);
    return Promise.resolve(_assets[id] ? _assets[id].meta : {})
  }
};

function defineDriver(factory) {
  return factory;
}
function createError(driver, message, opts) {
  const err = new Error(`[unstorage] [${driver}] ${message}`, opts);
  return err;
}
function createRequiredError(driver, name) {
  if (Array.isArray(name)) {
    return createError(
      driver,
      `Missing some of the required options ${name.map((n) => "`" + n + "`").join(", ")}`
    );
  }
  return createError(driver, `Missing required option \`${name}\`.`);
}

function ignoreNotfound(err) {
  return err.code === "ENOENT" || err.code === "EISDIR" ? null : err;
}
function ignoreExists(err) {
  return err.code === "EEXIST" ? null : err;
}
async function writeFile(path, data, encoding) {
  await ensuredir(dirname$1(path));
  return promises.writeFile(path, data, encoding);
}
function readFile(path, encoding) {
  return promises.readFile(path, encoding).catch(ignoreNotfound);
}
function unlink(path) {
  return promises.unlink(path).catch(ignoreNotfound);
}
function readdir(dir) {
  return promises.readdir(dir, { withFileTypes: true }).catch(ignoreNotfound).then((r) => r || []);
}
async function ensuredir(dir) {
  if (existsSync(dir)) {
    return;
  }
  await ensuredir(dirname$1(dir)).catch(ignoreExists);
  await promises.mkdir(dir).catch(ignoreExists);
}
async function readdirRecursive(dir, ignore) {
  if (ignore && ignore(dir)) {
    return [];
  }
  const entries = await readdir(dir);
  const files = [];
  await Promise.all(
    entries.map(async (entry) => {
      const entryPath = resolve$1(dir, entry.name);
      if (entry.isDirectory()) {
        const dirFiles = await readdirRecursive(entryPath, ignore);
        files.push(...dirFiles.map((f) => entry.name + "/" + f));
      } else {
        if (!(ignore && ignore(entry.name))) {
          files.push(entry.name);
        }
      }
    })
  );
  return files;
}
async function rmRecursive(dir) {
  const entries = await readdir(dir);
  await Promise.all(
    entries.map((entry) => {
      const entryPath = resolve$1(dir, entry.name);
      if (entry.isDirectory()) {
        return rmRecursive(entryPath).then(() => promises.rmdir(entryPath));
      } else {
        return promises.unlink(entryPath);
      }
    })
  );
}

const PATH_TRAVERSE_RE = /\.\.:|\.\.$/;
const DRIVER_NAME = "fs-lite";
const unstorage_47drivers_47fs_45lite = defineDriver((opts = {}) => {
  if (!opts.base) {
    throw createRequiredError(DRIVER_NAME, "base");
  }
  opts.base = resolve$1(opts.base);
  const r = (key) => {
    if (PATH_TRAVERSE_RE.test(key)) {
      throw createError(
        DRIVER_NAME,
        `Invalid key: ${JSON.stringify(key)}. It should not contain .. segments`
      );
    }
    const resolved = join(opts.base, key.replace(/:/g, "/"));
    return resolved;
  };
  return {
    name: DRIVER_NAME,
    options: opts,
    hasItem(key) {
      return existsSync(r(key));
    },
    getItem(key) {
      return readFile(r(key), "utf8");
    },
    getItemRaw(key) {
      return readFile(r(key));
    },
    async getMeta(key) {
      const { atime, mtime, size, birthtime, ctime } = await promises.stat(r(key)).catch(() => ({}));
      return { atime, mtime, size, birthtime, ctime };
    },
    setItem(key, value) {
      if (opts.readOnly) {
        return;
      }
      return writeFile(r(key), value, "utf8");
    },
    setItemRaw(key, value) {
      if (opts.readOnly) {
        return;
      }
      return writeFile(r(key), value);
    },
    removeItem(key) {
      if (opts.readOnly) {
        return;
      }
      return unlink(r(key));
    },
    getKeys() {
      return readdirRecursive(r("."), opts.ignore);
    },
    async clear() {
      if (opts.readOnly || opts.noClear) {
        return;
      }
      await rmRecursive(r("."));
    }
  };
});

const storage = createStorage({});

storage.mount('/assets', assets);

storage.mount('data', unstorage_47drivers_47fs_45lite({"driver":"fsLite","base":"/home/runner/work/llm-integrator/llm-integrator/.data/kv"}));

function useStorage(base = "") {
  return base ? prefixStorage(storage, base) : storage;
}

function defaultCacheOptions() {
  return {
    name: "_",
    base: "/cache",
    swr: true,
    maxAge: 1
  };
}
function defineCachedFunction(fn, opts = {}) {
  opts = { ...defaultCacheOptions(), ...opts };
  const pending = {};
  const group = opts.group || "nitro/functions";
  const name = opts.name || fn.name || "_";
  const integrity = opts.integrity || hash([fn, opts]);
  const validate = opts.validate || ((entry) => entry.value !== void 0);
  async function get(key, resolver, shouldInvalidateCache, event) {
    const cacheKey = [opts.base, group, name, key + ".json"].filter(Boolean).join(":").replace(/:\/$/, ":index");
    let entry = await useStorage().getItem(cacheKey).catch((error) => {
      console.error(`[nitro] [cache] Cache read error.`, error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }) || {};
    if (typeof entry !== "object") {
      entry = {};
      const error = new Error("Malformed data read from cache.");
      console.error("[nitro] [cache]", error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }
    const ttl = (opts.maxAge ?? 0) * 1e3;
    if (ttl) {
      entry.expires = Date.now() + ttl;
    }
    const expired = shouldInvalidateCache || entry.integrity !== integrity || ttl && Date.now() - (entry.mtime || 0) > ttl || validate(entry) === false;
    const _resolve = async () => {
      const isPending = pending[key];
      if (!isPending) {
        if (entry.value !== void 0 && (opts.staleMaxAge || 0) >= 0 && opts.swr === false) {
          entry.value = void 0;
          entry.integrity = void 0;
          entry.mtime = void 0;
          entry.expires = void 0;
        }
        pending[key] = Promise.resolve(resolver());
      }
      try {
        entry.value = await pending[key];
      } catch (error) {
        if (!isPending) {
          delete pending[key];
        }
        throw error;
      }
      if (!isPending) {
        entry.mtime = Date.now();
        entry.integrity = integrity;
        delete pending[key];
        if (validate(entry) !== false) {
          let setOpts;
          if (opts.maxAge && !opts.swr) {
            setOpts = { ttl: opts.maxAge };
          }
          const promise = useStorage().setItem(cacheKey, entry, setOpts).catch((error) => {
            console.error(`[nitro] [cache] Cache write error.`, error);
            useNitroApp().captureError(error, { event, tags: ["cache"] });
          });
          if (event?.waitUntil) {
            event.waitUntil(promise);
          }
        }
      }
    };
    const _resolvePromise = expired ? _resolve() : Promise.resolve();
    if (entry.value === void 0) {
      await _resolvePromise;
    } else if (expired && event && event.waitUntil) {
      event.waitUntil(_resolvePromise);
    }
    if (opts.swr && validate(entry) !== false) {
      _resolvePromise.catch((error) => {
        console.error(`[nitro] [cache] SWR handler error.`, error);
        useNitroApp().captureError(error, { event, tags: ["cache"] });
      });
      return entry;
    }
    return _resolvePromise.then(() => entry);
  }
  return async (...args) => {
    const shouldBypassCache = await opts.shouldBypassCache?.(...args);
    if (shouldBypassCache) {
      return fn(...args);
    }
    const key = await (opts.getKey || getKey)(...args);
    const shouldInvalidateCache = await opts.shouldInvalidateCache?.(...args);
    const entry = await get(
      key,
      () => fn(...args),
      shouldInvalidateCache,
      args[0] && isEvent(args[0]) ? args[0] : void 0
    );
    let value = entry.value;
    if (opts.transform) {
      value = await opts.transform(entry, ...args) || value;
    }
    return value;
  };
}
function cachedFunction(fn, opts = {}) {
  return defineCachedFunction(fn, opts);
}
function getKey(...args) {
  return args.length > 0 ? hash(args, {}) : "";
}
function escapeKey(key) {
  return String(key).replace(/\W/g, "");
}
function defineCachedEventHandler(handler, opts = defaultCacheOptions()) {
  const variableHeaderNames = (opts.varies || []).filter(Boolean).map((h) => h.toLowerCase()).sort();
  const _opts = {
    ...opts,
    getKey: async (event) => {
      const customKey = await opts.getKey?.(event);
      if (customKey) {
        return escapeKey(customKey);
      }
      const _path = event.node.req.originalUrl || event.node.req.url || event.path;
      let _pathname;
      try {
        _pathname = escapeKey(decodeURI(parseURL(_path).pathname)).slice(0, 16) || "index";
      } catch {
        _pathname = "-";
      }
      const _hashedPath = `${_pathname}.${hash(_path)}`;
      const _headers = variableHeaderNames.map((header) => [header, event.node.req.headers[header]]).map(([name, value]) => `${escapeKey(name)}.${hash(value)}`);
      return [_hashedPath, ..._headers].join(":");
    },
    validate: (entry) => {
      if (!entry.value) {
        return false;
      }
      if (entry.value.code >= 400) {
        return false;
      }
      if (entry.value.body === void 0) {
        return false;
      }
      if (entry.value.headers.etag === "undefined" || entry.value.headers["last-modified"] === "undefined") {
        return false;
      }
      return true;
    },
    group: opts.group || "nitro/handlers",
    integrity: opts.integrity || hash([handler, opts])
  };
  const _cachedHandler = cachedFunction(
    async (incomingEvent) => {
      const variableHeaders = {};
      for (const header of variableHeaderNames) {
        const value = incomingEvent.node.req.headers[header];
        if (value !== void 0) {
          variableHeaders[header] = value;
        }
      }
      const reqProxy = cloneWithProxy(incomingEvent.node.req, {
        headers: variableHeaders
      });
      const resHeaders = {};
      let _resSendBody;
      const resProxy = cloneWithProxy(incomingEvent.node.res, {
        statusCode: 200,
        writableEnded: false,
        writableFinished: false,
        headersSent: false,
        closed: false,
        getHeader(name) {
          return resHeaders[name];
        },
        setHeader(name, value) {
          resHeaders[name] = value;
          return this;
        },
        getHeaderNames() {
          return Object.keys(resHeaders);
        },
        hasHeader(name) {
          return name in resHeaders;
        },
        removeHeader(name) {
          delete resHeaders[name];
        },
        getHeaders() {
          return resHeaders;
        },
        end(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2();
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return this;
        },
        write(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2(void 0);
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return true;
        },
        writeHead(statusCode, headers2) {
          this.statusCode = statusCode;
          if (headers2) {
            if (Array.isArray(headers2) || typeof headers2 === "string") {
              throw new TypeError("Raw headers  is not supported.");
            }
            for (const header in headers2) {
              const value = headers2[header];
              if (value !== void 0) {
                this.setHeader(
                  header,
                  value
                );
              }
            }
          }
          return this;
        }
      });
      const event = createEvent(reqProxy, resProxy);
      event.fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: useNitroApp().localFetch
      });
      event.$fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: globalThis.$fetch
      });
      event.context = incomingEvent.context;
      event.context.cache = {
        options: _opts
      };
      const body = await handler(event) || _resSendBody;
      const headers = event.node.res.getHeaders();
      headers.etag = String(
        headers.Etag || headers.etag || `W/"${hash(body)}"`
      );
      headers["last-modified"] = String(
        headers["Last-Modified"] || headers["last-modified"] || (/* @__PURE__ */ new Date()).toUTCString()
      );
      const cacheControl = [];
      if (opts.swr) {
        if (opts.maxAge) {
          cacheControl.push(`s-maxage=${opts.maxAge}`);
        }
        if (opts.staleMaxAge) {
          cacheControl.push(`stale-while-revalidate=${opts.staleMaxAge}`);
        } else {
          cacheControl.push("stale-while-revalidate");
        }
      } else if (opts.maxAge) {
        cacheControl.push(`max-age=${opts.maxAge}`);
      }
      if (cacheControl.length > 0) {
        headers["cache-control"] = cacheControl.join(", ");
      }
      const cacheEntry = {
        code: event.node.res.statusCode,
        headers,
        body
      };
      return cacheEntry;
    },
    _opts
  );
  return defineEventHandler(async (event) => {
    if (opts.headersOnly) {
      if (handleCacheHeaders(event, { maxAge: opts.maxAge })) {
        return;
      }
      return handler(event);
    }
    const response = await _cachedHandler(
      event
    );
    if (event.node.res.headersSent || event.node.res.writableEnded) {
      return response.body;
    }
    if (handleCacheHeaders(event, {
      modifiedTime: new Date(response.headers["last-modified"]),
      etag: response.headers.etag,
      maxAge: opts.maxAge
    })) {
      return;
    }
    event.node.res.statusCode = response.code;
    for (const name in response.headers) {
      const value = response.headers[name];
      if (name === "set-cookie") {
        event.node.res.appendHeader(
          name,
          splitCookiesString(value)
        );
      } else {
        if (value !== void 0) {
          event.node.res.setHeader(name, value);
        }
      }
    }
    return response.body;
  });
}
function cloneWithProxy(obj, overrides) {
  return new Proxy(obj, {
    get(target, property, receiver) {
      if (property in overrides) {
        return overrides[property];
      }
      return Reflect.get(target, property, receiver);
    },
    set(target, property, value, receiver) {
      if (property in overrides) {
        overrides[property] = value;
        return true;
      }
      return Reflect.set(target, property, value, receiver);
    }
  });
}
const cachedEventHandler = defineCachedEventHandler;

function klona(x) {
	if (typeof x !== 'object') return x;

	var k, tmp, str=Object.prototype.toString.call(x);

	if (str === '[object Object]') {
		if (x.constructor !== Object && typeof x.constructor === 'function') {
			tmp = new x.constructor();
			for (k in x) {
				if (x.hasOwnProperty(k) && tmp[k] !== x[k]) {
					tmp[k] = klona(x[k]);
				}
			}
		} else {
			tmp = {}; // null
			for (k in x) {
				if (k === '__proto__') {
					Object.defineProperty(tmp, k, {
						value: klona(x[k]),
						configurable: true,
						enumerable: true,
						writable: true,
					});
				} else {
					tmp[k] = klona(x[k]);
				}
			}
		}
		return tmp;
	}

	if (str === '[object Array]') {
		k = x.length;
		for (tmp=Array(k); k--;) {
			tmp[k] = klona(x[k]);
		}
		return tmp;
	}

	if (str === '[object Set]') {
		tmp = new Set;
		x.forEach(function (val) {
			tmp.add(klona(val));
		});
		return tmp;
	}

	if (str === '[object Map]') {
		tmp = new Map;
		x.forEach(function (val, key) {
			tmp.set(klona(key), klona(val));
		});
		return tmp;
	}

	if (str === '[object Date]') {
		return new Date(+x);
	}

	if (str === '[object RegExp]') {
		tmp = new RegExp(x.source, x.flags);
		tmp.lastIndex = x.lastIndex;
		return tmp;
	}

	if (str === '[object DataView]') {
		return new x.constructor( klona(x.buffer) );
	}

	if (str === '[object ArrayBuffer]') {
		return x.slice(0);
	}

	// ArrayBuffer.isView(x)
	// ~> `new` bcuz `Buffer.slice` => ref
	if (str.slice(-6) === 'Array]') {
		return new x.constructor(x);
	}

	return x;
}

const inlineAppConfig = {
  "nuxt": {}
};



const appConfig = defuFn(inlineAppConfig);

const NUMBER_CHAR_RE = /\d/;
const STR_SPLITTERS = ["-", "_", "/", "."];
function isUppercase(char = "") {
  if (NUMBER_CHAR_RE.test(char)) {
    return void 0;
  }
  return char !== char.toLowerCase();
}
function splitByCase(str, separators) {
  const splitters = STR_SPLITTERS;
  const parts = [];
  if (!str || typeof str !== "string") {
    return parts;
  }
  let buff = "";
  let previousUpper;
  let previousSplitter;
  for (const char of str) {
    const isSplitter = splitters.includes(char);
    if (isSplitter === true) {
      parts.push(buff);
      buff = "";
      previousUpper = void 0;
      continue;
    }
    const isUpper = isUppercase(char);
    if (previousSplitter === false) {
      if (previousUpper === false && isUpper === true) {
        parts.push(buff);
        buff = char;
        previousUpper = isUpper;
        continue;
      }
      if (previousUpper === true && isUpper === false && buff.length > 1) {
        const lastChar = buff.at(-1);
        parts.push(buff.slice(0, Math.max(0, buff.length - 1)));
        buff = lastChar + char;
        previousUpper = isUpper;
        continue;
      }
    }
    buff += char;
    previousUpper = isUpper;
    previousSplitter = isSplitter;
  }
  parts.push(buff);
  return parts;
}
function kebabCase(str, joiner) {
  return str ? (Array.isArray(str) ? str : splitByCase(str)).map((p) => p.toLowerCase()).join(joiner) : "";
}
function snakeCase(str) {
  return kebabCase(str || "", "_");
}

function getEnv(key, opts) {
  const envKey = snakeCase(key).toUpperCase();
  return destr(
    process.env[opts.prefix + envKey] ?? process.env[opts.altPrefix + envKey]
  );
}
function _isObject(input) {
  return typeof input === "object" && !Array.isArray(input);
}
function applyEnv(obj, opts, parentKey = "") {
  for (const key in obj) {
    const subKey = parentKey ? `${parentKey}_${key}` : key;
    const envValue = getEnv(subKey, opts);
    if (_isObject(obj[key])) {
      if (_isObject(envValue)) {
        obj[key] = { ...obj[key], ...envValue };
        applyEnv(obj[key], opts, subKey);
      } else if (envValue === void 0) {
        applyEnv(obj[key], opts, subKey);
      } else {
        obj[key] = envValue ?? obj[key];
      }
    } else {
      obj[key] = envValue ?? obj[key];
    }
    if (opts.envExpansion && typeof obj[key] === "string") {
      obj[key] = _expandFromEnv(obj[key]);
    }
  }
  return obj;
}
const envExpandRx = /{{(.*?)}}/g;
function _expandFromEnv(value) {
  return value.replace(envExpandRx, (match, key) => {
    return process.env[key] || match;
  });
}

const _inlineRuntimeConfig = {
  "app": {
    "baseURL": "/",
    "buildId": "ec57849c-f492-4aff-9bf5-253be261ba55",
    "buildAssetsDir": "/_nuxt/",
    "cdnURL": ""
  },
  "nitro": {
    "envPrefix": "NUXT_",
    "routeRules": {
      "/__nuxt_error": {
        "cache": false
      },
      "/_nuxt/builds/meta/**": {
        "headers": {
          "cache-control": "public, max-age=31536000, immutable"
        }
      },
      "/_nuxt/builds/**": {
        "headers": {
          "cache-control": "public, max-age=1, immutable"
        }
      },
      "/_nuxt/**": {
        "headers": {
          "cache-control": "public, max-age=31536000, immutable"
        }
      }
    }
  },
  "public": {}
};
const envOptions = {
  prefix: "NITRO_",
  altPrefix: _inlineRuntimeConfig.nitro.envPrefix ?? process.env.NITRO_ENV_PREFIX ?? "_",
  envExpansion: _inlineRuntimeConfig.nitro.envExpansion ?? process.env.NITRO_ENV_EXPANSION ?? false
};
const _sharedRuntimeConfig = _deepFreeze(
  applyEnv(klona(_inlineRuntimeConfig), envOptions)
);
function useRuntimeConfig(event) {
  if (!event) {
    return _sharedRuntimeConfig;
  }
  if (event.context.nitro.runtimeConfig) {
    return event.context.nitro.runtimeConfig;
  }
  const runtimeConfig = klona(_inlineRuntimeConfig);
  applyEnv(runtimeConfig, envOptions);
  event.context.nitro.runtimeConfig = runtimeConfig;
  return runtimeConfig;
}
_deepFreeze(klona(appConfig));
function _deepFreeze(object) {
  const propNames = Object.getOwnPropertyNames(object);
  for (const name of propNames) {
    const value = object[name];
    if (value && typeof value === "object") {
      _deepFreeze(value);
    }
  }
  return Object.freeze(object);
}
new Proxy(/* @__PURE__ */ Object.create(null), {
  get: (_, prop) => {
    console.warn(
      "Please use `useRuntimeConfig()` instead of accessing config directly."
    );
    const runtimeConfig = useRuntimeConfig();
    if (prop in runtimeConfig) {
      return runtimeConfig[prop];
    }
    return void 0;
  }
});

function createContext(opts = {}) {
  let currentInstance;
  let isSingleton = false;
  const checkConflict = (instance) => {
    if (currentInstance && currentInstance !== instance) {
      throw new Error("Context conflict");
    }
  };
  let als;
  if (opts.asyncContext) {
    const _AsyncLocalStorage = opts.AsyncLocalStorage || globalThis.AsyncLocalStorage;
    if (_AsyncLocalStorage) {
      als = new _AsyncLocalStorage();
    } else {
      console.warn("[unctx] `AsyncLocalStorage` is not provided.");
    }
  }
  const _getCurrentInstance = () => {
    if (als && currentInstance === void 0) {
      const instance = als.getStore();
      if (instance !== void 0) {
        return instance;
      }
    }
    return currentInstance;
  };
  return {
    use: () => {
      const _instance = _getCurrentInstance();
      if (_instance === void 0) {
        throw new Error("Context is not available");
      }
      return _instance;
    },
    tryUse: () => {
      return _getCurrentInstance();
    },
    set: (instance, replace) => {
      if (!replace) {
        checkConflict(instance);
      }
      currentInstance = instance;
      isSingleton = true;
    },
    unset: () => {
      currentInstance = void 0;
      isSingleton = false;
    },
    call: (instance, callback) => {
      checkConflict(instance);
      currentInstance = instance;
      try {
        return als ? als.run(instance, callback) : callback();
      } finally {
        if (!isSingleton) {
          currentInstance = void 0;
        }
      }
    },
    async callAsync(instance, callback) {
      currentInstance = instance;
      const onRestore = () => {
        currentInstance = instance;
      };
      const onLeave = () => currentInstance === instance ? onRestore : void 0;
      asyncHandlers.add(onLeave);
      try {
        const r = als ? als.run(instance, callback) : callback();
        if (!isSingleton) {
          currentInstance = void 0;
        }
        return await r;
      } finally {
        asyncHandlers.delete(onLeave);
      }
    }
  };
}
function createNamespace(defaultOpts = {}) {
  const contexts = {};
  return {
    get(key, opts = {}) {
      if (!contexts[key]) {
        contexts[key] = createContext({ ...defaultOpts, ...opts });
      }
      return contexts[key];
    }
  };
}
const _globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof global !== "undefined" ? global : {};
const globalKey = "__unctx__";
const defaultNamespace = _globalThis[globalKey] || (_globalThis[globalKey] = createNamespace());
const getContext = (key, opts = {}) => defaultNamespace.get(key, opts);
const asyncHandlersKey = "__unctx_async_handlers__";
const asyncHandlers = _globalThis[asyncHandlersKey] || (_globalThis[asyncHandlersKey] = /* @__PURE__ */ new Set());

getContext("nitro-app", {
  asyncContext: false,
  AsyncLocalStorage: void 0
});

const config = useRuntimeConfig();
const _routeRulesMatcher = toRouteMatcher(
  createRouter$1({ routes: config.nitro.routeRules })
);
function createRouteRulesHandler(ctx) {
  return eventHandler((event) => {
    const routeRules = getRouteRules(event);
    if (routeRules.headers) {
      setHeaders(event, routeRules.headers);
    }
    if (routeRules.redirect) {
      let target = routeRules.redirect.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.redirect._redirectStripBase;
        if (strpBase) {
          targetPath = withoutBase(targetPath, strpBase);
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery$1(event.path);
        target = withQuery(target, query);
      }
      return sendRedirect(event, target, routeRules.redirect.statusCode);
    }
    if (routeRules.proxy) {
      let target = routeRules.proxy.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.proxy._proxyStripBase;
        if (strpBase) {
          targetPath = withoutBase(targetPath, strpBase);
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery$1(event.path);
        target = withQuery(target, query);
      }
      return proxyRequest(event, target, {
        fetch: ctx.localFetch,
        ...routeRules.proxy
      });
    }
  });
}
function getRouteRules(event) {
  event.context._nitro = event.context._nitro || {};
  if (!event.context._nitro.routeRules) {
    event.context._nitro.routeRules = getRouteRulesForPath(
      withoutBase(event.path.split("?")[0], useRuntimeConfig().app.baseURL)
    );
  }
  return event.context._nitro.routeRules;
}
function getRouteRulesForPath(path) {
  return defu({}, ..._routeRulesMatcher.matchAll(path).reverse());
}

function createNitroApp() {
  const config = useRuntimeConfig();
  const hooks = createHooks();
  const captureError = (error, context = {}) => {
    const promise = hooks.callHookParallel("error", error, context).catch((error_) => {
      console.error("Error while capturing another error", error_);
    });
    if (context.event && isEvent(context.event)) {
      const errors = context.event.context.nitro?.errors;
      if (errors) {
        errors.push({ error, context });
      }
      if (context.event.waitUntil) {
        context.event.waitUntil(promise);
      }
    }
  };
  const h3App = createApp({
    debug: destr(false),
    onError: (error, event) => {
      captureError(error, { event, tags: ["request"] });
      return errorHandler(error, event);
    },
    onRequest: async (event) => {
      await nitroApp$1.hooks.callHook("request", event).catch((error) => {
        captureError(error, { event, tags: ["request"] });
      });
    },
    onBeforeResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("beforeResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    },
    onAfterResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("afterResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    }
  });
  const router = createRouter({
    preemptive: true
  });
  const localCall = createCall(toNodeListener(h3App));
  const _localFetch = createFetch(localCall, globalThis.fetch);
  const localFetch = (input, init) => _localFetch(input, init).then(
    (response) => normalizeFetchResponse(response)
  );
  const $fetch = createFetch$1({
    fetch: localFetch,
    Headers: Headers$1,
    defaults: { baseURL: config.app.baseURL }
  });
  globalThis.$fetch = $fetch;
  h3App.use(createRouteRulesHandler({ localFetch }));
  h3App.use(
    eventHandler((event) => {
      event.context.nitro = event.context.nitro || { errors: [] };
      const envContext = event.node.req?.__unenv__;
      if (envContext) {
        Object.assign(event.context, envContext);
      }
      event.fetch = (req, init) => fetchWithEvent(event, req, init, { fetch: localFetch });
      event.$fetch = (req, init) => fetchWithEvent(event, req, init, {
        fetch: $fetch
      });
      event.waitUntil = (promise) => {
        if (!event.context.nitro._waitUntilPromises) {
          event.context.nitro._waitUntilPromises = [];
        }
        event.context.nitro._waitUntilPromises.push(promise);
        if (envContext?.waitUntil) {
          envContext.waitUntil(promise);
        }
      };
      event.captureError = (error, context) => {
        captureError(error, { event, ...context });
      };
    })
  );
  for (const h of handlers) {
    let handler = h.lazy ? lazyEventHandler(h.handler) : h.handler;
    if (h.middleware || !h.route) {
      const middlewareBase = (config.app.baseURL + (h.route || "/")).replace(
        /\/+/g,
        "/"
      );
      h3App.use(middlewareBase, handler);
    } else {
      const routeRules = getRouteRulesForPath(
        h.route.replace(/:\w+|\*\*/g, "_")
      );
      if (routeRules.cache) {
        handler = cachedEventHandler(handler, {
          group: "nitro/routes",
          ...routeRules.cache
        });
      }
      router.use(h.route, handler, h.method);
    }
  }
  h3App.use(config.app.baseURL, router.handler);
  const app = {
    hooks,
    h3App,
    router,
    localCall,
    localFetch,
    captureError
  };
  return app;
}
function runNitroPlugins(nitroApp2) {
  for (const plugin of plugins) {
    try {
      plugin(nitroApp2);
    } catch (error) {
      nitroApp2.captureError(error, { tags: ["plugin"] });
      throw error;
    }
  }
}
const nitroApp$1 = createNitroApp();
function useNitroApp() {
  return nitroApp$1;
}
runNitroPlugins(nitroApp$1);

function defineRenderHandler(render) {
  const runtimeConfig = useRuntimeConfig();
  return eventHandler(async (event) => {
    const nitroApp = useNitroApp();
    const ctx = { event, render, response: void 0 };
    await nitroApp.hooks.callHook("render:before", ctx);
    if (!ctx.response) {
      if (event.path === `${runtimeConfig.app.baseURL}favicon.ico`) {
        setResponseHeader(event, "Content-Type", "image/x-icon");
        return send(
          event,
          "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
        );
      }
      ctx.response = await ctx.render(event);
      if (!ctx.response) {
        const _currentStatus = getResponseStatus(event);
        setResponseStatus(event, _currentStatus === 200 ? 500 : _currentStatus);
        return send(
          event,
          "No response returned from render handler: " + event.path
        );
      }
    }
    await nitroApp.hooks.callHook("render:response", ctx.response, ctx);
    if (ctx.response.headers) {
      setResponseHeaders(event, ctx.response.headers);
    }
    if (ctx.response.statusCode || ctx.response.statusMessage) {
      setResponseStatus(
        event,
        ctx.response.statusCode,
        ctx.response.statusMessage
      );
    }
    return ctx.response.body;
  });
}

const debug = (...args) => {
};
function GracefulShutdown(server, opts) {
  opts = opts || {};
  const options = Object.assign(
    {
      signals: "SIGINT SIGTERM",
      timeout: 3e4,
      development: false,
      forceExit: true,
      onShutdown: (signal) => Promise.resolve(signal),
      preShutdown: (signal) => Promise.resolve(signal)
    },
    opts
  );
  let isShuttingDown = false;
  const connections = {};
  let connectionCounter = 0;
  const secureConnections = {};
  let secureConnectionCounter = 0;
  let failed = false;
  let finalRun = false;
  function onceFactory() {
    let called = false;
    return (emitter, events, callback) => {
      function call() {
        if (!called) {
          called = true;
          return Reflect.apply(callback, this, arguments);
        }
      }
      for (const e of events) {
        emitter.on(e, call);
      }
    };
  }
  const signals = options.signals.split(" ").map((s) => s.trim()).filter((s) => s.length > 0);
  const once = onceFactory();
  once(process, signals, (signal) => {
    shutdown(signal).then(() => {
      if (options.forceExit) {
        process.exit(failed ? 1 : 0);
      }
    }).catch((error) => {
      process.exit(1);
    });
  });
  function isFunction(functionToCheck) {
    const getType = Object.prototype.toString.call(functionToCheck);
    return /^\[object\s([A-Za-z]+)?Function]$/.test(getType);
  }
  function destroy(socket, force = false) {
    if (socket._isIdle && isShuttingDown || force) {
      socket.destroy();
      if (socket.server instanceof http.Server) {
        delete connections[socket._connectionId];
      } else {
        delete secureConnections[socket._connectionId];
      }
    }
  }
  function destroyAllConnections(force = false) {
    for (const key of Object.keys(connections)) {
      const socket = connections[key];
      const serverResponse = socket._httpMessage;
      if (serverResponse && !force) {
        if (!serverResponse.headersSent) {
          serverResponse.setHeader("connection", "close");
        }
      } else {
        destroy(socket);
      }
    }
    for (const key of Object.keys(secureConnections)) {
      const socket = secureConnections[key];
      const serverResponse = socket._httpMessage;
      if (serverResponse && !force) {
        if (!serverResponse.headersSent) {
          serverResponse.setHeader("connection", "close");
        }
      } else {
        destroy(socket);
      }
    }
  }
  server.on("request", (req, res) => {
    req.socket._isIdle = false;
    if (isShuttingDown && !res.headersSent) {
      res.setHeader("connection", "close");
    }
    res.on("finish", () => {
      req.socket._isIdle = true;
      destroy(req.socket);
    });
  });
  server.on("connection", (socket) => {
    if (isShuttingDown) {
      socket.destroy();
    } else {
      const id = connectionCounter++;
      socket._isIdle = true;
      socket._connectionId = id;
      connections[id] = socket;
      socket.once("close", () => {
        delete connections[socket._connectionId];
      });
    }
  });
  server.on("secureConnection", (socket) => {
    if (isShuttingDown) {
      socket.destroy();
    } else {
      const id = secureConnectionCounter++;
      socket._isIdle = true;
      socket._connectionId = id;
      secureConnections[id] = socket;
      socket.once("close", () => {
        delete secureConnections[socket._connectionId];
      });
    }
  });
  process.on("close", () => {
  });
  function shutdown(sig) {
    function cleanupHttp() {
      destroyAllConnections();
      return new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) {
            return reject(err);
          }
          return resolve(true);
        });
      });
    }
    if (options.development) {
      return process.exit(0);
    }
    function finalHandler() {
      if (!finalRun) {
        finalRun = true;
        if (options.finally && isFunction(options.finally)) {
          options.finally();
        }
      }
      return Promise.resolve();
    }
    function waitForReadyToShutDown(totalNumInterval) {
      if (totalNumInterval === 0) {
        debug(
          `Could not close connections in time (${options.timeout}ms), will forcefully shut down`
        );
        return Promise.resolve(true);
      }
      const allConnectionsClosed = Object.keys(connections).length === 0 && Object.keys(secureConnections).length === 0;
      if (allConnectionsClosed) {
        return Promise.resolve(false);
      }
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(waitForReadyToShutDown(totalNumInterval - 1));
        }, 250);
      });
    }
    if (isShuttingDown) {
      return Promise.resolve();
    }
    return options.preShutdown(sig).then(() => {
      isShuttingDown = true;
      cleanupHttp();
    }).then(() => {
      const pollIterations = options.timeout ? Math.round(options.timeout / 250) : 0;
      return waitForReadyToShutDown(pollIterations);
    }).then((force) => {
      if (force) {
        destroyAllConnections(force);
      }
      return options.onShutdown(sig);
    }).then(finalHandler).catch((error) => {
      const errString = typeof error === "string" ? error : JSON.stringify(error);
      failed = true;
      throw errString;
    });
  }
  function shutdownManual() {
    return shutdown("manual");
  }
  return shutdownManual;
}

function getGracefulShutdownConfig() {
  return {
    disabled: !!process.env.NITRO_SHUTDOWN_DISABLED,
    signals: (process.env.NITRO_SHUTDOWN_SIGNALS || "SIGTERM SIGINT").split(" ").map((s) => s.trim()),
    timeout: Number.parseInt(process.env.NITRO_SHUTDOWN_TIMEOUT || "", 10) || 3e4,
    forceExit: !process.env.NITRO_SHUTDOWN_NO_FORCE_EXIT
  };
}
function setupGracefulShutdown(listener, nitroApp) {
  const shutdownConfig = getGracefulShutdownConfig();
  if (shutdownConfig.disabled) {
    return;
  }
  GracefulShutdown(listener, {
    signals: shutdownConfig.signals.join(" "),
    timeout: shutdownConfig.timeout,
    forceExit: shutdownConfig.forceExit,
    onShutdown: async () => {
      await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.warn("Graceful shutdown timeout, force exiting...");
          resolve();
        }, shutdownConfig.timeout);
        nitroApp.hooks.callHook("close").catch((error) => {
          console.error(error);
        }).finally(() => {
          clearTimeout(timeout);
          resolve();
        });
      });
    }
  });
}

const cert = process.env.NITRO_SSL_CERT;
const key = process.env.NITRO_SSL_KEY;
const nitroApp = useNitroApp();
const server = cert && key ? new Server({ key, cert }, toNodeListener(nitroApp.h3App)) : new Server$1(toNodeListener(nitroApp.h3App));
const port = destr(process.env.NITRO_PORT || process.env.PORT) || 3e3;
const host = process.env.NITRO_HOST || process.env.HOST;
const path = process.env.NITRO_UNIX_SOCKET;
const listener = server.listen(path ? { path } : { port, host }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  const protocol = cert && key ? "https" : "http";
  const addressInfo = listener.address();
  if (typeof addressInfo === "string") {
    console.log(`Listening on unix socket ${addressInfo}`);
    return;
  }
  const baseURL = (useRuntimeConfig().app.baseURL || "").replace(/\/$/, "");
  const url = `${protocol}://${addressInfo.family === "IPv6" ? `[${addressInfo.address}]` : addressInfo.address}:${addressInfo.port}${baseURL}`;
  console.log(`Listening on ${url}`);
});
trapUnhandledNodeErrors();
setupGracefulShutdown(listener, nitroApp);
const nodeServer = {};

export { $fetch as $, withoutTrailingSlash as A, joinRelativeURL as B, defineRenderHandler as C, getQuery as D, getRouteRules as E, getResponseStatus as F, getResponseStatusText as G, useNitroApp as H, readMultipartFormData as I, nodeServer as J, deleteCookie as a, defu as b, createError$1 as c, defineEventHandler as d, sanitizeStatusCode as e, getContext as f, getCookie as g, hasProtocol as h, isScriptProtocol as i, joinURL as j, createHooks as k, createRouter$1 as l, klona as m, getRequestHeader as n, destr as o, parse$1 as p, isEqual as q, readBody as r, setCookie as s, toRouteMatcher as t, useRuntimeConfig as u, hash as v, withQuery as w, getRequestURL as x, parseQuery as y, withTrailingSlash as z };
//# sourceMappingURL=nitro.mjs.map
