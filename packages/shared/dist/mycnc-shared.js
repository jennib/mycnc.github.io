import H, { useState as Ge } from "react";
import { Play as hr, Moon as mr, Sun as pr } from "lucide-react";
import { AlertTriangle as qr, ArrowDown as Jr, ArrowLeft as Kr, ArrowRight as Qr, ArrowUp as et, BookOpen as rt, Camera as tt, CameraOff as nt, CheckCircle as ot, ChevronDown as it, ChevronRight as at, ChevronUp as st, ChevronsLeft as lt, ChevronsRight as ct, Circle as dt, Clock as ut, Code as ft, Code2 as ht, Crosshair as mt, Dock as pt, Download as gt, Eye as vt, FileText as xt, Home as wt, Info as bt, Maximize as yt, Minimize as Et, Minus as Rt, Moon as St, Move as kt, OctagonAlert as jt, Pause as _t, Pencil as Ct, Percent as Tt, PictureInPicture as Ot, Pin as Pt, Play as At, PlayCircle as Gt, Plus as Mt, PlusCircle as Dt, Power as Lt, PowerOff as It, Radio as Ft, Redo as Nt, RefreshCw as Yt, RotateCcw as Wt, RotateCw as Ut, Save as Xt, Search as $t, Send as Vt, Settings as Zt, Square as Bt, Sun as zt, Terminal as Ht, Wrench as qt, Trash2 as Jt, Undo as Kt, Unlock as Qt, Upload as en, Volume2 as rn, VolumeX as tn, X as nn, Zap as on, ZapOff as an, ZoomIn as sn, ZoomOut as ln } from "lucide-react";
var z = { exports: {} }, W = {};
var Te;
function gr() {
  if (Te) return W;
  Te = 1;
  var o = H, p = Symbol.for("react.element"), C = Symbol.for("react.fragment"), x = Object.prototype.hasOwnProperty, R = o.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, d = { key: !0, ref: !0, __self: !0, __source: !0 };
  function T(S, g, k) {
    var u, j = {}, v = null, D = null;
    k !== void 0 && (v = "" + k), g.key !== void 0 && (v = "" + g.key), g.ref !== void 0 && (D = g.ref);
    for (u in g) x.call(g, u) && !d.hasOwnProperty(u) && (j[u] = g[u]);
    if (S && S.defaultProps) for (u in g = S.defaultProps, g) j[u] === void 0 && (j[u] = g[u]);
    return { $$typeof: p, type: S, key: v, ref: D, props: j, _owner: R.current };
  }
  return W.Fragment = C, W.jsx = T, W.jsxs = T, W;
}
var U = {};
var Oe;
function vr() {
  return Oe || (Oe = 1, process.env.NODE_ENV !== "production" && (function() {
    var o = H, p = Symbol.for("react.element"), C = Symbol.for("react.portal"), x = Symbol.for("react.fragment"), R = Symbol.for("react.strict_mode"), d = Symbol.for("react.profiler"), T = Symbol.for("react.provider"), S = Symbol.for("react.context"), g = Symbol.for("react.forward_ref"), k = Symbol.for("react.suspense"), u = Symbol.for("react.suspense_list"), j = Symbol.for("react.memo"), v = Symbol.for("react.lazy"), D = Symbol.for("react.offscreen"), X = Symbol.iterator, _ = "@@iterator";
    function P(e) {
      if (e === null || typeof e != "object")
        return null;
      var r = X && e[X] || e[_];
      return typeof r == "function" ? r : null;
    }
    var b = o.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    function h(e) {
      {
        for (var r = arguments.length, n = new Array(r > 1 ? r - 1 : 0), i = 1; i < r; i++)
          n[i - 1] = arguments[i];
        A("error", e, n);
      }
    }
    function A(e, r, n) {
      {
        var i = b.ReactDebugCurrentFrame, l = i.getStackAddendum();
        l !== "" && (r += "%s", n = n.concat([l]));
        var c = n.map(function(s) {
          return String(s);
        });
        c.unshift("Warning: " + r), Function.prototype.apply.call(console[e], console, c);
      }
    }
    var F = !1, Me = !1, De = !1, Le = !1, Ie = !1, oe;
    oe = Symbol.for("react.module.reference");
    function Fe(e) {
      return !!(typeof e == "string" || typeof e == "function" || e === x || e === d || Ie || e === R || e === k || e === u || Le || e === D || F || Me || De || typeof e == "object" && e !== null && (e.$$typeof === v || e.$$typeof === j || e.$$typeof === T || e.$$typeof === S || e.$$typeof === g || // This needs to include all possible module reference object
      // types supported by any Flight configuration anywhere since
      // we don't know which Flight build this will end up being used
      // with.
      e.$$typeof === oe || e.getModuleId !== void 0));
    }
    function Ne(e, r, n) {
      var i = e.displayName;
      if (i)
        return i;
      var l = r.displayName || r.name || "";
      return l !== "" ? n + "(" + l + ")" : n;
    }
    function ie(e) {
      return e.displayName || "Context";
    }
    function O(e) {
      if (e == null)
        return null;
      if (typeof e.tag == "number" && h("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), typeof e == "function")
        return e.displayName || e.name || null;
      if (typeof e == "string")
        return e;
      switch (e) {
        case x:
          return "Fragment";
        case C:
          return "Portal";
        case d:
          return "Profiler";
        case R:
          return "StrictMode";
        case k:
          return "Suspense";
        case u:
          return "SuspenseList";
      }
      if (typeof e == "object")
        switch (e.$$typeof) {
          case S:
            var r = e;
            return ie(r) + ".Consumer";
          case T:
            var n = e;
            return ie(n._context) + ".Provider";
          case g:
            return Ne(e, e.render, "ForwardRef");
          case j:
            var i = e.displayName || null;
            return i !== null ? i : O(e.type) || "Memo";
          case v: {
            var l = e, c = l._payload, s = l._init;
            try {
              return O(s(c));
            } catch {
              return null;
            }
          }
        }
      return null;
    }
    var G = Object.assign, N = 0, ae, se, le, ce, de, ue, fe;
    function he() {
    }
    he.__reactDisabledLog = !0;
    function Ye() {
      {
        if (N === 0) {
          ae = console.log, se = console.info, le = console.warn, ce = console.error, de = console.group, ue = console.groupCollapsed, fe = console.groupEnd;
          var e = {
            configurable: !0,
            enumerable: !0,
            value: he,
            writable: !0
          };
          Object.defineProperties(console, {
            info: e,
            log: e,
            warn: e,
            error: e,
            group: e,
            groupCollapsed: e,
            groupEnd: e
          });
        }
        N++;
      }
    }
    function We() {
      {
        if (N--, N === 0) {
          var e = {
            configurable: !0,
            enumerable: !0,
            writable: !0
          };
          Object.defineProperties(console, {
            log: G({}, e, {
              value: ae
            }),
            info: G({}, e, {
              value: se
            }),
            warn: G({}, e, {
              value: le
            }),
            error: G({}, e, {
              value: ce
            }),
            group: G({}, e, {
              value: de
            }),
            groupCollapsed: G({}, e, {
              value: ue
            }),
            groupEnd: G({}, e, {
              value: fe
            })
          });
        }
        N < 0 && h("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
      }
    }
    var q = b.ReactCurrentDispatcher, J;
    function $(e, r, n) {
      {
        if (J === void 0)
          try {
            throw Error();
          } catch (l) {
            var i = l.stack.trim().match(/\n( *(at )?)/);
            J = i && i[1] || "";
          }
        return `
` + J + e;
      }
    }
    var K = !1, V;
    {
      var Ue = typeof WeakMap == "function" ? WeakMap : Map;
      V = new Ue();
    }
    function me(e, r) {
      if (!e || K)
        return "";
      {
        var n = V.get(e);
        if (n !== void 0)
          return n;
      }
      var i;
      K = !0;
      var l = Error.prepareStackTrace;
      Error.prepareStackTrace = void 0;
      var c;
      c = q.current, q.current = null, Ye();
      try {
        if (r) {
          var s = function() {
            throw Error();
          };
          if (Object.defineProperty(s.prototype, "props", {
            set: function() {
              throw Error();
            }
          }), typeof Reflect == "object" && Reflect.construct) {
            try {
              Reflect.construct(s, []);
            } catch (y) {
              i = y;
            }
            Reflect.construct(e, [], s);
          } else {
            try {
              s.call();
            } catch (y) {
              i = y;
            }
            e.call(s.prototype);
          }
        } else {
          try {
            throw Error();
          } catch (y) {
            i = y;
          }
          e();
        }
      } catch (y) {
        if (y && i && typeof y.stack == "string") {
          for (var a = y.stack.split(`
`), w = i.stack.split(`
`), f = a.length - 1, m = w.length - 1; f >= 1 && m >= 0 && a[f] !== w[m]; )
            m--;
          for (; f >= 1 && m >= 0; f--, m--)
            if (a[f] !== w[m]) {
              if (f !== 1 || m !== 1)
                do
                  if (f--, m--, m < 0 || a[f] !== w[m]) {
                    var E = `
` + a[f].replace(" at new ", " at ");
                    return e.displayName && E.includes("<anonymous>") && (E = E.replace("<anonymous>", e.displayName)), typeof e == "function" && V.set(e, E), E;
                  }
                while (f >= 1 && m >= 0);
              break;
            }
        }
      } finally {
        K = !1, q.current = c, We(), Error.prepareStackTrace = l;
      }
      var I = e ? e.displayName || e.name : "", M = I ? $(I) : "";
      return typeof e == "function" && V.set(e, M), M;
    }
    function Xe(e, r, n) {
      return me(e, !1);
    }
    function $e(e) {
      var r = e.prototype;
      return !!(r && r.isReactComponent);
    }
    function Z(e, r, n) {
      if (e == null)
        return "";
      if (typeof e == "function")
        return me(e, $e(e));
      if (typeof e == "string")
        return $(e);
      switch (e) {
        case k:
          return $("Suspense");
        case u:
          return $("SuspenseList");
      }
      if (typeof e == "object")
        switch (e.$$typeof) {
          case g:
            return Xe(e.render);
          case j:
            return Z(e.type, r, n);
          case v: {
            var i = e, l = i._payload, c = i._init;
            try {
              return Z(c(l), r, n);
            } catch {
            }
          }
        }
      return "";
    }
    var Y = Object.prototype.hasOwnProperty, pe = {}, ge = b.ReactDebugCurrentFrame;
    function B(e) {
      if (e) {
        var r = e._owner, n = Z(e.type, e._source, r ? r.type : null);
        ge.setExtraStackFrame(n);
      } else
        ge.setExtraStackFrame(null);
    }
    function Ve(e, r, n, i, l) {
      {
        var c = Function.call.bind(Y);
        for (var s in e)
          if (c(e, s)) {
            var a = void 0;
            try {
              if (typeof e[s] != "function") {
                var w = Error((i || "React class") + ": " + n + " type `" + s + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof e[s] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                throw w.name = "Invariant Violation", w;
              }
              a = e[s](r, s, i, n, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
            } catch (f) {
              a = f;
            }
            a && !(a instanceof Error) && (B(l), h("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", i || "React class", n, s, typeof a), B(null)), a instanceof Error && !(a.message in pe) && (pe[a.message] = !0, B(l), h("Failed %s type: %s", n, a.message), B(null));
          }
      }
    }
    var Ze = Array.isArray;
    function Q(e) {
      return Ze(e);
    }
    function Be(e) {
      {
        var r = typeof Symbol == "function" && Symbol.toStringTag, n = r && e[Symbol.toStringTag] || e.constructor.name || "Object";
        return n;
      }
    }
    function ze(e) {
      try {
        return ve(e), !1;
      } catch {
        return !0;
      }
    }
    function ve(e) {
      return "" + e;
    }
    function xe(e) {
      if (ze(e))
        return h("The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.", Be(e)), ve(e);
    }
    var we = b.ReactCurrentOwner, He = {
      key: !0,
      ref: !0,
      __self: !0,
      __source: !0
    }, be, ye;
    function qe(e) {
      if (Y.call(e, "ref")) {
        var r = Object.getOwnPropertyDescriptor(e, "ref").get;
        if (r && r.isReactWarning)
          return !1;
      }
      return e.ref !== void 0;
    }
    function Je(e) {
      if (Y.call(e, "key")) {
        var r = Object.getOwnPropertyDescriptor(e, "key").get;
        if (r && r.isReactWarning)
          return !1;
      }
      return e.key !== void 0;
    }
    function Ke(e, r) {
      typeof e.ref == "string" && we.current;
    }
    function Qe(e, r) {
      {
        var n = function() {
          be || (be = !0, h("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", r));
        };
        n.isReactWarning = !0, Object.defineProperty(e, "key", {
          get: n,
          configurable: !0
        });
      }
    }
    function er(e, r) {
      {
        var n = function() {
          ye || (ye = !0, h("%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", r));
        };
        n.isReactWarning = !0, Object.defineProperty(e, "ref", {
          get: n,
          configurable: !0
        });
      }
    }
    var rr = function(e, r, n, i, l, c, s) {
      var a = {
        // This tag allows us to uniquely identify this as a React Element
        $$typeof: p,
        // Built-in properties that belong on the element
        type: e,
        key: r,
        ref: n,
        props: s,
        // Record the component responsible for creating this element.
        _owner: c
      };
      return a._store = {}, Object.defineProperty(a._store, "validated", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: !1
      }), Object.defineProperty(a, "_self", {
        configurable: !1,
        enumerable: !1,
        writable: !1,
        value: i
      }), Object.defineProperty(a, "_source", {
        configurable: !1,
        enumerable: !1,
        writable: !1,
        value: l
      }), Object.freeze && (Object.freeze(a.props), Object.freeze(a)), a;
    };
    function tr(e, r, n, i, l) {
      {
        var c, s = {}, a = null, w = null;
        n !== void 0 && (xe(n), a = "" + n), Je(r) && (xe(r.key), a = "" + r.key), qe(r) && (w = r.ref, Ke(r, l));
        for (c in r)
          Y.call(r, c) && !He.hasOwnProperty(c) && (s[c] = r[c]);
        if (e && e.defaultProps) {
          var f = e.defaultProps;
          for (c in f)
            s[c] === void 0 && (s[c] = f[c]);
        }
        if (a || w) {
          var m = typeof e == "function" ? e.displayName || e.name || "Unknown" : e;
          a && Qe(s, m), w && er(s, m);
        }
        return rr(e, a, w, l, i, we.current, s);
      }
    }
    var ee = b.ReactCurrentOwner, Ee = b.ReactDebugCurrentFrame;
    function L(e) {
      if (e) {
        var r = e._owner, n = Z(e.type, e._source, r ? r.type : null);
        Ee.setExtraStackFrame(n);
      } else
        Ee.setExtraStackFrame(null);
    }
    var re;
    re = !1;
    function te(e) {
      return typeof e == "object" && e !== null && e.$$typeof === p;
    }
    function Re() {
      {
        if (ee.current) {
          var e = O(ee.current.type);
          if (e)
            return `

Check the render method of \`` + e + "`.";
        }
        return "";
      }
    }
    function nr(e) {
      return "";
    }
    var Se = {};
    function or(e) {
      {
        var r = Re();
        if (!r) {
          var n = typeof e == "string" ? e : e.displayName || e.name;
          n && (r = `

Check the top-level render call using <` + n + ">.");
        }
        return r;
      }
    }
    function ke(e, r) {
      {
        if (!e._store || e._store.validated || e.key != null)
          return;
        e._store.validated = !0;
        var n = or(r);
        if (Se[n])
          return;
        Se[n] = !0;
        var i = "";
        e && e._owner && e._owner !== ee.current && (i = " It was passed a child from " + O(e._owner.type) + "."), L(e), h('Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.', n, i), L(null);
      }
    }
    function je(e, r) {
      {
        if (typeof e != "object")
          return;
        if (Q(e))
          for (var n = 0; n < e.length; n++) {
            var i = e[n];
            te(i) && ke(i, r);
          }
        else if (te(e))
          e._store && (e._store.validated = !0);
        else if (e) {
          var l = P(e);
          if (typeof l == "function" && l !== e.entries)
            for (var c = l.call(e), s; !(s = c.next()).done; )
              te(s.value) && ke(s.value, r);
        }
      }
    }
    function ir(e) {
      {
        var r = e.type;
        if (r == null || typeof r == "string")
          return;
        var n;
        if (typeof r == "function")
          n = r.propTypes;
        else if (typeof r == "object" && (r.$$typeof === g || // Note: Memo only checks outer props here.
        // Inner props are checked in the reconciler.
        r.$$typeof === j))
          n = r.propTypes;
        else
          return;
        if (n) {
          var i = O(r);
          Ve(n, e.props, "prop", i, e);
        } else if (r.PropTypes !== void 0 && !re) {
          re = !0;
          var l = O(r);
          h("Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?", l || "Unknown");
        }
        typeof r.getDefaultProps == "function" && !r.getDefaultProps.isReactClassApproved && h("getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead.");
      }
    }
    function ar(e) {
      {
        for (var r = Object.keys(e.props), n = 0; n < r.length; n++) {
          var i = r[n];
          if (i !== "children" && i !== "key") {
            L(e), h("Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.", i), L(null);
            break;
          }
        }
        e.ref !== null && (L(e), h("Invalid attribute `ref` supplied to `React.Fragment`."), L(null));
      }
    }
    var _e = {};
    function Ce(e, r, n, i, l, c) {
      {
        var s = Fe(e);
        if (!s) {
          var a = "";
          (e === void 0 || typeof e == "object" && e !== null && Object.keys(e).length === 0) && (a += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.");
          var w = nr();
          w ? a += w : a += Re();
          var f;
          e === null ? f = "null" : Q(e) ? f = "array" : e !== void 0 && e.$$typeof === p ? (f = "<" + (O(e.type) || "Unknown") + " />", a = " Did you accidentally export a JSX literal instead of a component?") : f = typeof e, h("React.jsx: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s", f, a);
        }
        var m = tr(e, r, n, l, c);
        if (m == null)
          return m;
        if (s) {
          var E = r.children;
          if (E !== void 0)
            if (i)
              if (Q(E)) {
                for (var I = 0; I < E.length; I++)
                  je(E[I], e);
                Object.freeze && Object.freeze(E);
              } else
                h("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
            else
              je(E, e);
        }
        if (Y.call(r, "key")) {
          var M = O(e), y = Object.keys(r).filter(function(fr) {
            return fr !== "key";
          }), ne = y.length > 0 ? "{key: someKey, " + y.join(": ..., ") + ": ...}" : "{key: someKey}";
          if (!_e[M + ne]) {
            var ur = y.length > 0 ? "{" + y.join(": ..., ") + ": ...}" : "{}";
            h(`A props object containing a "key" prop is being spread into JSX:
  let props = %s;
  <%s {...props} />
React keys must be passed directly to JSX without using spread:
  let props = %s;
  <%s key={someKey} {...props} />`, ne, M, ur, M), _e[M + ne] = !0;
          }
        }
        return e === x ? ar(m) : ir(m), m;
      }
    }
    function sr(e, r, n) {
      return Ce(e, r, n, !0);
    }
    function lr(e, r, n) {
      return Ce(e, r, n, !1);
    }
    var cr = lr, dr = sr;
    U.Fragment = x, U.jsx = cr, U.jsxs = dr;
  })()), U;
}
var Pe;
function xr() {
  return Pe || (Pe = 1, process.env.NODE_ENV === "production" ? z.exports = gr() : z.exports = vr()), z.exports;
}
var t = xr();
const Ae = ({ children: o, content: p, title: C }) => {
  const [x, R] = Ge(!1), d = H.useRef(), T = () => {
    d.current = setTimeout(() => R(!0), 300);
  }, S = () => {
    d.current && clearTimeout(d.current), R(!1);
  };
  return /* @__PURE__ */ t.jsxs("span", { className: "relative inline-block", onMouseEnter: T, onMouseLeave: S, children: [
    o,
    x && /* @__PURE__ */ t.jsxs("div", { className: "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs bg-surface/90 backdrop-blur-md border border-white/10 text-text-primary text-sm rounded-lg shadow-xl z-50 p-3 animate-in fade-in zoom-in-95 duration-200", children: [
      C && /* @__PURE__ */ t.jsx("h4", { className: "font-bold mb-1 border-b border-white/10 pb-1 text-primary", children: C }),
      typeof p == "string" ? /* @__PURE__ */ t.jsx("p", { className: "text-text-secondary", children: p }) : p,
      /* @__PURE__ */ t.jsx("div", { className: "absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-surface/90" })
    ] })
  ] });
}, Sr = (o) => /* @__PURE__ */ t.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...o, children: [
  /* @__PURE__ */ t.jsx("path", { d: "M12 2v14" }),
  /* @__PURE__ */ t.jsx("path", { d: "m7 9 5 5 5-5" }),
  /* @__PURE__ */ t.jsx("path", { d: "M3 20h18" })
] }), kr = (o) => /* @__PURE__ */ t.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...o, children: [
  /* @__PURE__ */ t.jsx("path", { d: "M21 3v18" }),
  /* @__PURE__ */ t.jsx("path", { d: "M2 12h15" }),
  /* @__PURE__ */ t.jsx("path", { d: "m13 8 4 4-4 4" })
] }), jr = (o) => /* @__PURE__ */ t.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...o, children: [
  /* @__PURE__ */ t.jsx("path", { d: "M3 3h18" }),
  /* @__PURE__ */ t.jsx("path", { d: "M12 22V7" }),
  /* @__PURE__ */ t.jsx("path", { d: "m8 11 4-4 4 4" })
] }), _r = (o) => /* @__PURE__ */ t.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...o, children: [
  /* @__PURE__ */ t.jsx("path", { d: "M21 3v18" }),
  /* @__PURE__ */ t.jsx("path", { d: "M3 21h18" }),
  /* @__PURE__ */ t.jsx("path", { d: "M3 3 17 17" }),
  /* @__PURE__ */ t.jsx("path", { d: "m13 17 4 4-4-4" }),
  /* @__PURE__ */ t.jsx("circle", { cx: "19", cy: "19", r: "2" })
] }), Cr = (o) => /* @__PURE__ */ t.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...o, children: [
  /* @__PURE__ */ t.jsx("path", { d: "m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", transform: "translate(0, 0) scale(0.8)" }),
  /* @__PURE__ */ t.jsx("text", { x: "20", y: "20", textAnchor: "middle", fontSize: "12", fontWeight: "bold", fill: "currentColor", stroke: "none", children: "X" })
] }), Tr = (o) => /* @__PURE__ */ t.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...o, children: [
  /* @__PURE__ */ t.jsx("path", { d: "m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", transform: "translate(0, 0) scale(0.8)" }),
  /* @__PURE__ */ t.jsx("text", { x: "20", y: "20", textAnchor: "middle", fontSize: "12", fontWeight: "bold", fill: "currentColor", stroke: "none", children: "Y" })
] }), Or = (o) => /* @__PURE__ */ t.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...o, children: [
  /* @__PURE__ */ t.jsx("path", { d: "m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", transform: "translate(0, 0) scale(0.8)" }),
  /* @__PURE__ */ t.jsx("text", { x: "20", y: "20", textAnchor: "middle", fontSize: "12", fontWeight: "bold", fill: "currentColor", stroke: "none", children: "Z" })
] }), Pr = (o) => /* @__PURE__ */ t.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...o, children: [
  /* @__PURE__ */ t.jsx("path", { d: "m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", transform: "translate(-2, -2) scale(0.8)" }),
  /* @__PURE__ */ t.jsx("text", { x: "20", y: "22", textAnchor: "end", fontSize: "10", fontWeight: "bold", stroke: "none", fill: "currentColor", children: "XY" })
] }), Ar = (o) => /* @__PURE__ */ t.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...o, children: [
  /* @__PURE__ */ t.jsxs("g", { transform: "scale(0.8)", children: [
    /* @__PURE__ */ t.jsx("circle", { cx: "12", cy: "12", r: "10" }),
    /* @__PURE__ */ t.jsx("line", { x1: "22", y1: "12", x2: "18", y2: "12" }),
    /* @__PURE__ */ t.jsx("line", { x1: "6", y1: "12", x2: "2", y2: "12" }),
    /* @__PURE__ */ t.jsx("line", { x1: "12", y1: "6", x2: "12", y2: "2" }),
    /* @__PURE__ */ t.jsx("line", { x1: "12", y1: "22", x2: "12", y2: "18" })
  ] }),
  /* @__PURE__ */ t.jsx("text", { x: "22", y: "22", textAnchor: "end", fontSize: "10", fontWeight: "bold", stroke: "none", fill: "currentColor", children: "XY" })
] }), Gr = (o) => /* @__PURE__ */ t.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...o, children: [
  /* @__PURE__ */ t.jsxs("g", { transform: "scale(0.8)", children: [
    /* @__PURE__ */ t.jsx("circle", { cx: "12", cy: "12", r: "10" }),
    /* @__PURE__ */ t.jsx("line", { x1: "22", y1: "12", x2: "18", y2: "12" }),
    /* @__PURE__ */ t.jsx("line", { x1: "6", y1: "12", x2: "2", y2: "12" }),
    /* @__PURE__ */ t.jsx("line", { x1: "12", y1: "6", x2: "12", y2: "2" }),
    /* @__PURE__ */ t.jsx("line", { x1: "12", y1: "22", x2: "12", y2: "18" })
  ] }),
  /* @__PURE__ */ t.jsx("text", { x: "22", y: "22", textAnchor: "end", fontSize: "12", fontWeight: "bold", stroke: "none", fill: "currentColor", children: "Z" })
] }), Mr = (o) => /* @__PURE__ */ t.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...o, children: [
  /* @__PURE__ */ t.jsxs("g", { transform: "scale(0.8)", children: [
    /* @__PURE__ */ t.jsx("circle", { cx: "12", cy: "12", r: "10" }),
    /* @__PURE__ */ t.jsx("line", { x1: "22", y1: "12", x2: "18", y2: "12" }),
    /* @__PURE__ */ t.jsx("line", { x1: "6", y1: "12", x2: "2", y2: "12" }),
    /* @__PURE__ */ t.jsx("line", { x1: "12", y1: "6", x2: "12", y2: "2" }),
    /* @__PURE__ */ t.jsx("line", { x1: "12", y1: "22", x2: "12", y2: "18" })
  ] }),
  /* @__PURE__ */ t.jsx("text", { x: "22", y: "22", textAnchor: "end", fontSize: "12", fontWeight: "bold", stroke: "none", fill: "currentColor", children: "X" })
] }), Dr = (o) => /* @__PURE__ */ t.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...o, children: [
  /* @__PURE__ */ t.jsxs("g", { transform: "scale(0.8)", children: [
    /* @__PURE__ */ t.jsx("circle", { cx: "12", cy: "12", r: "10" }),
    /* @__PURE__ */ t.jsx("line", { x1: "22", y1: "12", x2: "18", y2: "12" }),
    /* @__PURE__ */ t.jsx("line", { x1: "6", y1: "12", x2: "2", y2: "12" }),
    /* @__PURE__ */ t.jsx("line", { x1: "12", y1: "6", x2: "12", y2: "2" }),
    /* @__PURE__ */ t.jsx("line", { x1: "12", y1: "22", x2: "12", y2: "18" })
  ] }),
  /* @__PURE__ */ t.jsx("text", { x: "22", y: "22", textAnchor: "end", fontSize: "12", fontWeight: "bold", stroke: "none", fill: "currentColor", children: "Y" })
] }), Lr = (o) => /* @__PURE__ */ t.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...o, children: [
  /* @__PURE__ */ t.jsx("circle", { cx: "12", cy: "12", r: "10" }),
  /* @__PURE__ */ t.jsx("path", { d: "M12 18a6 6 0 0 0 0-12v12z" })
] }), wr = {
  // G-Codes
  G0: { name: "Rapid Move", desc: "Moves at maximum speed to a specified point. Used for non-cutting moves." },
  G1: { name: "Linear Move", desc: "Moves in a straight line at a specified feed rate (F). Used for cutting." },
  G2: { name: "Clockwise Arc", desc: "Creates a clockwise circular or helical motion." },
  G3: { name: "Counter-Clockwise Arc", desc: "Creates a counter-clockwise circular or helical motion." },
  G4: { name: "Dwell", desc: "Pauses the machine for a specified amount of time (P)." },
  G10: { name: "Set Work Coordinate Offset", desc: "Sets the work coordinate system offsets." },
  G17: { name: "XY Plane Select", desc: "Sets the active plane for circular interpolation to XY." },
  G18: { name: "XZ Plane Select", desc: "Sets the active plane for circular interpolation to XZ." },
  G19: { name: "YZ Plane Select", desc: "Sets the active plane for circular interpolation to YZ." },
  G20: { name: "Inches for Units", desc: "Sets the machine units to inches." },
  G21: { name: "Millimeters for Units", desc: "Sets the machine units to millimeters." },
  G28: { name: "Return to Home", desc: "Returns the machine to its home position (machine zero)." },
  G30: { name: "Return to Secondary Home", desc: "Returns to a secondary, user-defined home position." },
  G53: { name: "Move in Machine Coordinates", desc: "Temporarily overrides work offsets to move in the machine's native coordinate system." },
  G54: { name: "Work Coordinate System 1", desc: "Selects the first work coordinate system (WCS)." },
  G55: { name: "Work Coordinate System 2", desc: "Selects the second work coordinate system (WCS)." },
  G90: { name: "Absolute Positioning", desc: "Interprets all coordinates as absolute positions from the origin." },
  G91: { name: "Incremental Positioning", desc: "Interprets all coordinates as relative distances from the current position." },
  G92: { name: "Set Position", desc: "Sets the current position to a specified value, creating a temporary offset." },
  G94: { name: "Units per Minute Feed Rate", desc: "Sets the feed rate mode to units per minute." },
  // M-Codes
  M0: { name: "Program Stop", desc: "Stops the program. Requires user intervention to continue." },
  M1: { name: "Optional Stop", desc: "Stops the program if the optional stop switch on the machine is enabled." },
  M2: { name: "End of Program", desc: "Ends the program and resets the machine." },
  M3: { name: "Spindle On, Clockwise", desc: "Starts the spindle rotating clockwise at a specified speed (S)." },
  M4: { name: "Spindle On, Counter-Clockwise", desc: "Starts the spindle rotating counter-clockwise at a specified speed (S)." },
  M5: { name: "Spindle Stop", desc: "Stops the spindle from rotating." },
  M6: { name: "Tool Change", desc: "Initiates an automatic tool change sequence." },
  M8: { name: "Coolant On (Flood)", desc: "Turns on the flood coolant system." },
  M9: { name: "Coolant Off", desc: "Turns off all coolant systems." },
  M30: { name: "Program End and Reset", desc: "Ends the program and resets to the beginning. Similar to M2." }
}, br = {
  X: "X-Axis Coordinate",
  Y: "Y-Axis Coordinate",
  Z: "Z-Axis Coordinate",
  F: "Feed Rate (speed of cutting motion)",
  S: "Spindle Speed (in RPM)",
  I: "Arc Center X-offset (for G2/G3)",
  J: "Arc Center Y-offset (for G2/G3)",
  P: "Dwell Time or Parameter for G10/G92",
  T: "Tool Number (for M6)"
}, Ir = ({ line: o, lineNumber: p, isExecuted: C, isCurrent: x, isHovered: R, onRunFromHere: d, isActionable: T, onMouseEnter: S, onMouseLeave: g }) => {
  const k = [];
  let u = 0;
  const j = /([GgMm]\d+(?:\.\d+)?)|([XxYyZzIiJjFfSsPpTt]\s*[-+]?\d+(?:\.\d+)?)|(;.*)|(\(.*\))/g;
  let v;
  for (; (v = j.exec(o)) !== null; ) {
    v.index > u && k.push(o.substring(u, v.index));
    const _ = v[0], P = _.toUpperCase();
    let b = null;
    if (v[1]) {
      const h = P.match(/[GgMm]\d+/), A = h ? h[0] : P, F = wr[A];
      F ? b = /* @__PURE__ */ t.jsx(Ae, { title: `${A}: ${F.name}`, content: F.desc, children: /* @__PURE__ */ t.jsx("span", { className: "text-purple-400 font-bold cursor-help", children: _ }) }, u) : b = /* @__PURE__ */ t.jsx("span", { className: "text-purple-400 font-bold", children: _ });
    } else if (v[2]) {
      const h = P[0], A = br[h];
      A ? b = /* @__PURE__ */ t.jsx(Ae, { content: A, children: /* @__PURE__ */ t.jsx("span", { className: "text-green-400 cursor-help", children: _ }) }, u) : b = /* @__PURE__ */ t.jsx("span", { className: "text-green-400", children: _ });
    } else (v[3] || v[4]) && (b = /* @__PURE__ */ t.jsx("span", { className: "text-slate-500", children: _ }));
    b && k.push(b), u = v.index + _.length;
  }
  u < o.length && k.push(o.substring(u));
  const D = `flex group rounded-sm transition-colors duration-100 
        ${x ? "bg-primary/30" : R ? "bg-white/10" : C ? "bg-primary/10" : ""}`, X = `w-12 text-right pr-2 select-none flex-shrink-0 flex items-center justify-end ${x ? "text-accent-red font-bold" : "text-text-secondary"}`;
  return /* @__PURE__ */ t.jsxs("div", { className: D, onMouseEnter: S, onMouseLeave: g, children: [
    /* @__PURE__ */ t.jsxs("div", { className: X, children: [
      /* @__PURE__ */ t.jsx(
        "button",
        {
          onClick: () => d(p),
          disabled: !T,
          className: "mr-1 p-0.5 rounded opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:opacity-0 transition-opacity text-primary hover:bg-primary/20",
          title: `Run from line ${p}`,
          children: /* @__PURE__ */ t.jsx(hr, { className: "w-3 h-3" })
        }
      ),
      p
    ] }),
    /* @__PURE__ */ t.jsx("code", { className: "whitespace-pre", children: k.map((_, P) => /* @__PURE__ */ t.jsx(H.Fragment, { children: _ }, P)) })
  ] });
}, Fr = ({ isLightMode: o, onToggle: p }) => /* @__PURE__ */ t.jsx(
  "button",
  {
    onClick: p,
    title: o ? "Switch to Dark Mode" : "Switch to Light Mode",
    className: "p-2 rounded-md bg-secondary text-text-primary hover:bg-secondary-focus focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface",
    children: o ? /* @__PURE__ */ t.jsx(mr, { className: "w-5 h-5" }) : /* @__PURE__ */ t.jsx(pr, { className: "w-5 h-5" })
  }
), Nr = ({ tabs: o, defaultTab: p, className: C = "" }) => {
  const [x, R] = Ge(p || o[0]?.id);
  return /* @__PURE__ */ t.jsxs("div", { className: `flex flex-col h-full ${C}`, children: [
    /* @__PURE__ */ t.jsx("div", { className: "flex border-b border-white/20 bg-surface/80 backdrop-blur-md rounded-t-xl overflow-hidden flex-shrink-0 mx-2 mt-2", children: o.map((d) => /* @__PURE__ */ t.jsxs(
      "button",
      {
        onClick: () => R(d.id),
        className: `flex items-center gap-2 px-3 py-2 text-sm font-semibold transition-all border-b-2 flex-1 justify-center ${x === d.id ? "border-primary bg-primary/20 text-primary shadow-[inset_0_-2px_4px_rgba(0,0,0,0.1)]" : "border-transparent text-text-secondary hover:bg-white/10 hover:text-text-primary"}`,
        children: [
          d.icon && /* @__PURE__ */ t.jsx("span", { className: `w-4 h-4 ${x === d.id ? "text-primary" : "opacity-70"}`, children: d.icon }),
          d.label
        ]
      },
      d.id
    )) }),
    /* @__PURE__ */ t.jsx("div", { className: "flex-grow overflow-hidden relative bg-surface/60 backdrop-blur-md rounded-b-xl mx-2 mb-2 border-x border-b border-white/20 shadow-inner", children: o.map((d) => /* @__PURE__ */ t.jsx(
      "div",
      {
        className: "absolute inset-0 p-2",
        style: { display: x === d.id ? "block" : "none" },
        children: d.content
      },
      d.id
    )) })
  ] });
};
var yr = /* @__PURE__ */ ((o) => (o.Idle = "idle", o.Running = "running", o.Paused = "paused", o.Stopped = "stopped", o.Complete = "complete", o))(yr || {});
const Yr = {
  selectedDeviceId: "",
  selectedAudioDeviceId: "",
  volume: 0.5,
  isMuted: !0
}, Wr = {
  1: { name: "Hard limit", desc: "A limit switch was triggered. Usually due to machine travel limits.", resolution: 'Check for obstructions. The machine may need to be moved off the switch manually. Use the "$X" command to unlock after clearing the issue, then perform a homing cycle ($H).' },
  2: { name: "G-code motion command error", desc: "The G-code motion target is invalid or exceeds machine travel limits.", resolution: 'Check your G-code file for errors near the last executed line. Use the "$X" command to unlock.' },
  3: { name: "Reset while in motion", desc: "The reset button was pressed while the machine was moving.", resolution: 'This is expected. Use "$X" to unlock the machine and resume work.' },
  4: { name: "Probe fail", desc: "The probing cycle failed to make contact or the probe is already triggered.", resolution: 'Check your probe wiring and ensure it is properly positioned. Use the "$X" to unlock.' },
  5: { name: "Probe fail, travel error", desc: "The probing cycle failed to clear the probe switch.", resolution: 'Check probe wiring and setup. The machine may require a soft-reset (E-STOP). Use "$X" to unlock.' },
  8: { name: "Homing fail, pull-off", desc: "The homing cycle failed because the machine couldn't move off the limit switches.", resolution: 'Check for mechanical issues or obstructions. Use "$X" to unlock.' },
  9: { name: "Homing fail, not found", desc: "The homing cycle failed because the limit switches were not triggered.", resolution: 'Check limit switch wiring and functionality. Use "$X" to unlock.' },
  default: { name: "Unknown Alarm", desc: "An unspecified alarm has occurred.", resolution: 'Try unlocking with "$X". If that fails, a soft-reset (E-STOP button) may be required.' }
}, Ur = {
  1: "G-code words consist of a letter and a value. Letter was not found.",
  2: "Numeric value format is not valid or missing an expected value.",
  3: "Grbl '$' system command was not recognized or supported.",
  4: "Negative value received for an expected positive value.",
  5: "Homing cycle is not enabled via settings.",
  6: "Minimum step pulse time must be greater than 3usec.",
  7: "EEPROM read failed. Reset and restore factory settings.",
  8: "Grbl not in idle state. Commands cannot be executed.",
  9: "G-code locked out during alarm or jog state.",
  10: "Soft limits cannot be enabled without homing being enabled.",
  11: "Max characters per line exceeded. Line was not processed.",
  12: "Grbl setting value exceeds the maximum step rate.",
  13: "Safety door was detected as opened and door state initiated.",
  14: "Build info or startup line exceeded EEPROM line length limit.",
  15: "Jog target exceeds machine travel. Command ignored.",
  16: "Jog command with no '=' or contains prohibited g-code.",
  17: "Laser mode requires PWM output.",
  20: "Unsupported or invalid g-code command found in block.",
  21: "More than one g-code command from same modal group found in block.",
  22: "Feed rate has not been set or is undefined.",
  23: "G-code command in block requires an integer value.",
  24: "Two g-code commands that both require the use of the XYZ axis words were detected in the block.",
  25: "A G-code word was repeated in the block.",
  26: "A G-code command implicitly or explicitly requires XYZ axis words in the block, but none were detected.",
  27: "N-line number value is not within the valid range of 1 - 9,999,999.",
  28: "A G-code command was sent, but is missing some required P or L value words in the line.",
  29: "Grbl supports six work coordinate systems G54-G59. G59.1, G59.2, and G59.3 are not supported.",
  30: "The G53 G-code command requires either a G0 or G1 motion mode to be active. A different motion was active.",
  31: "There are unused axis words in the block and G80 motion mode cancel is active.",
  32: "A G2 or G3 arc was commanded but there is no XYZ axis word in the selected plane to trace the arc.",
  33: "The motion command has an invalid target. G2, G3, and G38.2 generates this error.",
  34: "A G2 or G3 arc, traced with the radius definition, had a mathematical error when computing the arc geometry. Try either breaking up the arc into multiple smaller arcs or turning on calculated arcs.",
  35: "A G2 or G3 arc, traced with the offset definition, is missing the I or J router words in the selected plane to trace the arc.",
  36: "There are unused axis words in the block and G80 motion mode cancel is active.",
  37: "The G43.1 dynamic tool length offset command cannot apply an offset to an axis other than its configured axis.",
  38: "Tool number greater than max supported value."
}, Xr = [
  { name: "Go to WCS Zero", commands: ["G90", "G0 X0 Y0"] },
  { name: "Safe Z & WCS Zero", commands: ["G90", "G0 Z10", "G0 X0 Y0"] },
  { name: "Spindle On (1k RPM)", commands: ["M3 S1000"] },
  { name: "Spindle Off", commands: ["M5"] },
  { name: "Go to G54 Zero", commands: ["G54 G0 X0 Y0"] },
  { name: "Reset All Offsets", commands: ["G92.1"] }
], $r = [
  { id: 1, name: '1/8" Flat Endmill', diameter: 3.175 },
  { id: 2, name: '1/4" Flat Endmill', diameter: 6.35 },
  { id: 3, name: "60 Degree V-Bit", diameter: 12.7 },
  { id: 4, name: "90 Degree V-Bit", diameter: 12.7 }
], Vr = {
  controllerType: "grbl",
  workArea: { x: 300, y: 300, z: 80 },
  jogFeedRate: 1e3,
  spindle: { min: 0, max: 12e3, warmupDelay: 0 },
  probe: { xOffset: 3, yOffset: 3, zOffset: 15, feedRate: 25, probeTravelDistance: 20 },
  scripts: {
    startup: ["G21", "G90"].join(`
`),
    // Set units to mm, absolute positioning
    toolChange: ["M5", "G0 Z10"].join(`
`),
    // Stop spindle, raise Z
    shutdown: ["M5", "G0 X0 Y0"].join(`
`),
    // Stop spindle, go to WCS zero
    jobPause: "M5",
    // Stop spindle on pause
    jobResume: "",
    // No default resume script, spindle state is restored by logic
    jobStop: "M5"
    // Stop spindle on graceful stop
  }
}, Zr = {
  surfacing: { width: 100, length: 100, depth: -1, stepover: 40, feed: 800, spindle: 8e3, safeZ: 5, startX: 0, startY: 0, toolId: null, direction: "horizontal" },
  drilling: { drillType: "single", depth: -5, peck: 2, retract: 2, feed: 150, spindle: 8e3, safeZ: 5, singleX: 10, singleY: 10, rectCols: 4, rectRows: 3, rectSpacingX: 25, rectSpacingY: 20, rectStartX: 10, rectStartY: 10, circCenterX: 50, circCenterY: 50, circRadius: 40, circHoles: 6, circStartAngle: 0, toolId: null },
  bore: { centerX: 50, centerY: 50, holeDiameter: 20, holeDepth: -15, counterboreEnabled: !0, cbDiameter: 30, cbDepth: -5, depthPerPass: 2, stepover: 40, feed: 400, plungeFeed: 150, spindle: 8e3, safeZ: 5, toolId: null },
  pocket: { shape: "rect", width: 80, length: 50, cornerRadius: 5, diameter: 60, depth: -10, depthPerPass: 2, stepover: 40, feed: 500, plungeFeed: 150, spindle: 8e3, safeZ: 5, toolId: null },
  profile: { shape: "rect", width: 80, length: 50, cornerRadius: 10, diameter: 60, depth: -12, depthPerPass: 3, cutSide: "outside", tabsEnabled: !0, numTabs: 4, tabWidth: 6, tabHeight: 2, feed: 600, spindle: 9e3, safeZ: 5, toolId: null },
  slot: { type: "straight", slotWidth: 6, depth: -5, depthPerPass: 2, feed: 400, spindle: 8e3, safeZ: 5, startX: 10, startY: 10, endX: 90, endY: 20, centerX: 50, centerY: 50, radius: 40, startAngle: 45, endAngle: 135, toolId: null },
  text: { text: "HELLO", font: "Sans-serif Stick", height: 10, spacing: 2, startX: 10, startY: 10, alignment: "left", depth: -0.5, feed: 300, spindle: 1e4, safeZ: 5, toolId: null },
  thread: { type: "internal", hand: "right", diameter: 10, pitch: 1, depth: 10, feed: 200, spindle: 1e4, safeZ: 5, toolId: null },
  relief: { imageDataUrl: null, invert: !1, width: 100, length: 100, maxDepth: -5, zSafe: 5, roughingEnabled: !0, roughingToolId: null, roughingStepdown: 2, roughingStepover: 40, roughingStockToLeave: 0.5, roughingFeed: 800, roughingSpindle: 8e3, finishingEnabled: !0, finishingToolId: null, finishingStepover: 10, finishingAngle: 0, finishingFeed: 1e3, finishingSpindle: 1e4, operation: "both", keepAspectRatio: !0, gamma: 1, contrast: 1 }
}, Br = {
  RESET: "",
  // Ctrl-X
  STATUS_REPORT: "?",
  CYCLE_START: "~",
  FEED_HOLD: "!",
  SAFETY_DOOR: "",
  JOG_CANCEL: "",
  FEED_OVR_RESET: "",
  FEED_OVR_COARSE_PLUS: "",
  FEED_OVR_COARSE_MINUS: "",
  FEED_OVR_FINE_PLUS: "",
  FEED_OVR_FINE_MINUS: "",
  RAPID_OVR_RESET: "",
  RAPID_OVR_MEDIUM: "",
  RAPID_OVR_LOW: "",
  SPINDLE_OVR_RESET: "",
  SPINDLE_OVR_COARSE_PLUS: "",
  SPINDLE_OVR_COARSE_MINUS: "",
  SPINDLE_OVR_FINE_PLUS: "",
  SPINDLE_OVR_FINE_MINUS: "",
  TOGGLE_SPINDLE_STOP: "",
  TOGGLE_FLOOD_COOLANT: " ",
  TOGGLE_MIST_COOLANT: "¡"
};
export {
  qr as AlertTriangle,
  Jr as ArrowDown,
  Kr as ArrowLeft,
  Qr as ArrowRight,
  et as ArrowUp,
  rt as BookOpen,
  tt as Camera,
  nt as CameraOff,
  ot as CheckCircle,
  it as ChevronDown,
  at as ChevronRight,
  st as ChevronUp,
  lt as ChevronsLeft,
  ct as ChevronsRight,
  dt as Circle,
  ut as Clock,
  ft as Code,
  ht as Code2,
  Lr as Contrast,
  mt as Crosshair,
  Mr as CrosshairX,
  Ar as CrosshairXY,
  Dr as CrosshairY,
  Gr as CrosshairZ,
  Zr as DEFAULT_GENERATOR_SETTINGS,
  Xr as DEFAULT_MACROS,
  Vr as DEFAULT_SETTINGS,
  $r as DEFAULT_TOOLS,
  Yr as DEFAULT_WEBCAM_SETTINGS,
  pt as Dock,
  gt as Download,
  vt as Eye,
  xt as FileText,
  Ir as GCodeLine,
  Wr as GRBL_ALARM_CODES,
  Ur as GRBL_ERROR_CODES,
  Br as GRBL_REALTIME_COMMANDS,
  wt as Home,
  Cr as HomeX,
  Pr as HomeXY,
  Tr as HomeY,
  Or as HomeZ,
  bt as Info,
  yr as JobStatus,
  yt as Maximize,
  Et as Minimize,
  Rt as Minus,
  St as Moon,
  kt as Move,
  jt as OctagonAlert,
  _t as Pause,
  Ct as Pencil,
  Tt as Percent,
  Ot as PictureInPicture,
  Pt as Pin,
  At as Play,
  Gt as PlayCircle,
  Mt as Plus,
  Dt as PlusCircle,
  Lt as Power,
  It as PowerOff,
  Sr as Probe,
  kr as ProbeX,
  _r as ProbeXY,
  jr as ProbeY,
  Ft as Radio,
  Nt as Redo,
  Yt as RefreshCw,
  Wt as RotateCcw,
  Ut as RotateCw,
  Xt as Save,
  $t as Search,
  Vt as Send,
  Zt as Settings,
  Bt as Square,
  zt as Sun,
  Nr as Tabs,
  Ht as Terminal,
  Fr as ThemeToggle,
  qt as Tool,
  Jt as Trash2,
  Kt as Undo,
  Qt as Unlock,
  en as Upload,
  rn as Volume2,
  tn as VolumeX,
  nn as X,
  on as Zap,
  an as ZapOff,
  sn as ZoomIn,
  ln as ZoomOut
};
