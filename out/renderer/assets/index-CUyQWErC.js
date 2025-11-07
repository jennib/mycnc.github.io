function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var react = { exports: {} };
var react_production = {};
var hasRequiredReact_production;
function requireReact_production() {
  if (hasRequiredReact_production) return react_production;
  hasRequiredReact_production = 1;
  var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = Symbol.for("react.activity"), MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
  function getIteratorFn(maybeIterable) {
    if (null === maybeIterable || "object" !== typeof maybeIterable) return null;
    maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
    return "function" === typeof maybeIterable ? maybeIterable : null;
  }
  var ReactNoopUpdateQueue = {
    isMounted: function() {
      return false;
    },
    enqueueForceUpdate: function() {
    },
    enqueueReplaceState: function() {
    },
    enqueueSetState: function() {
    }
  }, assign = Object.assign, emptyObject = {};
  function Component(props, context, updater) {
    this.props = props;
    this.context = context;
    this.refs = emptyObject;
    this.updater = updater || ReactNoopUpdateQueue;
  }
  Component.prototype.isReactComponent = {};
  Component.prototype.setState = function(partialState, callback) {
    if ("object" !== typeof partialState && "function" !== typeof partialState && null != partialState)
      throw Error(
        "takes an object of state variables to update or a function which returns an object of state variables."
      );
    this.updater.enqueueSetState(this, partialState, callback, "setState");
  };
  Component.prototype.forceUpdate = function(callback) {
    this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
  };
  function ComponentDummy() {
  }
  ComponentDummy.prototype = Component.prototype;
  function PureComponent(props, context, updater) {
    this.props = props;
    this.context = context;
    this.refs = emptyObject;
    this.updater = updater || ReactNoopUpdateQueue;
  }
  var pureComponentPrototype = PureComponent.prototype = new ComponentDummy();
  pureComponentPrototype.constructor = PureComponent;
  assign(pureComponentPrototype, Component.prototype);
  pureComponentPrototype.isPureReactComponent = true;
  var isArrayImpl = Array.isArray;
  function noop() {
  }
  var ReactSharedInternals = { H: null, A: null, T: null, S: null }, hasOwnProperty = Object.prototype.hasOwnProperty;
  function ReactElement(type, key, props) {
    var refProp = props.ref;
    return {
      $$typeof: REACT_ELEMENT_TYPE,
      type,
      key,
      ref: void 0 !== refProp ? refProp : null,
      props
    };
  }
  function cloneAndReplaceKey(oldElement, newKey) {
    return ReactElement(oldElement.type, newKey, oldElement.props);
  }
  function isValidElement(object) {
    return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
  }
  function escape(key) {
    var escaperLookup = { "=": "=0", ":": "=2" };
    return "$" + key.replace(/[=:]/g, function(match) {
      return escaperLookup[match];
    });
  }
  var userProvidedKeyEscapeRegex = /\/+/g;
  function getElementKey(element, index) {
    return "object" === typeof element && null !== element && null != element.key ? escape("" + element.key) : index.toString(36);
  }
  function resolveThenable(thenable) {
    switch (thenable.status) {
      case "fulfilled":
        return thenable.value;
      case "rejected":
        throw thenable.reason;
      default:
        switch ("string" === typeof thenable.status ? thenable.then(noop, noop) : (thenable.status = "pending", thenable.then(
          function(fulfilledValue) {
            "pending" === thenable.status && (thenable.status = "fulfilled", thenable.value = fulfilledValue);
          },
          function(error) {
            "pending" === thenable.status && (thenable.status = "rejected", thenable.reason = error);
          }
        )), thenable.status) {
          case "fulfilled":
            return thenable.value;
          case "rejected":
            throw thenable.reason;
        }
    }
    throw thenable;
  }
  function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
    var type = typeof children;
    if ("undefined" === type || "boolean" === type) children = null;
    var invokeCallback = false;
    if (null === children) invokeCallback = true;
    else
      switch (type) {
        case "bigint":
        case "string":
        case "number":
          invokeCallback = true;
          break;
        case "object":
          switch (children.$$typeof) {
            case REACT_ELEMENT_TYPE:
            case REACT_PORTAL_TYPE:
              invokeCallback = true;
              break;
            case REACT_LAZY_TYPE:
              return invokeCallback = children._init, mapIntoArray(
                invokeCallback(children._payload),
                array,
                escapedPrefix,
                nameSoFar,
                callback
              );
          }
      }
    if (invokeCallback)
      return callback = callback(children), invokeCallback = "" === nameSoFar ? "." + getElementKey(children, 0) : nameSoFar, isArrayImpl(callback) ? (escapedPrefix = "", null != invokeCallback && (escapedPrefix = invokeCallback.replace(userProvidedKeyEscapeRegex, "$&/") + "/"), mapIntoArray(callback, array, escapedPrefix, "", function(c) {
        return c;
      })) : null != callback && (isValidElement(callback) && (callback = cloneAndReplaceKey(
        callback,
        escapedPrefix + (null == callback.key || children && children.key === callback.key ? "" : ("" + callback.key).replace(
          userProvidedKeyEscapeRegex,
          "$&/"
        ) + "/") + invokeCallback
      )), array.push(callback)), 1;
    invokeCallback = 0;
    var nextNamePrefix = "" === nameSoFar ? "." : nameSoFar + ":";
    if (isArrayImpl(children))
      for (var i = 0; i < children.length; i++)
        nameSoFar = children[i], type = nextNamePrefix + getElementKey(nameSoFar, i), invokeCallback += mapIntoArray(
          nameSoFar,
          array,
          escapedPrefix,
          type,
          callback
        );
    else if (i = getIteratorFn(children), "function" === typeof i)
      for (children = i.call(children), i = 0; !(nameSoFar = children.next()).done; )
        nameSoFar = nameSoFar.value, type = nextNamePrefix + getElementKey(nameSoFar, i++), invokeCallback += mapIntoArray(
          nameSoFar,
          array,
          escapedPrefix,
          type,
          callback
        );
    else if ("object" === type) {
      if ("function" === typeof children.then)
        return mapIntoArray(
          resolveThenable(children),
          array,
          escapedPrefix,
          nameSoFar,
          callback
        );
      array = String(children);
      throw Error(
        "Objects are not valid as a React child (found: " + ("[object Object]" === array ? "object with keys {" + Object.keys(children).join(", ") + "}" : array) + "). If you meant to render a collection of children, use an array instead."
      );
    }
    return invokeCallback;
  }
  function mapChildren(children, func, context) {
    if (null == children) return children;
    var result = [], count = 0;
    mapIntoArray(children, result, "", "", function(child) {
      return func.call(context, child, count++);
    });
    return result;
  }
  function lazyInitializer(payload) {
    if (-1 === payload._status) {
      var ctor = payload._result;
      ctor = ctor();
      ctor.then(
        function(moduleObject) {
          if (0 === payload._status || -1 === payload._status)
            payload._status = 1, payload._result = moduleObject;
        },
        function(error) {
          if (0 === payload._status || -1 === payload._status)
            payload._status = 2, payload._result = error;
        }
      );
      -1 === payload._status && (payload._status = 0, payload._result = ctor);
    }
    if (1 === payload._status) return payload._result.default;
    throw payload._result;
  }
  var reportGlobalError = "function" === typeof reportError ? reportError : function(error) {
    if ("object" === typeof window && "function" === typeof window.ErrorEvent) {
      var event = new window.ErrorEvent("error", {
        bubbles: true,
        cancelable: true,
        message: "object" === typeof error && null !== error && "string" === typeof error.message ? String(error.message) : String(error),
        error
      });
      if (!window.dispatchEvent(event)) return;
    } else if ("object" === typeof process && "function" === typeof process.emit) {
      process.emit("uncaughtException", error);
      return;
    }
    console.error(error);
  }, Children = {
    map: mapChildren,
    forEach: function(children, forEachFunc, forEachContext) {
      mapChildren(
        children,
        function() {
          forEachFunc.apply(this, arguments);
        },
        forEachContext
      );
    },
    count: function(children) {
      var n = 0;
      mapChildren(children, function() {
        n++;
      });
      return n;
    },
    toArray: function(children) {
      return mapChildren(children, function(child) {
        return child;
      }) || [];
    },
    only: function(children) {
      if (!isValidElement(children))
        throw Error(
          "React.Children.only expected to receive a single React element child."
        );
      return children;
    }
  };
  react_production.Activity = REACT_ACTIVITY_TYPE;
  react_production.Children = Children;
  react_production.Component = Component;
  react_production.Fragment = REACT_FRAGMENT_TYPE;
  react_production.Profiler = REACT_PROFILER_TYPE;
  react_production.PureComponent = PureComponent;
  react_production.StrictMode = REACT_STRICT_MODE_TYPE;
  react_production.Suspense = REACT_SUSPENSE_TYPE;
  react_production.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = ReactSharedInternals;
  react_production.__COMPILER_RUNTIME = {
    __proto__: null,
    c: function(size) {
      return ReactSharedInternals.H.useMemoCache(size);
    }
  };
  react_production.cache = function(fn) {
    return function() {
      return fn.apply(null, arguments);
    };
  };
  react_production.cacheSignal = function() {
    return null;
  };
  react_production.cloneElement = function(element, config, children) {
    if (null === element || void 0 === element)
      throw Error(
        "The argument must be a React element, but you passed " + element + "."
      );
    var props = assign({}, element.props), key = element.key;
    if (null != config)
      for (propName in void 0 !== config.key && (key = "" + config.key), config)
        !hasOwnProperty.call(config, propName) || "key" === propName || "__self" === propName || "__source" === propName || "ref" === propName && void 0 === config.ref || (props[propName] = config[propName]);
    var propName = arguments.length - 2;
    if (1 === propName) props.children = children;
    else if (1 < propName) {
      for (var childArray = Array(propName), i = 0; i < propName; i++)
        childArray[i] = arguments[i + 2];
      props.children = childArray;
    }
    return ReactElement(element.type, key, props);
  };
  react_production.createContext = function(defaultValue) {
    defaultValue = {
      $$typeof: REACT_CONTEXT_TYPE,
      _currentValue: defaultValue,
      _currentValue2: defaultValue,
      _threadCount: 0,
      Provider: null,
      Consumer: null
    };
    defaultValue.Provider = defaultValue;
    defaultValue.Consumer = {
      $$typeof: REACT_CONSUMER_TYPE,
      _context: defaultValue
    };
    return defaultValue;
  };
  react_production.createElement = function(type, config, children) {
    var propName, props = {}, key = null;
    if (null != config)
      for (propName in void 0 !== config.key && (key = "" + config.key), config)
        hasOwnProperty.call(config, propName) && "key" !== propName && "__self" !== propName && "__source" !== propName && (props[propName] = config[propName]);
    var childrenLength = arguments.length - 2;
    if (1 === childrenLength) props.children = children;
    else if (1 < childrenLength) {
      for (var childArray = Array(childrenLength), i = 0; i < childrenLength; i++)
        childArray[i] = arguments[i + 2];
      props.children = childArray;
    }
    if (type && type.defaultProps)
      for (propName in childrenLength = type.defaultProps, childrenLength)
        void 0 === props[propName] && (props[propName] = childrenLength[propName]);
    return ReactElement(type, key, props);
  };
  react_production.createRef = function() {
    return { current: null };
  };
  react_production.forwardRef = function(render) {
    return { $$typeof: REACT_FORWARD_REF_TYPE, render };
  };
  react_production.isValidElement = isValidElement;
  react_production.lazy = function(ctor) {
    return {
      $$typeof: REACT_LAZY_TYPE,
      _payload: { _status: -1, _result: ctor },
      _init: lazyInitializer
    };
  };
  react_production.memo = function(type, compare) {
    return {
      $$typeof: REACT_MEMO_TYPE,
      type,
      compare: void 0 === compare ? null : compare
    };
  };
  react_production.startTransition = function(scope) {
    var prevTransition = ReactSharedInternals.T, currentTransition = {};
    ReactSharedInternals.T = currentTransition;
    try {
      var returnValue = scope(), onStartTransitionFinish = ReactSharedInternals.S;
      null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
      "object" === typeof returnValue && null !== returnValue && "function" === typeof returnValue.then && returnValue.then(noop, reportGlobalError);
    } catch (error) {
      reportGlobalError(error);
    } finally {
      null !== prevTransition && null !== currentTransition.types && (prevTransition.types = currentTransition.types), ReactSharedInternals.T = prevTransition;
    }
  };
  react_production.unstable_useCacheRefresh = function() {
    return ReactSharedInternals.H.useCacheRefresh();
  };
  react_production.use = function(usable) {
    return ReactSharedInternals.H.use(usable);
  };
  react_production.useActionState = function(action, initialState, permalink) {
    return ReactSharedInternals.H.useActionState(action, initialState, permalink);
  };
  react_production.useCallback = function(callback, deps) {
    return ReactSharedInternals.H.useCallback(callback, deps);
  };
  react_production.useContext = function(Context) {
    return ReactSharedInternals.H.useContext(Context);
  };
  react_production.useDebugValue = function() {
  };
  react_production.useDeferredValue = function(value, initialValue) {
    return ReactSharedInternals.H.useDeferredValue(value, initialValue);
  };
  react_production.useEffect = function(create, deps) {
    return ReactSharedInternals.H.useEffect(create, deps);
  };
  react_production.useEffectEvent = function(callback) {
    return ReactSharedInternals.H.useEffectEvent(callback);
  };
  react_production.useId = function() {
    return ReactSharedInternals.H.useId();
  };
  react_production.useImperativeHandle = function(ref, create, deps) {
    return ReactSharedInternals.H.useImperativeHandle(ref, create, deps);
  };
  react_production.useInsertionEffect = function(create, deps) {
    return ReactSharedInternals.H.useInsertionEffect(create, deps);
  };
  react_production.useLayoutEffect = function(create, deps) {
    return ReactSharedInternals.H.useLayoutEffect(create, deps);
  };
  react_production.useMemo = function(create, deps) {
    return ReactSharedInternals.H.useMemo(create, deps);
  };
  react_production.useOptimistic = function(passthrough, reducer) {
    return ReactSharedInternals.H.useOptimistic(passthrough, reducer);
  };
  react_production.useReducer = function(reducer, initialArg, init) {
    return ReactSharedInternals.H.useReducer(reducer, initialArg, init);
  };
  react_production.useRef = function(initialValue) {
    return ReactSharedInternals.H.useRef(initialValue);
  };
  react_production.useState = function(initialState) {
    return ReactSharedInternals.H.useState(initialState);
  };
  react_production.useSyncExternalStore = function(subscribe, getSnapshot, getServerSnapshot) {
    return ReactSharedInternals.H.useSyncExternalStore(
      subscribe,
      getSnapshot,
      getServerSnapshot
    );
  };
  react_production.useTransition = function() {
    return ReactSharedInternals.H.useTransition();
  };
  react_production.version = "19.2.0";
  return react_production;
}
var hasRequiredReact;
function requireReact() {
  if (hasRequiredReact) return react.exports;
  hasRequiredReact = 1;
  {
    react.exports = requireReact_production();
  }
  return react.exports;
}
var reactExports = requireReact();
const React = /* @__PURE__ */ getDefaultExportFromCjs(reactExports);
var client = { exports: {} };
var reactDomClient_production = {};
var scheduler = { exports: {} };
var scheduler_production = {};
var hasRequiredScheduler_production;
function requireScheduler_production() {
  if (hasRequiredScheduler_production) return scheduler_production;
  hasRequiredScheduler_production = 1;
  (function(exports$1) {
    function push(heap, node) {
      var index = heap.length;
      heap.push(node);
      a: for (; 0 < index; ) {
        var parentIndex = index - 1 >>> 1, parent = heap[parentIndex];
        if (0 < compare(parent, node))
          heap[parentIndex] = node, heap[index] = parent, index = parentIndex;
        else break a;
      }
    }
    function peek(heap) {
      return 0 === heap.length ? null : heap[0];
    }
    function pop(heap) {
      if (0 === heap.length) return null;
      var first = heap[0], last = heap.pop();
      if (last !== first) {
        heap[0] = last;
        a: for (var index = 0, length = heap.length, halfLength = length >>> 1; index < halfLength; ) {
          var leftIndex = 2 * (index + 1) - 1, left = heap[leftIndex], rightIndex = leftIndex + 1, right = heap[rightIndex];
          if (0 > compare(left, last))
            rightIndex < length && 0 > compare(right, left) ? (heap[index] = right, heap[rightIndex] = last, index = rightIndex) : (heap[index] = left, heap[leftIndex] = last, index = leftIndex);
          else if (rightIndex < length && 0 > compare(right, last))
            heap[index] = right, heap[rightIndex] = last, index = rightIndex;
          else break a;
        }
      }
      return first;
    }
    function compare(a, b) {
      var diff = a.sortIndex - b.sortIndex;
      return 0 !== diff ? diff : a.id - b.id;
    }
    exports$1.unstable_now = void 0;
    if ("object" === typeof performance && "function" === typeof performance.now) {
      var localPerformance = performance;
      exports$1.unstable_now = function() {
        return localPerformance.now();
      };
    } else {
      var localDate = Date, initialTime = localDate.now();
      exports$1.unstable_now = function() {
        return localDate.now() - initialTime;
      };
    }
    var taskQueue = [], timerQueue = [], taskIdCounter = 1, currentTask = null, currentPriorityLevel = 3, isPerformingWork = false, isHostCallbackScheduled = false, isHostTimeoutScheduled = false, needsPaint = false, localSetTimeout = "function" === typeof setTimeout ? setTimeout : null, localClearTimeout = "function" === typeof clearTimeout ? clearTimeout : null, localSetImmediate = "undefined" !== typeof setImmediate ? setImmediate : null;
    function advanceTimers(currentTime) {
      for (var timer = peek(timerQueue); null !== timer; ) {
        if (null === timer.callback) pop(timerQueue);
        else if (timer.startTime <= currentTime)
          pop(timerQueue), timer.sortIndex = timer.expirationTime, push(taskQueue, timer);
        else break;
        timer = peek(timerQueue);
      }
    }
    function handleTimeout(currentTime) {
      isHostTimeoutScheduled = false;
      advanceTimers(currentTime);
      if (!isHostCallbackScheduled)
        if (null !== peek(taskQueue))
          isHostCallbackScheduled = true, isMessageLoopRunning || (isMessageLoopRunning = true, schedulePerformWorkUntilDeadline());
        else {
          var firstTimer = peek(timerQueue);
          null !== firstTimer && requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
        }
    }
    var isMessageLoopRunning = false, taskTimeoutID = -1, frameInterval = 5, startTime = -1;
    function shouldYieldToHost() {
      return needsPaint ? true : exports$1.unstable_now() - startTime < frameInterval ? false : true;
    }
    function performWorkUntilDeadline() {
      needsPaint = false;
      if (isMessageLoopRunning) {
        var currentTime = exports$1.unstable_now();
        startTime = currentTime;
        var hasMoreWork = true;
        try {
          a: {
            isHostCallbackScheduled = false;
            isHostTimeoutScheduled && (isHostTimeoutScheduled = false, localClearTimeout(taskTimeoutID), taskTimeoutID = -1);
            isPerformingWork = true;
            var previousPriorityLevel = currentPriorityLevel;
            try {
              b: {
                advanceTimers(currentTime);
                for (currentTask = peek(taskQueue); null !== currentTask && !(currentTask.expirationTime > currentTime && shouldYieldToHost()); ) {
                  var callback = currentTask.callback;
                  if ("function" === typeof callback) {
                    currentTask.callback = null;
                    currentPriorityLevel = currentTask.priorityLevel;
                    var continuationCallback = callback(
                      currentTask.expirationTime <= currentTime
                    );
                    currentTime = exports$1.unstable_now();
                    if ("function" === typeof continuationCallback) {
                      currentTask.callback = continuationCallback;
                      advanceTimers(currentTime);
                      hasMoreWork = true;
                      break b;
                    }
                    currentTask === peek(taskQueue) && pop(taskQueue);
                    advanceTimers(currentTime);
                  } else pop(taskQueue);
                  currentTask = peek(taskQueue);
                }
                if (null !== currentTask) hasMoreWork = true;
                else {
                  var firstTimer = peek(timerQueue);
                  null !== firstTimer && requestHostTimeout(
                    handleTimeout,
                    firstTimer.startTime - currentTime
                  );
                  hasMoreWork = false;
                }
              }
              break a;
            } finally {
              currentTask = null, currentPriorityLevel = previousPriorityLevel, isPerformingWork = false;
            }
            hasMoreWork = void 0;
          }
        } finally {
          hasMoreWork ? schedulePerformWorkUntilDeadline() : isMessageLoopRunning = false;
        }
      }
    }
    var schedulePerformWorkUntilDeadline;
    if ("function" === typeof localSetImmediate)
      schedulePerformWorkUntilDeadline = function() {
        localSetImmediate(performWorkUntilDeadline);
      };
    else if ("undefined" !== typeof MessageChannel) {
      var channel = new MessageChannel(), port = channel.port2;
      channel.port1.onmessage = performWorkUntilDeadline;
      schedulePerformWorkUntilDeadline = function() {
        port.postMessage(null);
      };
    } else
      schedulePerformWorkUntilDeadline = function() {
        localSetTimeout(performWorkUntilDeadline, 0);
      };
    function requestHostTimeout(callback, ms) {
      taskTimeoutID = localSetTimeout(function() {
        callback(exports$1.unstable_now());
      }, ms);
    }
    exports$1.unstable_IdlePriority = 5;
    exports$1.unstable_ImmediatePriority = 1;
    exports$1.unstable_LowPriority = 4;
    exports$1.unstable_NormalPriority = 3;
    exports$1.unstable_Profiling = null;
    exports$1.unstable_UserBlockingPriority = 2;
    exports$1.unstable_cancelCallback = function(task) {
      task.callback = null;
    };
    exports$1.unstable_forceFrameRate = function(fps) {
      0 > fps || 125 < fps ? console.error(
        "forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"
      ) : frameInterval = 0 < fps ? Math.floor(1e3 / fps) : 5;
    };
    exports$1.unstable_getCurrentPriorityLevel = function() {
      return currentPriorityLevel;
    };
    exports$1.unstable_next = function(eventHandler) {
      switch (currentPriorityLevel) {
        case 1:
        case 2:
        case 3:
          var priorityLevel = 3;
          break;
        default:
          priorityLevel = currentPriorityLevel;
      }
      var previousPriorityLevel = currentPriorityLevel;
      currentPriorityLevel = priorityLevel;
      try {
        return eventHandler();
      } finally {
        currentPriorityLevel = previousPriorityLevel;
      }
    };
    exports$1.unstable_requestPaint = function() {
      needsPaint = true;
    };
    exports$1.unstable_runWithPriority = function(priorityLevel, eventHandler) {
      switch (priorityLevel) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          break;
        default:
          priorityLevel = 3;
      }
      var previousPriorityLevel = currentPriorityLevel;
      currentPriorityLevel = priorityLevel;
      try {
        return eventHandler();
      } finally {
        currentPriorityLevel = previousPriorityLevel;
      }
    };
    exports$1.unstable_scheduleCallback = function(priorityLevel, callback, options) {
      var currentTime = exports$1.unstable_now();
      "object" === typeof options && null !== options ? (options = options.delay, options = "number" === typeof options && 0 < options ? currentTime + options : currentTime) : options = currentTime;
      switch (priorityLevel) {
        case 1:
          var timeout = -1;
          break;
        case 2:
          timeout = 250;
          break;
        case 5:
          timeout = 1073741823;
          break;
        case 4:
          timeout = 1e4;
          break;
        default:
          timeout = 5e3;
      }
      timeout = options + timeout;
      priorityLevel = {
        id: taskIdCounter++,
        callback,
        priorityLevel,
        startTime: options,
        expirationTime: timeout,
        sortIndex: -1
      };
      options > currentTime ? (priorityLevel.sortIndex = options, push(timerQueue, priorityLevel), null === peek(taskQueue) && priorityLevel === peek(timerQueue) && (isHostTimeoutScheduled ? (localClearTimeout(taskTimeoutID), taskTimeoutID = -1) : isHostTimeoutScheduled = true, requestHostTimeout(handleTimeout, options - currentTime))) : (priorityLevel.sortIndex = timeout, push(taskQueue, priorityLevel), isHostCallbackScheduled || isPerformingWork || (isHostCallbackScheduled = true, isMessageLoopRunning || (isMessageLoopRunning = true, schedulePerformWorkUntilDeadline())));
      return priorityLevel;
    };
    exports$1.unstable_shouldYield = shouldYieldToHost;
    exports$1.unstable_wrapCallback = function(callback) {
      var parentPriorityLevel = currentPriorityLevel;
      return function() {
        var previousPriorityLevel = currentPriorityLevel;
        currentPriorityLevel = parentPriorityLevel;
        try {
          return callback.apply(this, arguments);
        } finally {
          currentPriorityLevel = previousPriorityLevel;
        }
      };
    };
  })(scheduler_production);
  return scheduler_production;
}
var hasRequiredScheduler;
function requireScheduler() {
  if (hasRequiredScheduler) return scheduler.exports;
  hasRequiredScheduler = 1;
  {
    scheduler.exports = requireScheduler_production();
  }
  return scheduler.exports;
}
var reactDom = { exports: {} };
var reactDom_production = {};
var hasRequiredReactDom_production;
function requireReactDom_production() {
  if (hasRequiredReactDom_production) return reactDom_production;
  hasRequiredReactDom_production = 1;
  var React2 = requireReact();
  function formatProdErrorMessage(code) {
    var url = "https://react.dev/errors/" + code;
    if (1 < arguments.length) {
      url += "?args[]=" + encodeURIComponent(arguments[1]);
      for (var i = 2; i < arguments.length; i++)
        url += "&args[]=" + encodeURIComponent(arguments[i]);
    }
    return "Minified React error #" + code + "; visit " + url + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
  }
  function noop() {
  }
  var Internals = {
    d: {
      f: noop,
      r: function() {
        throw Error(formatProdErrorMessage(522));
      },
      D: noop,
      C: noop,
      L: noop,
      m: noop,
      X: noop,
      S: noop,
      M: noop
    },
    p: 0,
    findDOMNode: null
  }, REACT_PORTAL_TYPE = Symbol.for("react.portal");
  function createPortal$1(children, containerInfo, implementation) {
    var key = 3 < arguments.length && void 0 !== arguments[3] ? arguments[3] : null;
    return {
      $$typeof: REACT_PORTAL_TYPE,
      key: null == key ? null : "" + key,
      children,
      containerInfo,
      implementation
    };
  }
  var ReactSharedInternals = React2.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
  function getCrossOriginStringAs(as, input) {
    if ("font" === as) return "";
    if ("string" === typeof input)
      return "use-credentials" === input ? input : "";
  }
  reactDom_production.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = Internals;
  reactDom_production.createPortal = function(children, container) {
    var key = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : null;
    if (!container || 1 !== container.nodeType && 9 !== container.nodeType && 11 !== container.nodeType)
      throw Error(formatProdErrorMessage(299));
    return createPortal$1(children, container, null, key);
  };
  reactDom_production.flushSync = function(fn) {
    var previousTransition = ReactSharedInternals.T, previousUpdatePriority = Internals.p;
    try {
      if (ReactSharedInternals.T = null, Internals.p = 2, fn) return fn();
    } finally {
      ReactSharedInternals.T = previousTransition, Internals.p = previousUpdatePriority, Internals.d.f();
    }
  };
  reactDom_production.preconnect = function(href, options) {
    "string" === typeof href && (options ? (options = options.crossOrigin, options = "string" === typeof options ? "use-credentials" === options ? options : "" : void 0) : options = null, Internals.d.C(href, options));
  };
  reactDom_production.prefetchDNS = function(href) {
    "string" === typeof href && Internals.d.D(href);
  };
  reactDom_production.preinit = function(href, options) {
    if ("string" === typeof href && options && "string" === typeof options.as) {
      var as = options.as, crossOrigin = getCrossOriginStringAs(as, options.crossOrigin), integrity = "string" === typeof options.integrity ? options.integrity : void 0, fetchPriority = "string" === typeof options.fetchPriority ? options.fetchPriority : void 0;
      "style" === as ? Internals.d.S(
        href,
        "string" === typeof options.precedence ? options.precedence : void 0,
        {
          crossOrigin,
          integrity,
          fetchPriority
        }
      ) : "script" === as && Internals.d.X(href, {
        crossOrigin,
        integrity,
        fetchPriority,
        nonce: "string" === typeof options.nonce ? options.nonce : void 0
      });
    }
  };
  reactDom_production.preinitModule = function(href, options) {
    if ("string" === typeof href)
      if ("object" === typeof options && null !== options) {
        if (null == options.as || "script" === options.as) {
          var crossOrigin = getCrossOriginStringAs(
            options.as,
            options.crossOrigin
          );
          Internals.d.M(href, {
            crossOrigin,
            integrity: "string" === typeof options.integrity ? options.integrity : void 0,
            nonce: "string" === typeof options.nonce ? options.nonce : void 0
          });
        }
      } else null == options && Internals.d.M(href);
  };
  reactDom_production.preload = function(href, options) {
    if ("string" === typeof href && "object" === typeof options && null !== options && "string" === typeof options.as) {
      var as = options.as, crossOrigin = getCrossOriginStringAs(as, options.crossOrigin);
      Internals.d.L(href, as, {
        crossOrigin,
        integrity: "string" === typeof options.integrity ? options.integrity : void 0,
        nonce: "string" === typeof options.nonce ? options.nonce : void 0,
        type: "string" === typeof options.type ? options.type : void 0,
        fetchPriority: "string" === typeof options.fetchPriority ? options.fetchPriority : void 0,
        referrerPolicy: "string" === typeof options.referrerPolicy ? options.referrerPolicy : void 0,
        imageSrcSet: "string" === typeof options.imageSrcSet ? options.imageSrcSet : void 0,
        imageSizes: "string" === typeof options.imageSizes ? options.imageSizes : void 0,
        media: "string" === typeof options.media ? options.media : void 0
      });
    }
  };
  reactDom_production.preloadModule = function(href, options) {
    if ("string" === typeof href)
      if (options) {
        var crossOrigin = getCrossOriginStringAs(options.as, options.crossOrigin);
        Internals.d.m(href, {
          as: "string" === typeof options.as && "script" !== options.as ? options.as : void 0,
          crossOrigin,
          integrity: "string" === typeof options.integrity ? options.integrity : void 0
        });
      } else Internals.d.m(href);
  };
  reactDom_production.requestFormReset = function(form) {
    Internals.d.r(form);
  };
  reactDom_production.unstable_batchedUpdates = function(fn, a) {
    return fn(a);
  };
  reactDom_production.useFormState = function(action, initialState, permalink) {
    return ReactSharedInternals.H.useFormState(action, initialState, permalink);
  };
  reactDom_production.useFormStatus = function() {
    return ReactSharedInternals.H.useHostTransitionStatus();
  };
  reactDom_production.version = "19.2.0";
  return reactDom_production;
}
var hasRequiredReactDom;
function requireReactDom() {
  if (hasRequiredReactDom) return reactDom.exports;
  hasRequiredReactDom = 1;
  function checkDCE() {
    if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === "undefined" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE !== "function") {
      return;
    }
    try {
      __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(checkDCE);
    } catch (err) {
      console.error(err);
    }
  }
  {
    checkDCE();
    reactDom.exports = requireReactDom_production();
  }
  return reactDom.exports;
}
var hasRequiredReactDomClient_production;
function requireReactDomClient_production() {
  if (hasRequiredReactDomClient_production) return reactDomClient_production;
  hasRequiredReactDomClient_production = 1;
  var Scheduler = requireScheduler(), React2 = requireReact(), ReactDOM2 = requireReactDom();
  function formatProdErrorMessage(code) {
    var url = "https://react.dev/errors/" + code;
    if (1 < arguments.length) {
      url += "?args[]=" + encodeURIComponent(arguments[1]);
      for (var i = 2; i < arguments.length; i++)
        url += "&args[]=" + encodeURIComponent(arguments[i]);
    }
    return "Minified React error #" + code + "; visit " + url + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
  }
  function isValidContainer(node) {
    return !(!node || 1 !== node.nodeType && 9 !== node.nodeType && 11 !== node.nodeType);
  }
  function getNearestMountedFiber(fiber) {
    var node = fiber, nearestMounted = fiber;
    if (fiber.alternate) for (; node.return; ) node = node.return;
    else {
      fiber = node;
      do
        node = fiber, 0 !== (node.flags & 4098) && (nearestMounted = node.return), fiber = node.return;
      while (fiber);
    }
    return 3 === node.tag ? nearestMounted : null;
  }
  function getSuspenseInstanceFromFiber(fiber) {
    if (13 === fiber.tag) {
      var suspenseState = fiber.memoizedState;
      null === suspenseState && (fiber = fiber.alternate, null !== fiber && (suspenseState = fiber.memoizedState));
      if (null !== suspenseState) return suspenseState.dehydrated;
    }
    return null;
  }
  function getActivityInstanceFromFiber(fiber) {
    if (31 === fiber.tag) {
      var activityState = fiber.memoizedState;
      null === activityState && (fiber = fiber.alternate, null !== fiber && (activityState = fiber.memoizedState));
      if (null !== activityState) return activityState.dehydrated;
    }
    return null;
  }
  function assertIsMounted(fiber) {
    if (getNearestMountedFiber(fiber) !== fiber)
      throw Error(formatProdErrorMessage(188));
  }
  function findCurrentFiberUsingSlowPath(fiber) {
    var alternate = fiber.alternate;
    if (!alternate) {
      alternate = getNearestMountedFiber(fiber);
      if (null === alternate) throw Error(formatProdErrorMessage(188));
      return alternate !== fiber ? null : fiber;
    }
    for (var a = fiber, b = alternate; ; ) {
      var parentA = a.return;
      if (null === parentA) break;
      var parentB = parentA.alternate;
      if (null === parentB) {
        b = parentA.return;
        if (null !== b) {
          a = b;
          continue;
        }
        break;
      }
      if (parentA.child === parentB.child) {
        for (parentB = parentA.child; parentB; ) {
          if (parentB === a) return assertIsMounted(parentA), fiber;
          if (parentB === b) return assertIsMounted(parentA), alternate;
          parentB = parentB.sibling;
        }
        throw Error(formatProdErrorMessage(188));
      }
      if (a.return !== b.return) a = parentA, b = parentB;
      else {
        for (var didFindChild = false, child$0 = parentA.child; child$0; ) {
          if (child$0 === a) {
            didFindChild = true;
            a = parentA;
            b = parentB;
            break;
          }
          if (child$0 === b) {
            didFindChild = true;
            b = parentA;
            a = parentB;
            break;
          }
          child$0 = child$0.sibling;
        }
        if (!didFindChild) {
          for (child$0 = parentB.child; child$0; ) {
            if (child$0 === a) {
              didFindChild = true;
              a = parentB;
              b = parentA;
              break;
            }
            if (child$0 === b) {
              didFindChild = true;
              b = parentB;
              a = parentA;
              break;
            }
            child$0 = child$0.sibling;
          }
          if (!didFindChild) throw Error(formatProdErrorMessage(189));
        }
      }
      if (a.alternate !== b) throw Error(formatProdErrorMessage(190));
    }
    if (3 !== a.tag) throw Error(formatProdErrorMessage(188));
    return a.stateNode.current === a ? fiber : alternate;
  }
  function findCurrentHostFiberImpl(node) {
    var tag = node.tag;
    if (5 === tag || 26 === tag || 27 === tag || 6 === tag) return node;
    for (node = node.child; null !== node; ) {
      tag = findCurrentHostFiberImpl(node);
      if (null !== tag) return tag;
      node = node.sibling;
    }
    return null;
  }
  var assign = Object.assign, REACT_LEGACY_ELEMENT_TYPE = Symbol.for("react.element"), REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy");
  var REACT_ACTIVITY_TYPE = Symbol.for("react.activity");
  var REACT_MEMO_CACHE_SENTINEL = Symbol.for("react.memo_cache_sentinel");
  var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
  function getIteratorFn(maybeIterable) {
    if (null === maybeIterable || "object" !== typeof maybeIterable) return null;
    maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
    return "function" === typeof maybeIterable ? maybeIterable : null;
  }
  var REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference");
  function getComponentNameFromType(type) {
    if (null == type) return null;
    if ("function" === typeof type)
      return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
    if ("string" === typeof type) return type;
    switch (type) {
      case REACT_FRAGMENT_TYPE:
        return "Fragment";
      case REACT_PROFILER_TYPE:
        return "Profiler";
      case REACT_STRICT_MODE_TYPE:
        return "StrictMode";
      case REACT_SUSPENSE_TYPE:
        return "Suspense";
      case REACT_SUSPENSE_LIST_TYPE:
        return "SuspenseList";
      case REACT_ACTIVITY_TYPE:
        return "Activity";
    }
    if ("object" === typeof type)
      switch (type.$$typeof) {
        case REACT_PORTAL_TYPE:
          return "Portal";
        case REACT_CONTEXT_TYPE:
          return type.displayName || "Context";
        case REACT_CONSUMER_TYPE:
          return (type._context.displayName || "Context") + ".Consumer";
        case REACT_FORWARD_REF_TYPE:
          var innerType = type.render;
          type = type.displayName;
          type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
          return type;
        case REACT_MEMO_TYPE:
          return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
        case REACT_LAZY_TYPE:
          innerType = type._payload;
          type = type._init;
          try {
            return getComponentNameFromType(type(innerType));
          } catch (x) {
          }
      }
    return null;
  }
  var isArrayImpl = Array.isArray, ReactSharedInternals = React2.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, ReactDOMSharedInternals = ReactDOM2.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, sharedNotPendingObject = {
    pending: false,
    data: null,
    method: null,
    action: null
  }, valueStack = [], index = -1;
  function createCursor(defaultValue) {
    return { current: defaultValue };
  }
  function pop(cursor) {
    0 > index || (cursor.current = valueStack[index], valueStack[index] = null, index--);
  }
  function push(cursor, value) {
    index++;
    valueStack[index] = cursor.current;
    cursor.current = value;
  }
  var contextStackCursor = createCursor(null), contextFiberStackCursor = createCursor(null), rootInstanceStackCursor = createCursor(null), hostTransitionProviderCursor = createCursor(null);
  function pushHostContainer(fiber, nextRootInstance) {
    push(rootInstanceStackCursor, nextRootInstance);
    push(contextFiberStackCursor, fiber);
    push(contextStackCursor, null);
    switch (nextRootInstance.nodeType) {
      case 9:
      case 11:
        fiber = (fiber = nextRootInstance.documentElement) ? (fiber = fiber.namespaceURI) ? getOwnHostContext(fiber) : 0 : 0;
        break;
      default:
        if (fiber = nextRootInstance.tagName, nextRootInstance = nextRootInstance.namespaceURI)
          nextRootInstance = getOwnHostContext(nextRootInstance), fiber = getChildHostContextProd(nextRootInstance, fiber);
        else
          switch (fiber) {
            case "svg":
              fiber = 1;
              break;
            case "math":
              fiber = 2;
              break;
            default:
              fiber = 0;
          }
    }
    pop(contextStackCursor);
    push(contextStackCursor, fiber);
  }
  function popHostContainer() {
    pop(contextStackCursor);
    pop(contextFiberStackCursor);
    pop(rootInstanceStackCursor);
  }
  function pushHostContext(fiber) {
    null !== fiber.memoizedState && push(hostTransitionProviderCursor, fiber);
    var context = contextStackCursor.current;
    var JSCompiler_inline_result = getChildHostContextProd(context, fiber.type);
    context !== JSCompiler_inline_result && (push(contextFiberStackCursor, fiber), push(contextStackCursor, JSCompiler_inline_result));
  }
  function popHostContext(fiber) {
    contextFiberStackCursor.current === fiber && (pop(contextStackCursor), pop(contextFiberStackCursor));
    hostTransitionProviderCursor.current === fiber && (pop(hostTransitionProviderCursor), HostTransitionContext._currentValue = sharedNotPendingObject);
  }
  var prefix, suffix;
  function describeBuiltInComponentFrame(name2) {
    if (void 0 === prefix)
      try {
        throw Error();
      } catch (x) {
        var match = x.stack.trim().match(/\n( *(at )?)/);
        prefix = match && match[1] || "";
        suffix = -1 < x.stack.indexOf("\n    at") ? " (<anonymous>)" : -1 < x.stack.indexOf("@") ? "@unknown:0:0" : "";
      }
    return "\n" + prefix + name2 + suffix;
  }
  var reentry = false;
  function describeNativeComponentFrame(fn, construct) {
    if (!fn || reentry) return "";
    reentry = true;
    var previousPrepareStackTrace = Error.prepareStackTrace;
    Error.prepareStackTrace = void 0;
    try {
      var RunInRootFrame = {
        DetermineComponentFrameRoot: function() {
          try {
            if (construct) {
              var Fake = function() {
                throw Error();
              };
              Object.defineProperty(Fake.prototype, "props", {
                set: function() {
                  throw Error();
                }
              });
              if ("object" === typeof Reflect && Reflect.construct) {
                try {
                  Reflect.construct(Fake, []);
                } catch (x) {
                  var control = x;
                }
                Reflect.construct(fn, [], Fake);
              } else {
                try {
                  Fake.call();
                } catch (x$1) {
                  control = x$1;
                }
                fn.call(Fake.prototype);
              }
            } else {
              try {
                throw Error();
              } catch (x$2) {
                control = x$2;
              }
              (Fake = fn()) && "function" === typeof Fake.catch && Fake.catch(function() {
              });
            }
          } catch (sample) {
            if (sample && control && "string" === typeof sample.stack)
              return [sample.stack, control.stack];
          }
          return [null, null];
        }
      };
      RunInRootFrame.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
      var namePropDescriptor = Object.getOwnPropertyDescriptor(
        RunInRootFrame.DetermineComponentFrameRoot,
        "name"
      );
      namePropDescriptor && namePropDescriptor.configurable && Object.defineProperty(
        RunInRootFrame.DetermineComponentFrameRoot,
        "name",
        { value: "DetermineComponentFrameRoot" }
      );
      var _RunInRootFrame$Deter = RunInRootFrame.DetermineComponentFrameRoot(), sampleStack = _RunInRootFrame$Deter[0], controlStack = _RunInRootFrame$Deter[1];
      if (sampleStack && controlStack) {
        var sampleLines = sampleStack.split("\n"), controlLines = controlStack.split("\n");
        for (namePropDescriptor = RunInRootFrame = 0; RunInRootFrame < sampleLines.length && !sampleLines[RunInRootFrame].includes("DetermineComponentFrameRoot"); )
          RunInRootFrame++;
        for (; namePropDescriptor < controlLines.length && !controlLines[namePropDescriptor].includes(
          "DetermineComponentFrameRoot"
        ); )
          namePropDescriptor++;
        if (RunInRootFrame === sampleLines.length || namePropDescriptor === controlLines.length)
          for (RunInRootFrame = sampleLines.length - 1, namePropDescriptor = controlLines.length - 1; 1 <= RunInRootFrame && 0 <= namePropDescriptor && sampleLines[RunInRootFrame] !== controlLines[namePropDescriptor]; )
            namePropDescriptor--;
        for (; 1 <= RunInRootFrame && 0 <= namePropDescriptor; RunInRootFrame--, namePropDescriptor--)
          if (sampleLines[RunInRootFrame] !== controlLines[namePropDescriptor]) {
            if (1 !== RunInRootFrame || 1 !== namePropDescriptor) {
              do
                if (RunInRootFrame--, namePropDescriptor--, 0 > namePropDescriptor || sampleLines[RunInRootFrame] !== controlLines[namePropDescriptor]) {
                  var frame = "\n" + sampleLines[RunInRootFrame].replace(" at new ", " at ");
                  fn.displayName && frame.includes("<anonymous>") && (frame = frame.replace("<anonymous>", fn.displayName));
                  return frame;
                }
              while (1 <= RunInRootFrame && 0 <= namePropDescriptor);
            }
            break;
          }
      }
    } finally {
      reentry = false, Error.prepareStackTrace = previousPrepareStackTrace;
    }
    return (previousPrepareStackTrace = fn ? fn.displayName || fn.name : "") ? describeBuiltInComponentFrame(previousPrepareStackTrace) : "";
  }
  function describeFiber(fiber, childFiber) {
    switch (fiber.tag) {
      case 26:
      case 27:
      case 5:
        return describeBuiltInComponentFrame(fiber.type);
      case 16:
        return describeBuiltInComponentFrame("Lazy");
      case 13:
        return fiber.child !== childFiber && null !== childFiber ? describeBuiltInComponentFrame("Suspense Fallback") : describeBuiltInComponentFrame("Suspense");
      case 19:
        return describeBuiltInComponentFrame("SuspenseList");
      case 0:
      case 15:
        return describeNativeComponentFrame(fiber.type, false);
      case 11:
        return describeNativeComponentFrame(fiber.type.render, false);
      case 1:
        return describeNativeComponentFrame(fiber.type, true);
      case 31:
        return describeBuiltInComponentFrame("Activity");
      default:
        return "";
    }
  }
  function getStackByFiberInDevAndProd(workInProgress2) {
    try {
      var info = "", previous = null;
      do
        info += describeFiber(workInProgress2, previous), previous = workInProgress2, workInProgress2 = workInProgress2.return;
      while (workInProgress2);
      return info;
    } catch (x) {
      return "\nError generating stack: " + x.message + "\n" + x.stack;
    }
  }
  var hasOwnProperty = Object.prototype.hasOwnProperty, scheduleCallback$3 = Scheduler.unstable_scheduleCallback, cancelCallback$1 = Scheduler.unstable_cancelCallback, shouldYield = Scheduler.unstable_shouldYield, requestPaint = Scheduler.unstable_requestPaint, now = Scheduler.unstable_now, getCurrentPriorityLevel = Scheduler.unstable_getCurrentPriorityLevel, ImmediatePriority = Scheduler.unstable_ImmediatePriority, UserBlockingPriority = Scheduler.unstable_UserBlockingPriority, NormalPriority$1 = Scheduler.unstable_NormalPriority, LowPriority = Scheduler.unstable_LowPriority, IdlePriority = Scheduler.unstable_IdlePriority, log$1 = Scheduler.log, unstable_setDisableYieldValue = Scheduler.unstable_setDisableYieldValue, rendererID = null, injectedHook = null;
  function setIsStrictModeForDevtools(newIsStrictMode) {
    "function" === typeof log$1 && unstable_setDisableYieldValue(newIsStrictMode);
    if (injectedHook && "function" === typeof injectedHook.setStrictMode)
      try {
        injectedHook.setStrictMode(rendererID, newIsStrictMode);
      } catch (err) {
      }
  }
  var clz32 = Math.clz32 ? Math.clz32 : clz32Fallback, log = Math.log, LN2 = Math.LN2;
  function clz32Fallback(x) {
    x >>>= 0;
    return 0 === x ? 32 : 31 - (log(x) / LN2 | 0) | 0;
  }
  var nextTransitionUpdateLane = 256, nextTransitionDeferredLane = 262144, nextRetryLane = 4194304;
  function getHighestPriorityLanes(lanes) {
    var pendingSyncLanes = lanes & 42;
    if (0 !== pendingSyncLanes) return pendingSyncLanes;
    switch (lanes & -lanes) {
      case 1:
        return 1;
      case 2:
        return 2;
      case 4:
        return 4;
      case 8:
        return 8;
      case 16:
        return 16;
      case 32:
        return 32;
      case 64:
        return 64;
      case 128:
        return 128;
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
        return lanes & 261888;
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return lanes & 3932160;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
        return lanes & 62914560;
      case 67108864:
        return 67108864;
      case 134217728:
        return 134217728;
      case 268435456:
        return 268435456;
      case 536870912:
        return 536870912;
      case 1073741824:
        return 0;
      default:
        return lanes;
    }
  }
  function getNextLanes(root3, wipLanes, rootHasPendingCommit) {
    var pendingLanes = root3.pendingLanes;
    if (0 === pendingLanes) return 0;
    var nextLanes = 0, suspendedLanes = root3.suspendedLanes, pingedLanes = root3.pingedLanes;
    root3 = root3.warmLanes;
    var nonIdlePendingLanes = pendingLanes & 134217727;
    0 !== nonIdlePendingLanes ? (pendingLanes = nonIdlePendingLanes & ~suspendedLanes, 0 !== pendingLanes ? nextLanes = getHighestPriorityLanes(pendingLanes) : (pingedLanes &= nonIdlePendingLanes, 0 !== pingedLanes ? nextLanes = getHighestPriorityLanes(pingedLanes) : rootHasPendingCommit || (rootHasPendingCommit = nonIdlePendingLanes & ~root3, 0 !== rootHasPendingCommit && (nextLanes = getHighestPriorityLanes(rootHasPendingCommit))))) : (nonIdlePendingLanes = pendingLanes & ~suspendedLanes, 0 !== nonIdlePendingLanes ? nextLanes = getHighestPriorityLanes(nonIdlePendingLanes) : 0 !== pingedLanes ? nextLanes = getHighestPriorityLanes(pingedLanes) : rootHasPendingCommit || (rootHasPendingCommit = pendingLanes & ~root3, 0 !== rootHasPendingCommit && (nextLanes = getHighestPriorityLanes(rootHasPendingCommit))));
    return 0 === nextLanes ? 0 : 0 !== wipLanes && wipLanes !== nextLanes && 0 === (wipLanes & suspendedLanes) && (suspendedLanes = nextLanes & -nextLanes, rootHasPendingCommit = wipLanes & -wipLanes, suspendedLanes >= rootHasPendingCommit || 32 === suspendedLanes && 0 !== (rootHasPendingCommit & 4194048)) ? wipLanes : nextLanes;
  }
  function checkIfRootIsPrerendering(root3, renderLanes2) {
    return 0 === (root3.pendingLanes & ~(root3.suspendedLanes & ~root3.pingedLanes) & renderLanes2);
  }
  function computeExpirationTime(lane, currentTime) {
    switch (lane) {
      case 1:
      case 2:
      case 4:
      case 8:
      case 64:
        return currentTime + 250;
      case 16:
      case 32:
      case 128:
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return currentTime + 5e3;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
        return -1;
      case 67108864:
      case 134217728:
      case 268435456:
      case 536870912:
      case 1073741824:
        return -1;
      default:
        return -1;
    }
  }
  function claimNextRetryLane() {
    var lane = nextRetryLane;
    nextRetryLane <<= 1;
    0 === (nextRetryLane & 62914560) && (nextRetryLane = 4194304);
    return lane;
  }
  function createLaneMap(initial) {
    for (var laneMap = [], i = 0; 31 > i; i++) laneMap.push(initial);
    return laneMap;
  }
  function markRootUpdated$1(root3, updateLane) {
    root3.pendingLanes |= updateLane;
    268435456 !== updateLane && (root3.suspendedLanes = 0, root3.pingedLanes = 0, root3.warmLanes = 0);
  }
  function markRootFinished(root3, finishedLanes, remainingLanes, spawnedLane, updatedLanes, suspendedRetryLanes) {
    var previouslyPendingLanes = root3.pendingLanes;
    root3.pendingLanes = remainingLanes;
    root3.suspendedLanes = 0;
    root3.pingedLanes = 0;
    root3.warmLanes = 0;
    root3.expiredLanes &= remainingLanes;
    root3.entangledLanes &= remainingLanes;
    root3.errorRecoveryDisabledLanes &= remainingLanes;
    root3.shellSuspendCounter = 0;
    var entanglements = root3.entanglements, expirationTimes = root3.expirationTimes, hiddenUpdates = root3.hiddenUpdates;
    for (remainingLanes = previouslyPendingLanes & ~remainingLanes; 0 < remainingLanes; ) {
      var index$7 = 31 - clz32(remainingLanes), lane = 1 << index$7;
      entanglements[index$7] = 0;
      expirationTimes[index$7] = -1;
      var hiddenUpdatesForLane = hiddenUpdates[index$7];
      if (null !== hiddenUpdatesForLane)
        for (hiddenUpdates[index$7] = null, index$7 = 0; index$7 < hiddenUpdatesForLane.length; index$7++) {
          var update = hiddenUpdatesForLane[index$7];
          null !== update && (update.lane &= -536870913);
        }
      remainingLanes &= ~lane;
    }
    0 !== spawnedLane && markSpawnedDeferredLane(root3, spawnedLane, 0);
    0 !== suspendedRetryLanes && 0 === updatedLanes && 0 !== root3.tag && (root3.suspendedLanes |= suspendedRetryLanes & ~(previouslyPendingLanes & ~finishedLanes));
  }
  function markSpawnedDeferredLane(root3, spawnedLane, entangledLanes) {
    root3.pendingLanes |= spawnedLane;
    root3.suspendedLanes &= ~spawnedLane;
    var spawnedLaneIndex = 31 - clz32(spawnedLane);
    root3.entangledLanes |= spawnedLane;
    root3.entanglements[spawnedLaneIndex] = root3.entanglements[spawnedLaneIndex] | 1073741824 | entangledLanes & 261930;
  }
  function markRootEntangled(root3, entangledLanes) {
    var rootEntangledLanes = root3.entangledLanes |= entangledLanes;
    for (root3 = root3.entanglements; rootEntangledLanes; ) {
      var index$8 = 31 - clz32(rootEntangledLanes), lane = 1 << index$8;
      lane & entangledLanes | root3[index$8] & entangledLanes && (root3[index$8] |= entangledLanes);
      rootEntangledLanes &= ~lane;
    }
  }
  function getBumpedLaneForHydration(root3, renderLanes2) {
    var renderLane = renderLanes2 & -renderLanes2;
    renderLane = 0 !== (renderLane & 42) ? 1 : getBumpedLaneForHydrationByLane(renderLane);
    return 0 !== (renderLane & (root3.suspendedLanes | renderLanes2)) ? 0 : renderLane;
  }
  function getBumpedLaneForHydrationByLane(lane) {
    switch (lane) {
      case 2:
        lane = 1;
        break;
      case 8:
        lane = 4;
        break;
      case 32:
        lane = 16;
        break;
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
        lane = 128;
        break;
      case 268435456:
        lane = 134217728;
        break;
      default:
        lane = 0;
    }
    return lane;
  }
  function lanesToEventPriority(lanes) {
    lanes &= -lanes;
    return 2 < lanes ? 8 < lanes ? 0 !== (lanes & 134217727) ? 32 : 268435456 : 8 : 2;
  }
  function resolveUpdatePriority() {
    var updatePriority = ReactDOMSharedInternals.p;
    if (0 !== updatePriority) return updatePriority;
    updatePriority = window.event;
    return void 0 === updatePriority ? 32 : getEventPriority(updatePriority.type);
  }
  function runWithPriority(priority, fn) {
    var previousPriority = ReactDOMSharedInternals.p;
    try {
      return ReactDOMSharedInternals.p = priority, fn();
    } finally {
      ReactDOMSharedInternals.p = previousPriority;
    }
  }
  var randomKey = Math.random().toString(36).slice(2), internalInstanceKey = "__reactFiber$" + randomKey, internalPropsKey = "__reactProps$" + randomKey, internalContainerInstanceKey = "__reactContainer$" + randomKey, internalEventHandlersKey = "__reactEvents$" + randomKey, internalEventHandlerListenersKey = "__reactListeners$" + randomKey, internalEventHandlesSetKey = "__reactHandles$" + randomKey, internalRootNodeResourcesKey = "__reactResources$" + randomKey, internalHoistableMarker = "__reactMarker$" + randomKey;
  function detachDeletedInstance(node) {
    delete node[internalInstanceKey];
    delete node[internalPropsKey];
    delete node[internalEventHandlersKey];
    delete node[internalEventHandlerListenersKey];
    delete node[internalEventHandlesSetKey];
  }
  function getClosestInstanceFromNode(targetNode) {
    var targetInst = targetNode[internalInstanceKey];
    if (targetInst) return targetInst;
    for (var parentNode = targetNode.parentNode; parentNode; ) {
      if (targetInst = parentNode[internalContainerInstanceKey] || parentNode[internalInstanceKey]) {
        parentNode = targetInst.alternate;
        if (null !== targetInst.child || null !== parentNode && null !== parentNode.child)
          for (targetNode = getParentHydrationBoundary(targetNode); null !== targetNode; ) {
            if (parentNode = targetNode[internalInstanceKey]) return parentNode;
            targetNode = getParentHydrationBoundary(targetNode);
          }
        return targetInst;
      }
      targetNode = parentNode;
      parentNode = targetNode.parentNode;
    }
    return null;
  }
  function getInstanceFromNode(node) {
    if (node = node[internalInstanceKey] || node[internalContainerInstanceKey]) {
      var tag = node.tag;
      if (5 === tag || 6 === tag || 13 === tag || 31 === tag || 26 === tag || 27 === tag || 3 === tag)
        return node;
    }
    return null;
  }
  function getNodeFromInstance(inst) {
    var tag = inst.tag;
    if (5 === tag || 26 === tag || 27 === tag || 6 === tag) return inst.stateNode;
    throw Error(formatProdErrorMessage(33));
  }
  function getResourcesFromRoot(root3) {
    var resources = root3[internalRootNodeResourcesKey];
    resources || (resources = root3[internalRootNodeResourcesKey] = { hoistableStyles: /* @__PURE__ */ new Map(), hoistableScripts: /* @__PURE__ */ new Map() });
    return resources;
  }
  function markNodeAsHoistable(node) {
    node[internalHoistableMarker] = true;
  }
  var allNativeEvents = /* @__PURE__ */ new Set(), registrationNameDependencies = {};
  function registerTwoPhaseEvent(registrationName, dependencies) {
    registerDirectEvent(registrationName, dependencies);
    registerDirectEvent(registrationName + "Capture", dependencies);
  }
  function registerDirectEvent(registrationName, dependencies) {
    registrationNameDependencies[registrationName] = dependencies;
    for (registrationName = 0; registrationName < dependencies.length; registrationName++)
      allNativeEvents.add(dependencies[registrationName]);
  }
  var VALID_ATTRIBUTE_NAME_REGEX = RegExp(
    "^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"
  ), illegalAttributeNameCache = {}, validatedAttributeNameCache = {};
  function isAttributeNameSafe(attributeName) {
    if (hasOwnProperty.call(validatedAttributeNameCache, attributeName))
      return true;
    if (hasOwnProperty.call(illegalAttributeNameCache, attributeName)) return false;
    if (VALID_ATTRIBUTE_NAME_REGEX.test(attributeName))
      return validatedAttributeNameCache[attributeName] = true;
    illegalAttributeNameCache[attributeName] = true;
    return false;
  }
  function setValueForAttribute(node, name2, value) {
    if (isAttributeNameSafe(name2))
      if (null === value) node.removeAttribute(name2);
      else {
        switch (typeof value) {
          case "undefined":
          case "function":
          case "symbol":
            node.removeAttribute(name2);
            return;
          case "boolean":
            var prefix$10 = name2.toLowerCase().slice(0, 5);
            if ("data-" !== prefix$10 && "aria-" !== prefix$10) {
              node.removeAttribute(name2);
              return;
            }
        }
        node.setAttribute(name2, "" + value);
      }
  }
  function setValueForKnownAttribute(node, name2, value) {
    if (null === value) node.removeAttribute(name2);
    else {
      switch (typeof value) {
        case "undefined":
        case "function":
        case "symbol":
        case "boolean":
          node.removeAttribute(name2);
          return;
      }
      node.setAttribute(name2, "" + value);
    }
  }
  function setValueForNamespacedAttribute(node, namespace, name2, value) {
    if (null === value) node.removeAttribute(name2);
    else {
      switch (typeof value) {
        case "undefined":
        case "function":
        case "symbol":
        case "boolean":
          node.removeAttribute(name2);
          return;
      }
      node.setAttributeNS(namespace, name2, "" + value);
    }
  }
  function getToStringValue(value) {
    switch (typeof value) {
      case "bigint":
      case "boolean":
      case "number":
      case "string":
      case "undefined":
        return value;
      case "object":
        return value;
      default:
        return "";
    }
  }
  function isCheckable(elem) {
    var type = elem.type;
    return (elem = elem.nodeName) && "input" === elem.toLowerCase() && ("checkbox" === type || "radio" === type);
  }
  function trackValueOnNode(node, valueField, currentValue) {
    var descriptor = Object.getOwnPropertyDescriptor(
      node.constructor.prototype,
      valueField
    );
    if (!node.hasOwnProperty(valueField) && "undefined" !== typeof descriptor && "function" === typeof descriptor.get && "function" === typeof descriptor.set) {
      var get = descriptor.get, set = descriptor.set;
      Object.defineProperty(node, valueField, {
        configurable: true,
        get: function() {
          return get.call(this);
        },
        set: function(value) {
          currentValue = "" + value;
          set.call(this, value);
        }
      });
      Object.defineProperty(node, valueField, {
        enumerable: descriptor.enumerable
      });
      return {
        getValue: function() {
          return currentValue;
        },
        setValue: function(value) {
          currentValue = "" + value;
        },
        stopTracking: function() {
          node._valueTracker = null;
          delete node[valueField];
        }
      };
    }
  }
  function track(node) {
    if (!node._valueTracker) {
      var valueField = isCheckable(node) ? "checked" : "value";
      node._valueTracker = trackValueOnNode(
        node,
        valueField,
        "" + node[valueField]
      );
    }
  }
  function updateValueIfChanged(node) {
    if (!node) return false;
    var tracker = node._valueTracker;
    if (!tracker) return true;
    var lastValue = tracker.getValue();
    var value = "";
    node && (value = isCheckable(node) ? node.checked ? "true" : "false" : node.value);
    node = value;
    return node !== lastValue ? (tracker.setValue(node), true) : false;
  }
  function getActiveElement(doc) {
    doc = doc || ("undefined" !== typeof document ? document : void 0);
    if ("undefined" === typeof doc) return null;
    try {
      return doc.activeElement || doc.body;
    } catch (e) {
      return doc.body;
    }
  }
  var escapeSelectorAttributeValueInsideDoubleQuotesRegex = /[\n"\\]/g;
  function escapeSelectorAttributeValueInsideDoubleQuotes(value) {
    return value.replace(
      escapeSelectorAttributeValueInsideDoubleQuotesRegex,
      function(ch) {
        return "\\" + ch.charCodeAt(0).toString(16) + " ";
      }
    );
  }
  function updateInput(element, value, defaultValue, lastDefaultValue, checked, defaultChecked, type, name2) {
    element.name = "";
    null != type && "function" !== typeof type && "symbol" !== typeof type && "boolean" !== typeof type ? element.type = type : element.removeAttribute("type");
    if (null != value)
      if ("number" === type) {
        if (0 === value && "" === element.value || element.value != value)
          element.value = "" + getToStringValue(value);
      } else
        element.value !== "" + getToStringValue(value) && (element.value = "" + getToStringValue(value));
    else
      "submit" !== type && "reset" !== type || element.removeAttribute("value");
    null != value ? setDefaultValue(element, type, getToStringValue(value)) : null != defaultValue ? setDefaultValue(element, type, getToStringValue(defaultValue)) : null != lastDefaultValue && element.removeAttribute("value");
    null == checked && null != defaultChecked && (element.defaultChecked = !!defaultChecked);
    null != checked && (element.checked = checked && "function" !== typeof checked && "symbol" !== typeof checked);
    null != name2 && "function" !== typeof name2 && "symbol" !== typeof name2 && "boolean" !== typeof name2 ? element.name = "" + getToStringValue(name2) : element.removeAttribute("name");
  }
  function initInput(element, value, defaultValue, checked, defaultChecked, type, name2, isHydrating2) {
    null != type && "function" !== typeof type && "symbol" !== typeof type && "boolean" !== typeof type && (element.type = type);
    if (null != value || null != defaultValue) {
      if (!("submit" !== type && "reset" !== type || void 0 !== value && null !== value)) {
        track(element);
        return;
      }
      defaultValue = null != defaultValue ? "" + getToStringValue(defaultValue) : "";
      value = null != value ? "" + getToStringValue(value) : defaultValue;
      isHydrating2 || value === element.value || (element.value = value);
      element.defaultValue = value;
    }
    checked = null != checked ? checked : defaultChecked;
    checked = "function" !== typeof checked && "symbol" !== typeof checked && !!checked;
    element.checked = isHydrating2 ? element.checked : !!checked;
    element.defaultChecked = !!checked;
    null != name2 && "function" !== typeof name2 && "symbol" !== typeof name2 && "boolean" !== typeof name2 && (element.name = name2);
    track(element);
  }
  function setDefaultValue(node, type, value) {
    "number" === type && getActiveElement(node.ownerDocument) === node || node.defaultValue === "" + value || (node.defaultValue = "" + value);
  }
  function updateOptions(node, multiple, propValue, setDefaultSelected) {
    node = node.options;
    if (multiple) {
      multiple = {};
      for (var i = 0; i < propValue.length; i++)
        multiple["$" + propValue[i]] = true;
      for (propValue = 0; propValue < node.length; propValue++)
        i = multiple.hasOwnProperty("$" + node[propValue].value), node[propValue].selected !== i && (node[propValue].selected = i), i && setDefaultSelected && (node[propValue].defaultSelected = true);
    } else {
      propValue = "" + getToStringValue(propValue);
      multiple = null;
      for (i = 0; i < node.length; i++) {
        if (node[i].value === propValue) {
          node[i].selected = true;
          setDefaultSelected && (node[i].defaultSelected = true);
          return;
        }
        null !== multiple || node[i].disabled || (multiple = node[i]);
      }
      null !== multiple && (multiple.selected = true);
    }
  }
  function updateTextarea(element, value, defaultValue) {
    if (null != value && (value = "" + getToStringValue(value), value !== element.value && (element.value = value), null == defaultValue)) {
      element.defaultValue !== value && (element.defaultValue = value);
      return;
    }
    element.defaultValue = null != defaultValue ? "" + getToStringValue(defaultValue) : "";
  }
  function initTextarea(element, value, defaultValue, children) {
    if (null == value) {
      if (null != children) {
        if (null != defaultValue) throw Error(formatProdErrorMessage(92));
        if (isArrayImpl(children)) {
          if (1 < children.length) throw Error(formatProdErrorMessage(93));
          children = children[0];
        }
        defaultValue = children;
      }
      null == defaultValue && (defaultValue = "");
      value = defaultValue;
    }
    defaultValue = getToStringValue(value);
    element.defaultValue = defaultValue;
    children = element.textContent;
    children === defaultValue && "" !== children && null !== children && (element.value = children);
    track(element);
  }
  function setTextContent(node, text) {
    if (text) {
      var firstChild = node.firstChild;
      if (firstChild && firstChild === node.lastChild && 3 === firstChild.nodeType) {
        firstChild.nodeValue = text;
        return;
      }
    }
    node.textContent = text;
  }
  var unitlessNumbers = new Set(
    "animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(
      " "
    )
  );
  function setValueForStyle(style2, styleName, value) {
    var isCustomProperty = 0 === styleName.indexOf("--");
    null == value || "boolean" === typeof value || "" === value ? isCustomProperty ? style2.setProperty(styleName, "") : "float" === styleName ? style2.cssFloat = "" : style2[styleName] = "" : isCustomProperty ? style2.setProperty(styleName, value) : "number" !== typeof value || 0 === value || unitlessNumbers.has(styleName) ? "float" === styleName ? style2.cssFloat = value : style2[styleName] = ("" + value).trim() : style2[styleName] = value + "px";
  }
  function setValueForStyles(node, styles, prevStyles) {
    if (null != styles && "object" !== typeof styles)
      throw Error(formatProdErrorMessage(62));
    node = node.style;
    if (null != prevStyles) {
      for (var styleName in prevStyles)
        !prevStyles.hasOwnProperty(styleName) || null != styles && styles.hasOwnProperty(styleName) || (0 === styleName.indexOf("--") ? node.setProperty(styleName, "") : "float" === styleName ? node.cssFloat = "" : node[styleName] = "");
      for (var styleName$16 in styles)
        styleName = styles[styleName$16], styles.hasOwnProperty(styleName$16) && prevStyles[styleName$16] !== styleName && setValueForStyle(node, styleName$16, styleName);
    } else
      for (var styleName$17 in styles)
        styles.hasOwnProperty(styleName$17) && setValueForStyle(node, styleName$17, styles[styleName$17]);
  }
  function isCustomElement(tagName) {
    if (-1 === tagName.indexOf("-")) return false;
    switch (tagName) {
      case "annotation-xml":
      case "color-profile":
      case "font-face":
      case "font-face-src":
      case "font-face-uri":
      case "font-face-format":
      case "font-face-name":
      case "missing-glyph":
        return false;
      default:
        return true;
    }
  }
  var aliases = /* @__PURE__ */ new Map([
    ["acceptCharset", "accept-charset"],
    ["htmlFor", "for"],
    ["httpEquiv", "http-equiv"],
    ["crossOrigin", "crossorigin"],
    ["accentHeight", "accent-height"],
    ["alignmentBaseline", "alignment-baseline"],
    ["arabicForm", "arabic-form"],
    ["baselineShift", "baseline-shift"],
    ["capHeight", "cap-height"],
    ["clipPath", "clip-path"],
    ["clipRule", "clip-rule"],
    ["colorInterpolation", "color-interpolation"],
    ["colorInterpolationFilters", "color-interpolation-filters"],
    ["colorProfile", "color-profile"],
    ["colorRendering", "color-rendering"],
    ["dominantBaseline", "dominant-baseline"],
    ["enableBackground", "enable-background"],
    ["fillOpacity", "fill-opacity"],
    ["fillRule", "fill-rule"],
    ["floodColor", "flood-color"],
    ["floodOpacity", "flood-opacity"],
    ["fontFamily", "font-family"],
    ["fontSize", "font-size"],
    ["fontSizeAdjust", "font-size-adjust"],
    ["fontStretch", "font-stretch"],
    ["fontStyle", "font-style"],
    ["fontVariant", "font-variant"],
    ["fontWeight", "font-weight"],
    ["glyphName", "glyph-name"],
    ["glyphOrientationHorizontal", "glyph-orientation-horizontal"],
    ["glyphOrientationVertical", "glyph-orientation-vertical"],
    ["horizAdvX", "horiz-adv-x"],
    ["horizOriginX", "horiz-origin-x"],
    ["imageRendering", "image-rendering"],
    ["letterSpacing", "letter-spacing"],
    ["lightingColor", "lighting-color"],
    ["markerEnd", "marker-end"],
    ["markerMid", "marker-mid"],
    ["markerStart", "marker-start"],
    ["overlinePosition", "overline-position"],
    ["overlineThickness", "overline-thickness"],
    ["paintOrder", "paint-order"],
    ["panose-1", "panose-1"],
    ["pointerEvents", "pointer-events"],
    ["renderingIntent", "rendering-intent"],
    ["shapeRendering", "shape-rendering"],
    ["stopColor", "stop-color"],
    ["stopOpacity", "stop-opacity"],
    ["strikethroughPosition", "strikethrough-position"],
    ["strikethroughThickness", "strikethrough-thickness"],
    ["strokeDasharray", "stroke-dasharray"],
    ["strokeDashoffset", "stroke-dashoffset"],
    ["strokeLinecap", "stroke-linecap"],
    ["strokeLinejoin", "stroke-linejoin"],
    ["strokeMiterlimit", "stroke-miterlimit"],
    ["strokeOpacity", "stroke-opacity"],
    ["strokeWidth", "stroke-width"],
    ["textAnchor", "text-anchor"],
    ["textDecoration", "text-decoration"],
    ["textRendering", "text-rendering"],
    ["transformOrigin", "transform-origin"],
    ["underlinePosition", "underline-position"],
    ["underlineThickness", "underline-thickness"],
    ["unicodeBidi", "unicode-bidi"],
    ["unicodeRange", "unicode-range"],
    ["unitsPerEm", "units-per-em"],
    ["vAlphabetic", "v-alphabetic"],
    ["vHanging", "v-hanging"],
    ["vIdeographic", "v-ideographic"],
    ["vMathematical", "v-mathematical"],
    ["vectorEffect", "vector-effect"],
    ["vertAdvY", "vert-adv-y"],
    ["vertOriginX", "vert-origin-x"],
    ["vertOriginY", "vert-origin-y"],
    ["wordSpacing", "word-spacing"],
    ["writingMode", "writing-mode"],
    ["xmlnsXlink", "xmlns:xlink"],
    ["xHeight", "x-height"]
  ]), isJavaScriptProtocol = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
  function sanitizeURL(url) {
    return isJavaScriptProtocol.test("" + url) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : url;
  }
  function noop$1() {
  }
  var currentReplayingEvent = null;
  function getEventTarget(nativeEvent) {
    nativeEvent = nativeEvent.target || nativeEvent.srcElement || window;
    nativeEvent.correspondingUseElement && (nativeEvent = nativeEvent.correspondingUseElement);
    return 3 === nativeEvent.nodeType ? nativeEvent.parentNode : nativeEvent;
  }
  var restoreTarget = null, restoreQueue = null;
  function restoreStateOfTarget(target) {
    var internalInstance = getInstanceFromNode(target);
    if (internalInstance && (target = internalInstance.stateNode)) {
      var props = target[internalPropsKey] || null;
      a: switch (target = internalInstance.stateNode, internalInstance.type) {
        case "input":
          updateInput(
            target,
            props.value,
            props.defaultValue,
            props.defaultValue,
            props.checked,
            props.defaultChecked,
            props.type,
            props.name
          );
          internalInstance = props.name;
          if ("radio" === props.type && null != internalInstance) {
            for (props = target; props.parentNode; ) props = props.parentNode;
            props = props.querySelectorAll(
              'input[name="' + escapeSelectorAttributeValueInsideDoubleQuotes(
                "" + internalInstance
              ) + '"][type="radio"]'
            );
            for (internalInstance = 0; internalInstance < props.length; internalInstance++) {
              var otherNode = props[internalInstance];
              if (otherNode !== target && otherNode.form === target.form) {
                var otherProps = otherNode[internalPropsKey] || null;
                if (!otherProps) throw Error(formatProdErrorMessage(90));
                updateInput(
                  otherNode,
                  otherProps.value,
                  otherProps.defaultValue,
                  otherProps.defaultValue,
                  otherProps.checked,
                  otherProps.defaultChecked,
                  otherProps.type,
                  otherProps.name
                );
              }
            }
            for (internalInstance = 0; internalInstance < props.length; internalInstance++)
              otherNode = props[internalInstance], otherNode.form === target.form && updateValueIfChanged(otherNode);
          }
          break a;
        case "textarea":
          updateTextarea(target, props.value, props.defaultValue);
          break a;
        case "select":
          internalInstance = props.value, null != internalInstance && updateOptions(target, !!props.multiple, internalInstance, false);
      }
    }
  }
  var isInsideEventHandler = false;
  function batchedUpdates$1(fn, a, b) {
    if (isInsideEventHandler) return fn(a, b);
    isInsideEventHandler = true;
    try {
      var JSCompiler_inline_result = fn(a);
      return JSCompiler_inline_result;
    } finally {
      if (isInsideEventHandler = false, null !== restoreTarget || null !== restoreQueue) {
        if (flushSyncWork$1(), restoreTarget && (a = restoreTarget, fn = restoreQueue, restoreQueue = restoreTarget = null, restoreStateOfTarget(a), fn))
          for (a = 0; a < fn.length; a++) restoreStateOfTarget(fn[a]);
      }
    }
  }
  function getListener(inst, registrationName) {
    var stateNode = inst.stateNode;
    if (null === stateNode) return null;
    var props = stateNode[internalPropsKey] || null;
    if (null === props) return null;
    stateNode = props[registrationName];
    a: switch (registrationName) {
      case "onClick":
      case "onClickCapture":
      case "onDoubleClick":
      case "onDoubleClickCapture":
      case "onMouseDown":
      case "onMouseDownCapture":
      case "onMouseMove":
      case "onMouseMoveCapture":
      case "onMouseUp":
      case "onMouseUpCapture":
      case "onMouseEnter":
        (props = !props.disabled) || (inst = inst.type, props = !("button" === inst || "input" === inst || "select" === inst || "textarea" === inst));
        inst = !props;
        break a;
      default:
        inst = false;
    }
    if (inst) return null;
    if (stateNode && "function" !== typeof stateNode)
      throw Error(
        formatProdErrorMessage(231, registrationName, typeof stateNode)
      );
    return stateNode;
  }
  var canUseDOM = !("undefined" === typeof window || "undefined" === typeof window.document || "undefined" === typeof window.document.createElement), passiveBrowserEventsSupported = false;
  if (canUseDOM)
    try {
      var options = {};
      Object.defineProperty(options, "passive", {
        get: function() {
          passiveBrowserEventsSupported = true;
        }
      });
      window.addEventListener("test", options, options);
      window.removeEventListener("test", options, options);
    } catch (e) {
      passiveBrowserEventsSupported = false;
    }
  var root2 = null, startText = null, fallbackText = null;
  function getData() {
    if (fallbackText) return fallbackText;
    var start, startValue = startText, startLength = startValue.length, end, endValue = "value" in root2 ? root2.value : root2.textContent, endLength = endValue.length;
    for (start = 0; start < startLength && startValue[start] === endValue[start]; start++) ;
    var minEnd = startLength - start;
    for (end = 1; end <= minEnd && startValue[startLength - end] === endValue[endLength - end]; end++) ;
    return fallbackText = endValue.slice(start, 1 < end ? 1 - end : void 0);
  }
  function getEventCharCode(nativeEvent) {
    var keyCode = nativeEvent.keyCode;
    "charCode" in nativeEvent ? (nativeEvent = nativeEvent.charCode, 0 === nativeEvent && 13 === keyCode && (nativeEvent = 13)) : nativeEvent = keyCode;
    10 === nativeEvent && (nativeEvent = 13);
    return 32 <= nativeEvent || 13 === nativeEvent ? nativeEvent : 0;
  }
  function functionThatReturnsTrue() {
    return true;
  }
  function functionThatReturnsFalse() {
    return false;
  }
  function createSyntheticEvent(Interface) {
    function SyntheticBaseEvent(reactName, reactEventType, targetInst, nativeEvent, nativeEventTarget) {
      this._reactName = reactName;
      this._targetInst = targetInst;
      this.type = reactEventType;
      this.nativeEvent = nativeEvent;
      this.target = nativeEventTarget;
      this.currentTarget = null;
      for (var propName in Interface)
        Interface.hasOwnProperty(propName) && (reactName = Interface[propName], this[propName] = reactName ? reactName(nativeEvent) : nativeEvent[propName]);
      this.isDefaultPrevented = (null != nativeEvent.defaultPrevented ? nativeEvent.defaultPrevented : false === nativeEvent.returnValue) ? functionThatReturnsTrue : functionThatReturnsFalse;
      this.isPropagationStopped = functionThatReturnsFalse;
      return this;
    }
    assign(SyntheticBaseEvent.prototype, {
      preventDefault: function() {
        this.defaultPrevented = true;
        var event = this.nativeEvent;
        event && (event.preventDefault ? event.preventDefault() : "unknown" !== typeof event.returnValue && (event.returnValue = false), this.isDefaultPrevented = functionThatReturnsTrue);
      },
      stopPropagation: function() {
        var event = this.nativeEvent;
        event && (event.stopPropagation ? event.stopPropagation() : "unknown" !== typeof event.cancelBubble && (event.cancelBubble = true), this.isPropagationStopped = functionThatReturnsTrue);
      },
      persist: function() {
      },
      isPersistent: functionThatReturnsTrue
    });
    return SyntheticBaseEvent;
  }
  var EventInterface = {
    eventPhase: 0,
    bubbles: 0,
    cancelable: 0,
    timeStamp: function(event) {
      return event.timeStamp || Date.now();
    },
    defaultPrevented: 0,
    isTrusted: 0
  }, SyntheticEvent = createSyntheticEvent(EventInterface), UIEventInterface = assign({}, EventInterface, { view: 0, detail: 0 }), SyntheticUIEvent = createSyntheticEvent(UIEventInterface), lastMovementX, lastMovementY, lastMouseEvent, MouseEventInterface = assign({}, UIEventInterface, {
    screenX: 0,
    screenY: 0,
    clientX: 0,
    clientY: 0,
    pageX: 0,
    pageY: 0,
    ctrlKey: 0,
    shiftKey: 0,
    altKey: 0,
    metaKey: 0,
    getModifierState: getEventModifierState,
    button: 0,
    buttons: 0,
    relatedTarget: function(event) {
      return void 0 === event.relatedTarget ? event.fromElement === event.srcElement ? event.toElement : event.fromElement : event.relatedTarget;
    },
    movementX: function(event) {
      if ("movementX" in event) return event.movementX;
      event !== lastMouseEvent && (lastMouseEvent && "mousemove" === event.type ? (lastMovementX = event.screenX - lastMouseEvent.screenX, lastMovementY = event.screenY - lastMouseEvent.screenY) : lastMovementY = lastMovementX = 0, lastMouseEvent = event);
      return lastMovementX;
    },
    movementY: function(event) {
      return "movementY" in event ? event.movementY : lastMovementY;
    }
  }), SyntheticMouseEvent = createSyntheticEvent(MouseEventInterface), DragEventInterface = assign({}, MouseEventInterface, { dataTransfer: 0 }), SyntheticDragEvent = createSyntheticEvent(DragEventInterface), FocusEventInterface = assign({}, UIEventInterface, { relatedTarget: 0 }), SyntheticFocusEvent = createSyntheticEvent(FocusEventInterface), AnimationEventInterface = assign({}, EventInterface, {
    animationName: 0,
    elapsedTime: 0,
    pseudoElement: 0
  }), SyntheticAnimationEvent = createSyntheticEvent(AnimationEventInterface), ClipboardEventInterface = assign({}, EventInterface, {
    clipboardData: function(event) {
      return "clipboardData" in event ? event.clipboardData : window.clipboardData;
    }
  }), SyntheticClipboardEvent = createSyntheticEvent(ClipboardEventInterface), CompositionEventInterface = assign({}, EventInterface, { data: 0 }), SyntheticCompositionEvent = createSyntheticEvent(CompositionEventInterface), normalizeKey = {
    Esc: "Escape",
    Spacebar: " ",
    Left: "ArrowLeft",
    Up: "ArrowUp",
    Right: "ArrowRight",
    Down: "ArrowDown",
    Del: "Delete",
    Win: "OS",
    Menu: "ContextMenu",
    Apps: "ContextMenu",
    Scroll: "ScrollLock",
    MozPrintableKey: "Unidentified"
  }, translateToKey = {
    8: "Backspace",
    9: "Tab",
    12: "Clear",
    13: "Enter",
    16: "Shift",
    17: "Control",
    18: "Alt",
    19: "Pause",
    20: "CapsLock",
    27: "Escape",
    32: " ",
    33: "PageUp",
    34: "PageDown",
    35: "End",
    36: "Home",
    37: "ArrowLeft",
    38: "ArrowUp",
    39: "ArrowRight",
    40: "ArrowDown",
    45: "Insert",
    46: "Delete",
    112: "F1",
    113: "F2",
    114: "F3",
    115: "F4",
    116: "F5",
    117: "F6",
    118: "F7",
    119: "F8",
    120: "F9",
    121: "F10",
    122: "F11",
    123: "F12",
    144: "NumLock",
    145: "ScrollLock",
    224: "Meta"
  }, modifierKeyToProp = {
    Alt: "altKey",
    Control: "ctrlKey",
    Meta: "metaKey",
    Shift: "shiftKey"
  };
  function modifierStateGetter(keyArg) {
    var nativeEvent = this.nativeEvent;
    return nativeEvent.getModifierState ? nativeEvent.getModifierState(keyArg) : (keyArg = modifierKeyToProp[keyArg]) ? !!nativeEvent[keyArg] : false;
  }
  function getEventModifierState() {
    return modifierStateGetter;
  }
  var KeyboardEventInterface = assign({}, UIEventInterface, {
    key: function(nativeEvent) {
      if (nativeEvent.key) {
        var key = normalizeKey[nativeEvent.key] || nativeEvent.key;
        if ("Unidentified" !== key) return key;
      }
      return "keypress" === nativeEvent.type ? (nativeEvent = getEventCharCode(nativeEvent), 13 === nativeEvent ? "Enter" : String.fromCharCode(nativeEvent)) : "keydown" === nativeEvent.type || "keyup" === nativeEvent.type ? translateToKey[nativeEvent.keyCode] || "Unidentified" : "";
    },
    code: 0,
    location: 0,
    ctrlKey: 0,
    shiftKey: 0,
    altKey: 0,
    metaKey: 0,
    repeat: 0,
    locale: 0,
    getModifierState: getEventModifierState,
    charCode: function(event) {
      return "keypress" === event.type ? getEventCharCode(event) : 0;
    },
    keyCode: function(event) {
      return "keydown" === event.type || "keyup" === event.type ? event.keyCode : 0;
    },
    which: function(event) {
      return "keypress" === event.type ? getEventCharCode(event) : "keydown" === event.type || "keyup" === event.type ? event.keyCode : 0;
    }
  }), SyntheticKeyboardEvent = createSyntheticEvent(KeyboardEventInterface), PointerEventInterface = assign({}, MouseEventInterface, {
    pointerId: 0,
    width: 0,
    height: 0,
    pressure: 0,
    tangentialPressure: 0,
    tiltX: 0,
    tiltY: 0,
    twist: 0,
    pointerType: 0,
    isPrimary: 0
  }), SyntheticPointerEvent = createSyntheticEvent(PointerEventInterface), TouchEventInterface = assign({}, UIEventInterface, {
    touches: 0,
    targetTouches: 0,
    changedTouches: 0,
    altKey: 0,
    metaKey: 0,
    ctrlKey: 0,
    shiftKey: 0,
    getModifierState: getEventModifierState
  }), SyntheticTouchEvent = createSyntheticEvent(TouchEventInterface), TransitionEventInterface = assign({}, EventInterface, {
    propertyName: 0,
    elapsedTime: 0,
    pseudoElement: 0
  }), SyntheticTransitionEvent = createSyntheticEvent(TransitionEventInterface), WheelEventInterface = assign({}, MouseEventInterface, {
    deltaX: function(event) {
      return "deltaX" in event ? event.deltaX : "wheelDeltaX" in event ? -event.wheelDeltaX : 0;
    },
    deltaY: function(event) {
      return "deltaY" in event ? event.deltaY : "wheelDeltaY" in event ? -event.wheelDeltaY : "wheelDelta" in event ? -event.wheelDelta : 0;
    },
    deltaZ: 0,
    deltaMode: 0
  }), SyntheticWheelEvent = createSyntheticEvent(WheelEventInterface), ToggleEventInterface = assign({}, EventInterface, {
    newState: 0,
    oldState: 0
  }), SyntheticToggleEvent = createSyntheticEvent(ToggleEventInterface), END_KEYCODES = [9, 13, 27, 32], canUseCompositionEvent = canUseDOM && "CompositionEvent" in window, documentMode = null;
  canUseDOM && "documentMode" in document && (documentMode = document.documentMode);
  var canUseTextInputEvent = canUseDOM && "TextEvent" in window && !documentMode, useFallbackCompositionData = canUseDOM && (!canUseCompositionEvent || documentMode && 8 < documentMode && 11 >= documentMode), SPACEBAR_CHAR = String.fromCharCode(32), hasSpaceKeypress = false;
  function isFallbackCompositionEnd(domEventName, nativeEvent) {
    switch (domEventName) {
      case "keyup":
        return -1 !== END_KEYCODES.indexOf(nativeEvent.keyCode);
      case "keydown":
        return 229 !== nativeEvent.keyCode;
      case "keypress":
      case "mousedown":
      case "focusout":
        return true;
      default:
        return false;
    }
  }
  function getDataFromCustomEvent(nativeEvent) {
    nativeEvent = nativeEvent.detail;
    return "object" === typeof nativeEvent && "data" in nativeEvent ? nativeEvent.data : null;
  }
  var isComposing = false;
  function getNativeBeforeInputChars(domEventName, nativeEvent) {
    switch (domEventName) {
      case "compositionend":
        return getDataFromCustomEvent(nativeEvent);
      case "keypress":
        if (32 !== nativeEvent.which) return null;
        hasSpaceKeypress = true;
        return SPACEBAR_CHAR;
      case "textInput":
        return domEventName = nativeEvent.data, domEventName === SPACEBAR_CHAR && hasSpaceKeypress ? null : domEventName;
      default:
        return null;
    }
  }
  function getFallbackBeforeInputChars(domEventName, nativeEvent) {
    if (isComposing)
      return "compositionend" === domEventName || !canUseCompositionEvent && isFallbackCompositionEnd(domEventName, nativeEvent) ? (domEventName = getData(), fallbackText = startText = root2 = null, isComposing = false, domEventName) : null;
    switch (domEventName) {
      case "paste":
        return null;
      case "keypress":
        if (!(nativeEvent.ctrlKey || nativeEvent.altKey || nativeEvent.metaKey) || nativeEvent.ctrlKey && nativeEvent.altKey) {
          if (nativeEvent.char && 1 < nativeEvent.char.length)
            return nativeEvent.char;
          if (nativeEvent.which) return String.fromCharCode(nativeEvent.which);
        }
        return null;
      case "compositionend":
        return useFallbackCompositionData && "ko" !== nativeEvent.locale ? null : nativeEvent.data;
      default:
        return null;
    }
  }
  var supportedInputTypes = {
    color: true,
    date: true,
    datetime: true,
    "datetime-local": true,
    email: true,
    month: true,
    number: true,
    password: true,
    range: true,
    search: true,
    tel: true,
    text: true,
    time: true,
    url: true,
    week: true
  };
  function isTextInputElement(elem) {
    var nodeName = elem && elem.nodeName && elem.nodeName.toLowerCase();
    return "input" === nodeName ? !!supportedInputTypes[elem.type] : "textarea" === nodeName ? true : false;
  }
  function createAndAccumulateChangeEvent(dispatchQueue, inst, nativeEvent, target) {
    restoreTarget ? restoreQueue ? restoreQueue.push(target) : restoreQueue = [target] : restoreTarget = target;
    inst = accumulateTwoPhaseListeners(inst, "onChange");
    0 < inst.length && (nativeEvent = new SyntheticEvent(
      "onChange",
      "change",
      null,
      nativeEvent,
      target
    ), dispatchQueue.push({ event: nativeEvent, listeners: inst }));
  }
  var activeElement$1 = null, activeElementInst$1 = null;
  function runEventInBatch(dispatchQueue) {
    processDispatchQueue(dispatchQueue, 0);
  }
  function getInstIfValueChanged(targetInst) {
    var targetNode = getNodeFromInstance(targetInst);
    if (updateValueIfChanged(targetNode)) return targetInst;
  }
  function getTargetInstForChangeEvent(domEventName, targetInst) {
    if ("change" === domEventName) return targetInst;
  }
  var isInputEventSupported = false;
  if (canUseDOM) {
    var JSCompiler_inline_result$jscomp$286;
    if (canUseDOM) {
      var isSupported$jscomp$inline_427 = "oninput" in document;
      if (!isSupported$jscomp$inline_427) {
        var element$jscomp$inline_428 = document.createElement("div");
        element$jscomp$inline_428.setAttribute("oninput", "return;");
        isSupported$jscomp$inline_427 = "function" === typeof element$jscomp$inline_428.oninput;
      }
      JSCompiler_inline_result$jscomp$286 = isSupported$jscomp$inline_427;
    } else JSCompiler_inline_result$jscomp$286 = false;
    isInputEventSupported = JSCompiler_inline_result$jscomp$286 && (!document.documentMode || 9 < document.documentMode);
  }
  function stopWatchingForValueChange() {
    activeElement$1 && (activeElement$1.detachEvent("onpropertychange", handlePropertyChange), activeElementInst$1 = activeElement$1 = null);
  }
  function handlePropertyChange(nativeEvent) {
    if ("value" === nativeEvent.propertyName && getInstIfValueChanged(activeElementInst$1)) {
      var dispatchQueue = [];
      createAndAccumulateChangeEvent(
        dispatchQueue,
        activeElementInst$1,
        nativeEvent,
        getEventTarget(nativeEvent)
      );
      batchedUpdates$1(runEventInBatch, dispatchQueue);
    }
  }
  function handleEventsForInputEventPolyfill(domEventName, target, targetInst) {
    "focusin" === domEventName ? (stopWatchingForValueChange(), activeElement$1 = target, activeElementInst$1 = targetInst, activeElement$1.attachEvent("onpropertychange", handlePropertyChange)) : "focusout" === domEventName && stopWatchingForValueChange();
  }
  function getTargetInstForInputEventPolyfill(domEventName) {
    if ("selectionchange" === domEventName || "keyup" === domEventName || "keydown" === domEventName)
      return getInstIfValueChanged(activeElementInst$1);
  }
  function getTargetInstForClickEvent(domEventName, targetInst) {
    if ("click" === domEventName) return getInstIfValueChanged(targetInst);
  }
  function getTargetInstForInputOrChangeEvent(domEventName, targetInst) {
    if ("input" === domEventName || "change" === domEventName)
      return getInstIfValueChanged(targetInst);
  }
  function is(x, y) {
    return x === y && (0 !== x || 1 / x === 1 / y) || x !== x && y !== y;
  }
  var objectIs = "function" === typeof Object.is ? Object.is : is;
  function shallowEqual(objA, objB) {
    if (objectIs(objA, objB)) return true;
    if ("object" !== typeof objA || null === objA || "object" !== typeof objB || null === objB)
      return false;
    var keysA = Object.keys(objA), keysB = Object.keys(objB);
    if (keysA.length !== keysB.length) return false;
    for (keysB = 0; keysB < keysA.length; keysB++) {
      var currentKey = keysA[keysB];
      if (!hasOwnProperty.call(objB, currentKey) || !objectIs(objA[currentKey], objB[currentKey]))
        return false;
    }
    return true;
  }
  function getLeafNode(node) {
    for (; node && node.firstChild; ) node = node.firstChild;
    return node;
  }
  function getNodeForCharacterOffset(root3, offset) {
    var node = getLeafNode(root3);
    root3 = 0;
    for (var nodeEnd; node; ) {
      if (3 === node.nodeType) {
        nodeEnd = root3 + node.textContent.length;
        if (root3 <= offset && nodeEnd >= offset)
          return { node, offset: offset - root3 };
        root3 = nodeEnd;
      }
      a: {
        for (; node; ) {
          if (node.nextSibling) {
            node = node.nextSibling;
            break a;
          }
          node = node.parentNode;
        }
        node = void 0;
      }
      node = getLeafNode(node);
    }
  }
  function containsNode(outerNode, innerNode) {
    return outerNode && innerNode ? outerNode === innerNode ? true : outerNode && 3 === outerNode.nodeType ? false : innerNode && 3 === innerNode.nodeType ? containsNode(outerNode, innerNode.parentNode) : "contains" in outerNode ? outerNode.contains(innerNode) : outerNode.compareDocumentPosition ? !!(outerNode.compareDocumentPosition(innerNode) & 16) : false : false;
  }
  function getActiveElementDeep(containerInfo) {
    containerInfo = null != containerInfo && null != containerInfo.ownerDocument && null != containerInfo.ownerDocument.defaultView ? containerInfo.ownerDocument.defaultView : window;
    for (var element = getActiveElement(containerInfo.document); element instanceof containerInfo.HTMLIFrameElement; ) {
      try {
        var JSCompiler_inline_result = "string" === typeof element.contentWindow.location.href;
      } catch (err) {
        JSCompiler_inline_result = false;
      }
      if (JSCompiler_inline_result) containerInfo = element.contentWindow;
      else break;
      element = getActiveElement(containerInfo.document);
    }
    return element;
  }
  function hasSelectionCapabilities(elem) {
    var nodeName = elem && elem.nodeName && elem.nodeName.toLowerCase();
    return nodeName && ("input" === nodeName && ("text" === elem.type || "search" === elem.type || "tel" === elem.type || "url" === elem.type || "password" === elem.type) || "textarea" === nodeName || "true" === elem.contentEditable);
  }
  var skipSelectionChangeEvent = canUseDOM && "documentMode" in document && 11 >= document.documentMode, activeElement = null, activeElementInst = null, lastSelection = null, mouseDown = false;
  function constructSelectEvent(dispatchQueue, nativeEvent, nativeEventTarget) {
    var doc = nativeEventTarget.window === nativeEventTarget ? nativeEventTarget.document : 9 === nativeEventTarget.nodeType ? nativeEventTarget : nativeEventTarget.ownerDocument;
    mouseDown || null == activeElement || activeElement !== getActiveElement(doc) || (doc = activeElement, "selectionStart" in doc && hasSelectionCapabilities(doc) ? doc = { start: doc.selectionStart, end: doc.selectionEnd } : (doc = (doc.ownerDocument && doc.ownerDocument.defaultView || window).getSelection(), doc = {
      anchorNode: doc.anchorNode,
      anchorOffset: doc.anchorOffset,
      focusNode: doc.focusNode,
      focusOffset: doc.focusOffset
    }), lastSelection && shallowEqual(lastSelection, doc) || (lastSelection = doc, doc = accumulateTwoPhaseListeners(activeElementInst, "onSelect"), 0 < doc.length && (nativeEvent = new SyntheticEvent(
      "onSelect",
      "select",
      null,
      nativeEvent,
      nativeEventTarget
    ), dispatchQueue.push({ event: nativeEvent, listeners: doc }), nativeEvent.target = activeElement)));
  }
  function makePrefixMap(styleProp, eventName) {
    var prefixes = {};
    prefixes[styleProp.toLowerCase()] = eventName.toLowerCase();
    prefixes["Webkit" + styleProp] = "webkit" + eventName;
    prefixes["Moz" + styleProp] = "moz" + eventName;
    return prefixes;
  }
  var vendorPrefixes = {
    animationend: makePrefixMap("Animation", "AnimationEnd"),
    animationiteration: makePrefixMap("Animation", "AnimationIteration"),
    animationstart: makePrefixMap("Animation", "AnimationStart"),
    transitionrun: makePrefixMap("Transition", "TransitionRun"),
    transitionstart: makePrefixMap("Transition", "TransitionStart"),
    transitioncancel: makePrefixMap("Transition", "TransitionCancel"),
    transitionend: makePrefixMap("Transition", "TransitionEnd")
  }, prefixedEventNames = {}, style = {};
  canUseDOM && (style = document.createElement("div").style, "AnimationEvent" in window || (delete vendorPrefixes.animationend.animation, delete vendorPrefixes.animationiteration.animation, delete vendorPrefixes.animationstart.animation), "TransitionEvent" in window || delete vendorPrefixes.transitionend.transition);
  function getVendorPrefixedEventName(eventName) {
    if (prefixedEventNames[eventName]) return prefixedEventNames[eventName];
    if (!vendorPrefixes[eventName]) return eventName;
    var prefixMap = vendorPrefixes[eventName], styleProp;
    for (styleProp in prefixMap)
      if (prefixMap.hasOwnProperty(styleProp) && styleProp in style)
        return prefixedEventNames[eventName] = prefixMap[styleProp];
    return eventName;
  }
  var ANIMATION_END = getVendorPrefixedEventName("animationend"), ANIMATION_ITERATION = getVendorPrefixedEventName("animationiteration"), ANIMATION_START = getVendorPrefixedEventName("animationstart"), TRANSITION_RUN = getVendorPrefixedEventName("transitionrun"), TRANSITION_START = getVendorPrefixedEventName("transitionstart"), TRANSITION_CANCEL = getVendorPrefixedEventName("transitioncancel"), TRANSITION_END = getVendorPrefixedEventName("transitionend"), topLevelEventsToReactNames = /* @__PURE__ */ new Map(), simpleEventPluginEvents = "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(
    " "
  );
  simpleEventPluginEvents.push("scrollEnd");
  function registerSimpleEvent(domEventName, reactName) {
    topLevelEventsToReactNames.set(domEventName, reactName);
    registerTwoPhaseEvent(reactName, [domEventName]);
  }
  var reportGlobalError = "function" === typeof reportError ? reportError : function(error) {
    if ("object" === typeof window && "function" === typeof window.ErrorEvent) {
      var event = new window.ErrorEvent("error", {
        bubbles: true,
        cancelable: true,
        message: "object" === typeof error && null !== error && "string" === typeof error.message ? String(error.message) : String(error),
        error
      });
      if (!window.dispatchEvent(event)) return;
    } else if ("object" === typeof process && "function" === typeof process.emit) {
      process.emit("uncaughtException", error);
      return;
    }
    console.error(error);
  }, concurrentQueues = [], concurrentQueuesIndex = 0, concurrentlyUpdatedLanes = 0;
  function finishQueueingConcurrentUpdates() {
    for (var endIndex = concurrentQueuesIndex, i = concurrentlyUpdatedLanes = concurrentQueuesIndex = 0; i < endIndex; ) {
      var fiber = concurrentQueues[i];
      concurrentQueues[i++] = null;
      var queue = concurrentQueues[i];
      concurrentQueues[i++] = null;
      var update = concurrentQueues[i];
      concurrentQueues[i++] = null;
      var lane = concurrentQueues[i];
      concurrentQueues[i++] = null;
      if (null !== queue && null !== update) {
        var pending = queue.pending;
        null === pending ? update.next = update : (update.next = pending.next, pending.next = update);
        queue.pending = update;
      }
      0 !== lane && markUpdateLaneFromFiberToRoot(fiber, update, lane);
    }
  }
  function enqueueUpdate$1(fiber, queue, update, lane) {
    concurrentQueues[concurrentQueuesIndex++] = fiber;
    concurrentQueues[concurrentQueuesIndex++] = queue;
    concurrentQueues[concurrentQueuesIndex++] = update;
    concurrentQueues[concurrentQueuesIndex++] = lane;
    concurrentlyUpdatedLanes |= lane;
    fiber.lanes |= lane;
    fiber = fiber.alternate;
    null !== fiber && (fiber.lanes |= lane);
  }
  function enqueueConcurrentHookUpdate(fiber, queue, update, lane) {
    enqueueUpdate$1(fiber, queue, update, lane);
    return getRootForUpdatedFiber(fiber);
  }
  function enqueueConcurrentRenderForLane(fiber, lane) {
    enqueueUpdate$1(fiber, null, null, lane);
    return getRootForUpdatedFiber(fiber);
  }
  function markUpdateLaneFromFiberToRoot(sourceFiber, update, lane) {
    sourceFiber.lanes |= lane;
    var alternate = sourceFiber.alternate;
    null !== alternate && (alternate.lanes |= lane);
    for (var isHidden = false, parent = sourceFiber.return; null !== parent; )
      parent.childLanes |= lane, alternate = parent.alternate, null !== alternate && (alternate.childLanes |= lane), 22 === parent.tag && (sourceFiber = parent.stateNode, null === sourceFiber || sourceFiber._visibility & 1 || (isHidden = true)), sourceFiber = parent, parent = parent.return;
    return 3 === sourceFiber.tag ? (parent = sourceFiber.stateNode, isHidden && null !== update && (isHidden = 31 - clz32(lane), sourceFiber = parent.hiddenUpdates, alternate = sourceFiber[isHidden], null === alternate ? sourceFiber[isHidden] = [update] : alternate.push(update), update.lane = lane | 536870912), parent) : null;
  }
  function getRootForUpdatedFiber(sourceFiber) {
    if (50 < nestedUpdateCount)
      throw nestedUpdateCount = 0, rootWithNestedUpdates = null, Error(formatProdErrorMessage(185));
    for (var parent = sourceFiber.return; null !== parent; )
      sourceFiber = parent, parent = sourceFiber.return;
    return 3 === sourceFiber.tag ? sourceFiber.stateNode : null;
  }
  var emptyContextObject = {};
  function FiberNode(tag, pendingProps, key, mode) {
    this.tag = tag;
    this.key = key;
    this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null;
    this.index = 0;
    this.refCleanup = this.ref = null;
    this.pendingProps = pendingProps;
    this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null;
    this.mode = mode;
    this.subtreeFlags = this.flags = 0;
    this.deletions = null;
    this.childLanes = this.lanes = 0;
    this.alternate = null;
  }
  function createFiberImplClass(tag, pendingProps, key, mode) {
    return new FiberNode(tag, pendingProps, key, mode);
  }
  function shouldConstruct(Component) {
    Component = Component.prototype;
    return !(!Component || !Component.isReactComponent);
  }
  function createWorkInProgress(current, pendingProps) {
    var workInProgress2 = current.alternate;
    null === workInProgress2 ? (workInProgress2 = createFiberImplClass(
      current.tag,
      pendingProps,
      current.key,
      current.mode
    ), workInProgress2.elementType = current.elementType, workInProgress2.type = current.type, workInProgress2.stateNode = current.stateNode, workInProgress2.alternate = current, current.alternate = workInProgress2) : (workInProgress2.pendingProps = pendingProps, workInProgress2.type = current.type, workInProgress2.flags = 0, workInProgress2.subtreeFlags = 0, workInProgress2.deletions = null);
    workInProgress2.flags = current.flags & 65011712;
    workInProgress2.childLanes = current.childLanes;
    workInProgress2.lanes = current.lanes;
    workInProgress2.child = current.child;
    workInProgress2.memoizedProps = current.memoizedProps;
    workInProgress2.memoizedState = current.memoizedState;
    workInProgress2.updateQueue = current.updateQueue;
    pendingProps = current.dependencies;
    workInProgress2.dependencies = null === pendingProps ? null : { lanes: pendingProps.lanes, firstContext: pendingProps.firstContext };
    workInProgress2.sibling = current.sibling;
    workInProgress2.index = current.index;
    workInProgress2.ref = current.ref;
    workInProgress2.refCleanup = current.refCleanup;
    return workInProgress2;
  }
  function resetWorkInProgress(workInProgress2, renderLanes2) {
    workInProgress2.flags &= 65011714;
    var current = workInProgress2.alternate;
    null === current ? (workInProgress2.childLanes = 0, workInProgress2.lanes = renderLanes2, workInProgress2.child = null, workInProgress2.subtreeFlags = 0, workInProgress2.memoizedProps = null, workInProgress2.memoizedState = null, workInProgress2.updateQueue = null, workInProgress2.dependencies = null, workInProgress2.stateNode = null) : (workInProgress2.childLanes = current.childLanes, workInProgress2.lanes = current.lanes, workInProgress2.child = current.child, workInProgress2.subtreeFlags = 0, workInProgress2.deletions = null, workInProgress2.memoizedProps = current.memoizedProps, workInProgress2.memoizedState = current.memoizedState, workInProgress2.updateQueue = current.updateQueue, workInProgress2.type = current.type, renderLanes2 = current.dependencies, workInProgress2.dependencies = null === renderLanes2 ? null : {
      lanes: renderLanes2.lanes,
      firstContext: renderLanes2.firstContext
    });
    return workInProgress2;
  }
  function createFiberFromTypeAndProps(type, key, pendingProps, owner, mode, lanes) {
    var fiberTag = 0;
    owner = type;
    if ("function" === typeof type) shouldConstruct(type) && (fiberTag = 1);
    else if ("string" === typeof type)
      fiberTag = isHostHoistableType(
        type,
        pendingProps,
        contextStackCursor.current
      ) ? 26 : "html" === type || "head" === type || "body" === type ? 27 : 5;
    else
      a: switch (type) {
        case REACT_ACTIVITY_TYPE:
          return type = createFiberImplClass(31, pendingProps, key, mode), type.elementType = REACT_ACTIVITY_TYPE, type.lanes = lanes, type;
        case REACT_FRAGMENT_TYPE:
          return createFiberFromFragment(pendingProps.children, mode, lanes, key);
        case REACT_STRICT_MODE_TYPE:
          fiberTag = 8;
          mode |= 24;
          break;
        case REACT_PROFILER_TYPE:
          return type = createFiberImplClass(12, pendingProps, key, mode | 2), type.elementType = REACT_PROFILER_TYPE, type.lanes = lanes, type;
        case REACT_SUSPENSE_TYPE:
          return type = createFiberImplClass(13, pendingProps, key, mode), type.elementType = REACT_SUSPENSE_TYPE, type.lanes = lanes, type;
        case REACT_SUSPENSE_LIST_TYPE:
          return type = createFiberImplClass(19, pendingProps, key, mode), type.elementType = REACT_SUSPENSE_LIST_TYPE, type.lanes = lanes, type;
        default:
          if ("object" === typeof type && null !== type)
            switch (type.$$typeof) {
              case REACT_CONTEXT_TYPE:
                fiberTag = 10;
                break a;
              case REACT_CONSUMER_TYPE:
                fiberTag = 9;
                break a;
              case REACT_FORWARD_REF_TYPE:
                fiberTag = 11;
                break a;
              case REACT_MEMO_TYPE:
                fiberTag = 14;
                break a;
              case REACT_LAZY_TYPE:
                fiberTag = 16;
                owner = null;
                break a;
            }
          fiberTag = 29;
          pendingProps = Error(
            formatProdErrorMessage(130, null === type ? "null" : typeof type, "")
          );
          owner = null;
      }
    key = createFiberImplClass(fiberTag, pendingProps, key, mode);
    key.elementType = type;
    key.type = owner;
    key.lanes = lanes;
    return key;
  }
  function createFiberFromFragment(elements, mode, lanes, key) {
    elements = createFiberImplClass(7, elements, key, mode);
    elements.lanes = lanes;
    return elements;
  }
  function createFiberFromText(content, mode, lanes) {
    content = createFiberImplClass(6, content, null, mode);
    content.lanes = lanes;
    return content;
  }
  function createFiberFromDehydratedFragment(dehydratedNode) {
    var fiber = createFiberImplClass(18, null, null, 0);
    fiber.stateNode = dehydratedNode;
    return fiber;
  }
  function createFiberFromPortal(portal, mode, lanes) {
    mode = createFiberImplClass(
      4,
      null !== portal.children ? portal.children : [],
      portal.key,
      mode
    );
    mode.lanes = lanes;
    mode.stateNode = {
      containerInfo: portal.containerInfo,
      pendingChildren: null,
      implementation: portal.implementation
    };
    return mode;
  }
  var CapturedStacks = /* @__PURE__ */ new WeakMap();
  function createCapturedValueAtFiber(value, source) {
    if ("object" === typeof value && null !== value) {
      var existing = CapturedStacks.get(value);
      if (void 0 !== existing) return existing;
      source = {
        value,
        source,
        stack: getStackByFiberInDevAndProd(source)
      };
      CapturedStacks.set(value, source);
      return source;
    }
    return {
      value,
      source,
      stack: getStackByFiberInDevAndProd(source)
    };
  }
  var forkStack = [], forkStackIndex = 0, treeForkProvider = null, treeForkCount = 0, idStack = [], idStackIndex = 0, treeContextProvider = null, treeContextId = 1, treeContextOverflow = "";
  function pushTreeFork(workInProgress2, totalChildren) {
    forkStack[forkStackIndex++] = treeForkCount;
    forkStack[forkStackIndex++] = treeForkProvider;
    treeForkProvider = workInProgress2;
    treeForkCount = totalChildren;
  }
  function pushTreeId(workInProgress2, totalChildren, index2) {
    idStack[idStackIndex++] = treeContextId;
    idStack[idStackIndex++] = treeContextOverflow;
    idStack[idStackIndex++] = treeContextProvider;
    treeContextProvider = workInProgress2;
    var baseIdWithLeadingBit = treeContextId;
    workInProgress2 = treeContextOverflow;
    var baseLength = 32 - clz32(baseIdWithLeadingBit) - 1;
    baseIdWithLeadingBit &= ~(1 << baseLength);
    index2 += 1;
    var length = 32 - clz32(totalChildren) + baseLength;
    if (30 < length) {
      var numberOfOverflowBits = baseLength - baseLength % 5;
      length = (baseIdWithLeadingBit & (1 << numberOfOverflowBits) - 1).toString(32);
      baseIdWithLeadingBit >>= numberOfOverflowBits;
      baseLength -= numberOfOverflowBits;
      treeContextId = 1 << 32 - clz32(totalChildren) + baseLength | index2 << baseLength | baseIdWithLeadingBit;
      treeContextOverflow = length + workInProgress2;
    } else
      treeContextId = 1 << length | index2 << baseLength | baseIdWithLeadingBit, treeContextOverflow = workInProgress2;
  }
  function pushMaterializedTreeId(workInProgress2) {
    null !== workInProgress2.return && (pushTreeFork(workInProgress2, 1), pushTreeId(workInProgress2, 1, 0));
  }
  function popTreeContext(workInProgress2) {
    for (; workInProgress2 === treeForkProvider; )
      treeForkProvider = forkStack[--forkStackIndex], forkStack[forkStackIndex] = null, treeForkCount = forkStack[--forkStackIndex], forkStack[forkStackIndex] = null;
    for (; workInProgress2 === treeContextProvider; )
      treeContextProvider = idStack[--idStackIndex], idStack[idStackIndex] = null, treeContextOverflow = idStack[--idStackIndex], idStack[idStackIndex] = null, treeContextId = idStack[--idStackIndex], idStack[idStackIndex] = null;
  }
  function restoreSuspendedTreeContext(workInProgress2, suspendedContext) {
    idStack[idStackIndex++] = treeContextId;
    idStack[idStackIndex++] = treeContextOverflow;
    idStack[idStackIndex++] = treeContextProvider;
    treeContextId = suspendedContext.id;
    treeContextOverflow = suspendedContext.overflow;
    treeContextProvider = workInProgress2;
  }
  var hydrationParentFiber = null, nextHydratableInstance = null, isHydrating = false, hydrationErrors = null, rootOrSingletonContext = false, HydrationMismatchException = Error(formatProdErrorMessage(519));
  function throwOnHydrationMismatch(fiber) {
    var error = Error(
      formatProdErrorMessage(
        418,
        1 < arguments.length && void 0 !== arguments[1] && arguments[1] ? "text" : "HTML",
        ""
      )
    );
    queueHydrationError(createCapturedValueAtFiber(error, fiber));
    throw HydrationMismatchException;
  }
  function prepareToHydrateHostInstance(fiber) {
    var instance = fiber.stateNode, type = fiber.type, props = fiber.memoizedProps;
    instance[internalInstanceKey] = fiber;
    instance[internalPropsKey] = props;
    switch (type) {
      case "dialog":
        listenToNonDelegatedEvent("cancel", instance);
        listenToNonDelegatedEvent("close", instance);
        break;
      case "iframe":
      case "object":
      case "embed":
        listenToNonDelegatedEvent("load", instance);
        break;
      case "video":
      case "audio":
        for (type = 0; type < mediaEventTypes.length; type++)
          listenToNonDelegatedEvent(mediaEventTypes[type], instance);
        break;
      case "source":
        listenToNonDelegatedEvent("error", instance);
        break;
      case "img":
      case "image":
      case "link":
        listenToNonDelegatedEvent("error", instance);
        listenToNonDelegatedEvent("load", instance);
        break;
      case "details":
        listenToNonDelegatedEvent("toggle", instance);
        break;
      case "input":
        listenToNonDelegatedEvent("invalid", instance);
        initInput(
          instance,
          props.value,
          props.defaultValue,
          props.checked,
          props.defaultChecked,
          props.type,
          props.name,
          true
        );
        break;
      case "select":
        listenToNonDelegatedEvent("invalid", instance);
        break;
      case "textarea":
        listenToNonDelegatedEvent("invalid", instance), initTextarea(instance, props.value, props.defaultValue, props.children);
    }
    type = props.children;
    "string" !== typeof type && "number" !== typeof type && "bigint" !== typeof type || instance.textContent === "" + type || true === props.suppressHydrationWarning || checkForUnmatchedText(instance.textContent, type) ? (null != props.popover && (listenToNonDelegatedEvent("beforetoggle", instance), listenToNonDelegatedEvent("toggle", instance)), null != props.onScroll && listenToNonDelegatedEvent("scroll", instance), null != props.onScrollEnd && listenToNonDelegatedEvent("scrollend", instance), null != props.onClick && (instance.onclick = noop$1), instance = true) : instance = false;
    instance || throwOnHydrationMismatch(fiber, true);
  }
  function popToNextHostParent(fiber) {
    for (hydrationParentFiber = fiber.return; hydrationParentFiber; )
      switch (hydrationParentFiber.tag) {
        case 5:
        case 31:
        case 13:
          rootOrSingletonContext = false;
          return;
        case 27:
        case 3:
          rootOrSingletonContext = true;
          return;
        default:
          hydrationParentFiber = hydrationParentFiber.return;
      }
  }
  function popHydrationState(fiber) {
    if (fiber !== hydrationParentFiber) return false;
    if (!isHydrating) return popToNextHostParent(fiber), isHydrating = true, false;
    var tag = fiber.tag, JSCompiler_temp;
    if (JSCompiler_temp = 3 !== tag && 27 !== tag) {
      if (JSCompiler_temp = 5 === tag)
        JSCompiler_temp = fiber.type, JSCompiler_temp = !("form" !== JSCompiler_temp && "button" !== JSCompiler_temp) || shouldSetTextContent(fiber.type, fiber.memoizedProps);
      JSCompiler_temp = !JSCompiler_temp;
    }
    JSCompiler_temp && nextHydratableInstance && throwOnHydrationMismatch(fiber);
    popToNextHostParent(fiber);
    if (13 === tag) {
      fiber = fiber.memoizedState;
      fiber = null !== fiber ? fiber.dehydrated : null;
      if (!fiber) throw Error(formatProdErrorMessage(317));
      nextHydratableInstance = getNextHydratableInstanceAfterHydrationBoundary(fiber);
    } else if (31 === tag) {
      fiber = fiber.memoizedState;
      fiber = null !== fiber ? fiber.dehydrated : null;
      if (!fiber) throw Error(formatProdErrorMessage(317));
      nextHydratableInstance = getNextHydratableInstanceAfterHydrationBoundary(fiber);
    } else
      27 === tag ? (tag = nextHydratableInstance, isSingletonScope(fiber.type) ? (fiber = previousHydratableOnEnteringScopedSingleton, previousHydratableOnEnteringScopedSingleton = null, nextHydratableInstance = fiber) : nextHydratableInstance = tag) : nextHydratableInstance = hydrationParentFiber ? getNextHydratable(fiber.stateNode.nextSibling) : null;
    return true;
  }
  function resetHydrationState() {
    nextHydratableInstance = hydrationParentFiber = null;
    isHydrating = false;
  }
  function upgradeHydrationErrorsToRecoverable() {
    var queuedErrors = hydrationErrors;
    null !== queuedErrors && (null === workInProgressRootRecoverableErrors ? workInProgressRootRecoverableErrors = queuedErrors : workInProgressRootRecoverableErrors.push.apply(
      workInProgressRootRecoverableErrors,
      queuedErrors
    ), hydrationErrors = null);
    return queuedErrors;
  }
  function queueHydrationError(error) {
    null === hydrationErrors ? hydrationErrors = [error] : hydrationErrors.push(error);
  }
  var valueCursor = createCursor(null), currentlyRenderingFiber$1 = null, lastContextDependency = null;
  function pushProvider(providerFiber, context, nextValue) {
    push(valueCursor, context._currentValue);
    context._currentValue = nextValue;
  }
  function popProvider(context) {
    context._currentValue = valueCursor.current;
    pop(valueCursor);
  }
  function scheduleContextWorkOnParentPath(parent, renderLanes2, propagationRoot) {
    for (; null !== parent; ) {
      var alternate = parent.alternate;
      (parent.childLanes & renderLanes2) !== renderLanes2 ? (parent.childLanes |= renderLanes2, null !== alternate && (alternate.childLanes |= renderLanes2)) : null !== alternate && (alternate.childLanes & renderLanes2) !== renderLanes2 && (alternate.childLanes |= renderLanes2);
      if (parent === propagationRoot) break;
      parent = parent.return;
    }
  }
  function propagateContextChanges(workInProgress2, contexts, renderLanes2, forcePropagateEntireTree) {
    var fiber = workInProgress2.child;
    null !== fiber && (fiber.return = workInProgress2);
    for (; null !== fiber; ) {
      var list = fiber.dependencies;
      if (null !== list) {
        var nextFiber = fiber.child;
        list = list.firstContext;
        a: for (; null !== list; ) {
          var dependency = list;
          list = fiber;
          for (var i = 0; i < contexts.length; i++)
            if (dependency.context === contexts[i]) {
              list.lanes |= renderLanes2;
              dependency = list.alternate;
              null !== dependency && (dependency.lanes |= renderLanes2);
              scheduleContextWorkOnParentPath(
                list.return,
                renderLanes2,
                workInProgress2
              );
              forcePropagateEntireTree || (nextFiber = null);
              break a;
            }
          list = dependency.next;
        }
      } else if (18 === fiber.tag) {
        nextFiber = fiber.return;
        if (null === nextFiber) throw Error(formatProdErrorMessage(341));
        nextFiber.lanes |= renderLanes2;
        list = nextFiber.alternate;
        null !== list && (list.lanes |= renderLanes2);
        scheduleContextWorkOnParentPath(nextFiber, renderLanes2, workInProgress2);
        nextFiber = null;
      } else nextFiber = fiber.child;
      if (null !== nextFiber) nextFiber.return = fiber;
      else
        for (nextFiber = fiber; null !== nextFiber; ) {
          if (nextFiber === workInProgress2) {
            nextFiber = null;
            break;
          }
          fiber = nextFiber.sibling;
          if (null !== fiber) {
            fiber.return = nextFiber.return;
            nextFiber = fiber;
            break;
          }
          nextFiber = nextFiber.return;
        }
      fiber = nextFiber;
    }
  }
  function propagateParentContextChanges(current, workInProgress2, renderLanes2, forcePropagateEntireTree) {
    current = null;
    for (var parent = workInProgress2, isInsidePropagationBailout = false; null !== parent; ) {
      if (!isInsidePropagationBailout) {
        if (0 !== (parent.flags & 524288)) isInsidePropagationBailout = true;
        else if (0 !== (parent.flags & 262144)) break;
      }
      if (10 === parent.tag) {
        var currentParent = parent.alternate;
        if (null === currentParent) throw Error(formatProdErrorMessage(387));
        currentParent = currentParent.memoizedProps;
        if (null !== currentParent) {
          var context = parent.type;
          objectIs(parent.pendingProps.value, currentParent.value) || (null !== current ? current.push(context) : current = [context]);
        }
      } else if (parent === hostTransitionProviderCursor.current) {
        currentParent = parent.alternate;
        if (null === currentParent) throw Error(formatProdErrorMessage(387));
        currentParent.memoizedState.memoizedState !== parent.memoizedState.memoizedState && (null !== current ? current.push(HostTransitionContext) : current = [HostTransitionContext]);
      }
      parent = parent.return;
    }
    null !== current && propagateContextChanges(
      workInProgress2,
      current,
      renderLanes2,
      forcePropagateEntireTree
    );
    workInProgress2.flags |= 262144;
  }
  function checkIfContextChanged(currentDependencies) {
    for (currentDependencies = currentDependencies.firstContext; null !== currentDependencies; ) {
      if (!objectIs(
        currentDependencies.context._currentValue,
        currentDependencies.memoizedValue
      ))
        return true;
      currentDependencies = currentDependencies.next;
    }
    return false;
  }
  function prepareToReadContext(workInProgress2) {
    currentlyRenderingFiber$1 = workInProgress2;
    lastContextDependency = null;
    workInProgress2 = workInProgress2.dependencies;
    null !== workInProgress2 && (workInProgress2.firstContext = null);
  }
  function readContext(context) {
    return readContextForConsumer(currentlyRenderingFiber$1, context);
  }
  function readContextDuringReconciliation(consumer, context) {
    null === currentlyRenderingFiber$1 && prepareToReadContext(consumer);
    return readContextForConsumer(consumer, context);
  }
  function readContextForConsumer(consumer, context) {
    var value = context._currentValue;
    context = { context, memoizedValue: value, next: null };
    if (null === lastContextDependency) {
      if (null === consumer) throw Error(formatProdErrorMessage(308));
      lastContextDependency = context;
      consumer.dependencies = { lanes: 0, firstContext: context };
      consumer.flags |= 524288;
    } else lastContextDependency = lastContextDependency.next = context;
    return value;
  }
  var AbortControllerLocal = "undefined" !== typeof AbortController ? AbortController : function() {
    var listeners = [], signal = this.signal = {
      aborted: false,
      addEventListener: function(type, listener) {
        listeners.push(listener);
      }
    };
    this.abort = function() {
      signal.aborted = true;
      listeners.forEach(function(listener) {
        return listener();
      });
    };
  }, scheduleCallback$2 = Scheduler.unstable_scheduleCallback, NormalPriority = Scheduler.unstable_NormalPriority, CacheContext = {
    $$typeof: REACT_CONTEXT_TYPE,
    Consumer: null,
    Provider: null,
    _currentValue: null,
    _currentValue2: null,
    _threadCount: 0
  };
  function createCache() {
    return {
      controller: new AbortControllerLocal(),
      data: /* @__PURE__ */ new Map(),
      refCount: 0
    };
  }
  function releaseCache(cache) {
    cache.refCount--;
    0 === cache.refCount && scheduleCallback$2(NormalPriority, function() {
      cache.controller.abort();
    });
  }
  var currentEntangledListeners = null, currentEntangledPendingCount = 0, currentEntangledLane = 0, currentEntangledActionThenable = null;
  function entangleAsyncAction(transition, thenable) {
    if (null === currentEntangledListeners) {
      var entangledListeners = currentEntangledListeners = [];
      currentEntangledPendingCount = 0;
      currentEntangledLane = requestTransitionLane();
      currentEntangledActionThenable = {
        status: "pending",
        value: void 0,
        then: function(resolve) {
          entangledListeners.push(resolve);
        }
      };
    }
    currentEntangledPendingCount++;
    thenable.then(pingEngtangledActionScope, pingEngtangledActionScope);
    return thenable;
  }
  function pingEngtangledActionScope() {
    if (0 === --currentEntangledPendingCount && null !== currentEntangledListeners) {
      null !== currentEntangledActionThenable && (currentEntangledActionThenable.status = "fulfilled");
      var listeners = currentEntangledListeners;
      currentEntangledListeners = null;
      currentEntangledLane = 0;
      currentEntangledActionThenable = null;
      for (var i = 0; i < listeners.length; i++) (0, listeners[i])();
    }
  }
  function chainThenableValue(thenable, result) {
    var listeners = [], thenableWithOverride = {
      status: "pending",
      value: null,
      reason: null,
      then: function(resolve) {
        listeners.push(resolve);
      }
    };
    thenable.then(
      function() {
        thenableWithOverride.status = "fulfilled";
        thenableWithOverride.value = result;
        for (var i = 0; i < listeners.length; i++) (0, listeners[i])(result);
      },
      function(error) {
        thenableWithOverride.status = "rejected";
        thenableWithOverride.reason = error;
        for (error = 0; error < listeners.length; error++)
          (0, listeners[error])(void 0);
      }
    );
    return thenableWithOverride;
  }
  var prevOnStartTransitionFinish = ReactSharedInternals.S;
  ReactSharedInternals.S = function(transition, returnValue) {
    globalMostRecentTransitionTime = now();
    "object" === typeof returnValue && null !== returnValue && "function" === typeof returnValue.then && entangleAsyncAction(transition, returnValue);
    null !== prevOnStartTransitionFinish && prevOnStartTransitionFinish(transition, returnValue);
  };
  var resumedCache = createCursor(null);
  function peekCacheFromPool() {
    var cacheResumedFromPreviousRender = resumedCache.current;
    return null !== cacheResumedFromPreviousRender ? cacheResumedFromPreviousRender : workInProgressRoot.pooledCache;
  }
  function pushTransition(offscreenWorkInProgress, prevCachePool) {
    null === prevCachePool ? push(resumedCache, resumedCache.current) : push(resumedCache, prevCachePool.pool);
  }
  function getSuspendedCache() {
    var cacheFromPool = peekCacheFromPool();
    return null === cacheFromPool ? null : { parent: CacheContext._currentValue, pool: cacheFromPool };
  }
  var SuspenseException = Error(formatProdErrorMessage(460)), SuspenseyCommitException = Error(formatProdErrorMessage(474)), SuspenseActionException = Error(formatProdErrorMessage(542)), noopSuspenseyCommitThenable = { then: function() {
  } };
  function isThenableResolved(thenable) {
    thenable = thenable.status;
    return "fulfilled" === thenable || "rejected" === thenable;
  }
  function trackUsedThenable(thenableState2, thenable, index2) {
    index2 = thenableState2[index2];
    void 0 === index2 ? thenableState2.push(thenable) : index2 !== thenable && (thenable.then(noop$1, noop$1), thenable = index2);
    switch (thenable.status) {
      case "fulfilled":
        return thenable.value;
      case "rejected":
        throw thenableState2 = thenable.reason, checkIfUseWrappedInAsyncCatch(thenableState2), thenableState2;
      default:
        if ("string" === typeof thenable.status) thenable.then(noop$1, noop$1);
        else {
          thenableState2 = workInProgressRoot;
          if (null !== thenableState2 && 100 < thenableState2.shellSuspendCounter)
            throw Error(formatProdErrorMessage(482));
          thenableState2 = thenable;
          thenableState2.status = "pending";
          thenableState2.then(
            function(fulfilledValue) {
              if ("pending" === thenable.status) {
                var fulfilledThenable = thenable;
                fulfilledThenable.status = "fulfilled";
                fulfilledThenable.value = fulfilledValue;
              }
            },
            function(error) {
              if ("pending" === thenable.status) {
                var rejectedThenable = thenable;
                rejectedThenable.status = "rejected";
                rejectedThenable.reason = error;
              }
            }
          );
        }
        switch (thenable.status) {
          case "fulfilled":
            return thenable.value;
          case "rejected":
            throw thenableState2 = thenable.reason, checkIfUseWrappedInAsyncCatch(thenableState2), thenableState2;
        }
        suspendedThenable = thenable;
        throw SuspenseException;
    }
  }
  function resolveLazy(lazyType) {
    try {
      var init = lazyType._init;
      return init(lazyType._payload);
    } catch (x) {
      if (null !== x && "object" === typeof x && "function" === typeof x.then)
        throw suspendedThenable = x, SuspenseException;
      throw x;
    }
  }
  var suspendedThenable = null;
  function getSuspendedThenable() {
    if (null === suspendedThenable) throw Error(formatProdErrorMessage(459));
    var thenable = suspendedThenable;
    suspendedThenable = null;
    return thenable;
  }
  function checkIfUseWrappedInAsyncCatch(rejectedReason) {
    if (rejectedReason === SuspenseException || rejectedReason === SuspenseActionException)
      throw Error(formatProdErrorMessage(483));
  }
  var thenableState$1 = null, thenableIndexCounter$1 = 0;
  function unwrapThenable(thenable) {
    var index2 = thenableIndexCounter$1;
    thenableIndexCounter$1 += 1;
    null === thenableState$1 && (thenableState$1 = []);
    return trackUsedThenable(thenableState$1, thenable, index2);
  }
  function coerceRef(workInProgress2, element) {
    element = element.props.ref;
    workInProgress2.ref = void 0 !== element ? element : null;
  }
  function throwOnInvalidObjectTypeImpl(returnFiber, newChild) {
    if (newChild.$$typeof === REACT_LEGACY_ELEMENT_TYPE)
      throw Error(formatProdErrorMessage(525));
    returnFiber = Object.prototype.toString.call(newChild);
    throw Error(
      formatProdErrorMessage(
        31,
        "[object Object]" === returnFiber ? "object with keys {" + Object.keys(newChild).join(", ") + "}" : returnFiber
      )
    );
  }
  function createChildReconciler(shouldTrackSideEffects) {
    function deleteChild(returnFiber, childToDelete) {
      if (shouldTrackSideEffects) {
        var deletions = returnFiber.deletions;
        null === deletions ? (returnFiber.deletions = [childToDelete], returnFiber.flags |= 16) : deletions.push(childToDelete);
      }
    }
    function deleteRemainingChildren(returnFiber, currentFirstChild) {
      if (!shouldTrackSideEffects) return null;
      for (; null !== currentFirstChild; )
        deleteChild(returnFiber, currentFirstChild), currentFirstChild = currentFirstChild.sibling;
      return null;
    }
    function mapRemainingChildren(currentFirstChild) {
      for (var existingChildren = /* @__PURE__ */ new Map(); null !== currentFirstChild; )
        null !== currentFirstChild.key ? existingChildren.set(currentFirstChild.key, currentFirstChild) : existingChildren.set(currentFirstChild.index, currentFirstChild), currentFirstChild = currentFirstChild.sibling;
      return existingChildren;
    }
    function useFiber(fiber, pendingProps) {
      fiber = createWorkInProgress(fiber, pendingProps);
      fiber.index = 0;
      fiber.sibling = null;
      return fiber;
    }
    function placeChild(newFiber, lastPlacedIndex, newIndex) {
      newFiber.index = newIndex;
      if (!shouldTrackSideEffects)
        return newFiber.flags |= 1048576, lastPlacedIndex;
      newIndex = newFiber.alternate;
      if (null !== newIndex)
        return newIndex = newIndex.index, newIndex < lastPlacedIndex ? (newFiber.flags |= 67108866, lastPlacedIndex) : newIndex;
      newFiber.flags |= 67108866;
      return lastPlacedIndex;
    }
    function placeSingleChild(newFiber) {
      shouldTrackSideEffects && null === newFiber.alternate && (newFiber.flags |= 67108866);
      return newFiber;
    }
    function updateTextNode(returnFiber, current, textContent, lanes) {
      if (null === current || 6 !== current.tag)
        return current = createFiberFromText(textContent, returnFiber.mode, lanes), current.return = returnFiber, current;
      current = useFiber(current, textContent);
      current.return = returnFiber;
      return current;
    }
    function updateElement(returnFiber, current, element, lanes) {
      var elementType = element.type;
      if (elementType === REACT_FRAGMENT_TYPE)
        return updateFragment(
          returnFiber,
          current,
          element.props.children,
          lanes,
          element.key
        );
      if (null !== current && (current.elementType === elementType || "object" === typeof elementType && null !== elementType && elementType.$$typeof === REACT_LAZY_TYPE && resolveLazy(elementType) === current.type))
        return current = useFiber(current, element.props), coerceRef(current, element), current.return = returnFiber, current;
      current = createFiberFromTypeAndProps(
        element.type,
        element.key,
        element.props,
        null,
        returnFiber.mode,
        lanes
      );
      coerceRef(current, element);
      current.return = returnFiber;
      return current;
    }
    function updatePortal(returnFiber, current, portal, lanes) {
      if (null === current || 4 !== current.tag || current.stateNode.containerInfo !== portal.containerInfo || current.stateNode.implementation !== portal.implementation)
        return current = createFiberFromPortal(portal, returnFiber.mode, lanes), current.return = returnFiber, current;
      current = useFiber(current, portal.children || []);
      current.return = returnFiber;
      return current;
    }
    function updateFragment(returnFiber, current, fragment, lanes, key) {
      if (null === current || 7 !== current.tag)
        return current = createFiberFromFragment(
          fragment,
          returnFiber.mode,
          lanes,
          key
        ), current.return = returnFiber, current;
      current = useFiber(current, fragment);
      current.return = returnFiber;
      return current;
    }
    function createChild(returnFiber, newChild, lanes) {
      if ("string" === typeof newChild && "" !== newChild || "number" === typeof newChild || "bigint" === typeof newChild)
        return newChild = createFiberFromText(
          "" + newChild,
          returnFiber.mode,
          lanes
        ), newChild.return = returnFiber, newChild;
      if ("object" === typeof newChild && null !== newChild) {
        switch (newChild.$$typeof) {
          case REACT_ELEMENT_TYPE:
            return lanes = createFiberFromTypeAndProps(
              newChild.type,
              newChild.key,
              newChild.props,
              null,
              returnFiber.mode,
              lanes
            ), coerceRef(lanes, newChild), lanes.return = returnFiber, lanes;
          case REACT_PORTAL_TYPE:
            return newChild = createFiberFromPortal(
              newChild,
              returnFiber.mode,
              lanes
            ), newChild.return = returnFiber, newChild;
          case REACT_LAZY_TYPE:
            return newChild = resolveLazy(newChild), createChild(returnFiber, newChild, lanes);
        }
        if (isArrayImpl(newChild) || getIteratorFn(newChild))
          return newChild = createFiberFromFragment(
            newChild,
            returnFiber.mode,
            lanes,
            null
          ), newChild.return = returnFiber, newChild;
        if ("function" === typeof newChild.then)
          return createChild(returnFiber, unwrapThenable(newChild), lanes);
        if (newChild.$$typeof === REACT_CONTEXT_TYPE)
          return createChild(
            returnFiber,
            readContextDuringReconciliation(returnFiber, newChild),
            lanes
          );
        throwOnInvalidObjectTypeImpl(returnFiber, newChild);
      }
      return null;
    }
    function updateSlot(returnFiber, oldFiber, newChild, lanes) {
      var key = null !== oldFiber ? oldFiber.key : null;
      if ("string" === typeof newChild && "" !== newChild || "number" === typeof newChild || "bigint" === typeof newChild)
        return null !== key ? null : updateTextNode(returnFiber, oldFiber, "" + newChild, lanes);
      if ("object" === typeof newChild && null !== newChild) {
        switch (newChild.$$typeof) {
          case REACT_ELEMENT_TYPE:
            return newChild.key === key ? updateElement(returnFiber, oldFiber, newChild, lanes) : null;
          case REACT_PORTAL_TYPE:
            return newChild.key === key ? updatePortal(returnFiber, oldFiber, newChild, lanes) : null;
          case REACT_LAZY_TYPE:
            return newChild = resolveLazy(newChild), updateSlot(returnFiber, oldFiber, newChild, lanes);
        }
        if (isArrayImpl(newChild) || getIteratorFn(newChild))
          return null !== key ? null : updateFragment(returnFiber, oldFiber, newChild, lanes, null);
        if ("function" === typeof newChild.then)
          return updateSlot(
            returnFiber,
            oldFiber,
            unwrapThenable(newChild),
            lanes
          );
        if (newChild.$$typeof === REACT_CONTEXT_TYPE)
          return updateSlot(
            returnFiber,
            oldFiber,
            readContextDuringReconciliation(returnFiber, newChild),
            lanes
          );
        throwOnInvalidObjectTypeImpl(returnFiber, newChild);
      }
      return null;
    }
    function updateFromMap(existingChildren, returnFiber, newIdx, newChild, lanes) {
      if ("string" === typeof newChild && "" !== newChild || "number" === typeof newChild || "bigint" === typeof newChild)
        return existingChildren = existingChildren.get(newIdx) || null, updateTextNode(returnFiber, existingChildren, "" + newChild, lanes);
      if ("object" === typeof newChild && null !== newChild) {
        switch (newChild.$$typeof) {
          case REACT_ELEMENT_TYPE:
            return existingChildren = existingChildren.get(
              null === newChild.key ? newIdx : newChild.key
            ) || null, updateElement(returnFiber, existingChildren, newChild, lanes);
          case REACT_PORTAL_TYPE:
            return existingChildren = existingChildren.get(
              null === newChild.key ? newIdx : newChild.key
            ) || null, updatePortal(returnFiber, existingChildren, newChild, lanes);
          case REACT_LAZY_TYPE:
            return newChild = resolveLazy(newChild), updateFromMap(
              existingChildren,
              returnFiber,
              newIdx,
              newChild,
              lanes
            );
        }
        if (isArrayImpl(newChild) || getIteratorFn(newChild))
          return existingChildren = existingChildren.get(newIdx) || null, updateFragment(returnFiber, existingChildren, newChild, lanes, null);
        if ("function" === typeof newChild.then)
          return updateFromMap(
            existingChildren,
            returnFiber,
            newIdx,
            unwrapThenable(newChild),
            lanes
          );
        if (newChild.$$typeof === REACT_CONTEXT_TYPE)
          return updateFromMap(
            existingChildren,
            returnFiber,
            newIdx,
            readContextDuringReconciliation(returnFiber, newChild),
            lanes
          );
        throwOnInvalidObjectTypeImpl(returnFiber, newChild);
      }
      return null;
    }
    function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren, lanes) {
      for (var resultingFirstChild = null, previousNewFiber = null, oldFiber = currentFirstChild, newIdx = currentFirstChild = 0, nextOldFiber = null; null !== oldFiber && newIdx < newChildren.length; newIdx++) {
        oldFiber.index > newIdx ? (nextOldFiber = oldFiber, oldFiber = null) : nextOldFiber = oldFiber.sibling;
        var newFiber = updateSlot(
          returnFiber,
          oldFiber,
          newChildren[newIdx],
          lanes
        );
        if (null === newFiber) {
          null === oldFiber && (oldFiber = nextOldFiber);
          break;
        }
        shouldTrackSideEffects && oldFiber && null === newFiber.alternate && deleteChild(returnFiber, oldFiber);
        currentFirstChild = placeChild(newFiber, currentFirstChild, newIdx);
        null === previousNewFiber ? resultingFirstChild = newFiber : previousNewFiber.sibling = newFiber;
        previousNewFiber = newFiber;
        oldFiber = nextOldFiber;
      }
      if (newIdx === newChildren.length)
        return deleteRemainingChildren(returnFiber, oldFiber), isHydrating && pushTreeFork(returnFiber, newIdx), resultingFirstChild;
      if (null === oldFiber) {
        for (; newIdx < newChildren.length; newIdx++)
          oldFiber = createChild(returnFiber, newChildren[newIdx], lanes), null !== oldFiber && (currentFirstChild = placeChild(
            oldFiber,
            currentFirstChild,
            newIdx
          ), null === previousNewFiber ? resultingFirstChild = oldFiber : previousNewFiber.sibling = oldFiber, previousNewFiber = oldFiber);
        isHydrating && pushTreeFork(returnFiber, newIdx);
        return resultingFirstChild;
      }
      for (oldFiber = mapRemainingChildren(oldFiber); newIdx < newChildren.length; newIdx++)
        nextOldFiber = updateFromMap(
          oldFiber,
          returnFiber,
          newIdx,
          newChildren[newIdx],
          lanes
        ), null !== nextOldFiber && (shouldTrackSideEffects && null !== nextOldFiber.alternate && oldFiber.delete(
          null === nextOldFiber.key ? newIdx : nextOldFiber.key
        ), currentFirstChild = placeChild(
          nextOldFiber,
          currentFirstChild,
          newIdx
        ), null === previousNewFiber ? resultingFirstChild = nextOldFiber : previousNewFiber.sibling = nextOldFiber, previousNewFiber = nextOldFiber);
      shouldTrackSideEffects && oldFiber.forEach(function(child) {
        return deleteChild(returnFiber, child);
      });
      isHydrating && pushTreeFork(returnFiber, newIdx);
      return resultingFirstChild;
    }
    function reconcileChildrenIterator(returnFiber, currentFirstChild, newChildren, lanes) {
      if (null == newChildren) throw Error(formatProdErrorMessage(151));
      for (var resultingFirstChild = null, previousNewFiber = null, oldFiber = currentFirstChild, newIdx = currentFirstChild = 0, nextOldFiber = null, step = newChildren.next(); null !== oldFiber && !step.done; newIdx++, step = newChildren.next()) {
        oldFiber.index > newIdx ? (nextOldFiber = oldFiber, oldFiber = null) : nextOldFiber = oldFiber.sibling;
        var newFiber = updateSlot(returnFiber, oldFiber, step.value, lanes);
        if (null === newFiber) {
          null === oldFiber && (oldFiber = nextOldFiber);
          break;
        }
        shouldTrackSideEffects && oldFiber && null === newFiber.alternate && deleteChild(returnFiber, oldFiber);
        currentFirstChild = placeChild(newFiber, currentFirstChild, newIdx);
        null === previousNewFiber ? resultingFirstChild = newFiber : previousNewFiber.sibling = newFiber;
        previousNewFiber = newFiber;
        oldFiber = nextOldFiber;
      }
      if (step.done)
        return deleteRemainingChildren(returnFiber, oldFiber), isHydrating && pushTreeFork(returnFiber, newIdx), resultingFirstChild;
      if (null === oldFiber) {
        for (; !step.done; newIdx++, step = newChildren.next())
          step = createChild(returnFiber, step.value, lanes), null !== step && (currentFirstChild = placeChild(step, currentFirstChild, newIdx), null === previousNewFiber ? resultingFirstChild = step : previousNewFiber.sibling = step, previousNewFiber = step);
        isHydrating && pushTreeFork(returnFiber, newIdx);
        return resultingFirstChild;
      }
      for (oldFiber = mapRemainingChildren(oldFiber); !step.done; newIdx++, step = newChildren.next())
        step = updateFromMap(oldFiber, returnFiber, newIdx, step.value, lanes), null !== step && (shouldTrackSideEffects && null !== step.alternate && oldFiber.delete(null === step.key ? newIdx : step.key), currentFirstChild = placeChild(step, currentFirstChild, newIdx), null === previousNewFiber ? resultingFirstChild = step : previousNewFiber.sibling = step, previousNewFiber = step);
      shouldTrackSideEffects && oldFiber.forEach(function(child) {
        return deleteChild(returnFiber, child);
      });
      isHydrating && pushTreeFork(returnFiber, newIdx);
      return resultingFirstChild;
    }
    function reconcileChildFibersImpl(returnFiber, currentFirstChild, newChild, lanes) {
      "object" === typeof newChild && null !== newChild && newChild.type === REACT_FRAGMENT_TYPE && null === newChild.key && (newChild = newChild.props.children);
      if ("object" === typeof newChild && null !== newChild) {
        switch (newChild.$$typeof) {
          case REACT_ELEMENT_TYPE:
            a: {
              for (var key = newChild.key; null !== currentFirstChild; ) {
                if (currentFirstChild.key === key) {
                  key = newChild.type;
                  if (key === REACT_FRAGMENT_TYPE) {
                    if (7 === currentFirstChild.tag) {
                      deleteRemainingChildren(
                        returnFiber,
                        currentFirstChild.sibling
                      );
                      lanes = useFiber(
                        currentFirstChild,
                        newChild.props.children
                      );
                      lanes.return = returnFiber;
                      returnFiber = lanes;
                      break a;
                    }
                  } else if (currentFirstChild.elementType === key || "object" === typeof key && null !== key && key.$$typeof === REACT_LAZY_TYPE && resolveLazy(key) === currentFirstChild.type) {
                    deleteRemainingChildren(
                      returnFiber,
                      currentFirstChild.sibling
                    );
                    lanes = useFiber(currentFirstChild, newChild.props);
                    coerceRef(lanes, newChild);
                    lanes.return = returnFiber;
                    returnFiber = lanes;
                    break a;
                  }
                  deleteRemainingChildren(returnFiber, currentFirstChild);
                  break;
                } else deleteChild(returnFiber, currentFirstChild);
                currentFirstChild = currentFirstChild.sibling;
              }
              newChild.type === REACT_FRAGMENT_TYPE ? (lanes = createFiberFromFragment(
                newChild.props.children,
                returnFiber.mode,
                lanes,
                newChild.key
              ), lanes.return = returnFiber, returnFiber = lanes) : (lanes = createFiberFromTypeAndProps(
                newChild.type,
                newChild.key,
                newChild.props,
                null,
                returnFiber.mode,
                lanes
              ), coerceRef(lanes, newChild), lanes.return = returnFiber, returnFiber = lanes);
            }
            return placeSingleChild(returnFiber);
          case REACT_PORTAL_TYPE:
            a: {
              for (key = newChild.key; null !== currentFirstChild; ) {
                if (currentFirstChild.key === key)
                  if (4 === currentFirstChild.tag && currentFirstChild.stateNode.containerInfo === newChild.containerInfo && currentFirstChild.stateNode.implementation === newChild.implementation) {
                    deleteRemainingChildren(
                      returnFiber,
                      currentFirstChild.sibling
                    );
                    lanes = useFiber(currentFirstChild, newChild.children || []);
                    lanes.return = returnFiber;
                    returnFiber = lanes;
                    break a;
                  } else {
                    deleteRemainingChildren(returnFiber, currentFirstChild);
                    break;
                  }
                else deleteChild(returnFiber, currentFirstChild);
                currentFirstChild = currentFirstChild.sibling;
              }
              lanes = createFiberFromPortal(newChild, returnFiber.mode, lanes);
              lanes.return = returnFiber;
              returnFiber = lanes;
            }
            return placeSingleChild(returnFiber);
          case REACT_LAZY_TYPE:
            return newChild = resolveLazy(newChild), reconcileChildFibersImpl(
              returnFiber,
              currentFirstChild,
              newChild,
              lanes
            );
        }
        if (isArrayImpl(newChild))
          return reconcileChildrenArray(
            returnFiber,
            currentFirstChild,
            newChild,
            lanes
          );
        if (getIteratorFn(newChild)) {
          key = getIteratorFn(newChild);
          if ("function" !== typeof key) throw Error(formatProdErrorMessage(150));
          newChild = key.call(newChild);
          return reconcileChildrenIterator(
            returnFiber,
            currentFirstChild,
            newChild,
            lanes
          );
        }
        if ("function" === typeof newChild.then)
          return reconcileChildFibersImpl(
            returnFiber,
            currentFirstChild,
            unwrapThenable(newChild),
            lanes
          );
        if (newChild.$$typeof === REACT_CONTEXT_TYPE)
          return reconcileChildFibersImpl(
            returnFiber,
            currentFirstChild,
            readContextDuringReconciliation(returnFiber, newChild),
            lanes
          );
        throwOnInvalidObjectTypeImpl(returnFiber, newChild);
      }
      return "string" === typeof newChild && "" !== newChild || "number" === typeof newChild || "bigint" === typeof newChild ? (newChild = "" + newChild, null !== currentFirstChild && 6 === currentFirstChild.tag ? (deleteRemainingChildren(returnFiber, currentFirstChild.sibling), lanes = useFiber(currentFirstChild, newChild), lanes.return = returnFiber, returnFiber = lanes) : (deleteRemainingChildren(returnFiber, currentFirstChild), lanes = createFiberFromText(newChild, returnFiber.mode, lanes), lanes.return = returnFiber, returnFiber = lanes), placeSingleChild(returnFiber)) : deleteRemainingChildren(returnFiber, currentFirstChild);
    }
    return function(returnFiber, currentFirstChild, newChild, lanes) {
      try {
        thenableIndexCounter$1 = 0;
        var firstChildFiber = reconcileChildFibersImpl(
          returnFiber,
          currentFirstChild,
          newChild,
          lanes
        );
        thenableState$1 = null;
        return firstChildFiber;
      } catch (x) {
        if (x === SuspenseException || x === SuspenseActionException) throw x;
        var fiber = createFiberImplClass(29, x, null, returnFiber.mode);
        fiber.lanes = lanes;
        fiber.return = returnFiber;
        return fiber;
      } finally {
      }
    };
  }
  var reconcileChildFibers = createChildReconciler(true), mountChildFibers = createChildReconciler(false), hasForceUpdate = false;
  function initializeUpdateQueue(fiber) {
    fiber.updateQueue = {
      baseState: fiber.memoizedState,
      firstBaseUpdate: null,
      lastBaseUpdate: null,
      shared: { pending: null, lanes: 0, hiddenCallbacks: null },
      callbacks: null
    };
  }
  function cloneUpdateQueue(current, workInProgress2) {
    current = current.updateQueue;
    workInProgress2.updateQueue === current && (workInProgress2.updateQueue = {
      baseState: current.baseState,
      firstBaseUpdate: current.firstBaseUpdate,
      lastBaseUpdate: current.lastBaseUpdate,
      shared: current.shared,
      callbacks: null
    });
  }
  function createUpdate(lane) {
    return { lane, tag: 0, payload: null, callback: null, next: null };
  }
  function enqueueUpdate(fiber, update, lane) {
    var updateQueue = fiber.updateQueue;
    if (null === updateQueue) return null;
    updateQueue = updateQueue.shared;
    if (0 !== (executionContext & 2)) {
      var pending = updateQueue.pending;
      null === pending ? update.next = update : (update.next = pending.next, pending.next = update);
      updateQueue.pending = update;
      update = getRootForUpdatedFiber(fiber);
      markUpdateLaneFromFiberToRoot(fiber, null, lane);
      return update;
    }
    enqueueUpdate$1(fiber, updateQueue, update, lane);
    return getRootForUpdatedFiber(fiber);
  }
  function entangleTransitions(root3, fiber, lane) {
    fiber = fiber.updateQueue;
    if (null !== fiber && (fiber = fiber.shared, 0 !== (lane & 4194048))) {
      var queueLanes = fiber.lanes;
      queueLanes &= root3.pendingLanes;
      lane |= queueLanes;
      fiber.lanes = lane;
      markRootEntangled(root3, lane);
    }
  }
  function enqueueCapturedUpdate(workInProgress2, capturedUpdate) {
    var queue = workInProgress2.updateQueue, current = workInProgress2.alternate;
    if (null !== current && (current = current.updateQueue, queue === current)) {
      var newFirst = null, newLast = null;
      queue = queue.firstBaseUpdate;
      if (null !== queue) {
        do {
          var clone = {
            lane: queue.lane,
            tag: queue.tag,
            payload: queue.payload,
            callback: null,
            next: null
          };
          null === newLast ? newFirst = newLast = clone : newLast = newLast.next = clone;
          queue = queue.next;
        } while (null !== queue);
        null === newLast ? newFirst = newLast = capturedUpdate : newLast = newLast.next = capturedUpdate;
      } else newFirst = newLast = capturedUpdate;
      queue = {
        baseState: current.baseState,
        firstBaseUpdate: newFirst,
        lastBaseUpdate: newLast,
        shared: current.shared,
        callbacks: current.callbacks
      };
      workInProgress2.updateQueue = queue;
      return;
    }
    workInProgress2 = queue.lastBaseUpdate;
    null === workInProgress2 ? queue.firstBaseUpdate = capturedUpdate : workInProgress2.next = capturedUpdate;
    queue.lastBaseUpdate = capturedUpdate;
  }
  var didReadFromEntangledAsyncAction = false;
  function suspendIfUpdateReadFromEntangledAsyncAction() {
    if (didReadFromEntangledAsyncAction) {
      var entangledActionThenable = currentEntangledActionThenable;
      if (null !== entangledActionThenable) throw entangledActionThenable;
    }
  }
  function processUpdateQueue(workInProgress$jscomp$0, props, instance$jscomp$0, renderLanes2) {
    didReadFromEntangledAsyncAction = false;
    var queue = workInProgress$jscomp$0.updateQueue;
    hasForceUpdate = false;
    var firstBaseUpdate = queue.firstBaseUpdate, lastBaseUpdate = queue.lastBaseUpdate, pendingQueue = queue.shared.pending;
    if (null !== pendingQueue) {
      queue.shared.pending = null;
      var lastPendingUpdate = pendingQueue, firstPendingUpdate = lastPendingUpdate.next;
      lastPendingUpdate.next = null;
      null === lastBaseUpdate ? firstBaseUpdate = firstPendingUpdate : lastBaseUpdate.next = firstPendingUpdate;
      lastBaseUpdate = lastPendingUpdate;
      var current = workInProgress$jscomp$0.alternate;
      null !== current && (current = current.updateQueue, pendingQueue = current.lastBaseUpdate, pendingQueue !== lastBaseUpdate && (null === pendingQueue ? current.firstBaseUpdate = firstPendingUpdate : pendingQueue.next = firstPendingUpdate, current.lastBaseUpdate = lastPendingUpdate));
    }
    if (null !== firstBaseUpdate) {
      var newState = queue.baseState;
      lastBaseUpdate = 0;
      current = firstPendingUpdate = lastPendingUpdate = null;
      pendingQueue = firstBaseUpdate;
      do {
        var updateLane = pendingQueue.lane & -536870913, isHiddenUpdate = updateLane !== pendingQueue.lane;
        if (isHiddenUpdate ? (workInProgressRootRenderLanes & updateLane) === updateLane : (renderLanes2 & updateLane) === updateLane) {
          0 !== updateLane && updateLane === currentEntangledLane && (didReadFromEntangledAsyncAction = true);
          null !== current && (current = current.next = {
            lane: 0,
            tag: pendingQueue.tag,
            payload: pendingQueue.payload,
            callback: null,
            next: null
          });
          a: {
            var workInProgress2 = workInProgress$jscomp$0, update = pendingQueue;
            updateLane = props;
            var instance = instance$jscomp$0;
            switch (update.tag) {
              case 1:
                workInProgress2 = update.payload;
                if ("function" === typeof workInProgress2) {
                  newState = workInProgress2.call(instance, newState, updateLane);
                  break a;
                }
                newState = workInProgress2;
                break a;
              case 3:
                workInProgress2.flags = workInProgress2.flags & -65537 | 128;
              case 0:
                workInProgress2 = update.payload;
                updateLane = "function" === typeof workInProgress2 ? workInProgress2.call(instance, newState, updateLane) : workInProgress2;
                if (null === updateLane || void 0 === updateLane) break a;
                newState = assign({}, newState, updateLane);
                break a;
              case 2:
                hasForceUpdate = true;
            }
          }
          updateLane = pendingQueue.callback;
          null !== updateLane && (workInProgress$jscomp$0.flags |= 64, isHiddenUpdate && (workInProgress$jscomp$0.flags |= 8192), isHiddenUpdate = queue.callbacks, null === isHiddenUpdate ? queue.callbacks = [updateLane] : isHiddenUpdate.push(updateLane));
        } else
          isHiddenUpdate = {
            lane: updateLane,
            tag: pendingQueue.tag,
            payload: pendingQueue.payload,
            callback: pendingQueue.callback,
            next: null
          }, null === current ? (firstPendingUpdate = current = isHiddenUpdate, lastPendingUpdate = newState) : current = current.next = isHiddenUpdate, lastBaseUpdate |= updateLane;
        pendingQueue = pendingQueue.next;
        if (null === pendingQueue)
          if (pendingQueue = queue.shared.pending, null === pendingQueue)
            break;
          else
            isHiddenUpdate = pendingQueue, pendingQueue = isHiddenUpdate.next, isHiddenUpdate.next = null, queue.lastBaseUpdate = isHiddenUpdate, queue.shared.pending = null;
      } while (1);
      null === current && (lastPendingUpdate = newState);
      queue.baseState = lastPendingUpdate;
      queue.firstBaseUpdate = firstPendingUpdate;
      queue.lastBaseUpdate = current;
      null === firstBaseUpdate && (queue.shared.lanes = 0);
      workInProgressRootSkippedLanes |= lastBaseUpdate;
      workInProgress$jscomp$0.lanes = lastBaseUpdate;
      workInProgress$jscomp$0.memoizedState = newState;
    }
  }
  function callCallback(callback, context) {
    if ("function" !== typeof callback)
      throw Error(formatProdErrorMessage(191, callback));
    callback.call(context);
  }
  function commitCallbacks(updateQueue, context) {
    var callbacks = updateQueue.callbacks;
    if (null !== callbacks)
      for (updateQueue.callbacks = null, updateQueue = 0; updateQueue < callbacks.length; updateQueue++)
        callCallback(callbacks[updateQueue], context);
  }
  var currentTreeHiddenStackCursor = createCursor(null), prevEntangledRenderLanesCursor = createCursor(0);
  function pushHiddenContext(fiber, context) {
    fiber = entangledRenderLanes;
    push(prevEntangledRenderLanesCursor, fiber);
    push(currentTreeHiddenStackCursor, context);
    entangledRenderLanes = fiber | context.baseLanes;
  }
  function reuseHiddenContextOnStack() {
    push(prevEntangledRenderLanesCursor, entangledRenderLanes);
    push(currentTreeHiddenStackCursor, currentTreeHiddenStackCursor.current);
  }
  function popHiddenContext() {
    entangledRenderLanes = prevEntangledRenderLanesCursor.current;
    pop(currentTreeHiddenStackCursor);
    pop(prevEntangledRenderLanesCursor);
  }
  var suspenseHandlerStackCursor = createCursor(null), shellBoundary = null;
  function pushPrimaryTreeSuspenseHandler(handler) {
    var current = handler.alternate;
    push(suspenseStackCursor, suspenseStackCursor.current & 1);
    push(suspenseHandlerStackCursor, handler);
    null === shellBoundary && (null === current || null !== currentTreeHiddenStackCursor.current ? shellBoundary = handler : null !== current.memoizedState && (shellBoundary = handler));
  }
  function pushDehydratedActivitySuspenseHandler(fiber) {
    push(suspenseStackCursor, suspenseStackCursor.current);
    push(suspenseHandlerStackCursor, fiber);
    null === shellBoundary && (shellBoundary = fiber);
  }
  function pushOffscreenSuspenseHandler(fiber) {
    22 === fiber.tag ? (push(suspenseStackCursor, suspenseStackCursor.current), push(suspenseHandlerStackCursor, fiber), null === shellBoundary && (shellBoundary = fiber)) : reuseSuspenseHandlerOnStack();
  }
  function reuseSuspenseHandlerOnStack() {
    push(suspenseStackCursor, suspenseStackCursor.current);
    push(suspenseHandlerStackCursor, suspenseHandlerStackCursor.current);
  }
  function popSuspenseHandler(fiber) {
    pop(suspenseHandlerStackCursor);
    shellBoundary === fiber && (shellBoundary = null);
    pop(suspenseStackCursor);
  }
  var suspenseStackCursor = createCursor(0);
  function findFirstSuspended(row) {
    for (var node = row; null !== node; ) {
      if (13 === node.tag) {
        var state = node.memoizedState;
        if (null !== state && (state = state.dehydrated, null === state || isSuspenseInstancePending(state) || isSuspenseInstanceFallback(state)))
          return node;
      } else if (19 === node.tag && ("forwards" === node.memoizedProps.revealOrder || "backwards" === node.memoizedProps.revealOrder || "unstable_legacy-backwards" === node.memoizedProps.revealOrder || "together" === node.memoizedProps.revealOrder)) {
        if (0 !== (node.flags & 128)) return node;
      } else if (null !== node.child) {
        node.child.return = node;
        node = node.child;
        continue;
      }
      if (node === row) break;
      for (; null === node.sibling; ) {
        if (null === node.return || node.return === row) return null;
        node = node.return;
      }
      node.sibling.return = node.return;
      node = node.sibling;
    }
    return null;
  }
  var renderLanes = 0, currentlyRenderingFiber = null, currentHook = null, workInProgressHook = null, didScheduleRenderPhaseUpdate = false, didScheduleRenderPhaseUpdateDuringThisPass = false, shouldDoubleInvokeUserFnsInHooksDEV = false, localIdCounter = 0, thenableIndexCounter = 0, thenableState = null, globalClientIdCounter = 0;
  function throwInvalidHookError() {
    throw Error(formatProdErrorMessage(321));
  }
  function areHookInputsEqual(nextDeps, prevDeps) {
    if (null === prevDeps) return false;
    for (var i = 0; i < prevDeps.length && i < nextDeps.length; i++)
      if (!objectIs(nextDeps[i], prevDeps[i])) return false;
    return true;
  }
  function renderWithHooks(current, workInProgress2, Component, props, secondArg, nextRenderLanes) {
    renderLanes = nextRenderLanes;
    currentlyRenderingFiber = workInProgress2;
    workInProgress2.memoizedState = null;
    workInProgress2.updateQueue = null;
    workInProgress2.lanes = 0;
    ReactSharedInternals.H = null === current || null === current.memoizedState ? HooksDispatcherOnMount : HooksDispatcherOnUpdate;
    shouldDoubleInvokeUserFnsInHooksDEV = false;
    nextRenderLanes = Component(props, secondArg);
    shouldDoubleInvokeUserFnsInHooksDEV = false;
    didScheduleRenderPhaseUpdateDuringThisPass && (nextRenderLanes = renderWithHooksAgain(
      workInProgress2,
      Component,
      props,
      secondArg
    ));
    finishRenderingHooks(current);
    return nextRenderLanes;
  }
  function finishRenderingHooks(current) {
    ReactSharedInternals.H = ContextOnlyDispatcher;
    var didRenderTooFewHooks = null !== currentHook && null !== currentHook.next;
    renderLanes = 0;
    workInProgressHook = currentHook = currentlyRenderingFiber = null;
    didScheduleRenderPhaseUpdate = false;
    thenableIndexCounter = 0;
    thenableState = null;
    if (didRenderTooFewHooks) throw Error(formatProdErrorMessage(300));
    null === current || didReceiveUpdate || (current = current.dependencies, null !== current && checkIfContextChanged(current) && (didReceiveUpdate = true));
  }
  function renderWithHooksAgain(workInProgress2, Component, props, secondArg) {
    currentlyRenderingFiber = workInProgress2;
    var numberOfReRenders = 0;
    do {
      didScheduleRenderPhaseUpdateDuringThisPass && (thenableState = null);
      thenableIndexCounter = 0;
      didScheduleRenderPhaseUpdateDuringThisPass = false;
      if (25 <= numberOfReRenders) throw Error(formatProdErrorMessage(301));
      numberOfReRenders += 1;
      workInProgressHook = currentHook = null;
      if (null != workInProgress2.updateQueue) {
        var children = workInProgress2.updateQueue;
        children.lastEffect = null;
        children.events = null;
        children.stores = null;
        null != children.memoCache && (children.memoCache.index = 0);
      }
      ReactSharedInternals.H = HooksDispatcherOnRerender;
      children = Component(props, secondArg);
    } while (didScheduleRenderPhaseUpdateDuringThisPass);
    return children;
  }
  function TransitionAwareHostComponent() {
    var dispatcher = ReactSharedInternals.H, maybeThenable = dispatcher.useState()[0];
    maybeThenable = "function" === typeof maybeThenable.then ? useThenable(maybeThenable) : maybeThenable;
    dispatcher = dispatcher.useState()[0];
    (null !== currentHook ? currentHook.memoizedState : null) !== dispatcher && (currentlyRenderingFiber.flags |= 1024);
    return maybeThenable;
  }
  function checkDidRenderIdHook() {
    var didRenderIdHook = 0 !== localIdCounter;
    localIdCounter = 0;
    return didRenderIdHook;
  }
  function bailoutHooks(current, workInProgress2, lanes) {
    workInProgress2.updateQueue = current.updateQueue;
    workInProgress2.flags &= -2053;
    current.lanes &= ~lanes;
  }
  function resetHooksOnUnwind(workInProgress2) {
    if (didScheduleRenderPhaseUpdate) {
      for (workInProgress2 = workInProgress2.memoizedState; null !== workInProgress2; ) {
        var queue = workInProgress2.queue;
        null !== queue && (queue.pending = null);
        workInProgress2 = workInProgress2.next;
      }
      didScheduleRenderPhaseUpdate = false;
    }
    renderLanes = 0;
    workInProgressHook = currentHook = currentlyRenderingFiber = null;
    didScheduleRenderPhaseUpdateDuringThisPass = false;
    thenableIndexCounter = localIdCounter = 0;
    thenableState = null;
  }
  function mountWorkInProgressHook() {
    var hook = {
      memoizedState: null,
      baseState: null,
      baseQueue: null,
      queue: null,
      next: null
    };
    null === workInProgressHook ? currentlyRenderingFiber.memoizedState = workInProgressHook = hook : workInProgressHook = workInProgressHook.next = hook;
    return workInProgressHook;
  }
  function updateWorkInProgressHook() {
    if (null === currentHook) {
      var nextCurrentHook = currentlyRenderingFiber.alternate;
      nextCurrentHook = null !== nextCurrentHook ? nextCurrentHook.memoizedState : null;
    } else nextCurrentHook = currentHook.next;
    var nextWorkInProgressHook = null === workInProgressHook ? currentlyRenderingFiber.memoizedState : workInProgressHook.next;
    if (null !== nextWorkInProgressHook)
      workInProgressHook = nextWorkInProgressHook, currentHook = nextCurrentHook;
    else {
      if (null === nextCurrentHook) {
        if (null === currentlyRenderingFiber.alternate)
          throw Error(formatProdErrorMessage(467));
        throw Error(formatProdErrorMessage(310));
      }
      currentHook = nextCurrentHook;
      nextCurrentHook = {
        memoizedState: currentHook.memoizedState,
        baseState: currentHook.baseState,
        baseQueue: currentHook.baseQueue,
        queue: currentHook.queue,
        next: null
      };
      null === workInProgressHook ? currentlyRenderingFiber.memoizedState = workInProgressHook = nextCurrentHook : workInProgressHook = workInProgressHook.next = nextCurrentHook;
    }
    return workInProgressHook;
  }
  function createFunctionComponentUpdateQueue() {
    return { lastEffect: null, events: null, stores: null, memoCache: null };
  }
  function useThenable(thenable) {
    var index2 = thenableIndexCounter;
    thenableIndexCounter += 1;
    null === thenableState && (thenableState = []);
    thenable = trackUsedThenable(thenableState, thenable, index2);
    index2 = currentlyRenderingFiber;
    null === (null === workInProgressHook ? index2.memoizedState : workInProgressHook.next) && (index2 = index2.alternate, ReactSharedInternals.H = null === index2 || null === index2.memoizedState ? HooksDispatcherOnMount : HooksDispatcherOnUpdate);
    return thenable;
  }
  function use(usable) {
    if (null !== usable && "object" === typeof usable) {
      if ("function" === typeof usable.then) return useThenable(usable);
      if (usable.$$typeof === REACT_CONTEXT_TYPE) return readContext(usable);
    }
    throw Error(formatProdErrorMessage(438, String(usable)));
  }
  function useMemoCache(size) {
    var memoCache = null, updateQueue = currentlyRenderingFiber.updateQueue;
    null !== updateQueue && (memoCache = updateQueue.memoCache);
    if (null == memoCache) {
      var current = currentlyRenderingFiber.alternate;
      null !== current && (current = current.updateQueue, null !== current && (current = current.memoCache, null != current && (memoCache = {
        data: current.data.map(function(array) {
          return array.slice();
        }),
        index: 0
      })));
    }
    null == memoCache && (memoCache = { data: [], index: 0 });
    null === updateQueue && (updateQueue = createFunctionComponentUpdateQueue(), currentlyRenderingFiber.updateQueue = updateQueue);
    updateQueue.memoCache = memoCache;
    updateQueue = memoCache.data[memoCache.index];
    if (void 0 === updateQueue)
      for (updateQueue = memoCache.data[memoCache.index] = Array(size), current = 0; current < size; current++)
        updateQueue[current] = REACT_MEMO_CACHE_SENTINEL;
    memoCache.index++;
    return updateQueue;
  }
  function basicStateReducer(state, action) {
    return "function" === typeof action ? action(state) : action;
  }
  function updateReducer(reducer) {
    var hook = updateWorkInProgressHook();
    return updateReducerImpl(hook, currentHook, reducer);
  }
  function updateReducerImpl(hook, current, reducer) {
    var queue = hook.queue;
    if (null === queue) throw Error(formatProdErrorMessage(311));
    queue.lastRenderedReducer = reducer;
    var baseQueue = hook.baseQueue, pendingQueue = queue.pending;
    if (null !== pendingQueue) {
      if (null !== baseQueue) {
        var baseFirst = baseQueue.next;
        baseQueue.next = pendingQueue.next;
        pendingQueue.next = baseFirst;
      }
      current.baseQueue = baseQueue = pendingQueue;
      queue.pending = null;
    }
    pendingQueue = hook.baseState;
    if (null === baseQueue) hook.memoizedState = pendingQueue;
    else {
      current = baseQueue.next;
      var newBaseQueueFirst = baseFirst = null, newBaseQueueLast = null, update = current, didReadFromEntangledAsyncAction$60 = false;
      do {
        var updateLane = update.lane & -536870913;
        if (updateLane !== update.lane ? (workInProgressRootRenderLanes & updateLane) === updateLane : (renderLanes & updateLane) === updateLane) {
          var revertLane = update.revertLane;
          if (0 === revertLane)
            null !== newBaseQueueLast && (newBaseQueueLast = newBaseQueueLast.next = {
              lane: 0,
              revertLane: 0,
              gesture: null,
              action: update.action,
              hasEagerState: update.hasEagerState,
              eagerState: update.eagerState,
              next: null
            }), updateLane === currentEntangledLane && (didReadFromEntangledAsyncAction$60 = true);
          else if ((renderLanes & revertLane) === revertLane) {
            update = update.next;
            revertLane === currentEntangledLane && (didReadFromEntangledAsyncAction$60 = true);
            continue;
          } else
            updateLane = {
              lane: 0,
              revertLane: update.revertLane,
              gesture: null,
              action: update.action,
              hasEagerState: update.hasEagerState,
              eagerState: update.eagerState,
              next: null
            }, null === newBaseQueueLast ? (newBaseQueueFirst = newBaseQueueLast = updateLane, baseFirst = pendingQueue) : newBaseQueueLast = newBaseQueueLast.next = updateLane, currentlyRenderingFiber.lanes |= revertLane, workInProgressRootSkippedLanes |= revertLane;
          updateLane = update.action;
          shouldDoubleInvokeUserFnsInHooksDEV && reducer(pendingQueue, updateLane);
          pendingQueue = update.hasEagerState ? update.eagerState : reducer(pendingQueue, updateLane);
        } else
          revertLane = {
            lane: updateLane,
            revertLane: update.revertLane,
            gesture: update.gesture,
            action: update.action,
            hasEagerState: update.hasEagerState,
            eagerState: update.eagerState,
            next: null
          }, null === newBaseQueueLast ? (newBaseQueueFirst = newBaseQueueLast = revertLane, baseFirst = pendingQueue) : newBaseQueueLast = newBaseQueueLast.next = revertLane, currentlyRenderingFiber.lanes |= updateLane, workInProgressRootSkippedLanes |= updateLane;
        update = update.next;
      } while (null !== update && update !== current);
      null === newBaseQueueLast ? baseFirst = pendingQueue : newBaseQueueLast.next = newBaseQueueFirst;
      if (!objectIs(pendingQueue, hook.memoizedState) && (didReceiveUpdate = true, didReadFromEntangledAsyncAction$60 && (reducer = currentEntangledActionThenable, null !== reducer)))
        throw reducer;
      hook.memoizedState = pendingQueue;
      hook.baseState = baseFirst;
      hook.baseQueue = newBaseQueueLast;
      queue.lastRenderedState = pendingQueue;
    }
    null === baseQueue && (queue.lanes = 0);
    return [hook.memoizedState, queue.dispatch];
  }
  function rerenderReducer(reducer) {
    var hook = updateWorkInProgressHook(), queue = hook.queue;
    if (null === queue) throw Error(formatProdErrorMessage(311));
    queue.lastRenderedReducer = reducer;
    var dispatch = queue.dispatch, lastRenderPhaseUpdate = queue.pending, newState = hook.memoizedState;
    if (null !== lastRenderPhaseUpdate) {
      queue.pending = null;
      var update = lastRenderPhaseUpdate = lastRenderPhaseUpdate.next;
      do
        newState = reducer(newState, update.action), update = update.next;
      while (update !== lastRenderPhaseUpdate);
      objectIs(newState, hook.memoizedState) || (didReceiveUpdate = true);
      hook.memoizedState = newState;
      null === hook.baseQueue && (hook.baseState = newState);
      queue.lastRenderedState = newState;
    }
    return [newState, dispatch];
  }
  function updateSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) {
    var fiber = currentlyRenderingFiber, hook = updateWorkInProgressHook(), isHydrating$jscomp$0 = isHydrating;
    if (isHydrating$jscomp$0) {
      if (void 0 === getServerSnapshot) throw Error(formatProdErrorMessage(407));
      getServerSnapshot = getServerSnapshot();
    } else getServerSnapshot = getSnapshot();
    var snapshotChanged = !objectIs(
      (currentHook || hook).memoizedState,
      getServerSnapshot
    );
    snapshotChanged && (hook.memoizedState = getServerSnapshot, didReceiveUpdate = true);
    hook = hook.queue;
    updateEffect(subscribeToStore.bind(null, fiber, hook, subscribe), [
      subscribe
    ]);
    if (hook.getSnapshot !== getSnapshot || snapshotChanged || null !== workInProgressHook && workInProgressHook.memoizedState.tag & 1) {
      fiber.flags |= 2048;
      pushSimpleEffect(
        9,
        { destroy: void 0 },
        updateStoreInstance.bind(
          null,
          fiber,
          hook,
          getServerSnapshot,
          getSnapshot
        ),
        null
      );
      if (null === workInProgressRoot) throw Error(formatProdErrorMessage(349));
      isHydrating$jscomp$0 || 0 !== (renderLanes & 127) || pushStoreConsistencyCheck(fiber, getSnapshot, getServerSnapshot);
    }
    return getServerSnapshot;
  }
  function pushStoreConsistencyCheck(fiber, getSnapshot, renderedSnapshot) {
    fiber.flags |= 16384;
    fiber = { getSnapshot, value: renderedSnapshot };
    getSnapshot = currentlyRenderingFiber.updateQueue;
    null === getSnapshot ? (getSnapshot = createFunctionComponentUpdateQueue(), currentlyRenderingFiber.updateQueue = getSnapshot, getSnapshot.stores = [fiber]) : (renderedSnapshot = getSnapshot.stores, null === renderedSnapshot ? getSnapshot.stores = [fiber] : renderedSnapshot.push(fiber));
  }
  function updateStoreInstance(fiber, inst, nextSnapshot, getSnapshot) {
    inst.value = nextSnapshot;
    inst.getSnapshot = getSnapshot;
    checkIfSnapshotChanged(inst) && forceStoreRerender(fiber);
  }
  function subscribeToStore(fiber, inst, subscribe) {
    return subscribe(function() {
      checkIfSnapshotChanged(inst) && forceStoreRerender(fiber);
    });
  }
  function checkIfSnapshotChanged(inst) {
    var latestGetSnapshot = inst.getSnapshot;
    inst = inst.value;
    try {
      var nextValue = latestGetSnapshot();
      return !objectIs(inst, nextValue);
    } catch (error) {
      return true;
    }
  }
  function forceStoreRerender(fiber) {
    var root3 = enqueueConcurrentRenderForLane(fiber, 2);
    null !== root3 && scheduleUpdateOnFiber(root3, fiber, 2);
  }
  function mountStateImpl(initialState) {
    var hook = mountWorkInProgressHook();
    if ("function" === typeof initialState) {
      var initialStateInitializer = initialState;
      initialState = initialStateInitializer();
      if (shouldDoubleInvokeUserFnsInHooksDEV) {
        setIsStrictModeForDevtools(true);
        try {
          initialStateInitializer();
        } finally {
          setIsStrictModeForDevtools(false);
        }
      }
    }
    hook.memoizedState = hook.baseState = initialState;
    hook.queue = {
      pending: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: basicStateReducer,
      lastRenderedState: initialState
    };
    return hook;
  }
  function updateOptimisticImpl(hook, current, passthrough, reducer) {
    hook.baseState = passthrough;
    return updateReducerImpl(
      hook,
      currentHook,
      "function" === typeof reducer ? reducer : basicStateReducer
    );
  }
  function dispatchActionState(fiber, actionQueue, setPendingState, setState, payload) {
    if (isRenderPhaseUpdate(fiber)) throw Error(formatProdErrorMessage(485));
    fiber = actionQueue.action;
    if (null !== fiber) {
      var actionNode = {
        payload,
        action: fiber,
        next: null,
        isTransition: true,
        status: "pending",
        value: null,
        reason: null,
        listeners: [],
        then: function(listener) {
          actionNode.listeners.push(listener);
        }
      };
      null !== ReactSharedInternals.T ? setPendingState(true) : actionNode.isTransition = false;
      setState(actionNode);
      setPendingState = actionQueue.pending;
      null === setPendingState ? (actionNode.next = actionQueue.pending = actionNode, runActionStateAction(actionQueue, actionNode)) : (actionNode.next = setPendingState.next, actionQueue.pending = setPendingState.next = actionNode);
    }
  }
  function runActionStateAction(actionQueue, node) {
    var action = node.action, payload = node.payload, prevState = actionQueue.state;
    if (node.isTransition) {
      var prevTransition = ReactSharedInternals.T, currentTransition = {};
      ReactSharedInternals.T = currentTransition;
      try {
        var returnValue = action(prevState, payload), onStartTransitionFinish = ReactSharedInternals.S;
        null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
        handleActionReturnValue(actionQueue, node, returnValue);
      } catch (error) {
        onActionError(actionQueue, node, error);
      } finally {
        null !== prevTransition && null !== currentTransition.types && (prevTransition.types = currentTransition.types), ReactSharedInternals.T = prevTransition;
      }
    } else
      try {
        prevTransition = action(prevState, payload), handleActionReturnValue(actionQueue, node, prevTransition);
      } catch (error$66) {
        onActionError(actionQueue, node, error$66);
      }
  }
  function handleActionReturnValue(actionQueue, node, returnValue) {
    null !== returnValue && "object" === typeof returnValue && "function" === typeof returnValue.then ? returnValue.then(
      function(nextState) {
        onActionSuccess(actionQueue, node, nextState);
      },
      function(error) {
        return onActionError(actionQueue, node, error);
      }
    ) : onActionSuccess(actionQueue, node, returnValue);
  }
  function onActionSuccess(actionQueue, actionNode, nextState) {
    actionNode.status = "fulfilled";
    actionNode.value = nextState;
    notifyActionListeners(actionNode);
    actionQueue.state = nextState;
    actionNode = actionQueue.pending;
    null !== actionNode && (nextState = actionNode.next, nextState === actionNode ? actionQueue.pending = null : (nextState = nextState.next, actionNode.next = nextState, runActionStateAction(actionQueue, nextState)));
  }
  function onActionError(actionQueue, actionNode, error) {
    var last = actionQueue.pending;
    actionQueue.pending = null;
    if (null !== last) {
      last = last.next;
      do
        actionNode.status = "rejected", actionNode.reason = error, notifyActionListeners(actionNode), actionNode = actionNode.next;
      while (actionNode !== last);
    }
    actionQueue.action = null;
  }
  function notifyActionListeners(actionNode) {
    actionNode = actionNode.listeners;
    for (var i = 0; i < actionNode.length; i++) (0, actionNode[i])();
  }
  function actionStateReducer(oldState, newState) {
    return newState;
  }
  function mountActionState(action, initialStateProp) {
    if (isHydrating) {
      var ssrFormState = workInProgressRoot.formState;
      if (null !== ssrFormState) {
        a: {
          var JSCompiler_inline_result = currentlyRenderingFiber;
          if (isHydrating) {
            if (nextHydratableInstance) {
              b: {
                var JSCompiler_inline_result$jscomp$0 = nextHydratableInstance;
                for (var inRootOrSingleton = rootOrSingletonContext; 8 !== JSCompiler_inline_result$jscomp$0.nodeType; ) {
                  if (!inRootOrSingleton) {
                    JSCompiler_inline_result$jscomp$0 = null;
                    break b;
                  }
                  JSCompiler_inline_result$jscomp$0 = getNextHydratable(
                    JSCompiler_inline_result$jscomp$0.nextSibling
                  );
                  if (null === JSCompiler_inline_result$jscomp$0) {
                    JSCompiler_inline_result$jscomp$0 = null;
                    break b;
                  }
                }
                inRootOrSingleton = JSCompiler_inline_result$jscomp$0.data;
                JSCompiler_inline_result$jscomp$0 = "F!" === inRootOrSingleton || "F" === inRootOrSingleton ? JSCompiler_inline_result$jscomp$0 : null;
              }
              if (JSCompiler_inline_result$jscomp$0) {
                nextHydratableInstance = getNextHydratable(
                  JSCompiler_inline_result$jscomp$0.nextSibling
                );
                JSCompiler_inline_result = "F!" === JSCompiler_inline_result$jscomp$0.data;
                break a;
              }
            }
            throwOnHydrationMismatch(JSCompiler_inline_result);
          }
          JSCompiler_inline_result = false;
        }
        JSCompiler_inline_result && (initialStateProp = ssrFormState[0]);
      }
    }
    ssrFormState = mountWorkInProgressHook();
    ssrFormState.memoizedState = ssrFormState.baseState = initialStateProp;
    JSCompiler_inline_result = {
      pending: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: actionStateReducer,
      lastRenderedState: initialStateProp
    };
    ssrFormState.queue = JSCompiler_inline_result;
    ssrFormState = dispatchSetState.bind(
      null,
      currentlyRenderingFiber,
      JSCompiler_inline_result
    );
    JSCompiler_inline_result.dispatch = ssrFormState;
    JSCompiler_inline_result = mountStateImpl(false);
    inRootOrSingleton = dispatchOptimisticSetState.bind(
      null,
      currentlyRenderingFiber,
      false,
      JSCompiler_inline_result.queue
    );
    JSCompiler_inline_result = mountWorkInProgressHook();
    JSCompiler_inline_result$jscomp$0 = {
      state: initialStateProp,
      dispatch: null,
      action,
      pending: null
    };
    JSCompiler_inline_result.queue = JSCompiler_inline_result$jscomp$0;
    ssrFormState = dispatchActionState.bind(
      null,
      currentlyRenderingFiber,
      JSCompiler_inline_result$jscomp$0,
      inRootOrSingleton,
      ssrFormState
    );
    JSCompiler_inline_result$jscomp$0.dispatch = ssrFormState;
    JSCompiler_inline_result.memoizedState = action;
    return [initialStateProp, ssrFormState, false];
  }
  function updateActionState(action) {
    var stateHook = updateWorkInProgressHook();
    return updateActionStateImpl(stateHook, currentHook, action);
  }
  function updateActionStateImpl(stateHook, currentStateHook, action) {
    currentStateHook = updateReducerImpl(
      stateHook,
      currentStateHook,
      actionStateReducer
    )[0];
    stateHook = updateReducer(basicStateReducer)[0];
    if ("object" === typeof currentStateHook && null !== currentStateHook && "function" === typeof currentStateHook.then)
      try {
        var state = useThenable(currentStateHook);
      } catch (x) {
        if (x === SuspenseException) throw SuspenseActionException;
        throw x;
      }
    else state = currentStateHook;
    currentStateHook = updateWorkInProgressHook();
    var actionQueue = currentStateHook.queue, dispatch = actionQueue.dispatch;
    action !== currentStateHook.memoizedState && (currentlyRenderingFiber.flags |= 2048, pushSimpleEffect(
      9,
      { destroy: void 0 },
      actionStateActionEffect.bind(null, actionQueue, action),
      null
    ));
    return [state, dispatch, stateHook];
  }
  function actionStateActionEffect(actionQueue, action) {
    actionQueue.action = action;
  }
  function rerenderActionState(action) {
    var stateHook = updateWorkInProgressHook(), currentStateHook = currentHook;
    if (null !== currentStateHook)
      return updateActionStateImpl(stateHook, currentStateHook, action);
    updateWorkInProgressHook();
    stateHook = stateHook.memoizedState;
    currentStateHook = updateWorkInProgressHook();
    var dispatch = currentStateHook.queue.dispatch;
    currentStateHook.memoizedState = action;
    return [stateHook, dispatch, false];
  }
  function pushSimpleEffect(tag, inst, create, deps) {
    tag = { tag, create, deps, inst, next: null };
    inst = currentlyRenderingFiber.updateQueue;
    null === inst && (inst = createFunctionComponentUpdateQueue(), currentlyRenderingFiber.updateQueue = inst);
    create = inst.lastEffect;
    null === create ? inst.lastEffect = tag.next = tag : (deps = create.next, create.next = tag, tag.next = deps, inst.lastEffect = tag);
    return tag;
  }
  function updateRef() {
    return updateWorkInProgressHook().memoizedState;
  }
  function mountEffectImpl(fiberFlags, hookFlags, create, deps) {
    var hook = mountWorkInProgressHook();
    currentlyRenderingFiber.flags |= fiberFlags;
    hook.memoizedState = pushSimpleEffect(
      1 | hookFlags,
      { destroy: void 0 },
      create,
      void 0 === deps ? null : deps
    );
  }
  function updateEffectImpl(fiberFlags, hookFlags, create, deps) {
    var hook = updateWorkInProgressHook();
    deps = void 0 === deps ? null : deps;
    var inst = hook.memoizedState.inst;
    null !== currentHook && null !== deps && areHookInputsEqual(deps, currentHook.memoizedState.deps) ? hook.memoizedState = pushSimpleEffect(hookFlags, inst, create, deps) : (currentlyRenderingFiber.flags |= fiberFlags, hook.memoizedState = pushSimpleEffect(
      1 | hookFlags,
      inst,
      create,
      deps
    ));
  }
  function mountEffect(create, deps) {
    mountEffectImpl(8390656, 8, create, deps);
  }
  function updateEffect(create, deps) {
    updateEffectImpl(2048, 8, create, deps);
  }
  function useEffectEventImpl(payload) {
    currentlyRenderingFiber.flags |= 4;
    var componentUpdateQueue = currentlyRenderingFiber.updateQueue;
    if (null === componentUpdateQueue)
      componentUpdateQueue = createFunctionComponentUpdateQueue(), currentlyRenderingFiber.updateQueue = componentUpdateQueue, componentUpdateQueue.events = [payload];
    else {
      var events = componentUpdateQueue.events;
      null === events ? componentUpdateQueue.events = [payload] : events.push(payload);
    }
  }
  function updateEvent(callback) {
    var ref = updateWorkInProgressHook().memoizedState;
    useEffectEventImpl({ ref, nextImpl: callback });
    return function() {
      if (0 !== (executionContext & 2)) throw Error(formatProdErrorMessage(440));
      return ref.impl.apply(void 0, arguments);
    };
  }
  function updateInsertionEffect(create, deps) {
    return updateEffectImpl(4, 2, create, deps);
  }
  function updateLayoutEffect(create, deps) {
    return updateEffectImpl(4, 4, create, deps);
  }
  function imperativeHandleEffect(create, ref) {
    if ("function" === typeof ref) {
      create = create();
      var refCleanup = ref(create);
      return function() {
        "function" === typeof refCleanup ? refCleanup() : ref(null);
      };
    }
    if (null !== ref && void 0 !== ref)
      return create = create(), ref.current = create, function() {
        ref.current = null;
      };
  }
  function updateImperativeHandle(ref, create, deps) {
    deps = null !== deps && void 0 !== deps ? deps.concat([ref]) : null;
    updateEffectImpl(4, 4, imperativeHandleEffect.bind(null, create, ref), deps);
  }
  function mountDebugValue() {
  }
  function updateCallback(callback, deps) {
    var hook = updateWorkInProgressHook();
    deps = void 0 === deps ? null : deps;
    var prevState = hook.memoizedState;
    if (null !== deps && areHookInputsEqual(deps, prevState[1]))
      return prevState[0];
    hook.memoizedState = [callback, deps];
    return callback;
  }
  function updateMemo(nextCreate, deps) {
    var hook = updateWorkInProgressHook();
    deps = void 0 === deps ? null : deps;
    var prevState = hook.memoizedState;
    if (null !== deps && areHookInputsEqual(deps, prevState[1]))
      return prevState[0];
    prevState = nextCreate();
    if (shouldDoubleInvokeUserFnsInHooksDEV) {
      setIsStrictModeForDevtools(true);
      try {
        nextCreate();
      } finally {
        setIsStrictModeForDevtools(false);
      }
    }
    hook.memoizedState = [prevState, deps];
    return prevState;
  }
  function mountDeferredValueImpl(hook, value, initialValue) {
    if (void 0 === initialValue || 0 !== (renderLanes & 1073741824) && 0 === (workInProgressRootRenderLanes & 261930))
      return hook.memoizedState = value;
    hook.memoizedState = initialValue;
    hook = requestDeferredLane();
    currentlyRenderingFiber.lanes |= hook;
    workInProgressRootSkippedLanes |= hook;
    return initialValue;
  }
  function updateDeferredValueImpl(hook, prevValue, value, initialValue) {
    if (objectIs(value, prevValue)) return value;
    if (null !== currentTreeHiddenStackCursor.current)
      return hook = mountDeferredValueImpl(hook, value, initialValue), objectIs(hook, prevValue) || (didReceiveUpdate = true), hook;
    if (0 === (renderLanes & 42) || 0 !== (renderLanes & 1073741824) && 0 === (workInProgressRootRenderLanes & 261930))
      return didReceiveUpdate = true, hook.memoizedState = value;
    hook = requestDeferredLane();
    currentlyRenderingFiber.lanes |= hook;
    workInProgressRootSkippedLanes |= hook;
    return prevValue;
  }
  function startTransition(fiber, queue, pendingState, finishedState, callback) {
    var previousPriority = ReactDOMSharedInternals.p;
    ReactDOMSharedInternals.p = 0 !== previousPriority && 8 > previousPriority ? previousPriority : 8;
    var prevTransition = ReactSharedInternals.T, currentTransition = {};
    ReactSharedInternals.T = currentTransition;
    dispatchOptimisticSetState(fiber, false, queue, pendingState);
    try {
      var returnValue = callback(), onStartTransitionFinish = ReactSharedInternals.S;
      null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
      if (null !== returnValue && "object" === typeof returnValue && "function" === typeof returnValue.then) {
        var thenableForFinishedState = chainThenableValue(
          returnValue,
          finishedState
        );
        dispatchSetStateInternal(
          fiber,
          queue,
          thenableForFinishedState,
          requestUpdateLane(fiber)
        );
      } else
        dispatchSetStateInternal(
          fiber,
          queue,
          finishedState,
          requestUpdateLane(fiber)
        );
    } catch (error) {
      dispatchSetStateInternal(
        fiber,
        queue,
        { then: function() {
        }, status: "rejected", reason: error },
        requestUpdateLane()
      );
    } finally {
      ReactDOMSharedInternals.p = previousPriority, null !== prevTransition && null !== currentTransition.types && (prevTransition.types = currentTransition.types), ReactSharedInternals.T = prevTransition;
    }
  }
  function noop() {
  }
  function startHostTransition(formFiber, pendingState, action, formData) {
    if (5 !== formFiber.tag) throw Error(formatProdErrorMessage(476));
    var queue = ensureFormComponentIsStateful(formFiber).queue;
    startTransition(
      formFiber,
      queue,
      pendingState,
      sharedNotPendingObject,
      null === action ? noop : function() {
        requestFormReset$1(formFiber);
        return action(formData);
      }
    );
  }
  function ensureFormComponentIsStateful(formFiber) {
    var existingStateHook = formFiber.memoizedState;
    if (null !== existingStateHook) return existingStateHook;
    existingStateHook = {
      memoizedState: sharedNotPendingObject,
      baseState: sharedNotPendingObject,
      baseQueue: null,
      queue: {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: basicStateReducer,
        lastRenderedState: sharedNotPendingObject
      },
      next: null
    };
    var initialResetState = {};
    existingStateHook.next = {
      memoizedState: initialResetState,
      baseState: initialResetState,
      baseQueue: null,
      queue: {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: basicStateReducer,
        lastRenderedState: initialResetState
      },
      next: null
    };
    formFiber.memoizedState = existingStateHook;
    formFiber = formFiber.alternate;
    null !== formFiber && (formFiber.memoizedState = existingStateHook);
    return existingStateHook;
  }
  function requestFormReset$1(formFiber) {
    var stateHook = ensureFormComponentIsStateful(formFiber);
    null === stateHook.next && (stateHook = formFiber.alternate.memoizedState);
    dispatchSetStateInternal(
      formFiber,
      stateHook.next.queue,
      {},
      requestUpdateLane()
    );
  }
  function useHostTransitionStatus() {
    return readContext(HostTransitionContext);
  }
  function updateId() {
    return updateWorkInProgressHook().memoizedState;
  }
  function updateRefresh() {
    return updateWorkInProgressHook().memoizedState;
  }
  function refreshCache(fiber) {
    for (var provider = fiber.return; null !== provider; ) {
      switch (provider.tag) {
        case 24:
        case 3:
          var lane = requestUpdateLane();
          fiber = createUpdate(lane);
          var root$69 = enqueueUpdate(provider, fiber, lane);
          null !== root$69 && (scheduleUpdateOnFiber(root$69, provider, lane), entangleTransitions(root$69, provider, lane));
          provider = { cache: createCache() };
          fiber.payload = provider;
          return;
      }
      provider = provider.return;
    }
  }
  function dispatchReducerAction(fiber, queue, action) {
    var lane = requestUpdateLane();
    action = {
      lane,
      revertLane: 0,
      gesture: null,
      action,
      hasEagerState: false,
      eagerState: null,
      next: null
    };
    isRenderPhaseUpdate(fiber) ? enqueueRenderPhaseUpdate(queue, action) : (action = enqueueConcurrentHookUpdate(fiber, queue, action, lane), null !== action && (scheduleUpdateOnFiber(action, fiber, lane), entangleTransitionUpdate(action, queue, lane)));
  }
  function dispatchSetState(fiber, queue, action) {
    var lane = requestUpdateLane();
    dispatchSetStateInternal(fiber, queue, action, lane);
  }
  function dispatchSetStateInternal(fiber, queue, action, lane) {
    var update = {
      lane,
      revertLane: 0,
      gesture: null,
      action,
      hasEagerState: false,
      eagerState: null,
      next: null
    };
    if (isRenderPhaseUpdate(fiber)) enqueueRenderPhaseUpdate(queue, update);
    else {
      var alternate = fiber.alternate;
      if (0 === fiber.lanes && (null === alternate || 0 === alternate.lanes) && (alternate = queue.lastRenderedReducer, null !== alternate))
        try {
          var currentState = queue.lastRenderedState, eagerState = alternate(currentState, action);
          update.hasEagerState = true;
          update.eagerState = eagerState;
          if (objectIs(eagerState, currentState))
            return enqueueUpdate$1(fiber, queue, update, 0), null === workInProgressRoot && finishQueueingConcurrentUpdates(), false;
        } catch (error) {
        } finally {
        }
      action = enqueueConcurrentHookUpdate(fiber, queue, update, lane);
      if (null !== action)
        return scheduleUpdateOnFiber(action, fiber, lane), entangleTransitionUpdate(action, queue, lane), true;
    }
    return false;
  }
  function dispatchOptimisticSetState(fiber, throwIfDuringRender, queue, action) {
    action = {
      lane: 2,
      revertLane: requestTransitionLane(),
      gesture: null,
      action,
      hasEagerState: false,
      eagerState: null,
      next: null
    };
    if (isRenderPhaseUpdate(fiber)) {
      if (throwIfDuringRender) throw Error(formatProdErrorMessage(479));
    } else
      throwIfDuringRender = enqueueConcurrentHookUpdate(
        fiber,
        queue,
        action,
        2
      ), null !== throwIfDuringRender && scheduleUpdateOnFiber(throwIfDuringRender, fiber, 2);
  }
  function isRenderPhaseUpdate(fiber) {
    var alternate = fiber.alternate;
    return fiber === currentlyRenderingFiber || null !== alternate && alternate === currentlyRenderingFiber;
  }
  function enqueueRenderPhaseUpdate(queue, update) {
    didScheduleRenderPhaseUpdateDuringThisPass = didScheduleRenderPhaseUpdate = true;
    var pending = queue.pending;
    null === pending ? update.next = update : (update.next = pending.next, pending.next = update);
    queue.pending = update;
  }
  function entangleTransitionUpdate(root3, queue, lane) {
    if (0 !== (lane & 4194048)) {
      var queueLanes = queue.lanes;
      queueLanes &= root3.pendingLanes;
      lane |= queueLanes;
      queue.lanes = lane;
      markRootEntangled(root3, lane);
    }
  }
  var ContextOnlyDispatcher = {
    readContext,
    use,
    useCallback: throwInvalidHookError,
    useContext: throwInvalidHookError,
    useEffect: throwInvalidHookError,
    useImperativeHandle: throwInvalidHookError,
    useLayoutEffect: throwInvalidHookError,
    useInsertionEffect: throwInvalidHookError,
    useMemo: throwInvalidHookError,
    useReducer: throwInvalidHookError,
    useRef: throwInvalidHookError,
    useState: throwInvalidHookError,
    useDebugValue: throwInvalidHookError,
    useDeferredValue: throwInvalidHookError,
    useTransition: throwInvalidHookError,
    useSyncExternalStore: throwInvalidHookError,
    useId: throwInvalidHookError,
    useHostTransitionStatus: throwInvalidHookError,
    useFormState: throwInvalidHookError,
    useActionState: throwInvalidHookError,
    useOptimistic: throwInvalidHookError,
    useMemoCache: throwInvalidHookError,
    useCacheRefresh: throwInvalidHookError
  };
  ContextOnlyDispatcher.useEffectEvent = throwInvalidHookError;
  var HooksDispatcherOnMount = {
    readContext,
    use,
    useCallback: function(callback, deps) {
      mountWorkInProgressHook().memoizedState = [
        callback,
        void 0 === deps ? null : deps
      ];
      return callback;
    },
    useContext: readContext,
    useEffect: mountEffect,
    useImperativeHandle: function(ref, create, deps) {
      deps = null !== deps && void 0 !== deps ? deps.concat([ref]) : null;
      mountEffectImpl(
        4194308,
        4,
        imperativeHandleEffect.bind(null, create, ref),
        deps
      );
    },
    useLayoutEffect: function(create, deps) {
      return mountEffectImpl(4194308, 4, create, deps);
    },
    useInsertionEffect: function(create, deps) {
      mountEffectImpl(4, 2, create, deps);
    },
    useMemo: function(nextCreate, deps) {
      var hook = mountWorkInProgressHook();
      deps = void 0 === deps ? null : deps;
      var nextValue = nextCreate();
      if (shouldDoubleInvokeUserFnsInHooksDEV) {
        setIsStrictModeForDevtools(true);
        try {
          nextCreate();
        } finally {
          setIsStrictModeForDevtools(false);
        }
      }
      hook.memoizedState = [nextValue, deps];
      return nextValue;
    },
    useReducer: function(reducer, initialArg, init) {
      var hook = mountWorkInProgressHook();
      if (void 0 !== init) {
        var initialState = init(initialArg);
        if (shouldDoubleInvokeUserFnsInHooksDEV) {
          setIsStrictModeForDevtools(true);
          try {
            init(initialArg);
          } finally {
            setIsStrictModeForDevtools(false);
          }
        }
      } else initialState = initialArg;
      hook.memoizedState = hook.baseState = initialState;
      reducer = {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: reducer,
        lastRenderedState: initialState
      };
      hook.queue = reducer;
      reducer = reducer.dispatch = dispatchReducerAction.bind(
        null,
        currentlyRenderingFiber,
        reducer
      );
      return [hook.memoizedState, reducer];
    },
    useRef: function(initialValue) {
      var hook = mountWorkInProgressHook();
      initialValue = { current: initialValue };
      return hook.memoizedState = initialValue;
    },
    useState: function(initialState) {
      initialState = mountStateImpl(initialState);
      var queue = initialState.queue, dispatch = dispatchSetState.bind(null, currentlyRenderingFiber, queue);
      queue.dispatch = dispatch;
      return [initialState.memoizedState, dispatch];
    },
    useDebugValue: mountDebugValue,
    useDeferredValue: function(value, initialValue) {
      var hook = mountWorkInProgressHook();
      return mountDeferredValueImpl(hook, value, initialValue);
    },
    useTransition: function() {
      var stateHook = mountStateImpl(false);
      stateHook = startTransition.bind(
        null,
        currentlyRenderingFiber,
        stateHook.queue,
        true,
        false
      );
      mountWorkInProgressHook().memoizedState = stateHook;
      return [false, stateHook];
    },
    useSyncExternalStore: function(subscribe, getSnapshot, getServerSnapshot) {
      var fiber = currentlyRenderingFiber, hook = mountWorkInProgressHook();
      if (isHydrating) {
        if (void 0 === getServerSnapshot)
          throw Error(formatProdErrorMessage(407));
        getServerSnapshot = getServerSnapshot();
      } else {
        getServerSnapshot = getSnapshot();
        if (null === workInProgressRoot)
          throw Error(formatProdErrorMessage(349));
        0 !== (workInProgressRootRenderLanes & 127) || pushStoreConsistencyCheck(fiber, getSnapshot, getServerSnapshot);
      }
      hook.memoizedState = getServerSnapshot;
      var inst = { value: getServerSnapshot, getSnapshot };
      hook.queue = inst;
      mountEffect(subscribeToStore.bind(null, fiber, inst, subscribe), [
        subscribe
      ]);
      fiber.flags |= 2048;
      pushSimpleEffect(
        9,
        { destroy: void 0 },
        updateStoreInstance.bind(
          null,
          fiber,
          inst,
          getServerSnapshot,
          getSnapshot
        ),
        null
      );
      return getServerSnapshot;
    },
    useId: function() {
      var hook = mountWorkInProgressHook(), identifierPrefix = workInProgressRoot.identifierPrefix;
      if (isHydrating) {
        var JSCompiler_inline_result = treeContextOverflow;
        var idWithLeadingBit = treeContextId;
        JSCompiler_inline_result = (idWithLeadingBit & ~(1 << 32 - clz32(idWithLeadingBit) - 1)).toString(32) + JSCompiler_inline_result;
        identifierPrefix = "_" + identifierPrefix + "R_" + JSCompiler_inline_result;
        JSCompiler_inline_result = localIdCounter++;
        0 < JSCompiler_inline_result && (identifierPrefix += "H" + JSCompiler_inline_result.toString(32));
        identifierPrefix += "_";
      } else
        JSCompiler_inline_result = globalClientIdCounter++, identifierPrefix = "_" + identifierPrefix + "r_" + JSCompiler_inline_result.toString(32) + "_";
      return hook.memoizedState = identifierPrefix;
    },
    useHostTransitionStatus,
    useFormState: mountActionState,
    useActionState: mountActionState,
    useOptimistic: function(passthrough) {
      var hook = mountWorkInProgressHook();
      hook.memoizedState = hook.baseState = passthrough;
      var queue = {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: null,
        lastRenderedState: null
      };
      hook.queue = queue;
      hook = dispatchOptimisticSetState.bind(
        null,
        currentlyRenderingFiber,
        true,
        queue
      );
      queue.dispatch = hook;
      return [passthrough, hook];
    },
    useMemoCache,
    useCacheRefresh: function() {
      return mountWorkInProgressHook().memoizedState = refreshCache.bind(
        null,
        currentlyRenderingFiber
      );
    },
    useEffectEvent: function(callback) {
      var hook = mountWorkInProgressHook(), ref = { impl: callback };
      hook.memoizedState = ref;
      return function() {
        if (0 !== (executionContext & 2))
          throw Error(formatProdErrorMessage(440));
        return ref.impl.apply(void 0, arguments);
      };
    }
  }, HooksDispatcherOnUpdate = {
    readContext,
    use,
    useCallback: updateCallback,
    useContext: readContext,
    useEffect: updateEffect,
    useImperativeHandle: updateImperativeHandle,
    useInsertionEffect: updateInsertionEffect,
    useLayoutEffect: updateLayoutEffect,
    useMemo: updateMemo,
    useReducer: updateReducer,
    useRef: updateRef,
    useState: function() {
      return updateReducer(basicStateReducer);
    },
    useDebugValue: mountDebugValue,
    useDeferredValue: function(value, initialValue) {
      var hook = updateWorkInProgressHook();
      return updateDeferredValueImpl(
        hook,
        currentHook.memoizedState,
        value,
        initialValue
      );
    },
    useTransition: function() {
      var booleanOrThenable = updateReducer(basicStateReducer)[0], start = updateWorkInProgressHook().memoizedState;
      return [
        "boolean" === typeof booleanOrThenable ? booleanOrThenable : useThenable(booleanOrThenable),
        start
      ];
    },
    useSyncExternalStore: updateSyncExternalStore,
    useId: updateId,
    useHostTransitionStatus,
    useFormState: updateActionState,
    useActionState: updateActionState,
    useOptimistic: function(passthrough, reducer) {
      var hook = updateWorkInProgressHook();
      return updateOptimisticImpl(hook, currentHook, passthrough, reducer);
    },
    useMemoCache,
    useCacheRefresh: updateRefresh
  };
  HooksDispatcherOnUpdate.useEffectEvent = updateEvent;
  var HooksDispatcherOnRerender = {
    readContext,
    use,
    useCallback: updateCallback,
    useContext: readContext,
    useEffect: updateEffect,
    useImperativeHandle: updateImperativeHandle,
    useInsertionEffect: updateInsertionEffect,
    useLayoutEffect: updateLayoutEffect,
    useMemo: updateMemo,
    useReducer: rerenderReducer,
    useRef: updateRef,
    useState: function() {
      return rerenderReducer(basicStateReducer);
    },
    useDebugValue: mountDebugValue,
    useDeferredValue: function(value, initialValue) {
      var hook = updateWorkInProgressHook();
      return null === currentHook ? mountDeferredValueImpl(hook, value, initialValue) : updateDeferredValueImpl(
        hook,
        currentHook.memoizedState,
        value,
        initialValue
      );
    },
    useTransition: function() {
      var booleanOrThenable = rerenderReducer(basicStateReducer)[0], start = updateWorkInProgressHook().memoizedState;
      return [
        "boolean" === typeof booleanOrThenable ? booleanOrThenable : useThenable(booleanOrThenable),
        start
      ];
    },
    useSyncExternalStore: updateSyncExternalStore,
    useId: updateId,
    useHostTransitionStatus,
    useFormState: rerenderActionState,
    useActionState: rerenderActionState,
    useOptimistic: function(passthrough, reducer) {
      var hook = updateWorkInProgressHook();
      if (null !== currentHook)
        return updateOptimisticImpl(hook, currentHook, passthrough, reducer);
      hook.baseState = passthrough;
      return [passthrough, hook.queue.dispatch];
    },
    useMemoCache,
    useCacheRefresh: updateRefresh
  };
  HooksDispatcherOnRerender.useEffectEvent = updateEvent;
  function applyDerivedStateFromProps(workInProgress2, ctor, getDerivedStateFromProps, nextProps) {
    ctor = workInProgress2.memoizedState;
    getDerivedStateFromProps = getDerivedStateFromProps(nextProps, ctor);
    getDerivedStateFromProps = null === getDerivedStateFromProps || void 0 === getDerivedStateFromProps ? ctor : assign({}, ctor, getDerivedStateFromProps);
    workInProgress2.memoizedState = getDerivedStateFromProps;
    0 === workInProgress2.lanes && (workInProgress2.updateQueue.baseState = getDerivedStateFromProps);
  }
  var classComponentUpdater = {
    enqueueSetState: function(inst, payload, callback) {
      inst = inst._reactInternals;
      var lane = requestUpdateLane(), update = createUpdate(lane);
      update.payload = payload;
      void 0 !== callback && null !== callback && (update.callback = callback);
      payload = enqueueUpdate(inst, update, lane);
      null !== payload && (scheduleUpdateOnFiber(payload, inst, lane), entangleTransitions(payload, inst, lane));
    },
    enqueueReplaceState: function(inst, payload, callback) {
      inst = inst._reactInternals;
      var lane = requestUpdateLane(), update = createUpdate(lane);
      update.tag = 1;
      update.payload = payload;
      void 0 !== callback && null !== callback && (update.callback = callback);
      payload = enqueueUpdate(inst, update, lane);
      null !== payload && (scheduleUpdateOnFiber(payload, inst, lane), entangleTransitions(payload, inst, lane));
    },
    enqueueForceUpdate: function(inst, callback) {
      inst = inst._reactInternals;
      var lane = requestUpdateLane(), update = createUpdate(lane);
      update.tag = 2;
      void 0 !== callback && null !== callback && (update.callback = callback);
      callback = enqueueUpdate(inst, update, lane);
      null !== callback && (scheduleUpdateOnFiber(callback, inst, lane), entangleTransitions(callback, inst, lane));
    }
  };
  function checkShouldComponentUpdate(workInProgress2, ctor, oldProps, newProps, oldState, newState, nextContext) {
    workInProgress2 = workInProgress2.stateNode;
    return "function" === typeof workInProgress2.shouldComponentUpdate ? workInProgress2.shouldComponentUpdate(newProps, newState, nextContext) : ctor.prototype && ctor.prototype.isPureReactComponent ? !shallowEqual(oldProps, newProps) || !shallowEqual(oldState, newState) : true;
  }
  function callComponentWillReceiveProps(workInProgress2, instance, newProps, nextContext) {
    workInProgress2 = instance.state;
    "function" === typeof instance.componentWillReceiveProps && instance.componentWillReceiveProps(newProps, nextContext);
    "function" === typeof instance.UNSAFE_componentWillReceiveProps && instance.UNSAFE_componentWillReceiveProps(newProps, nextContext);
    instance.state !== workInProgress2 && classComponentUpdater.enqueueReplaceState(instance, instance.state, null);
  }
  function resolveClassComponentProps(Component, baseProps) {
    var newProps = baseProps;
    if ("ref" in baseProps) {
      newProps = {};
      for (var propName in baseProps)
        "ref" !== propName && (newProps[propName] = baseProps[propName]);
    }
    if (Component = Component.defaultProps) {
      newProps === baseProps && (newProps = assign({}, newProps));
      for (var propName$73 in Component)
        void 0 === newProps[propName$73] && (newProps[propName$73] = Component[propName$73]);
    }
    return newProps;
  }
  function defaultOnUncaughtError(error) {
    reportGlobalError(error);
  }
  function defaultOnCaughtError(error) {
    console.error(error);
  }
  function defaultOnRecoverableError(error) {
    reportGlobalError(error);
  }
  function logUncaughtError(root3, errorInfo) {
    try {
      var onUncaughtError = root3.onUncaughtError;
      onUncaughtError(errorInfo.value, { componentStack: errorInfo.stack });
    } catch (e$74) {
      setTimeout(function() {
        throw e$74;
      });
    }
  }
  function logCaughtError(root3, boundary, errorInfo) {
    try {
      var onCaughtError = root3.onCaughtError;
      onCaughtError(errorInfo.value, {
        componentStack: errorInfo.stack,
        errorBoundary: 1 === boundary.tag ? boundary.stateNode : null
      });
    } catch (e$75) {
      setTimeout(function() {
        throw e$75;
      });
    }
  }
  function createRootErrorUpdate(root3, errorInfo, lane) {
    lane = createUpdate(lane);
    lane.tag = 3;
    lane.payload = { element: null };
    lane.callback = function() {
      logUncaughtError(root3, errorInfo);
    };
    return lane;
  }
  function createClassErrorUpdate(lane) {
    lane = createUpdate(lane);
    lane.tag = 3;
    return lane;
  }
  function initializeClassErrorUpdate(update, root3, fiber, errorInfo) {
    var getDerivedStateFromError = fiber.type.getDerivedStateFromError;
    if ("function" === typeof getDerivedStateFromError) {
      var error = errorInfo.value;
      update.payload = function() {
        return getDerivedStateFromError(error);
      };
      update.callback = function() {
        logCaughtError(root3, fiber, errorInfo);
      };
    }
    var inst = fiber.stateNode;
    null !== inst && "function" === typeof inst.componentDidCatch && (update.callback = function() {
      logCaughtError(root3, fiber, errorInfo);
      "function" !== typeof getDerivedStateFromError && (null === legacyErrorBoundariesThatAlreadyFailed ? legacyErrorBoundariesThatAlreadyFailed = /* @__PURE__ */ new Set([this]) : legacyErrorBoundariesThatAlreadyFailed.add(this));
      var stack = errorInfo.stack;
      this.componentDidCatch(errorInfo.value, {
        componentStack: null !== stack ? stack : ""
      });
    });
  }
  function throwException(root3, returnFiber, sourceFiber, value, rootRenderLanes) {
    sourceFiber.flags |= 32768;
    if (null !== value && "object" === typeof value && "function" === typeof value.then) {
      returnFiber = sourceFiber.alternate;
      null !== returnFiber && propagateParentContextChanges(
        returnFiber,
        sourceFiber,
        rootRenderLanes,
        true
      );
      sourceFiber = suspenseHandlerStackCursor.current;
      if (null !== sourceFiber) {
        switch (sourceFiber.tag) {
          case 31:
          case 13:
            return null === shellBoundary ? renderDidSuspendDelayIfPossible() : null === sourceFiber.alternate && 0 === workInProgressRootExitStatus && (workInProgressRootExitStatus = 3), sourceFiber.flags &= -257, sourceFiber.flags |= 65536, sourceFiber.lanes = rootRenderLanes, value === noopSuspenseyCommitThenable ? sourceFiber.flags |= 16384 : (returnFiber = sourceFiber.updateQueue, null === returnFiber ? sourceFiber.updateQueue = /* @__PURE__ */ new Set([value]) : returnFiber.add(value), attachPingListener(root3, value, rootRenderLanes)), false;
          case 22:
            return sourceFiber.flags |= 65536, value === noopSuspenseyCommitThenable ? sourceFiber.flags |= 16384 : (returnFiber = sourceFiber.updateQueue, null === returnFiber ? (returnFiber = {
              transitions: null,
              markerInstances: null,
              retryQueue: /* @__PURE__ */ new Set([value])
            }, sourceFiber.updateQueue = returnFiber) : (sourceFiber = returnFiber.retryQueue, null === sourceFiber ? returnFiber.retryQueue = /* @__PURE__ */ new Set([value]) : sourceFiber.add(value)), attachPingListener(root3, value, rootRenderLanes)), false;
        }
        throw Error(formatProdErrorMessage(435, sourceFiber.tag));
      }
      attachPingListener(root3, value, rootRenderLanes);
      renderDidSuspendDelayIfPossible();
      return false;
    }
    if (isHydrating)
      return returnFiber = suspenseHandlerStackCursor.current, null !== returnFiber ? (0 === (returnFiber.flags & 65536) && (returnFiber.flags |= 256), returnFiber.flags |= 65536, returnFiber.lanes = rootRenderLanes, value !== HydrationMismatchException && (root3 = Error(formatProdErrorMessage(422), { cause: value }), queueHydrationError(createCapturedValueAtFiber(root3, sourceFiber)))) : (value !== HydrationMismatchException && (returnFiber = Error(formatProdErrorMessage(423), {
        cause: value
      }), queueHydrationError(
        createCapturedValueAtFiber(returnFiber, sourceFiber)
      )), root3 = root3.current.alternate, root3.flags |= 65536, rootRenderLanes &= -rootRenderLanes, root3.lanes |= rootRenderLanes, value = createCapturedValueAtFiber(value, sourceFiber), rootRenderLanes = createRootErrorUpdate(
        root3.stateNode,
        value,
        rootRenderLanes
      ), enqueueCapturedUpdate(root3, rootRenderLanes), 4 !== workInProgressRootExitStatus && (workInProgressRootExitStatus = 2)), false;
    var wrapperError = Error(formatProdErrorMessage(520), { cause: value });
    wrapperError = createCapturedValueAtFiber(wrapperError, sourceFiber);
    null === workInProgressRootConcurrentErrors ? workInProgressRootConcurrentErrors = [wrapperError] : workInProgressRootConcurrentErrors.push(wrapperError);
    4 !== workInProgressRootExitStatus && (workInProgressRootExitStatus = 2);
    if (null === returnFiber) return true;
    value = createCapturedValueAtFiber(value, sourceFiber);
    sourceFiber = returnFiber;
    do {
      switch (sourceFiber.tag) {
        case 3:
          return sourceFiber.flags |= 65536, root3 = rootRenderLanes & -rootRenderLanes, sourceFiber.lanes |= root3, root3 = createRootErrorUpdate(sourceFiber.stateNode, value, root3), enqueueCapturedUpdate(sourceFiber, root3), false;
        case 1:
          if (returnFiber = sourceFiber.type, wrapperError = sourceFiber.stateNode, 0 === (sourceFiber.flags & 128) && ("function" === typeof returnFiber.getDerivedStateFromError || null !== wrapperError && "function" === typeof wrapperError.componentDidCatch && (null === legacyErrorBoundariesThatAlreadyFailed || !legacyErrorBoundariesThatAlreadyFailed.has(wrapperError))))
            return sourceFiber.flags |= 65536, rootRenderLanes &= -rootRenderLanes, sourceFiber.lanes |= rootRenderLanes, rootRenderLanes = createClassErrorUpdate(rootRenderLanes), initializeClassErrorUpdate(
              rootRenderLanes,
              root3,
              sourceFiber,
              value
            ), enqueueCapturedUpdate(sourceFiber, rootRenderLanes), false;
      }
      sourceFiber = sourceFiber.return;
    } while (null !== sourceFiber);
    return false;
  }
  var SelectiveHydrationException = Error(formatProdErrorMessage(461)), didReceiveUpdate = false;
  function reconcileChildren(current, workInProgress2, nextChildren, renderLanes2) {
    workInProgress2.child = null === current ? mountChildFibers(workInProgress2, null, nextChildren, renderLanes2) : reconcileChildFibers(
      workInProgress2,
      current.child,
      nextChildren,
      renderLanes2
    );
  }
  function updateForwardRef(current, workInProgress2, Component, nextProps, renderLanes2) {
    Component = Component.render;
    var ref = workInProgress2.ref;
    if ("ref" in nextProps) {
      var propsWithoutRef = {};
      for (var key in nextProps)
        "ref" !== key && (propsWithoutRef[key] = nextProps[key]);
    } else propsWithoutRef = nextProps;
    prepareToReadContext(workInProgress2);
    nextProps = renderWithHooks(
      current,
      workInProgress2,
      Component,
      propsWithoutRef,
      ref,
      renderLanes2
    );
    key = checkDidRenderIdHook();
    if (null !== current && !didReceiveUpdate)
      return bailoutHooks(current, workInProgress2, renderLanes2), bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2);
    isHydrating && key && pushMaterializedTreeId(workInProgress2);
    workInProgress2.flags |= 1;
    reconcileChildren(current, workInProgress2, nextProps, renderLanes2);
    return workInProgress2.child;
  }
  function updateMemoComponent(current, workInProgress2, Component, nextProps, renderLanes2) {
    if (null === current) {
      var type = Component.type;
      if ("function" === typeof type && !shouldConstruct(type) && void 0 === type.defaultProps && null === Component.compare)
        return workInProgress2.tag = 15, workInProgress2.type = type, updateSimpleMemoComponent(
          current,
          workInProgress2,
          type,
          nextProps,
          renderLanes2
        );
      current = createFiberFromTypeAndProps(
        Component.type,
        null,
        nextProps,
        workInProgress2,
        workInProgress2.mode,
        renderLanes2
      );
      current.ref = workInProgress2.ref;
      current.return = workInProgress2;
      return workInProgress2.child = current;
    }
    type = current.child;
    if (!checkScheduledUpdateOrContext(current, renderLanes2)) {
      var prevProps = type.memoizedProps;
      Component = Component.compare;
      Component = null !== Component ? Component : shallowEqual;
      if (Component(prevProps, nextProps) && current.ref === workInProgress2.ref)
        return bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2);
    }
    workInProgress2.flags |= 1;
    current = createWorkInProgress(type, nextProps);
    current.ref = workInProgress2.ref;
    current.return = workInProgress2;
    return workInProgress2.child = current;
  }
  function updateSimpleMemoComponent(current, workInProgress2, Component, nextProps, renderLanes2) {
    if (null !== current) {
      var prevProps = current.memoizedProps;
      if (shallowEqual(prevProps, nextProps) && current.ref === workInProgress2.ref)
        if (didReceiveUpdate = false, workInProgress2.pendingProps = nextProps = prevProps, checkScheduledUpdateOrContext(current, renderLanes2))
          0 !== (current.flags & 131072) && (didReceiveUpdate = true);
        else
          return workInProgress2.lanes = current.lanes, bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2);
    }
    return updateFunctionComponent(
      current,
      workInProgress2,
      Component,
      nextProps,
      renderLanes2
    );
  }
  function updateOffscreenComponent(current, workInProgress2, renderLanes2, nextProps) {
    var nextChildren = nextProps.children, prevState = null !== current ? current.memoizedState : null;
    null === current && null === workInProgress2.stateNode && (workInProgress2.stateNode = {
      _visibility: 1,
      _pendingMarkers: null,
      _retryCache: null,
      _transitions: null
    });
    if ("hidden" === nextProps.mode) {
      if (0 !== (workInProgress2.flags & 128)) {
        prevState = null !== prevState ? prevState.baseLanes | renderLanes2 : renderLanes2;
        if (null !== current) {
          nextProps = workInProgress2.child = current.child;
          for (nextChildren = 0; null !== nextProps; )
            nextChildren = nextChildren | nextProps.lanes | nextProps.childLanes, nextProps = nextProps.sibling;
          nextProps = nextChildren & ~prevState;
        } else nextProps = 0, workInProgress2.child = null;
        return deferHiddenOffscreenComponent(
          current,
          workInProgress2,
          prevState,
          renderLanes2,
          nextProps
        );
      }
      if (0 !== (renderLanes2 & 536870912))
        workInProgress2.memoizedState = { baseLanes: 0, cachePool: null }, null !== current && pushTransition(
          workInProgress2,
          null !== prevState ? prevState.cachePool : null
        ), null !== prevState ? pushHiddenContext(workInProgress2, prevState) : reuseHiddenContextOnStack(), pushOffscreenSuspenseHandler(workInProgress2);
      else
        return nextProps = workInProgress2.lanes = 536870912, deferHiddenOffscreenComponent(
          current,
          workInProgress2,
          null !== prevState ? prevState.baseLanes | renderLanes2 : renderLanes2,
          renderLanes2,
          nextProps
        );
    } else
      null !== prevState ? (pushTransition(workInProgress2, prevState.cachePool), pushHiddenContext(workInProgress2, prevState), reuseSuspenseHandlerOnStack(), workInProgress2.memoizedState = null) : (null !== current && pushTransition(workInProgress2, null), reuseHiddenContextOnStack(), reuseSuspenseHandlerOnStack());
    reconcileChildren(current, workInProgress2, nextChildren, renderLanes2);
    return workInProgress2.child;
  }
  function bailoutOffscreenComponent(current, workInProgress2) {
    null !== current && 22 === current.tag || null !== workInProgress2.stateNode || (workInProgress2.stateNode = {
      _visibility: 1,
      _pendingMarkers: null,
      _retryCache: null,
      _transitions: null
    });
    return workInProgress2.sibling;
  }
  function deferHiddenOffscreenComponent(current, workInProgress2, nextBaseLanes, renderLanes2, remainingChildLanes) {
    var JSCompiler_inline_result = peekCacheFromPool();
    JSCompiler_inline_result = null === JSCompiler_inline_result ? null : { parent: CacheContext._currentValue, pool: JSCompiler_inline_result };
    workInProgress2.memoizedState = {
      baseLanes: nextBaseLanes,
      cachePool: JSCompiler_inline_result
    };
    null !== current && pushTransition(workInProgress2, null);
    reuseHiddenContextOnStack();
    pushOffscreenSuspenseHandler(workInProgress2);
    null !== current && propagateParentContextChanges(current, workInProgress2, renderLanes2, true);
    workInProgress2.childLanes = remainingChildLanes;
    return null;
  }
  function mountActivityChildren(workInProgress2, nextProps) {
    nextProps = mountWorkInProgressOffscreenFiber(
      { mode: nextProps.mode, children: nextProps.children },
      workInProgress2.mode
    );
    nextProps.ref = workInProgress2.ref;
    workInProgress2.child = nextProps;
    nextProps.return = workInProgress2;
    return nextProps;
  }
  function retryActivityComponentWithoutHydrating(current, workInProgress2, renderLanes2) {
    reconcileChildFibers(workInProgress2, current.child, null, renderLanes2);
    current = mountActivityChildren(workInProgress2, workInProgress2.pendingProps);
    current.flags |= 2;
    popSuspenseHandler(workInProgress2);
    workInProgress2.memoizedState = null;
    return current;
  }
  function updateActivityComponent(current, workInProgress2, renderLanes2) {
    var nextProps = workInProgress2.pendingProps, didSuspend = 0 !== (workInProgress2.flags & 128);
    workInProgress2.flags &= -129;
    if (null === current) {
      if (isHydrating) {
        if ("hidden" === nextProps.mode)
          return current = mountActivityChildren(workInProgress2, nextProps), workInProgress2.lanes = 536870912, bailoutOffscreenComponent(null, current);
        pushDehydratedActivitySuspenseHandler(workInProgress2);
        (current = nextHydratableInstance) ? (current = canHydrateHydrationBoundary(
          current,
          rootOrSingletonContext
        ), current = null !== current && "&" === current.data ? current : null, null !== current && (workInProgress2.memoizedState = {
          dehydrated: current,
          treeContext: null !== treeContextProvider ? { id: treeContextId, overflow: treeContextOverflow } : null,
          retryLane: 536870912,
          hydrationErrors: null
        }, renderLanes2 = createFiberFromDehydratedFragment(current), renderLanes2.return = workInProgress2, workInProgress2.child = renderLanes2, hydrationParentFiber = workInProgress2, nextHydratableInstance = null)) : current = null;
        if (null === current) throw throwOnHydrationMismatch(workInProgress2);
        workInProgress2.lanes = 536870912;
        return null;
      }
      return mountActivityChildren(workInProgress2, nextProps);
    }
    var prevState = current.memoizedState;
    if (null !== prevState) {
      var dehydrated = prevState.dehydrated;
      pushDehydratedActivitySuspenseHandler(workInProgress2);
      if (didSuspend)
        if (workInProgress2.flags & 256)
          workInProgress2.flags &= -257, workInProgress2 = retryActivityComponentWithoutHydrating(
            current,
            workInProgress2,
            renderLanes2
          );
        else if (null !== workInProgress2.memoizedState)
          workInProgress2.child = current.child, workInProgress2.flags |= 128, workInProgress2 = null;
        else throw Error(formatProdErrorMessage(558));
      else if (didReceiveUpdate || propagateParentContextChanges(current, workInProgress2, renderLanes2, false), didSuspend = 0 !== (renderLanes2 & current.childLanes), didReceiveUpdate || didSuspend) {
        nextProps = workInProgressRoot;
        if (null !== nextProps && (dehydrated = getBumpedLaneForHydration(nextProps, renderLanes2), 0 !== dehydrated && dehydrated !== prevState.retryLane))
          throw prevState.retryLane = dehydrated, enqueueConcurrentRenderForLane(current, dehydrated), scheduleUpdateOnFiber(nextProps, current, dehydrated), SelectiveHydrationException;
        renderDidSuspendDelayIfPossible();
        workInProgress2 = retryActivityComponentWithoutHydrating(
          current,
          workInProgress2,
          renderLanes2
        );
      } else
        current = prevState.treeContext, nextHydratableInstance = getNextHydratable(dehydrated.nextSibling), hydrationParentFiber = workInProgress2, isHydrating = true, hydrationErrors = null, rootOrSingletonContext = false, null !== current && restoreSuspendedTreeContext(workInProgress2, current), workInProgress2 = mountActivityChildren(workInProgress2, nextProps), workInProgress2.flags |= 4096;
      return workInProgress2;
    }
    current = createWorkInProgress(current.child, {
      mode: nextProps.mode,
      children: nextProps.children
    });
    current.ref = workInProgress2.ref;
    workInProgress2.child = current;
    current.return = workInProgress2;
    return current;
  }
  function markRef(current, workInProgress2) {
    var ref = workInProgress2.ref;
    if (null === ref)
      null !== current && null !== current.ref && (workInProgress2.flags |= 4194816);
    else {
      if ("function" !== typeof ref && "object" !== typeof ref)
        throw Error(formatProdErrorMessage(284));
      if (null === current || current.ref !== ref)
        workInProgress2.flags |= 4194816;
    }
  }
  function updateFunctionComponent(current, workInProgress2, Component, nextProps, renderLanes2) {
    prepareToReadContext(workInProgress2);
    Component = renderWithHooks(
      current,
      workInProgress2,
      Component,
      nextProps,
      void 0,
      renderLanes2
    );
    nextProps = checkDidRenderIdHook();
    if (null !== current && !didReceiveUpdate)
      return bailoutHooks(current, workInProgress2, renderLanes2), bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2);
    isHydrating && nextProps && pushMaterializedTreeId(workInProgress2);
    workInProgress2.flags |= 1;
    reconcileChildren(current, workInProgress2, Component, renderLanes2);
    return workInProgress2.child;
  }
  function replayFunctionComponent(current, workInProgress2, nextProps, Component, secondArg, renderLanes2) {
    prepareToReadContext(workInProgress2);
    workInProgress2.updateQueue = null;
    nextProps = renderWithHooksAgain(
      workInProgress2,
      Component,
      nextProps,
      secondArg
    );
    finishRenderingHooks(current);
    Component = checkDidRenderIdHook();
    if (null !== current && !didReceiveUpdate)
      return bailoutHooks(current, workInProgress2, renderLanes2), bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2);
    isHydrating && Component && pushMaterializedTreeId(workInProgress2);
    workInProgress2.flags |= 1;
    reconcileChildren(current, workInProgress2, nextProps, renderLanes2);
    return workInProgress2.child;
  }
  function updateClassComponent(current, workInProgress2, Component, nextProps, renderLanes2) {
    prepareToReadContext(workInProgress2);
    if (null === workInProgress2.stateNode) {
      var context = emptyContextObject, contextType = Component.contextType;
      "object" === typeof contextType && null !== contextType && (context = readContext(contextType));
      context = new Component(nextProps, context);
      workInProgress2.memoizedState = null !== context.state && void 0 !== context.state ? context.state : null;
      context.updater = classComponentUpdater;
      workInProgress2.stateNode = context;
      context._reactInternals = workInProgress2;
      context = workInProgress2.stateNode;
      context.props = nextProps;
      context.state = workInProgress2.memoizedState;
      context.refs = {};
      initializeUpdateQueue(workInProgress2);
      contextType = Component.contextType;
      context.context = "object" === typeof contextType && null !== contextType ? readContext(contextType) : emptyContextObject;
      context.state = workInProgress2.memoizedState;
      contextType = Component.getDerivedStateFromProps;
      "function" === typeof contextType && (applyDerivedStateFromProps(
        workInProgress2,
        Component,
        contextType,
        nextProps
      ), context.state = workInProgress2.memoizedState);
      "function" === typeof Component.getDerivedStateFromProps || "function" === typeof context.getSnapshotBeforeUpdate || "function" !== typeof context.UNSAFE_componentWillMount && "function" !== typeof context.componentWillMount || (contextType = context.state, "function" === typeof context.componentWillMount && context.componentWillMount(), "function" === typeof context.UNSAFE_componentWillMount && context.UNSAFE_componentWillMount(), contextType !== context.state && classComponentUpdater.enqueueReplaceState(context, context.state, null), processUpdateQueue(workInProgress2, nextProps, context, renderLanes2), suspendIfUpdateReadFromEntangledAsyncAction(), context.state = workInProgress2.memoizedState);
      "function" === typeof context.componentDidMount && (workInProgress2.flags |= 4194308);
      nextProps = true;
    } else if (null === current) {
      context = workInProgress2.stateNode;
      var unresolvedOldProps = workInProgress2.memoizedProps, oldProps = resolveClassComponentProps(Component, unresolvedOldProps);
      context.props = oldProps;
      var oldContext = context.context, contextType$jscomp$0 = Component.contextType;
      contextType = emptyContextObject;
      "object" === typeof contextType$jscomp$0 && null !== contextType$jscomp$0 && (contextType = readContext(contextType$jscomp$0));
      var getDerivedStateFromProps = Component.getDerivedStateFromProps;
      contextType$jscomp$0 = "function" === typeof getDerivedStateFromProps || "function" === typeof context.getSnapshotBeforeUpdate;
      unresolvedOldProps = workInProgress2.pendingProps !== unresolvedOldProps;
      contextType$jscomp$0 || "function" !== typeof context.UNSAFE_componentWillReceiveProps && "function" !== typeof context.componentWillReceiveProps || (unresolvedOldProps || oldContext !== contextType) && callComponentWillReceiveProps(
        workInProgress2,
        context,
        nextProps,
        contextType
      );
      hasForceUpdate = false;
      var oldState = workInProgress2.memoizedState;
      context.state = oldState;
      processUpdateQueue(workInProgress2, nextProps, context, renderLanes2);
      suspendIfUpdateReadFromEntangledAsyncAction();
      oldContext = workInProgress2.memoizedState;
      unresolvedOldProps || oldState !== oldContext || hasForceUpdate ? ("function" === typeof getDerivedStateFromProps && (applyDerivedStateFromProps(
        workInProgress2,
        Component,
        getDerivedStateFromProps,
        nextProps
      ), oldContext = workInProgress2.memoizedState), (oldProps = hasForceUpdate || checkShouldComponentUpdate(
        workInProgress2,
        Component,
        oldProps,
        nextProps,
        oldState,
        oldContext,
        contextType
      )) ? (contextType$jscomp$0 || "function" !== typeof context.UNSAFE_componentWillMount && "function" !== typeof context.componentWillMount || ("function" === typeof context.componentWillMount && context.componentWillMount(), "function" === typeof context.UNSAFE_componentWillMount && context.UNSAFE_componentWillMount()), "function" === typeof context.componentDidMount && (workInProgress2.flags |= 4194308)) : ("function" === typeof context.componentDidMount && (workInProgress2.flags |= 4194308), workInProgress2.memoizedProps = nextProps, workInProgress2.memoizedState = oldContext), context.props = nextProps, context.state = oldContext, context.context = contextType, nextProps = oldProps) : ("function" === typeof context.componentDidMount && (workInProgress2.flags |= 4194308), nextProps = false);
    } else {
      context = workInProgress2.stateNode;
      cloneUpdateQueue(current, workInProgress2);
      contextType = workInProgress2.memoizedProps;
      contextType$jscomp$0 = resolveClassComponentProps(Component, contextType);
      context.props = contextType$jscomp$0;
      getDerivedStateFromProps = workInProgress2.pendingProps;
      oldState = context.context;
      oldContext = Component.contextType;
      oldProps = emptyContextObject;
      "object" === typeof oldContext && null !== oldContext && (oldProps = readContext(oldContext));
      unresolvedOldProps = Component.getDerivedStateFromProps;
      (oldContext = "function" === typeof unresolvedOldProps || "function" === typeof context.getSnapshotBeforeUpdate) || "function" !== typeof context.UNSAFE_componentWillReceiveProps && "function" !== typeof context.componentWillReceiveProps || (contextType !== getDerivedStateFromProps || oldState !== oldProps) && callComponentWillReceiveProps(
        workInProgress2,
        context,
        nextProps,
        oldProps
      );
      hasForceUpdate = false;
      oldState = workInProgress2.memoizedState;
      context.state = oldState;
      processUpdateQueue(workInProgress2, nextProps, context, renderLanes2);
      suspendIfUpdateReadFromEntangledAsyncAction();
      var newState = workInProgress2.memoizedState;
      contextType !== getDerivedStateFromProps || oldState !== newState || hasForceUpdate || null !== current && null !== current.dependencies && checkIfContextChanged(current.dependencies) ? ("function" === typeof unresolvedOldProps && (applyDerivedStateFromProps(
        workInProgress2,
        Component,
        unresolvedOldProps,
        nextProps
      ), newState = workInProgress2.memoizedState), (contextType$jscomp$0 = hasForceUpdate || checkShouldComponentUpdate(
        workInProgress2,
        Component,
        contextType$jscomp$0,
        nextProps,
        oldState,
        newState,
        oldProps
      ) || null !== current && null !== current.dependencies && checkIfContextChanged(current.dependencies)) ? (oldContext || "function" !== typeof context.UNSAFE_componentWillUpdate && "function" !== typeof context.componentWillUpdate || ("function" === typeof context.componentWillUpdate && context.componentWillUpdate(nextProps, newState, oldProps), "function" === typeof context.UNSAFE_componentWillUpdate && context.UNSAFE_componentWillUpdate(
        nextProps,
        newState,
        oldProps
      )), "function" === typeof context.componentDidUpdate && (workInProgress2.flags |= 4), "function" === typeof context.getSnapshotBeforeUpdate && (workInProgress2.flags |= 1024)) : ("function" !== typeof context.componentDidUpdate || contextType === current.memoizedProps && oldState === current.memoizedState || (workInProgress2.flags |= 4), "function" !== typeof context.getSnapshotBeforeUpdate || contextType === current.memoizedProps && oldState === current.memoizedState || (workInProgress2.flags |= 1024), workInProgress2.memoizedProps = nextProps, workInProgress2.memoizedState = newState), context.props = nextProps, context.state = newState, context.context = oldProps, nextProps = contextType$jscomp$0) : ("function" !== typeof context.componentDidUpdate || contextType === current.memoizedProps && oldState === current.memoizedState || (workInProgress2.flags |= 4), "function" !== typeof context.getSnapshotBeforeUpdate || contextType === current.memoizedProps && oldState === current.memoizedState || (workInProgress2.flags |= 1024), nextProps = false);
    }
    context = nextProps;
    markRef(current, workInProgress2);
    nextProps = 0 !== (workInProgress2.flags & 128);
    context || nextProps ? (context = workInProgress2.stateNode, Component = nextProps && "function" !== typeof Component.getDerivedStateFromError ? null : context.render(), workInProgress2.flags |= 1, null !== current && nextProps ? (workInProgress2.child = reconcileChildFibers(
      workInProgress2,
      current.child,
      null,
      renderLanes2
    ), workInProgress2.child = reconcileChildFibers(
      workInProgress2,
      null,
      Component,
      renderLanes2
    )) : reconcileChildren(current, workInProgress2, Component, renderLanes2), workInProgress2.memoizedState = context.state, current = workInProgress2.child) : current = bailoutOnAlreadyFinishedWork(
      current,
      workInProgress2,
      renderLanes2
    );
    return current;
  }
  function mountHostRootWithoutHydrating(current, workInProgress2, nextChildren, renderLanes2) {
    resetHydrationState();
    workInProgress2.flags |= 256;
    reconcileChildren(current, workInProgress2, nextChildren, renderLanes2);
    return workInProgress2.child;
  }
  var SUSPENDED_MARKER = {
    dehydrated: null,
    treeContext: null,
    retryLane: 0,
    hydrationErrors: null
  };
  function mountSuspenseOffscreenState(renderLanes2) {
    return { baseLanes: renderLanes2, cachePool: getSuspendedCache() };
  }
  function getRemainingWorkInPrimaryTree(current, primaryTreeDidDefer, renderLanes2) {
    current = null !== current ? current.childLanes & ~renderLanes2 : 0;
    primaryTreeDidDefer && (current |= workInProgressDeferredLane);
    return current;
  }
  function updateSuspenseComponent(current, workInProgress2, renderLanes2) {
    var nextProps = workInProgress2.pendingProps, showFallback = false, didSuspend = 0 !== (workInProgress2.flags & 128), JSCompiler_temp;
    (JSCompiler_temp = didSuspend) || (JSCompiler_temp = null !== current && null === current.memoizedState ? false : 0 !== (suspenseStackCursor.current & 2));
    JSCompiler_temp && (showFallback = true, workInProgress2.flags &= -129);
    JSCompiler_temp = 0 !== (workInProgress2.flags & 32);
    workInProgress2.flags &= -33;
    if (null === current) {
      if (isHydrating) {
        showFallback ? pushPrimaryTreeSuspenseHandler(workInProgress2) : reuseSuspenseHandlerOnStack();
        (current = nextHydratableInstance) ? (current = canHydrateHydrationBoundary(
          current,
          rootOrSingletonContext
        ), current = null !== current && "&" !== current.data ? current : null, null !== current && (workInProgress2.memoizedState = {
          dehydrated: current,
          treeContext: null !== treeContextProvider ? { id: treeContextId, overflow: treeContextOverflow } : null,
          retryLane: 536870912,
          hydrationErrors: null
        }, renderLanes2 = createFiberFromDehydratedFragment(current), renderLanes2.return = workInProgress2, workInProgress2.child = renderLanes2, hydrationParentFiber = workInProgress2, nextHydratableInstance = null)) : current = null;
        if (null === current) throw throwOnHydrationMismatch(workInProgress2);
        isSuspenseInstanceFallback(current) ? workInProgress2.lanes = 32 : workInProgress2.lanes = 536870912;
        return null;
      }
      var nextPrimaryChildren = nextProps.children;
      nextProps = nextProps.fallback;
      if (showFallback)
        return reuseSuspenseHandlerOnStack(), showFallback = workInProgress2.mode, nextPrimaryChildren = mountWorkInProgressOffscreenFiber(
          { mode: "hidden", children: nextPrimaryChildren },
          showFallback
        ), nextProps = createFiberFromFragment(
          nextProps,
          showFallback,
          renderLanes2,
          null
        ), nextPrimaryChildren.return = workInProgress2, nextProps.return = workInProgress2, nextPrimaryChildren.sibling = nextProps, workInProgress2.child = nextPrimaryChildren, nextProps = workInProgress2.child, nextProps.memoizedState = mountSuspenseOffscreenState(renderLanes2), nextProps.childLanes = getRemainingWorkInPrimaryTree(
          current,
          JSCompiler_temp,
          renderLanes2
        ), workInProgress2.memoizedState = SUSPENDED_MARKER, bailoutOffscreenComponent(null, nextProps);
      pushPrimaryTreeSuspenseHandler(workInProgress2);
      return mountSuspensePrimaryChildren(workInProgress2, nextPrimaryChildren);
    }
    var prevState = current.memoizedState;
    if (null !== prevState && (nextPrimaryChildren = prevState.dehydrated, null !== nextPrimaryChildren)) {
      if (didSuspend)
        workInProgress2.flags & 256 ? (pushPrimaryTreeSuspenseHandler(workInProgress2), workInProgress2.flags &= -257, workInProgress2 = retrySuspenseComponentWithoutHydrating(
          current,
          workInProgress2,
          renderLanes2
        )) : null !== workInProgress2.memoizedState ? (reuseSuspenseHandlerOnStack(), workInProgress2.child = current.child, workInProgress2.flags |= 128, workInProgress2 = null) : (reuseSuspenseHandlerOnStack(), nextPrimaryChildren = nextProps.fallback, showFallback = workInProgress2.mode, nextProps = mountWorkInProgressOffscreenFiber(
          { mode: "visible", children: nextProps.children },
          showFallback
        ), nextPrimaryChildren = createFiberFromFragment(
          nextPrimaryChildren,
          showFallback,
          renderLanes2,
          null
        ), nextPrimaryChildren.flags |= 2, nextProps.return = workInProgress2, nextPrimaryChildren.return = workInProgress2, nextProps.sibling = nextPrimaryChildren, workInProgress2.child = nextProps, reconcileChildFibers(
          workInProgress2,
          current.child,
          null,
          renderLanes2
        ), nextProps = workInProgress2.child, nextProps.memoizedState = mountSuspenseOffscreenState(renderLanes2), nextProps.childLanes = getRemainingWorkInPrimaryTree(
          current,
          JSCompiler_temp,
          renderLanes2
        ), workInProgress2.memoizedState = SUSPENDED_MARKER, workInProgress2 = bailoutOffscreenComponent(null, nextProps));
      else if (pushPrimaryTreeSuspenseHandler(workInProgress2), isSuspenseInstanceFallback(nextPrimaryChildren)) {
        JSCompiler_temp = nextPrimaryChildren.nextSibling && nextPrimaryChildren.nextSibling.dataset;
        if (JSCompiler_temp) var digest = JSCompiler_temp.dgst;
        JSCompiler_temp = digest;
        nextProps = Error(formatProdErrorMessage(419));
        nextProps.stack = "";
        nextProps.digest = JSCompiler_temp;
        queueHydrationError({ value: nextProps, source: null, stack: null });
        workInProgress2 = retrySuspenseComponentWithoutHydrating(
          current,
          workInProgress2,
          renderLanes2
        );
      } else if (didReceiveUpdate || propagateParentContextChanges(current, workInProgress2, renderLanes2, false), JSCompiler_temp = 0 !== (renderLanes2 & current.childLanes), didReceiveUpdate || JSCompiler_temp) {
        JSCompiler_temp = workInProgressRoot;
        if (null !== JSCompiler_temp && (nextProps = getBumpedLaneForHydration(JSCompiler_temp, renderLanes2), 0 !== nextProps && nextProps !== prevState.retryLane))
          throw prevState.retryLane = nextProps, enqueueConcurrentRenderForLane(current, nextProps), scheduleUpdateOnFiber(JSCompiler_temp, current, nextProps), SelectiveHydrationException;
        isSuspenseInstancePending(nextPrimaryChildren) || renderDidSuspendDelayIfPossible();
        workInProgress2 = retrySuspenseComponentWithoutHydrating(
          current,
          workInProgress2,
          renderLanes2
        );
      } else
        isSuspenseInstancePending(nextPrimaryChildren) ? (workInProgress2.flags |= 192, workInProgress2.child = current.child, workInProgress2 = null) : (current = prevState.treeContext, nextHydratableInstance = getNextHydratable(
          nextPrimaryChildren.nextSibling
        ), hydrationParentFiber = workInProgress2, isHydrating = true, hydrationErrors = null, rootOrSingletonContext = false, null !== current && restoreSuspendedTreeContext(workInProgress2, current), workInProgress2 = mountSuspensePrimaryChildren(
          workInProgress2,
          nextProps.children
        ), workInProgress2.flags |= 4096);
      return workInProgress2;
    }
    if (showFallback)
      return reuseSuspenseHandlerOnStack(), nextPrimaryChildren = nextProps.fallback, showFallback = workInProgress2.mode, prevState = current.child, digest = prevState.sibling, nextProps = createWorkInProgress(prevState, {
        mode: "hidden",
        children: nextProps.children
      }), nextProps.subtreeFlags = prevState.subtreeFlags & 65011712, null !== digest ? nextPrimaryChildren = createWorkInProgress(
        digest,
        nextPrimaryChildren
      ) : (nextPrimaryChildren = createFiberFromFragment(
        nextPrimaryChildren,
        showFallback,
        renderLanes2,
        null
      ), nextPrimaryChildren.flags |= 2), nextPrimaryChildren.return = workInProgress2, nextProps.return = workInProgress2, nextProps.sibling = nextPrimaryChildren, workInProgress2.child = nextProps, bailoutOffscreenComponent(null, nextProps), nextProps = workInProgress2.child, nextPrimaryChildren = current.child.memoizedState, null === nextPrimaryChildren ? nextPrimaryChildren = mountSuspenseOffscreenState(renderLanes2) : (showFallback = nextPrimaryChildren.cachePool, null !== showFallback ? (prevState = CacheContext._currentValue, showFallback = showFallback.parent !== prevState ? { parent: prevState, pool: prevState } : showFallback) : showFallback = getSuspendedCache(), nextPrimaryChildren = {
        baseLanes: nextPrimaryChildren.baseLanes | renderLanes2,
        cachePool: showFallback
      }), nextProps.memoizedState = nextPrimaryChildren, nextProps.childLanes = getRemainingWorkInPrimaryTree(
        current,
        JSCompiler_temp,
        renderLanes2
      ), workInProgress2.memoizedState = SUSPENDED_MARKER, bailoutOffscreenComponent(current.child, nextProps);
    pushPrimaryTreeSuspenseHandler(workInProgress2);
    renderLanes2 = current.child;
    current = renderLanes2.sibling;
    renderLanes2 = createWorkInProgress(renderLanes2, {
      mode: "visible",
      children: nextProps.children
    });
    renderLanes2.return = workInProgress2;
    renderLanes2.sibling = null;
    null !== current && (JSCompiler_temp = workInProgress2.deletions, null === JSCompiler_temp ? (workInProgress2.deletions = [current], workInProgress2.flags |= 16) : JSCompiler_temp.push(current));
    workInProgress2.child = renderLanes2;
    workInProgress2.memoizedState = null;
    return renderLanes2;
  }
  function mountSuspensePrimaryChildren(workInProgress2, primaryChildren) {
    primaryChildren = mountWorkInProgressOffscreenFiber(
      { mode: "visible", children: primaryChildren },
      workInProgress2.mode
    );
    primaryChildren.return = workInProgress2;
    return workInProgress2.child = primaryChildren;
  }
  function mountWorkInProgressOffscreenFiber(offscreenProps, mode) {
    offscreenProps = createFiberImplClass(22, offscreenProps, null, mode);
    offscreenProps.lanes = 0;
    return offscreenProps;
  }
  function retrySuspenseComponentWithoutHydrating(current, workInProgress2, renderLanes2) {
    reconcileChildFibers(workInProgress2, current.child, null, renderLanes2);
    current = mountSuspensePrimaryChildren(
      workInProgress2,
      workInProgress2.pendingProps.children
    );
    current.flags |= 2;
    workInProgress2.memoizedState = null;
    return current;
  }
  function scheduleSuspenseWorkOnFiber(fiber, renderLanes2, propagationRoot) {
    fiber.lanes |= renderLanes2;
    var alternate = fiber.alternate;
    null !== alternate && (alternate.lanes |= renderLanes2);
    scheduleContextWorkOnParentPath(fiber.return, renderLanes2, propagationRoot);
  }
  function initSuspenseListRenderState(workInProgress2, isBackwards, tail, lastContentRow, tailMode, treeForkCount2) {
    var renderState = workInProgress2.memoizedState;
    null === renderState ? workInProgress2.memoizedState = {
      isBackwards,
      rendering: null,
      renderingStartTime: 0,
      last: lastContentRow,
      tail,
      tailMode,
      treeForkCount: treeForkCount2
    } : (renderState.isBackwards = isBackwards, renderState.rendering = null, renderState.renderingStartTime = 0, renderState.last = lastContentRow, renderState.tail = tail, renderState.tailMode = tailMode, renderState.treeForkCount = treeForkCount2);
  }
  function updateSuspenseListComponent(current, workInProgress2, renderLanes2) {
    var nextProps = workInProgress2.pendingProps, revealOrder = nextProps.revealOrder, tailMode = nextProps.tail;
    nextProps = nextProps.children;
    var suspenseContext = suspenseStackCursor.current, shouldForceFallback = 0 !== (suspenseContext & 2);
    shouldForceFallback ? (suspenseContext = suspenseContext & 1 | 2, workInProgress2.flags |= 128) : suspenseContext &= 1;
    push(suspenseStackCursor, suspenseContext);
    reconcileChildren(current, workInProgress2, nextProps, renderLanes2);
    nextProps = isHydrating ? treeForkCount : 0;
    if (!shouldForceFallback && null !== current && 0 !== (current.flags & 128))
      a: for (current = workInProgress2.child; null !== current; ) {
        if (13 === current.tag)
          null !== current.memoizedState && scheduleSuspenseWorkOnFiber(current, renderLanes2, workInProgress2);
        else if (19 === current.tag)
          scheduleSuspenseWorkOnFiber(current, renderLanes2, workInProgress2);
        else if (null !== current.child) {
          current.child.return = current;
          current = current.child;
          continue;
        }
        if (current === workInProgress2) break a;
        for (; null === current.sibling; ) {
          if (null === current.return || current.return === workInProgress2)
            break a;
          current = current.return;
        }
        current.sibling.return = current.return;
        current = current.sibling;
      }
    switch (revealOrder) {
      case "forwards":
        renderLanes2 = workInProgress2.child;
        for (revealOrder = null; null !== renderLanes2; )
          current = renderLanes2.alternate, null !== current && null === findFirstSuspended(current) && (revealOrder = renderLanes2), renderLanes2 = renderLanes2.sibling;
        renderLanes2 = revealOrder;
        null === renderLanes2 ? (revealOrder = workInProgress2.child, workInProgress2.child = null) : (revealOrder = renderLanes2.sibling, renderLanes2.sibling = null);
        initSuspenseListRenderState(
          workInProgress2,
          false,
          revealOrder,
          renderLanes2,
          tailMode,
          nextProps
        );
        break;
      case "backwards":
      case "unstable_legacy-backwards":
        renderLanes2 = null;
        revealOrder = workInProgress2.child;
        for (workInProgress2.child = null; null !== revealOrder; ) {
          current = revealOrder.alternate;
          if (null !== current && null === findFirstSuspended(current)) {
            workInProgress2.child = revealOrder;
            break;
          }
          current = revealOrder.sibling;
          revealOrder.sibling = renderLanes2;
          renderLanes2 = revealOrder;
          revealOrder = current;
        }
        initSuspenseListRenderState(
          workInProgress2,
          true,
          renderLanes2,
          null,
          tailMode,
          nextProps
        );
        break;
      case "together":
        initSuspenseListRenderState(
          workInProgress2,
          false,
          null,
          null,
          void 0,
          nextProps
        );
        break;
      default:
        workInProgress2.memoizedState = null;
    }
    return workInProgress2.child;
  }
  function bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2) {
    null !== current && (workInProgress2.dependencies = current.dependencies);
    workInProgressRootSkippedLanes |= workInProgress2.lanes;
    if (0 === (renderLanes2 & workInProgress2.childLanes))
      if (null !== current) {
        if (propagateParentContextChanges(
          current,
          workInProgress2,
          renderLanes2,
          false
        ), 0 === (renderLanes2 & workInProgress2.childLanes))
          return null;
      } else return null;
    if (null !== current && workInProgress2.child !== current.child)
      throw Error(formatProdErrorMessage(153));
    if (null !== workInProgress2.child) {
      current = workInProgress2.child;
      renderLanes2 = createWorkInProgress(current, current.pendingProps);
      workInProgress2.child = renderLanes2;
      for (renderLanes2.return = workInProgress2; null !== current.sibling; )
        current = current.sibling, renderLanes2 = renderLanes2.sibling = createWorkInProgress(current, current.pendingProps), renderLanes2.return = workInProgress2;
      renderLanes2.sibling = null;
    }
    return workInProgress2.child;
  }
  function checkScheduledUpdateOrContext(current, renderLanes2) {
    if (0 !== (current.lanes & renderLanes2)) return true;
    current = current.dependencies;
    return null !== current && checkIfContextChanged(current) ? true : false;
  }
  function attemptEarlyBailoutIfNoScheduledUpdate(current, workInProgress2, renderLanes2) {
    switch (workInProgress2.tag) {
      case 3:
        pushHostContainer(workInProgress2, workInProgress2.stateNode.containerInfo);
        pushProvider(workInProgress2, CacheContext, current.memoizedState.cache);
        resetHydrationState();
        break;
      case 27:
      case 5:
        pushHostContext(workInProgress2);
        break;
      case 4:
        pushHostContainer(workInProgress2, workInProgress2.stateNode.containerInfo);
        break;
      case 10:
        pushProvider(
          workInProgress2,
          workInProgress2.type,
          workInProgress2.memoizedProps.value
        );
        break;
      case 31:
        if (null !== workInProgress2.memoizedState)
          return workInProgress2.flags |= 128, pushDehydratedActivitySuspenseHandler(workInProgress2), null;
        break;
      case 13:
        var state$102 = workInProgress2.memoizedState;
        if (null !== state$102) {
          if (null !== state$102.dehydrated)
            return pushPrimaryTreeSuspenseHandler(workInProgress2), workInProgress2.flags |= 128, null;
          if (0 !== (renderLanes2 & workInProgress2.child.childLanes))
            return updateSuspenseComponent(current, workInProgress2, renderLanes2);
          pushPrimaryTreeSuspenseHandler(workInProgress2);
          current = bailoutOnAlreadyFinishedWork(
            current,
            workInProgress2,
            renderLanes2
          );
          return null !== current ? current.sibling : null;
        }
        pushPrimaryTreeSuspenseHandler(workInProgress2);
        break;
      case 19:
        var didSuspendBefore = 0 !== (current.flags & 128);
        state$102 = 0 !== (renderLanes2 & workInProgress2.childLanes);
        state$102 || (propagateParentContextChanges(
          current,
          workInProgress2,
          renderLanes2,
          false
        ), state$102 = 0 !== (renderLanes2 & workInProgress2.childLanes));
        if (didSuspendBefore) {
          if (state$102)
            return updateSuspenseListComponent(
              current,
              workInProgress2,
              renderLanes2
            );
          workInProgress2.flags |= 128;
        }
        didSuspendBefore = workInProgress2.memoizedState;
        null !== didSuspendBefore && (didSuspendBefore.rendering = null, didSuspendBefore.tail = null, didSuspendBefore.lastEffect = null);
        push(suspenseStackCursor, suspenseStackCursor.current);
        if (state$102) break;
        else return null;
      case 22:
        return workInProgress2.lanes = 0, updateOffscreenComponent(
          current,
          workInProgress2,
          renderLanes2,
          workInProgress2.pendingProps
        );
      case 24:
        pushProvider(workInProgress2, CacheContext, current.memoizedState.cache);
    }
    return bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2);
  }
  function beginWork(current, workInProgress2, renderLanes2) {
    if (null !== current)
      if (current.memoizedProps !== workInProgress2.pendingProps)
        didReceiveUpdate = true;
      else {
        if (!checkScheduledUpdateOrContext(current, renderLanes2) && 0 === (workInProgress2.flags & 128))
          return didReceiveUpdate = false, attemptEarlyBailoutIfNoScheduledUpdate(
            current,
            workInProgress2,
            renderLanes2
          );
        didReceiveUpdate = 0 !== (current.flags & 131072) ? true : false;
      }
    else
      didReceiveUpdate = false, isHydrating && 0 !== (workInProgress2.flags & 1048576) && pushTreeId(workInProgress2, treeForkCount, workInProgress2.index);
    workInProgress2.lanes = 0;
    switch (workInProgress2.tag) {
      case 16:
        a: {
          var props = workInProgress2.pendingProps;
          current = resolveLazy(workInProgress2.elementType);
          workInProgress2.type = current;
          if ("function" === typeof current)
            shouldConstruct(current) ? (props = resolveClassComponentProps(current, props), workInProgress2.tag = 1, workInProgress2 = updateClassComponent(
              null,
              workInProgress2,
              current,
              props,
              renderLanes2
            )) : (workInProgress2.tag = 0, workInProgress2 = updateFunctionComponent(
              null,
              workInProgress2,
              current,
              props,
              renderLanes2
            ));
          else {
            if (void 0 !== current && null !== current) {
              var $$typeof = current.$$typeof;
              if ($$typeof === REACT_FORWARD_REF_TYPE) {
                workInProgress2.tag = 11;
                workInProgress2 = updateForwardRef(
                  null,
                  workInProgress2,
                  current,
                  props,
                  renderLanes2
                );
                break a;
              } else if ($$typeof === REACT_MEMO_TYPE) {
                workInProgress2.tag = 14;
                workInProgress2 = updateMemoComponent(
                  null,
                  workInProgress2,
                  current,
                  props,
                  renderLanes2
                );
                break a;
              }
            }
            workInProgress2 = getComponentNameFromType(current) || current;
            throw Error(formatProdErrorMessage(306, workInProgress2, ""));
          }
        }
        return workInProgress2;
      case 0:
        return updateFunctionComponent(
          current,
          workInProgress2,
          workInProgress2.type,
          workInProgress2.pendingProps,
          renderLanes2
        );
      case 1:
        return props = workInProgress2.type, $$typeof = resolveClassComponentProps(
          props,
          workInProgress2.pendingProps
        ), updateClassComponent(
          current,
          workInProgress2,
          props,
          $$typeof,
          renderLanes2
        );
      case 3:
        a: {
          pushHostContainer(
            workInProgress2,
            workInProgress2.stateNode.containerInfo
          );
          if (null === current) throw Error(formatProdErrorMessage(387));
          props = workInProgress2.pendingProps;
          var prevState = workInProgress2.memoizedState;
          $$typeof = prevState.element;
          cloneUpdateQueue(current, workInProgress2);
          processUpdateQueue(workInProgress2, props, null, renderLanes2);
          var nextState = workInProgress2.memoizedState;
          props = nextState.cache;
          pushProvider(workInProgress2, CacheContext, props);
          props !== prevState.cache && propagateContextChanges(
            workInProgress2,
            [CacheContext],
            renderLanes2,
            true
          );
          suspendIfUpdateReadFromEntangledAsyncAction();
          props = nextState.element;
          if (prevState.isDehydrated)
            if (prevState = {
              element: props,
              isDehydrated: false,
              cache: nextState.cache
            }, workInProgress2.updateQueue.baseState = prevState, workInProgress2.memoizedState = prevState, workInProgress2.flags & 256) {
              workInProgress2 = mountHostRootWithoutHydrating(
                current,
                workInProgress2,
                props,
                renderLanes2
              );
              break a;
            } else if (props !== $$typeof) {
              $$typeof = createCapturedValueAtFiber(
                Error(formatProdErrorMessage(424)),
                workInProgress2
              );
              queueHydrationError($$typeof);
              workInProgress2 = mountHostRootWithoutHydrating(
                current,
                workInProgress2,
                props,
                renderLanes2
              );
              break a;
            } else {
              current = workInProgress2.stateNode.containerInfo;
              switch (current.nodeType) {
                case 9:
                  current = current.body;
                  break;
                default:
                  current = "HTML" === current.nodeName ? current.ownerDocument.body : current;
              }
              nextHydratableInstance = getNextHydratable(current.firstChild);
              hydrationParentFiber = workInProgress2;
              isHydrating = true;
              hydrationErrors = null;
              rootOrSingletonContext = true;
              renderLanes2 = mountChildFibers(
                workInProgress2,
                null,
                props,
                renderLanes2
              );
              for (workInProgress2.child = renderLanes2; renderLanes2; )
                renderLanes2.flags = renderLanes2.flags & -3 | 4096, renderLanes2 = renderLanes2.sibling;
            }
          else {
            resetHydrationState();
            if (props === $$typeof) {
              workInProgress2 = bailoutOnAlreadyFinishedWork(
                current,
                workInProgress2,
                renderLanes2
              );
              break a;
            }
            reconcileChildren(current, workInProgress2, props, renderLanes2);
          }
          workInProgress2 = workInProgress2.child;
        }
        return workInProgress2;
      case 26:
        return markRef(current, workInProgress2), null === current ? (renderLanes2 = getResource(
          workInProgress2.type,
          null,
          workInProgress2.pendingProps,
          null
        )) ? workInProgress2.memoizedState = renderLanes2 : isHydrating || (renderLanes2 = workInProgress2.type, current = workInProgress2.pendingProps, props = getOwnerDocumentFromRootContainer(
          rootInstanceStackCursor.current
        ).createElement(renderLanes2), props[internalInstanceKey] = workInProgress2, props[internalPropsKey] = current, setInitialProperties(props, renderLanes2, current), markNodeAsHoistable(props), workInProgress2.stateNode = props) : workInProgress2.memoizedState = getResource(
          workInProgress2.type,
          current.memoizedProps,
          workInProgress2.pendingProps,
          current.memoizedState
        ), null;
      case 27:
        return pushHostContext(workInProgress2), null === current && isHydrating && (props = workInProgress2.stateNode = resolveSingletonInstance(
          workInProgress2.type,
          workInProgress2.pendingProps,
          rootInstanceStackCursor.current
        ), hydrationParentFiber = workInProgress2, rootOrSingletonContext = true, $$typeof = nextHydratableInstance, isSingletonScope(workInProgress2.type) ? (previousHydratableOnEnteringScopedSingleton = $$typeof, nextHydratableInstance = getNextHydratable(props.firstChild)) : nextHydratableInstance = $$typeof), reconcileChildren(
          current,
          workInProgress2,
          workInProgress2.pendingProps.children,
          renderLanes2
        ), markRef(current, workInProgress2), null === current && (workInProgress2.flags |= 4194304), workInProgress2.child;
      case 5:
        if (null === current && isHydrating) {
          if ($$typeof = props = nextHydratableInstance)
            props = canHydrateInstance(
              props,
              workInProgress2.type,
              workInProgress2.pendingProps,
              rootOrSingletonContext
            ), null !== props ? (workInProgress2.stateNode = props, hydrationParentFiber = workInProgress2, nextHydratableInstance = getNextHydratable(props.firstChild), rootOrSingletonContext = false, $$typeof = true) : $$typeof = false;
          $$typeof || throwOnHydrationMismatch(workInProgress2);
        }
        pushHostContext(workInProgress2);
        $$typeof = workInProgress2.type;
        prevState = workInProgress2.pendingProps;
        nextState = null !== current ? current.memoizedProps : null;
        props = prevState.children;
        shouldSetTextContent($$typeof, prevState) ? props = null : null !== nextState && shouldSetTextContent($$typeof, nextState) && (workInProgress2.flags |= 32);
        null !== workInProgress2.memoizedState && ($$typeof = renderWithHooks(
          current,
          workInProgress2,
          TransitionAwareHostComponent,
          null,
          null,
          renderLanes2
        ), HostTransitionContext._currentValue = $$typeof);
        markRef(current, workInProgress2);
        reconcileChildren(current, workInProgress2, props, renderLanes2);
        return workInProgress2.child;
      case 6:
        if (null === current && isHydrating) {
          if (current = renderLanes2 = nextHydratableInstance)
            renderLanes2 = canHydrateTextInstance(
              renderLanes2,
              workInProgress2.pendingProps,
              rootOrSingletonContext
            ), null !== renderLanes2 ? (workInProgress2.stateNode = renderLanes2, hydrationParentFiber = workInProgress2, nextHydratableInstance = null, current = true) : current = false;
          current || throwOnHydrationMismatch(workInProgress2);
        }
        return null;
      case 13:
        return updateSuspenseComponent(current, workInProgress2, renderLanes2);
      case 4:
        return pushHostContainer(
          workInProgress2,
          workInProgress2.stateNode.containerInfo
        ), props = workInProgress2.pendingProps, null === current ? workInProgress2.child = reconcileChildFibers(
          workInProgress2,
          null,
          props,
          renderLanes2
        ) : reconcileChildren(current, workInProgress2, props, renderLanes2), workInProgress2.child;
      case 11:
        return updateForwardRef(
          current,
          workInProgress2,
          workInProgress2.type,
          workInProgress2.pendingProps,
          renderLanes2
        );
      case 7:
        return reconcileChildren(
          current,
          workInProgress2,
          workInProgress2.pendingProps,
          renderLanes2
        ), workInProgress2.child;
      case 8:
        return reconcileChildren(
          current,
          workInProgress2,
          workInProgress2.pendingProps.children,
          renderLanes2
        ), workInProgress2.child;
      case 12:
        return reconcileChildren(
          current,
          workInProgress2,
          workInProgress2.pendingProps.children,
          renderLanes2
        ), workInProgress2.child;
      case 10:
        return props = workInProgress2.pendingProps, pushProvider(workInProgress2, workInProgress2.type, props.value), reconcileChildren(current, workInProgress2, props.children, renderLanes2), workInProgress2.child;
      case 9:
        return $$typeof = workInProgress2.type._context, props = workInProgress2.pendingProps.children, prepareToReadContext(workInProgress2), $$typeof = readContext($$typeof), props = props($$typeof), workInProgress2.flags |= 1, reconcileChildren(current, workInProgress2, props, renderLanes2), workInProgress2.child;
      case 14:
        return updateMemoComponent(
          current,
          workInProgress2,
          workInProgress2.type,
          workInProgress2.pendingProps,
          renderLanes2
        );
      case 15:
        return updateSimpleMemoComponent(
          current,
          workInProgress2,
          workInProgress2.type,
          workInProgress2.pendingProps,
          renderLanes2
        );
      case 19:
        return updateSuspenseListComponent(current, workInProgress2, renderLanes2);
      case 31:
        return updateActivityComponent(current, workInProgress2, renderLanes2);
      case 22:
        return updateOffscreenComponent(
          current,
          workInProgress2,
          renderLanes2,
          workInProgress2.pendingProps
        );
      case 24:
        return prepareToReadContext(workInProgress2), props = readContext(CacheContext), null === current ? ($$typeof = peekCacheFromPool(), null === $$typeof && ($$typeof = workInProgressRoot, prevState = createCache(), $$typeof.pooledCache = prevState, prevState.refCount++, null !== prevState && ($$typeof.pooledCacheLanes |= renderLanes2), $$typeof = prevState), workInProgress2.memoizedState = { parent: props, cache: $$typeof }, initializeUpdateQueue(workInProgress2), pushProvider(workInProgress2, CacheContext, $$typeof)) : (0 !== (current.lanes & renderLanes2) && (cloneUpdateQueue(current, workInProgress2), processUpdateQueue(workInProgress2, null, null, renderLanes2), suspendIfUpdateReadFromEntangledAsyncAction()), $$typeof = current.memoizedState, prevState = workInProgress2.memoizedState, $$typeof.parent !== props ? ($$typeof = { parent: props, cache: props }, workInProgress2.memoizedState = $$typeof, 0 === workInProgress2.lanes && (workInProgress2.memoizedState = workInProgress2.updateQueue.baseState = $$typeof), pushProvider(workInProgress2, CacheContext, props)) : (props = prevState.cache, pushProvider(workInProgress2, CacheContext, props), props !== $$typeof.cache && propagateContextChanges(
          workInProgress2,
          [CacheContext],
          renderLanes2,
          true
        ))), reconcileChildren(
          current,
          workInProgress2,
          workInProgress2.pendingProps.children,
          renderLanes2
        ), workInProgress2.child;
      case 29:
        throw workInProgress2.pendingProps;
    }
    throw Error(formatProdErrorMessage(156, workInProgress2.tag));
  }
  function markUpdate(workInProgress2) {
    workInProgress2.flags |= 4;
  }
  function preloadInstanceAndSuspendIfNeeded(workInProgress2, type, oldProps, newProps, renderLanes2) {
    if (type = 0 !== (workInProgress2.mode & 32)) type = false;
    if (type) {
      if (workInProgress2.flags |= 16777216, (renderLanes2 & 335544128) === renderLanes2)
        if (workInProgress2.stateNode.complete) workInProgress2.flags |= 8192;
        else if (shouldRemainOnPreviousScreen()) workInProgress2.flags |= 8192;
        else
          throw suspendedThenable = noopSuspenseyCommitThenable, SuspenseyCommitException;
    } else workInProgress2.flags &= -16777217;
  }
  function preloadResourceAndSuspendIfNeeded(workInProgress2, resource) {
    if ("stylesheet" !== resource.type || 0 !== (resource.state.loading & 4))
      workInProgress2.flags &= -16777217;
    else if (workInProgress2.flags |= 16777216, !preloadResource(resource))
      if (shouldRemainOnPreviousScreen()) workInProgress2.flags |= 8192;
      else
        throw suspendedThenable = noopSuspenseyCommitThenable, SuspenseyCommitException;
  }
  function scheduleRetryEffect(workInProgress2, retryQueue) {
    null !== retryQueue && (workInProgress2.flags |= 4);
    workInProgress2.flags & 16384 && (retryQueue = 22 !== workInProgress2.tag ? claimNextRetryLane() : 536870912, workInProgress2.lanes |= retryQueue, workInProgressSuspendedRetryLanes |= retryQueue);
  }
  function cutOffTailIfNeeded(renderState, hasRenderedATailFallback) {
    if (!isHydrating)
      switch (renderState.tailMode) {
        case "hidden":
          hasRenderedATailFallback = renderState.tail;
          for (var lastTailNode = null; null !== hasRenderedATailFallback; )
            null !== hasRenderedATailFallback.alternate && (lastTailNode = hasRenderedATailFallback), hasRenderedATailFallback = hasRenderedATailFallback.sibling;
          null === lastTailNode ? renderState.tail = null : lastTailNode.sibling = null;
          break;
        case "collapsed":
          lastTailNode = renderState.tail;
          for (var lastTailNode$106 = null; null !== lastTailNode; )
            null !== lastTailNode.alternate && (lastTailNode$106 = lastTailNode), lastTailNode = lastTailNode.sibling;
          null === lastTailNode$106 ? hasRenderedATailFallback || null === renderState.tail ? renderState.tail = null : renderState.tail.sibling = null : lastTailNode$106.sibling = null;
      }
  }
  function bubbleProperties(completedWork) {
    var didBailout = null !== completedWork.alternate && completedWork.alternate.child === completedWork.child, newChildLanes = 0, subtreeFlags = 0;
    if (didBailout)
      for (var child$107 = completedWork.child; null !== child$107; )
        newChildLanes |= child$107.lanes | child$107.childLanes, subtreeFlags |= child$107.subtreeFlags & 65011712, subtreeFlags |= child$107.flags & 65011712, child$107.return = completedWork, child$107 = child$107.sibling;
    else
      for (child$107 = completedWork.child; null !== child$107; )
        newChildLanes |= child$107.lanes | child$107.childLanes, subtreeFlags |= child$107.subtreeFlags, subtreeFlags |= child$107.flags, child$107.return = completedWork, child$107 = child$107.sibling;
    completedWork.subtreeFlags |= subtreeFlags;
    completedWork.childLanes = newChildLanes;
    return didBailout;
  }
  function completeWork(current, workInProgress2, renderLanes2) {
    var newProps = workInProgress2.pendingProps;
    popTreeContext(workInProgress2);
    switch (workInProgress2.tag) {
      case 16:
      case 15:
      case 0:
      case 11:
      case 7:
      case 8:
      case 12:
      case 9:
      case 14:
        return bubbleProperties(workInProgress2), null;
      case 1:
        return bubbleProperties(workInProgress2), null;
      case 3:
        renderLanes2 = workInProgress2.stateNode;
        newProps = null;
        null !== current && (newProps = current.memoizedState.cache);
        workInProgress2.memoizedState.cache !== newProps && (workInProgress2.flags |= 2048);
        popProvider(CacheContext);
        popHostContainer();
        renderLanes2.pendingContext && (renderLanes2.context = renderLanes2.pendingContext, renderLanes2.pendingContext = null);
        if (null === current || null === current.child)
          popHydrationState(workInProgress2) ? markUpdate(workInProgress2) : null === current || current.memoizedState.isDehydrated && 0 === (workInProgress2.flags & 256) || (workInProgress2.flags |= 1024, upgradeHydrationErrorsToRecoverable());
        bubbleProperties(workInProgress2);
        return null;
      case 26:
        var type = workInProgress2.type, nextResource = workInProgress2.memoizedState;
        null === current ? (markUpdate(workInProgress2), null !== nextResource ? (bubbleProperties(workInProgress2), preloadResourceAndSuspendIfNeeded(workInProgress2, nextResource)) : (bubbleProperties(workInProgress2), preloadInstanceAndSuspendIfNeeded(
          workInProgress2,
          type,
          null,
          newProps,
          renderLanes2
        ))) : nextResource ? nextResource !== current.memoizedState ? (markUpdate(workInProgress2), bubbleProperties(workInProgress2), preloadResourceAndSuspendIfNeeded(workInProgress2, nextResource)) : (bubbleProperties(workInProgress2), workInProgress2.flags &= -16777217) : (current = current.memoizedProps, current !== newProps && markUpdate(workInProgress2), bubbleProperties(workInProgress2), preloadInstanceAndSuspendIfNeeded(
          workInProgress2,
          type,
          current,
          newProps,
          renderLanes2
        ));
        return null;
      case 27:
        popHostContext(workInProgress2);
        renderLanes2 = rootInstanceStackCursor.current;
        type = workInProgress2.type;
        if (null !== current && null != workInProgress2.stateNode)
          current.memoizedProps !== newProps && markUpdate(workInProgress2);
        else {
          if (!newProps) {
            if (null === workInProgress2.stateNode)
              throw Error(formatProdErrorMessage(166));
            bubbleProperties(workInProgress2);
            return null;
          }
          current = contextStackCursor.current;
          popHydrationState(workInProgress2) ? prepareToHydrateHostInstance(workInProgress2) : (current = resolveSingletonInstance(type, newProps, renderLanes2), workInProgress2.stateNode = current, markUpdate(workInProgress2));
        }
        bubbleProperties(workInProgress2);
        return null;
      case 5:
        popHostContext(workInProgress2);
        type = workInProgress2.type;
        if (null !== current && null != workInProgress2.stateNode)
          current.memoizedProps !== newProps && markUpdate(workInProgress2);
        else {
          if (!newProps) {
            if (null === workInProgress2.stateNode)
              throw Error(formatProdErrorMessage(166));
            bubbleProperties(workInProgress2);
            return null;
          }
          nextResource = contextStackCursor.current;
          if (popHydrationState(workInProgress2))
            prepareToHydrateHostInstance(workInProgress2);
          else {
            var ownerDocument = getOwnerDocumentFromRootContainer(
              rootInstanceStackCursor.current
            );
            switch (nextResource) {
              case 1:
                nextResource = ownerDocument.createElementNS(
                  "http://www.w3.org/2000/svg",
                  type
                );
                break;
              case 2:
                nextResource = ownerDocument.createElementNS(
                  "http://www.w3.org/1998/Math/MathML",
                  type
                );
                break;
              default:
                switch (type) {
                  case "svg":
                    nextResource = ownerDocument.createElementNS(
                      "http://www.w3.org/2000/svg",
                      type
                    );
                    break;
                  case "math":
                    nextResource = ownerDocument.createElementNS(
                      "http://www.w3.org/1998/Math/MathML",
                      type
                    );
                    break;
                  case "script":
                    nextResource = ownerDocument.createElement("div");
                    nextResource.innerHTML = "<script><\/script>";
                    nextResource = nextResource.removeChild(
                      nextResource.firstChild
                    );
                    break;
                  case "select":
                    nextResource = "string" === typeof newProps.is ? ownerDocument.createElement("select", {
                      is: newProps.is
                    }) : ownerDocument.createElement("select");
                    newProps.multiple ? nextResource.multiple = true : newProps.size && (nextResource.size = newProps.size);
                    break;
                  default:
                    nextResource = "string" === typeof newProps.is ? ownerDocument.createElement(type, { is: newProps.is }) : ownerDocument.createElement(type);
                }
            }
            nextResource[internalInstanceKey] = workInProgress2;
            nextResource[internalPropsKey] = newProps;
            a: for (ownerDocument = workInProgress2.child; null !== ownerDocument; ) {
              if (5 === ownerDocument.tag || 6 === ownerDocument.tag)
                nextResource.appendChild(ownerDocument.stateNode);
              else if (4 !== ownerDocument.tag && 27 !== ownerDocument.tag && null !== ownerDocument.child) {
                ownerDocument.child.return = ownerDocument;
                ownerDocument = ownerDocument.child;
                continue;
              }
              if (ownerDocument === workInProgress2) break a;
              for (; null === ownerDocument.sibling; ) {
                if (null === ownerDocument.return || ownerDocument.return === workInProgress2)
                  break a;
                ownerDocument = ownerDocument.return;
              }
              ownerDocument.sibling.return = ownerDocument.return;
              ownerDocument = ownerDocument.sibling;
            }
            workInProgress2.stateNode = nextResource;
            a: switch (setInitialProperties(nextResource, type, newProps), type) {
              case "button":
              case "input":
              case "select":
              case "textarea":
                newProps = !!newProps.autoFocus;
                break a;
              case "img":
                newProps = true;
                break a;
              default:
                newProps = false;
            }
            newProps && markUpdate(workInProgress2);
          }
        }
        bubbleProperties(workInProgress2);
        preloadInstanceAndSuspendIfNeeded(
          workInProgress2,
          workInProgress2.type,
          null === current ? null : current.memoizedProps,
          workInProgress2.pendingProps,
          renderLanes2
        );
        return null;
      case 6:
        if (current && null != workInProgress2.stateNode)
          current.memoizedProps !== newProps && markUpdate(workInProgress2);
        else {
          if ("string" !== typeof newProps && null === workInProgress2.stateNode)
            throw Error(formatProdErrorMessage(166));
          current = rootInstanceStackCursor.current;
          if (popHydrationState(workInProgress2)) {
            current = workInProgress2.stateNode;
            renderLanes2 = workInProgress2.memoizedProps;
            newProps = null;
            type = hydrationParentFiber;
            if (null !== type)
              switch (type.tag) {
                case 27:
                case 5:
                  newProps = type.memoizedProps;
              }
            current[internalInstanceKey] = workInProgress2;
            current = current.nodeValue === renderLanes2 || null !== newProps && true === newProps.suppressHydrationWarning || checkForUnmatchedText(current.nodeValue, renderLanes2) ? true : false;
            current || throwOnHydrationMismatch(workInProgress2, true);
          } else
            current = getOwnerDocumentFromRootContainer(current).createTextNode(
              newProps
            ), current[internalInstanceKey] = workInProgress2, workInProgress2.stateNode = current;
        }
        bubbleProperties(workInProgress2);
        return null;
      case 31:
        renderLanes2 = workInProgress2.memoizedState;
        if (null === current || null !== current.memoizedState) {
          newProps = popHydrationState(workInProgress2);
          if (null !== renderLanes2) {
            if (null === current) {
              if (!newProps) throw Error(formatProdErrorMessage(318));
              current = workInProgress2.memoizedState;
              current = null !== current ? current.dehydrated : null;
              if (!current) throw Error(formatProdErrorMessage(557));
              current[internalInstanceKey] = workInProgress2;
            } else
              resetHydrationState(), 0 === (workInProgress2.flags & 128) && (workInProgress2.memoizedState = null), workInProgress2.flags |= 4;
            bubbleProperties(workInProgress2);
            current = false;
          } else
            renderLanes2 = upgradeHydrationErrorsToRecoverable(), null !== current && null !== current.memoizedState && (current.memoizedState.hydrationErrors = renderLanes2), current = true;
          if (!current) {
            if (workInProgress2.flags & 256)
              return popSuspenseHandler(workInProgress2), workInProgress2;
            popSuspenseHandler(workInProgress2);
            return null;
          }
          if (0 !== (workInProgress2.flags & 128))
            throw Error(formatProdErrorMessage(558));
        }
        bubbleProperties(workInProgress2);
        return null;
      case 13:
        newProps = workInProgress2.memoizedState;
        if (null === current || null !== current.memoizedState && null !== current.memoizedState.dehydrated) {
          type = popHydrationState(workInProgress2);
          if (null !== newProps && null !== newProps.dehydrated) {
            if (null === current) {
              if (!type) throw Error(formatProdErrorMessage(318));
              type = workInProgress2.memoizedState;
              type = null !== type ? type.dehydrated : null;
              if (!type) throw Error(formatProdErrorMessage(317));
              type[internalInstanceKey] = workInProgress2;
            } else
              resetHydrationState(), 0 === (workInProgress2.flags & 128) && (workInProgress2.memoizedState = null), workInProgress2.flags |= 4;
            bubbleProperties(workInProgress2);
            type = false;
          } else
            type = upgradeHydrationErrorsToRecoverable(), null !== current && null !== current.memoizedState && (current.memoizedState.hydrationErrors = type), type = true;
          if (!type) {
            if (workInProgress2.flags & 256)
              return popSuspenseHandler(workInProgress2), workInProgress2;
            popSuspenseHandler(workInProgress2);
            return null;
          }
        }
        popSuspenseHandler(workInProgress2);
        if (0 !== (workInProgress2.flags & 128))
          return workInProgress2.lanes = renderLanes2, workInProgress2;
        renderLanes2 = null !== newProps;
        current = null !== current && null !== current.memoizedState;
        renderLanes2 && (newProps = workInProgress2.child, type = null, null !== newProps.alternate && null !== newProps.alternate.memoizedState && null !== newProps.alternate.memoizedState.cachePool && (type = newProps.alternate.memoizedState.cachePool.pool), nextResource = null, null !== newProps.memoizedState && null !== newProps.memoizedState.cachePool && (nextResource = newProps.memoizedState.cachePool.pool), nextResource !== type && (newProps.flags |= 2048));
        renderLanes2 !== current && renderLanes2 && (workInProgress2.child.flags |= 8192);
        scheduleRetryEffect(workInProgress2, workInProgress2.updateQueue);
        bubbleProperties(workInProgress2);
        return null;
      case 4:
        return popHostContainer(), null === current && listenToAllSupportedEvents(workInProgress2.stateNode.containerInfo), bubbleProperties(workInProgress2), null;
      case 10:
        return popProvider(workInProgress2.type), bubbleProperties(workInProgress2), null;
      case 19:
        pop(suspenseStackCursor);
        newProps = workInProgress2.memoizedState;
        if (null === newProps) return bubbleProperties(workInProgress2), null;
        type = 0 !== (workInProgress2.flags & 128);
        nextResource = newProps.rendering;
        if (null === nextResource)
          if (type) cutOffTailIfNeeded(newProps, false);
          else {
            if (0 !== workInProgressRootExitStatus || null !== current && 0 !== (current.flags & 128))
              for (current = workInProgress2.child; null !== current; ) {
                nextResource = findFirstSuspended(current);
                if (null !== nextResource) {
                  workInProgress2.flags |= 128;
                  cutOffTailIfNeeded(newProps, false);
                  current = nextResource.updateQueue;
                  workInProgress2.updateQueue = current;
                  scheduleRetryEffect(workInProgress2, current);
                  workInProgress2.subtreeFlags = 0;
                  current = renderLanes2;
                  for (renderLanes2 = workInProgress2.child; null !== renderLanes2; )
                    resetWorkInProgress(renderLanes2, current), renderLanes2 = renderLanes2.sibling;
                  push(
                    suspenseStackCursor,
                    suspenseStackCursor.current & 1 | 2
                  );
                  isHydrating && pushTreeFork(workInProgress2, newProps.treeForkCount);
                  return workInProgress2.child;
                }
                current = current.sibling;
              }
            null !== newProps.tail && now() > workInProgressRootRenderTargetTime && (workInProgress2.flags |= 128, type = true, cutOffTailIfNeeded(newProps, false), workInProgress2.lanes = 4194304);
          }
        else {
          if (!type)
            if (current = findFirstSuspended(nextResource), null !== current) {
              if (workInProgress2.flags |= 128, type = true, current = current.updateQueue, workInProgress2.updateQueue = current, scheduleRetryEffect(workInProgress2, current), cutOffTailIfNeeded(newProps, true), null === newProps.tail && "hidden" === newProps.tailMode && !nextResource.alternate && !isHydrating)
                return bubbleProperties(workInProgress2), null;
            } else
              2 * now() - newProps.renderingStartTime > workInProgressRootRenderTargetTime && 536870912 !== renderLanes2 && (workInProgress2.flags |= 128, type = true, cutOffTailIfNeeded(newProps, false), workInProgress2.lanes = 4194304);
          newProps.isBackwards ? (nextResource.sibling = workInProgress2.child, workInProgress2.child = nextResource) : (current = newProps.last, null !== current ? current.sibling = nextResource : workInProgress2.child = nextResource, newProps.last = nextResource);
        }
        if (null !== newProps.tail)
          return current = newProps.tail, newProps.rendering = current, newProps.tail = current.sibling, newProps.renderingStartTime = now(), current.sibling = null, renderLanes2 = suspenseStackCursor.current, push(
            suspenseStackCursor,
            type ? renderLanes2 & 1 | 2 : renderLanes2 & 1
          ), isHydrating && pushTreeFork(workInProgress2, newProps.treeForkCount), current;
        bubbleProperties(workInProgress2);
        return null;
      case 22:
      case 23:
        return popSuspenseHandler(workInProgress2), popHiddenContext(), newProps = null !== workInProgress2.memoizedState, null !== current ? null !== current.memoizedState !== newProps && (workInProgress2.flags |= 8192) : newProps && (workInProgress2.flags |= 8192), newProps ? 0 !== (renderLanes2 & 536870912) && 0 === (workInProgress2.flags & 128) && (bubbleProperties(workInProgress2), workInProgress2.subtreeFlags & 6 && (workInProgress2.flags |= 8192)) : bubbleProperties(workInProgress2), renderLanes2 = workInProgress2.updateQueue, null !== renderLanes2 && scheduleRetryEffect(workInProgress2, renderLanes2.retryQueue), renderLanes2 = null, null !== current && null !== current.memoizedState && null !== current.memoizedState.cachePool && (renderLanes2 = current.memoizedState.cachePool.pool), newProps = null, null !== workInProgress2.memoizedState && null !== workInProgress2.memoizedState.cachePool && (newProps = workInProgress2.memoizedState.cachePool.pool), newProps !== renderLanes2 && (workInProgress2.flags |= 2048), null !== current && pop(resumedCache), null;
      case 24:
        return renderLanes2 = null, null !== current && (renderLanes2 = current.memoizedState.cache), workInProgress2.memoizedState.cache !== renderLanes2 && (workInProgress2.flags |= 2048), popProvider(CacheContext), bubbleProperties(workInProgress2), null;
      case 25:
        return null;
      case 30:
        return null;
    }
    throw Error(formatProdErrorMessage(156, workInProgress2.tag));
  }
  function unwindWork(current, workInProgress2) {
    popTreeContext(workInProgress2);
    switch (workInProgress2.tag) {
      case 1:
        return current = workInProgress2.flags, current & 65536 ? (workInProgress2.flags = current & -65537 | 128, workInProgress2) : null;
      case 3:
        return popProvider(CacheContext), popHostContainer(), current = workInProgress2.flags, 0 !== (current & 65536) && 0 === (current & 128) ? (workInProgress2.flags = current & -65537 | 128, workInProgress2) : null;
      case 26:
      case 27:
      case 5:
        return popHostContext(workInProgress2), null;
      case 31:
        if (null !== workInProgress2.memoizedState) {
          popSuspenseHandler(workInProgress2);
          if (null === workInProgress2.alternate)
            throw Error(formatProdErrorMessage(340));
          resetHydrationState();
        }
        current = workInProgress2.flags;
        return current & 65536 ? (workInProgress2.flags = current & -65537 | 128, workInProgress2) : null;
      case 13:
        popSuspenseHandler(workInProgress2);
        current = workInProgress2.memoizedState;
        if (null !== current && null !== current.dehydrated) {
          if (null === workInProgress2.alternate)
            throw Error(formatProdErrorMessage(340));
          resetHydrationState();
        }
        current = workInProgress2.flags;
        return current & 65536 ? (workInProgress2.flags = current & -65537 | 128, workInProgress2) : null;
      case 19:
        return pop(suspenseStackCursor), null;
      case 4:
        return popHostContainer(), null;
      case 10:
        return popProvider(workInProgress2.type), null;
      case 22:
      case 23:
        return popSuspenseHandler(workInProgress2), popHiddenContext(), null !== current && pop(resumedCache), current = workInProgress2.flags, current & 65536 ? (workInProgress2.flags = current & -65537 | 128, workInProgress2) : null;
      case 24:
        return popProvider(CacheContext), null;
      case 25:
        return null;
      default:
        return null;
    }
  }
  function unwindInterruptedWork(current, interruptedWork) {
    popTreeContext(interruptedWork);
    switch (interruptedWork.tag) {
      case 3:
        popProvider(CacheContext);
        popHostContainer();
        break;
      case 26:
      case 27:
      case 5:
        popHostContext(interruptedWork);
        break;
      case 4:
        popHostContainer();
        break;
      case 31:
        null !== interruptedWork.memoizedState && popSuspenseHandler(interruptedWork);
        break;
      case 13:
        popSuspenseHandler(interruptedWork);
        break;
      case 19:
        pop(suspenseStackCursor);
        break;
      case 10:
        popProvider(interruptedWork.type);
        break;
      case 22:
      case 23:
        popSuspenseHandler(interruptedWork);
        popHiddenContext();
        null !== current && pop(resumedCache);
        break;
      case 24:
        popProvider(CacheContext);
    }
  }
  function commitHookEffectListMount(flags, finishedWork) {
    try {
      var updateQueue = finishedWork.updateQueue, lastEffect = null !== updateQueue ? updateQueue.lastEffect : null;
      if (null !== lastEffect) {
        var firstEffect = lastEffect.next;
        updateQueue = firstEffect;
        do {
          if ((updateQueue.tag & flags) === flags) {
            lastEffect = void 0;
            var create = updateQueue.create, inst = updateQueue.inst;
            lastEffect = create();
            inst.destroy = lastEffect;
          }
          updateQueue = updateQueue.next;
        } while (updateQueue !== firstEffect);
      }
    } catch (error) {
      captureCommitPhaseError(finishedWork, finishedWork.return, error);
    }
  }
  function commitHookEffectListUnmount(flags, finishedWork, nearestMountedAncestor$jscomp$0) {
    try {
      var updateQueue = finishedWork.updateQueue, lastEffect = null !== updateQueue ? updateQueue.lastEffect : null;
      if (null !== lastEffect) {
        var firstEffect = lastEffect.next;
        updateQueue = firstEffect;
        do {
          if ((updateQueue.tag & flags) === flags) {
            var inst = updateQueue.inst, destroy = inst.destroy;
            if (void 0 !== destroy) {
              inst.destroy = void 0;
              lastEffect = finishedWork;
              var nearestMountedAncestor = nearestMountedAncestor$jscomp$0, destroy_ = destroy;
              try {
                destroy_();
              } catch (error) {
                captureCommitPhaseError(
                  lastEffect,
                  nearestMountedAncestor,
                  error
                );
              }
            }
          }
          updateQueue = updateQueue.next;
        } while (updateQueue !== firstEffect);
      }
    } catch (error) {
      captureCommitPhaseError(finishedWork, finishedWork.return, error);
    }
  }
  function commitClassCallbacks(finishedWork) {
    var updateQueue = finishedWork.updateQueue;
    if (null !== updateQueue) {
      var instance = finishedWork.stateNode;
      try {
        commitCallbacks(updateQueue, instance);
      } catch (error) {
        captureCommitPhaseError(finishedWork, finishedWork.return, error);
      }
    }
  }
  function safelyCallComponentWillUnmount(current, nearestMountedAncestor, instance) {
    instance.props = resolveClassComponentProps(
      current.type,
      current.memoizedProps
    );
    instance.state = current.memoizedState;
    try {
      instance.componentWillUnmount();
    } catch (error) {
      captureCommitPhaseError(current, nearestMountedAncestor, error);
    }
  }
  function safelyAttachRef(current, nearestMountedAncestor) {
    try {
      var ref = current.ref;
      if (null !== ref) {
        switch (current.tag) {
          case 26:
          case 27:
          case 5:
            var instanceToUse = current.stateNode;
            break;
          case 30:
            instanceToUse = current.stateNode;
            break;
          default:
            instanceToUse = current.stateNode;
        }
        "function" === typeof ref ? current.refCleanup = ref(instanceToUse) : ref.current = instanceToUse;
      }
    } catch (error) {
      captureCommitPhaseError(current, nearestMountedAncestor, error);
    }
  }
  function safelyDetachRef(current, nearestMountedAncestor) {
    var ref = current.ref, refCleanup = current.refCleanup;
    if (null !== ref)
      if ("function" === typeof refCleanup)
        try {
          refCleanup();
        } catch (error) {
          captureCommitPhaseError(current, nearestMountedAncestor, error);
        } finally {
          current.refCleanup = null, current = current.alternate, null != current && (current.refCleanup = null);
        }
      else if ("function" === typeof ref)
        try {
          ref(null);
        } catch (error$140) {
          captureCommitPhaseError(current, nearestMountedAncestor, error$140);
        }
      else ref.current = null;
  }
  function commitHostMount(finishedWork) {
    var type = finishedWork.type, props = finishedWork.memoizedProps, instance = finishedWork.stateNode;
    try {
      a: switch (type) {
        case "button":
        case "input":
        case "select":
        case "textarea":
          props.autoFocus && instance.focus();
          break a;
        case "img":
          props.src ? instance.src = props.src : props.srcSet && (instance.srcset = props.srcSet);
      }
    } catch (error) {
      captureCommitPhaseError(finishedWork, finishedWork.return, error);
    }
  }
  function commitHostUpdate(finishedWork, newProps, oldProps) {
    try {
      var domElement = finishedWork.stateNode;
      updateProperties(domElement, finishedWork.type, oldProps, newProps);
      domElement[internalPropsKey] = newProps;
    } catch (error) {
      captureCommitPhaseError(finishedWork, finishedWork.return, error);
    }
  }
  function isHostParent(fiber) {
    return 5 === fiber.tag || 3 === fiber.tag || 26 === fiber.tag || 27 === fiber.tag && isSingletonScope(fiber.type) || 4 === fiber.tag;
  }
  function getHostSibling(fiber) {
    a: for (; ; ) {
      for (; null === fiber.sibling; ) {
        if (null === fiber.return || isHostParent(fiber.return)) return null;
        fiber = fiber.return;
      }
      fiber.sibling.return = fiber.return;
      for (fiber = fiber.sibling; 5 !== fiber.tag && 6 !== fiber.tag && 18 !== fiber.tag; ) {
        if (27 === fiber.tag && isSingletonScope(fiber.type)) continue a;
        if (fiber.flags & 2) continue a;
        if (null === fiber.child || 4 === fiber.tag) continue a;
        else fiber.child.return = fiber, fiber = fiber.child;
      }
      if (!(fiber.flags & 2)) return fiber.stateNode;
    }
  }
  function insertOrAppendPlacementNodeIntoContainer(node, before, parent) {
    var tag = node.tag;
    if (5 === tag || 6 === tag)
      node = node.stateNode, before ? (9 === parent.nodeType ? parent.body : "HTML" === parent.nodeName ? parent.ownerDocument.body : parent).insertBefore(node, before) : (before = 9 === parent.nodeType ? parent.body : "HTML" === parent.nodeName ? parent.ownerDocument.body : parent, before.appendChild(node), parent = parent._reactRootContainer, null !== parent && void 0 !== parent || null !== before.onclick || (before.onclick = noop$1));
    else if (4 !== tag && (27 === tag && isSingletonScope(node.type) && (parent = node.stateNode, before = null), node = node.child, null !== node))
      for (insertOrAppendPlacementNodeIntoContainer(node, before, parent), node = node.sibling; null !== node; )
        insertOrAppendPlacementNodeIntoContainer(node, before, parent), node = node.sibling;
  }
  function insertOrAppendPlacementNode(node, before, parent) {
    var tag = node.tag;
    if (5 === tag || 6 === tag)
      node = node.stateNode, before ? parent.insertBefore(node, before) : parent.appendChild(node);
    else if (4 !== tag && (27 === tag && isSingletonScope(node.type) && (parent = node.stateNode), node = node.child, null !== node))
      for (insertOrAppendPlacementNode(node, before, parent), node = node.sibling; null !== node; )
        insertOrAppendPlacementNode(node, before, parent), node = node.sibling;
  }
  function commitHostSingletonAcquisition(finishedWork) {
    var singleton = finishedWork.stateNode, props = finishedWork.memoizedProps;
    try {
      for (var type = finishedWork.type, attributes = singleton.attributes; attributes.length; )
        singleton.removeAttributeNode(attributes[0]);
      setInitialProperties(singleton, type, props);
      singleton[internalInstanceKey] = finishedWork;
      singleton[internalPropsKey] = props;
    } catch (error) {
      captureCommitPhaseError(finishedWork, finishedWork.return, error);
    }
  }
  var offscreenSubtreeIsHidden = false, offscreenSubtreeWasHidden = false, needsFormReset = false, PossiblyWeakSet = "function" === typeof WeakSet ? WeakSet : Set, nextEffect = null;
  function commitBeforeMutationEffects(root3, firstChild) {
    root3 = root3.containerInfo;
    eventsEnabled = _enabled;
    root3 = getActiveElementDeep(root3);
    if (hasSelectionCapabilities(root3)) {
      if ("selectionStart" in root3)
        var JSCompiler_temp = {
          start: root3.selectionStart,
          end: root3.selectionEnd
        };
      else
        a: {
          JSCompiler_temp = (JSCompiler_temp = root3.ownerDocument) && JSCompiler_temp.defaultView || window;
          var selection = JSCompiler_temp.getSelection && JSCompiler_temp.getSelection();
          if (selection && 0 !== selection.rangeCount) {
            JSCompiler_temp = selection.anchorNode;
            var anchorOffset = selection.anchorOffset, focusNode = selection.focusNode;
            selection = selection.focusOffset;
            try {
              JSCompiler_temp.nodeType, focusNode.nodeType;
            } catch (e$20) {
              JSCompiler_temp = null;
              break a;
            }
            var length = 0, start = -1, end = -1, indexWithinAnchor = 0, indexWithinFocus = 0, node = root3, parentNode = null;
            b: for (; ; ) {
              for (var next; ; ) {
                node !== JSCompiler_temp || 0 !== anchorOffset && 3 !== node.nodeType || (start = length + anchorOffset);
                node !== focusNode || 0 !== selection && 3 !== node.nodeType || (end = length + selection);
                3 === node.nodeType && (length += node.nodeValue.length);
                if (null === (next = node.firstChild)) break;
                parentNode = node;
                node = next;
              }
              for (; ; ) {
                if (node === root3) break b;
                parentNode === JSCompiler_temp && ++indexWithinAnchor === anchorOffset && (start = length);
                parentNode === focusNode && ++indexWithinFocus === selection && (end = length);
                if (null !== (next = node.nextSibling)) break;
                node = parentNode;
                parentNode = node.parentNode;
              }
              node = next;
            }
            JSCompiler_temp = -1 === start || -1 === end ? null : { start, end };
          } else JSCompiler_temp = null;
        }
      JSCompiler_temp = JSCompiler_temp || { start: 0, end: 0 };
    } else JSCompiler_temp = null;
    selectionInformation = { focusedElem: root3, selectionRange: JSCompiler_temp };
    _enabled = false;
    for (nextEffect = firstChild; null !== nextEffect; )
      if (firstChild = nextEffect, root3 = firstChild.child, 0 !== (firstChild.subtreeFlags & 1028) && null !== root3)
        root3.return = firstChild, nextEffect = root3;
      else
        for (; null !== nextEffect; ) {
          firstChild = nextEffect;
          focusNode = firstChild.alternate;
          root3 = firstChild.flags;
          switch (firstChild.tag) {
            case 0:
              if (0 !== (root3 & 4) && (root3 = firstChild.updateQueue, root3 = null !== root3 ? root3.events : null, null !== root3))
                for (JSCompiler_temp = 0; JSCompiler_temp < root3.length; JSCompiler_temp++)
                  anchorOffset = root3[JSCompiler_temp], anchorOffset.ref.impl = anchorOffset.nextImpl;
              break;
            case 11:
            case 15:
              break;
            case 1:
              if (0 !== (root3 & 1024) && null !== focusNode) {
                root3 = void 0;
                JSCompiler_temp = firstChild;
                anchorOffset = focusNode.memoizedProps;
                focusNode = focusNode.memoizedState;
                selection = JSCompiler_temp.stateNode;
                try {
                  var resolvedPrevProps = resolveClassComponentProps(
                    JSCompiler_temp.type,
                    anchorOffset
                  );
                  root3 = selection.getSnapshotBeforeUpdate(
                    resolvedPrevProps,
                    focusNode
                  );
                  selection.__reactInternalSnapshotBeforeUpdate = root3;
                } catch (error) {
                  captureCommitPhaseError(
                    JSCompiler_temp,
                    JSCompiler_temp.return,
                    error
                  );
                }
              }
              break;
            case 3:
              if (0 !== (root3 & 1024)) {
                if (root3 = firstChild.stateNode.containerInfo, JSCompiler_temp = root3.nodeType, 9 === JSCompiler_temp)
                  clearContainerSparingly(root3);
                else if (1 === JSCompiler_temp)
                  switch (root3.nodeName) {
                    case "HEAD":
                    case "HTML":
                    case "BODY":
                      clearContainerSparingly(root3);
                      break;
                    default:
                      root3.textContent = "";
                  }
              }
              break;
            case 5:
            case 26:
            case 27:
            case 6:
            case 4:
            case 17:
              break;
            default:
              if (0 !== (root3 & 1024)) throw Error(formatProdErrorMessage(163));
          }
          root3 = firstChild.sibling;
          if (null !== root3) {
            root3.return = firstChild.return;
            nextEffect = root3;
            break;
          }
          nextEffect = firstChild.return;
        }
  }
  function commitLayoutEffectOnFiber(finishedRoot, current, finishedWork) {
    var flags = finishedWork.flags;
    switch (finishedWork.tag) {
      case 0:
      case 11:
      case 15:
        recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
        flags & 4 && commitHookEffectListMount(5, finishedWork);
        break;
      case 1:
        recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
        if (flags & 4)
          if (finishedRoot = finishedWork.stateNode, null === current)
            try {
              finishedRoot.componentDidMount();
            } catch (error) {
              captureCommitPhaseError(finishedWork, finishedWork.return, error);
            }
          else {
            var prevProps = resolveClassComponentProps(
              finishedWork.type,
              current.memoizedProps
            );
            current = current.memoizedState;
            try {
              finishedRoot.componentDidUpdate(
                prevProps,
                current,
                finishedRoot.__reactInternalSnapshotBeforeUpdate
              );
            } catch (error$139) {
              captureCommitPhaseError(
                finishedWork,
                finishedWork.return,
                error$139
              );
            }
          }
        flags & 64 && commitClassCallbacks(finishedWork);
        flags & 512 && safelyAttachRef(finishedWork, finishedWork.return);
        break;
      case 3:
        recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
        if (flags & 64 && (finishedRoot = finishedWork.updateQueue, null !== finishedRoot)) {
          current = null;
          if (null !== finishedWork.child)
            switch (finishedWork.child.tag) {
              case 27:
              case 5:
                current = finishedWork.child.stateNode;
                break;
              case 1:
                current = finishedWork.child.stateNode;
            }
          try {
            commitCallbacks(finishedRoot, current);
          } catch (error) {
            captureCommitPhaseError(finishedWork, finishedWork.return, error);
          }
        }
        break;
      case 27:
        null === current && flags & 4 && commitHostSingletonAcquisition(finishedWork);
      case 26:
      case 5:
        recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
        null === current && flags & 4 && commitHostMount(finishedWork);
        flags & 512 && safelyAttachRef(finishedWork, finishedWork.return);
        break;
      case 12:
        recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
        break;
      case 31:
        recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
        flags & 4 && commitActivityHydrationCallbacks(finishedRoot, finishedWork);
        break;
      case 13:
        recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
        flags & 4 && commitSuspenseHydrationCallbacks(finishedRoot, finishedWork);
        flags & 64 && (finishedRoot = finishedWork.memoizedState, null !== finishedRoot && (finishedRoot = finishedRoot.dehydrated, null !== finishedRoot && (finishedWork = retryDehydratedSuspenseBoundary.bind(
          null,
          finishedWork
        ), registerSuspenseInstanceRetry(finishedRoot, finishedWork))));
        break;
      case 22:
        flags = null !== finishedWork.memoizedState || offscreenSubtreeIsHidden;
        if (!flags) {
          current = null !== current && null !== current.memoizedState || offscreenSubtreeWasHidden;
          prevProps = offscreenSubtreeIsHidden;
          var prevOffscreenSubtreeWasHidden = offscreenSubtreeWasHidden;
          offscreenSubtreeIsHidden = flags;
          (offscreenSubtreeWasHidden = current) && !prevOffscreenSubtreeWasHidden ? recursivelyTraverseReappearLayoutEffects(
            finishedRoot,
            finishedWork,
            0 !== (finishedWork.subtreeFlags & 8772)
          ) : recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
          offscreenSubtreeIsHidden = prevProps;
          offscreenSubtreeWasHidden = prevOffscreenSubtreeWasHidden;
        }
        break;
      case 30:
        break;
      default:
        recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
    }
  }
  function detachFiberAfterEffects(fiber) {
    var alternate = fiber.alternate;
    null !== alternate && (fiber.alternate = null, detachFiberAfterEffects(alternate));
    fiber.child = null;
    fiber.deletions = null;
    fiber.sibling = null;
    5 === fiber.tag && (alternate = fiber.stateNode, null !== alternate && detachDeletedInstance(alternate));
    fiber.stateNode = null;
    fiber.return = null;
    fiber.dependencies = null;
    fiber.memoizedProps = null;
    fiber.memoizedState = null;
    fiber.pendingProps = null;
    fiber.stateNode = null;
    fiber.updateQueue = null;
  }
  var hostParent = null, hostParentIsContainer = false;
  function recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, parent) {
    for (parent = parent.child; null !== parent; )
      commitDeletionEffectsOnFiber(finishedRoot, nearestMountedAncestor, parent), parent = parent.sibling;
  }
  function commitDeletionEffectsOnFiber(finishedRoot, nearestMountedAncestor, deletedFiber) {
    if (injectedHook && "function" === typeof injectedHook.onCommitFiberUnmount)
      try {
        injectedHook.onCommitFiberUnmount(rendererID, deletedFiber);
      } catch (err) {
      }
    switch (deletedFiber.tag) {
      case 26:
        offscreenSubtreeWasHidden || safelyDetachRef(deletedFiber, nearestMountedAncestor);
        recursivelyTraverseDeletionEffects(
          finishedRoot,
          nearestMountedAncestor,
          deletedFiber
        );
        deletedFiber.memoizedState ? deletedFiber.memoizedState.count-- : deletedFiber.stateNode && (deletedFiber = deletedFiber.stateNode, deletedFiber.parentNode.removeChild(deletedFiber));
        break;
      case 27:
        offscreenSubtreeWasHidden || safelyDetachRef(deletedFiber, nearestMountedAncestor);
        var prevHostParent = hostParent, prevHostParentIsContainer = hostParentIsContainer;
        isSingletonScope(deletedFiber.type) && (hostParent = deletedFiber.stateNode, hostParentIsContainer = false);
        recursivelyTraverseDeletionEffects(
          finishedRoot,
          nearestMountedAncestor,
          deletedFiber
        );
        releaseSingletonInstance(deletedFiber.stateNode);
        hostParent = prevHostParent;
        hostParentIsContainer = prevHostParentIsContainer;
        break;
      case 5:
        offscreenSubtreeWasHidden || safelyDetachRef(deletedFiber, nearestMountedAncestor);
      case 6:
        prevHostParent = hostParent;
        prevHostParentIsContainer = hostParentIsContainer;
        hostParent = null;
        recursivelyTraverseDeletionEffects(
          finishedRoot,
          nearestMountedAncestor,
          deletedFiber
        );
        hostParent = prevHostParent;
        hostParentIsContainer = prevHostParentIsContainer;
        if (null !== hostParent)
          if (hostParentIsContainer)
            try {
              (9 === hostParent.nodeType ? hostParent.body : "HTML" === hostParent.nodeName ? hostParent.ownerDocument.body : hostParent).removeChild(deletedFiber.stateNode);
            } catch (error) {
              captureCommitPhaseError(
                deletedFiber,
                nearestMountedAncestor,
                error
              );
            }
          else
            try {
              hostParent.removeChild(deletedFiber.stateNode);
            } catch (error) {
              captureCommitPhaseError(
                deletedFiber,
                nearestMountedAncestor,
                error
              );
            }
        break;
      case 18:
        null !== hostParent && (hostParentIsContainer ? (finishedRoot = hostParent, clearHydrationBoundary(
          9 === finishedRoot.nodeType ? finishedRoot.body : "HTML" === finishedRoot.nodeName ? finishedRoot.ownerDocument.body : finishedRoot,
          deletedFiber.stateNode
        ), retryIfBlockedOn(finishedRoot)) : clearHydrationBoundary(hostParent, deletedFiber.stateNode));
        break;
      case 4:
        prevHostParent = hostParent;
        prevHostParentIsContainer = hostParentIsContainer;
        hostParent = deletedFiber.stateNode.containerInfo;
        hostParentIsContainer = true;
        recursivelyTraverseDeletionEffects(
          finishedRoot,
          nearestMountedAncestor,
          deletedFiber
        );
        hostParent = prevHostParent;
        hostParentIsContainer = prevHostParentIsContainer;
        break;
      case 0:
      case 11:
      case 14:
      case 15:
        commitHookEffectListUnmount(2, deletedFiber, nearestMountedAncestor);
        offscreenSubtreeWasHidden || commitHookEffectListUnmount(4, deletedFiber, nearestMountedAncestor);
        recursivelyTraverseDeletionEffects(
          finishedRoot,
          nearestMountedAncestor,
          deletedFiber
        );
        break;
      case 1:
        offscreenSubtreeWasHidden || (safelyDetachRef(deletedFiber, nearestMountedAncestor), prevHostParent = deletedFiber.stateNode, "function" === typeof prevHostParent.componentWillUnmount && safelyCallComponentWillUnmount(
          deletedFiber,
          nearestMountedAncestor,
          prevHostParent
        ));
        recursivelyTraverseDeletionEffects(
          finishedRoot,
          nearestMountedAncestor,
          deletedFiber
        );
        break;
      case 21:
        recursivelyTraverseDeletionEffects(
          finishedRoot,
          nearestMountedAncestor,
          deletedFiber
        );
        break;
      case 22:
        offscreenSubtreeWasHidden = (prevHostParent = offscreenSubtreeWasHidden) || null !== deletedFiber.memoizedState;
        recursivelyTraverseDeletionEffects(
          finishedRoot,
          nearestMountedAncestor,
          deletedFiber
        );
        offscreenSubtreeWasHidden = prevHostParent;
        break;
      default:
        recursivelyTraverseDeletionEffects(
          finishedRoot,
          nearestMountedAncestor,
          deletedFiber
        );
    }
  }
  function commitActivityHydrationCallbacks(finishedRoot, finishedWork) {
    if (null === finishedWork.memoizedState && (finishedRoot = finishedWork.alternate, null !== finishedRoot && (finishedRoot = finishedRoot.memoizedState, null !== finishedRoot))) {
      finishedRoot = finishedRoot.dehydrated;
      try {
        retryIfBlockedOn(finishedRoot);
      } catch (error) {
        captureCommitPhaseError(finishedWork, finishedWork.return, error);
      }
    }
  }
  function commitSuspenseHydrationCallbacks(finishedRoot, finishedWork) {
    if (null === finishedWork.memoizedState && (finishedRoot = finishedWork.alternate, null !== finishedRoot && (finishedRoot = finishedRoot.memoizedState, null !== finishedRoot && (finishedRoot = finishedRoot.dehydrated, null !== finishedRoot))))
      try {
        retryIfBlockedOn(finishedRoot);
      } catch (error) {
        captureCommitPhaseError(finishedWork, finishedWork.return, error);
      }
  }
  function getRetryCache(finishedWork) {
    switch (finishedWork.tag) {
      case 31:
      case 13:
      case 19:
        var retryCache = finishedWork.stateNode;
        null === retryCache && (retryCache = finishedWork.stateNode = new PossiblyWeakSet());
        return retryCache;
      case 22:
        return finishedWork = finishedWork.stateNode, retryCache = finishedWork._retryCache, null === retryCache && (retryCache = finishedWork._retryCache = new PossiblyWeakSet()), retryCache;
      default:
        throw Error(formatProdErrorMessage(435, finishedWork.tag));
    }
  }
  function attachSuspenseRetryListeners(finishedWork, wakeables) {
    var retryCache = getRetryCache(finishedWork);
    wakeables.forEach(function(wakeable) {
      if (!retryCache.has(wakeable)) {
        retryCache.add(wakeable);
        var retry = resolveRetryWakeable.bind(null, finishedWork, wakeable);
        wakeable.then(retry, retry);
      }
    });
  }
  function recursivelyTraverseMutationEffects(root$jscomp$0, parentFiber) {
    var deletions = parentFiber.deletions;
    if (null !== deletions)
      for (var i = 0; i < deletions.length; i++) {
        var childToDelete = deletions[i], root3 = root$jscomp$0, returnFiber = parentFiber, parent = returnFiber;
        a: for (; null !== parent; ) {
          switch (parent.tag) {
            case 27:
              if (isSingletonScope(parent.type)) {
                hostParent = parent.stateNode;
                hostParentIsContainer = false;
                break a;
              }
              break;
            case 5:
              hostParent = parent.stateNode;
              hostParentIsContainer = false;
              break a;
            case 3:
            case 4:
              hostParent = parent.stateNode.containerInfo;
              hostParentIsContainer = true;
              break a;
          }
          parent = parent.return;
        }
        if (null === hostParent) throw Error(formatProdErrorMessage(160));
        commitDeletionEffectsOnFiber(root3, returnFiber, childToDelete);
        hostParent = null;
        hostParentIsContainer = false;
        root3 = childToDelete.alternate;
        null !== root3 && (root3.return = null);
        childToDelete.return = null;
      }
    if (parentFiber.subtreeFlags & 13886)
      for (parentFiber = parentFiber.child; null !== parentFiber; )
        commitMutationEffectsOnFiber(parentFiber, root$jscomp$0), parentFiber = parentFiber.sibling;
  }
  var currentHoistableRoot = null;
  function commitMutationEffectsOnFiber(finishedWork, root3) {
    var current = finishedWork.alternate, flags = finishedWork.flags;
    switch (finishedWork.tag) {
      case 0:
      case 11:
      case 14:
      case 15:
        recursivelyTraverseMutationEffects(root3, finishedWork);
        commitReconciliationEffects(finishedWork);
        flags & 4 && (commitHookEffectListUnmount(3, finishedWork, finishedWork.return), commitHookEffectListMount(3, finishedWork), commitHookEffectListUnmount(5, finishedWork, finishedWork.return));
        break;
      case 1:
        recursivelyTraverseMutationEffects(root3, finishedWork);
        commitReconciliationEffects(finishedWork);
        flags & 512 && (offscreenSubtreeWasHidden || null === current || safelyDetachRef(current, current.return));
        flags & 64 && offscreenSubtreeIsHidden && (finishedWork = finishedWork.updateQueue, null !== finishedWork && (flags = finishedWork.callbacks, null !== flags && (current = finishedWork.shared.hiddenCallbacks, finishedWork.shared.hiddenCallbacks = null === current ? flags : current.concat(flags))));
        break;
      case 26:
        var hoistableRoot = currentHoistableRoot;
        recursivelyTraverseMutationEffects(root3, finishedWork);
        commitReconciliationEffects(finishedWork);
        flags & 512 && (offscreenSubtreeWasHidden || null === current || safelyDetachRef(current, current.return));
        if (flags & 4) {
          var currentResource = null !== current ? current.memoizedState : null;
          flags = finishedWork.memoizedState;
          if (null === current)
            if (null === flags)
              if (null === finishedWork.stateNode) {
                a: {
                  flags = finishedWork.type;
                  current = finishedWork.memoizedProps;
                  hoistableRoot = hoistableRoot.ownerDocument || hoistableRoot;
                  b: switch (flags) {
                    case "title":
                      currentResource = hoistableRoot.getElementsByTagName("title")[0];
                      if (!currentResource || currentResource[internalHoistableMarker] || currentResource[internalInstanceKey] || "http://www.w3.org/2000/svg" === currentResource.namespaceURI || currentResource.hasAttribute("itemprop"))
                        currentResource = hoistableRoot.createElement(flags), hoistableRoot.head.insertBefore(
                          currentResource,
                          hoistableRoot.querySelector("head > title")
                        );
                      setInitialProperties(currentResource, flags, current);
                      currentResource[internalInstanceKey] = finishedWork;
                      markNodeAsHoistable(currentResource);
                      flags = currentResource;
                      break a;
                    case "link":
                      var maybeNodes = getHydratableHoistableCache(
                        "link",
                        "href",
                        hoistableRoot
                      ).get(flags + (current.href || ""));
                      if (maybeNodes) {
                        for (var i = 0; i < maybeNodes.length; i++)
                          if (currentResource = maybeNodes[i], currentResource.getAttribute("href") === (null == current.href || "" === current.href ? null : current.href) && currentResource.getAttribute("rel") === (null == current.rel ? null : current.rel) && currentResource.getAttribute("title") === (null == current.title ? null : current.title) && currentResource.getAttribute("crossorigin") === (null == current.crossOrigin ? null : current.crossOrigin)) {
                            maybeNodes.splice(i, 1);
                            break b;
                          }
                      }
                      currentResource = hoistableRoot.createElement(flags);
                      setInitialProperties(currentResource, flags, current);
                      hoistableRoot.head.appendChild(currentResource);
                      break;
                    case "meta":
                      if (maybeNodes = getHydratableHoistableCache(
                        "meta",
                        "content",
                        hoistableRoot
                      ).get(flags + (current.content || ""))) {
                        for (i = 0; i < maybeNodes.length; i++)
                          if (currentResource = maybeNodes[i], currentResource.getAttribute("content") === (null == current.content ? null : "" + current.content) && currentResource.getAttribute("name") === (null == current.name ? null : current.name) && currentResource.getAttribute("property") === (null == current.property ? null : current.property) && currentResource.getAttribute("http-equiv") === (null == current.httpEquiv ? null : current.httpEquiv) && currentResource.getAttribute("charset") === (null == current.charSet ? null : current.charSet)) {
                            maybeNodes.splice(i, 1);
                            break b;
                          }
                      }
                      currentResource = hoistableRoot.createElement(flags);
                      setInitialProperties(currentResource, flags, current);
                      hoistableRoot.head.appendChild(currentResource);
                      break;
                    default:
                      throw Error(formatProdErrorMessage(468, flags));
                  }
                  currentResource[internalInstanceKey] = finishedWork;
                  markNodeAsHoistable(currentResource);
                  flags = currentResource;
                }
                finishedWork.stateNode = flags;
              } else
                mountHoistable(
                  hoistableRoot,
                  finishedWork.type,
                  finishedWork.stateNode
                );
            else
              finishedWork.stateNode = acquireResource(
                hoistableRoot,
                flags,
                finishedWork.memoizedProps
              );
          else
            currentResource !== flags ? (null === currentResource ? null !== current.stateNode && (current = current.stateNode, current.parentNode.removeChild(current)) : currentResource.count--, null === flags ? mountHoistable(
              hoistableRoot,
              finishedWork.type,
              finishedWork.stateNode
            ) : acquireResource(
              hoistableRoot,
              flags,
              finishedWork.memoizedProps
            )) : null === flags && null !== finishedWork.stateNode && commitHostUpdate(
              finishedWork,
              finishedWork.memoizedProps,
              current.memoizedProps
            );
        }
        break;
      case 27:
        recursivelyTraverseMutationEffects(root3, finishedWork);
        commitReconciliationEffects(finishedWork);
        flags & 512 && (offscreenSubtreeWasHidden || null === current || safelyDetachRef(current, current.return));
        null !== current && flags & 4 && commitHostUpdate(
          finishedWork,
          finishedWork.memoizedProps,
          current.memoizedProps
        );
        break;
      case 5:
        recursivelyTraverseMutationEffects(root3, finishedWork);
        commitReconciliationEffects(finishedWork);
        flags & 512 && (offscreenSubtreeWasHidden || null === current || safelyDetachRef(current, current.return));
        if (finishedWork.flags & 32) {
          hoistableRoot = finishedWork.stateNode;
          try {
            setTextContent(hoistableRoot, "");
          } catch (error) {
            captureCommitPhaseError(finishedWork, finishedWork.return, error);
          }
        }
        flags & 4 && null != finishedWork.stateNode && (hoistableRoot = finishedWork.memoizedProps, commitHostUpdate(
          finishedWork,
          hoistableRoot,
          null !== current ? current.memoizedProps : hoistableRoot
        ));
        flags & 1024 && (needsFormReset = true);
        break;
      case 6:
        recursivelyTraverseMutationEffects(root3, finishedWork);
        commitReconciliationEffects(finishedWork);
        if (flags & 4) {
          if (null === finishedWork.stateNode)
            throw Error(formatProdErrorMessage(162));
          flags = finishedWork.memoizedProps;
          current = finishedWork.stateNode;
          try {
            current.nodeValue = flags;
          } catch (error) {
            captureCommitPhaseError(finishedWork, finishedWork.return, error);
          }
        }
        break;
      case 3:
        tagCaches = null;
        hoistableRoot = currentHoistableRoot;
        currentHoistableRoot = getHoistableRoot(root3.containerInfo);
        recursivelyTraverseMutationEffects(root3, finishedWork);
        currentHoistableRoot = hoistableRoot;
        commitReconciliationEffects(finishedWork);
        if (flags & 4 && null !== current && current.memoizedState.isDehydrated)
          try {
            retryIfBlockedOn(root3.containerInfo);
          } catch (error) {
            captureCommitPhaseError(finishedWork, finishedWork.return, error);
          }
        needsFormReset && (needsFormReset = false, recursivelyResetForms(finishedWork));
        break;
      case 4:
        flags = currentHoistableRoot;
        currentHoistableRoot = getHoistableRoot(
          finishedWork.stateNode.containerInfo
        );
        recursivelyTraverseMutationEffects(root3, finishedWork);
        commitReconciliationEffects(finishedWork);
        currentHoistableRoot = flags;
        break;
      case 12:
        recursivelyTraverseMutationEffects(root3, finishedWork);
        commitReconciliationEffects(finishedWork);
        break;
      case 31:
        recursivelyTraverseMutationEffects(root3, finishedWork);
        commitReconciliationEffects(finishedWork);
        flags & 4 && (flags = finishedWork.updateQueue, null !== flags && (finishedWork.updateQueue = null, attachSuspenseRetryListeners(finishedWork, flags)));
        break;
      case 13:
        recursivelyTraverseMutationEffects(root3, finishedWork);
        commitReconciliationEffects(finishedWork);
        finishedWork.child.flags & 8192 && null !== finishedWork.memoizedState !== (null !== current && null !== current.memoizedState) && (globalMostRecentFallbackTime = now());
        flags & 4 && (flags = finishedWork.updateQueue, null !== flags && (finishedWork.updateQueue = null, attachSuspenseRetryListeners(finishedWork, flags)));
        break;
      case 22:
        hoistableRoot = null !== finishedWork.memoizedState;
        var wasHidden = null !== current && null !== current.memoizedState, prevOffscreenSubtreeIsHidden = offscreenSubtreeIsHidden, prevOffscreenSubtreeWasHidden = offscreenSubtreeWasHidden;
        offscreenSubtreeIsHidden = prevOffscreenSubtreeIsHidden || hoistableRoot;
        offscreenSubtreeWasHidden = prevOffscreenSubtreeWasHidden || wasHidden;
        recursivelyTraverseMutationEffects(root3, finishedWork);
        offscreenSubtreeWasHidden = prevOffscreenSubtreeWasHidden;
        offscreenSubtreeIsHidden = prevOffscreenSubtreeIsHidden;
        commitReconciliationEffects(finishedWork);
        if (flags & 8192)
          a: for (root3 = finishedWork.stateNode, root3._visibility = hoistableRoot ? root3._visibility & -2 : root3._visibility | 1, hoistableRoot && (null === current || wasHidden || offscreenSubtreeIsHidden || offscreenSubtreeWasHidden || recursivelyTraverseDisappearLayoutEffects(finishedWork)), current = null, root3 = finishedWork; ; ) {
            if (5 === root3.tag || 26 === root3.tag) {
              if (null === current) {
                wasHidden = current = root3;
                try {
                  if (currentResource = wasHidden.stateNode, hoistableRoot)
                    maybeNodes = currentResource.style, "function" === typeof maybeNodes.setProperty ? maybeNodes.setProperty("display", "none", "important") : maybeNodes.display = "none";
                  else {
                    i = wasHidden.stateNode;
                    var styleProp = wasHidden.memoizedProps.style, display = void 0 !== styleProp && null !== styleProp && styleProp.hasOwnProperty("display") ? styleProp.display : null;
                    i.style.display = null == display || "boolean" === typeof display ? "" : ("" + display).trim();
                  }
                } catch (error) {
                  captureCommitPhaseError(wasHidden, wasHidden.return, error);
                }
              }
            } else if (6 === root3.tag) {
              if (null === current) {
                wasHidden = root3;
                try {
                  wasHidden.stateNode.nodeValue = hoistableRoot ? "" : wasHidden.memoizedProps;
                } catch (error) {
                  captureCommitPhaseError(wasHidden, wasHidden.return, error);
                }
              }
            } else if (18 === root3.tag) {
              if (null === current) {
                wasHidden = root3;
                try {
                  var instance = wasHidden.stateNode;
                  hoistableRoot ? hideOrUnhideDehydratedBoundary(instance, true) : hideOrUnhideDehydratedBoundary(wasHidden.stateNode, false);
                } catch (error) {
                  captureCommitPhaseError(wasHidden, wasHidden.return, error);
                }
              }
            } else if ((22 !== root3.tag && 23 !== root3.tag || null === root3.memoizedState || root3 === finishedWork) && null !== root3.child) {
              root3.child.return = root3;
              root3 = root3.child;
              continue;
            }
            if (root3 === finishedWork) break a;
            for (; null === root3.sibling; ) {
              if (null === root3.return || root3.return === finishedWork) break a;
              current === root3 && (current = null);
              root3 = root3.return;
            }
            current === root3 && (current = null);
            root3.sibling.return = root3.return;
            root3 = root3.sibling;
          }
        flags & 4 && (flags = finishedWork.updateQueue, null !== flags && (current = flags.retryQueue, null !== current && (flags.retryQueue = null, attachSuspenseRetryListeners(finishedWork, current))));
        break;
      case 19:
        recursivelyTraverseMutationEffects(root3, finishedWork);
        commitReconciliationEffects(finishedWork);
        flags & 4 && (flags = finishedWork.updateQueue, null !== flags && (finishedWork.updateQueue = null, attachSuspenseRetryListeners(finishedWork, flags)));
        break;
      case 30:
        break;
      case 21:
        break;
      default:
        recursivelyTraverseMutationEffects(root3, finishedWork), commitReconciliationEffects(finishedWork);
    }
  }
  function commitReconciliationEffects(finishedWork) {
    var flags = finishedWork.flags;
    if (flags & 2) {
      try {
        for (var hostParentFiber, parentFiber = finishedWork.return; null !== parentFiber; ) {
          if (isHostParent(parentFiber)) {
            hostParentFiber = parentFiber;
            break;
          }
          parentFiber = parentFiber.return;
        }
        if (null == hostParentFiber) throw Error(formatProdErrorMessage(160));
        switch (hostParentFiber.tag) {
          case 27:
            var parent = hostParentFiber.stateNode, before = getHostSibling(finishedWork);
            insertOrAppendPlacementNode(finishedWork, before, parent);
            break;
          case 5:
            var parent$141 = hostParentFiber.stateNode;
            hostParentFiber.flags & 32 && (setTextContent(parent$141, ""), hostParentFiber.flags &= -33);
            var before$142 = getHostSibling(finishedWork);
            insertOrAppendPlacementNode(finishedWork, before$142, parent$141);
            break;
          case 3:
          case 4:
            var parent$143 = hostParentFiber.stateNode.containerInfo, before$144 = getHostSibling(finishedWork);
            insertOrAppendPlacementNodeIntoContainer(
              finishedWork,
              before$144,
              parent$143
            );
            break;
          default:
            throw Error(formatProdErrorMessage(161));
        }
      } catch (error) {
        captureCommitPhaseError(finishedWork, finishedWork.return, error);
      }
      finishedWork.flags &= -3;
    }
    flags & 4096 && (finishedWork.flags &= -4097);
  }
  function recursivelyResetForms(parentFiber) {
    if (parentFiber.subtreeFlags & 1024)
      for (parentFiber = parentFiber.child; null !== parentFiber; ) {
        var fiber = parentFiber;
        recursivelyResetForms(fiber);
        5 === fiber.tag && fiber.flags & 1024 && fiber.stateNode.reset();
        parentFiber = parentFiber.sibling;
      }
  }
  function recursivelyTraverseLayoutEffects(root3, parentFiber) {
    if (parentFiber.subtreeFlags & 8772)
      for (parentFiber = parentFiber.child; null !== parentFiber; )
        commitLayoutEffectOnFiber(root3, parentFiber.alternate, parentFiber), parentFiber = parentFiber.sibling;
  }
  function recursivelyTraverseDisappearLayoutEffects(parentFiber) {
    for (parentFiber = parentFiber.child; null !== parentFiber; ) {
      var finishedWork = parentFiber;
      switch (finishedWork.tag) {
        case 0:
        case 11:
        case 14:
        case 15:
          commitHookEffectListUnmount(4, finishedWork, finishedWork.return);
          recursivelyTraverseDisappearLayoutEffects(finishedWork);
          break;
        case 1:
          safelyDetachRef(finishedWork, finishedWork.return);
          var instance = finishedWork.stateNode;
          "function" === typeof instance.componentWillUnmount && safelyCallComponentWillUnmount(
            finishedWork,
            finishedWork.return,
            instance
          );
          recursivelyTraverseDisappearLayoutEffects(finishedWork);
          break;
        case 27:
          releaseSingletonInstance(finishedWork.stateNode);
        case 26:
        case 5:
          safelyDetachRef(finishedWork, finishedWork.return);
          recursivelyTraverseDisappearLayoutEffects(finishedWork);
          break;
        case 22:
          null === finishedWork.memoizedState && recursivelyTraverseDisappearLayoutEffects(finishedWork);
          break;
        case 30:
          recursivelyTraverseDisappearLayoutEffects(finishedWork);
          break;
        default:
          recursivelyTraverseDisappearLayoutEffects(finishedWork);
      }
      parentFiber = parentFiber.sibling;
    }
  }
  function recursivelyTraverseReappearLayoutEffects(finishedRoot$jscomp$0, parentFiber, includeWorkInProgressEffects) {
    includeWorkInProgressEffects = includeWorkInProgressEffects && 0 !== (parentFiber.subtreeFlags & 8772);
    for (parentFiber = parentFiber.child; null !== parentFiber; ) {
      var current = parentFiber.alternate, finishedRoot = finishedRoot$jscomp$0, finishedWork = parentFiber, flags = finishedWork.flags;
      switch (finishedWork.tag) {
        case 0:
        case 11:
        case 15:
          recursivelyTraverseReappearLayoutEffects(
            finishedRoot,
            finishedWork,
            includeWorkInProgressEffects
          );
          commitHookEffectListMount(4, finishedWork);
          break;
        case 1:
          recursivelyTraverseReappearLayoutEffects(
            finishedRoot,
            finishedWork,
            includeWorkInProgressEffects
          );
          current = finishedWork;
          finishedRoot = current.stateNode;
          if ("function" === typeof finishedRoot.componentDidMount)
            try {
              finishedRoot.componentDidMount();
            } catch (error) {
              captureCommitPhaseError(current, current.return, error);
            }
          current = finishedWork;
          finishedRoot = current.updateQueue;
          if (null !== finishedRoot) {
            var instance = current.stateNode;
            try {
              var hiddenCallbacks = finishedRoot.shared.hiddenCallbacks;
              if (null !== hiddenCallbacks)
                for (finishedRoot.shared.hiddenCallbacks = null, finishedRoot = 0; finishedRoot < hiddenCallbacks.length; finishedRoot++)
                  callCallback(hiddenCallbacks[finishedRoot], instance);
            } catch (error) {
              captureCommitPhaseError(current, current.return, error);
            }
          }
          includeWorkInProgressEffects && flags & 64 && commitClassCallbacks(finishedWork);
          safelyAttachRef(finishedWork, finishedWork.return);
          break;
        case 27:
          commitHostSingletonAcquisition(finishedWork);
        case 26:
        case 5:
          recursivelyTraverseReappearLayoutEffects(
            finishedRoot,
            finishedWork,
            includeWorkInProgressEffects
          );
          includeWorkInProgressEffects && null === current && flags & 4 && commitHostMount(finishedWork);
          safelyAttachRef(finishedWork, finishedWork.return);
          break;
        case 12:
          recursivelyTraverseReappearLayoutEffects(
            finishedRoot,
            finishedWork,
            includeWorkInProgressEffects
          );
          break;
        case 31:
          recursivelyTraverseReappearLayoutEffects(
            finishedRoot,
            finishedWork,
            includeWorkInProgressEffects
          );
          includeWorkInProgressEffects && flags & 4 && commitActivityHydrationCallbacks(finishedRoot, finishedWork);
          break;
        case 13:
          recursivelyTraverseReappearLayoutEffects(
            finishedRoot,
            finishedWork,
            includeWorkInProgressEffects
          );
          includeWorkInProgressEffects && flags & 4 && commitSuspenseHydrationCallbacks(finishedRoot, finishedWork);
          break;
        case 22:
          null === finishedWork.memoizedState && recursivelyTraverseReappearLayoutEffects(
            finishedRoot,
            finishedWork,
            includeWorkInProgressEffects
          );
          safelyAttachRef(finishedWork, finishedWork.return);
          break;
        case 30:
          break;
        default:
          recursivelyTraverseReappearLayoutEffects(
            finishedRoot,
            finishedWork,
            includeWorkInProgressEffects
          );
      }
      parentFiber = parentFiber.sibling;
    }
  }
  function commitOffscreenPassiveMountEffects(current, finishedWork) {
    var previousCache = null;
    null !== current && null !== current.memoizedState && null !== current.memoizedState.cachePool && (previousCache = current.memoizedState.cachePool.pool);
    current = null;
    null !== finishedWork.memoizedState && null !== finishedWork.memoizedState.cachePool && (current = finishedWork.memoizedState.cachePool.pool);
    current !== previousCache && (null != current && current.refCount++, null != previousCache && releaseCache(previousCache));
  }
  function commitCachePassiveMountEffect(current, finishedWork) {
    current = null;
    null !== finishedWork.alternate && (current = finishedWork.alternate.memoizedState.cache);
    finishedWork = finishedWork.memoizedState.cache;
    finishedWork !== current && (finishedWork.refCount++, null != current && releaseCache(current));
  }
  function recursivelyTraversePassiveMountEffects(root3, parentFiber, committedLanes, committedTransitions) {
    if (parentFiber.subtreeFlags & 10256)
      for (parentFiber = parentFiber.child; null !== parentFiber; )
        commitPassiveMountOnFiber(
          root3,
          parentFiber,
          committedLanes,
          committedTransitions
        ), parentFiber = parentFiber.sibling;
  }
  function commitPassiveMountOnFiber(finishedRoot, finishedWork, committedLanes, committedTransitions) {
    var flags = finishedWork.flags;
    switch (finishedWork.tag) {
      case 0:
      case 11:
      case 15:
        recursivelyTraversePassiveMountEffects(
          finishedRoot,
          finishedWork,
          committedLanes,
          committedTransitions
        );
        flags & 2048 && commitHookEffectListMount(9, finishedWork);
        break;
      case 1:
        recursivelyTraversePassiveMountEffects(
          finishedRoot,
          finishedWork,
          committedLanes,
          committedTransitions
        );
        break;
      case 3:
        recursivelyTraversePassiveMountEffects(
          finishedRoot,
          finishedWork,
          committedLanes,
          committedTransitions
        );
        flags & 2048 && (finishedRoot = null, null !== finishedWork.alternate && (finishedRoot = finishedWork.alternate.memoizedState.cache), finishedWork = finishedWork.memoizedState.cache, finishedWork !== finishedRoot && (finishedWork.refCount++, null != finishedRoot && releaseCache(finishedRoot)));
        break;
      case 12:
        if (flags & 2048) {
          recursivelyTraversePassiveMountEffects(
            finishedRoot,
            finishedWork,
            committedLanes,
            committedTransitions
          );
          finishedRoot = finishedWork.stateNode;
          try {
            var _finishedWork$memoize2 = finishedWork.memoizedProps, id = _finishedWork$memoize2.id, onPostCommit = _finishedWork$memoize2.onPostCommit;
            "function" === typeof onPostCommit && onPostCommit(
              id,
              null === finishedWork.alternate ? "mount" : "update",
              finishedRoot.passiveEffectDuration,
              -0
            );
          } catch (error) {
            captureCommitPhaseError(finishedWork, finishedWork.return, error);
          }
        } else
          recursivelyTraversePassiveMountEffects(
            finishedRoot,
            finishedWork,
            committedLanes,
            committedTransitions
          );
        break;
      case 31:
        recursivelyTraversePassiveMountEffects(
          finishedRoot,
          finishedWork,
          committedLanes,
          committedTransitions
        );
        break;
      case 13:
        recursivelyTraversePassiveMountEffects(
          finishedRoot,
          finishedWork,
          committedLanes,
          committedTransitions
        );
        break;
      case 23:
        break;
      case 22:
        _finishedWork$memoize2 = finishedWork.stateNode;
        id = finishedWork.alternate;
        null !== finishedWork.memoizedState ? _finishedWork$memoize2._visibility & 2 ? recursivelyTraversePassiveMountEffects(
          finishedRoot,
          finishedWork,
          committedLanes,
          committedTransitions
        ) : recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork) : _finishedWork$memoize2._visibility & 2 ? recursivelyTraversePassiveMountEffects(
          finishedRoot,
          finishedWork,
          committedLanes,
          committedTransitions
        ) : (_finishedWork$memoize2._visibility |= 2, recursivelyTraverseReconnectPassiveEffects(
          finishedRoot,
          finishedWork,
          committedLanes,
          committedTransitions,
          0 !== (finishedWork.subtreeFlags & 10256) || false
        ));
        flags & 2048 && commitOffscreenPassiveMountEffects(id, finishedWork);
        break;
      case 24:
        recursivelyTraversePassiveMountEffects(
          finishedRoot,
          finishedWork,
          committedLanes,
          committedTransitions
        );
        flags & 2048 && commitCachePassiveMountEffect(finishedWork.alternate, finishedWork);
        break;
      default:
        recursivelyTraversePassiveMountEffects(
          finishedRoot,
          finishedWork,
          committedLanes,
          committedTransitions
        );
    }
  }
  function recursivelyTraverseReconnectPassiveEffects(finishedRoot$jscomp$0, parentFiber, committedLanes$jscomp$0, committedTransitions$jscomp$0, includeWorkInProgressEffects) {
    includeWorkInProgressEffects = includeWorkInProgressEffects && (0 !== (parentFiber.subtreeFlags & 10256) || false);
    for (parentFiber = parentFiber.child; null !== parentFiber; ) {
      var finishedRoot = finishedRoot$jscomp$0, finishedWork = parentFiber, committedLanes = committedLanes$jscomp$0, committedTransitions = committedTransitions$jscomp$0, flags = finishedWork.flags;
      switch (finishedWork.tag) {
        case 0:
        case 11:
        case 15:
          recursivelyTraverseReconnectPassiveEffects(
            finishedRoot,
            finishedWork,
            committedLanes,
            committedTransitions,
            includeWorkInProgressEffects
          );
          commitHookEffectListMount(8, finishedWork);
          break;
        case 23:
          break;
        case 22:
          var instance = finishedWork.stateNode;
          null !== finishedWork.memoizedState ? instance._visibility & 2 ? recursivelyTraverseReconnectPassiveEffects(
            finishedRoot,
            finishedWork,
            committedLanes,
            committedTransitions,
            includeWorkInProgressEffects
          ) : recursivelyTraverseAtomicPassiveEffects(
            finishedRoot,
            finishedWork
          ) : (instance._visibility |= 2, recursivelyTraverseReconnectPassiveEffects(
            finishedRoot,
            finishedWork,
            committedLanes,
            committedTransitions,
            includeWorkInProgressEffects
          ));
          includeWorkInProgressEffects && flags & 2048 && commitOffscreenPassiveMountEffects(
            finishedWork.alternate,
            finishedWork
          );
          break;
        case 24:
          recursivelyTraverseReconnectPassiveEffects(
            finishedRoot,
            finishedWork,
            committedLanes,
            committedTransitions,
            includeWorkInProgressEffects
          );
          includeWorkInProgressEffects && flags & 2048 && commitCachePassiveMountEffect(finishedWork.alternate, finishedWork);
          break;
        default:
          recursivelyTraverseReconnectPassiveEffects(
            finishedRoot,
            finishedWork,
            committedLanes,
            committedTransitions,
            includeWorkInProgressEffects
          );
      }
      parentFiber = parentFiber.sibling;
    }
  }
  function recursivelyTraverseAtomicPassiveEffects(finishedRoot$jscomp$0, parentFiber) {
    if (parentFiber.subtreeFlags & 10256)
      for (parentFiber = parentFiber.child; null !== parentFiber; ) {
        var finishedRoot = finishedRoot$jscomp$0, finishedWork = parentFiber, flags = finishedWork.flags;
        switch (finishedWork.tag) {
          case 22:
            recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork);
            flags & 2048 && commitOffscreenPassiveMountEffects(
              finishedWork.alternate,
              finishedWork
            );
            break;
          case 24:
            recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork);
            flags & 2048 && commitCachePassiveMountEffect(finishedWork.alternate, finishedWork);
            break;
          default:
            recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork);
        }
        parentFiber = parentFiber.sibling;
      }
  }
  var suspenseyCommitFlag = 8192;
  function recursivelyAccumulateSuspenseyCommit(parentFiber, committedLanes, suspendedState) {
    if (parentFiber.subtreeFlags & suspenseyCommitFlag)
      for (parentFiber = parentFiber.child; null !== parentFiber; )
        accumulateSuspenseyCommitOnFiber(
          parentFiber,
          committedLanes,
          suspendedState
        ), parentFiber = parentFiber.sibling;
  }
  function accumulateSuspenseyCommitOnFiber(fiber, committedLanes, suspendedState) {
    switch (fiber.tag) {
      case 26:
        recursivelyAccumulateSuspenseyCommit(
          fiber,
          committedLanes,
          suspendedState
        );
        fiber.flags & suspenseyCommitFlag && null !== fiber.memoizedState && suspendResource(
          suspendedState,
          currentHoistableRoot,
          fiber.memoizedState,
          fiber.memoizedProps
        );
        break;
      case 5:
        recursivelyAccumulateSuspenseyCommit(
          fiber,
          committedLanes,
          suspendedState
        );
        break;
      case 3:
      case 4:
        var previousHoistableRoot = currentHoistableRoot;
        currentHoistableRoot = getHoistableRoot(fiber.stateNode.containerInfo);
        recursivelyAccumulateSuspenseyCommit(
          fiber,
          committedLanes,
          suspendedState
        );
        currentHoistableRoot = previousHoistableRoot;
        break;
      case 22:
        null === fiber.memoizedState && (previousHoistableRoot = fiber.alternate, null !== previousHoistableRoot && null !== previousHoistableRoot.memoizedState ? (previousHoistableRoot = suspenseyCommitFlag, suspenseyCommitFlag = 16777216, recursivelyAccumulateSuspenseyCommit(
          fiber,
          committedLanes,
          suspendedState
        ), suspenseyCommitFlag = previousHoistableRoot) : recursivelyAccumulateSuspenseyCommit(
          fiber,
          committedLanes,
          suspendedState
        ));
        break;
      default:
        recursivelyAccumulateSuspenseyCommit(
          fiber,
          committedLanes,
          suspendedState
        );
    }
  }
  function detachAlternateSiblings(parentFiber) {
    var previousFiber = parentFiber.alternate;
    if (null !== previousFiber && (parentFiber = previousFiber.child, null !== parentFiber)) {
      previousFiber.child = null;
      do
        previousFiber = parentFiber.sibling, parentFiber.sibling = null, parentFiber = previousFiber;
      while (null !== parentFiber);
    }
  }
  function recursivelyTraversePassiveUnmountEffects(parentFiber) {
    var deletions = parentFiber.deletions;
    if (0 !== (parentFiber.flags & 16)) {
      if (null !== deletions)
        for (var i = 0; i < deletions.length; i++) {
          var childToDelete = deletions[i];
          nextEffect = childToDelete;
          commitPassiveUnmountEffectsInsideOfDeletedTree_begin(
            childToDelete,
            parentFiber
          );
        }
      detachAlternateSiblings(parentFiber);
    }
    if (parentFiber.subtreeFlags & 10256)
      for (parentFiber = parentFiber.child; null !== parentFiber; )
        commitPassiveUnmountOnFiber(parentFiber), parentFiber = parentFiber.sibling;
  }
  function commitPassiveUnmountOnFiber(finishedWork) {
    switch (finishedWork.tag) {
      case 0:
      case 11:
      case 15:
        recursivelyTraversePassiveUnmountEffects(finishedWork);
        finishedWork.flags & 2048 && commitHookEffectListUnmount(9, finishedWork, finishedWork.return);
        break;
      case 3:
        recursivelyTraversePassiveUnmountEffects(finishedWork);
        break;
      case 12:
        recursivelyTraversePassiveUnmountEffects(finishedWork);
        break;
      case 22:
        var instance = finishedWork.stateNode;
        null !== finishedWork.memoizedState && instance._visibility & 2 && (null === finishedWork.return || 13 !== finishedWork.return.tag) ? (instance._visibility &= -3, recursivelyTraverseDisconnectPassiveEffects(finishedWork)) : recursivelyTraversePassiveUnmountEffects(finishedWork);
        break;
      default:
        recursivelyTraversePassiveUnmountEffects(finishedWork);
    }
  }
  function recursivelyTraverseDisconnectPassiveEffects(parentFiber) {
    var deletions = parentFiber.deletions;
    if (0 !== (parentFiber.flags & 16)) {
      if (null !== deletions)
        for (var i = 0; i < deletions.length; i++) {
          var childToDelete = deletions[i];
          nextEffect = childToDelete;
          commitPassiveUnmountEffectsInsideOfDeletedTree_begin(
            childToDelete,
            parentFiber
          );
        }
      detachAlternateSiblings(parentFiber);
    }
    for (parentFiber = parentFiber.child; null !== parentFiber; ) {
      deletions = parentFiber;
      switch (deletions.tag) {
        case 0:
        case 11:
        case 15:
          commitHookEffectListUnmount(8, deletions, deletions.return);
          recursivelyTraverseDisconnectPassiveEffects(deletions);
          break;
        case 22:
          i = deletions.stateNode;
          i._visibility & 2 && (i._visibility &= -3, recursivelyTraverseDisconnectPassiveEffects(deletions));
          break;
        default:
          recursivelyTraverseDisconnectPassiveEffects(deletions);
      }
      parentFiber = parentFiber.sibling;
    }
  }
  function commitPassiveUnmountEffectsInsideOfDeletedTree_begin(deletedSubtreeRoot, nearestMountedAncestor) {
    for (; null !== nextEffect; ) {
      var fiber = nextEffect;
      switch (fiber.tag) {
        case 0:
        case 11:
        case 15:
          commitHookEffectListUnmount(8, fiber, nearestMountedAncestor);
          break;
        case 23:
        case 22:
          if (null !== fiber.memoizedState && null !== fiber.memoizedState.cachePool) {
            var cache = fiber.memoizedState.cachePool.pool;
            null != cache && cache.refCount++;
          }
          break;
        case 24:
          releaseCache(fiber.memoizedState.cache);
      }
      cache = fiber.child;
      if (null !== cache) cache.return = fiber, nextEffect = cache;
      else
        a: for (fiber = deletedSubtreeRoot; null !== nextEffect; ) {
          cache = nextEffect;
          var sibling = cache.sibling, returnFiber = cache.return;
          detachFiberAfterEffects(cache);
          if (cache === fiber) {
            nextEffect = null;
            break a;
          }
          if (null !== sibling) {
            sibling.return = returnFiber;
            nextEffect = sibling;
            break a;
          }
          nextEffect = returnFiber;
        }
    }
  }
  var DefaultAsyncDispatcher = {
    getCacheForType: function(resourceType) {
      var cache = readContext(CacheContext), cacheForType = cache.data.get(resourceType);
      void 0 === cacheForType && (cacheForType = resourceType(), cache.data.set(resourceType, cacheForType));
      return cacheForType;
    },
    cacheSignal: function() {
      return readContext(CacheContext).controller.signal;
    }
  }, PossiblyWeakMap = "function" === typeof WeakMap ? WeakMap : Map, executionContext = 0, workInProgressRoot = null, workInProgress = null, workInProgressRootRenderLanes = 0, workInProgressSuspendedReason = 0, workInProgressThrownValue = null, workInProgressRootDidSkipSuspendedSiblings = false, workInProgressRootIsPrerendering = false, workInProgressRootDidAttachPingListener = false, entangledRenderLanes = 0, workInProgressRootExitStatus = 0, workInProgressRootSkippedLanes = 0, workInProgressRootInterleavedUpdatedLanes = 0, workInProgressRootPingedLanes = 0, workInProgressDeferredLane = 0, workInProgressSuspendedRetryLanes = 0, workInProgressRootConcurrentErrors = null, workInProgressRootRecoverableErrors = null, workInProgressRootDidIncludeRecursiveRenderUpdate = false, globalMostRecentFallbackTime = 0, globalMostRecentTransitionTime = 0, workInProgressRootRenderTargetTime = Infinity, workInProgressTransitions = null, legacyErrorBoundariesThatAlreadyFailed = null, pendingEffectsStatus = 0, pendingEffectsRoot = null, pendingFinishedWork = null, pendingEffectsLanes = 0, pendingEffectsRemainingLanes = 0, pendingPassiveTransitions = null, pendingRecoverableErrors = null, nestedUpdateCount = 0, rootWithNestedUpdates = null;
  function requestUpdateLane() {
    return 0 !== (executionContext & 2) && 0 !== workInProgressRootRenderLanes ? workInProgressRootRenderLanes & -workInProgressRootRenderLanes : null !== ReactSharedInternals.T ? requestTransitionLane() : resolveUpdatePriority();
  }
  function requestDeferredLane() {
    if (0 === workInProgressDeferredLane)
      if (0 === (workInProgressRootRenderLanes & 536870912) || isHydrating) {
        var lane = nextTransitionDeferredLane;
        nextTransitionDeferredLane <<= 1;
        0 === (nextTransitionDeferredLane & 3932160) && (nextTransitionDeferredLane = 262144);
        workInProgressDeferredLane = lane;
      } else workInProgressDeferredLane = 536870912;
    lane = suspenseHandlerStackCursor.current;
    null !== lane && (lane.flags |= 32);
    return workInProgressDeferredLane;
  }
  function scheduleUpdateOnFiber(root3, fiber, lane) {
    if (root3 === workInProgressRoot && (2 === workInProgressSuspendedReason || 9 === workInProgressSuspendedReason) || null !== root3.cancelPendingCommit)
      prepareFreshStack(root3, 0), markRootSuspended(
        root3,
        workInProgressRootRenderLanes,
        workInProgressDeferredLane,
        false
      );
    markRootUpdated$1(root3, lane);
    if (0 === (executionContext & 2) || root3 !== workInProgressRoot)
      root3 === workInProgressRoot && (0 === (executionContext & 2) && (workInProgressRootInterleavedUpdatedLanes |= lane), 4 === workInProgressRootExitStatus && markRootSuspended(
        root3,
        workInProgressRootRenderLanes,
        workInProgressDeferredLane,
        false
      )), ensureRootIsScheduled(root3);
  }
  function performWorkOnRoot(root$jscomp$0, lanes, forceSync) {
    if (0 !== (executionContext & 6)) throw Error(formatProdErrorMessage(327));
    var shouldTimeSlice = !forceSync && 0 === (lanes & 127) && 0 === (lanes & root$jscomp$0.expiredLanes) || checkIfRootIsPrerendering(root$jscomp$0, lanes), exitStatus = shouldTimeSlice ? renderRootConcurrent(root$jscomp$0, lanes) : renderRootSync(root$jscomp$0, lanes, true), renderWasConcurrent = shouldTimeSlice;
    do {
      if (0 === exitStatus) {
        workInProgressRootIsPrerendering && !shouldTimeSlice && markRootSuspended(root$jscomp$0, lanes, 0, false);
        break;
      } else {
        forceSync = root$jscomp$0.current.alternate;
        if (renderWasConcurrent && !isRenderConsistentWithExternalStores(forceSync)) {
          exitStatus = renderRootSync(root$jscomp$0, lanes, false);
          renderWasConcurrent = false;
          continue;
        }
        if (2 === exitStatus) {
          renderWasConcurrent = lanes;
          if (root$jscomp$0.errorRecoveryDisabledLanes & renderWasConcurrent)
            var JSCompiler_inline_result = 0;
          else
            JSCompiler_inline_result = root$jscomp$0.pendingLanes & -536870913, JSCompiler_inline_result = 0 !== JSCompiler_inline_result ? JSCompiler_inline_result : JSCompiler_inline_result & 536870912 ? 536870912 : 0;
          if (0 !== JSCompiler_inline_result) {
            lanes = JSCompiler_inline_result;
            a: {
              var root3 = root$jscomp$0;
              exitStatus = workInProgressRootConcurrentErrors;
              var wasRootDehydrated = root3.current.memoizedState.isDehydrated;
              wasRootDehydrated && (prepareFreshStack(root3, JSCompiler_inline_result).flags |= 256);
              JSCompiler_inline_result = renderRootSync(
                root3,
                JSCompiler_inline_result,
                false
              );
              if (2 !== JSCompiler_inline_result) {
                if (workInProgressRootDidAttachPingListener && !wasRootDehydrated) {
                  root3.errorRecoveryDisabledLanes |= renderWasConcurrent;
                  workInProgressRootInterleavedUpdatedLanes |= renderWasConcurrent;
                  exitStatus = 4;
                  break a;
                }
                renderWasConcurrent = workInProgressRootRecoverableErrors;
                workInProgressRootRecoverableErrors = exitStatus;
                null !== renderWasConcurrent && (null === workInProgressRootRecoverableErrors ? workInProgressRootRecoverableErrors = renderWasConcurrent : workInProgressRootRecoverableErrors.push.apply(
                  workInProgressRootRecoverableErrors,
                  renderWasConcurrent
                ));
              }
              exitStatus = JSCompiler_inline_result;
            }
            renderWasConcurrent = false;
            if (2 !== exitStatus) continue;
          }
        }
        if (1 === exitStatus) {
          prepareFreshStack(root$jscomp$0, 0);
          markRootSuspended(root$jscomp$0, lanes, 0, true);
          break;
        }
        a: {
          shouldTimeSlice = root$jscomp$0;
          renderWasConcurrent = exitStatus;
          switch (renderWasConcurrent) {
            case 0:
            case 1:
              throw Error(formatProdErrorMessage(345));
            case 4:
              if ((lanes & 4194048) !== lanes) break;
            case 6:
              markRootSuspended(
                shouldTimeSlice,
                lanes,
                workInProgressDeferredLane,
                !workInProgressRootDidSkipSuspendedSiblings
              );
              break a;
            case 2:
              workInProgressRootRecoverableErrors = null;
              break;
            case 3:
            case 5:
              break;
            default:
              throw Error(formatProdErrorMessage(329));
          }
          if ((lanes & 62914560) === lanes && (exitStatus = globalMostRecentFallbackTime + 300 - now(), 10 < exitStatus)) {
            markRootSuspended(
              shouldTimeSlice,
              lanes,
              workInProgressDeferredLane,
              !workInProgressRootDidSkipSuspendedSiblings
            );
            if (0 !== getNextLanes(shouldTimeSlice, 0, true)) break a;
            pendingEffectsLanes = lanes;
            shouldTimeSlice.timeoutHandle = scheduleTimeout(
              commitRootWhenReady.bind(
                null,
                shouldTimeSlice,
                forceSync,
                workInProgressRootRecoverableErrors,
                workInProgressTransitions,
                workInProgressRootDidIncludeRecursiveRenderUpdate,
                lanes,
                workInProgressDeferredLane,
                workInProgressRootInterleavedUpdatedLanes,
                workInProgressSuspendedRetryLanes,
                workInProgressRootDidSkipSuspendedSiblings,
                renderWasConcurrent,
                "Throttled",
                -0,
                0
              ),
              exitStatus
            );
            break a;
          }
          commitRootWhenReady(
            shouldTimeSlice,
            forceSync,
            workInProgressRootRecoverableErrors,
            workInProgressTransitions,
            workInProgressRootDidIncludeRecursiveRenderUpdate,
            lanes,
            workInProgressDeferredLane,
            workInProgressRootInterleavedUpdatedLanes,
            workInProgressSuspendedRetryLanes,
            workInProgressRootDidSkipSuspendedSiblings,
            renderWasConcurrent,
            null,
            -0,
            0
          );
        }
      }
      break;
    } while (1);
    ensureRootIsScheduled(root$jscomp$0);
  }
  function commitRootWhenReady(root3, finishedWork, recoverableErrors, transitions, didIncludeRenderPhaseUpdate, lanes, spawnedLane, updatedLanes, suspendedRetryLanes, didSkipSuspendedSiblings, exitStatus, suspendedCommitReason, completedRenderStartTime, completedRenderEndTime) {
    root3.timeoutHandle = -1;
    suspendedCommitReason = finishedWork.subtreeFlags;
    if (suspendedCommitReason & 8192 || 16785408 === (suspendedCommitReason & 16785408)) {
      suspendedCommitReason = {
        stylesheets: null,
        count: 0,
        imgCount: 0,
        imgBytes: 0,
        suspenseyImages: [],
        waitingForImages: true,
        waitingForViewTransition: false,
        unsuspend: noop$1
      };
      accumulateSuspenseyCommitOnFiber(
        finishedWork,
        lanes,
        suspendedCommitReason
      );
      var timeoutOffset = (lanes & 62914560) === lanes ? globalMostRecentFallbackTime - now() : (lanes & 4194048) === lanes ? globalMostRecentTransitionTime - now() : 0;
      timeoutOffset = waitForCommitToBeReady(
        suspendedCommitReason,
        timeoutOffset
      );
      if (null !== timeoutOffset) {
        pendingEffectsLanes = lanes;
        root3.cancelPendingCommit = timeoutOffset(
          commitRoot.bind(
            null,
            root3,
            finishedWork,
            lanes,
            recoverableErrors,
            transitions,
            didIncludeRenderPhaseUpdate,
            spawnedLane,
            updatedLanes,
            suspendedRetryLanes,
            exitStatus,
            suspendedCommitReason,
            null,
            completedRenderStartTime,
            completedRenderEndTime
          )
        );
        markRootSuspended(root3, lanes, spawnedLane, !didSkipSuspendedSiblings);
        return;
      }
    }
    commitRoot(
      root3,
      finishedWork,
      lanes,
      recoverableErrors,
      transitions,
      didIncludeRenderPhaseUpdate,
      spawnedLane,
      updatedLanes,
      suspendedRetryLanes
    );
  }
  function isRenderConsistentWithExternalStores(finishedWork) {
    for (var node = finishedWork; ; ) {
      var tag = node.tag;
      if ((0 === tag || 11 === tag || 15 === tag) && node.flags & 16384 && (tag = node.updateQueue, null !== tag && (tag = tag.stores, null !== tag)))
        for (var i = 0; i < tag.length; i++) {
          var check = tag[i], getSnapshot = check.getSnapshot;
          check = check.value;
          try {
            if (!objectIs(getSnapshot(), check)) return false;
          } catch (error) {
            return false;
          }
        }
      tag = node.child;
      if (node.subtreeFlags & 16384 && null !== tag)
        tag.return = node, node = tag;
      else {
        if (node === finishedWork) break;
        for (; null === node.sibling; ) {
          if (null === node.return || node.return === finishedWork) return true;
          node = node.return;
        }
        node.sibling.return = node.return;
        node = node.sibling;
      }
    }
    return true;
  }
  function markRootSuspended(root3, suspendedLanes, spawnedLane, didAttemptEntireTree) {
    suspendedLanes &= ~workInProgressRootPingedLanes;
    suspendedLanes &= ~workInProgressRootInterleavedUpdatedLanes;
    root3.suspendedLanes |= suspendedLanes;
    root3.pingedLanes &= ~suspendedLanes;
    didAttemptEntireTree && (root3.warmLanes |= suspendedLanes);
    didAttemptEntireTree = root3.expirationTimes;
    for (var lanes = suspendedLanes; 0 < lanes; ) {
      var index$6 = 31 - clz32(lanes), lane = 1 << index$6;
      didAttemptEntireTree[index$6] = -1;
      lanes &= ~lane;
    }
    0 !== spawnedLane && markSpawnedDeferredLane(root3, spawnedLane, suspendedLanes);
  }
  function flushSyncWork$1() {
    return 0 === (executionContext & 6) ? (flushSyncWorkAcrossRoots_impl(0), false) : true;
  }
  function resetWorkInProgressStack() {
    if (null !== workInProgress) {
      if (0 === workInProgressSuspendedReason)
        var interruptedWork = workInProgress.return;
      else
        interruptedWork = workInProgress, lastContextDependency = currentlyRenderingFiber$1 = null, resetHooksOnUnwind(interruptedWork), thenableState$1 = null, thenableIndexCounter$1 = 0, interruptedWork = workInProgress;
      for (; null !== interruptedWork; )
        unwindInterruptedWork(interruptedWork.alternate, interruptedWork), interruptedWork = interruptedWork.return;
      workInProgress = null;
    }
  }
  function prepareFreshStack(root3, lanes) {
    var timeoutHandle = root3.timeoutHandle;
    -1 !== timeoutHandle && (root3.timeoutHandle = -1, cancelTimeout(timeoutHandle));
    timeoutHandle = root3.cancelPendingCommit;
    null !== timeoutHandle && (root3.cancelPendingCommit = null, timeoutHandle());
    pendingEffectsLanes = 0;
    resetWorkInProgressStack();
    workInProgressRoot = root3;
    workInProgress = timeoutHandle = createWorkInProgress(root3.current, null);
    workInProgressRootRenderLanes = lanes;
    workInProgressSuspendedReason = 0;
    workInProgressThrownValue = null;
    workInProgressRootDidSkipSuspendedSiblings = false;
    workInProgressRootIsPrerendering = checkIfRootIsPrerendering(root3, lanes);
    workInProgressRootDidAttachPingListener = false;
    workInProgressSuspendedRetryLanes = workInProgressDeferredLane = workInProgressRootPingedLanes = workInProgressRootInterleavedUpdatedLanes = workInProgressRootSkippedLanes = workInProgressRootExitStatus = 0;
    workInProgressRootRecoverableErrors = workInProgressRootConcurrentErrors = null;
    workInProgressRootDidIncludeRecursiveRenderUpdate = false;
    0 !== (lanes & 8) && (lanes |= lanes & 32);
    var allEntangledLanes = root3.entangledLanes;
    if (0 !== allEntangledLanes)
      for (root3 = root3.entanglements, allEntangledLanes &= lanes; 0 < allEntangledLanes; ) {
        var index$4 = 31 - clz32(allEntangledLanes), lane = 1 << index$4;
        lanes |= root3[index$4];
        allEntangledLanes &= ~lane;
      }
    entangledRenderLanes = lanes;
    finishQueueingConcurrentUpdates();
    return timeoutHandle;
  }
  function handleThrow(root3, thrownValue) {
    currentlyRenderingFiber = null;
    ReactSharedInternals.H = ContextOnlyDispatcher;
    thrownValue === SuspenseException || thrownValue === SuspenseActionException ? (thrownValue = getSuspendedThenable(), workInProgressSuspendedReason = 3) : thrownValue === SuspenseyCommitException ? (thrownValue = getSuspendedThenable(), workInProgressSuspendedReason = 4) : workInProgressSuspendedReason = thrownValue === SelectiveHydrationException ? 8 : null !== thrownValue && "object" === typeof thrownValue && "function" === typeof thrownValue.then ? 6 : 1;
    workInProgressThrownValue = thrownValue;
    null === workInProgress && (workInProgressRootExitStatus = 1, logUncaughtError(
      root3,
      createCapturedValueAtFiber(thrownValue, root3.current)
    ));
  }
  function shouldRemainOnPreviousScreen() {
    var handler = suspenseHandlerStackCursor.current;
    return null === handler ? true : (workInProgressRootRenderLanes & 4194048) === workInProgressRootRenderLanes ? null === shellBoundary ? true : false : (workInProgressRootRenderLanes & 62914560) === workInProgressRootRenderLanes || 0 !== (workInProgressRootRenderLanes & 536870912) ? handler === shellBoundary : false;
  }
  function pushDispatcher() {
    var prevDispatcher = ReactSharedInternals.H;
    ReactSharedInternals.H = ContextOnlyDispatcher;
    return null === prevDispatcher ? ContextOnlyDispatcher : prevDispatcher;
  }
  function pushAsyncDispatcher() {
    var prevAsyncDispatcher = ReactSharedInternals.A;
    ReactSharedInternals.A = DefaultAsyncDispatcher;
    return prevAsyncDispatcher;
  }
  function renderDidSuspendDelayIfPossible() {
    workInProgressRootExitStatus = 4;
    workInProgressRootDidSkipSuspendedSiblings || (workInProgressRootRenderLanes & 4194048) !== workInProgressRootRenderLanes && null !== suspenseHandlerStackCursor.current || (workInProgressRootIsPrerendering = true);
    0 === (workInProgressRootSkippedLanes & 134217727) && 0 === (workInProgressRootInterleavedUpdatedLanes & 134217727) || null === workInProgressRoot || markRootSuspended(
      workInProgressRoot,
      workInProgressRootRenderLanes,
      workInProgressDeferredLane,
      false
    );
  }
  function renderRootSync(root3, lanes, shouldYieldForPrerendering) {
    var prevExecutionContext = executionContext;
    executionContext |= 2;
    var prevDispatcher = pushDispatcher(), prevAsyncDispatcher = pushAsyncDispatcher();
    if (workInProgressRoot !== root3 || workInProgressRootRenderLanes !== lanes)
      workInProgressTransitions = null, prepareFreshStack(root3, lanes);
    lanes = false;
    var exitStatus = workInProgressRootExitStatus;
    a: do
      try {
        if (0 !== workInProgressSuspendedReason && null !== workInProgress) {
          var unitOfWork = workInProgress, thrownValue = workInProgressThrownValue;
          switch (workInProgressSuspendedReason) {
            case 8:
              resetWorkInProgressStack();
              exitStatus = 6;
              break a;
            case 3:
            case 2:
            case 9:
            case 6:
              null === suspenseHandlerStackCursor.current && (lanes = true);
              var reason = workInProgressSuspendedReason;
              workInProgressSuspendedReason = 0;
              workInProgressThrownValue = null;
              throwAndUnwindWorkLoop(root3, unitOfWork, thrownValue, reason);
              if (shouldYieldForPrerendering && workInProgressRootIsPrerendering) {
                exitStatus = 0;
                break a;
              }
              break;
            default:
              reason = workInProgressSuspendedReason, workInProgressSuspendedReason = 0, workInProgressThrownValue = null, throwAndUnwindWorkLoop(root3, unitOfWork, thrownValue, reason);
          }
        }
        workLoopSync();
        exitStatus = workInProgressRootExitStatus;
        break;
      } catch (thrownValue$165) {
        handleThrow(root3, thrownValue$165);
      }
    while (1);
    lanes && root3.shellSuspendCounter++;
    lastContextDependency = currentlyRenderingFiber$1 = null;
    executionContext = prevExecutionContext;
    ReactSharedInternals.H = prevDispatcher;
    ReactSharedInternals.A = prevAsyncDispatcher;
    null === workInProgress && (workInProgressRoot = null, workInProgressRootRenderLanes = 0, finishQueueingConcurrentUpdates());
    return exitStatus;
  }
  function workLoopSync() {
    for (; null !== workInProgress; ) performUnitOfWork(workInProgress);
  }
  function renderRootConcurrent(root3, lanes) {
    var prevExecutionContext = executionContext;
    executionContext |= 2;
    var prevDispatcher = pushDispatcher(), prevAsyncDispatcher = pushAsyncDispatcher();
    workInProgressRoot !== root3 || workInProgressRootRenderLanes !== lanes ? (workInProgressTransitions = null, workInProgressRootRenderTargetTime = now() + 500, prepareFreshStack(root3, lanes)) : workInProgressRootIsPrerendering = checkIfRootIsPrerendering(
      root3,
      lanes
    );
    a: do
      try {
        if (0 !== workInProgressSuspendedReason && null !== workInProgress) {
          lanes = workInProgress;
          var thrownValue = workInProgressThrownValue;
          b: switch (workInProgressSuspendedReason) {
            case 1:
              workInProgressSuspendedReason = 0;
              workInProgressThrownValue = null;
              throwAndUnwindWorkLoop(root3, lanes, thrownValue, 1);
              break;
            case 2:
            case 9:
              if (isThenableResolved(thrownValue)) {
                workInProgressSuspendedReason = 0;
                workInProgressThrownValue = null;
                replaySuspendedUnitOfWork(lanes);
                break;
              }
              lanes = function() {
                2 !== workInProgressSuspendedReason && 9 !== workInProgressSuspendedReason || workInProgressRoot !== root3 || (workInProgressSuspendedReason = 7);
                ensureRootIsScheduled(root3);
              };
              thrownValue.then(lanes, lanes);
              break a;
            case 3:
              workInProgressSuspendedReason = 7;
              break a;
            case 4:
              workInProgressSuspendedReason = 5;
              break a;
            case 7:
              isThenableResolved(thrownValue) ? (workInProgressSuspendedReason = 0, workInProgressThrownValue = null, replaySuspendedUnitOfWork(lanes)) : (workInProgressSuspendedReason = 0, workInProgressThrownValue = null, throwAndUnwindWorkLoop(root3, lanes, thrownValue, 7));
              break;
            case 5:
              var resource = null;
              switch (workInProgress.tag) {
                case 26:
                  resource = workInProgress.memoizedState;
                case 5:
                case 27:
                  var hostFiber = workInProgress;
                  if (resource ? preloadResource(resource) : hostFiber.stateNode.complete) {
                    workInProgressSuspendedReason = 0;
                    workInProgressThrownValue = null;
                    var sibling = hostFiber.sibling;
                    if (null !== sibling) workInProgress = sibling;
                    else {
                      var returnFiber = hostFiber.return;
                      null !== returnFiber ? (workInProgress = returnFiber, completeUnitOfWork(returnFiber)) : workInProgress = null;
                    }
                    break b;
                  }
              }
              workInProgressSuspendedReason = 0;
              workInProgressThrownValue = null;
              throwAndUnwindWorkLoop(root3, lanes, thrownValue, 5);
              break;
            case 6:
              workInProgressSuspendedReason = 0;
              workInProgressThrownValue = null;
              throwAndUnwindWorkLoop(root3, lanes, thrownValue, 6);
              break;
            case 8:
              resetWorkInProgressStack();
              workInProgressRootExitStatus = 6;
              break a;
            default:
              throw Error(formatProdErrorMessage(462));
          }
        }
        workLoopConcurrentByScheduler();
        break;
      } catch (thrownValue$167) {
        handleThrow(root3, thrownValue$167);
      }
    while (1);
    lastContextDependency = currentlyRenderingFiber$1 = null;
    ReactSharedInternals.H = prevDispatcher;
    ReactSharedInternals.A = prevAsyncDispatcher;
    executionContext = prevExecutionContext;
    if (null !== workInProgress) return 0;
    workInProgressRoot = null;
    workInProgressRootRenderLanes = 0;
    finishQueueingConcurrentUpdates();
    return workInProgressRootExitStatus;
  }
  function workLoopConcurrentByScheduler() {
    for (; null !== workInProgress && !shouldYield(); )
      performUnitOfWork(workInProgress);
  }
  function performUnitOfWork(unitOfWork) {
    var next = beginWork(unitOfWork.alternate, unitOfWork, entangledRenderLanes);
    unitOfWork.memoizedProps = unitOfWork.pendingProps;
    null === next ? completeUnitOfWork(unitOfWork) : workInProgress = next;
  }
  function replaySuspendedUnitOfWork(unitOfWork) {
    var next = unitOfWork;
    var current = next.alternate;
    switch (next.tag) {
      case 15:
      case 0:
        next = replayFunctionComponent(
          current,
          next,
          next.pendingProps,
          next.type,
          void 0,
          workInProgressRootRenderLanes
        );
        break;
      case 11:
        next = replayFunctionComponent(
          current,
          next,
          next.pendingProps,
          next.type.render,
          next.ref,
          workInProgressRootRenderLanes
        );
        break;
      case 5:
        resetHooksOnUnwind(next);
      default:
        unwindInterruptedWork(current, next), next = workInProgress = resetWorkInProgress(next, entangledRenderLanes), next = beginWork(current, next, entangledRenderLanes);
    }
    unitOfWork.memoizedProps = unitOfWork.pendingProps;
    null === next ? completeUnitOfWork(unitOfWork) : workInProgress = next;
  }
  function throwAndUnwindWorkLoop(root3, unitOfWork, thrownValue, suspendedReason) {
    lastContextDependency = currentlyRenderingFiber$1 = null;
    resetHooksOnUnwind(unitOfWork);
    thenableState$1 = null;
    thenableIndexCounter$1 = 0;
    var returnFiber = unitOfWork.return;
    try {
      if (throwException(
        root3,
        returnFiber,
        unitOfWork,
        thrownValue,
        workInProgressRootRenderLanes
      )) {
        workInProgressRootExitStatus = 1;
        logUncaughtError(
          root3,
          createCapturedValueAtFiber(thrownValue, root3.current)
        );
        workInProgress = null;
        return;
      }
    } catch (error) {
      if (null !== returnFiber) throw workInProgress = returnFiber, error;
      workInProgressRootExitStatus = 1;
      logUncaughtError(
        root3,
        createCapturedValueAtFiber(thrownValue, root3.current)
      );
      workInProgress = null;
      return;
    }
    if (unitOfWork.flags & 32768) {
      if (isHydrating || 1 === suspendedReason) root3 = true;
      else if (workInProgressRootIsPrerendering || 0 !== (workInProgressRootRenderLanes & 536870912))
        root3 = false;
      else if (workInProgressRootDidSkipSuspendedSiblings = root3 = true, 2 === suspendedReason || 9 === suspendedReason || 3 === suspendedReason || 6 === suspendedReason)
        suspendedReason = suspenseHandlerStackCursor.current, null !== suspendedReason && 13 === suspendedReason.tag && (suspendedReason.flags |= 16384);
      unwindUnitOfWork(unitOfWork, root3);
    } else completeUnitOfWork(unitOfWork);
  }
  function completeUnitOfWork(unitOfWork) {
    var completedWork = unitOfWork;
    do {
      if (0 !== (completedWork.flags & 32768)) {
        unwindUnitOfWork(
          completedWork,
          workInProgressRootDidSkipSuspendedSiblings
        );
        return;
      }
      unitOfWork = completedWork.return;
      var next = completeWork(
        completedWork.alternate,
        completedWork,
        entangledRenderLanes
      );
      if (null !== next) {
        workInProgress = next;
        return;
      }
      completedWork = completedWork.sibling;
      if (null !== completedWork) {
        workInProgress = completedWork;
        return;
      }
      workInProgress = completedWork = unitOfWork;
    } while (null !== completedWork);
    0 === workInProgressRootExitStatus && (workInProgressRootExitStatus = 5);
  }
  function unwindUnitOfWork(unitOfWork, skipSiblings) {
    do {
      var next = unwindWork(unitOfWork.alternate, unitOfWork);
      if (null !== next) {
        next.flags &= 32767;
        workInProgress = next;
        return;
      }
      next = unitOfWork.return;
      null !== next && (next.flags |= 32768, next.subtreeFlags = 0, next.deletions = null);
      if (!skipSiblings && (unitOfWork = unitOfWork.sibling, null !== unitOfWork)) {
        workInProgress = unitOfWork;
        return;
      }
      workInProgress = unitOfWork = next;
    } while (null !== unitOfWork);
    workInProgressRootExitStatus = 6;
    workInProgress = null;
  }
  function commitRoot(root3, finishedWork, lanes, recoverableErrors, transitions, didIncludeRenderPhaseUpdate, spawnedLane, updatedLanes, suspendedRetryLanes) {
    root3.cancelPendingCommit = null;
    do
      flushPendingEffects();
    while (0 !== pendingEffectsStatus);
    if (0 !== (executionContext & 6)) throw Error(formatProdErrorMessage(327));
    if (null !== finishedWork) {
      if (finishedWork === root3.current) throw Error(formatProdErrorMessage(177));
      didIncludeRenderPhaseUpdate = finishedWork.lanes | finishedWork.childLanes;
      didIncludeRenderPhaseUpdate |= concurrentlyUpdatedLanes;
      markRootFinished(
        root3,
        lanes,
        didIncludeRenderPhaseUpdate,
        spawnedLane,
        updatedLanes,
        suspendedRetryLanes
      );
      root3 === workInProgressRoot && (workInProgress = workInProgressRoot = null, workInProgressRootRenderLanes = 0);
      pendingFinishedWork = finishedWork;
      pendingEffectsRoot = root3;
      pendingEffectsLanes = lanes;
      pendingEffectsRemainingLanes = didIncludeRenderPhaseUpdate;
      pendingPassiveTransitions = transitions;
      pendingRecoverableErrors = recoverableErrors;
      0 !== (finishedWork.subtreeFlags & 10256) || 0 !== (finishedWork.flags & 10256) ? (root3.callbackNode = null, root3.callbackPriority = 0, scheduleCallback$1(NormalPriority$1, function() {
        flushPassiveEffects();
        return null;
      })) : (root3.callbackNode = null, root3.callbackPriority = 0);
      recoverableErrors = 0 !== (finishedWork.flags & 13878);
      if (0 !== (finishedWork.subtreeFlags & 13878) || recoverableErrors) {
        recoverableErrors = ReactSharedInternals.T;
        ReactSharedInternals.T = null;
        transitions = ReactDOMSharedInternals.p;
        ReactDOMSharedInternals.p = 2;
        spawnedLane = executionContext;
        executionContext |= 4;
        try {
          commitBeforeMutationEffects(root3, finishedWork, lanes);
        } finally {
          executionContext = spawnedLane, ReactDOMSharedInternals.p = transitions, ReactSharedInternals.T = recoverableErrors;
        }
      }
      pendingEffectsStatus = 1;
      flushMutationEffects();
      flushLayoutEffects();
      flushSpawnedWork();
    }
  }
  function flushMutationEffects() {
    if (1 === pendingEffectsStatus) {
      pendingEffectsStatus = 0;
      var root3 = pendingEffectsRoot, finishedWork = pendingFinishedWork, rootMutationHasEffect = 0 !== (finishedWork.flags & 13878);
      if (0 !== (finishedWork.subtreeFlags & 13878) || rootMutationHasEffect) {
        rootMutationHasEffect = ReactSharedInternals.T;
        ReactSharedInternals.T = null;
        var previousPriority = ReactDOMSharedInternals.p;
        ReactDOMSharedInternals.p = 2;
        var prevExecutionContext = executionContext;
        executionContext |= 4;
        try {
          commitMutationEffectsOnFiber(finishedWork, root3);
          var priorSelectionInformation = selectionInformation, curFocusedElem = getActiveElementDeep(root3.containerInfo), priorFocusedElem = priorSelectionInformation.focusedElem, priorSelectionRange = priorSelectionInformation.selectionRange;
          if (curFocusedElem !== priorFocusedElem && priorFocusedElem && priorFocusedElem.ownerDocument && containsNode(
            priorFocusedElem.ownerDocument.documentElement,
            priorFocusedElem
          )) {
            if (null !== priorSelectionRange && hasSelectionCapabilities(priorFocusedElem)) {
              var start = priorSelectionRange.start, end = priorSelectionRange.end;
              void 0 === end && (end = start);
              if ("selectionStart" in priorFocusedElem)
                priorFocusedElem.selectionStart = start, priorFocusedElem.selectionEnd = Math.min(
                  end,
                  priorFocusedElem.value.length
                );
              else {
                var doc = priorFocusedElem.ownerDocument || document, win = doc && doc.defaultView || window;
                if (win.getSelection) {
                  var selection = win.getSelection(), length = priorFocusedElem.textContent.length, start$jscomp$0 = Math.min(priorSelectionRange.start, length), end$jscomp$0 = void 0 === priorSelectionRange.end ? start$jscomp$0 : Math.min(priorSelectionRange.end, length);
                  !selection.extend && start$jscomp$0 > end$jscomp$0 && (curFocusedElem = end$jscomp$0, end$jscomp$0 = start$jscomp$0, start$jscomp$0 = curFocusedElem);
                  var startMarker = getNodeForCharacterOffset(
                    priorFocusedElem,
                    start$jscomp$0
                  ), endMarker = getNodeForCharacterOffset(
                    priorFocusedElem,
                    end$jscomp$0
                  );
                  if (startMarker && endMarker && (1 !== selection.rangeCount || selection.anchorNode !== startMarker.node || selection.anchorOffset !== startMarker.offset || selection.focusNode !== endMarker.node || selection.focusOffset !== endMarker.offset)) {
                    var range = doc.createRange();
                    range.setStart(startMarker.node, startMarker.offset);
                    selection.removeAllRanges();
                    start$jscomp$0 > end$jscomp$0 ? (selection.addRange(range), selection.extend(endMarker.node, endMarker.offset)) : (range.setEnd(endMarker.node, endMarker.offset), selection.addRange(range));
                  }
                }
              }
            }
            doc = [];
            for (selection = priorFocusedElem; selection = selection.parentNode; )
              1 === selection.nodeType && doc.push({
                element: selection,
                left: selection.scrollLeft,
                top: selection.scrollTop
              });
            "function" === typeof priorFocusedElem.focus && priorFocusedElem.focus();
            for (priorFocusedElem = 0; priorFocusedElem < doc.length; priorFocusedElem++) {
              var info = doc[priorFocusedElem];
              info.element.scrollLeft = info.left;
              info.element.scrollTop = info.top;
            }
          }
          _enabled = !!eventsEnabled;
          selectionInformation = eventsEnabled = null;
        } finally {
          executionContext = prevExecutionContext, ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = rootMutationHasEffect;
        }
      }
      root3.current = finishedWork;
      pendingEffectsStatus = 2;
    }
  }
  function flushLayoutEffects() {
    if (2 === pendingEffectsStatus) {
      pendingEffectsStatus = 0;
      var root3 = pendingEffectsRoot, finishedWork = pendingFinishedWork, rootHasLayoutEffect = 0 !== (finishedWork.flags & 8772);
      if (0 !== (finishedWork.subtreeFlags & 8772) || rootHasLayoutEffect) {
        rootHasLayoutEffect = ReactSharedInternals.T;
        ReactSharedInternals.T = null;
        var previousPriority = ReactDOMSharedInternals.p;
        ReactDOMSharedInternals.p = 2;
        var prevExecutionContext = executionContext;
        executionContext |= 4;
        try {
          commitLayoutEffectOnFiber(root3, finishedWork.alternate, finishedWork);
        } finally {
          executionContext = prevExecutionContext, ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = rootHasLayoutEffect;
        }
      }
      pendingEffectsStatus = 3;
    }
  }
  function flushSpawnedWork() {
    if (4 === pendingEffectsStatus || 3 === pendingEffectsStatus) {
      pendingEffectsStatus = 0;
      requestPaint();
      var root3 = pendingEffectsRoot, finishedWork = pendingFinishedWork, lanes = pendingEffectsLanes, recoverableErrors = pendingRecoverableErrors;
      0 !== (finishedWork.subtreeFlags & 10256) || 0 !== (finishedWork.flags & 10256) ? pendingEffectsStatus = 5 : (pendingEffectsStatus = 0, pendingFinishedWork = pendingEffectsRoot = null, releaseRootPooledCache(root3, root3.pendingLanes));
      var remainingLanes = root3.pendingLanes;
      0 === remainingLanes && (legacyErrorBoundariesThatAlreadyFailed = null);
      lanesToEventPriority(lanes);
      finishedWork = finishedWork.stateNode;
      if (injectedHook && "function" === typeof injectedHook.onCommitFiberRoot)
        try {
          injectedHook.onCommitFiberRoot(
            rendererID,
            finishedWork,
            void 0,
            128 === (finishedWork.current.flags & 128)
          );
        } catch (err) {
        }
      if (null !== recoverableErrors) {
        finishedWork = ReactSharedInternals.T;
        remainingLanes = ReactDOMSharedInternals.p;
        ReactDOMSharedInternals.p = 2;
        ReactSharedInternals.T = null;
        try {
          for (var onRecoverableError = root3.onRecoverableError, i = 0; i < recoverableErrors.length; i++) {
            var recoverableError = recoverableErrors[i];
            onRecoverableError(recoverableError.value, {
              componentStack: recoverableError.stack
            });
          }
        } finally {
          ReactSharedInternals.T = finishedWork, ReactDOMSharedInternals.p = remainingLanes;
        }
      }
      0 !== (pendingEffectsLanes & 3) && flushPendingEffects();
      ensureRootIsScheduled(root3);
      remainingLanes = root3.pendingLanes;
      0 !== (lanes & 261930) && 0 !== (remainingLanes & 42) ? root3 === rootWithNestedUpdates ? nestedUpdateCount++ : (nestedUpdateCount = 0, rootWithNestedUpdates = root3) : nestedUpdateCount = 0;
      flushSyncWorkAcrossRoots_impl(0);
    }
  }
  function releaseRootPooledCache(root3, remainingLanes) {
    0 === (root3.pooledCacheLanes &= remainingLanes) && (remainingLanes = root3.pooledCache, null != remainingLanes && (root3.pooledCache = null, releaseCache(remainingLanes)));
  }
  function flushPendingEffects() {
    flushMutationEffects();
    flushLayoutEffects();
    flushSpawnedWork();
    return flushPassiveEffects();
  }
  function flushPassiveEffects() {
    if (5 !== pendingEffectsStatus) return false;
    var root3 = pendingEffectsRoot, remainingLanes = pendingEffectsRemainingLanes;
    pendingEffectsRemainingLanes = 0;
    var renderPriority = lanesToEventPriority(pendingEffectsLanes), prevTransition = ReactSharedInternals.T, previousPriority = ReactDOMSharedInternals.p;
    try {
      ReactDOMSharedInternals.p = 32 > renderPriority ? 32 : renderPriority;
      ReactSharedInternals.T = null;
      renderPriority = pendingPassiveTransitions;
      pendingPassiveTransitions = null;
      var root$jscomp$0 = pendingEffectsRoot, lanes = pendingEffectsLanes;
      pendingEffectsStatus = 0;
      pendingFinishedWork = pendingEffectsRoot = null;
      pendingEffectsLanes = 0;
      if (0 !== (executionContext & 6)) throw Error(formatProdErrorMessage(331));
      var prevExecutionContext = executionContext;
      executionContext |= 4;
      commitPassiveUnmountOnFiber(root$jscomp$0.current);
      commitPassiveMountOnFiber(
        root$jscomp$0,
        root$jscomp$0.current,
        lanes,
        renderPriority
      );
      executionContext = prevExecutionContext;
      flushSyncWorkAcrossRoots_impl(0, false);
      if (injectedHook && "function" === typeof injectedHook.onPostCommitFiberRoot)
        try {
          injectedHook.onPostCommitFiberRoot(rendererID, root$jscomp$0);
        } catch (err) {
        }
      return true;
    } finally {
      ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = prevTransition, releaseRootPooledCache(root3, remainingLanes);
    }
  }
  function captureCommitPhaseErrorOnRoot(rootFiber, sourceFiber, error) {
    sourceFiber = createCapturedValueAtFiber(error, sourceFiber);
    sourceFiber = createRootErrorUpdate(rootFiber.stateNode, sourceFiber, 2);
    rootFiber = enqueueUpdate(rootFiber, sourceFiber, 2);
    null !== rootFiber && (markRootUpdated$1(rootFiber, 2), ensureRootIsScheduled(rootFiber));
  }
  function captureCommitPhaseError(sourceFiber, nearestMountedAncestor, error) {
    if (3 === sourceFiber.tag)
      captureCommitPhaseErrorOnRoot(sourceFiber, sourceFiber, error);
    else
      for (; null !== nearestMountedAncestor; ) {
        if (3 === nearestMountedAncestor.tag) {
          captureCommitPhaseErrorOnRoot(
            nearestMountedAncestor,
            sourceFiber,
            error
          );
          break;
        } else if (1 === nearestMountedAncestor.tag) {
          var instance = nearestMountedAncestor.stateNode;
          if ("function" === typeof nearestMountedAncestor.type.getDerivedStateFromError || "function" === typeof instance.componentDidCatch && (null === legacyErrorBoundariesThatAlreadyFailed || !legacyErrorBoundariesThatAlreadyFailed.has(instance))) {
            sourceFiber = createCapturedValueAtFiber(error, sourceFiber);
            error = createClassErrorUpdate(2);
            instance = enqueueUpdate(nearestMountedAncestor, error, 2);
            null !== instance && (initializeClassErrorUpdate(
              error,
              instance,
              nearestMountedAncestor,
              sourceFiber
            ), markRootUpdated$1(instance, 2), ensureRootIsScheduled(instance));
            break;
          }
        }
        nearestMountedAncestor = nearestMountedAncestor.return;
      }
  }
  function attachPingListener(root3, wakeable, lanes) {
    var pingCache = root3.pingCache;
    if (null === pingCache) {
      pingCache = root3.pingCache = new PossiblyWeakMap();
      var threadIDs = /* @__PURE__ */ new Set();
      pingCache.set(wakeable, threadIDs);
    } else
      threadIDs = pingCache.get(wakeable), void 0 === threadIDs && (threadIDs = /* @__PURE__ */ new Set(), pingCache.set(wakeable, threadIDs));
    threadIDs.has(lanes) || (workInProgressRootDidAttachPingListener = true, threadIDs.add(lanes), root3 = pingSuspendedRoot.bind(null, root3, wakeable, lanes), wakeable.then(root3, root3));
  }
  function pingSuspendedRoot(root3, wakeable, pingedLanes) {
    var pingCache = root3.pingCache;
    null !== pingCache && pingCache.delete(wakeable);
    root3.pingedLanes |= root3.suspendedLanes & pingedLanes;
    root3.warmLanes &= ~pingedLanes;
    workInProgressRoot === root3 && (workInProgressRootRenderLanes & pingedLanes) === pingedLanes && (4 === workInProgressRootExitStatus || 3 === workInProgressRootExitStatus && (workInProgressRootRenderLanes & 62914560) === workInProgressRootRenderLanes && 300 > now() - globalMostRecentFallbackTime ? 0 === (executionContext & 2) && prepareFreshStack(root3, 0) : workInProgressRootPingedLanes |= pingedLanes, workInProgressSuspendedRetryLanes === workInProgressRootRenderLanes && (workInProgressSuspendedRetryLanes = 0));
    ensureRootIsScheduled(root3);
  }
  function retryTimedOutBoundary(boundaryFiber, retryLane) {
    0 === retryLane && (retryLane = claimNextRetryLane());
    boundaryFiber = enqueueConcurrentRenderForLane(boundaryFiber, retryLane);
    null !== boundaryFiber && (markRootUpdated$1(boundaryFiber, retryLane), ensureRootIsScheduled(boundaryFiber));
  }
  function retryDehydratedSuspenseBoundary(boundaryFiber) {
    var suspenseState = boundaryFiber.memoizedState, retryLane = 0;
    null !== suspenseState && (retryLane = suspenseState.retryLane);
    retryTimedOutBoundary(boundaryFiber, retryLane);
  }
  function resolveRetryWakeable(boundaryFiber, wakeable) {
    var retryLane = 0;
    switch (boundaryFiber.tag) {
      case 31:
      case 13:
        var retryCache = boundaryFiber.stateNode;
        var suspenseState = boundaryFiber.memoizedState;
        null !== suspenseState && (retryLane = suspenseState.retryLane);
        break;
      case 19:
        retryCache = boundaryFiber.stateNode;
        break;
      case 22:
        retryCache = boundaryFiber.stateNode._retryCache;
        break;
      default:
        throw Error(formatProdErrorMessage(314));
    }
    null !== retryCache && retryCache.delete(wakeable);
    retryTimedOutBoundary(boundaryFiber, retryLane);
  }
  function scheduleCallback$1(priorityLevel, callback) {
    return scheduleCallback$3(priorityLevel, callback);
  }
  var firstScheduledRoot = null, lastScheduledRoot = null, didScheduleMicrotask = false, mightHavePendingSyncWork = false, isFlushingWork = false, currentEventTransitionLane = 0;
  function ensureRootIsScheduled(root3) {
    root3 !== lastScheduledRoot && null === root3.next && (null === lastScheduledRoot ? firstScheduledRoot = lastScheduledRoot = root3 : lastScheduledRoot = lastScheduledRoot.next = root3);
    mightHavePendingSyncWork = true;
    didScheduleMicrotask || (didScheduleMicrotask = true, scheduleImmediateRootScheduleTask());
  }
  function flushSyncWorkAcrossRoots_impl(syncTransitionLanes, onlyLegacy) {
    if (!isFlushingWork && mightHavePendingSyncWork) {
      isFlushingWork = true;
      do {
        var didPerformSomeWork = false;
        for (var root$170 = firstScheduledRoot; null !== root$170; ) {
          if (0 !== syncTransitionLanes) {
            var pendingLanes = root$170.pendingLanes;
            if (0 === pendingLanes) var JSCompiler_inline_result = 0;
            else {
              var suspendedLanes = root$170.suspendedLanes, pingedLanes = root$170.pingedLanes;
              JSCompiler_inline_result = (1 << 31 - clz32(42 | syncTransitionLanes) + 1) - 1;
              JSCompiler_inline_result &= pendingLanes & ~(suspendedLanes & ~pingedLanes);
              JSCompiler_inline_result = JSCompiler_inline_result & 201326741 ? JSCompiler_inline_result & 201326741 | 1 : JSCompiler_inline_result ? JSCompiler_inline_result | 2 : 0;
            }
            0 !== JSCompiler_inline_result && (didPerformSomeWork = true, performSyncWorkOnRoot(root$170, JSCompiler_inline_result));
          } else
            JSCompiler_inline_result = workInProgressRootRenderLanes, JSCompiler_inline_result = getNextLanes(
              root$170,
              root$170 === workInProgressRoot ? JSCompiler_inline_result : 0,
              null !== root$170.cancelPendingCommit || -1 !== root$170.timeoutHandle
            ), 0 === (JSCompiler_inline_result & 3) || checkIfRootIsPrerendering(root$170, JSCompiler_inline_result) || (didPerformSomeWork = true, performSyncWorkOnRoot(root$170, JSCompiler_inline_result));
          root$170 = root$170.next;
        }
      } while (didPerformSomeWork);
      isFlushingWork = false;
    }
  }
  function processRootScheduleInImmediateTask() {
    processRootScheduleInMicrotask();
  }
  function processRootScheduleInMicrotask() {
    mightHavePendingSyncWork = didScheduleMicrotask = false;
    var syncTransitionLanes = 0;
    0 !== currentEventTransitionLane && shouldAttemptEagerTransition() && (syncTransitionLanes = currentEventTransitionLane);
    for (var currentTime = now(), prev = null, root3 = firstScheduledRoot; null !== root3; ) {
      var next = root3.next, nextLanes = scheduleTaskForRootDuringMicrotask(root3, currentTime);
      if (0 === nextLanes)
        root3.next = null, null === prev ? firstScheduledRoot = next : prev.next = next, null === next && (lastScheduledRoot = prev);
      else if (prev = root3, 0 !== syncTransitionLanes || 0 !== (nextLanes & 3))
        mightHavePendingSyncWork = true;
      root3 = next;
    }
    0 !== pendingEffectsStatus && 5 !== pendingEffectsStatus || flushSyncWorkAcrossRoots_impl(syncTransitionLanes);
    0 !== currentEventTransitionLane && (currentEventTransitionLane = 0);
  }
  function scheduleTaskForRootDuringMicrotask(root3, currentTime) {
    for (var suspendedLanes = root3.suspendedLanes, pingedLanes = root3.pingedLanes, expirationTimes = root3.expirationTimes, lanes = root3.pendingLanes & -62914561; 0 < lanes; ) {
      var index$5 = 31 - clz32(lanes), lane = 1 << index$5, expirationTime = expirationTimes[index$5];
      if (-1 === expirationTime) {
        if (0 === (lane & suspendedLanes) || 0 !== (lane & pingedLanes))
          expirationTimes[index$5] = computeExpirationTime(lane, currentTime);
      } else expirationTime <= currentTime && (root3.expiredLanes |= lane);
      lanes &= ~lane;
    }
    currentTime = workInProgressRoot;
    suspendedLanes = workInProgressRootRenderLanes;
    suspendedLanes = getNextLanes(
      root3,
      root3 === currentTime ? suspendedLanes : 0,
      null !== root3.cancelPendingCommit || -1 !== root3.timeoutHandle
    );
    pingedLanes = root3.callbackNode;
    if (0 === suspendedLanes || root3 === currentTime && (2 === workInProgressSuspendedReason || 9 === workInProgressSuspendedReason) || null !== root3.cancelPendingCommit)
      return null !== pingedLanes && null !== pingedLanes && cancelCallback$1(pingedLanes), root3.callbackNode = null, root3.callbackPriority = 0;
    if (0 === (suspendedLanes & 3) || checkIfRootIsPrerendering(root3, suspendedLanes)) {
      currentTime = suspendedLanes & -suspendedLanes;
      if (currentTime === root3.callbackPriority) return currentTime;
      null !== pingedLanes && cancelCallback$1(pingedLanes);
      switch (lanesToEventPriority(suspendedLanes)) {
        case 2:
        case 8:
          suspendedLanes = UserBlockingPriority;
          break;
        case 32:
          suspendedLanes = NormalPriority$1;
          break;
        case 268435456:
          suspendedLanes = IdlePriority;
          break;
        default:
          suspendedLanes = NormalPriority$1;
      }
      pingedLanes = performWorkOnRootViaSchedulerTask.bind(null, root3);
      suspendedLanes = scheduleCallback$3(suspendedLanes, pingedLanes);
      root3.callbackPriority = currentTime;
      root3.callbackNode = suspendedLanes;
      return currentTime;
    }
    null !== pingedLanes && null !== pingedLanes && cancelCallback$1(pingedLanes);
    root3.callbackPriority = 2;
    root3.callbackNode = null;
    return 2;
  }
  function performWorkOnRootViaSchedulerTask(root3, didTimeout) {
    if (0 !== pendingEffectsStatus && 5 !== pendingEffectsStatus)
      return root3.callbackNode = null, root3.callbackPriority = 0, null;
    var originalCallbackNode = root3.callbackNode;
    if (flushPendingEffects() && root3.callbackNode !== originalCallbackNode)
      return null;
    var workInProgressRootRenderLanes$jscomp$0 = workInProgressRootRenderLanes;
    workInProgressRootRenderLanes$jscomp$0 = getNextLanes(
      root3,
      root3 === workInProgressRoot ? workInProgressRootRenderLanes$jscomp$0 : 0,
      null !== root3.cancelPendingCommit || -1 !== root3.timeoutHandle
    );
    if (0 === workInProgressRootRenderLanes$jscomp$0) return null;
    performWorkOnRoot(root3, workInProgressRootRenderLanes$jscomp$0, didTimeout);
    scheduleTaskForRootDuringMicrotask(root3, now());
    return null != root3.callbackNode && root3.callbackNode === originalCallbackNode ? performWorkOnRootViaSchedulerTask.bind(null, root3) : null;
  }
  function performSyncWorkOnRoot(root3, lanes) {
    if (flushPendingEffects()) return null;
    performWorkOnRoot(root3, lanes, true);
  }
  function scheduleImmediateRootScheduleTask() {
    scheduleMicrotask(function() {
      0 !== (executionContext & 6) ? scheduleCallback$3(
        ImmediatePriority,
        processRootScheduleInImmediateTask
      ) : processRootScheduleInMicrotask();
    });
  }
  function requestTransitionLane() {
    if (0 === currentEventTransitionLane) {
      var actionScopeLane = currentEntangledLane;
      0 === actionScopeLane && (actionScopeLane = nextTransitionUpdateLane, nextTransitionUpdateLane <<= 1, 0 === (nextTransitionUpdateLane & 261888) && (nextTransitionUpdateLane = 256));
      currentEventTransitionLane = actionScopeLane;
    }
    return currentEventTransitionLane;
  }
  function coerceFormActionProp(actionProp) {
    return null == actionProp || "symbol" === typeof actionProp || "boolean" === typeof actionProp ? null : "function" === typeof actionProp ? actionProp : sanitizeURL("" + actionProp);
  }
  function createFormDataWithSubmitter(form, submitter) {
    var temp = submitter.ownerDocument.createElement("input");
    temp.name = submitter.name;
    temp.value = submitter.value;
    form.id && temp.setAttribute("form", form.id);
    submitter.parentNode.insertBefore(temp, submitter);
    form = new FormData(form);
    temp.parentNode.removeChild(temp);
    return form;
  }
  function extractEvents$1(dispatchQueue, domEventName, maybeTargetInst, nativeEvent, nativeEventTarget) {
    if ("submit" === domEventName && maybeTargetInst && maybeTargetInst.stateNode === nativeEventTarget) {
      var action = coerceFormActionProp(
        (nativeEventTarget[internalPropsKey] || null).action
      ), submitter = nativeEvent.submitter;
      submitter && (domEventName = (domEventName = submitter[internalPropsKey] || null) ? coerceFormActionProp(domEventName.formAction) : submitter.getAttribute("formAction"), null !== domEventName && (action = domEventName, submitter = null));
      var event = new SyntheticEvent(
        "action",
        "action",
        null,
        nativeEvent,
        nativeEventTarget
      );
      dispatchQueue.push({
        event,
        listeners: [
          {
            instance: null,
            listener: function() {
              if (nativeEvent.defaultPrevented) {
                if (0 !== currentEventTransitionLane) {
                  var formData = submitter ? createFormDataWithSubmitter(nativeEventTarget, submitter) : new FormData(nativeEventTarget);
                  startHostTransition(
                    maybeTargetInst,
                    {
                      pending: true,
                      data: formData,
                      method: nativeEventTarget.method,
                      action
                    },
                    null,
                    formData
                  );
                }
              } else
                "function" === typeof action && (event.preventDefault(), formData = submitter ? createFormDataWithSubmitter(nativeEventTarget, submitter) : new FormData(nativeEventTarget), startHostTransition(
                  maybeTargetInst,
                  {
                    pending: true,
                    data: formData,
                    method: nativeEventTarget.method,
                    action
                  },
                  action,
                  formData
                ));
            },
            currentTarget: nativeEventTarget
          }
        ]
      });
    }
  }
  for (var i$jscomp$inline_1577 = 0; i$jscomp$inline_1577 < simpleEventPluginEvents.length; i$jscomp$inline_1577++) {
    var eventName$jscomp$inline_1578 = simpleEventPluginEvents[i$jscomp$inline_1577], domEventName$jscomp$inline_1579 = eventName$jscomp$inline_1578.toLowerCase(), capitalizedEvent$jscomp$inline_1580 = eventName$jscomp$inline_1578[0].toUpperCase() + eventName$jscomp$inline_1578.slice(1);
    registerSimpleEvent(
      domEventName$jscomp$inline_1579,
      "on" + capitalizedEvent$jscomp$inline_1580
    );
  }
  registerSimpleEvent(ANIMATION_END, "onAnimationEnd");
  registerSimpleEvent(ANIMATION_ITERATION, "onAnimationIteration");
  registerSimpleEvent(ANIMATION_START, "onAnimationStart");
  registerSimpleEvent("dblclick", "onDoubleClick");
  registerSimpleEvent("focusin", "onFocus");
  registerSimpleEvent("focusout", "onBlur");
  registerSimpleEvent(TRANSITION_RUN, "onTransitionRun");
  registerSimpleEvent(TRANSITION_START, "onTransitionStart");
  registerSimpleEvent(TRANSITION_CANCEL, "onTransitionCancel");
  registerSimpleEvent(TRANSITION_END, "onTransitionEnd");
  registerDirectEvent("onMouseEnter", ["mouseout", "mouseover"]);
  registerDirectEvent("onMouseLeave", ["mouseout", "mouseover"]);
  registerDirectEvent("onPointerEnter", ["pointerout", "pointerover"]);
  registerDirectEvent("onPointerLeave", ["pointerout", "pointerover"]);
  registerTwoPhaseEvent(
    "onChange",
    "change click focusin focusout input keydown keyup selectionchange".split(" ")
  );
  registerTwoPhaseEvent(
    "onSelect",
    "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(
      " "
    )
  );
  registerTwoPhaseEvent("onBeforeInput", [
    "compositionend",
    "keypress",
    "textInput",
    "paste"
  ]);
  registerTwoPhaseEvent(
    "onCompositionEnd",
    "compositionend focusout keydown keypress keyup mousedown".split(" ")
  );
  registerTwoPhaseEvent(
    "onCompositionStart",
    "compositionstart focusout keydown keypress keyup mousedown".split(" ")
  );
  registerTwoPhaseEvent(
    "onCompositionUpdate",
    "compositionupdate focusout keydown keypress keyup mousedown".split(" ")
  );
  var mediaEventTypes = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(
    " "
  ), nonDelegatedEvents = new Set(
    "beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(mediaEventTypes)
  );
  function processDispatchQueue(dispatchQueue, eventSystemFlags) {
    eventSystemFlags = 0 !== (eventSystemFlags & 4);
    for (var i = 0; i < dispatchQueue.length; i++) {
      var _dispatchQueue$i = dispatchQueue[i], event = _dispatchQueue$i.event;
      _dispatchQueue$i = _dispatchQueue$i.listeners;
      a: {
        var previousInstance = void 0;
        if (eventSystemFlags)
          for (var i$jscomp$0 = _dispatchQueue$i.length - 1; 0 <= i$jscomp$0; i$jscomp$0--) {
            var _dispatchListeners$i = _dispatchQueue$i[i$jscomp$0], instance = _dispatchListeners$i.instance, currentTarget = _dispatchListeners$i.currentTarget;
            _dispatchListeners$i = _dispatchListeners$i.listener;
            if (instance !== previousInstance && event.isPropagationStopped())
              break a;
            previousInstance = _dispatchListeners$i;
            event.currentTarget = currentTarget;
            try {
              previousInstance(event);
            } catch (error) {
              reportGlobalError(error);
            }
            event.currentTarget = null;
            previousInstance = instance;
          }
        else
          for (i$jscomp$0 = 0; i$jscomp$0 < _dispatchQueue$i.length; i$jscomp$0++) {
            _dispatchListeners$i = _dispatchQueue$i[i$jscomp$0];
            instance = _dispatchListeners$i.instance;
            currentTarget = _dispatchListeners$i.currentTarget;
            _dispatchListeners$i = _dispatchListeners$i.listener;
            if (instance !== previousInstance && event.isPropagationStopped())
              break a;
            previousInstance = _dispatchListeners$i;
            event.currentTarget = currentTarget;
            try {
              previousInstance(event);
            } catch (error) {
              reportGlobalError(error);
            }
            event.currentTarget = null;
            previousInstance = instance;
          }
      }
    }
  }
  function listenToNonDelegatedEvent(domEventName, targetElement) {
    var JSCompiler_inline_result = targetElement[internalEventHandlersKey];
    void 0 === JSCompiler_inline_result && (JSCompiler_inline_result = targetElement[internalEventHandlersKey] = /* @__PURE__ */ new Set());
    var listenerSetKey = domEventName + "__bubble";
    JSCompiler_inline_result.has(listenerSetKey) || (addTrappedEventListener(targetElement, domEventName, 2, false), JSCompiler_inline_result.add(listenerSetKey));
  }
  function listenToNativeEvent(domEventName, isCapturePhaseListener, target) {
    var eventSystemFlags = 0;
    isCapturePhaseListener && (eventSystemFlags |= 4);
    addTrappedEventListener(
      target,
      domEventName,
      eventSystemFlags,
      isCapturePhaseListener
    );
  }
  var listeningMarker = "_reactListening" + Math.random().toString(36).slice(2);
  function listenToAllSupportedEvents(rootContainerElement) {
    if (!rootContainerElement[listeningMarker]) {
      rootContainerElement[listeningMarker] = true;
      allNativeEvents.forEach(function(domEventName) {
        "selectionchange" !== domEventName && (nonDelegatedEvents.has(domEventName) || listenToNativeEvent(domEventName, false, rootContainerElement), listenToNativeEvent(domEventName, true, rootContainerElement));
      });
      var ownerDocument = 9 === rootContainerElement.nodeType ? rootContainerElement : rootContainerElement.ownerDocument;
      null === ownerDocument || ownerDocument[listeningMarker] || (ownerDocument[listeningMarker] = true, listenToNativeEvent("selectionchange", false, ownerDocument));
    }
  }
  function addTrappedEventListener(targetContainer, domEventName, eventSystemFlags, isCapturePhaseListener) {
    switch (getEventPriority(domEventName)) {
      case 2:
        var listenerWrapper = dispatchDiscreteEvent;
        break;
      case 8:
        listenerWrapper = dispatchContinuousEvent;
        break;
      default:
        listenerWrapper = dispatchEvent;
    }
    eventSystemFlags = listenerWrapper.bind(
      null,
      domEventName,
      eventSystemFlags,
      targetContainer
    );
    listenerWrapper = void 0;
    !passiveBrowserEventsSupported || "touchstart" !== domEventName && "touchmove" !== domEventName && "wheel" !== domEventName || (listenerWrapper = true);
    isCapturePhaseListener ? void 0 !== listenerWrapper ? targetContainer.addEventListener(domEventName, eventSystemFlags, {
      capture: true,
      passive: listenerWrapper
    }) : targetContainer.addEventListener(domEventName, eventSystemFlags, true) : void 0 !== listenerWrapper ? targetContainer.addEventListener(domEventName, eventSystemFlags, {
      passive: listenerWrapper
    }) : targetContainer.addEventListener(domEventName, eventSystemFlags, false);
  }
  function dispatchEventForPluginEventSystem(domEventName, eventSystemFlags, nativeEvent, targetInst$jscomp$0, targetContainer) {
    var ancestorInst = targetInst$jscomp$0;
    if (0 === (eventSystemFlags & 1) && 0 === (eventSystemFlags & 2) && null !== targetInst$jscomp$0)
      a: for (; ; ) {
        if (null === targetInst$jscomp$0) return;
        var nodeTag = targetInst$jscomp$0.tag;
        if (3 === nodeTag || 4 === nodeTag) {
          var container = targetInst$jscomp$0.stateNode.containerInfo;
          if (container === targetContainer) break;
          if (4 === nodeTag)
            for (nodeTag = targetInst$jscomp$0.return; null !== nodeTag; ) {
              var grandTag = nodeTag.tag;
              if ((3 === grandTag || 4 === grandTag) && nodeTag.stateNode.containerInfo === targetContainer)
                return;
              nodeTag = nodeTag.return;
            }
          for (; null !== container; ) {
            nodeTag = getClosestInstanceFromNode(container);
            if (null === nodeTag) return;
            grandTag = nodeTag.tag;
            if (5 === grandTag || 6 === grandTag || 26 === grandTag || 27 === grandTag) {
              targetInst$jscomp$0 = ancestorInst = nodeTag;
              continue a;
            }
            container = container.parentNode;
          }
        }
        targetInst$jscomp$0 = targetInst$jscomp$0.return;
      }
    batchedUpdates$1(function() {
      var targetInst = ancestorInst, nativeEventTarget = getEventTarget(nativeEvent), dispatchQueue = [];
      a: {
        var reactName = topLevelEventsToReactNames.get(domEventName);
        if (void 0 !== reactName) {
          var SyntheticEventCtor = SyntheticEvent, reactEventType = domEventName;
          switch (domEventName) {
            case "keypress":
              if (0 === getEventCharCode(nativeEvent)) break a;
            case "keydown":
            case "keyup":
              SyntheticEventCtor = SyntheticKeyboardEvent;
              break;
            case "focusin":
              reactEventType = "focus";
              SyntheticEventCtor = SyntheticFocusEvent;
              break;
            case "focusout":
              reactEventType = "blur";
              SyntheticEventCtor = SyntheticFocusEvent;
              break;
            case "beforeblur":
            case "afterblur":
              SyntheticEventCtor = SyntheticFocusEvent;
              break;
            case "click":
              if (2 === nativeEvent.button) break a;
            case "auxclick":
            case "dblclick":
            case "mousedown":
            case "mousemove":
            case "mouseup":
            case "mouseout":
            case "mouseover":
            case "contextmenu":
              SyntheticEventCtor = SyntheticMouseEvent;
              break;
            case "drag":
            case "dragend":
            case "dragenter":
            case "dragexit":
            case "dragleave":
            case "dragover":
            case "dragstart":
            case "drop":
              SyntheticEventCtor = SyntheticDragEvent;
              break;
            case "touchcancel":
            case "touchend":
            case "touchmove":
            case "touchstart":
              SyntheticEventCtor = SyntheticTouchEvent;
              break;
            case ANIMATION_END:
            case ANIMATION_ITERATION:
            case ANIMATION_START:
              SyntheticEventCtor = SyntheticAnimationEvent;
              break;
            case TRANSITION_END:
              SyntheticEventCtor = SyntheticTransitionEvent;
              break;
            case "scroll":
            case "scrollend":
              SyntheticEventCtor = SyntheticUIEvent;
              break;
            case "wheel":
              SyntheticEventCtor = SyntheticWheelEvent;
              break;
            case "copy":
            case "cut":
            case "paste":
              SyntheticEventCtor = SyntheticClipboardEvent;
              break;
            case "gotpointercapture":
            case "lostpointercapture":
            case "pointercancel":
            case "pointerdown":
            case "pointermove":
            case "pointerout":
            case "pointerover":
            case "pointerup":
              SyntheticEventCtor = SyntheticPointerEvent;
              break;
            case "toggle":
            case "beforetoggle":
              SyntheticEventCtor = SyntheticToggleEvent;
          }
          var inCapturePhase = 0 !== (eventSystemFlags & 4), accumulateTargetOnly = !inCapturePhase && ("scroll" === domEventName || "scrollend" === domEventName), reactEventName = inCapturePhase ? null !== reactName ? reactName + "Capture" : null : reactName;
          inCapturePhase = [];
          for (var instance = targetInst, lastHostComponent; null !== instance; ) {
            var _instance = instance;
            lastHostComponent = _instance.stateNode;
            _instance = _instance.tag;
            5 !== _instance && 26 !== _instance && 27 !== _instance || null === lastHostComponent || null === reactEventName || (_instance = getListener(instance, reactEventName), null != _instance && inCapturePhase.push(
              createDispatchListener(instance, _instance, lastHostComponent)
            ));
            if (accumulateTargetOnly) break;
            instance = instance.return;
          }
          0 < inCapturePhase.length && (reactName = new SyntheticEventCtor(
            reactName,
            reactEventType,
            null,
            nativeEvent,
            nativeEventTarget
          ), dispatchQueue.push({ event: reactName, listeners: inCapturePhase }));
        }
      }
      if (0 === (eventSystemFlags & 7)) {
        a: {
          reactName = "mouseover" === domEventName || "pointerover" === domEventName;
          SyntheticEventCtor = "mouseout" === domEventName || "pointerout" === domEventName;
          if (reactName && nativeEvent !== currentReplayingEvent && (reactEventType = nativeEvent.relatedTarget || nativeEvent.fromElement) && (getClosestInstanceFromNode(reactEventType) || reactEventType[internalContainerInstanceKey]))
            break a;
          if (SyntheticEventCtor || reactName) {
            reactName = nativeEventTarget.window === nativeEventTarget ? nativeEventTarget : (reactName = nativeEventTarget.ownerDocument) ? reactName.defaultView || reactName.parentWindow : window;
            if (SyntheticEventCtor) {
              if (reactEventType = nativeEvent.relatedTarget || nativeEvent.toElement, SyntheticEventCtor = targetInst, reactEventType = reactEventType ? getClosestInstanceFromNode(reactEventType) : null, null !== reactEventType && (accumulateTargetOnly = getNearestMountedFiber(reactEventType), inCapturePhase = reactEventType.tag, reactEventType !== accumulateTargetOnly || 5 !== inCapturePhase && 27 !== inCapturePhase && 6 !== inCapturePhase))
                reactEventType = null;
            } else SyntheticEventCtor = null, reactEventType = targetInst;
            if (SyntheticEventCtor !== reactEventType) {
              inCapturePhase = SyntheticMouseEvent;
              _instance = "onMouseLeave";
              reactEventName = "onMouseEnter";
              instance = "mouse";
              if ("pointerout" === domEventName || "pointerover" === domEventName)
                inCapturePhase = SyntheticPointerEvent, _instance = "onPointerLeave", reactEventName = "onPointerEnter", instance = "pointer";
              accumulateTargetOnly = null == SyntheticEventCtor ? reactName : getNodeFromInstance(SyntheticEventCtor);
              lastHostComponent = null == reactEventType ? reactName : getNodeFromInstance(reactEventType);
              reactName = new inCapturePhase(
                _instance,
                instance + "leave",
                SyntheticEventCtor,
                nativeEvent,
                nativeEventTarget
              );
              reactName.target = accumulateTargetOnly;
              reactName.relatedTarget = lastHostComponent;
              _instance = null;
              getClosestInstanceFromNode(nativeEventTarget) === targetInst && (inCapturePhase = new inCapturePhase(
                reactEventName,
                instance + "enter",
                reactEventType,
                nativeEvent,
                nativeEventTarget
              ), inCapturePhase.target = lastHostComponent, inCapturePhase.relatedTarget = accumulateTargetOnly, _instance = inCapturePhase);
              accumulateTargetOnly = _instance;
              if (SyntheticEventCtor && reactEventType)
                b: {
                  inCapturePhase = getParent;
                  reactEventName = SyntheticEventCtor;
                  instance = reactEventType;
                  lastHostComponent = 0;
                  for (_instance = reactEventName; _instance; _instance = inCapturePhase(_instance))
                    lastHostComponent++;
                  _instance = 0;
                  for (var tempB = instance; tempB; tempB = inCapturePhase(tempB))
                    _instance++;
                  for (; 0 < lastHostComponent - _instance; )
                    reactEventName = inCapturePhase(reactEventName), lastHostComponent--;
                  for (; 0 < _instance - lastHostComponent; )
                    instance = inCapturePhase(instance), _instance--;
                  for (; lastHostComponent--; ) {
                    if (reactEventName === instance || null !== instance && reactEventName === instance.alternate) {
                      inCapturePhase = reactEventName;
                      break b;
                    }
                    reactEventName = inCapturePhase(reactEventName);
                    instance = inCapturePhase(instance);
                  }
                  inCapturePhase = null;
                }
              else inCapturePhase = null;
              null !== SyntheticEventCtor && accumulateEnterLeaveListenersForEvent(
                dispatchQueue,
                reactName,
                SyntheticEventCtor,
                inCapturePhase,
                false
              );
              null !== reactEventType && null !== accumulateTargetOnly && accumulateEnterLeaveListenersForEvent(
                dispatchQueue,
                accumulateTargetOnly,
                reactEventType,
                inCapturePhase,
                true
              );
            }
          }
        }
        a: {
          reactName = targetInst ? getNodeFromInstance(targetInst) : window;
          SyntheticEventCtor = reactName.nodeName && reactName.nodeName.toLowerCase();
          if ("select" === SyntheticEventCtor || "input" === SyntheticEventCtor && "file" === reactName.type)
            var getTargetInstFunc = getTargetInstForChangeEvent;
          else if (isTextInputElement(reactName))
            if (isInputEventSupported)
              getTargetInstFunc = getTargetInstForInputOrChangeEvent;
            else {
              getTargetInstFunc = getTargetInstForInputEventPolyfill;
              var handleEventFunc = handleEventsForInputEventPolyfill;
            }
          else
            SyntheticEventCtor = reactName.nodeName, !SyntheticEventCtor || "input" !== SyntheticEventCtor.toLowerCase() || "checkbox" !== reactName.type && "radio" !== reactName.type ? targetInst && isCustomElement(targetInst.elementType) && (getTargetInstFunc = getTargetInstForChangeEvent) : getTargetInstFunc = getTargetInstForClickEvent;
          if (getTargetInstFunc && (getTargetInstFunc = getTargetInstFunc(domEventName, targetInst))) {
            createAndAccumulateChangeEvent(
              dispatchQueue,
              getTargetInstFunc,
              nativeEvent,
              nativeEventTarget
            );
            break a;
          }
          handleEventFunc && handleEventFunc(domEventName, reactName, targetInst);
          "focusout" === domEventName && targetInst && "number" === reactName.type && null != targetInst.memoizedProps.value && setDefaultValue(reactName, "number", reactName.value);
        }
        handleEventFunc = targetInst ? getNodeFromInstance(targetInst) : window;
        switch (domEventName) {
          case "focusin":
            if (isTextInputElement(handleEventFunc) || "true" === handleEventFunc.contentEditable)
              activeElement = handleEventFunc, activeElementInst = targetInst, lastSelection = null;
            break;
          case "focusout":
            lastSelection = activeElementInst = activeElement = null;
            break;
          case "mousedown":
            mouseDown = true;
            break;
          case "contextmenu":
          case "mouseup":
          case "dragend":
            mouseDown = false;
            constructSelectEvent(dispatchQueue, nativeEvent, nativeEventTarget);
            break;
          case "selectionchange":
            if (skipSelectionChangeEvent) break;
          case "keydown":
          case "keyup":
            constructSelectEvent(dispatchQueue, nativeEvent, nativeEventTarget);
        }
        var fallbackData;
        if (canUseCompositionEvent)
          b: {
            switch (domEventName) {
              case "compositionstart":
                var eventType = "onCompositionStart";
                break b;
              case "compositionend":
                eventType = "onCompositionEnd";
                break b;
              case "compositionupdate":
                eventType = "onCompositionUpdate";
                break b;
            }
            eventType = void 0;
          }
        else
          isComposing ? isFallbackCompositionEnd(domEventName, nativeEvent) && (eventType = "onCompositionEnd") : "keydown" === domEventName && 229 === nativeEvent.keyCode && (eventType = "onCompositionStart");
        eventType && (useFallbackCompositionData && "ko" !== nativeEvent.locale && (isComposing || "onCompositionStart" !== eventType ? "onCompositionEnd" === eventType && isComposing && (fallbackData = getData()) : (root2 = nativeEventTarget, startText = "value" in root2 ? root2.value : root2.textContent, isComposing = true)), handleEventFunc = accumulateTwoPhaseListeners(targetInst, eventType), 0 < handleEventFunc.length && (eventType = new SyntheticCompositionEvent(
          eventType,
          domEventName,
          null,
          nativeEvent,
          nativeEventTarget
        ), dispatchQueue.push({ event: eventType, listeners: handleEventFunc }), fallbackData ? eventType.data = fallbackData : (fallbackData = getDataFromCustomEvent(nativeEvent), null !== fallbackData && (eventType.data = fallbackData))));
        if (fallbackData = canUseTextInputEvent ? getNativeBeforeInputChars(domEventName, nativeEvent) : getFallbackBeforeInputChars(domEventName, nativeEvent))
          eventType = accumulateTwoPhaseListeners(targetInst, "onBeforeInput"), 0 < eventType.length && (handleEventFunc = new SyntheticCompositionEvent(
            "onBeforeInput",
            "beforeinput",
            null,
            nativeEvent,
            nativeEventTarget
          ), dispatchQueue.push({
            event: handleEventFunc,
            listeners: eventType
          }), handleEventFunc.data = fallbackData);
        extractEvents$1(
          dispatchQueue,
          domEventName,
          targetInst,
          nativeEvent,
          nativeEventTarget
        );
      }
      processDispatchQueue(dispatchQueue, eventSystemFlags);
    });
  }
  function createDispatchListener(instance, listener, currentTarget) {
    return {
      instance,
      listener,
      currentTarget
    };
  }
  function accumulateTwoPhaseListeners(targetFiber, reactName) {
    for (var captureName = reactName + "Capture", listeners = []; null !== targetFiber; ) {
      var _instance2 = targetFiber, stateNode = _instance2.stateNode;
      _instance2 = _instance2.tag;
      5 !== _instance2 && 26 !== _instance2 && 27 !== _instance2 || null === stateNode || (_instance2 = getListener(targetFiber, captureName), null != _instance2 && listeners.unshift(
        createDispatchListener(targetFiber, _instance2, stateNode)
      ), _instance2 = getListener(targetFiber, reactName), null != _instance2 && listeners.push(
        createDispatchListener(targetFiber, _instance2, stateNode)
      ));
      if (3 === targetFiber.tag) return listeners;
      targetFiber = targetFiber.return;
    }
    return [];
  }
  function getParent(inst) {
    if (null === inst) return null;
    do
      inst = inst.return;
    while (inst && 5 !== inst.tag && 27 !== inst.tag);
    return inst ? inst : null;
  }
  function accumulateEnterLeaveListenersForEvent(dispatchQueue, event, target, common, inCapturePhase) {
    for (var registrationName = event._reactName, listeners = []; null !== target && target !== common; ) {
      var _instance3 = target, alternate = _instance3.alternate, stateNode = _instance3.stateNode;
      _instance3 = _instance3.tag;
      if (null !== alternate && alternate === common) break;
      5 !== _instance3 && 26 !== _instance3 && 27 !== _instance3 || null === stateNode || (alternate = stateNode, inCapturePhase ? (stateNode = getListener(target, registrationName), null != stateNode && listeners.unshift(
        createDispatchListener(target, stateNode, alternate)
      )) : inCapturePhase || (stateNode = getListener(target, registrationName), null != stateNode && listeners.push(
        createDispatchListener(target, stateNode, alternate)
      )));
      target = target.return;
    }
    0 !== listeners.length && dispatchQueue.push({ event, listeners });
  }
  var NORMALIZE_NEWLINES_REGEX = /\r\n?/g, NORMALIZE_NULL_AND_REPLACEMENT_REGEX = /\u0000|\uFFFD/g;
  function normalizeMarkupForTextOrAttribute(markup) {
    return ("string" === typeof markup ? markup : "" + markup).replace(NORMALIZE_NEWLINES_REGEX, "\n").replace(NORMALIZE_NULL_AND_REPLACEMENT_REGEX, "");
  }
  function checkForUnmatchedText(serverText, clientText) {
    clientText = normalizeMarkupForTextOrAttribute(clientText);
    return normalizeMarkupForTextOrAttribute(serverText) === clientText ? true : false;
  }
  function setProp(domElement, tag, key, value, props, prevValue) {
    switch (key) {
      case "children":
        "string" === typeof value ? "body" === tag || "textarea" === tag && "" === value || setTextContent(domElement, value) : ("number" === typeof value || "bigint" === typeof value) && "body" !== tag && setTextContent(domElement, "" + value);
        break;
      case "className":
        setValueForKnownAttribute(domElement, "class", value);
        break;
      case "tabIndex":
        setValueForKnownAttribute(domElement, "tabindex", value);
        break;
      case "dir":
      case "role":
      case "viewBox":
      case "width":
      case "height":
        setValueForKnownAttribute(domElement, key, value);
        break;
      case "style":
        setValueForStyles(domElement, value, prevValue);
        break;
      case "data":
        if ("object" !== tag) {
          setValueForKnownAttribute(domElement, "data", value);
          break;
        }
      case "src":
      case "href":
        if ("" === value && ("a" !== tag || "href" !== key)) {
          domElement.removeAttribute(key);
          break;
        }
        if (null == value || "function" === typeof value || "symbol" === typeof value || "boolean" === typeof value) {
          domElement.removeAttribute(key);
          break;
        }
        value = sanitizeURL("" + value);
        domElement.setAttribute(key, value);
        break;
      case "action":
      case "formAction":
        if ("function" === typeof value) {
          domElement.setAttribute(
            key,
            "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')"
          );
          break;
        } else
          "function" === typeof prevValue && ("formAction" === key ? ("input" !== tag && setProp(domElement, tag, "name", props.name, props, null), setProp(
            domElement,
            tag,
            "formEncType",
            props.formEncType,
            props,
            null
          ), setProp(
            domElement,
            tag,
            "formMethod",
            props.formMethod,
            props,
            null
          ), setProp(
            domElement,
            tag,
            "formTarget",
            props.formTarget,
            props,
            null
          )) : (setProp(domElement, tag, "encType", props.encType, props, null), setProp(domElement, tag, "method", props.method, props, null), setProp(domElement, tag, "target", props.target, props, null)));
        if (null == value || "symbol" === typeof value || "boolean" === typeof value) {
          domElement.removeAttribute(key);
          break;
        }
        value = sanitizeURL("" + value);
        domElement.setAttribute(key, value);
        break;
      case "onClick":
        null != value && (domElement.onclick = noop$1);
        break;
      case "onScroll":
        null != value && listenToNonDelegatedEvent("scroll", domElement);
        break;
      case "onScrollEnd":
        null != value && listenToNonDelegatedEvent("scrollend", domElement);
        break;
      case "dangerouslySetInnerHTML":
        if (null != value) {
          if ("object" !== typeof value || !("__html" in value))
            throw Error(formatProdErrorMessage(61));
          key = value.__html;
          if (null != key) {
            if (null != props.children) throw Error(formatProdErrorMessage(60));
            domElement.innerHTML = key;
          }
        }
        break;
      case "multiple":
        domElement.multiple = value && "function" !== typeof value && "symbol" !== typeof value;
        break;
      case "muted":
        domElement.muted = value && "function" !== typeof value && "symbol" !== typeof value;
        break;
      case "suppressContentEditableWarning":
      case "suppressHydrationWarning":
      case "defaultValue":
      case "defaultChecked":
      case "innerHTML":
      case "ref":
        break;
      case "autoFocus":
        break;
      case "xlinkHref":
        if (null == value || "function" === typeof value || "boolean" === typeof value || "symbol" === typeof value) {
          domElement.removeAttribute("xlink:href");
          break;
        }
        key = sanitizeURL("" + value);
        domElement.setAttributeNS(
          "http://www.w3.org/1999/xlink",
          "xlink:href",
          key
        );
        break;
      case "contentEditable":
      case "spellCheck":
      case "draggable":
      case "value":
      case "autoReverse":
      case "externalResourcesRequired":
      case "focusable":
      case "preserveAlpha":
        null != value && "function" !== typeof value && "symbol" !== typeof value ? domElement.setAttribute(key, "" + value) : domElement.removeAttribute(key);
        break;
      case "inert":
      case "allowFullScreen":
      case "async":
      case "autoPlay":
      case "controls":
      case "default":
      case "defer":
      case "disabled":
      case "disablePictureInPicture":
      case "disableRemotePlayback":
      case "formNoValidate":
      case "hidden":
      case "loop":
      case "noModule":
      case "noValidate":
      case "open":
      case "playsInline":
      case "readOnly":
      case "required":
      case "reversed":
      case "scoped":
      case "seamless":
      case "itemScope":
        value && "function" !== typeof value && "symbol" !== typeof value ? domElement.setAttribute(key, "") : domElement.removeAttribute(key);
        break;
      case "capture":
      case "download":
        true === value ? domElement.setAttribute(key, "") : false !== value && null != value && "function" !== typeof value && "symbol" !== typeof value ? domElement.setAttribute(key, value) : domElement.removeAttribute(key);
        break;
      case "cols":
      case "rows":
      case "size":
      case "span":
        null != value && "function" !== typeof value && "symbol" !== typeof value && !isNaN(value) && 1 <= value ? domElement.setAttribute(key, value) : domElement.removeAttribute(key);
        break;
      case "rowSpan":
      case "start":
        null == value || "function" === typeof value || "symbol" === typeof value || isNaN(value) ? domElement.removeAttribute(key) : domElement.setAttribute(key, value);
        break;
      case "popover":
        listenToNonDelegatedEvent("beforetoggle", domElement);
        listenToNonDelegatedEvent("toggle", domElement);
        setValueForAttribute(domElement, "popover", value);
        break;
      case "xlinkActuate":
        setValueForNamespacedAttribute(
          domElement,
          "http://www.w3.org/1999/xlink",
          "xlink:actuate",
          value
        );
        break;
      case "xlinkArcrole":
        setValueForNamespacedAttribute(
          domElement,
          "http://www.w3.org/1999/xlink",
          "xlink:arcrole",
          value
        );
        break;
      case "xlinkRole":
        setValueForNamespacedAttribute(
          domElement,
          "http://www.w3.org/1999/xlink",
          "xlink:role",
          value
        );
        break;
      case "xlinkShow":
        setValueForNamespacedAttribute(
          domElement,
          "http://www.w3.org/1999/xlink",
          "xlink:show",
          value
        );
        break;
      case "xlinkTitle":
        setValueForNamespacedAttribute(
          domElement,
          "http://www.w3.org/1999/xlink",
          "xlink:title",
          value
        );
        break;
      case "xlinkType":
        setValueForNamespacedAttribute(
          domElement,
          "http://www.w3.org/1999/xlink",
          "xlink:type",
          value
        );
        break;
      case "xmlBase":
        setValueForNamespacedAttribute(
          domElement,
          "http://www.w3.org/XML/1998/namespace",
          "xml:base",
          value
        );
        break;
      case "xmlLang":
        setValueForNamespacedAttribute(
          domElement,
          "http://www.w3.org/XML/1998/namespace",
          "xml:lang",
          value
        );
        break;
      case "xmlSpace":
        setValueForNamespacedAttribute(
          domElement,
          "http://www.w3.org/XML/1998/namespace",
          "xml:space",
          value
        );
        break;
      case "is":
        setValueForAttribute(domElement, "is", value);
        break;
      case "innerText":
      case "textContent":
        break;
      default:
        if (!(2 < key.length) || "o" !== key[0] && "O" !== key[0] || "n" !== key[1] && "N" !== key[1])
          key = aliases.get(key) || key, setValueForAttribute(domElement, key, value);
    }
  }
  function setPropOnCustomElement(domElement, tag, key, value, props, prevValue) {
    switch (key) {
      case "style":
        setValueForStyles(domElement, value, prevValue);
        break;
      case "dangerouslySetInnerHTML":
        if (null != value) {
          if ("object" !== typeof value || !("__html" in value))
            throw Error(formatProdErrorMessage(61));
          key = value.__html;
          if (null != key) {
            if (null != props.children) throw Error(formatProdErrorMessage(60));
            domElement.innerHTML = key;
          }
        }
        break;
      case "children":
        "string" === typeof value ? setTextContent(domElement, value) : ("number" === typeof value || "bigint" === typeof value) && setTextContent(domElement, "" + value);
        break;
      case "onScroll":
        null != value && listenToNonDelegatedEvent("scroll", domElement);
        break;
      case "onScrollEnd":
        null != value && listenToNonDelegatedEvent("scrollend", domElement);
        break;
      case "onClick":
        null != value && (domElement.onclick = noop$1);
        break;
      case "suppressContentEditableWarning":
      case "suppressHydrationWarning":
      case "innerHTML":
      case "ref":
        break;
      case "innerText":
      case "textContent":
        break;
      default:
        if (!registrationNameDependencies.hasOwnProperty(key))
          a: {
            if ("o" === key[0] && "n" === key[1] && (props = key.endsWith("Capture"), tag = key.slice(2, props ? key.length - 7 : void 0), prevValue = domElement[internalPropsKey] || null, prevValue = null != prevValue ? prevValue[key] : null, "function" === typeof prevValue && domElement.removeEventListener(tag, prevValue, props), "function" === typeof value)) {
              "function" !== typeof prevValue && null !== prevValue && (key in domElement ? domElement[key] = null : domElement.hasAttribute(key) && domElement.removeAttribute(key));
              domElement.addEventListener(tag, value, props);
              break a;
            }
            key in domElement ? domElement[key] = value : true === value ? domElement.setAttribute(key, "") : setValueForAttribute(domElement, key, value);
          }
    }
  }
  function setInitialProperties(domElement, tag, props) {
    switch (tag) {
      case "div":
      case "span":
      case "svg":
      case "path":
      case "a":
      case "g":
      case "p":
      case "li":
        break;
      case "img":
        listenToNonDelegatedEvent("error", domElement);
        listenToNonDelegatedEvent("load", domElement);
        var hasSrc = false, hasSrcSet = false, propKey;
        for (propKey in props)
          if (props.hasOwnProperty(propKey)) {
            var propValue = props[propKey];
            if (null != propValue)
              switch (propKey) {
                case "src":
                  hasSrc = true;
                  break;
                case "srcSet":
                  hasSrcSet = true;
                  break;
                case "children":
                case "dangerouslySetInnerHTML":
                  throw Error(formatProdErrorMessage(137, tag));
                default:
                  setProp(domElement, tag, propKey, propValue, props, null);
              }
          }
        hasSrcSet && setProp(domElement, tag, "srcSet", props.srcSet, props, null);
        hasSrc && setProp(domElement, tag, "src", props.src, props, null);
        return;
      case "input":
        listenToNonDelegatedEvent("invalid", domElement);
        var defaultValue = propKey = propValue = hasSrcSet = null, checked = null, defaultChecked = null;
        for (hasSrc in props)
          if (props.hasOwnProperty(hasSrc)) {
            var propValue$184 = props[hasSrc];
            if (null != propValue$184)
              switch (hasSrc) {
                case "name":
                  hasSrcSet = propValue$184;
                  break;
                case "type":
                  propValue = propValue$184;
                  break;
                case "checked":
                  checked = propValue$184;
                  break;
                case "defaultChecked":
                  defaultChecked = propValue$184;
                  break;
                case "value":
                  propKey = propValue$184;
                  break;
                case "defaultValue":
                  defaultValue = propValue$184;
                  break;
                case "children":
                case "dangerouslySetInnerHTML":
                  if (null != propValue$184)
                    throw Error(formatProdErrorMessage(137, tag));
                  break;
                default:
                  setProp(domElement, tag, hasSrc, propValue$184, props, null);
              }
          }
        initInput(
          domElement,
          propKey,
          defaultValue,
          checked,
          defaultChecked,
          propValue,
          hasSrcSet,
          false
        );
        return;
      case "select":
        listenToNonDelegatedEvent("invalid", domElement);
        hasSrc = propValue = propKey = null;
        for (hasSrcSet in props)
          if (props.hasOwnProperty(hasSrcSet) && (defaultValue = props[hasSrcSet], null != defaultValue))
            switch (hasSrcSet) {
              case "value":
                propKey = defaultValue;
                break;
              case "defaultValue":
                propValue = defaultValue;
                break;
              case "multiple":
                hasSrc = defaultValue;
              default:
                setProp(domElement, tag, hasSrcSet, defaultValue, props, null);
            }
        tag = propKey;
        props = propValue;
        domElement.multiple = !!hasSrc;
        null != tag ? updateOptions(domElement, !!hasSrc, tag, false) : null != props && updateOptions(domElement, !!hasSrc, props, true);
        return;
      case "textarea":
        listenToNonDelegatedEvent("invalid", domElement);
        propKey = hasSrcSet = hasSrc = null;
        for (propValue in props)
          if (props.hasOwnProperty(propValue) && (defaultValue = props[propValue], null != defaultValue))
            switch (propValue) {
              case "value":
                hasSrc = defaultValue;
                break;
              case "defaultValue":
                hasSrcSet = defaultValue;
                break;
              case "children":
                propKey = defaultValue;
                break;
              case "dangerouslySetInnerHTML":
                if (null != defaultValue) throw Error(formatProdErrorMessage(91));
                break;
              default:
                setProp(domElement, tag, propValue, defaultValue, props, null);
            }
        initTextarea(domElement, hasSrc, hasSrcSet, propKey);
        return;
      case "option":
        for (checked in props)
          if (props.hasOwnProperty(checked) && (hasSrc = props[checked], null != hasSrc))
            switch (checked) {
              case "selected":
                domElement.selected = hasSrc && "function" !== typeof hasSrc && "symbol" !== typeof hasSrc;
                break;
              default:
                setProp(domElement, tag, checked, hasSrc, props, null);
            }
        return;
      case "dialog":
        listenToNonDelegatedEvent("beforetoggle", domElement);
        listenToNonDelegatedEvent("toggle", domElement);
        listenToNonDelegatedEvent("cancel", domElement);
        listenToNonDelegatedEvent("close", domElement);
        break;
      case "iframe":
      case "object":
        listenToNonDelegatedEvent("load", domElement);
        break;
      case "video":
      case "audio":
        for (hasSrc = 0; hasSrc < mediaEventTypes.length; hasSrc++)
          listenToNonDelegatedEvent(mediaEventTypes[hasSrc], domElement);
        break;
      case "image":
        listenToNonDelegatedEvent("error", domElement);
        listenToNonDelegatedEvent("load", domElement);
        break;
      case "details":
        listenToNonDelegatedEvent("toggle", domElement);
        break;
      case "embed":
      case "source":
      case "link":
        listenToNonDelegatedEvent("error", domElement), listenToNonDelegatedEvent("load", domElement);
      case "area":
      case "base":
      case "br":
      case "col":
      case "hr":
      case "keygen":
      case "meta":
      case "param":
      case "track":
      case "wbr":
      case "menuitem":
        for (defaultChecked in props)
          if (props.hasOwnProperty(defaultChecked) && (hasSrc = props[defaultChecked], null != hasSrc))
            switch (defaultChecked) {
              case "children":
              case "dangerouslySetInnerHTML":
                throw Error(formatProdErrorMessage(137, tag));
              default:
                setProp(domElement, tag, defaultChecked, hasSrc, props, null);
            }
        return;
      default:
        if (isCustomElement(tag)) {
          for (propValue$184 in props)
            props.hasOwnProperty(propValue$184) && (hasSrc = props[propValue$184], void 0 !== hasSrc && setPropOnCustomElement(
              domElement,
              tag,
              propValue$184,
              hasSrc,
              props,
              void 0
            ));
          return;
        }
    }
    for (defaultValue in props)
      props.hasOwnProperty(defaultValue) && (hasSrc = props[defaultValue], null != hasSrc && setProp(domElement, tag, defaultValue, hasSrc, props, null));
  }
  function updateProperties(domElement, tag, lastProps, nextProps) {
    switch (tag) {
      case "div":
      case "span":
      case "svg":
      case "path":
      case "a":
      case "g":
      case "p":
      case "li":
        break;
      case "input":
        var name2 = null, type = null, value = null, defaultValue = null, lastDefaultValue = null, checked = null, defaultChecked = null;
        for (propKey in lastProps) {
          var lastProp = lastProps[propKey];
          if (lastProps.hasOwnProperty(propKey) && null != lastProp)
            switch (propKey) {
              case "checked":
                break;
              case "value":
                break;
              case "defaultValue":
                lastDefaultValue = lastProp;
              default:
                nextProps.hasOwnProperty(propKey) || setProp(domElement, tag, propKey, null, nextProps, lastProp);
            }
        }
        for (var propKey$201 in nextProps) {
          var propKey = nextProps[propKey$201];
          lastProp = lastProps[propKey$201];
          if (nextProps.hasOwnProperty(propKey$201) && (null != propKey || null != lastProp))
            switch (propKey$201) {
              case "type":
                type = propKey;
                break;
              case "name":
                name2 = propKey;
                break;
              case "checked":
                checked = propKey;
                break;
              case "defaultChecked":
                defaultChecked = propKey;
                break;
              case "value":
                value = propKey;
                break;
              case "defaultValue":
                defaultValue = propKey;
                break;
              case "children":
              case "dangerouslySetInnerHTML":
                if (null != propKey)
                  throw Error(formatProdErrorMessage(137, tag));
                break;
              default:
                propKey !== lastProp && setProp(
                  domElement,
                  tag,
                  propKey$201,
                  propKey,
                  nextProps,
                  lastProp
                );
            }
        }
        updateInput(
          domElement,
          value,
          defaultValue,
          lastDefaultValue,
          checked,
          defaultChecked,
          type,
          name2
        );
        return;
      case "select":
        propKey = value = defaultValue = propKey$201 = null;
        for (type in lastProps)
          if (lastDefaultValue = lastProps[type], lastProps.hasOwnProperty(type) && null != lastDefaultValue)
            switch (type) {
              case "value":
                break;
              case "multiple":
                propKey = lastDefaultValue;
              default:
                nextProps.hasOwnProperty(type) || setProp(
                  domElement,
                  tag,
                  type,
                  null,
                  nextProps,
                  lastDefaultValue
                );
            }
        for (name2 in nextProps)
          if (type = nextProps[name2], lastDefaultValue = lastProps[name2], nextProps.hasOwnProperty(name2) && (null != type || null != lastDefaultValue))
            switch (name2) {
              case "value":
                propKey$201 = type;
                break;
              case "defaultValue":
                defaultValue = type;
                break;
              case "multiple":
                value = type;
              default:
                type !== lastDefaultValue && setProp(
                  domElement,
                  tag,
                  name2,
                  type,
                  nextProps,
                  lastDefaultValue
                );
            }
        tag = defaultValue;
        lastProps = value;
        nextProps = propKey;
        null != propKey$201 ? updateOptions(domElement, !!lastProps, propKey$201, false) : !!nextProps !== !!lastProps && (null != tag ? updateOptions(domElement, !!lastProps, tag, true) : updateOptions(domElement, !!lastProps, lastProps ? [] : "", false));
        return;
      case "textarea":
        propKey = propKey$201 = null;
        for (defaultValue in lastProps)
          if (name2 = lastProps[defaultValue], lastProps.hasOwnProperty(defaultValue) && null != name2 && !nextProps.hasOwnProperty(defaultValue))
            switch (defaultValue) {
              case "value":
                break;
              case "children":
                break;
              default:
                setProp(domElement, tag, defaultValue, null, nextProps, name2);
            }
        for (value in nextProps)
          if (name2 = nextProps[value], type = lastProps[value], nextProps.hasOwnProperty(value) && (null != name2 || null != type))
            switch (value) {
              case "value":
                propKey$201 = name2;
                break;
              case "defaultValue":
                propKey = name2;
                break;
              case "children":
                break;
              case "dangerouslySetInnerHTML":
                if (null != name2) throw Error(formatProdErrorMessage(91));
                break;
              default:
                name2 !== type && setProp(domElement, tag, value, name2, nextProps, type);
            }
        updateTextarea(domElement, propKey$201, propKey);
        return;
      case "option":
        for (var propKey$217 in lastProps)
          if (propKey$201 = lastProps[propKey$217], lastProps.hasOwnProperty(propKey$217) && null != propKey$201 && !nextProps.hasOwnProperty(propKey$217))
            switch (propKey$217) {
              case "selected":
                domElement.selected = false;
                break;
              default:
                setProp(
                  domElement,
                  tag,
                  propKey$217,
                  null,
                  nextProps,
                  propKey$201
                );
            }
        for (lastDefaultValue in nextProps)
          if (propKey$201 = nextProps[lastDefaultValue], propKey = lastProps[lastDefaultValue], nextProps.hasOwnProperty(lastDefaultValue) && propKey$201 !== propKey && (null != propKey$201 || null != propKey))
            switch (lastDefaultValue) {
              case "selected":
                domElement.selected = propKey$201 && "function" !== typeof propKey$201 && "symbol" !== typeof propKey$201;
                break;
              default:
                setProp(
                  domElement,
                  tag,
                  lastDefaultValue,
                  propKey$201,
                  nextProps,
                  propKey
                );
            }
        return;
      case "img":
      case "link":
      case "area":
      case "base":
      case "br":
      case "col":
      case "embed":
      case "hr":
      case "keygen":
      case "meta":
      case "param":
      case "source":
      case "track":
      case "wbr":
      case "menuitem":
        for (var propKey$222 in lastProps)
          propKey$201 = lastProps[propKey$222], lastProps.hasOwnProperty(propKey$222) && null != propKey$201 && !nextProps.hasOwnProperty(propKey$222) && setProp(domElement, tag, propKey$222, null, nextProps, propKey$201);
        for (checked in nextProps)
          if (propKey$201 = nextProps[checked], propKey = lastProps[checked], nextProps.hasOwnProperty(checked) && propKey$201 !== propKey && (null != propKey$201 || null != propKey))
            switch (checked) {
              case "children":
              case "dangerouslySetInnerHTML":
                if (null != propKey$201)
                  throw Error(formatProdErrorMessage(137, tag));
                break;
              default:
                setProp(
                  domElement,
                  tag,
                  checked,
                  propKey$201,
                  nextProps,
                  propKey
                );
            }
        return;
      default:
        if (isCustomElement(tag)) {
          for (var propKey$227 in lastProps)
            propKey$201 = lastProps[propKey$227], lastProps.hasOwnProperty(propKey$227) && void 0 !== propKey$201 && !nextProps.hasOwnProperty(propKey$227) && setPropOnCustomElement(
              domElement,
              tag,
              propKey$227,
              void 0,
              nextProps,
              propKey$201
            );
          for (defaultChecked in nextProps)
            propKey$201 = nextProps[defaultChecked], propKey = lastProps[defaultChecked], !nextProps.hasOwnProperty(defaultChecked) || propKey$201 === propKey || void 0 === propKey$201 && void 0 === propKey || setPropOnCustomElement(
              domElement,
              tag,
              defaultChecked,
              propKey$201,
              nextProps,
              propKey
            );
          return;
        }
    }
    for (var propKey$232 in lastProps)
      propKey$201 = lastProps[propKey$232], lastProps.hasOwnProperty(propKey$232) && null != propKey$201 && !nextProps.hasOwnProperty(propKey$232) && setProp(domElement, tag, propKey$232, null, nextProps, propKey$201);
    for (lastProp in nextProps)
      propKey$201 = nextProps[lastProp], propKey = lastProps[lastProp], !nextProps.hasOwnProperty(lastProp) || propKey$201 === propKey || null == propKey$201 && null == propKey || setProp(domElement, tag, lastProp, propKey$201, nextProps, propKey);
  }
  function isLikelyStaticResource(initiatorType) {
    switch (initiatorType) {
      case "css":
      case "script":
      case "font":
      case "img":
      case "image":
      case "input":
      case "link":
        return true;
      default:
        return false;
    }
  }
  function estimateBandwidth() {
    if ("function" === typeof performance.getEntriesByType) {
      for (var count = 0, bits = 0, resourceEntries = performance.getEntriesByType("resource"), i = 0; i < resourceEntries.length; i++) {
        var entry = resourceEntries[i], transferSize = entry.transferSize, initiatorType = entry.initiatorType, duration = entry.duration;
        if (transferSize && duration && isLikelyStaticResource(initiatorType)) {
          initiatorType = 0;
          duration = entry.responseEnd;
          for (i += 1; i < resourceEntries.length; i++) {
            var overlapEntry = resourceEntries[i], overlapStartTime = overlapEntry.startTime;
            if (overlapStartTime > duration) break;
            var overlapTransferSize = overlapEntry.transferSize, overlapInitiatorType = overlapEntry.initiatorType;
            overlapTransferSize && isLikelyStaticResource(overlapInitiatorType) && (overlapEntry = overlapEntry.responseEnd, initiatorType += overlapTransferSize * (overlapEntry < duration ? 1 : (duration - overlapStartTime) / (overlapEntry - overlapStartTime)));
          }
          --i;
          bits += 8 * (transferSize + initiatorType) / (entry.duration / 1e3);
          count++;
          if (10 < count) break;
        }
      }
      if (0 < count) return bits / count / 1e6;
    }
    return navigator.connection && (count = navigator.connection.downlink, "number" === typeof count) ? count : 5;
  }
  var eventsEnabled = null, selectionInformation = null;
  function getOwnerDocumentFromRootContainer(rootContainerElement) {
    return 9 === rootContainerElement.nodeType ? rootContainerElement : rootContainerElement.ownerDocument;
  }
  function getOwnHostContext(namespaceURI) {
    switch (namespaceURI) {
      case "http://www.w3.org/2000/svg":
        return 1;
      case "http://www.w3.org/1998/Math/MathML":
        return 2;
      default:
        return 0;
    }
  }
  function getChildHostContextProd(parentNamespace, type) {
    if (0 === parentNamespace)
      switch (type) {
        case "svg":
          return 1;
        case "math":
          return 2;
        default:
          return 0;
      }
    return 1 === parentNamespace && "foreignObject" === type ? 0 : parentNamespace;
  }
  function shouldSetTextContent(type, props) {
    return "textarea" === type || "noscript" === type || "string" === typeof props.children || "number" === typeof props.children || "bigint" === typeof props.children || "object" === typeof props.dangerouslySetInnerHTML && null !== props.dangerouslySetInnerHTML && null != props.dangerouslySetInnerHTML.__html;
  }
  var currentPopstateTransitionEvent = null;
  function shouldAttemptEagerTransition() {
    var event = window.event;
    if (event && "popstate" === event.type) {
      if (event === currentPopstateTransitionEvent) return false;
      currentPopstateTransitionEvent = event;
      return true;
    }
    currentPopstateTransitionEvent = null;
    return false;
  }
  var scheduleTimeout = "function" === typeof setTimeout ? setTimeout : void 0, cancelTimeout = "function" === typeof clearTimeout ? clearTimeout : void 0, localPromise = "function" === typeof Promise ? Promise : void 0, scheduleMicrotask = "function" === typeof queueMicrotask ? queueMicrotask : "undefined" !== typeof localPromise ? function(callback) {
    return localPromise.resolve(null).then(callback).catch(handleErrorInNextTick);
  } : scheduleTimeout;
  function handleErrorInNextTick(error) {
    setTimeout(function() {
      throw error;
    });
  }
  function isSingletonScope(type) {
    return "head" === type;
  }
  function clearHydrationBoundary(parentInstance, hydrationInstance) {
    var node = hydrationInstance, depth = 0;
    do {
      var nextNode = node.nextSibling;
      parentInstance.removeChild(node);
      if (nextNode && 8 === nextNode.nodeType)
        if (node = nextNode.data, "/$" === node || "/&" === node) {
          if (0 === depth) {
            parentInstance.removeChild(nextNode);
            retryIfBlockedOn(hydrationInstance);
            return;
          }
          depth--;
        } else if ("$" === node || "$?" === node || "$~" === node || "$!" === node || "&" === node)
          depth++;
        else if ("html" === node)
          releaseSingletonInstance(parentInstance.ownerDocument.documentElement);
        else if ("head" === node) {
          node = parentInstance.ownerDocument.head;
          releaseSingletonInstance(node);
          for (var node$jscomp$0 = node.firstChild; node$jscomp$0; ) {
            var nextNode$jscomp$0 = node$jscomp$0.nextSibling, nodeName = node$jscomp$0.nodeName;
            node$jscomp$0[internalHoistableMarker] || "SCRIPT" === nodeName || "STYLE" === nodeName || "LINK" === nodeName && "stylesheet" === node$jscomp$0.rel.toLowerCase() || node.removeChild(node$jscomp$0);
            node$jscomp$0 = nextNode$jscomp$0;
          }
        } else
          "body" === node && releaseSingletonInstance(parentInstance.ownerDocument.body);
      node = nextNode;
    } while (node);
    retryIfBlockedOn(hydrationInstance);
  }
  function hideOrUnhideDehydratedBoundary(suspenseInstance, isHidden) {
    var node = suspenseInstance;
    suspenseInstance = 0;
    do {
      var nextNode = node.nextSibling;
      1 === node.nodeType ? isHidden ? (node._stashedDisplay = node.style.display, node.style.display = "none") : (node.style.display = node._stashedDisplay || "", "" === node.getAttribute("style") && node.removeAttribute("style")) : 3 === node.nodeType && (isHidden ? (node._stashedText = node.nodeValue, node.nodeValue = "") : node.nodeValue = node._stashedText || "");
      if (nextNode && 8 === nextNode.nodeType)
        if (node = nextNode.data, "/$" === node)
          if (0 === suspenseInstance) break;
          else suspenseInstance--;
        else
          "$" !== node && "$?" !== node && "$~" !== node && "$!" !== node || suspenseInstance++;
      node = nextNode;
    } while (node);
  }
  function clearContainerSparingly(container) {
    var nextNode = container.firstChild;
    nextNode && 10 === nextNode.nodeType && (nextNode = nextNode.nextSibling);
    for (; nextNode; ) {
      var node = nextNode;
      nextNode = nextNode.nextSibling;
      switch (node.nodeName) {
        case "HTML":
        case "HEAD":
        case "BODY":
          clearContainerSparingly(node);
          detachDeletedInstance(node);
          continue;
        case "SCRIPT":
        case "STYLE":
          continue;
        case "LINK":
          if ("stylesheet" === node.rel.toLowerCase()) continue;
      }
      container.removeChild(node);
    }
  }
  function canHydrateInstance(instance, type, props, inRootOrSingleton) {
    for (; 1 === instance.nodeType; ) {
      var anyProps = props;
      if (instance.nodeName.toLowerCase() !== type.toLowerCase()) {
        if (!inRootOrSingleton && ("INPUT" !== instance.nodeName || "hidden" !== instance.type))
          break;
      } else if (!inRootOrSingleton)
        if ("input" === type && "hidden" === instance.type) {
          var name2 = null == anyProps.name ? null : "" + anyProps.name;
          if ("hidden" === anyProps.type && instance.getAttribute("name") === name2)
            return instance;
        } else return instance;
      else if (!instance[internalHoistableMarker])
        switch (type) {
          case "meta":
            if (!instance.hasAttribute("itemprop")) break;
            return instance;
          case "link":
            name2 = instance.getAttribute("rel");
            if ("stylesheet" === name2 && instance.hasAttribute("data-precedence"))
              break;
            else if (name2 !== anyProps.rel || instance.getAttribute("href") !== (null == anyProps.href || "" === anyProps.href ? null : anyProps.href) || instance.getAttribute("crossorigin") !== (null == anyProps.crossOrigin ? null : anyProps.crossOrigin) || instance.getAttribute("title") !== (null == anyProps.title ? null : anyProps.title))
              break;
            return instance;
          case "style":
            if (instance.hasAttribute("data-precedence")) break;
            return instance;
          case "script":
            name2 = instance.getAttribute("src");
            if ((name2 !== (null == anyProps.src ? null : anyProps.src) || instance.getAttribute("type") !== (null == anyProps.type ? null : anyProps.type) || instance.getAttribute("crossorigin") !== (null == anyProps.crossOrigin ? null : anyProps.crossOrigin)) && name2 && instance.hasAttribute("async") && !instance.hasAttribute("itemprop"))
              break;
            return instance;
          default:
            return instance;
        }
      instance = getNextHydratable(instance.nextSibling);
      if (null === instance) break;
    }
    return null;
  }
  function canHydrateTextInstance(instance, text, inRootOrSingleton) {
    if ("" === text) return null;
    for (; 3 !== instance.nodeType; ) {
      if ((1 !== instance.nodeType || "INPUT" !== instance.nodeName || "hidden" !== instance.type) && !inRootOrSingleton)
        return null;
      instance = getNextHydratable(instance.nextSibling);
      if (null === instance) return null;
    }
    return instance;
  }
  function canHydrateHydrationBoundary(instance, inRootOrSingleton) {
    for (; 8 !== instance.nodeType; ) {
      if ((1 !== instance.nodeType || "INPUT" !== instance.nodeName || "hidden" !== instance.type) && !inRootOrSingleton)
        return null;
      instance = getNextHydratable(instance.nextSibling);
      if (null === instance) return null;
    }
    return instance;
  }
  function isSuspenseInstancePending(instance) {
    return "$?" === instance.data || "$~" === instance.data;
  }
  function isSuspenseInstanceFallback(instance) {
    return "$!" === instance.data || "$?" === instance.data && "loading" !== instance.ownerDocument.readyState;
  }
  function registerSuspenseInstanceRetry(instance, callback) {
    var ownerDocument = instance.ownerDocument;
    if ("$~" === instance.data) instance._reactRetry = callback;
    else if ("$?" !== instance.data || "loading" !== ownerDocument.readyState)
      callback();
    else {
      var listener = function() {
        callback();
        ownerDocument.removeEventListener("DOMContentLoaded", listener);
      };
      ownerDocument.addEventListener("DOMContentLoaded", listener);
      instance._reactRetry = listener;
    }
  }
  function getNextHydratable(node) {
    for (; null != node; node = node.nextSibling) {
      var nodeType = node.nodeType;
      if (1 === nodeType || 3 === nodeType) break;
      if (8 === nodeType) {
        nodeType = node.data;
        if ("$" === nodeType || "$!" === nodeType || "$?" === nodeType || "$~" === nodeType || "&" === nodeType || "F!" === nodeType || "F" === nodeType)
          break;
        if ("/$" === nodeType || "/&" === nodeType) return null;
      }
    }
    return node;
  }
  var previousHydratableOnEnteringScopedSingleton = null;
  function getNextHydratableInstanceAfterHydrationBoundary(hydrationInstance) {
    hydrationInstance = hydrationInstance.nextSibling;
    for (var depth = 0; hydrationInstance; ) {
      if (8 === hydrationInstance.nodeType) {
        var data = hydrationInstance.data;
        if ("/$" === data || "/&" === data) {
          if (0 === depth)
            return getNextHydratable(hydrationInstance.nextSibling);
          depth--;
        } else
          "$" !== data && "$!" !== data && "$?" !== data && "$~" !== data && "&" !== data || depth++;
      }
      hydrationInstance = hydrationInstance.nextSibling;
    }
    return null;
  }
  function getParentHydrationBoundary(targetInstance) {
    targetInstance = targetInstance.previousSibling;
    for (var depth = 0; targetInstance; ) {
      if (8 === targetInstance.nodeType) {
        var data = targetInstance.data;
        if ("$" === data || "$!" === data || "$?" === data || "$~" === data || "&" === data) {
          if (0 === depth) return targetInstance;
          depth--;
        } else "/$" !== data && "/&" !== data || depth++;
      }
      targetInstance = targetInstance.previousSibling;
    }
    return null;
  }
  function resolveSingletonInstance(type, props, rootContainerInstance) {
    props = getOwnerDocumentFromRootContainer(rootContainerInstance);
    switch (type) {
      case "html":
        type = props.documentElement;
        if (!type) throw Error(formatProdErrorMessage(452));
        return type;
      case "head":
        type = props.head;
        if (!type) throw Error(formatProdErrorMessage(453));
        return type;
      case "body":
        type = props.body;
        if (!type) throw Error(formatProdErrorMessage(454));
        return type;
      default:
        throw Error(formatProdErrorMessage(451));
    }
  }
  function releaseSingletonInstance(instance) {
    for (var attributes = instance.attributes; attributes.length; )
      instance.removeAttributeNode(attributes[0]);
    detachDeletedInstance(instance);
  }
  var preloadPropsMap = /* @__PURE__ */ new Map(), preconnectsSet = /* @__PURE__ */ new Set();
  function getHoistableRoot(container) {
    return "function" === typeof container.getRootNode ? container.getRootNode() : 9 === container.nodeType ? container : container.ownerDocument;
  }
  var previousDispatcher = ReactDOMSharedInternals.d;
  ReactDOMSharedInternals.d = {
    f: flushSyncWork,
    r: requestFormReset,
    D: prefetchDNS,
    C: preconnect,
    L: preload,
    m: preloadModule,
    X: preinitScript,
    S: preinitStyle,
    M: preinitModuleScript
  };
  function flushSyncWork() {
    var previousWasRendering = previousDispatcher.f(), wasRendering = flushSyncWork$1();
    return previousWasRendering || wasRendering;
  }
  function requestFormReset(form) {
    var formInst = getInstanceFromNode(form);
    null !== formInst && 5 === formInst.tag && "form" === formInst.type ? requestFormReset$1(formInst) : previousDispatcher.r(form);
  }
  var globalDocument = "undefined" === typeof document ? null : document;
  function preconnectAs(rel, href, crossOrigin) {
    var ownerDocument = globalDocument;
    if (ownerDocument && "string" === typeof href && href) {
      var limitedEscapedHref = escapeSelectorAttributeValueInsideDoubleQuotes(href);
      limitedEscapedHref = 'link[rel="' + rel + '"][href="' + limitedEscapedHref + '"]';
      "string" === typeof crossOrigin && (limitedEscapedHref += '[crossorigin="' + crossOrigin + '"]');
      preconnectsSet.has(limitedEscapedHref) || (preconnectsSet.add(limitedEscapedHref), rel = { rel, crossOrigin, href }, null === ownerDocument.querySelector(limitedEscapedHref) && (href = ownerDocument.createElement("link"), setInitialProperties(href, "link", rel), markNodeAsHoistable(href), ownerDocument.head.appendChild(href)));
    }
  }
  function prefetchDNS(href) {
    previousDispatcher.D(href);
    preconnectAs("dns-prefetch", href, null);
  }
  function preconnect(href, crossOrigin) {
    previousDispatcher.C(href, crossOrigin);
    preconnectAs("preconnect", href, crossOrigin);
  }
  function preload(href, as, options2) {
    previousDispatcher.L(href, as, options2);
    var ownerDocument = globalDocument;
    if (ownerDocument && href && as) {
      var preloadSelector = 'link[rel="preload"][as="' + escapeSelectorAttributeValueInsideDoubleQuotes(as) + '"]';
      "image" === as ? options2 && options2.imageSrcSet ? (preloadSelector += '[imagesrcset="' + escapeSelectorAttributeValueInsideDoubleQuotes(
        options2.imageSrcSet
      ) + '"]', "string" === typeof options2.imageSizes && (preloadSelector += '[imagesizes="' + escapeSelectorAttributeValueInsideDoubleQuotes(
        options2.imageSizes
      ) + '"]')) : preloadSelector += '[href="' + escapeSelectorAttributeValueInsideDoubleQuotes(href) + '"]' : preloadSelector += '[href="' + escapeSelectorAttributeValueInsideDoubleQuotes(href) + '"]';
      var key = preloadSelector;
      switch (as) {
        case "style":
          key = getStyleKey(href);
          break;
        case "script":
          key = getScriptKey(href);
      }
      preloadPropsMap.has(key) || (href = assign(
        {
          rel: "preload",
          href: "image" === as && options2 && options2.imageSrcSet ? void 0 : href,
          as
        },
        options2
      ), preloadPropsMap.set(key, href), null !== ownerDocument.querySelector(preloadSelector) || "style" === as && ownerDocument.querySelector(getStylesheetSelectorFromKey(key)) || "script" === as && ownerDocument.querySelector(getScriptSelectorFromKey(key)) || (as = ownerDocument.createElement("link"), setInitialProperties(as, "link", href), markNodeAsHoistable(as), ownerDocument.head.appendChild(as)));
    }
  }
  function preloadModule(href, options2) {
    previousDispatcher.m(href, options2);
    var ownerDocument = globalDocument;
    if (ownerDocument && href) {
      var as = options2 && "string" === typeof options2.as ? options2.as : "script", preloadSelector = 'link[rel="modulepreload"][as="' + escapeSelectorAttributeValueInsideDoubleQuotes(as) + '"][href="' + escapeSelectorAttributeValueInsideDoubleQuotes(href) + '"]', key = preloadSelector;
      switch (as) {
        case "audioworklet":
        case "paintworklet":
        case "serviceworker":
        case "sharedworker":
        case "worker":
        case "script":
          key = getScriptKey(href);
      }
      if (!preloadPropsMap.has(key) && (href = assign({ rel: "modulepreload", href }, options2), preloadPropsMap.set(key, href), null === ownerDocument.querySelector(preloadSelector))) {
        switch (as) {
          case "audioworklet":
          case "paintworklet":
          case "serviceworker":
          case "sharedworker":
          case "worker":
          case "script":
            if (ownerDocument.querySelector(getScriptSelectorFromKey(key)))
              return;
        }
        as = ownerDocument.createElement("link");
        setInitialProperties(as, "link", href);
        markNodeAsHoistable(as);
        ownerDocument.head.appendChild(as);
      }
    }
  }
  function preinitStyle(href, precedence, options2) {
    previousDispatcher.S(href, precedence, options2);
    var ownerDocument = globalDocument;
    if (ownerDocument && href) {
      var styles = getResourcesFromRoot(ownerDocument).hoistableStyles, key = getStyleKey(href);
      precedence = precedence || "default";
      var resource = styles.get(key);
      if (!resource) {
        var state = { loading: 0, preload: null };
        if (resource = ownerDocument.querySelector(
          getStylesheetSelectorFromKey(key)
        ))
          state.loading = 5;
        else {
          href = assign(
            { rel: "stylesheet", href, "data-precedence": precedence },
            options2
          );
          (options2 = preloadPropsMap.get(key)) && adoptPreloadPropsForStylesheet(href, options2);
          var link = resource = ownerDocument.createElement("link");
          markNodeAsHoistable(link);
          setInitialProperties(link, "link", href);
          link._p = new Promise(function(resolve, reject) {
            link.onload = resolve;
            link.onerror = reject;
          });
          link.addEventListener("load", function() {
            state.loading |= 1;
          });
          link.addEventListener("error", function() {
            state.loading |= 2;
          });
          state.loading |= 4;
          insertStylesheet(resource, precedence, ownerDocument);
        }
        resource = {
          type: "stylesheet",
          instance: resource,
          count: 1,
          state
        };
        styles.set(key, resource);
      }
    }
  }
  function preinitScript(src, options2) {
    previousDispatcher.X(src, options2);
    var ownerDocument = globalDocument;
    if (ownerDocument && src) {
      var scripts = getResourcesFromRoot(ownerDocument).hoistableScripts, key = getScriptKey(src), resource = scripts.get(key);
      resource || (resource = ownerDocument.querySelector(getScriptSelectorFromKey(key)), resource || (src = assign({ src, async: true }, options2), (options2 = preloadPropsMap.get(key)) && adoptPreloadPropsForScript(src, options2), resource = ownerDocument.createElement("script"), markNodeAsHoistable(resource), setInitialProperties(resource, "link", src), ownerDocument.head.appendChild(resource)), resource = {
        type: "script",
        instance: resource,
        count: 1,
        state: null
      }, scripts.set(key, resource));
    }
  }
  function preinitModuleScript(src, options2) {
    previousDispatcher.M(src, options2);
    var ownerDocument = globalDocument;
    if (ownerDocument && src) {
      var scripts = getResourcesFromRoot(ownerDocument).hoistableScripts, key = getScriptKey(src), resource = scripts.get(key);
      resource || (resource = ownerDocument.querySelector(getScriptSelectorFromKey(key)), resource || (src = assign({ src, async: true, type: "module" }, options2), (options2 = preloadPropsMap.get(key)) && adoptPreloadPropsForScript(src, options2), resource = ownerDocument.createElement("script"), markNodeAsHoistable(resource), setInitialProperties(resource, "link", src), ownerDocument.head.appendChild(resource)), resource = {
        type: "script",
        instance: resource,
        count: 1,
        state: null
      }, scripts.set(key, resource));
    }
  }
  function getResource(type, currentProps, pendingProps, currentResource) {
    var JSCompiler_inline_result = (JSCompiler_inline_result = rootInstanceStackCursor.current) ? getHoistableRoot(JSCompiler_inline_result) : null;
    if (!JSCompiler_inline_result) throw Error(formatProdErrorMessage(446));
    switch (type) {
      case "meta":
      case "title":
        return null;
      case "style":
        return "string" === typeof pendingProps.precedence && "string" === typeof pendingProps.href ? (currentProps = getStyleKey(pendingProps.href), pendingProps = getResourcesFromRoot(
          JSCompiler_inline_result
        ).hoistableStyles, currentResource = pendingProps.get(currentProps), currentResource || (currentResource = {
          type: "style",
          instance: null,
          count: 0,
          state: null
        }, pendingProps.set(currentProps, currentResource)), currentResource) : { type: "void", instance: null, count: 0, state: null };
      case "link":
        if ("stylesheet" === pendingProps.rel && "string" === typeof pendingProps.href && "string" === typeof pendingProps.precedence) {
          type = getStyleKey(pendingProps.href);
          var styles$243 = getResourcesFromRoot(
            JSCompiler_inline_result
          ).hoistableStyles, resource$244 = styles$243.get(type);
          resource$244 || (JSCompiler_inline_result = JSCompiler_inline_result.ownerDocument || JSCompiler_inline_result, resource$244 = {
            type: "stylesheet",
            instance: null,
            count: 0,
            state: { loading: 0, preload: null }
          }, styles$243.set(type, resource$244), (styles$243 = JSCompiler_inline_result.querySelector(
            getStylesheetSelectorFromKey(type)
          )) && !styles$243._p && (resource$244.instance = styles$243, resource$244.state.loading = 5), preloadPropsMap.has(type) || (pendingProps = {
            rel: "preload",
            as: "style",
            href: pendingProps.href,
            crossOrigin: pendingProps.crossOrigin,
            integrity: pendingProps.integrity,
            media: pendingProps.media,
            hrefLang: pendingProps.hrefLang,
            referrerPolicy: pendingProps.referrerPolicy
          }, preloadPropsMap.set(type, pendingProps), styles$243 || preloadStylesheet(
            JSCompiler_inline_result,
            type,
            pendingProps,
            resource$244.state
          )));
          if (currentProps && null === currentResource)
            throw Error(formatProdErrorMessage(528, ""));
          return resource$244;
        }
        if (currentProps && null !== currentResource)
          throw Error(formatProdErrorMessage(529, ""));
        return null;
      case "script":
        return currentProps = pendingProps.async, pendingProps = pendingProps.src, "string" === typeof pendingProps && currentProps && "function" !== typeof currentProps && "symbol" !== typeof currentProps ? (currentProps = getScriptKey(pendingProps), pendingProps = getResourcesFromRoot(
          JSCompiler_inline_result
        ).hoistableScripts, currentResource = pendingProps.get(currentProps), currentResource || (currentResource = {
          type: "script",
          instance: null,
          count: 0,
          state: null
        }, pendingProps.set(currentProps, currentResource)), currentResource) : { type: "void", instance: null, count: 0, state: null };
      default:
        throw Error(formatProdErrorMessage(444, type));
    }
  }
  function getStyleKey(href) {
    return 'href="' + escapeSelectorAttributeValueInsideDoubleQuotes(href) + '"';
  }
  function getStylesheetSelectorFromKey(key) {
    return 'link[rel="stylesheet"][' + key + "]";
  }
  function stylesheetPropsFromRawProps(rawProps) {
    return assign({}, rawProps, {
      "data-precedence": rawProps.precedence,
      precedence: null
    });
  }
  function preloadStylesheet(ownerDocument, key, preloadProps, state) {
    ownerDocument.querySelector('link[rel="preload"][as="style"][' + key + "]") ? state.loading = 1 : (key = ownerDocument.createElement("link"), state.preload = key, key.addEventListener("load", function() {
      return state.loading |= 1;
    }), key.addEventListener("error", function() {
      return state.loading |= 2;
    }), setInitialProperties(key, "link", preloadProps), markNodeAsHoistable(key), ownerDocument.head.appendChild(key));
  }
  function getScriptKey(src) {
    return '[src="' + escapeSelectorAttributeValueInsideDoubleQuotes(src) + '"]';
  }
  function getScriptSelectorFromKey(key) {
    return "script[async]" + key;
  }
  function acquireResource(hoistableRoot, resource, props) {
    resource.count++;
    if (null === resource.instance)
      switch (resource.type) {
        case "style":
          var instance = hoistableRoot.querySelector(
            'style[data-href~="' + escapeSelectorAttributeValueInsideDoubleQuotes(props.href) + '"]'
          );
          if (instance)
            return resource.instance = instance, markNodeAsHoistable(instance), instance;
          var styleProps = assign({}, props, {
            "data-href": props.href,
            "data-precedence": props.precedence,
            href: null,
            precedence: null
          });
          instance = (hoistableRoot.ownerDocument || hoistableRoot).createElement(
            "style"
          );
          markNodeAsHoistable(instance);
          setInitialProperties(instance, "style", styleProps);
          insertStylesheet(instance, props.precedence, hoistableRoot);
          return resource.instance = instance;
        case "stylesheet":
          styleProps = getStyleKey(props.href);
          var instance$249 = hoistableRoot.querySelector(
            getStylesheetSelectorFromKey(styleProps)
          );
          if (instance$249)
            return resource.state.loading |= 4, resource.instance = instance$249, markNodeAsHoistable(instance$249), instance$249;
          instance = stylesheetPropsFromRawProps(props);
          (styleProps = preloadPropsMap.get(styleProps)) && adoptPreloadPropsForStylesheet(instance, styleProps);
          instance$249 = (hoistableRoot.ownerDocument || hoistableRoot).createElement("link");
          markNodeAsHoistable(instance$249);
          var linkInstance = instance$249;
          linkInstance._p = new Promise(function(resolve, reject) {
            linkInstance.onload = resolve;
            linkInstance.onerror = reject;
          });
          setInitialProperties(instance$249, "link", instance);
          resource.state.loading |= 4;
          insertStylesheet(instance$249, props.precedence, hoistableRoot);
          return resource.instance = instance$249;
        case "script":
          instance$249 = getScriptKey(props.src);
          if (styleProps = hoistableRoot.querySelector(
            getScriptSelectorFromKey(instance$249)
          ))
            return resource.instance = styleProps, markNodeAsHoistable(styleProps), styleProps;
          instance = props;
          if (styleProps = preloadPropsMap.get(instance$249))
            instance = assign({}, props), adoptPreloadPropsForScript(instance, styleProps);
          hoistableRoot = hoistableRoot.ownerDocument || hoistableRoot;
          styleProps = hoistableRoot.createElement("script");
          markNodeAsHoistable(styleProps);
          setInitialProperties(styleProps, "link", instance);
          hoistableRoot.head.appendChild(styleProps);
          return resource.instance = styleProps;
        case "void":
          return null;
        default:
          throw Error(formatProdErrorMessage(443, resource.type));
      }
    else
      "stylesheet" === resource.type && 0 === (resource.state.loading & 4) && (instance = resource.instance, resource.state.loading |= 4, insertStylesheet(instance, props.precedence, hoistableRoot));
    return resource.instance;
  }
  function insertStylesheet(instance, precedence, root3) {
    for (var nodes = root3.querySelectorAll(
      'link[rel="stylesheet"][data-precedence],style[data-precedence]'
    ), last = nodes.length ? nodes[nodes.length - 1] : null, prior = last, i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      if (node.dataset.precedence === precedence) prior = node;
      else if (prior !== last) break;
    }
    prior ? prior.parentNode.insertBefore(instance, prior.nextSibling) : (precedence = 9 === root3.nodeType ? root3.head : root3, precedence.insertBefore(instance, precedence.firstChild));
  }
  function adoptPreloadPropsForStylesheet(stylesheetProps, preloadProps) {
    null == stylesheetProps.crossOrigin && (stylesheetProps.crossOrigin = preloadProps.crossOrigin);
    null == stylesheetProps.referrerPolicy && (stylesheetProps.referrerPolicy = preloadProps.referrerPolicy);
    null == stylesheetProps.title && (stylesheetProps.title = preloadProps.title);
  }
  function adoptPreloadPropsForScript(scriptProps, preloadProps) {
    null == scriptProps.crossOrigin && (scriptProps.crossOrigin = preloadProps.crossOrigin);
    null == scriptProps.referrerPolicy && (scriptProps.referrerPolicy = preloadProps.referrerPolicy);
    null == scriptProps.integrity && (scriptProps.integrity = preloadProps.integrity);
  }
  var tagCaches = null;
  function getHydratableHoistableCache(type, keyAttribute, ownerDocument) {
    if (null === tagCaches) {
      var cache = /* @__PURE__ */ new Map();
      var caches = tagCaches = /* @__PURE__ */ new Map();
      caches.set(ownerDocument, cache);
    } else
      caches = tagCaches, cache = caches.get(ownerDocument), cache || (cache = /* @__PURE__ */ new Map(), caches.set(ownerDocument, cache));
    if (cache.has(type)) return cache;
    cache.set(type, null);
    ownerDocument = ownerDocument.getElementsByTagName(type);
    for (caches = 0; caches < ownerDocument.length; caches++) {
      var node = ownerDocument[caches];
      if (!(node[internalHoistableMarker] || node[internalInstanceKey] || "link" === type && "stylesheet" === node.getAttribute("rel")) && "http://www.w3.org/2000/svg" !== node.namespaceURI) {
        var nodeKey = node.getAttribute(keyAttribute) || "";
        nodeKey = type + nodeKey;
        var existing = cache.get(nodeKey);
        existing ? existing.push(node) : cache.set(nodeKey, [node]);
      }
    }
    return cache;
  }
  function mountHoistable(hoistableRoot, type, instance) {
    hoistableRoot = hoistableRoot.ownerDocument || hoistableRoot;
    hoistableRoot.head.insertBefore(
      instance,
      "title" === type ? hoistableRoot.querySelector("head > title") : null
    );
  }
  function isHostHoistableType(type, props, hostContext) {
    if (1 === hostContext || null != props.itemProp) return false;
    switch (type) {
      case "meta":
      case "title":
        return true;
      case "style":
        if ("string" !== typeof props.precedence || "string" !== typeof props.href || "" === props.href)
          break;
        return true;
      case "link":
        if ("string" !== typeof props.rel || "string" !== typeof props.href || "" === props.href || props.onLoad || props.onError)
          break;
        switch (props.rel) {
          case "stylesheet":
            return type = props.disabled, "string" === typeof props.precedence && null == type;
          default:
            return true;
        }
      case "script":
        if (props.async && "function" !== typeof props.async && "symbol" !== typeof props.async && !props.onLoad && !props.onError && props.src && "string" === typeof props.src)
          return true;
    }
    return false;
  }
  function preloadResource(resource) {
    return "stylesheet" === resource.type && 0 === (resource.state.loading & 3) ? false : true;
  }
  function suspendResource(state, hoistableRoot, resource, props) {
    if ("stylesheet" === resource.type && ("string" !== typeof props.media || false !== matchMedia(props.media).matches) && 0 === (resource.state.loading & 4)) {
      if (null === resource.instance) {
        var key = getStyleKey(props.href), instance = hoistableRoot.querySelector(
          getStylesheetSelectorFromKey(key)
        );
        if (instance) {
          hoistableRoot = instance._p;
          null !== hoistableRoot && "object" === typeof hoistableRoot && "function" === typeof hoistableRoot.then && (state.count++, state = onUnsuspend.bind(state), hoistableRoot.then(state, state));
          resource.state.loading |= 4;
          resource.instance = instance;
          markNodeAsHoistable(instance);
          return;
        }
        instance = hoistableRoot.ownerDocument || hoistableRoot;
        props = stylesheetPropsFromRawProps(props);
        (key = preloadPropsMap.get(key)) && adoptPreloadPropsForStylesheet(props, key);
        instance = instance.createElement("link");
        markNodeAsHoistable(instance);
        var linkInstance = instance;
        linkInstance._p = new Promise(function(resolve, reject) {
          linkInstance.onload = resolve;
          linkInstance.onerror = reject;
        });
        setInitialProperties(instance, "link", props);
        resource.instance = instance;
      }
      null === state.stylesheets && (state.stylesheets = /* @__PURE__ */ new Map());
      state.stylesheets.set(resource, hoistableRoot);
      (hoistableRoot = resource.state.preload) && 0 === (resource.state.loading & 3) && (state.count++, resource = onUnsuspend.bind(state), hoistableRoot.addEventListener("load", resource), hoistableRoot.addEventListener("error", resource));
    }
  }
  var estimatedBytesWithinLimit = 0;
  function waitForCommitToBeReady(state, timeoutOffset) {
    state.stylesheets && 0 === state.count && insertSuspendedStylesheets(state, state.stylesheets);
    return 0 < state.count || 0 < state.imgCount ? function(commit) {
      var stylesheetTimer = setTimeout(function() {
        state.stylesheets && insertSuspendedStylesheets(state, state.stylesheets);
        if (state.unsuspend) {
          var unsuspend = state.unsuspend;
          state.unsuspend = null;
          unsuspend();
        }
      }, 6e4 + timeoutOffset);
      0 < state.imgBytes && 0 === estimatedBytesWithinLimit && (estimatedBytesWithinLimit = 62500 * estimateBandwidth());
      var imgTimer = setTimeout(
        function() {
          state.waitingForImages = false;
          if (0 === state.count && (state.stylesheets && insertSuspendedStylesheets(state, state.stylesheets), state.unsuspend)) {
            var unsuspend = state.unsuspend;
            state.unsuspend = null;
            unsuspend();
          }
        },
        (state.imgBytes > estimatedBytesWithinLimit ? 50 : 800) + timeoutOffset
      );
      state.unsuspend = commit;
      return function() {
        state.unsuspend = null;
        clearTimeout(stylesheetTimer);
        clearTimeout(imgTimer);
      };
    } : null;
  }
  function onUnsuspend() {
    this.count--;
    if (0 === this.count && (0 === this.imgCount || !this.waitingForImages)) {
      if (this.stylesheets) insertSuspendedStylesheets(this, this.stylesheets);
      else if (this.unsuspend) {
        var unsuspend = this.unsuspend;
        this.unsuspend = null;
        unsuspend();
      }
    }
  }
  var precedencesByRoot = null;
  function insertSuspendedStylesheets(state, resources) {
    state.stylesheets = null;
    null !== state.unsuspend && (state.count++, precedencesByRoot = /* @__PURE__ */ new Map(), resources.forEach(insertStylesheetIntoRoot, state), precedencesByRoot = null, onUnsuspend.call(state));
  }
  function insertStylesheetIntoRoot(root3, resource) {
    if (!(resource.state.loading & 4)) {
      var precedences = precedencesByRoot.get(root3);
      if (precedences) var last = precedences.get(null);
      else {
        precedences = /* @__PURE__ */ new Map();
        precedencesByRoot.set(root3, precedences);
        for (var nodes = root3.querySelectorAll(
          "link[data-precedence],style[data-precedence]"
        ), i = 0; i < nodes.length; i++) {
          var node = nodes[i];
          if ("LINK" === node.nodeName || "not all" !== node.getAttribute("media"))
            precedences.set(node.dataset.precedence, node), last = node;
        }
        last && precedences.set(null, last);
      }
      nodes = resource.instance;
      node = nodes.getAttribute("data-precedence");
      i = precedences.get(node) || last;
      i === last && precedences.set(null, nodes);
      precedences.set(node, nodes);
      this.count++;
      last = onUnsuspend.bind(this);
      nodes.addEventListener("load", last);
      nodes.addEventListener("error", last);
      i ? i.parentNode.insertBefore(nodes, i.nextSibling) : (root3 = 9 === root3.nodeType ? root3.head : root3, root3.insertBefore(nodes, root3.firstChild));
      resource.state.loading |= 4;
    }
  }
  var HostTransitionContext = {
    $$typeof: REACT_CONTEXT_TYPE,
    Provider: null,
    Consumer: null,
    _currentValue: sharedNotPendingObject,
    _currentValue2: sharedNotPendingObject,
    _threadCount: 0
  };
  function FiberRootNode(containerInfo, tag, hydrate, identifierPrefix, onUncaughtError, onCaughtError, onRecoverableError, onDefaultTransitionIndicator, formState) {
    this.tag = 1;
    this.containerInfo = containerInfo;
    this.pingCache = this.current = this.pendingChildren = null;
    this.timeoutHandle = -1;
    this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null;
    this.callbackPriority = 0;
    this.expirationTimes = createLaneMap(-1);
    this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0;
    this.entanglements = createLaneMap(0);
    this.hiddenUpdates = createLaneMap(null);
    this.identifierPrefix = identifierPrefix;
    this.onUncaughtError = onUncaughtError;
    this.onCaughtError = onCaughtError;
    this.onRecoverableError = onRecoverableError;
    this.pooledCache = null;
    this.pooledCacheLanes = 0;
    this.formState = formState;
    this.incompleteTransitions = /* @__PURE__ */ new Map();
  }
  function createFiberRoot(containerInfo, tag, hydrate, initialChildren, hydrationCallbacks, isStrictMode, identifierPrefix, formState, onUncaughtError, onCaughtError, onRecoverableError, onDefaultTransitionIndicator) {
    containerInfo = new FiberRootNode(
      containerInfo,
      tag,
      hydrate,
      identifierPrefix,
      onUncaughtError,
      onCaughtError,
      onRecoverableError,
      onDefaultTransitionIndicator,
      formState
    );
    tag = 1;
    true === isStrictMode && (tag |= 24);
    isStrictMode = createFiberImplClass(3, null, null, tag);
    containerInfo.current = isStrictMode;
    isStrictMode.stateNode = containerInfo;
    tag = createCache();
    tag.refCount++;
    containerInfo.pooledCache = tag;
    tag.refCount++;
    isStrictMode.memoizedState = {
      element: initialChildren,
      isDehydrated: hydrate,
      cache: tag
    };
    initializeUpdateQueue(isStrictMode);
    return containerInfo;
  }
  function getContextForSubtree(parentComponent) {
    if (!parentComponent) return emptyContextObject;
    parentComponent = emptyContextObject;
    return parentComponent;
  }
  function updateContainerImpl(rootFiber, lane, element, container, parentComponent, callback) {
    parentComponent = getContextForSubtree(parentComponent);
    null === container.context ? container.context = parentComponent : container.pendingContext = parentComponent;
    container = createUpdate(lane);
    container.payload = { element };
    callback = void 0 === callback ? null : callback;
    null !== callback && (container.callback = callback);
    element = enqueueUpdate(rootFiber, container, lane);
    null !== element && (scheduleUpdateOnFiber(element, rootFiber, lane), entangleTransitions(element, rootFiber, lane));
  }
  function markRetryLaneImpl(fiber, retryLane) {
    fiber = fiber.memoizedState;
    if (null !== fiber && null !== fiber.dehydrated) {
      var a = fiber.retryLane;
      fiber.retryLane = 0 !== a && a < retryLane ? a : retryLane;
    }
  }
  function markRetryLaneIfNotHydrated(fiber, retryLane) {
    markRetryLaneImpl(fiber, retryLane);
    (fiber = fiber.alternate) && markRetryLaneImpl(fiber, retryLane);
  }
  function attemptContinuousHydration(fiber) {
    if (13 === fiber.tag || 31 === fiber.tag) {
      var root3 = enqueueConcurrentRenderForLane(fiber, 67108864);
      null !== root3 && scheduleUpdateOnFiber(root3, fiber, 67108864);
      markRetryLaneIfNotHydrated(fiber, 67108864);
    }
  }
  function attemptHydrationAtCurrentPriority(fiber) {
    if (13 === fiber.tag || 31 === fiber.tag) {
      var lane = requestUpdateLane();
      lane = getBumpedLaneForHydrationByLane(lane);
      var root3 = enqueueConcurrentRenderForLane(fiber, lane);
      null !== root3 && scheduleUpdateOnFiber(root3, fiber, lane);
      markRetryLaneIfNotHydrated(fiber, lane);
    }
  }
  var _enabled = true;
  function dispatchDiscreteEvent(domEventName, eventSystemFlags, container, nativeEvent) {
    var prevTransition = ReactSharedInternals.T;
    ReactSharedInternals.T = null;
    var previousPriority = ReactDOMSharedInternals.p;
    try {
      ReactDOMSharedInternals.p = 2, dispatchEvent(domEventName, eventSystemFlags, container, nativeEvent);
    } finally {
      ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = prevTransition;
    }
  }
  function dispatchContinuousEvent(domEventName, eventSystemFlags, container, nativeEvent) {
    var prevTransition = ReactSharedInternals.T;
    ReactSharedInternals.T = null;
    var previousPriority = ReactDOMSharedInternals.p;
    try {
      ReactDOMSharedInternals.p = 8, dispatchEvent(domEventName, eventSystemFlags, container, nativeEvent);
    } finally {
      ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = prevTransition;
    }
  }
  function dispatchEvent(domEventName, eventSystemFlags, targetContainer, nativeEvent) {
    if (_enabled) {
      var blockedOn = findInstanceBlockingEvent(nativeEvent);
      if (null === blockedOn)
        dispatchEventForPluginEventSystem(
          domEventName,
          eventSystemFlags,
          nativeEvent,
          return_targetInst,
          targetContainer
        ), clearIfContinuousEvent(domEventName, nativeEvent);
      else if (queueIfContinuousEvent(
        blockedOn,
        domEventName,
        eventSystemFlags,
        targetContainer,
        nativeEvent
      ))
        nativeEvent.stopPropagation();
      else if (clearIfContinuousEvent(domEventName, nativeEvent), eventSystemFlags & 4 && -1 < discreteReplayableEvents.indexOf(domEventName)) {
        for (; null !== blockedOn; ) {
          var fiber = getInstanceFromNode(blockedOn);
          if (null !== fiber)
            switch (fiber.tag) {
              case 3:
                fiber = fiber.stateNode;
                if (fiber.current.memoizedState.isDehydrated) {
                  var lanes = getHighestPriorityLanes(fiber.pendingLanes);
                  if (0 !== lanes) {
                    var root3 = fiber;
                    root3.pendingLanes |= 2;
                    for (root3.entangledLanes |= 2; lanes; ) {
                      var lane = 1 << 31 - clz32(lanes);
                      root3.entanglements[1] |= lane;
                      lanes &= ~lane;
                    }
                    ensureRootIsScheduled(fiber);
                    0 === (executionContext & 6) && (workInProgressRootRenderTargetTime = now() + 500, flushSyncWorkAcrossRoots_impl(0));
                  }
                }
                break;
              case 31:
              case 13:
                root3 = enqueueConcurrentRenderForLane(fiber, 2), null !== root3 && scheduleUpdateOnFiber(root3, fiber, 2), flushSyncWork$1(), markRetryLaneIfNotHydrated(fiber, 2);
            }
          fiber = findInstanceBlockingEvent(nativeEvent);
          null === fiber && dispatchEventForPluginEventSystem(
            domEventName,
            eventSystemFlags,
            nativeEvent,
            return_targetInst,
            targetContainer
          );
          if (fiber === blockedOn) break;
          blockedOn = fiber;
        }
        null !== blockedOn && nativeEvent.stopPropagation();
      } else
        dispatchEventForPluginEventSystem(
          domEventName,
          eventSystemFlags,
          nativeEvent,
          null,
          targetContainer
        );
    }
  }
  function findInstanceBlockingEvent(nativeEvent) {
    nativeEvent = getEventTarget(nativeEvent);
    return findInstanceBlockingTarget(nativeEvent);
  }
  var return_targetInst = null;
  function findInstanceBlockingTarget(targetNode) {
    return_targetInst = null;
    targetNode = getClosestInstanceFromNode(targetNode);
    if (null !== targetNode) {
      var nearestMounted = getNearestMountedFiber(targetNode);
      if (null === nearestMounted) targetNode = null;
      else {
        var tag = nearestMounted.tag;
        if (13 === tag) {
          targetNode = getSuspenseInstanceFromFiber(nearestMounted);
          if (null !== targetNode) return targetNode;
          targetNode = null;
        } else if (31 === tag) {
          targetNode = getActivityInstanceFromFiber(nearestMounted);
          if (null !== targetNode) return targetNode;
          targetNode = null;
        } else if (3 === tag) {
          if (nearestMounted.stateNode.current.memoizedState.isDehydrated)
            return 3 === nearestMounted.tag ? nearestMounted.stateNode.containerInfo : null;
          targetNode = null;
        } else nearestMounted !== targetNode && (targetNode = null);
      }
    }
    return_targetInst = targetNode;
    return null;
  }
  function getEventPriority(domEventName) {
    switch (domEventName) {
      case "beforetoggle":
      case "cancel":
      case "click":
      case "close":
      case "contextmenu":
      case "copy":
      case "cut":
      case "auxclick":
      case "dblclick":
      case "dragend":
      case "dragstart":
      case "drop":
      case "focusin":
      case "focusout":
      case "input":
      case "invalid":
      case "keydown":
      case "keypress":
      case "keyup":
      case "mousedown":
      case "mouseup":
      case "paste":
      case "pause":
      case "play":
      case "pointercancel":
      case "pointerdown":
      case "pointerup":
      case "ratechange":
      case "reset":
      case "resize":
      case "seeked":
      case "submit":
      case "toggle":
      case "touchcancel":
      case "touchend":
      case "touchstart":
      case "volumechange":
      case "change":
      case "selectionchange":
      case "textInput":
      case "compositionstart":
      case "compositionend":
      case "compositionupdate":
      case "beforeblur":
      case "afterblur":
      case "beforeinput":
      case "blur":
      case "fullscreenchange":
      case "focus":
      case "hashchange":
      case "popstate":
      case "select":
      case "selectstart":
        return 2;
      case "drag":
      case "dragenter":
      case "dragexit":
      case "dragleave":
      case "dragover":
      case "mousemove":
      case "mouseout":
      case "mouseover":
      case "pointermove":
      case "pointerout":
      case "pointerover":
      case "scroll":
      case "touchmove":
      case "wheel":
      case "mouseenter":
      case "mouseleave":
      case "pointerenter":
      case "pointerleave":
        return 8;
      case "message":
        switch (getCurrentPriorityLevel()) {
          case ImmediatePriority:
            return 2;
          case UserBlockingPriority:
            return 8;
          case NormalPriority$1:
          case LowPriority:
            return 32;
          case IdlePriority:
            return 268435456;
          default:
            return 32;
        }
      default:
        return 32;
    }
  }
  var hasScheduledReplayAttempt = false, queuedFocus = null, queuedDrag = null, queuedMouse = null, queuedPointers = /* @__PURE__ */ new Map(), queuedPointerCaptures = /* @__PURE__ */ new Map(), queuedExplicitHydrationTargets = [], discreteReplayableEvents = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(
    " "
  );
  function clearIfContinuousEvent(domEventName, nativeEvent) {
    switch (domEventName) {
      case "focusin":
      case "focusout":
        queuedFocus = null;
        break;
      case "dragenter":
      case "dragleave":
        queuedDrag = null;
        break;
      case "mouseover":
      case "mouseout":
        queuedMouse = null;
        break;
      case "pointerover":
      case "pointerout":
        queuedPointers.delete(nativeEvent.pointerId);
        break;
      case "gotpointercapture":
      case "lostpointercapture":
        queuedPointerCaptures.delete(nativeEvent.pointerId);
    }
  }
  function accumulateOrCreateContinuousQueuedReplayableEvent(existingQueuedEvent, blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent) {
    if (null === existingQueuedEvent || existingQueuedEvent.nativeEvent !== nativeEvent)
      return existingQueuedEvent = {
        blockedOn,
        domEventName,
        eventSystemFlags,
        nativeEvent,
        targetContainers: [targetContainer]
      }, null !== blockedOn && (blockedOn = getInstanceFromNode(blockedOn), null !== blockedOn && attemptContinuousHydration(blockedOn)), existingQueuedEvent;
    existingQueuedEvent.eventSystemFlags |= eventSystemFlags;
    blockedOn = existingQueuedEvent.targetContainers;
    null !== targetContainer && -1 === blockedOn.indexOf(targetContainer) && blockedOn.push(targetContainer);
    return existingQueuedEvent;
  }
  function queueIfContinuousEvent(blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent) {
    switch (domEventName) {
      case "focusin":
        return queuedFocus = accumulateOrCreateContinuousQueuedReplayableEvent(
          queuedFocus,
          blockedOn,
          domEventName,
          eventSystemFlags,
          targetContainer,
          nativeEvent
        ), true;
      case "dragenter":
        return queuedDrag = accumulateOrCreateContinuousQueuedReplayableEvent(
          queuedDrag,
          blockedOn,
          domEventName,
          eventSystemFlags,
          targetContainer,
          nativeEvent
        ), true;
      case "mouseover":
        return queuedMouse = accumulateOrCreateContinuousQueuedReplayableEvent(
          queuedMouse,
          blockedOn,
          domEventName,
          eventSystemFlags,
          targetContainer,
          nativeEvent
        ), true;
      case "pointerover":
        var pointerId = nativeEvent.pointerId;
        queuedPointers.set(
          pointerId,
          accumulateOrCreateContinuousQueuedReplayableEvent(
            queuedPointers.get(pointerId) || null,
            blockedOn,
            domEventName,
            eventSystemFlags,
            targetContainer,
            nativeEvent
          )
        );
        return true;
      case "gotpointercapture":
        return pointerId = nativeEvent.pointerId, queuedPointerCaptures.set(
          pointerId,
          accumulateOrCreateContinuousQueuedReplayableEvent(
            queuedPointerCaptures.get(pointerId) || null,
            blockedOn,
            domEventName,
            eventSystemFlags,
            targetContainer,
            nativeEvent
          )
        ), true;
    }
    return false;
  }
  function attemptExplicitHydrationTarget(queuedTarget) {
    var targetInst = getClosestInstanceFromNode(queuedTarget.target);
    if (null !== targetInst) {
      var nearestMounted = getNearestMountedFiber(targetInst);
      if (null !== nearestMounted) {
        if (targetInst = nearestMounted.tag, 13 === targetInst) {
          if (targetInst = getSuspenseInstanceFromFiber(nearestMounted), null !== targetInst) {
            queuedTarget.blockedOn = targetInst;
            runWithPriority(queuedTarget.priority, function() {
              attemptHydrationAtCurrentPriority(nearestMounted);
            });
            return;
          }
        } else if (31 === targetInst) {
          if (targetInst = getActivityInstanceFromFiber(nearestMounted), null !== targetInst) {
            queuedTarget.blockedOn = targetInst;
            runWithPriority(queuedTarget.priority, function() {
              attemptHydrationAtCurrentPriority(nearestMounted);
            });
            return;
          }
        } else if (3 === targetInst && nearestMounted.stateNode.current.memoizedState.isDehydrated) {
          queuedTarget.blockedOn = 3 === nearestMounted.tag ? nearestMounted.stateNode.containerInfo : null;
          return;
        }
      }
    }
    queuedTarget.blockedOn = null;
  }
  function attemptReplayContinuousQueuedEvent(queuedEvent) {
    if (null !== queuedEvent.blockedOn) return false;
    for (var targetContainers = queuedEvent.targetContainers; 0 < targetContainers.length; ) {
      var nextBlockedOn = findInstanceBlockingEvent(queuedEvent.nativeEvent);
      if (null === nextBlockedOn) {
        nextBlockedOn = queuedEvent.nativeEvent;
        var nativeEventClone = new nextBlockedOn.constructor(
          nextBlockedOn.type,
          nextBlockedOn
        );
        currentReplayingEvent = nativeEventClone;
        nextBlockedOn.target.dispatchEvent(nativeEventClone);
        currentReplayingEvent = null;
      } else
        return targetContainers = getInstanceFromNode(nextBlockedOn), null !== targetContainers && attemptContinuousHydration(targetContainers), queuedEvent.blockedOn = nextBlockedOn, false;
      targetContainers.shift();
    }
    return true;
  }
  function attemptReplayContinuousQueuedEventInMap(queuedEvent, key, map) {
    attemptReplayContinuousQueuedEvent(queuedEvent) && map.delete(key);
  }
  function replayUnblockedEvents() {
    hasScheduledReplayAttempt = false;
    null !== queuedFocus && attemptReplayContinuousQueuedEvent(queuedFocus) && (queuedFocus = null);
    null !== queuedDrag && attemptReplayContinuousQueuedEvent(queuedDrag) && (queuedDrag = null);
    null !== queuedMouse && attemptReplayContinuousQueuedEvent(queuedMouse) && (queuedMouse = null);
    queuedPointers.forEach(attemptReplayContinuousQueuedEventInMap);
    queuedPointerCaptures.forEach(attemptReplayContinuousQueuedEventInMap);
  }
  function scheduleCallbackIfUnblocked(queuedEvent, unblocked) {
    queuedEvent.blockedOn === unblocked && (queuedEvent.blockedOn = null, hasScheduledReplayAttempt || (hasScheduledReplayAttempt = true, Scheduler.unstable_scheduleCallback(
      Scheduler.unstable_NormalPriority,
      replayUnblockedEvents
    )));
  }
  var lastScheduledReplayQueue = null;
  function scheduleReplayQueueIfNeeded(formReplayingQueue) {
    lastScheduledReplayQueue !== formReplayingQueue && (lastScheduledReplayQueue = formReplayingQueue, Scheduler.unstable_scheduleCallback(
      Scheduler.unstable_NormalPriority,
      function() {
        lastScheduledReplayQueue === formReplayingQueue && (lastScheduledReplayQueue = null);
        for (var i = 0; i < formReplayingQueue.length; i += 3) {
          var form = formReplayingQueue[i], submitterOrAction = formReplayingQueue[i + 1], formData = formReplayingQueue[i + 2];
          if ("function" !== typeof submitterOrAction)
            if (null === findInstanceBlockingTarget(submitterOrAction || form))
              continue;
            else break;
          var formInst = getInstanceFromNode(form);
          null !== formInst && (formReplayingQueue.splice(i, 3), i -= 3, startHostTransition(
            formInst,
            {
              pending: true,
              data: formData,
              method: form.method,
              action: submitterOrAction
            },
            submitterOrAction,
            formData
          ));
        }
      }
    ));
  }
  function retryIfBlockedOn(unblocked) {
    function unblock(queuedEvent) {
      return scheduleCallbackIfUnblocked(queuedEvent, unblocked);
    }
    null !== queuedFocus && scheduleCallbackIfUnblocked(queuedFocus, unblocked);
    null !== queuedDrag && scheduleCallbackIfUnblocked(queuedDrag, unblocked);
    null !== queuedMouse && scheduleCallbackIfUnblocked(queuedMouse, unblocked);
    queuedPointers.forEach(unblock);
    queuedPointerCaptures.forEach(unblock);
    for (var i = 0; i < queuedExplicitHydrationTargets.length; i++) {
      var queuedTarget = queuedExplicitHydrationTargets[i];
      queuedTarget.blockedOn === unblocked && (queuedTarget.blockedOn = null);
    }
    for (; 0 < queuedExplicitHydrationTargets.length && (i = queuedExplicitHydrationTargets[0], null === i.blockedOn); )
      attemptExplicitHydrationTarget(i), null === i.blockedOn && queuedExplicitHydrationTargets.shift();
    i = (unblocked.ownerDocument || unblocked).$$reactFormReplay;
    if (null != i)
      for (queuedTarget = 0; queuedTarget < i.length; queuedTarget += 3) {
        var form = i[queuedTarget], submitterOrAction = i[queuedTarget + 1], formProps = form[internalPropsKey] || null;
        if ("function" === typeof submitterOrAction)
          formProps || scheduleReplayQueueIfNeeded(i);
        else if (formProps) {
          var action = null;
          if (submitterOrAction && submitterOrAction.hasAttribute("formAction"))
            if (form = submitterOrAction, formProps = submitterOrAction[internalPropsKey] || null)
              action = formProps.formAction;
            else {
              if (null !== findInstanceBlockingTarget(form)) continue;
            }
          else action = formProps.action;
          "function" === typeof action ? i[queuedTarget + 1] = action : (i.splice(queuedTarget, 3), queuedTarget -= 3);
          scheduleReplayQueueIfNeeded(i);
        }
      }
  }
  function defaultOnDefaultTransitionIndicator() {
    function handleNavigate(event) {
      event.canIntercept && "react-transition" === event.info && event.intercept({
        handler: function() {
          return new Promise(function(resolve) {
            return pendingResolve = resolve;
          });
        },
        focusReset: "manual",
        scroll: "manual"
      });
    }
    function handleNavigateComplete() {
      null !== pendingResolve && (pendingResolve(), pendingResolve = null);
      isCancelled || setTimeout(startFakeNavigation, 20);
    }
    function startFakeNavigation() {
      if (!isCancelled && !navigation.transition) {
        var currentEntry = navigation.currentEntry;
        currentEntry && null != currentEntry.url && navigation.navigate(currentEntry.url, {
          state: currentEntry.getState(),
          info: "react-transition",
          history: "replace"
        });
      }
    }
    if ("object" === typeof navigation) {
      var isCancelled = false, pendingResolve = null;
      navigation.addEventListener("navigate", handleNavigate);
      navigation.addEventListener("navigatesuccess", handleNavigateComplete);
      navigation.addEventListener("navigateerror", handleNavigateComplete);
      setTimeout(startFakeNavigation, 100);
      return function() {
        isCancelled = true;
        navigation.removeEventListener("navigate", handleNavigate);
        navigation.removeEventListener("navigatesuccess", handleNavigateComplete);
        navigation.removeEventListener("navigateerror", handleNavigateComplete);
        null !== pendingResolve && (pendingResolve(), pendingResolve = null);
      };
    }
  }
  function ReactDOMRoot(internalRoot) {
    this._internalRoot = internalRoot;
  }
  ReactDOMHydrationRoot.prototype.render = ReactDOMRoot.prototype.render = function(children) {
    var root3 = this._internalRoot;
    if (null === root3) throw Error(formatProdErrorMessage(409));
    var current = root3.current, lane = requestUpdateLane();
    updateContainerImpl(current, lane, children, root3, null, null);
  };
  ReactDOMHydrationRoot.prototype.unmount = ReactDOMRoot.prototype.unmount = function() {
    var root3 = this._internalRoot;
    if (null !== root3) {
      this._internalRoot = null;
      var container = root3.containerInfo;
      updateContainerImpl(root3.current, 2, null, root3, null, null);
      flushSyncWork$1();
      container[internalContainerInstanceKey] = null;
    }
  };
  function ReactDOMHydrationRoot(internalRoot) {
    this._internalRoot = internalRoot;
  }
  ReactDOMHydrationRoot.prototype.unstable_scheduleHydration = function(target) {
    if (target) {
      var updatePriority = resolveUpdatePriority();
      target = { blockedOn: null, target, priority: updatePriority };
      for (var i = 0; i < queuedExplicitHydrationTargets.length && 0 !== updatePriority && updatePriority < queuedExplicitHydrationTargets[i].priority; i++) ;
      queuedExplicitHydrationTargets.splice(i, 0, target);
      0 === i && attemptExplicitHydrationTarget(target);
    }
  };
  var isomorphicReactPackageVersion$jscomp$inline_1840 = React2.version;
  if ("19.2.0" !== isomorphicReactPackageVersion$jscomp$inline_1840)
    throw Error(
      formatProdErrorMessage(
        527,
        isomorphicReactPackageVersion$jscomp$inline_1840,
        "19.2.0"
      )
    );
  ReactDOMSharedInternals.findDOMNode = function(componentOrElement) {
    var fiber = componentOrElement._reactInternals;
    if (void 0 === fiber) {
      if ("function" === typeof componentOrElement.render)
        throw Error(formatProdErrorMessage(188));
      componentOrElement = Object.keys(componentOrElement).join(",");
      throw Error(formatProdErrorMessage(268, componentOrElement));
    }
    componentOrElement = findCurrentFiberUsingSlowPath(fiber);
    componentOrElement = null !== componentOrElement ? findCurrentHostFiberImpl(componentOrElement) : null;
    componentOrElement = null === componentOrElement ? null : componentOrElement.stateNode;
    return componentOrElement;
  };
  var internals$jscomp$inline_2347 = {
    bundleType: 0,
    version: "19.2.0",
    rendererPackageName: "react-dom",
    currentDispatcherRef: ReactSharedInternals,
    reconcilerVersion: "19.2.0"
  };
  if ("undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__) {
    var hook$jscomp$inline_2348 = __REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!hook$jscomp$inline_2348.isDisabled && hook$jscomp$inline_2348.supportsFiber)
      try {
        rendererID = hook$jscomp$inline_2348.inject(
          internals$jscomp$inline_2347
        ), injectedHook = hook$jscomp$inline_2348;
      } catch (err) {
      }
  }
  reactDomClient_production.createRoot = function(container, options2) {
    if (!isValidContainer(container)) throw Error(formatProdErrorMessage(299));
    var isStrictMode = false, identifierPrefix = "", onUncaughtError = defaultOnUncaughtError, onCaughtError = defaultOnCaughtError, onRecoverableError = defaultOnRecoverableError;
    null !== options2 && void 0 !== options2 && (true === options2.unstable_strictMode && (isStrictMode = true), void 0 !== options2.identifierPrefix && (identifierPrefix = options2.identifierPrefix), void 0 !== options2.onUncaughtError && (onUncaughtError = options2.onUncaughtError), void 0 !== options2.onCaughtError && (onCaughtError = options2.onCaughtError), void 0 !== options2.onRecoverableError && (onRecoverableError = options2.onRecoverableError));
    options2 = createFiberRoot(
      container,
      1,
      false,
      null,
      null,
      isStrictMode,
      identifierPrefix,
      null,
      onUncaughtError,
      onCaughtError,
      onRecoverableError,
      defaultOnDefaultTransitionIndicator
    );
    container[internalContainerInstanceKey] = options2.current;
    listenToAllSupportedEvents(container);
    return new ReactDOMRoot(options2);
  };
  reactDomClient_production.hydrateRoot = function(container, initialChildren, options2) {
    if (!isValidContainer(container)) throw Error(formatProdErrorMessage(299));
    var isStrictMode = false, identifierPrefix = "", onUncaughtError = defaultOnUncaughtError, onCaughtError = defaultOnCaughtError, onRecoverableError = defaultOnRecoverableError, formState = null;
    null !== options2 && void 0 !== options2 && (true === options2.unstable_strictMode && (isStrictMode = true), void 0 !== options2.identifierPrefix && (identifierPrefix = options2.identifierPrefix), void 0 !== options2.onUncaughtError && (onUncaughtError = options2.onUncaughtError), void 0 !== options2.onCaughtError && (onCaughtError = options2.onCaughtError), void 0 !== options2.onRecoverableError && (onRecoverableError = options2.onRecoverableError), void 0 !== options2.formState && (formState = options2.formState));
    initialChildren = createFiberRoot(
      container,
      1,
      true,
      initialChildren,
      null != options2 ? options2 : null,
      isStrictMode,
      identifierPrefix,
      formState,
      onUncaughtError,
      onCaughtError,
      onRecoverableError,
      defaultOnDefaultTransitionIndicator
    );
    initialChildren.context = getContextForSubtree(null);
    options2 = initialChildren.current;
    isStrictMode = requestUpdateLane();
    isStrictMode = getBumpedLaneForHydrationByLane(isStrictMode);
    identifierPrefix = createUpdate(isStrictMode);
    identifierPrefix.callback = null;
    enqueueUpdate(options2, identifierPrefix, isStrictMode);
    options2 = isStrictMode;
    initialChildren.current.lanes = options2;
    markRootUpdated$1(initialChildren, options2);
    ensureRootIsScheduled(initialChildren);
    container[internalContainerInstanceKey] = initialChildren.current;
    listenToAllSupportedEvents(container);
    return new ReactDOMHydrationRoot(initialChildren);
  };
  reactDomClient_production.version = "19.2.0";
  return reactDomClient_production;
}
var hasRequiredClient;
function requireClient() {
  if (hasRequiredClient) return client.exports;
  hasRequiredClient = 1;
  function checkDCE() {
    if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === "undefined" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE !== "function") {
      return;
    }
    try {
      __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(checkDCE);
    } catch (err) {
      console.error(err);
    }
  }
  {
    checkDCE();
    client.exports = requireReactDomClient_production();
  }
  return client.exports;
}
var clientExports = requireClient();
const ReactDOM = /* @__PURE__ */ getDefaultExportFromCjs(clientExports);
var jsxRuntime = { exports: {} };
var reactJsxRuntime_production = {};
var hasRequiredReactJsxRuntime_production;
function requireReactJsxRuntime_production() {
  if (hasRequiredReactJsxRuntime_production) return reactJsxRuntime_production;
  hasRequiredReactJsxRuntime_production = 1;
  var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
  function jsxProd(type, config, maybeKey) {
    var key = null;
    void 0 !== maybeKey && (key = "" + maybeKey);
    void 0 !== config.key && (key = "" + config.key);
    if ("key" in config) {
      maybeKey = {};
      for (var propName in config)
        "key" !== propName && (maybeKey[propName] = config[propName]);
    } else maybeKey = config;
    config = maybeKey.ref;
    return {
      $$typeof: REACT_ELEMENT_TYPE,
      type,
      key,
      ref: void 0 !== config ? config : null,
      props: maybeKey
    };
  }
  reactJsxRuntime_production.Fragment = REACT_FRAGMENT_TYPE;
  reactJsxRuntime_production.jsx = jsxProd;
  reactJsxRuntime_production.jsxs = jsxProd;
  return reactJsxRuntime_production;
}
var hasRequiredJsxRuntime;
function requireJsxRuntime() {
  if (hasRequiredJsxRuntime) return jsxRuntime.exports;
  hasRequiredJsxRuntime = 1;
  {
    jsxRuntime.exports = requireReactJsxRuntime_production();
  }
  return jsxRuntime.exports;
}
var jsxRuntimeExports = requireJsxRuntime();
class SerialManager {
  constructor(callbacks) {
    this.port = null;
    this.reader = null;
    this.writer = null;
    this.isJobRunning = false;
    this.isPaused = false;
    this.pauseRequested = false;
    this.stopRequested = false;
    this.isStopped = false;
    this.isDryRun = false;
    this.currentLineIndex = 0;
    this.prePauseSpindleState = null;
    this.totalLines = 0;
    this.gcode = [];
    this.statusInterval = null;
    this.spindleDirection = "off";
    this.lastStatus = {
      status: "Idle",
      code: null,
      wpos: { x: 0, y: 0, z: 0 },
      mpos: { x: 0, y: 0, z: 0 },
      wco: { x: 0, y: 0, z: 0 },
      spindle: { state: "off", speed: 0 },
      ov: [100, 100, 100]
    };
    this.linePromiseResolve = null;
    this.linePromiseReject = null;
    this.isDisconnecting = false;
    this.callbacks = callbacks;
  }
  async connect(baudRate) {
    if (!("serial" in navigator)) {
      this.callbacks.onError("Web Serial API not supported.");
      return;
    }
    try {
      this.port = await navigator.serial.requestPort();
      await this.port.open({ baudRate });
      this.lastStatus = {
        status: "Idle",
        code: null,
        wpos: { x: 0, y: 0, z: 0 },
        mpos: { x: 0, y: 0, z: 0 },
        wco: { x: 0, y: 0, z: 0 },
        spindle: { state: "off", speed: 0 },
        ov: [100, 100, 100]
      };
      this.spindleDirection = "off";
      const portInfo = this.port.getInfo();
      this.callbacks.onConnect(portInfo);
      this.port.addEventListener("disconnect", () => {
        this.disconnect();
      });
      const textDecoder = new TextDecoderStream();
      this.port.readable.pipeTo(textDecoder.writable);
      this.reader = textDecoder.readable.getReader();
      const textEncoder = new TextEncoderStream();
      textEncoder.readable.pipeTo(this.port.writable);
      this.writer = textEncoder.writable.getWriter();
      this.readLoop();
      this.statusInterval = window.setInterval(() => this.requestStatusUpdate(), 100);
    } catch (error) {
      if (error instanceof Error) {
        this.callbacks.onError(error.message);
      }
      throw error;
    }
  }
  async disconnect() {
    if (this.isDisconnecting || !this.port) return;
    this.isDisconnecting = true;
    if (this.statusInterval) {
      clearInterval(this.statusInterval);
      this.statusInterval = null;
    }
    if (this.isJobRunning) {
      this.stopJob();
    }
    try {
      if (this.reader) {
        await this.reader.cancel();
      }
      if (this.writer) {
        await this.writer.abort();
      }
      if (this.port) {
        await this.port.close();
      }
    } catch (error) {
    } finally {
      this.port = this.reader = this.writer = null;
      this.isDisconnecting = false;
    }
    this.callbacks.onDisconnect();
  }
  parseGrblStatus(statusStr, lastStatus) {
    try {
      const content = statusStr.slice(1, -1);
      const parts = content.split("|");
      const statusPart = parts[0];
      const parsed = { status: "Idle", code: null };
      const rawStatus = statusPart.split(":")[0].toLowerCase();
      let status;
      if (rawStatus.startsWith("home")) {
        status = "Home";
      } else if (rawStatus === "idle") {
        status = "Idle";
      } else if (rawStatus === "run") {
        status = "Run";
      } else if (rawStatus === "hold") {
        status = "Hold";
      } else if (rawStatus === "jog") {
        status = "Jog";
      } else if (rawStatus === "alarm") {
        status = "Alarm";
      } else if (rawStatus === "door") {
        status = "Door";
      } else if (rawStatus === "check") {
        status = "Check";
      } else if (rawStatus === "sleep") {
        status = "Sleep";
      } else {
        status = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1);
      }
      let code = null;
      if (status === "Alarm") {
        const alarmMatch = statusPart.match(/Alarm:(\d+)/);
        if (alarmMatch) {
          code = parseInt(alarmMatch[1], 10);
        }
      }
      parsed.status = status;
      parsed.code = code;
      for (const part of parts) {
        if (part.startsWith("WPos:")) {
          const coords = part.substring(5).split(",");
          const wpos = lastStatus.wpos ? { ...lastStatus.wpos } : { x: 0, y: 0, z: 0 };
          if (coords.length > 0 && coords[0] !== "" && !isNaN(parseFloat(coords[0]))) wpos.x = parseFloat(coords[0]);
          if (coords.length > 1 && coords[1] !== "" && !isNaN(parseFloat(coords[1]))) wpos.y = parseFloat(coords[1]);
          if (coords.length > 2 && coords[2] !== "" && !isNaN(parseFloat(coords[2]))) wpos.z = parseFloat(coords[2]);
          parsed.wpos = wpos;
        } else if (part.startsWith("MPos:")) {
          const coords = part.substring(5).split(",");
          const mpos = lastStatus.mpos ? { ...lastStatus.mpos } : { x: 0, y: 0, z: 0 };
          if (coords.length > 0 && coords[0] !== "" && !isNaN(parseFloat(coords[0]))) mpos.x = parseFloat(coords[0]);
          if (coords.length > 1 && coords[1] !== "" && !isNaN(parseFloat(coords[1]))) mpos.y = parseFloat(coords[1]);
          if (coords.length > 2 && coords[2] !== "" && !isNaN(parseFloat(coords[2]))) mpos.z = parseFloat(coords[2]);
          parsed.mpos = mpos;
        } else if (part.startsWith("WCO:")) {
          const coords = part.substring(4).split(",");
          const wco = lastStatus.wco ? { ...lastStatus.wco } : { x: 0, y: 0, z: 0 };
          if (coords.length > 0 && coords[0] !== "" && !isNaN(parseFloat(coords[0]))) wco.x = parseFloat(coords[0]);
          if (coords.length > 1 && coords[1] !== "" && !isNaN(parseFloat(coords[1]))) wco.y = parseFloat(coords[1]);
          if (coords.length > 2 && coords[2] !== "" && !isNaN(parseFloat(coords[2]))) wco.z = parseFloat(coords[2]);
          parsed.wco = wco;
        } else if (part.startsWith("FS:")) {
          const speeds = part.substring(3).split(",");
          if (!parsed.spindle) parsed.spindle = { state: "off", speed: 0 };
          if (speeds.length > 1) {
            parsed.spindle.speed = parseFloat(speeds[1]);
          }
        } else if (part.startsWith("Ov:")) {
          const ovParts = part.substring(3).split(",");
          if (ovParts.length === 3) {
            parsed.ov = ovParts.map((p) => parseInt(p, 10));
          }
        }
      }
      if (!parsed.wpos && parsed.mpos && (parsed.wco || lastStatus.wco)) {
        const wcoToUse = parsed.wco || lastStatus.wco;
        parsed.wpos = {
          x: parsed.mpos.x - wcoToUse.x,
          y: parsed.mpos.y - wcoToUse.y,
          z: parsed.mpos.z - wcoToUse.z
        };
      }
      return parsed;
    } catch (e) {
      console.error("Failed to parse GRBL status:", statusStr, e);
      return null;
    }
  }
  async readLoop() {
    let buffer = "";
    while (this.port?.readable && this.reader) {
      try {
        const { value, done } = await this.reader.read();
        if (done) {
          break;
        }
        if (value) {
          buffer += value;
          const lines = buffer.split("\n");
          buffer = lines.pop();
          lines.forEach((line) => {
            const trimmedValue = line.trim();
            if (trimmedValue.startsWith("<") && trimmedValue.endsWith(">")) {
              const previousStatus = this.lastStatus.status;
              const statusUpdate = this.parseGrblStatus(trimmedValue, this.lastStatus);
              if (statusUpdate) {
                this.lastStatus = {
                  status: statusUpdate.status,
                  code: statusUpdate.code,
                  wpos: statusUpdate.wpos || this.lastStatus.wpos,
                  mpos: statusUpdate.mpos || this.lastStatus.mpos,
                  wco: statusUpdate.wco || this.lastStatus.wco,
                  ov: statusUpdate.ov || this.lastStatus.ov,
                  spindle: {
                    ...this.lastStatus.spindle,
                    ...statusUpdate.spindle || {}
                  }
                };
                if (this.lastStatus.spindle.speed === 0) {
                  this.spindleDirection = "off";
                }
                this.lastStatus.spindle.state = this.spindleDirection;
                this.callbacks.onStatus(JSON.parse(JSON.stringify(this.lastStatus)), trimmedValue);
                if (previousStatus === "Jog" && this.lastStatus.status === "Idle") {
                  this.requestStatusUpdate();
                }
              }
            } else if (trimmedValue) {
              if (trimmedValue.startsWith("error:")) {
                if (this.linePromiseReject) {
                  this.linePromiseReject(new Error(trimmedValue));
                  this.linePromiseResolve = null;
                  this.linePromiseReject = null;
                } else {
                  this.callbacks.onError(`GRBL Error: ${trimmedValue}`);
                }
              } else {
                this.callbacks.onLog({ type: "received", message: trimmedValue });
                if (trimmedValue.startsWith("ok")) {
                  if (this.linePromiseResolve) {
                    this.linePromiseResolve();
                    this.linePromiseResolve = null;
                    this.linePromiseReject = null;
                  }
                }
              }
            }
          });
        }
      } catch (error) {
        if (this.linePromiseReject) {
          this.linePromiseReject(new Error("Serial connection lost during read."));
          this.linePromiseResolve = null;
          this.linePromiseReject = null;
        }
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        if (this.isDisconnecting) ;
        else if (errorMessage.includes("device has been lost") || errorMessage.includes("The port is closed.")) {
          this.callbacks.onError("Device disconnected unexpectedly. Please reconnect.");
          this.disconnect();
        } else {
          this.callbacks.onError("Error reading from serial port.");
        }
        break;
      }
    }
  }
  async sendLineAndWaitForOk(line, log = true) {
    return new Promise((resolve, reject) => {
      if (this.linePromiseResolve) {
        return reject(new Error("Cannot send new line while another is awaiting 'ok'."));
      }
      this.linePromiseResolve = resolve;
      this.linePromiseReject = reject;
      this.sendLine(line, log).catch((err) => {
        this.linePromiseResolve = null;
        this.linePromiseReject = null;
        reject(err);
      });
    });
  }
  async sendLine(line, log = true) {
    const upperLine = line.trim().toUpperCase();
    if (upperLine.startsWith("M3")) {
      this.spindleDirection = "cw";
    } else if (upperLine.startsWith("M4")) {
      this.spindleDirection = "ccw";
    } else if (upperLine.startsWith("M5")) {
      this.spindleDirection = "off";
    }
    if (!this.writer) {
      return;
    }
    try {
      const command = line + "\n";
      await this.writer.write(command);
      if (log) {
        this.callbacks.onLog({ type: "sent", message: line });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      if (this.isDisconnecting) ;
      else if (errorMessage.includes("device has been lost") || errorMessage.includes("The port is closed.")) {
        this.callbacks.onError("Device disconnected unexpectedly. Please reconnect.");
        this.disconnect();
      } else {
        this.callbacks.onError("Error writing to serial port.");
      }
      throw error;
    }
  }
  async sendRealtimeCommand(command) {
    if (!this.writer) {
      return;
    }
    try {
      await this.writer.write(command);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      if (this.isDisconnecting) ;
      else if (errorMessage.includes("device has been lost") || errorMessage.includes("The port is closed.")) {
        this.callbacks.onError("Device disconnected unexpectedly. Please reconnect.");
        this.disconnect();
      } else {
        this.callbacks.onError("Error writing to serial port.");
      }
      throw error;
    }
  }
  requestStatusUpdate() {
    if (this.writer) {
      this.writer.write("?").catch(() => {
      });
    }
  }
  sendGCode(gcodeLines, options = {}) {
    if (this.isJobRunning) {
      this.callbacks.onError("A job is already running.");
      return;
    }
    const { startLine = 0, isDryRun = false } = options;
    this.gcode = gcodeLines;
    this.totalLines = gcodeLines.length;
    this.currentLineIndex = startLine;
    this.isDryRun = isDryRun;
    this.isJobRunning = true;
    this.isPaused = false;
    this.isStopped = false;
    let logMessage = `Starting G-code job from line ${startLine + 1}: ${this.totalLines} total lines.`;
    if (isDryRun) {
      logMessage += " (Dry Run enabled)";
    }
    this.callbacks.onLog({ type: "status", message: logMessage });
    this.callbacks.onProgress({
      percentage: this.currentLineIndex / this.totalLines * 100,
      linesSent: this.currentLineIndex,
      totalLines: this.totalLines
    });
    this.sendNextLine();
  }
  async sendNextLine() {
    if (this.isStopped) {
      this.isJobRunning = false;
      this.callbacks.onLog({ type: "status", message: "Job stopped by user." });
      return;
    }
    if (this.stopRequested) {
      this.isJobRunning = false;
      this.isStopped = true;
      this.stopRequested = false;
      await this.sendLineAndWaitForOk("M5");
      this.callbacks.onLog({ type: "status", message: "Job stopped gracefully." });
      return;
    }
    if (this.pauseRequested) {
      this.isPaused = true;
      this.pauseRequested = false;
      this.prePauseSpindleState = { ...this.lastStatus.spindle };
      await this.sendLineAndWaitForOk("M5");
      await this.sendRealtimeCommand("!");
      this.callbacks.onLog({ type: "status", message: "Job paused." });
      return;
    }
    if (this.isPaused) {
      return;
    }
    if (this.currentLineIndex >= this.totalLines) {
      this.isJobRunning = false;
      return;
    }
    const line = this.gcode[this.currentLineIndex];
    const upperLine = line.toUpperCase().trim();
    if (this.isDryRun && (upperLine.startsWith("M3") || upperLine.startsWith("M4") || upperLine.startsWith("M5"))) {
      this.callbacks.onLog({ type: "status", message: `Skipped (Dry Run): ${line}` });
      this.currentLineIndex++;
      this.callbacks.onProgress({
        percentage: this.currentLineIndex / this.totalLines * 100,
        linesSent: this.currentLineIndex,
        totalLines: this.totalLines
      });
      setTimeout(() => this.sendNextLine(), 0);
      return;
    }
    try {
      await this.sendLineAndWaitForOk(line);
      this.currentLineIndex++;
      this.callbacks.onProgress({
        percentage: this.currentLineIndex / this.totalLines * 100,
        linesSent: this.currentLineIndex,
        totalLines: this.totalLines
      });
      setTimeout(() => this.sendNextLine(), 0);
    } catch (error) {
      this.isJobRunning = false;
      this.isStopped = true;
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      if (errorMessage.includes("device has been lost") || errorMessage.includes("The port is closed.")) {
        this.callbacks.onLog({ type: "error", message: `Job aborted due to disconnection.` });
      } else if (!errorMessage.includes("Job stopped by user.")) {
        this.callbacks.onLog({ type: "error", message: `Job halted on line ${this.currentLineIndex + 1}: ${this.gcode[this.currentLineIndex]}` });
        this.callbacks.onError(`Job halted due to GRBL error: ${errorMessage}`);
      }
    }
  }
  async pause() {
    if (this.isJobRunning && !this.isPaused) {
      this.pauseRequested = true;
    }
  }
  async resume() {
    if (this.isJobRunning && this.isPaused && !this.pauseRequested) {
      this.isPaused = false;
      if (this.prePauseSpindleState && this.prePauseSpindleState.state !== "off" && this.prePauseSpindleState.speed > 0) {
        const spindleCmd = this.prePauseSpindleState.state === "cw" ? "M3" : "M4";
        await this.sendLine(`${spindleCmd} S${this.prePauseSpindleState.speed}`);
      }
      await this.sendRealtimeCommand("~");
      this.callbacks.onLog({ type: "status", message: "Job resumed." });
      this.sendNextLine();
    }
  }
  gracefulStop() {
    if (this.isJobRunning && !this.isStopped) {
      this.stopRequested = true;
    }
  }
  stopJob() {
    if (this.isJobRunning) {
      this.isStopped = true;
      this.sendRealtimeCommand("");
      if (this.linePromiseReject) {
        this.linePromiseReject(new Error("Job stopped by user."));
        this.linePromiseResolve = null;
        this.linePromiseReject = null;
      }
    }
  }
  emergencyStop() {
    this.isStopped = true;
    this.isJobRunning = false;
    if (this.linePromiseReject) {
      this.linePromiseReject(new Error("Emergency Stop"));
      this.linePromiseResolve = null;
      this.linePromiseReject = null;
    }
    this.sendRealtimeCommand("");
  }
}
const getParam$3 = (gcode, param) => {
  const regex = new RegExp(`${param}\\s*([-+]?[0-9]*\\.?[0-9]*)`, "i");
  const match = gcode.match(regex);
  return match ? parseFloat(match[1]) : null;
};
class SimulatedSerialManager {
  constructor(callbacks) {
    this.statusInterval = null;
    this.position = {
      status: "Idle",
      code: null,
      wpos: { x: 0, y: 0, z: 0 },
      mpos: { x: 0, y: 0, z: 0 },
      wco: { x: 0, y: 0, z: 0 },
      spindle: { state: "off", speed: 0 },
      ov: [100, 100, 100]
    };
    this.isJobRunning = false;
    this.isPaused = false;
    this.pauseRequested = false;
    this.stopRequested = false;
    this.isStopped = false;
    this.isDryRun = false;
    this.currentLineIndex = 0;
    this.prePauseSpindleState = null;
    this.totalLines = 0;
    this.gcode = [];
    this.positioningMode = "absolute";
    this.jobLoopTimeout = null;
    this.callbacks = callbacks;
  }
  // Helper to immediately push the current state to the UI
  forceStatusUpdate() {
    const newPosition = JSON.parse(JSON.stringify(this.position));
    const rawStatus = `<${newPosition.status}|MPos:${newPosition.mpos.x.toFixed(3)},${newPosition.mpos.y.toFixed(3)},${newPosition.mpos.z.toFixed(3)}|WPos:${newPosition.wpos.x.toFixed(3)},${newPosition.wpos.y.toFixed(3)},${newPosition.wpos.z.toFixed(3)}|FS:${newPosition.spindle.state === "off" ? 0 : newPosition.spindle.speed},${newPosition.spindle.speed}|WCO:${newPosition.wco.x.toFixed(3)},${newPosition.wco.y.toFixed(3)},${newPosition.wco.z.toFixed(3)}>`;
    this.callbacks.onStatus(newPosition, rawStatus);
  }
  async connect(_baudRate) {
    this.callbacks.onConnect({ usbVendorId: 43690, usbProductId: 48059 });
    this.callbacks.onLog({ type: "received", message: "Grbl 1.1h ['$' for help]" });
    this.statusInterval = window.setInterval(() => {
      const newPosition = JSON.parse(JSON.stringify(this.position));
      const rawStatus = `<${newPosition.status}|MPos:${newPosition.mpos.x.toFixed(3)},${newPosition.mpos.y.toFixed(3)},${newPosition.mpos.z.toFixed(3)}|WPos:${newPosition.wpos.x.toFixed(3)},${newPosition.wpos.y.toFixed(3)},${newPosition.wpos.z.toFixed(3)}|FS:${newPosition.spindle.state === "off" ? 0 : newPosition.spindle.speed},${newPosition.spindle.speed}|WCO:${newPosition.wco.x.toFixed(3)},${newPosition.wco.y.toFixed(3)},${newPosition.wco.z.toFixed(3)}>`;
      this.callbacks.onStatus(newPosition, rawStatus);
    }, 250);
  }
  async disconnect() {
    if (this.statusInterval) {
      clearInterval(this.statusInterval);
      this.statusInterval = null;
    }
    this.callbacks.onDisconnect();
  }
  async sendOk(delay = 50) {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.callbacks.onLog({ type: "received", message: "ok" });
        resolve(true);
      }, delay);
    });
  }
  async sendLineAndWaitForOk(line, log = true) {
    return this.sendLine(line, log);
  }
  async sendLine(line, log = true) {
    if (log) {
      this.callbacks.onLog({ type: "sent", message: line });
    }
    const upperLine = line.toUpperCase().trim();
    if (upperLine.startsWith("G38.2")) {
      this.callbacks.onLog({ type: "status", message: "Probing Z... (simulated)" });
      const touchPoint = this.position.wpos.z - 5;
      this.position.wpos.z = touchPoint;
      this.position.mpos.z = touchPoint;
      this.callbacks.onLog({ type: "received", message: `[PRB:0.000,0.000,${touchPoint.toFixed(3)}:1]` });
      await this.sendOk();
      return;
    }
    if (upperLine === "G90") {
      this.positioningMode = "absolute";
      await this.sendOk();
      return;
    }
    if (upperLine === "G91") {
      this.positioningMode = "incremental";
      await this.sendOk();
      return;
    }
    if (upperLine.startsWith("G0") || upperLine.startsWith("G1")) {
      const x = getParam$3(upperLine, "X");
      const y = getParam$3(upperLine, "Y");
      const z = getParam$3(upperLine, "Z");
      if (this.positioningMode === "incremental") {
        if (x !== null) {
          this.position.wpos.x += x;
          this.position.mpos.x += x;
        }
        if (y !== null) {
          this.position.wpos.y += y;
          this.position.mpos.y += y;
        }
        if (z !== null) {
          this.position.wpos.z += z;
          this.position.mpos.z += z;
        }
      } else {
        if (x !== null) {
          this.position.wpos.x = x;
          this.position.mpos.x = x + this.position.wco.x;
        }
        if (y !== null) {
          this.position.wpos.y = y;
          this.position.mpos.y = y + this.position.wco.y;
        }
        if (z !== null) {
          this.position.wpos.z = z;
          this.position.mpos.z = z + this.position.wco.z;
        }
      }
      await this.sendOk();
      return;
    }
    if (upperLine.startsWith("M3")) {
      const speed = getParam$3(upperLine, "S") ?? this.position.spindle.speed ?? 1e3;
      this.position.spindle.state = "cw";
      this.position.spindle.speed = speed;
      this.callbacks.onLog({ type: "status", message: `Spindle ON (CW) at ${speed} RPM.` });
      await this.sendOk();
      return;
    }
    if (upperLine.startsWith("M4")) {
      const speed = getParam$3(upperLine, "S") ?? this.position.spindle.speed ?? 1e3;
      this.position.spindle.state = "ccw";
      this.position.spindle.speed = speed;
      this.callbacks.onLog({ type: "status", message: `Spindle ON (CCW) at ${speed} RPM.` });
      await this.sendOk();
      return;
    }
    if (upperLine.startsWith("M5")) {
      this.position.spindle.state = "off";
      this.position.spindle.speed = 0;
      this.callbacks.onLog({ type: "status", message: `Spindle OFF.` });
      await this.sendOk();
      return;
    }
    if (upperLine === "$X") {
      if (this.position.status === "Alarm") {
        this.position.status = "Idle";
        this.position.code = null;
        this.callbacks.onLog({ type: "status", message: "[MSG:Caution: Unlocked]" });
      }
      await this.sendOk();
      return;
    }
    if (upperLine.startsWith("$J=G91")) {
      const x = getParam$3(upperLine, "X") || 0;
      const y = getParam$3(upperLine, "Y") || 0;
      const z = getParam$3(upperLine, "Z") || 0;
      this.position.status = "Jog";
      setTimeout(() => {
        this.position.wpos.x += x;
        this.position.wpos.y += y;
        this.position.wpos.z += z;
        this.position.mpos.x += x;
        this.position.mpos.y += y;
        this.position.mpos.z += z;
        this.position.status = "Idle";
      }, 300);
      await this.sendOk(10);
      return;
    }
    if (upperLine.startsWith("G10 L20 P1")) {
      const xParam = getParam$3(upperLine, "X");
      const yParam = getParam$3(upperLine, "Y");
      const zParam = getParam$3(upperLine, "Z");
      if (xParam !== null) {
        this.position.wco.x = this.position.mpos.x - xParam;
        this.position.wpos.x = xParam;
      }
      if (yParam !== null) {
        this.position.wco.y = this.position.mpos.y - yParam;
        this.position.wpos.y = yParam;
      }
      if (zParam !== null) {
        this.position.wco.z = this.position.mpos.z - zParam;
        this.position.wpos.z = zParam;
      }
      await this.sendOk();
      return;
    }
    if (upperLine.startsWith("$H")) {
      this.position.status = "Home";
      setTimeout(() => {
        if (upperLine === "$H" || upperLine.includes("X")) {
          this.position.mpos.x = 0;
        }
        if (upperLine === "$H" || upperLine.includes("Y")) {
          this.position.mpos.y = 0;
        }
        if (upperLine === "$H" || upperLine.includes("Z")) {
          this.position.mpos.z = 0;
        }
        this.position.wpos.x = this.position.mpos.x - this.position.wco.x;
        this.position.wpos.y = this.position.mpos.y - this.position.wco.y;
        this.position.wpos.z = this.position.mpos.z - this.position.wco.z;
        this.position.status = "Idle";
      }, 1e3);
      await this.sendOk(100);
      return;
    }
    await this.sendOk();
  }
  async sendRealtimeCommand(command) {
    let newFeed = this.position.ov[0];
    switch (command) {
      case "":
        newFeed = 100;
        break;
      // 100%
      case "":
        newFeed += 10;
        break;
      // +10%
      case "":
        newFeed -= 10;
        break;
      // -10%
      case "":
        newFeed += 1;
        break;
      // +1%
      case "":
        newFeed -= 1;
        break;
    }
    this.position.ov[0] = Math.max(25, Math.min(300, newFeed));
  }
  sendGCode(gcodeLines, options = {}) {
    if (this.isJobRunning) {
      this.callbacks.onError("A job is already running.");
      return;
    }
    const { startLine = 0, isDryRun = false } = options;
    this.gcode = gcodeLines;
    this.totalLines = gcodeLines.length;
    this.currentLineIndex = startLine;
    this.isDryRun = isDryRun;
    this.isJobRunning = true;
    this.isPaused = false;
    this.isStopped = false;
    this.position.status = "Run";
    let logMessage = `Starting G-code job from line ${startLine + 1}: ${this.totalLines} total lines.`;
    if (isDryRun) {
      logMessage += " (Dry Run enabled)";
    }
    this.callbacks.onLog({ type: "status", message: logMessage });
    this.callbacks.onProgress({
      percentage: this.currentLineIndex / this.totalLines * 100,
      linesSent: this.currentLineIndex,
      totalLines: this.totalLines
    });
    this.sendNextLine();
  }
  async sendNextLine() {
    if (this.isStopped) {
      this.isJobRunning = false;
      this.position.status = "Idle";
      this.callbacks.onLog({ type: "status", message: "Job stopped by user." });
      return;
    }
    if (this.stopRequested) {
      this.isJobRunning = false;
      this.isStopped = true;
      this.stopRequested = false;
      this.position.status = "Idle";
      await this.sendLine("M5", false);
      this.callbacks.onLog({ type: "status", message: "Job stopped gracefully." });
      return;
    }
    if (this.isPaused) {
      return;
    }
    if (this.currentLineIndex >= this.totalLines) {
      this.isJobRunning = false;
      this.position.status = "Idle";
      return;
    }
    const line = this.gcode[this.currentLineIndex];
    const upperLine = line.toUpperCase().trim();
    if (this.isDryRun && (upperLine.startsWith("M3") || upperLine.startsWith("M4") || upperLine.startsWith("M5"))) {
      this.callbacks.onLog({ type: "status", message: `Skipped (Dry Run): ${line}` });
      this.currentLineIndex++;
      this.callbacks.onProgress({
        percentage: this.currentLineIndex / this.totalLines * 100,
        linesSent: this.currentLineIndex,
        totalLines: this.totalLines
      });
      this.jobLoopTimeout = window.setTimeout(() => this.sendNextLine(), 50);
      return;
    }
    await this.sendLine(line, false);
    this.currentLineIndex++;
    this.callbacks.onProgress({
      percentage: this.currentLineIndex / this.totalLines * 100,
      linesSent: this.currentLineIndex,
      totalLines: this.totalLines
    });
    this.jobLoopTimeout = window.setTimeout(() => this.sendNextLine(), 50);
  }
  async pause() {
    if (this.isJobRunning && !this.isPaused) {
      this.pauseRequested = true;
      if (this.jobLoopTimeout) {
        clearTimeout(this.jobLoopTimeout);
        this.jobLoopTimeout = null;
      }
      this.isPaused = true;
      this.prePauseSpindleState = { ...this.position.spindle };
      this.position.status = "Hold";
      this.position.spindle.state = "off";
      this.position.spindle.speed = 0;
      this.callbacks.onLog({ type: "status", message: "Job paused." });
      this.forceStatusUpdate();
    }
  }
  async resume() {
    if (this.isJobRunning && this.isPaused) {
      this.isPaused = false;
      this.pauseRequested = false;
      this.position.status = "Run";
      if (this.prePauseSpindleState && this.prePauseSpindleState.state !== "off" && this.prePauseSpindleState.speed > 0) {
        this.position.spindle = { ...this.prePauseSpindleState };
        this.prePauseSpindleState.state === "cw" ? "M3" : "M4";
        this.callbacks.onLog({ type: "status", message: `Spindle ON (${this.prePauseSpindleState.state.toUpperCase()}) at ${this.prePauseSpindleState.speed} RPM.` });
      }
      this.prePauseSpindleState = null;
      this.callbacks.onLog({ type: "status", message: "Job resumed." });
      this.forceStatusUpdate();
      this.sendNextLine();
    }
  }
  gracefulStop() {
    if (this.isJobRunning && !this.isStopped) {
      this.stopRequested = true;
    }
  }
  stopJob() {
    if (this.isJobRunning) {
      this.isStopped = true;
      this.isJobRunning = false;
      this.position.status = "Alarm";
      this.position.code = 3;
      this.position.spindle.state = "off";
      this.position.spindle.speed = 0;
      this.callbacks.onLog({ type: "status", message: "Job stopped. Soft-reset sent to clear buffer and stop spindle." });
    }
  }
  emergencyStop() {
    this.stopJob();
  }
}
const completionSound = "data:audio/mpeg;base64,/+OAxAAAAANIAAAAAExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+OCxAAAAANIAUAAAExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQEAEL/rvUDMOoT0wlzTP9a5a1KjGjWMJS/zAFAVMBsAExYQPzKoIY//ctrbrmmIRwYwo+JhVggf/+YBQBBe0DANoPmJmFaYPgbRipB0GLIIV///tThwvGAQCQgBMwVRoTItEpMsUbcwSheDGgEA////LxoB1Y4cbutczABZDDFDRMDAHwyIwXTDyDRMgsVP////1TuErgtOp9lhgBAAGG4FGYdomBkgCuGF+FAYiQApi2iDmESEn/////+YBQBwQAoWnSOBwBiKhgBAMGA8AJGAYJEYxQVxkDDAGDORGZb41ZpdkpmNEXoZFASRm8Dpf///////2bcbZ4pYYAQAf/jgsT/eqQVBA2e8AAnA467IdaeqQwwRfzDzA3MiUQ8wVgrAqB+YFQABgTAhGFIC8YOwGxgDAIGDACMYIwB3/////////7usHXY6Ku1jwfFFTv04kYmX7THMD0J8wNQIgoBoYHQL4OCiMI0KMwUQ4DEsCsMRwIIwcQuTDZCFMOEF0wagzjDeCCMYQOj/////////////ZswQwCABksVL3LSrRzjEGuOAgA017i7GGOou9NoMAEMGUOMxMwkzJpE1MIwMAwggPjDuB0MB0G0wMwEDATABCgERggAdGBGAiYG4HZg/gXmE2CCYFgORguALAYD4VAfMK0I1QEkkgGBAIP8aASMCYEowVgPDC7AI/zBGAWIhSTCaDzMKogn/MJcB0whgYDKqU4MlwQn/8yWFgKAyEBWZAE2NHSLFd//4cFZgACAcBBhsBANCoIGcxKA0wSDf///MEQzMKwFMYQvMBA2MMgMGkJMcRQMFxkMiwyMdhR////MRg6MFAJMKwNMFQ/MRwNMEAIMFgWMSiPMPCYMhCRMRzIMiSF////8wrCoxsH/44LEqXysFlTPnugAGJABLAZmI4GmDgICwZGUJyGKpPm1yOH3SoGT4wGFoimHYzf/////mCAJDQCGEAOAwITDsFzIERxAGxh4CBiIFRhCFpiYCZgQAZgYJppEwxwE5QQw5jUQpgEHf///////5gYIpjGFJjSIpgOBhhEAwMAYwGAZSA8FIkDYCAwBBQYzC2YJjcMAkYdhYYJAmYbAgYIgaRBoYGBiYJC0KhaIAb//////////LnqfcqDlrl0wsAwCCABCIAQRDAPMIwRGQGAQQGGgaGAAEOuYAgEHAaq51xAGxWHRggCcZAoBKmMCQAIQXMBwy/////////////zAYPzGMLTHUNQsEQCDAwiAZBtCNaynlrrRAIDoRjQZAIIEx1qBcEQEEZgQdpM1RhGGAsERggAJEGocBisRgGCBgQBoQEaaqARB4wbCwwABMwQAxrxECKnCMCwBgtERADs8SzWHTNMAIAcHAGggAkwHgLTAQA8MIMLozN3/zGkGrMSgIswPgCzBBA6BQGoXAOLpBwATYUimBqhAACJgmASpoCqw/+OCxEtmpBZMAd7oAG06brYadDmwJYICgAYGgUl0wdj7V4FdpTF/28lSJwBAIwHBowCAkIA1JlT0/BzAmfQEl7G2KL3c1lMRZKlTInJQJLAt2AoFGEolGIYMGHrKmCH2mjRdmRgcp3AEBgEBz6skaCx6Nyl2lMGLxNZDKotC1gUcVoAEAjCERDFUFjEERzKn+zJ4nTGQISIBUqljS7GZiaxpppDAUgi6TNmwL9tLtjrAYLl61mfMqYDchblQ00afbkz+axZkWiVdDlJAkJfVoMAtBjkPWWxYsBcxnzUurDu6ymRXY3OJXGMoRl6U2IhHIHC4EKbQ1J2nP8wFTJmi1mVOeptL3cjUkvsyTdMBglMFlAMKQmCAyc2LubHF5Q/Enev13YjL+tlo2/iaXTU7LJJbBScyVwQAyjSwb7T6D0C0b9Voeifg4EVs0sZhp2lnQTDVCqk7S8lxy5e9qgYFAuqYrumAsAQpmylUTvS5WAwFQDjAWAbMG8Mw22nHjHfAKP8JMONBXIYAKQDlamy70KUZl9M9Eq7TYAkrav6HDVz9dP/jgsRFZUQWQKj2vJydNy0mi8yJjFn1ft9mlrWTmDh8eg1f5gSgdIRUi4GDu87qpoCZZSrU5OiAm01YFlQ8AKvtk8tWmQgEDoBJgGAFGBSBuYhQRJpAnoGDGBWJAKP3HCsABIRjMNPqp0sBEkzIJghQVYOXUxf5AMnA2zUCEAswrATTH6RAAQsRgBABtnTlbikQtZTJkA0AY3CCUXTARACUWWJRpWRtvV/w8qk70agJ/oinEpOmptXqCBm5KMQwoerNGJDRStmbNEg4izxWtvljLBNhVVae1JAe0poTCWLLCs2TDHQFTAsBAVThyjYKjiXJgd+aVKRmDNoR6+H3cxAG779TDurOYQgshNMBEV8FAYLjZXQImSB+l/Mtht3oYUdhuHoynUxdkaC19WF/1M4haQkoBkraVU6gDFIHflozusiU0TLZ+hvLZWquW7L6PuoM0Fo62mlrTbdi6EswxAAZY2UwDgDWCiMA9H2PoAiIBsGABBgNZgtA0HDmbyYZgFR1jnY2PNmCHMqLxF9AuMgOYqjYHZO2jgjk/qXiHYhAEgX/44LERWYcFjwA9nyYOhKxv2yLTRJaq+j+slWAo4diElWivBZRqAr0SKLADQ2Frvlyc8GxGjhotyqPpAAEgnd9CShKbsCgAYhKRwBIwgw7DUKJRAQcpEBUBgDVBl4qxNunKytt0/lB0AyeQwACnXZX8t9H1TFn8QS7BABhhQgSmS2a+CghFJtIR/LOPok4GAIsgl6+laSqASkI2jRHZmyYAJy3IcmNOUqWJhUA1YVFZWOG5cptAbfSsSAMfiLJPIsw4RABNlsrSTpEgBpfeVRkLQUGH+VgTuTlZaq1RNJvk4zVVJBwwJAT4Ac1j78tiS2jiVMjTnamig0JIuaWHZ9B6+1xrsjjNJZA4yAOMiQIts8lKPr+oFMLW6wV3HJatDCmMNBABqTKLiHNtF8M1ZM7jPXaHACkmZG/jFQMAGnO3iGbTcWjKNqolv1OW1jreJFlz0flVY/aafESIABFNZysVQEKC4AjAIDAEGXWEo1AlDVliQD48BYHCNm9UG6YhYB5gsAEAYDMwEAAi4DpL8dxgYMANel+CUAhyRYANT7Mn9XW/+OCxEFmLBY8APd3pMrXsz51VMFpJqJaKueRw3+QEJDJ6rNV0zKCy0xAAGUAHlorbol9pl93vRHnZ1P11GvIC1UldK3MkWe5yp1Yk9SqAAQALmAIDqaSIephegPBgGIXAAuqjhKRQA1F2Bp9MIfRYRdjE1TFs3aWSqZWxAQ4y6VpmMwmnSV7GEQBAoAEzmmsDVrgOEv0HAK12UggHc1TdLUuk4CZ7W0RlBnZWKXZipgAAEBzToy0PNFZlSk4FWGX446qREBKApoMuLlzaZEBIQNRjr9RlYd9GvMOYy66RCg8QT1iivValjmlgQOAnSSIjkEigC2rWS7RbEvC8YiC1EFQMVb9czpv+vNBRq7NgcBpyg37DANH+VtdVXXK3FLxpEDqnfUqACuYCcVJ55nKRZg2BXokKQbFRUPQmKyLZgFqqqCgSJy9Eck9FSskcpg67GnQKsArEwiUq2KcNzVhUWX+kI6FhSaNEASALXSgLUpVvTcR+EgCRYHcwngODdJdUMdIBwiCiCAUQEBSRDQGE1gsJEMYg1tuwikTwTiEYGLP//jgsQ9ZJQWPAD2OrjoJ0xU9WYkhEJ7EFMiCBfbJDJpYMEjaxpXz+pCK9gJpAap224LXeVeal7uIyRlcTd2OkgFOV6OIkKgCQmowxVOQaAMmAEqgAYyJYeUZUY/BCYGgMrbDCIaQbJ0i1uiwCr2LzIZLpLjs8LvUynTDka0K6YLgKAgSMTwYPd5NMWAXL9A4CKJ/Uu0+HnTTTofdeKgoYACtC22eLMd++6EEiMAGFLuZSBQQRAV44TdmBom0iPEna07ig6CRiTLW2b6IIrI+w5ZYjD8ljYVBEvDF3QTiZeiEJARNydg8yqovMxIApRpyU5m6vTH1ttMWfAyxXncpORFNhaNSMiOrCURmRJfOq+6ZBhofTF3KWAUyuvGhaVgA0Rx1+QFONlUTQbjTXmBNbSGT5X3FF3kQDFwYg8Cgymr0sBXfIk8mLsCduJqgZY2zM6RMAOAl2G/obryJ1JbKnWczWooC1kyOij7nQU80MLJoW3HAFDAFA4NIR5cw6QZy3BkijYkMrLQgXbdQFwhMwt0JSQl/V9RWZW1fgJxlBmMwyn/44LEP1csFkgA9nqMZzcASZ3F+J6v+78SvV6ZP4uxFIYh3J0GjQW05RqfnmctaTgdiOK6lcdiz2yV+4JRUMcyBMCLJAwzKGphSFYCTzkgkax6RujYHXpF2rXksPNPuubF13rCmBgEHYyMDwJSWPN6pe01z8s5SvF3IoNATNwVSwJEELlH4HfFpTlt2HQLcZeUPrkdxnCDsWd9XbI4q9EON1sN/1rLatzd5li8X1UtQQqjbA4bQIvKoEedw2mx6faQYBg67UAuc9cOrDTEUlb/P+6z1ROFObEtsNbyKuw4LnLzTIMFydtwzD8RkTY6brjP9t/2krNhjGT1JcsFG2WRCPSDBRF3pleD1SKINicZnK76RpEqa67kYh6WsoXdMR1ubdl6uqy+GV8O5SQALcYYoAiAWcLQF8ISwMxCNVDgQhDAzxowiCoy9fOBezSwEyklEYUYcDGDAwGBExITDa7y9CpH0lT9unD+dPCIYdy8yld7O2X5v+sOu9MN+meJeFyGWKrwUwwuosRlk65a71BGWWHbXOyth7tz8NsDXew97qZY/+OCxHdWhBZsMMd2YEX4GHBy80jklYoAsSccNTNQdFBpkFqBoPly1L2wF3DCQ0w8RMZKzRU00MrMRAy7bMEPzpQVSyGow5DLH4j7L2IORDj7tfZW1+FzjW2Xv3TugsRExZit5gw0ZQSAYkQEGAABbRMB+X3VIsRiECU7c1jrrcuZdtl7lxvCIOQ5EHxus+jWIYhijh99H4hyzE2DNu/c9Qw3DcP5VIxEJyNRqMO5hO1JfL5jK1YyKopfwq4zmeWdzOjys7zrxuNz+N7DVSUTkZlk3byoMJzLOXz8rk1+1G6ebzmIYjdqAE5EVFYHIficgCAQoAEgY1lIV0ZplRf4vEWaYixFCcOBsxbcTCgOMOgQLiU/WOjFRJMQBkwoA1q2FMlNmHPfRSmbZq5DtQ1AUPyp2n+l129Fbu79a3Rwy1l3ZDcd1xWmyHrtM6ac5VLfYcu5iUDR1hqgrJqOAWGrFa7ebIYGJHAE4cEymGW5J1K3LGkcaYEgCZVLkvUiS1KKMyXlMMHzlgIzkCcNdqcq4TVBtSlrru00Wd5/o1t/oCfqXf/jgsSyUpwWcO7m8Ryoi110ZVBbstdeWSKrCMAQDMVMfYzZhMwIBLsuq+xx0e/AIq+QbIGiLJBDpKiaABiESsTtQWBDgxICalCzYtiaBhAS6LdgcJxnezqXIlcxc27ektBIi61Wwxs5Vvq4cytU1mAsIleIQyDuNX8c8Lurc9zkxcpr7EsKufI/S46rTFznNVrW7V7PU1c7Lf+1clus4kCUrpf2rgpMQU1FMy4xMDCqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqcRAHqIQDsomSsYdNkUErli7Toi9LlNZHQkbUjCJRdgxrDTz4sMJBkFDBacgidWH5qAbTdYEhq/k7F6lwfKE1ou/lWIWoclS0U6muTTLYIT+ltio7ciry2HYFlEulMdd2L2q1Sfvao703AkpTbNrE1XXm0ZrDauILlrbM3dWGZMIQBQfFYd0o6MBBrc0ChR25ZRvyaiNNnqZWblyht2a9nnOSvKNdlHb/44LEp08cFm4+5vEcXVbEuex5U3SxYgQFhrc7OvqAlCQY2yoKgQ8aykitNorK0f0qyoURgWAVWRzCCl+S24WBJi0AVxQzsEOZ2tBj/NvJIYnMmpvrOWI0/zdKecgZ+IJjlFOSp1q8G0tfg4LV7tiko9RTC1LOX7Uuv2vSRpcJRLvktbUhh+fmsnJhHwfYgmdjURxmpZ3GYn+Q5MSo6CkdexNVCBHXBS9V3TLpL2tqwEssXxGQFjAsA1NP9DcwbgXRCDwYQ7kZnQjuGEsA4TEqgIAtDVUqHqUkOKbo1N4jUQADsFR4SQQHqgKoCgUC4lDzWkKkbn9gJGiUgkDmnloGKqWLPWAV82BLiLLdQSIoFoX3YOjSlmtJYVr6jaWSEq2yVrDbLRZo7cBGEQvG2y9AYIUjlhXhnkZgaAdCqqztzHOfVCamVAJIBrQQoBAgGMyP8EwUDUskjzXAQjG1R5goNl0jwBMQUGWqvlYzusMR2birM6yAJQ1UsGqeibBnYVMIQXBgRrQC4ImWELm4YRgYMFa0VlY1IlzkrmmqqMsehpMK/+OCxP9mLBZAAPd1HGmIiruVjf1HBItShw1g2XCQd9UeYkzIcCrjaipkma3FvRkCgDQEPOsK3F92RwVOxSGnSVGtZQRMph6byPs6lC0Fr7yNyeFWFEYL3UB6dkZcWXy1Ty04ZTRbShYcsQRhmtozRwMjtPQhLKvwxGGVLE5y48RZQztTJeTFKy02oJEPJDdlKmLJioYsMaYiO6CgjjSE9YhWhha/1mJMQU1FqqqqEIABIM1uLNHdXWqhWcR/G9MA0AFdhgLgEGiAEkBiGjAkA2MDhTk0sBzDAgCiMQYBkwDwJkHW1ZYlxi/DRmGLuSXcJrSYrKcVuFlFvq9Xm5sBMCEIDjkExSKvApy01abEhQCP0uhGVk6/oCWWqe00xQqKKVskf5Itja+WONzZvIFNE2F6GOS+YkpKCyE3bDLjoMbFgEqRWBOJnS0UPEli4pCAUglwGDw0eS+BnUFCwVaUo8YKBJxOfEQsqu66yw7KVz2I/nF45DDBYJbHASRKy/f9/12CgPFQmgmMDhI0dBDyoSDBLmuyRg4mYEI8KQY8qMqEFv/jgsT0YoQWSA73NRwkEKnEXMYUKKAS0xddn4oYXWBBIqJkjOSQasGKAS7QgGMawhc4/j/RhxggK0iHWuvukEvOYf11Hrli7WZzrIn4ZLB7cmMNiTOXlK4Od4KSoW2Z6Z+A8opIuPa1Vz4HhpRp6U6GHjgSXP6iq2HUocdl7jsDiauHXcBdDj2ZC37S37dzj+OPL6ZmzY5XPLsVVNc9XG02MxlMQU1FMy4xMDCqqqqqqqqqqqqiBQKAAcEozJrqgrdXWbhG2dsyUOJgCgsA8ZjJCBgXAGBAG5hSE7mugCeYHoUxguAKkQCTIYyvtksPw8ul8Y0pJ2mYOY3CG4ZXI+jissS5abHoeatL2pyFazPUmG5sqaA3F2Gw+2jGFzQmcUWl0My10qB4HDdOUNOhyMv80RAOAh6b5bhQAookqtgKgZa6T6SxdZ/S4QyERgHIVl0BEFgsCTC4GZuYICBzk+AJgDwDWJJwEEjVj9EgjPyZn843BhzxQxBUDPqyqMu/D0WhqB4lNWWbrgRzV0IQ4O6o0WJkvXCm3SMNBOQ13/44LE6F9MFlAe9zMcJSsDZF+E1RwpIQLBPWYRgOHbYwiy3IoEmkDi0LVGEHy7AiCkydU3LWfxFuz0runUS22iU+zWbiUJYjL6SNWL7KGyzkafBypiNQKz+XtkTeHaaKOsyjfv06vHJflmr6SuXMxhqTwhMV1HToXjkjW70PwmTu+5sZbG4rZ5TVhmUO+1t2JbCY3egCUSKNP+/Rg1Ps3N0pfVTEFNRTMuMTAwVVUAQGAR7GIxgiIuM+aDz20b5rAigQdBjMvYxkMADMB0CEwwAqjaQDXMqqow2NTCQEYsqm3jdIqOgFQZRxgCwrB2iMAUYheKwzuvr6jMmeVxXzaWBga78hWQlzDy8okrA0mkaZKWxO3B8+0CCmbNCL+yB4GksTfF/HApn+ibCjBYaOvJESFqm4OGCVaJabIBByA1kgWC6gYGCqOxWEBoAg4RpwpKDoEC4dNrc0RCFnCa8mMLBc1XHGHOHJWdtKYg0iTvJdbLJWkPBFYi37xUkXeGLvGBAAYHBz/KaGb6saSDQXAKmjhtLQ5koHKAMuEeDpcZFBQW/+OCxPRifBZIHNe4ZHmnjgURAUALyjoAL2Q0GAJAOlCpwVhVmJQAVgBAFGm0bitNhh121dFFSjUuetuSuSIDx10mMLArsjyQDiNuzpt3uYk4sOw2p+MJpveIxUrXG3uj8khmH1dw8/7OmyyJ6n/jrnQ6hVQNtMfDTiw1NTbOInFlNHnZ2zpiDZHjaS/7zM5cWlfGJvE/zEYi/jjFgSsReV4V7BE41IRHgwY8FExEOMsSBgczJkBMTLmzNgzCYhjO+hjBMDTE0WzFafj0IhTFUpjOR4jkCHjXguDCAzMokcMJxiATCQUMABQFCAv+jWsguQreWTX+hLZ2x3JfCk5POP5Dcw6ZfNsSRD0L7THTTn3EUeV2ztjClD+pEP6xNfyRDoK3qjSsXsrYnQiGXbRALoJogEVm0Q2GDNxkxFaEJ69y1AkCEqC/CIZb8hARZhTEAgMvcDgW04RB4xdDCghMbBgGREHgsY6XJVAYCA4oBAEDAuAwEI0ljBgMQnGIA0FgaYzKpn9MmmzCYRCRiAGIcTAwCaSgevguIxlNYqARSxKwwf/jgsT/axQWUCDXeGihcInoYB5AoxPrBtspezpdj+uG4yKitqQ7+q3qXBAEUxBoDSKMLCoeHpjodGLBIYmDxakwmB1GQAAFeF12KBUAqTSccxQ9QNmCfDRkVHfZO7iGERd9s7C2bKkxTJh+QNpuSw3D6vIdIQykW6S7H/kk7D726fFf0YoYfeyNPjQr8dBSl0Hokjjx51KJpTZtPS6lDJ5jr0Q803B6HtjcNzDSJI/kYmH+BgCoXDae0yoN8GDJGRFCUIGFzJAUnjWlkKzHijYlzFDzAGBHMMFBMMAIMDEJswE1fDCTE5MFgKMxkzSDOPWhMLwGIxPEQaG8waDkmEAEhoYAgOYHgkBgCHgJCwAqGNOcBElnaBiBGOEoCsQJQBFQBQqUgvEWAJIN4VNYiocxBRlFNVESAFEaLDgAigAFpmGBgEJpKopBDwHpUPmpBIEuDF1JDgAlwAMBAsBxgsFhmwewkEoMAVxGEFYAlgB2FsKDANL5BgBFwSYFFPjwLJRGCQHiwBhgEmAACmip0g4fXxBwGonKYmCyeAYDhQAQIAr/44LE53dsFkAA17poBgARSYWBAHJAOL2hcBDCEFjAQPzHbITE0JDAYKQcChgKCyuC4y9kRHwTWTWDAkVaBATMKVtMkgXYcXFZ02cRgCBABXupi8JMAV5ebZogwyIq3oBURRUAHzDAMfMwxEoxNt0w+FkmDUwLAoSB4LAWDgAMAQOTGVuLADg4DUnW+DAOcF4WGuErcrcw1egEABE64XBXeztsw4AFM01vnAvRJ8gwCV6MQMBg0aclCifTUiVzOFb12qdPM3y7qRuy8mEs5RDZ0KACrc8LDldpWq6RFUzSgcG6piiemI4StimL5sNXa+fvi/zSm/Yop55nipSYJ2IN1YgilQcKYnM56MKy13BUAoWA3f0UANMAcBgKAFgAEgyFEmAIBUDgrDBVWANdkVUwUArTGfKFOr8voxZQhTrQDali/BrQoMMBBqPPcPTlDFKW1L2jxkBBAYCTpY6pNYBYAIEhAZj4qDFmK+VaxUMLCmPFQEpU9biyGjWCdQWQpDIEFO0QGxIUrjXasGAgaXG0pki93QAQLJLl1DC8KzBNVWkK/+OCxJ5t1BY8APa61M72Jyw4OALHC1bhEACpisQXaJAWxGRoruovQIBc0oREoNMtQBQFWWECGYnriBgKbIFgRKAIUvQmonJZOKPAYianMYS6qZLA09jnL1SpUbo0mRIBgsAacqmK+zAMJzDxwTJMIQcAk2w1nKUiz05n+aSxJcRa1sqQoqAqvZ8uJIEUplJsRgOYgA+bKUwYXg0YIAKuNB6cf5xs3ULmOtJkDRYFXSUPaYqJfKaaCBhyIi84bbRsqlrD2NJpyRKljOKi7SwcBCvoYFA9R0fygddOR1VJL3cVpaVTqJEK6cFStWdHVsUypuvdXokCrDhGAbDYeTqAIBUScsPNObSPpjOqie3FTlIBcbpF1G2QCq8LVRtzlxiQWqZQ4zhz1YBECBnEwUlSgEdMRahaISAWa4lSYCgBYjAIBQFJk6mHgoUEwMggTCVJAN2kEYwIgZzCqIVOUI8AwrACTUwQmWTFQQoBAUBKVv4IwUWCEWXDa6k6WAyMiwO1hEBlkFPkgwtdrgyBxCw8hdJpshb9lUKegcDkzXmYyhe1of/jgsR7a+wWQML2+twgZTZNFE9WiTsfctcd1FxjKlbHkh28L/mQDB//ACi9XjLy5ylUCg4Fch5C5QKEGmMIEgZShJAEgDkVxwEjHlrgqACmJKASlpMGJi8mQ8HyVZgEAqJi0nppoOdhrbhEgGmFl4mKAMjwIDQFpcMbel0GtpiSELgaW9gUSAsxmC0HQWYCAC2PVMX0iNKtpljWFOmyJ0OSpevV/n8gJI1zHrEQRCQTmuoaGawBEwJp6J3JjqMo8ymmQHJOyl80Q6JAemugUQgC1x+VKy06KzkMwUWZwmG/STTAkmXXQkPAgFTEbI9Q4FkVd5hLkO6NAC1tShrUWclRpW5pbswCpisAhBADyOe7K7Fboq+KkCUAX+f5MZnSh7nt0gdCS7jwMLTFccdAGTvg05rrDG8VpYiYHgYr5VdrT/oeLyGn3Q2f93GWTbILZEAa7FYzc4djEcAzAMMDJNMT5swDEQgzCxsDbHWzBQTgKsxqcVdDK1Kn5nExXsYvOtsoK6qwkpZczZkTqvvGpdDVEymZQZYY+sHKTXa/C7mUQCv/44LEYFpkFkwA7jjAyhyBWBrPabBjI2jNKZDGn8dyw+sMr6ZtEgCHjYQrJgC1NqDQn4bnORiFsFiE5DShL5MGmWQrmEAJMWs0OINSQyxbxlU+hwIYk2V41MWYRllrbP46rLzF1FElvIJW3CGlb6kHUrovysPGkfjAymATOXLB7EWYx2A19NHhpYdvmROzGYYi0bpXhYK68SXeOgYzZPzBwFUWaKriYbu4rlRh0atCzJ0puNTKmcPMwXy7T/2X9o+ReBHwnKrB9Q/G5A0B0GFBcEyDJWyerOi77lNFfZ4n0lDqSB33+hx+myvw4EYlDSFTUsIZSzB24YfOITj+x952sxCZZowWNOo5DwTc3GWUUooA351GX3orLEWUdV40zkKbiz9sqzYYMABA8yfEMTCQwMHfs9qbDAkAHAgUZpMjTGEyA+BhhNttM0qIfcuWEwO9kH1njj8harHYAyfyJrQYDA8lb+Mw42BhlRpTbxN6wKAw6/zDnEf5u60I25beOxHmWqqTkWeiQtOZ29yqY4BnDiqIz+uK3eA3CcFNFp7mxuSR/+OCxItYbBZMAOe2oOf2K3VxswnXaNoHB4yZY9zeoDDSlaVNwn3epKzB2PwmIzDYixvmcg04/0VhmXpzu+0h/mtNCbi3QwumLsMvfCCmlOe1qFpzQllLTly0Nalbo+0ajT/Q058VMIATEuQHGUE4tJedkL/sSwlEWghrCvGTuc9rrRd12LNiiMRdybhlrrYWsSpsNNInRgaPOli8SfjnvIrFi7D+PtG3XdZjT/Nlk8w7kVn3ceF2YHhxrbnSCs5rsteg6RtPXG51LIocxbG/sRir1NPli1W0eR/Jl6R0AhtsEmilEicsO41yER5/WmSddil7djAMBTT4/SIgyYGDAKNTJAnDANA2MKIJ00WiYjCsAJFkJpyQRfBeDbO4zFu0CvevGD4GiS8H/c5E+CW9a9SQ3LnNcx+EdX7j63nMbEykvys9sUjqNgs18pe4D0QxFoHc9p09Dritiij3BQANkUkYYm3joOTHHZrRtdTEFcuQ7jYo5CXEf5TA1dqJhyRqdz6gxrqa3WLtJwZe3zyM4moFbqvMC9JpYDKFTqZPEuaG2v/jgsS+VywWTADvtqDTosraQ3ZsORiZ4EWDM3SadRP48NHNVIcrOxVbjNxWUZP7DsD7aQX+NrawhJcZn8KUsmZDLnZlbqxyvAzmN0Uzfey4sNzctnGntikTzRNp0y48fhLWX/eZ2Y7mra159rTTn7W+sSD7EOs6iTDYQ7sXn5W2GPRR/JuROFafVf0Xjj/vW/7RI5JobabDzaQ/TTutxmnoaSbdOBFV3vkriYISDhRbWwnKk2FgCkt0D12FACZUACesLAMGIqT0GBOGDKAEYAZBZntBHBQEYwPBvjIfTHBgNxqQQYXAmilBtBAZiemHH5E1GkIBgaOAloygMLACWrboNCZaxR1TlRx5HbZtBTGmSRdOp5S/rdFLFg0DEq1DgoGDQu/xcxNdVF780AAqFq7CwA4Ltq2CoChIpSgCVSL8pDqHGBjJi0/kpyDQB/pC2N/IhIkqYGYeyKXILo8PCgMcURhkRQcEgV/0AzGkUTWhECAGx1WBWN83tFAS4Duu3ByLZgqDm0QWlVJmnJ6MTSPQkPAX/TSvMfZSYrSJQ+HdXG3/44LE9mdkFkQA9vjcebzSmTH1MJM5SSaiTgJVx1R+Pq4TLRzHAA2YwaF0tDODJFhMYJB6WyvUc2Xs4rI4KRi6qEld5A5yYHYY3d4mcMvadJoBi1M7avHaU+txNNG4aANWA1fouSEYBzKNQPSNJssMXimeggL6pDgEAprBAUL/ppKwKxQOvBiC1FoqVwG9T3Qp/pE90DRdVZwWW00AOA8b/xdwGW33Igl4FwKxqpCQQcekcR/KIAAMIAEIKdjDjBIETB0HAoA6iY4BwQBaLSRY8EokBRiwnJhQFZgQCxgEKJxUPphuHQwWZ7CvxlmGRgQG5iwIphuVRlCGpsQa59QzRnKJxhkOIkKBhOHQBB8ikF5g4sY0VDQECjgowJMHEwhKDo4QGAyIKEw4E2BMcSASRl5WEU4cELglKXLQ6Aomjgr5LkHEnZCwMLiFK0rUHBYmn0rUYgKDgTShwKpQ3yaJ04jXa6l0Cu2zhl8UgJvVsvExNhrXEFi+rnFzSUEZaoLH0uFCqUGAzdg1pNKJQrdm6M7VoY84KJyar3gyeCyz0Qtw/+OCxO1sHBZZhO65HF22muElcmqnorpB1xETQZjUpaa0xdzgr0QlQNCr7evM3ZwXwXgvRSTXgoA0CCvhQGmDgYYfDhh+UGngWYDBg8B1Wt6BQkHBClcpAKz5bxYAKPqA5ZaXqAlgCfSy2ePPAz8xtPRy3Ia886pVYEakwXqUxVStOGy1e0fStQktdVmgNxW6N2HACPBUw4aQFMzCQPRMCAEnqoSxh72HPjAsUXtB0E2oFiTL2uwQ5T00sceOmktaDKWTSK4/teA4KgN4rPHdZXUhAgcYjAVFigB3voli7fmPrRYSDQYAC5GBIFCgemKhhHCgomGolGBCYnzDPGRAHgITjAgAjAkITCoajOcsTWsD3CwESpVA2SL5GANWaDklUzmTxtdzBm/R1WFlMwtF+H5XY7z7IOQxGZItaYiMfWiuSdi0RYWhon2raypQN+Hcj6w8sfhmsFKDG3FKjD5pMxCgZkt6NSlk0w9LMJZHocmW4v+tA1UMJhSGZiysEDqV3W8h51HXZu4rkxlsNK1QUbR53SBicZvP47bmSyHm0bG4/+OCxNBd1BZNQu+24I+xhR6GLbG33lLI12wp+qFnE+wWWs6Yw/cMS7CAH0dJRUhHjCRo4/HO+CQcLKwzDoI3MpYA0t/lrqoNKbkqeELhQybuu5TmGokthqTuRmRr6hhdyKTUotDkNRubh/pfSGn7dJ4qBkbuTEZbmlqHBo4ynYhDqrs66UacWHr03Lo1D7MH+jcScSGIm3N6Is3ky1GNw+9UAqrzbXo87EPUi/Yw0t637bjG1QUvr/onJrNZSJEYFvTEC/rFmnBYFzP9pTF4ADDMFTA2LjR4xwqCZhmphij6JiwGgVAVAAEBgGgOmBAE0YaKlJgek/mC+CoYEwApgLgLRQMASJAvm2NrJgQAK4SpT4bxbzSysCXX9U7tpUssiC82Js5SpiiVyKqCWLqrOU7wVAa4oAQ6PItdFBBM5LDBQKP+sCVQYmXBIMEZpUCoSnlRSU9H2uBQBIJhUBKwJpJCMYL+SaBSYEt6xsLAsy8pQECyyDKWUqOmeR8xFnC82tRJXZQE1E1MGVtfT6MLF80iCSYAPevdXqRrOFdl34FZW//jgsTtaVwWPADvuMSDEIgYgIAQxkiHDete0AoJi3KKrC0AbwwCmq7SlbZokCAS2BKx/3eEg2CBUau/JgMWrdhCLi1UTkxmcuCmcw+69kDLtSsuJnIw+05psGorOGglVR2nhFWXLSeBrVIhctJs0FImlQGp8PGhen+rp77av2IuUmKPDkGOExWKCYCJGMRgFywaAoCXgx0ZALH1D3mLkyNpila9oOe5MVsLjoq6YWthTYs8t5TNQxyUFHDTnYig07TS6rkU6iKIpv1wUA2Otqpu7KqcCIDGbhUNHTmwiuUCAw13jm5PMAoAcwqRITRHFMMJcB8wHgAiIBZOZMYKIlmpyGWYL4HRgGADlsn9UREAq57+N1HiCVwEVQaSOSwlfUKd5TdNVpToK9VKw9mLU40rbLW6w+qJ/5S+6BNjSX0hoUfmysLjxbtTtlJKAIPRcvYaUnFYFHmRsZg8skCgFU6QyS16FLCRqJLEVoaQmChwAEw2CnUDjamRrhjAREBLJfhVBLVIZfccZZCWzGAoJSHtonKsdzFSLKhqdij6F3Ys/wL/44LE3GKMFkAA57aoIRAEls5K7mKO1DCNjVGpVWbyRQiJo7L+ok9Ev2KLzlANGzEAcwASB7mNACvk2GpIcigRZZLGPMtaa0hgbL1aExS8ijzJ1JSV9F2peL/cq0/rBZfH2Rtr7I1h0m33fodAGVQElQt1jLuKfc9QlfVoviQ4ZEsskh6OMtX1AEAp3PswdkKmrKWqKDNs5ysbMofhLcGfMfZQMgKkoVXfxqKUzUYQspTymUKb9hbFGQJL1SIXVMYqAFr3QKhxF1T6KhcyfUpLSmPyFKPAgmA0BWYCIxhm7g0mBCCSYIQuJq2GbGGoByYDYAg4A+FgOjBPCXMSwpU7HSDTDpBQEgmAgE4wBgCy3wUDFi2yCMIBgtor8KQlQddpdVMcWFUVAgTrtmSXcJD17hY9MYvwZpSv1bE5wg5uZihq6UuLLpziQqJqlo8LpFSIwIeFQRd4OC3vLSA0fMZjUODhocUxkXWGCwalighY02ZF0RhRZZnENtyUULfl8TfX0SMVdIlFvlkm5rSVjZ0C22TpkpcRFUtQlUvx8Cq7kbs6/+OCxOZstBY4APZ3DOvsSFAcEpAhcNXm9KI7ZoyRBSbJic0AsB7krCgPYijs6RcRA5XSQyQK8VZE02JJpw2jAXbHAppKmAWAy6ZvHEdySIUr6olHETC+5cNKmNOY20PPYk0vabX7IUQF/KZtKUcRgZ02ZWlIR8VKmwqcNLycdChxG1aWBA1wIYbIIgNt0mkJjqUC40mBZVC3mcYPKXL1RHokHlMUmVnhYGxSrXqVQRQ+MMZhxpKnkRUxS5jpF7IwXMQ4F8GOJStoswWB3so486j/lxEQk5l3oS0kAmLhxFMUK1ipzt48jEFmv09i9jR4rQUQaVRiWMZ0GDxgoIpgUfRhNbooCgYBChZgUCxh2NpphrxqnkcGAGAGoYsH1XGZQBMSTuUvgBuo6BvHI2tsSibsPSlarpjbnxyDFcP5kpS/ijjuu7IlpNbYvWSNYWyps7DJA4CZzuVF2uxAyYhqp1E38dppDsvaruRqRbK4DKl5QPJ4hA0he1nRrQuJGdWBmW9MyVR4DVZFaV7m8TLitKsE7sFGCC49xwQ05sDFIBelzP/jgsTIW+QWSUDvtuCs8LfOBFlpg4TGpFu0Qa82N/oEazBa94FfF3LbL3Ogao1l3mmMQb8FBBcsxX4MqDHPadfkDCLOpNVQNpXhfxacBMNUthTCHoTvdtj6tDjyZIaQt0eFxOVYJciKUjXnCQYemKp0wM/0KXDAMlp0qErQslhKQtSpEmkvW0+ROAtWBLcmSPXY7bgv9ATvuzHFdsepX/porFWuvN1nLZ3cgxju3NV/VfBsccUrDAbGFAB9JFMZUwbM01RSTIpgwAYxpx+CIBowBgJDA5HfMrsLowLgMzBjDxNc0pIw3wDSIKgWAPCAGDATA9MIqHozbBTjCsB9MFUBAwBgE0JQYAyKkMY12IrEclFU6jgxdyFYOXGI8vcKKTqaa56lYQxK6Qr9YkXah9sKmalSwkPBCkhI8DDthV0rc2FpKV5hQmibDSEseBEhAKGHUFqynWLAGuwvcssoBmmPisExLaElKtsUMMZL7ITxQQNdziyjc1xlqVODUaYWBn/VuUMXkxNebpq+CAZW0WDl7A+enWIyF8WJlUNEQIsgt2r/44LE7WssFjgA9jcM2vg2R8ApegKZfFuS7kYnPRFYkrxsU8rUs11VLBwDUNXwBAWSL9U1SpIRIwsKOlhx+9UUe1pCcrjOIQgbiLum17q/IQNXyjBZiRpyQ8lYhY4AEBS97EXBHghEhKxOUeBlaECT/tspsJBy9UpiERepeymyOyVJdkML1Mm5tqkIlUIkE/wFexKpscdQQoloIFNHxXu2ilIkEsboVNVIxkva+BdFKxebYQIBoPPQr1ITTrtortpyvF4LMUqcGTtu4St6KDFikpT4dyLSt5HHcBlbWCUDzJBB2BvYYHKKYiiQAQAMXD3OLEAMTAHGgGZqscwUCgyz7o0WAwDBYANMA0AxMBCcmKFARcSQ6h4cLP3Gph9XRZ660Tus5cddzAmkr2pW5vy01mj+vZUXfAcjXQpmuyVSJsNdFtuzmohSmN11F4q0saq5O3NcMdlsWeiAlfJ0NtF3Ze5kKlK3OqTcUwlTCBGHG4seX8YchtNoq6eLTYZhlmr4KJxp/nRCJZl8jTcaY6LfUcMyBU72J2U4AO0g10uu7K5F/+OCxNVbnBZIAO+24KjZog4MXXU7cNuXUg1TVajuv0wSMsMZMhMMU2zGAVsjlR+KxFjDzPbhAWDFWWqrv1Bc3IUdUinAaa3sQaSuxxou1+EvA97SXjZuqs77iNOROqKPu4r9xs11v+8bxIzRtEEaxZ9w1F3pe1qrIWfsLZXAlp6GuyyDYnAr6USmEFWYAbV5WjPOsMnW8UhZumI6rd5FRNnc13GlO3VMQU0aUGJprEQGPDNFQAbjlpvM6XiOhQDGIWgGA2FFZNdA6WkYlDYZaS+AAyEYOhYBDAsMzFghjX8CzeWB7MIQB0FAZDQALSrIVCDxNzS8LEVVlCCoDhTxyEIFsNWywpx2XBUEo+4hamBGEJUteVhWAcx/Eq2zJngII9wMAKrl0WFAYw5iFYNOrCPgmgzZ6CyhzDw0Md1JZkSWTypiNkacX3W6uRIRYNhyNjLUingd43SpLulZcmUghGNFkvtYuuQ0prL2qwuLADTlID6ZViaat71KcA0EUE2uqvUtaY0kLgh4CPfmVp7wjTLlG27ryZcvJ2h4Cre3Zb0kQf/jgsT4Y2wWPADvtOABfhC1OhibCwABCgE7yAfJr1YUnO15FljTiLAIvLbGQCj7YaVri7WksPZ0XNzQ7RRy27V16qoJrPKq1itdWpIgs+t9NJsEB0y8ndLcPIrpWyEK/U6Y0rIYo8D8Kh74N3dpcD5jQRnFOmRbV9FYJa6mlE1xK8bJABc0ucuFR5R6lcRsyiDDnrKgNh0dVyxppwyJYq5OLgIoTWeHACDghUUfpd7N7k0TAykSOg2ZqryDALEQWGJg8nLwMDAaGEKBnyKOA43gsASMgEGAmBeYHgMRiRqxmjkKWYBgEhgHgAlpl7hwBxVCCgjQXVLCUA6OIAAEdqqVJasuWFwBMtgqAx2VS5oREgS3BIaGX3RnRTR3T0WKtV9W+LnEQa0dOYmEmBLQDCRyHNnmVtOaqIlFANDYNAUpFnO41JYB/WmpFvojUhUg++yA6bQiIgE0U6DC2B1N1G0mzDXVzPclOdt2EphJeJWJipvtCCpEDr9M+8PAifUobIlehlBbnrHbEFwIwhcDD4RBavkiG1T9kCnJaloURiizkJD/44LE/2YcFjwA77bEhrOM9hpTNBhTZzmxRRCWZjkAIGZ/LVlqZxSJqGIPxJFtJRv5bPEQGxd9wQAIfLDkIC0+LwU01g8LakgHTyYLDzK1XQcjyt13l7l5HcR+fxGp+S3aYCKqiqPD7Q0MNAYwpQQU/ivoApVBkbWOjQG0yUr1TigKStzTGdp2IdaIwhMOB2C1sWgsuf99WMIAaVVR/WyrNWqn2yRetRZWUrSoAAYAjlt8mexZP5/EqHaCwAGmysBcFBEB5ioXwDVQw3EQxGUE82eoyEAUFAjFAABgLgEmAIAUYAbfpkakRmDSCUGAgmAGAsDgBRYAYIBFg3sSNEhWkKgAFwiCm+TyQfW6ngmuwlbEhcZ2E0QgBU3Ufb1y2vLiWg9iu28Xm9bD1WLyQlotsvHgswUBTmcpsSQyLQICjO15aCQgjBIPT7eFxmuKNF+VrtPdhaCKyeoyBoKQtF8ASpc+DhIDeMeADKHALADjsXTqRTSrVgrOaFgBaqBEkCBbmcZvluOISghgoAPCDxJFuReVerwYhgUUI3OepGQKQkqh/+OCxPtnRBY8AO+2xKtd8IUy0mJ6ZB1y5FCmGlv0Tn9bC3RNYyBiKD2Kq3KxpdsMuDQtSsRVcDgpdrWFvq0xV4UiYMd1IuEOyrGjEq5A13XHYc01JNSDsIxsfUtghE9RNQi27cDthdvNcdIggccoBhG3AoxgqBnxa8+DsKDMUYupc8qmKLyjCFzXVuWUAiQqlzuocH8Wi9yuVNVHU1FE1gmKu1i5bXZCVQWBoBgp5zKIAUvUJizm5J6qETcbYs0AuGFAONPSXCCcMEQPCysG1BMpbmBpLGt1KmBwHFw0FQ4B0wGQRzFaR7OM0PswzQTgECiYBoACJqgAWEi/ihpb1VJWJTJRdGmswtTVpS3CEHWqXOj0EFkowookDAMFRpesRS3Uio4+qRK+ENUfIezGhGOsjAAlcUUgXNMoLhRwRyRBhalNuohdL0fouhOUCWkytcSE0eBVPSNfsnEYMZc2AYCSBpoUyYyt1ky81Douyxfkpg+MqBIO1xEbB1cXYYQ7CmUVfsiDHahijdxyxwGMJJBqML2Qyu5fAwAsmboFw9kwwP/jgsTzZMwWPADvtsQDYLih6on5hSV40JKGRhgCcLAHeM/JA51Xk+zZlCn5QEpgNnSCV8uzFHFbymz/WXaZ4heo4gHSxZmv1Mt+IAdxHRTJfVhM0IB5WzZkyGQVAJe20ISKVnLQwBVh1ab6JXhdUMjA0i6d3lOmXVZ5liy0NUWi+awzc2xP4nNKZaytTNBhNweF0wFesnTqRxZI+qsyp2zuQ3qcjKkoWXqCp7KwKkxBTUUzLjEw8DQBCJTWwMIHgiUTWqpiQgAzIt4mSgkLhmbQpgUBURBEjxh+GpQABiaCZxWeRiKBICBABAWAgsMNRHM7GANQ0VAwKQD1b2HWYwsIwB9G4t222iT4cFUAUxSbZOlKkIEDkqC16QCyFHnuRRQkqgaavlpDpFzEPlDJAGBAaDh5ejfKSagrCIwTbP0yl133FRZNiUuhpmLN1gmaqhWHjTaMVdGMQ+rfDT+sCnUMBKWky/qwC52UGmSQ3OrtaFNLSelp8Fwp1YwWExFSeyIp5vvDCwTLYajDJHEhmOCFOLPWUO+ut0WQTrmssgxm7Nn/44LE7GBkFkTS77TgYrkrlbqypT79vw02kZu4TwgXSrC61HG5GveFrCL6TnJgKBaeieyN7LFYE3mBIXrRaA3KC2TRZq7+rybxCluLJ2RxV0WsvvGmytxZo16kjCtrPn1fpkN5gipiFAHVlb3ReCUqejVldsmR2ViZK/ctiD9NdbOoepVNQFBrE2lswgZPhdqfEhZSzJqr9vAzdOZg7dFYmn2KTAwQTUxqjFg4XtyiS+04EwlB0pH3GAobfVwVAAUCZgGDAc3rbAi/PrNYx4D0XkZRGAAYEIF5gNIZGY2EUYEgFYOAaKgBrKCoAGBQDsp/KbpDLCWl6qNRhYBOttEq0ArOVMmwlrgqDbgu2HC9oXCsWkeKMzdFPtOYE7iODdE9IrDsgg4GlVjpyrgZ+XIL2HGPMoc1fC/G3XCPBW8WiXqXGsKrxcUOMDY/G2xKeNQ5THTFWTIVrmvbsgUxVmLZvqypaTtN9D0YhggPFGpNpPlRRYNoAMGsXVOtFqDuL2BA0wEtooJAO2rQy8FAUNYCTLaiomrxTh3VV0X1NWyhcGFA/+OCxP5k9BY8Kue0xOh6pJkSx0hTnNRLtHkrU5VM0mE9FlIULTg5RNMp/6Z/GkKwrYMAHb9R9v4q+yYrZkpp9RSBW7qIKtT6UEkSTDtP0jor5l6w+P7GlO2RNgKwaWaHNewXNAqM/rdl3MpgRgCpgwKoEDgDsoJk+lOlH19NPWy0l9VRwKREWwr1iyA1U8OEQQmDPyu9fK94zES/bSXMWLNM0kxBTUWqDFQWaFwDQqbGsIvcvaow0yBJSIwLMhEFDBDCAXMMxANtwbMEg7AI7GfjAgYBlKVgkAgjA0wv+o+MjQyEEEwZBYBAqgGDAFbiAmK+VeiQReCaytzqKaL9TnU2XkxNuKh7Yk0Y50utNrLRVXoxBpSu2mIoJCq5VC6y9mkJzAYTIUdVDF5o7sTRXbUwocxrVdito6DL8J1qJuYxNhyQCEsssQBllqXqOrALAITVMBW0s5NFty4Lam8SKMoqpjL4ToL2rMUeYiouu5xQokIrb1pCoT1PNMIA6zgaDTQTXYxHUERjE5WnUrKAqY6MC/snXU7UPEgugja+drgSFf/jgsT6Y+wWPADutxxlvixKdTRY83BzDApBsiRCaA8CudOqXNJXu0wsw2jEXRYe5zZUSkQo8iAu+GV7LMkUZfJsznTLjr6UXXokpDqmi8U6EEayaF0XCm85ImIxNTBiKa6hg8zprtMTTexYBTRSp0VxgQFRXRWSpQOaYKgbZHvhxfCnLcUVkAqarOXBSyQnNMfJIZibTnQcd61OkUkClMErF50MAAo/Q4AGsltIYUCmF4s5VkWwoKYBgOYXpQDAQBwQCg4mromCEQTEcbzh83hQCCAC3zhswyFIxNWo2GAVzDiCQMFYEQwNgDFDwsAWiWNACVlEknWRtOFQCSEABhbN06oELyKRWFacLABLcVtlEYaAkPHXfbWTusq68xqApCBAAHveFiKPS1WPIbTzztWW0nYDgEDArAeYI1aAoJUUZ0oyv1uyY6AhsDpCQBbhUUMM0EgA1FTApAzEgFWvsxVkgowUwAxYBGSrtdBhyWzC1+Om6LoMgFQLg4BNYNS90lGX4MAEAtT7wocE/VB2dp7GAwAsTAjqSQseFfjttfZYj47/44LE/2dcFkAxXfAAknW/AqAA36eq+HVaumksRqkBpELsSEIgXgwFhTWPMwZIyBNBuseZYz1diQKpndalfVpaWwx+1hV3OQXXeF+VKmfwssk/yumlqgYMreyVyn6YA+rQ48pTDS6Yw0JQ1iTMHRRDIgWlMNsHceJyVzJa+yXjlrQWmoU76dCfLyWEZmHLXcpTRmKpGwJWoOxFQ5mK5WptFS8WnaTHc5QNqbyKBz5jBQ9QwKBDwMNBZNZpswwRCgxMCDIMTNTL4xg/jMM8MXvszPaTDEHTDhgzAbGYMCsbQwqwOguHIYGYyRhIAPmFCDOamwEql5gFABtgNM4CcLgCFu2+NAgG8wKATDAEAIMEQCRMCHka3RIAABUAFZK90oUMQAAKLAXsnBoBLhLBBQAIvS4BMAUoedTNZsfKAFmBkwAoCALhooAIRSSREAAAoAG4QNAiBwGA8AkuxuSHFxxGAsEBKtaMAIAMRAClpF9mAOBKYCwBqPaTYQAMDgAleBUAUwCgBAYB0KADKwpQMMFQASsASoNBUiECooCVZyy5BV0FQ/+OCxPZ8ZBZEAZzwAAWAWLSoSjAuABRFTpVAYCIGSijnt3VvCoHw0AwqF3VrrbQ2BIDo8A4qsr8WAKEAIKGqVD0uMucQAAGAgACYAIBLXGaoPmAcAsFwAC9qHwUAEJgB4JYEOgOGBgAGxlAOIQAi9IcAEwJ8Ica0xx1RYAEvIsOytL9hjHYCckQACMGTpWu09ULmrrbmVQCC/VRayP8vfRAYx+NodkeUQ2Xq3JeF0gcAQDAImsrVKABU3EqkhY2tZ613JGF1IAXagymfB5dJNYDAWlzF3LZiZUAFQcbxNRiC8WkJomAKAUytfKI6E9OYZAFDgP2ioKLkbMzx42HKTToaojMogkYsSl5FskATbKqgAOYoaYwWYgSWmViUNMIPMwhNMrNUnM4PCgQzj06WU+Hk/Xs+288VE2gswbA5NQ7mxgg11h5IxHTu5Pzk7nwM60UAEmcmaSZnEhALoAkIyUjKRNA0yAU1WxFwjBCAQRcZlsFJfFsi0yAJg0fSpL/FtkHmDR9TFCSXJQCqmfqAVhUVUAqDqYLLb8pjNm5DTWmdLv/jgsSZWAwWPAHayADmctdltyNQ9LrrSU5i7xcovEmE61C7K5VMkxljP1XdlyXdluX1pU7TWmdNecqHZ2VO0w5dzOmvRaaa0u5iTvW4ZayzlyotnKYZf2M3ok4KwqpVisRiseYcl8oCqViLuy3mXasqdpynKh61VhlyX+h61uUv65LOXJl2cpjNLytKo1S4Sp2mdM6d6XXY0/zlOU709EVypirud61VpbOpU/z+v6/sOy25DTWlzMNXazl3ZbhTRqXclUNP8/0PS613K1nKX9cl3Yds1UxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/44LEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV";
var JobStatus = /* @__PURE__ */ ((JobStatus2) => {
  JobStatus2["Idle"] = "idle";
  JobStatus2["Running"] = "running";
  JobStatus2["Paused"] = "paused";
  JobStatus2["Stopped"] = "stopped";
  JobStatus2["Complete"] = "complete";
  return JobStatus2;
})(JobStatus || {});
const Power = (props) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M18.36 6.64a9 9 0 1 1-12.73 0" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "12", y1: "2", x2: "12", y2: "12" })
] });
const PowerOff = (props) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M18.36 6.64A9 9 0 0 1 20.77 15M6.16 6.16a9 9 0 1 0 12.73 0" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 2v4" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "m2 2 20 20" })
] });
const Play = (props) => /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: /* @__PURE__ */ jsxRuntimeExports.jsx("polygon", { points: "5 3 19 12 5 21 5 3" }) });
const Pause = (props) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "6", y: "4", width: "4", height: "16" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "14", y: "4", width: "4", height: "16" })
] });
const Square = (props) => /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2", ry: "2" }) });
const Upload = (props) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { points: "17 8 12 3 7 8" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "12", y1: "3", x2: "12", y2: "15" })
] });
const Download = (props) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { points: "7 10 12 15 17 10" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "12", y1: "15", x2: "12", y2: "3" })
] });
const FileText = (props) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { points: "14 2 14 8 20 8" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "16", y1: "13", x2: "8", y2: "13" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "16", y1: "17", x2: "8", y2: "17" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "10", y1: "9", x2: "8", y2: "9" })
] });
const Send = (props) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "22", y1: "2", x2: "11", y2: "13" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("polygon", { points: "22 2 15 22 11 13 2 9 22 2" })
] });
const Info = (props) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "12", r: "10" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "12", y1: "16", x2: "12", y2: "12" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "12", y1: "8", x2: "12.01", y2: "8" })
] });
const AlertTriangle = (props) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "12", y1: "9", x2: "12", y2: "13" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "12", y1: "17", x2: "12.01", y2: "17" })
] });
const Code = (props) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { points: "16 18 22 12 16 6" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { points: "8 6 2 12 8 18" })
] });
const Eye = (props) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "12", r: "3" })
] });
const ArrowUp = (props) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "12", y1: "19", x2: "12", y2: "5" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { points: "5 12 12 5 19 12" })
] });
const ArrowDown = (props) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "12", y1: "5", x2: "12", y2: "19" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { points: "19 12 12 19 5 12" })
] });
const ArrowLeft = (props) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "19", y1: "12", x2: "5", y2: "12" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { points: "12 19 5 12 12 5" })
] });
const ArrowRight = (props) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "5", y1: "12", x2: "19", y2: "12" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { points: "12 5 19 12 12 19" })
] });
const Pin = (props) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "10", r: "3" })
] });
const OctagonAlert = (props) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("polygon", { points: "7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "12", y1: "8", x2: "12", y2: "12" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "12", y1: "16", x2: "12.01", y2: "16" })
] });
const ChevronDown = (props) => /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { points: "6 9 12 15 18 9" }) });
const ChevronUp = (props) => /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { points: "6 15 12 9 18 15" }) });
const Unlock = (props) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "3", y: "11", width: "18", height: "11", rx: "2", ry: "2" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M7 11V7a5 5 0 0 1 9.9-1" })
] });
const CheckCircle = (props) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M22 11.08V12a10 10 0 1 1-5.93-9.14" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { points: "22 4 12 14.01 9 11.01" })
] });
const X = (props) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "6", y1: "6", x2: "18", y2: "18" })
] });
const Maximize = (props) => /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" }) });
const Pencil = (props) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "m15 5 4 4" })
] });
const Save = (props) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { points: "17 21 17 13 7 13 7 21" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { points: "7 3 7 8 15 8" })
] });
const Minimize = (props) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M4 14h6v6" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M20 10h-6V4" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M14 10l7-7" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M3 21l7-7" })
] });
const RotateCw = (props) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M20 12a8 8 0 1 1-8-8" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M20 4v4h-4" })
] });
const RotateCcw = (props) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M4 12a8 8 0 1 0 8-8" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M4 4v4h4" })
] });
const Plus = (props) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "12", y1: "5", x2: "12", y2: "19" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "5", y1: "12", x2: "19", y2: "12" })
] });
const Minus = (props) => /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "5", y1: "12", x2: "19", y2: "12" }) });
const RefreshCw = (props) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { points: "23 4 23 10 17 10" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M20.49 15a9 9 0 1 1-2.12-9.36L23 10" })
] });
const Percent = (props) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "19", y1: "5", x2: "5", y2: "19" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "6.5", cy: "6.5", r: "2.5" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "17.5", cy: "17.5", r: "2.5" })
] });
const Probe = (props) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 2v14" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "m7 9 5 5 5-5" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M3 20h18" })
] });
const ZoomIn = (props) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "11", cy: "11", r: "8" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "21", y1: "21", x2: "16.65", y2: "16.65" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "11", y1: "8", x2: "11", y2: "14" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "8", y1: "11", x2: "14", y2: "11" })
] });
const ZoomOut = (props) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "11", cy: "11", r: "8" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "21", y1: "21", x2: "16.65", y2: "16.65" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "8", y1: "11", x2: "14", y2: "11" })
] });
const Clock = (props) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "12", r: "10" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { points: "12 6 12 12 16 14" })
] });
const Zap = (props) => /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: /* @__PURE__ */ jsxRuntimeExports.jsx("polygon", { points: "13 2 3 14 12 14 11 22 21 10 12 10 13 2" }) });
const Trash2 = (props) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M3 6h18" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "10", y1: "11", x2: "10", y2: "17" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "14", y1: "11", x2: "14", y2: "17" })
] });
const PlusCircle = (props) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "12", r: "10" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "12", y1: "8", x2: "12", y2: "16" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "8", y1: "12", x2: "16", y2: "12" })
] });
const Settings = (props) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "12", r: "3" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" })
] });
const Camera = (props) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "13", r: "4" })
] });
const CameraOff = (props) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "1", y1: "1", x2: "23", y2: "23" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2 3h4a2 2 0 0 1 2 2v9.34m-7.72-2.06a4 4 0 1 1-5.56-5.56" })
] });
const BookOpen = (props) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" })
] });
const Crosshair = (props) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "12", r: "10" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "22", y1: "12", x2: "18", y2: "12" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "6", y1: "12", x2: "2", y2: "12" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "12", y1: "6", x2: "12", y2: "2" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "12", y1: "22", x2: "12", y2: "18" })
] });
const PictureInPicture = (props) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "15", y: "4", width: "8", height: "6", rx: "1" })
] });
const Dock = (props) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "12", y: "14", width: "8", height: "6", rx: "1" })
] });
const Sun = (props) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "12", r: "5" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "12", y1: "1", x2: "12", y2: "3" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "12", y1: "21", x2: "12", y2: "23" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "4.22", y1: "4.22", x2: "5.64", y2: "5.64" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "18.36", y1: "18.36", x2: "19.78", y2: "19.78" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "1", y1: "12", x2: "3", y2: "12" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "21", y1: "12", x2: "23", y2: "12" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "4.22", y1: "19.78", x2: "5.64", y2: "18.36" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "18.36", y1: "5.64", x2: "19.78", y2: "4.22" })
] });
const Moon = (props) => /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", ...props, children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" }) });
const SerialConnector = ({
  isConnected,
  portInfo,
  onConnect,
  onDisconnect,
  isApiSupported,
  isSimulated,
  useSimulator,
  onSimulatorChange
}) => {
  portInfo?.usbProductId ? `${portInfo.manufacturer} (${portInfo.usbVendorId}:${portInfo.usbProductId})` : "Unknown Port";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "checkbox",
          id: "simulator-checkbox",
          checked: useSimulator,
          onChange: (e) => onSimulatorChange(e.target.checked),
          disabled: isConnected,
          className: "h-4 w-4 rounded border-secondary text-primary focus:ring-primary disabled:opacity-50"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "simulator-checkbox", className: `text-sm ${isConnected ? "text-text-secondary" : ""}`, children: "Use Simulator" })
    ] }),
    isConnected ? /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: onDisconnect, className: "flex items-center gap-2 px-4 py-2 bg-accent-red text-white font-semibold rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-background transition-colors", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(PowerOff, { className: "w-5 h-5" }),
      "Disconnect"
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: onConnect, disabled: !isApiSupported && !useSimulator, className: "flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background transition-colors disabled:bg-secondary disabled:cursor-not-allowed", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Power, { className: "w-5 h-5" }),
      "Connect"
    ] })
  ] });
};
const getParam$2 = (gcode, param) => {
  const regex = new RegExp(`${param}\\s*([-+]?[0-9]*\\.?[0-9]*)`, "i");
  const match = gcode.match(regex);
  return match ? parseFloat(match[1]) : null;
};
const parseGCode = (gcodeLines) => {
  const segments = [];
  const bounds = {
    minX: Infinity,
    maxX: -Infinity,
    minY: Infinity,
    maxY: -Infinity,
    minZ: Infinity,
    maxZ: -Infinity
  };
  let currentPos = { x: 0, y: 0, z: 0 };
  let motionMode = "G0";
  const updateBounds = (p) => {
    bounds.minX = Math.min(bounds.minX, p.x);
    bounds.maxX = Math.max(bounds.maxX, p.x);
    bounds.minY = Math.min(bounds.minY, p.y);
    bounds.maxY = Math.max(bounds.maxY, p.y);
    bounds.minZ = Math.min(bounds.minZ, p.z);
    bounds.maxZ = Math.max(bounds.maxZ, p.z);
  };
  updateBounds(currentPos);
  gcodeLines.forEach((line, lineIndex) => {
    const cleanLine = line.toUpperCase().replace(/\(.*\)/g, "").split(";")[0].trim();
    if (!cleanLine) {
      return;
    }
    const gCommand = cleanLine.match(/G(\d+(\.\d+)?)/);
    if (gCommand) {
      const gCode = parseInt(gCommand[1], 10);
      if ([0, 1, 2, 3].includes(gCode)) {
        motionMode = `G${gCode}`;
      }
    }
    if (cleanLine.includes("X") || cleanLine.includes("Y") || cleanLine.includes("Z") || cleanLine.includes("I") || cleanLine.includes("J")) {
      const start = { ...currentPos };
      const end = {
        x: getParam$2(cleanLine, "X") ?? currentPos.x,
        y: getParam$2(cleanLine, "Y") ?? currentPos.y,
        z: getParam$2(cleanLine, "Z") ?? currentPos.z
      };
      if (motionMode === "G0" || motionMode === "G1") {
        segments.push({ type: motionMode, start, end, line: lineIndex });
      } else if (motionMode === "G2" || motionMode === "G3") {
        const i = getParam$2(cleanLine, "I") ?? 0;
        const j = getParam$2(cleanLine, "J") ?? 0;
        const center = { x: start.x + i, y: start.y + j, z: start.z };
        segments.push({ type: motionMode, start, end, center, clockwise: motionMode === "G2", line: lineIndex });
      }
      currentPos = end;
      updateBounds(start);
      updateBounds(end);
    }
  });
  if (segments.length === 0) {
    return { segments, bounds: { minX: -10, maxX: 10, minY: -10, maxY: 10, minZ: -2, maxZ: 2 } };
  }
  return { segments, bounds };
};
const createShader = (gl, type, source) => {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
};
const createProgram = (gl, vertexShader, fragmentShader) => {
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Unable to initialize the shader program: " + gl.getProgramInfoLog(program));
    return null;
  }
  return program;
};
const vertexShaderSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying lowp vec4 vColor;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vColor = aVertexColor;
    }
`;
const fragmentShaderSource = `
    varying lowp vec4 vColor;

    void main(void) {
      gl_FragColor = vColor;
    }
`;
const RAPID_COLOR = [0.4, 0.4, 0.4, 1];
const CUTTING_COLOR = [1, 0.84, 0, 1];
const PLUNGE_COLOR = [1, 0.65, 0, 1];
const EXECUTED_COLOR = [0.2, 0.2, 0.2, 1];
const HIGHLIGHT_COLOR = [1, 0, 1, 1];
const mat4 = {
  create: () => new Float32Array(16),
  identity: (out) => {
    out.set([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    return out;
  },
  multiply: (out, a, b) => {
    let a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
    let a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
    let a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
    let a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
    let b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
    out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    b0 = b[4];
    b1 = b[5];
    b2 = b[6];
    b3 = b[7];
    out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    b0 = b[8];
    b1 = b[9];
    b2 = b[10];
    b3 = b[11];
    out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    b0 = b[12];
    b1 = b[13];
    b2 = b[14];
    b3 = b[15];
    out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    return out;
  },
  translate: (out, a, v) => {
    let x = v[0], y = v[1], z = v[2];
    out.set(a);
    out[12] = a[12] + a[0] * x + a[4] * y + a[8] * z;
    out[13] = a[13] + a[1] * x + a[5] * y + a[9] * z;
    out[14] = a[14] + a[2] * x + a[6] * y + a[10] * z;
    return out;
  },
  rotate: (out, a, rad, axis) => {
    let x = axis[0], y = axis[1], z = axis[2], len = Math.hypot(x, y, z);
    if (len < 1e-6) return null;
    len = 1 / len;
    x *= len;
    y *= len;
    z *= len;
    let s = Math.sin(rad), c = Math.cos(rad), t = 1 - c;
    let a00 = a[0], a01 = a[1], a02 = a[2];
    let a10 = a[4], a11 = a[5], a12 = a[6];
    let a20 = a[8], a21 = a[9], a22 = a[10];
    let b00 = x * x * t + c, b01 = y * x * t + z * s, b02 = z * x * t - y * s;
    let b10 = x * y * t - z * s, b11 = y * y * t + c, b12 = z * y * t + x * s;
    let b20 = x * z * t + y * s, b21 = y * z * t - x * s, b22 = z * z * t + c;
    out[0] = a00 * b00 + a10 * b01 + a20 * b02;
    out[1] = a01 * b00 + a11 * b01 + a21 * b02;
    out[2] = a02 * b00 + a12 * b01 + a22 * b02;
    out[4] = a00 * b10 + a10 * b11 + a20 * b12;
    out[5] = a01 * b10 + a11 * b11 + a21 * b12;
    out[6] = a02 * b10 + a12 * b11 + a22 * b12;
    out[8] = a00 * b20 + a10 * b21 + a20 * b22;
    out[9] = a01 * b20 + a11 * b21 + a21 * b22;
    out[10] = a02 * b20 + a12 * b21 + a22 * b22;
    if (a !== out) {
      out[3] = a[3];
      out[7] = a[7];
      out[11] = a[11];
      out[12] = a[12];
      out[13] = a[13];
      out[14] = a[14];
      out[15] = a[15];
    }
    return out;
  },
  perspective: (out, fovy, aspect, near, far) => {
    const f = 1 / Math.tan(fovy / 2);
    out[0] = f / aspect;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = f;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[15] = 0;
    if (far != null && far !== Infinity) {
      const nf = 1 / (near - far);
      out[10] = (far + near) * nf;
      out[14] = 2 * far * near * nf;
    } else {
      out[10] = -1;
      out[14] = -2 * near;
    }
    return out;
  },
  lookAt: (out, eye, center, up) => {
    let x0, x1, x2, y0, y1, y2, z0, z1, z2, len;
    let eyeX = eye[0], eyeY = eye[1], eyeZ = eye[2];
    let upX = up[0], upY = up[1], upZ = up[2];
    let centerX = center[0], centerY = center[1], centerZ = center[2];
    z0 = eyeX - centerX;
    z1 = eyeY - centerY;
    z2 = eyeZ - centerZ;
    len = Math.hypot(z0, z1, z2);
    if (len > 0) {
      len = 1 / len;
      z0 *= len;
      z1 *= len;
      z2 *= len;
    }
    x0 = upY * z2 - upZ * z1;
    x1 = upZ * z0 - upX * z2;
    x2 = upX * z1 - upY * z0;
    len = Math.hypot(x0, x1, x2);
    if (len > 0) {
      len = 1 / len;
      x0 *= len;
      x1 *= len;
      x2 *= len;
    } else {
      x0 = 0;
      x1 = 0;
      x2 = 0;
    }
    y0 = z1 * x2 - z2 * x1;
    y1 = z2 * x0 - z0 * x2;
    y2 = z0 * x1 - z1 * x0;
    out[0] = x0;
    out[1] = y0;
    out[2] = z0;
    out[3] = 0;
    out[4] = x1;
    out[5] = y1;
    out[6] = z1;
    out[7] = 0;
    out[8] = x2;
    out[9] = y2;
    out[10] = z2;
    out[11] = 0;
    out[12] = -(x0 * eyeX + x1 * eyeY + x2 * eyeZ);
    out[13] = -(y0 * eyeX + y1 * eyeY + y2 * eyeZ);
    out[14] = -(z0 * eyeX + z1 * eyeY + z2 * eyeZ);
    out[15] = 1;
    return out;
  }
};
const GCodeVisualizer = React.forwardRef(({ gcodeLines, currentLine, hoveredLineIndex, machineSettings }, ref) => {
  const canvasRef = reactExports.useRef(null);
  const glRef = reactExports.useRef(null);
  const programInfoRef = reactExports.useRef(null);
  const buffersRef = reactExports.useRef(null);
  const renderDataRef = reactExports.useRef({});
  const [parsedGCode, setParsedGCode] = reactExports.useState(null);
  const [camera, setCamera] = reactExports.useState({
    target: [0, 0, 0],
    distance: 100,
    rotation: [0, Math.PI / 2]
    // Default to top-down view (Z-up system)
  });
  const mouseState = reactExports.useRef({ isDown: false, lastPos: { x: 0, y: 0 }, button: 0 });
  const createToolModel = (position) => {
    const { x, y, z } = position;
    const toolHeight = 20;
    const toolRadius = 3;
    const holderHeight = 10;
    const vertices = [];
    const addQuad = (p1, p2, p3, p4) => vertices.push(...p1, ...p2, ...p3, ...p1, ...p3, ...p4);
    vertices.push(x, y, z, x - toolRadius, y, z + toolHeight, x + toolRadius, y, z + toolHeight);
    const sides = 8;
    for (let i = 0; i < sides; i++) {
      const a1 = i / sides * 2 * Math.PI;
      const a2 = (i + 1) / sides * 2 * Math.PI;
      const x1 = Math.cos(a1) * toolRadius;
      const z1 = Math.sin(a1) * toolRadius;
      const x2 = Math.cos(a2) * toolRadius;
      const z2 = Math.sin(a2) * toolRadius;
      addQuad(
        [x + x1, y + z1, z + toolHeight],
        [x + x2, y + z2, z + toolHeight],
        [x + x2, y + z2, z + toolHeight + holderHeight],
        [x + x1, y + z1, z + toolHeight + holderHeight]
      );
    }
    return {
      vertices: new Float32Array(vertices),
      colors: new Float32Array(Array(vertices.length / 3).fill([1, 0.2, 0.2, 1]).flat())
      // Red
    };
  };
  const fitView = reactExports.useCallback((bounds, newRotation = null) => {
    if (!bounds || bounds.minX === Infinity) {
      setCamera((prev) => ({
        ...prev,
        target: [machineSettings.workArea.x / 2, machineSettings.workArea.y / 2, 0],
        distance: Math.max(machineSettings.workArea.x, machineSettings.workArea.y) * 1.5,
        rotation: newRotation ?? prev.rotation
      }));
      return;
    }
    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;
    const centerZ = (bounds.minZ + bounds.maxZ) / 2;
    const sizeX = bounds.maxX - bounds.minX;
    const sizeY = bounds.maxY - bounds.minY;
    const sizeZ = bounds.maxZ - bounds.minZ;
    const maxDim = Math.max(sizeX, sizeY, sizeZ);
    const distance = maxDim * 1.5;
    setCamera((prev) => ({
      ...prev,
      target: [centerX, centerY, centerZ],
      distance: Math.max(distance, 20),
      rotation: newRotation ?? prev.rotation
    }));
  }, [machineSettings]);
  reactExports.useImperativeHandle(ref, () => ({
    fitView: () => fitView(parsedGCode?.bounds),
    zoomIn: () => setCamera((c) => ({ ...c, distance: c.distance / 1.5 })),
    zoomOut: () => setCamera((c) => ({ ...c, distance: c.distance * 1.5 })),
    resetView: () => fitView(parsedGCode?.bounds, [0, Math.PI / 2])
  }));
  reactExports.useEffect(() => {
    const parsed = parseGCode(gcodeLines);
    setParsedGCode(parsed);
    fitView(parsed.bounds, [0, Math.PI / 2]);
  }, [gcodeLines, fitView]);
  reactExports.useEffect(() => {
    const gl = glRef.current;
    if (!gl) return;
    const workArea = machineSettings.workArea;
    const gridVertices = [];
    const boundsVertices = [];
    const gridColor = [0.2, 0.25, 0.35, 1];
    const boundsColor = [0.4, 0.45, 0.55, 1];
    const gridSpacing = 10;
    for (let i = 0; i <= workArea.x; i += gridSpacing) {
      gridVertices.push(i, 0, 0, i, workArea.y, 0);
    }
    for (let i = 0; i <= workArea.y; i += gridSpacing) {
      gridVertices.push(0, i, 0, workArea.x, i, 0);
    }
    const wx = workArea.x, wy = workArea.y, wz = workArea.z;
    boundsVertices.push(
      0,
      0,
      0,
      wx,
      0,
      0,
      wx,
      0,
      0,
      wx,
      wy,
      0,
      wx,
      wy,
      0,
      0,
      wy,
      0,
      0,
      wy,
      0,
      0,
      0,
      0,
      // bottom
      0,
      0,
      wz,
      wx,
      0,
      wz,
      wx,
      0,
      wz,
      wx,
      wy,
      wz,
      wx,
      wy,
      wz,
      0,
      wy,
      wz,
      0,
      wy,
      wz,
      0,
      0,
      wz,
      // top
      0,
      0,
      0,
      0,
      0,
      wz,
      wx,
      0,
      0,
      wx,
      0,
      wz,
      wx,
      wy,
      0,
      wx,
      wy,
      wz,
      0,
      wy,
      0,
      0,
      wy,
      wz
      // sides
    );
    const workAreaBuffers = {};
    workAreaBuffers.gridPosition = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, workAreaBuffers.gridPosition);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(gridVertices), gl.STATIC_DRAW);
    workAreaBuffers.gridColor = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, workAreaBuffers.gridColor);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(Array(gridVertices.length / 3).fill(gridColor).flat()), gl.STATIC_DRAW);
    workAreaBuffers.gridVertexCount = gridVertices.length / 3;
    workAreaBuffers.boundsPosition = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, workAreaBuffers.boundsPosition);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boundsVertices), gl.STATIC_DRAW);
    workAreaBuffers.boundsColor = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, workAreaBuffers.boundsColor);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(Array(boundsVertices.length / 3).fill(boundsColor).flat()), gl.STATIC_DRAW);
    workAreaBuffers.boundsVertexCount = boundsVertices.length / 3;
    const axisLength = Math.max(25, Math.hypot(workArea.x, workArea.y) * 0.1);
    const labelSize = axisLength * 0.1;
    const axisLabelOffset = axisLength + labelSize * 2;
    const axisVertices = [
      // X-axis line
      0,
      0,
      0,
      axisLength,
      0,
      0,
      // Y-axis line
      0,
      0,
      0,
      0,
      axisLength,
      0,
      // Z-axis line
      0,
      0,
      0,
      0,
      0,
      axisLength
    ];
    const red = [1, 0.3, 0.3, 1];
    const green = [0.3, 1, 0.3, 1];
    const blue = [0.3, 0.3, 1, 1];
    const axisColors = [...red, ...red, ...green, ...green, ...blue, ...blue];
    const xLabel = [
      axisLabelOffset - labelSize,
      -labelSize,
      0,
      axisLabelOffset + labelSize,
      labelSize,
      0,
      axisLabelOffset - labelSize,
      labelSize,
      0,
      axisLabelOffset + labelSize,
      -labelSize,
      0
    ];
    axisVertices.push(...xLabel);
    axisColors.push(...Array(4).fill(red).flat());
    const yLabel = [
      -labelSize,
      axisLabelOffset + labelSize,
      0,
      0,
      axisLabelOffset,
      0,
      labelSize,
      axisLabelOffset + labelSize,
      0,
      0,
      axisLabelOffset,
      0,
      0,
      axisLabelOffset,
      0,
      0,
      axisLabelOffset - labelSize,
      0
    ];
    axisVertices.push(...yLabel);
    axisColors.push(...Array(6).fill(green).flat());
    const zLabel = [
      -labelSize,
      0,
      axisLabelOffset + labelSize,
      labelSize,
      0,
      axisLabelOffset + labelSize,
      labelSize,
      0,
      axisLabelOffset + labelSize,
      -labelSize,
      0,
      axisLabelOffset - labelSize,
      -labelSize,
      0,
      axisLabelOffset - labelSize,
      labelSize,
      0,
      axisLabelOffset - labelSize
    ];
    axisVertices.push(...zLabel);
    axisColors.push(...Array(6).fill(blue).flat());
    workAreaBuffers.axisPosition = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, workAreaBuffers.axisPosition);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(axisVertices), gl.STATIC_DRAW);
    workAreaBuffers.axisColor = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, workAreaBuffers.axisColor);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(axisColors), gl.STATIC_DRAW);
    workAreaBuffers.axisVertexCount = axisVertices.length / 3;
    const segments = parsedGCode ? parsedGCode.segments : [];
    const vertices = [];
    const colors = [];
    segments.forEach((seg, i) => {
      let color;
      const isHovered = i === hoveredLineIndex;
      const isPlunge = Math.abs(seg.start.x - seg.end.x) < 1e-6 && Math.abs(seg.start.y - seg.end.y) < 1e-6 && seg.end.z < seg.start.z;
      if (isHovered) {
        color = HIGHLIGHT_COLOR;
      } else if (i < currentLine) {
        color = EXECUTED_COLOR;
      } else if (seg.type === "G0") {
        color = RAPID_COLOR;
      } else if (isPlunge) {
        color = PLUNGE_COLOR;
      } else {
        color = CUTTING_COLOR;
      }
      if ((seg.type === "G2" || seg.type === "G3") && seg.center) {
        const arcPoints = 20;
        const radius = Math.hypot(seg.start.x - seg.center.x, seg.start.y - seg.center.y);
        let startAngle = Math.atan2(seg.start.y - seg.center.y, seg.start.x - seg.center.x);
        let endAngle = Math.atan2(seg.end.y - seg.center.y, seg.end.x - seg.center.x);
        let angleDiff = endAngle - startAngle;
        const isFullCircle = Math.abs(seg.start.x - seg.end.x) < 1e-6 && Math.abs(seg.start.y - seg.end.y) < 1e-6 && radius > 1e-6;
        if (isFullCircle) {
          angleDiff = seg.clockwise ? -2 * Math.PI : 2 * Math.PI;
        } else {
          if (seg.clockwise && angleDiff > 0) angleDiff -= 2 * Math.PI;
          if (!seg.clockwise && angleDiff < 0) angleDiff += 2 * Math.PI;
        }
        for (let j = 0; j < arcPoints; j++) {
          const p1_angle = startAngle + j / arcPoints * angleDiff;
          const p2_angle = startAngle + (j + 1) / arcPoints * angleDiff;
          const p1_z = seg.start.z + (seg.end.z - seg.start.z) * (j / arcPoints);
          const p2_z = seg.start.z + (seg.end.z - seg.start.z) * ((j + 1) / arcPoints);
          vertices.push(
            seg.center.x + Math.cos(p1_angle) * radius,
            seg.center.y + Math.sin(p1_angle) * radius,
            p1_z,
            seg.center.x + Math.cos(p2_angle) * radius,
            seg.center.y + Math.sin(p2_angle) * radius,
            p2_z
          );
          colors.push(...color, ...color);
        }
      } else {
        vertices.push(
          seg.start.x,
          seg.start.y,
          seg.start.z,
          seg.end.x,
          seg.end.y,
          seg.end.z
        );
        colors.push(...color, ...color);
      }
    });
    let toolModel = null;
    if (currentLine > 0 && currentLine <= segments.length) {
      toolModel = createToolModel(segments[currentLine - 1].end);
    }
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    let toolPositionBuffer = null, toolColorBuffer = null;
    if (toolModel) {
      toolPositionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, toolPositionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, toolModel.vertices, gl.STATIC_DRAW);
      toolColorBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, toolColorBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, toolModel.colors, gl.STATIC_DRAW);
    }
    if (buffersRef.current) {
      gl.deleteBuffer(buffersRef.current.position);
      gl.deleteBuffer(buffersRef.current.color);
      gl.deleteBuffer(buffersRef.current.toolPosition);
      gl.deleteBuffer(buffersRef.current.toolColor);
      if (buffersRef.current.workArea) {
        gl.deleteBuffer(buffersRef.current.workArea.gridPosition);
        gl.deleteBuffer(buffersRef.current.workArea.gridColor);
        gl.deleteBuffer(buffersRef.current.workArea.boundsPosition);
        gl.deleteBuffer(buffersRef.current.workArea.boundsColor);
        gl.deleteBuffer(buffersRef.current.workArea.axisPosition);
        gl.deleteBuffer(buffersRef.current.workArea.axisColor);
      }
    }
    buffersRef.current = {
      position: positionBuffer,
      color: colorBuffer,
      vertexCount: vertices.length / 3,
      toolPosition: toolPositionBuffer,
      toolColor: toolColorBuffer,
      toolVertexCount: toolModel ? toolModel.vertices.length / 3 : 0,
      workArea: workAreaBuffers
    };
  }, [parsedGCode, currentLine, hoveredLineIndex, machineSettings]);
  reactExports.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: true });
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }
    glRef.current = gl;
    const vs = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (!vs || !fs) return;
    const program = createProgram(gl, vs, fs);
    if (!program) return;
    programInfoRef.current = {
      program,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(program, "aVertexPosition"),
        vertexColor: gl.getAttribLocation(program, "aVertexColor")
      },
      uniformLocations: {
        projectionMatrix: gl.getUniformLocation(program, "uProjectionMatrix"),
        modelViewMatrix: gl.getUniformLocation(program, "uModelViewMatrix")
      }
    };
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    let animationFrameId;
    const renderLoop = () => {
      animationFrameId = requestAnimationFrame(renderLoop);
      const { camera: camera2 } = renderDataRef.current;
      const buffers = buffersRef.current;
      const programInfo = programInfoRef.current;
      if (!gl || !programInfo) return;
      const canvasElement = gl.canvas;
      if (canvasElement instanceof HTMLCanvasElement) {
        if (canvasElement.width !== canvasElement.clientWidth || canvasElement.height !== canvasElement.clientHeight) {
          canvasElement.width = canvasElement.clientWidth;
          canvasElement.height = canvasElement.clientHeight;
        }
      }
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      gl.clearColor(0.117, 0.16, 0.23, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      if (!buffers || !camera2) return;
      const projectionMatrix = mat4.create();
      const aspect = gl.canvas.width / gl.canvas.height;
      mat4.perspective(projectionMatrix, 45 * Math.PI / 180, aspect, 0.1, 1e4);
      const viewMatrix = mat4.create();
      const eye = [
        camera2.target[0] + camera2.distance * Math.cos(camera2.rotation[0]) * Math.cos(camera2.rotation[1]),
        camera2.target[1] + camera2.distance * Math.sin(camera2.rotation[0]) * Math.cos(camera2.rotation[1]),
        camera2.target[2] + camera2.distance * Math.sin(camera2.rotation[1])
      ];
      let up = [0, 0, 1];
      if (Math.abs(Math.sin(camera2.rotation[1])) > 0.99999) {
        up = [0, 1, 0];
      }
      mat4.lookAt(viewMatrix, eye, camera2.target, up);
      gl.useProgram(programInfo.program);
      gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
      gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, viewMatrix);
      if (buffers.workArea) {
        const wa = buffers.workArea;
        gl.lineWidth(1);
        gl.bindBuffer(gl.ARRAY_BUFFER, wa.gridPosition);
        gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
        gl.bindBuffer(gl.ARRAY_BUFFER, wa.gridColor);
        gl.vertexAttribPointer(programInfo.attribLocations.vertexColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
        gl.drawArrays(gl.LINES, 0, wa.gridVertexCount);
        gl.bindBuffer(gl.ARRAY_BUFFER, wa.boundsPosition);
        gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, wa.boundsColor);
        gl.vertexAttribPointer(programInfo.attribLocations.vertexColor, 4, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.LINES, 0, wa.boundsVertexCount);
        gl.lineWidth(2);
        gl.bindBuffer(gl.ARRAY_BUFFER, wa.axisPosition);
        gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, wa.axisColor);
        gl.vertexAttribPointer(programInfo.attribLocations.vertexColor, 4, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.LINES, 0, wa.axisVertexCount);
        gl.lineWidth(1);
      }
      if (buffers.position && buffers.vertexCount > 0) {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
        gl.vertexAttribPointer(programInfo.attribLocations.vertexColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
        gl.drawArrays(gl.LINES, 0, buffers.vertexCount);
      }
      if (buffers.toolPosition && buffers.toolVertexCount > 0) {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.toolPosition);
        gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.toolColor);
        gl.vertexAttribPointer(programInfo.attribLocations.vertexColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
        gl.drawArrays(gl.TRIANGLES, 0, buffers.toolVertexCount);
      }
    };
    renderLoop();
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  reactExports.useEffect(() => {
    renderDataRef.current = { camera };
  });
  reactExports.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handleMouseDown = (e) => {
      mouseState.current = { isDown: true, lastPos: { x: e.clientX, y: e.clientY }, button: e.button };
    };
    const handleMouseUp = () => {
      mouseState.current.isDown = false;
    };
    const handleMouseMove = (e) => {
      if (!mouseState.current.isDown) return;
      const dx = e.clientX - mouseState.current.lastPos.x;
      const dy = e.clientY - mouseState.current.lastPos.y;
      if (mouseState.current.button === 0) {
        setCamera((c) => {
          const newRotation = [...c.rotation];
          newRotation[0] -= dx * 0.01;
          newRotation[1] -= dy * 0.01;
          newRotation[1] = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, newRotation[1]));
          return { ...c, rotation: newRotation };
        });
      } else if (mouseState.current.button === 2) {
        setCamera((c) => {
          const factor = 0.1 * (c.distance / 100);
          const newTarget = [...c.target];
          const sYaw = Math.sin(c.rotation[0]);
          const cYaw = Math.cos(c.rotation[0]);
          const sPitch = Math.sin(c.rotation[1]);
          const cPitch = Math.cos(c.rotation[1]);
          const rightX = -sYaw;
          const rightY = cYaw;
          const upX = -cYaw * sPitch;
          const upY = -sYaw * sPitch;
          const upZ = cPitch;
          newTarget[0] -= (dx * rightX - dy * upX) * factor;
          newTarget[1] -= (dx * rightY - dy * upY) * factor;
          newTarget[2] -= -dy * upZ * factor;
          return { ...c, target: newTarget };
        });
      }
      mouseState.current.lastPos = { x: e.clientX, y: e.clientY };
    };
    const handleWheel = (e) => {
      e.preventDefault();
      const scale = e.deltaY < 0 ? 0.8 : 1.2;
      setCamera((c) => ({ ...c, distance: Math.max(1, c.distance * scale) }));
    };
    const handleContextMenu = (e) => e.preventDefault();
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseleave", handleMouseUp);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("wheel", handleWheel);
    canvas.addEventListener("contextmenu", handleContextMenu);
    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mouseleave", handleMouseUp);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("wheel", handleWheel);
      canvas.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-full bg-background rounded cursor-grab active:cursor-grabbing", children: /* @__PURE__ */ jsxRuntimeExports.jsx("canvas", { ref: canvasRef, className: "w-full h-full" }) });
});
const Tooltip = ({ children, content, title }) => {
  const [visible, setVisible] = reactExports.useState(false);
  const showTooltip = () => setVisible(true);
  const hideTooltip = () => setVisible(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "relative inline-block", onMouseEnter: showTooltip, onMouseLeave: hideTooltip, children: [
    children,
    visible && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs bg-background border border-secondary text-text-primary text-sm rounded-md shadow-lg z-20 p-3", children: [
      title && /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-bold mb-1 border-b border-secondary pb-1", children: title }),
      typeof content === "string" ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-text-secondary", children: content }) : content
    ] })
  ] });
};
const GCODE_DEFINITIONS = {
  // G-Codes
  "G0": { name: "Rapid Move", desc: "Moves at maximum speed to a specified point. Used for non-cutting moves." },
  "G1": { name: "Linear Move", desc: "Moves in a straight line at a specified feed rate (F). Used for cutting." },
  "G2": { name: "Clockwise Arc", desc: "Creates a clockwise circular or helical motion." },
  "G3": { name: "Counter-Clockwise Arc", desc: "Creates a counter-clockwise circular or helical motion." },
  "G4": { name: "Dwell", desc: "Pauses the machine for a specified amount of time (P)." },
  "G10": { name: "Set Work Coordinate Offset", desc: "Sets the work coordinate system offsets." },
  "G17": { name: "XY Plane Select", desc: "Sets the active plane for circular interpolation to XY." },
  "G18": { name: "XZ Plane Select", desc: "Sets the active plane for circular interpolation to XZ." },
  "G19": { name: "YZ Plane Select", desc: "Sets the active plane for circular interpolation to YZ." },
  "G20": { name: "Inches for Units", desc: "Sets the machine units to inches." },
  "G21": { name: "Millimeters for Units", desc: "Sets the machine units to millimeters." },
  "G28": { name: "Return to Home", desc: "Returns the machine to its home position (machine zero)." },
  "G30": { name: "Return to Secondary Home", desc: "Returns to a secondary, user-defined home position." },
  "G53": { name: "Move in Machine Coordinates", desc: "Temporarily overrides work offsets to move in the machine's native coordinate system." },
  "G54": { name: "Work Coordinate System 1", desc: "Selects the first work coordinate system (WCS)." },
  "G55": { name: "Work Coordinate System 2", desc: "Selects the second work coordinate system (WCS)." },
  "G90": { name: "Absolute Positioning", desc: "Interprets all coordinates as absolute positions from the origin." },
  "G91": { name: "Incremental Positioning", desc: "Interprets all coordinates as relative distances from the current position." },
  "G92": { name: "Set Position", desc: "Sets the current position to a specified value, creating a temporary offset." },
  "G94": { name: "Units per Minute Feed Rate", desc: "Sets the feed rate mode to units per minute." },
  // M-Codes
  "M0": { name: "Program Stop", desc: "Stops the program. Requires user intervention to continue." },
  "M1": { name: "Optional Stop", desc: "Stops the program if the optional stop switch on the machine is enabled." },
  "M2": { name: "End of Program", desc: "Ends the program and resets the machine." },
  "M3": { name: "Spindle On, Clockwise", desc: "Starts the spindle rotating clockwise at a specified speed (S)." },
  "M4": { name: "Spindle On, Counter-Clockwise", desc: "Starts the spindle rotating counter-clockwise at a specified speed (S)." },
  "M5": { name: "Spindle Stop", desc: "Stops the spindle from rotating." },
  "M6": { name: "Tool Change", desc: "Initiates an automatic tool change sequence." },
  "M8": { name: "Coolant On (Flood)", desc: "Turns on the flood coolant system." },
  "M9": { name: "Coolant Off", desc: "Turns off all coolant systems." },
  "M30": { name: "Program End and Reset", desc: "Ends the program and resets to the beginning. Similar to M2." }
};
const PARAMETER_DEFINITIONS = {
  "X": "X-Axis Coordinate",
  "Y": "Y-Axis Coordinate",
  "Z": "Z-Axis Coordinate",
  "F": "Feed Rate (speed of cutting motion)",
  "S": "Spindle Speed (in RPM)",
  "I": "Arc Center X-offset (for G2/G3)",
  "J": "Arc Center Y-offset (for G2/G3)",
  "P": "Dwell Time or Parameter for G10/G92",
  "T": "Tool Number (for M6)"
};
const GCodeLine = ({ line, lineNumber, isExecuted, isCurrent, isHovered, onRunFromHere, isActionable, onMouseEnter, onMouseLeave }) => {
  const parts = [];
  let lastIndex = 0;
  const tokenRegex = /([GgMm]\d+(?:\.\d+)?)|([XxYyZzIiJjFfSsPpTt]\s*[-+]?\d+(?:\.\d+)?)|(;.*)|(\(.*\))/g;
  let match;
  while ((match = tokenRegex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push(line.substring(lastIndex, match.index));
    }
    const token = match[0];
    const upperToken = token.toUpperCase();
    let el = null;
    if (match[1]) {
      const code = upperToken.match(/[GgMm]\d+/)[0];
      const definition = GCODE_DEFINITIONS[code];
      if (definition) {
        el = /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: `${code}: ${definition.name}`, content: definition.desc, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-purple-400 font-bold cursor-help", children: token }) }, lastIndex);
      } else {
        el = /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-purple-400 font-bold", children: token });
      }
    } else if (match[2]) {
      const param = upperToken[0];
      const definition = PARAMETER_DEFINITIONS[param];
      if (definition) {
        el = /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { content: definition, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-400 cursor-help", children: token }) }, lastIndex);
      } else {
        el = /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-400", children: token });
      }
    } else if (match[3] || match[4]) {
      el = /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-500", children: token });
    }
    if (el) {
      parts.push(el);
    }
    lastIndex = match.index + token.length;
  }
  if (lastIndex < line.length) {
    parts.push(line.substring(lastIndex));
  }
  const lineClasses = `flex group rounded-sm transition-colors duration-100 
        ${isCurrent ? "bg-primary/30" : isHovered ? "bg-white/10" : isExecuted ? "bg-primary/10" : ""}`;
  const lineNumberClasses = `w-12 text-right pr-2 select-none flex-shrink-0 flex items-center justify-end ${isCurrent ? "text-accent-red font-bold" : "text-text-secondary"}`;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: lineClasses, onMouseEnter, onMouseLeave, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: lineNumberClasses, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => onRunFromHere(lineNumber),
          disabled: !isActionable,
          className: "mr-1 p-0.5 rounded opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:opacity-0 transition-opacity text-primary hover:bg-primary/20",
          title: `Run from line ${lineNumber}`,
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "w-3 h-3" })
        }
      ),
      lineNumber
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "whitespace-pre", children: parts.map((part, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(React.Fragment, { children: part }, i)) })
  ] });
};
const FeedrateOverrideControl = ({ onFeedOverride, currentFeedrate, className = "" }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `bg-background p-3 rounded-md ${className}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-bold text-text-secondary mb-2 text-center", children: "Feed Rate Override" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-4 mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Percent, { className: "w-8 h-8 text-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-4xl font-mono font-bold", children: currentFeedrate })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-5 gap-2 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { title: "Decrease Feed Rate by 10%", onClick: () => onFeedOverride("dec10"), className: "p-2 bg-secondary rounded hover:bg-secondary-focus flex items-center justify-center font-bold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { className: "w-4 h-4 mr-1" }),
        "10%"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { title: "Decrease Feed Rate by 1%", onClick: () => onFeedOverride("dec1"), className: "p-2 bg-secondary rounded hover:bg-secondary-focus flex items-center justify-center font-bold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { className: "w-4 h-4 mr-1" }),
        "1%"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { title: "Reset Feed Rate to 100%", onClick: () => onFeedOverride("reset"), className: "p-2 bg-primary rounded hover:bg-primary-focus flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-5 h-5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { title: "Increase Feed Rate by 1%", onClick: () => onFeedOverride("inc1"), className: "p-2 bg-secondary rounded hover:bg-secondary-focus flex items-center justify-center font-bold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
        "1%"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { title: "Increase Feed Rate by 10%", onClick: () => onFeedOverride("inc10"), className: "p-2 bg-secondary rounded hover:bg-secondary-focus flex items-center justify-center font-bold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
        "10%"
      ] })
    ] })
  ] });
};
const formatTime = (totalSeconds) => {
  if (totalSeconds === Infinity) return "∞";
  if (totalSeconds < 1) return "...";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor(totalSeconds % 3600 / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
};
const GCodePanel = ({
  onFileLoad,
  fileName,
  gcodeLines,
  onJobControl,
  jobStatus,
  progress,
  isConnected,
  unit,
  onGCodeChange,
  onClearFile,
  machineState,
  onFeedOverride,
  timeEstimate,
  machineSettings,
  toolLibrary,
  selectedToolId,
  onToolSelect,
  onOpenGenerator
}) => {
  const fileInputRef = reactExports.useRef(null);
  const visualizerRef = reactExports.useRef(null);
  const codeContainerRef = reactExports.useRef(null);
  const [view, setView] = reactExports.useState("visualizer");
  const [isEditing, setIsEditing] = reactExports.useState(false);
  const [editedGCode, setEditedGCode] = reactExports.useState("");
  const [isDraggingOver, setIsDraggingOver] = reactExports.useState(false);
  const [hoveredLineIndex, setHoveredLineIndex] = reactExports.useState(null);
  reactExports.useEffect(() => {
    setEditedGCode(gcodeLines.join("\n"));
    setIsEditing(false);
  }, [gcodeLines]);
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result;
        onFileLoad(content, file.name);
      };
      reader.readAsText(file);
      setView("visualizer");
    }
  };
  const handleSave = () => {
    onGCodeChange(editedGCode);
    setIsEditing(false);
  };
  const handleCancel = () => {
    setEditedGCode(gcodeLines.join("\n"));
    setIsEditing(false);
  };
  const handleSaveToDisk = () => {
    const blob = new Blob([editedGCode], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    let suggestedFilename = fileName || "untitled.gcode";
    if (suggestedFilename.endsWith(" (edited)")) {
      const base = suggestedFilename.replace(" (edited)", "");
      const parts = base.split(".");
      if (parts.length > 1) {
        const ext = parts.pop();
        suggestedFilename = `${parts.join(".")}-edited.${ext}`;
      } else {
        suggestedFilename = `${base}-edited`;
      }
    }
    a.download = suggestedFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  const handleRunFromLine = (lineNumber) => {
    onJobControl("start", { startLine: lineNumber - 1 });
  };
  const isHoming = machineState?.status === "Home";
  const isJobActive = jobStatus === JobStatus.Running || jobStatus === JobStatus.Paused;
  const isReadyToStart = isConnected && gcodeLines.length > 0 && (jobStatus === JobStatus.Idle || jobStatus === JobStatus.Stopped || jobStatus === JobStatus.Complete) && !isHoming;
  const totalLines = gcodeLines.length;
  const currentLine = Math.floor(progress / 100 * totalLines);
  reactExports.useEffect(() => {
    if ((jobStatus === JobStatus.Running || jobStatus === JobStatus.Paused) && view === "code" && codeContainerRef.current) {
      const lineIndexToScroll = currentLine;
      if (lineIndexToScroll >= gcodeLines.length) return;
      const container = codeContainerRef.current;
      const lineElement = container.children[lineIndexToScroll];
      if (lineElement) {
        const containerHeight = container.clientHeight;
        const lineElementOffsetTop = lineElement.offsetTop;
        const lineElementHeight = lineElement.offsetHeight;
        const scrollTop = lineElementOffsetTop - containerHeight / 2 + lineElementHeight / 2;
        container.scrollTo({
          top: scrollTop,
          behavior: "smooth"
        });
      }
    }
  }, [currentLine, jobStatus, view, gcodeLines.length]);
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.name.endsWith(".gcode") || file.name.endsWith(".nc") || file.name.endsWith(".txt"))) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        onFileLoad(ev.target?.result, file.name);
      };
      reader.readAsText(file);
      setView("visualizer");
    }
  };
  const renderContent = () => {
    if (gcodeLines.length > 0) {
      if (view === "visualizer") return /* @__PURE__ */ jsxRuntimeExports.jsx(
        GCodeVisualizer,
        {
          ref: visualizerRef,
          gcodeLines,
          currentLine,
          unit,
          hoveredLineIndex,
          machineSettings
        }
      );
      if (view === "code" && machineSettings) {
        if (isEditing) return /* @__PURE__ */ jsxRuntimeExports.jsx(
          "textarea",
          {
            className: "w-full h-full absolute inset-0 bg-background font-mono text-sm p-2 rounded border border-secondary focus:ring-primary focus:border-primary",
            value: editedGCode,
            onChange: (e) => setEditedGCode(e.target.value),
            spellCheck: "false"
          }
        );
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: codeContainerRef, className: "absolute inset-0 bg-background rounded p-2 overflow-y-auto font-mono text-sm", children: gcodeLines.map((line, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          GCodeLine,
          {
            line,
            lineNumber: index + 1,
            isExecuted: index < currentLine,
            isCurrent: isJobActive && index === currentLine,
            isHovered: index === hoveredLineIndex,
            onRunFromHere: handleRunFromLine,
            isActionable: isReadyToStart,
            onMouseEnter: () => setHoveredLineIndex(index),
            onMouseLeave: () => setHoveredLineIndex(null)
          },
          index
        )) });
      }
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center h-full text-text-secondary", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-16 h-16 mb-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No G-code file loaded." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: 'Click "Load File" or drag and drop here to begin.' })
    ] });
  };
  const renderJobControls = () => {
    if (isReadyToStart) {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => onJobControl("start", { startLine: 0 }),
          disabled: !isReadyToStart,
          className: "col-span-3 flex items-center justify-center gap-3 p-5 bg-accent-green text-white font-bold rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-surface transition-colors disabled:bg-secondary disabled:cursor-not-allowed text-xl",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "w-8 h-8" }),
            "Start Job"
          ]
        }
      );
    }
    if (jobStatus === JobStatus.Running) {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => onJobControl("pause"), disabled: isHoming, className: "flex items-center justify-center gap-3 p-5 bg-accent-yellow text-white font-bold rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-surface transition-colors text-xl disabled:bg-secondary disabled:cursor-not-allowed", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { className: "w-8 h-8" }),
          "Pause"
        ] }, "pause"),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => onJobControl("stop"), disabled: isHoming, className: "w-full flex items-center justify-center gap-3 p-5 bg-accent-red text-white font-bold rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-surface transition-colors text-xl disabled:bg-secondary disabled:cursor-not-allowed", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Square, { className: "w-8 h-8" }),
          "Stop Job"
        ] }, "stop") })
      ] });
    }
    if (jobStatus === JobStatus.Paused) {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => onJobControl("resume"), disabled: isHoming, className: "flex items-center justify-center gap-3 p-5 bg-accent-green text-white font-bold rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-surface transition-colors text-xl disabled:bg-secondary disabled:cursor-not-allowed", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "w-8 h-8" }),
          "Resume"
        ] }, "resume"),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => onJobControl("stop"), disabled: isHoming, className: "w-full flex items-center justify-center gap-3 p-5 bg-accent-red text-white font-bold rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-surface transition-colors text-xl disabled:bg-secondary disabled:cursor-not-allowed", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Square, { className: "w-8 h-8" }),
          "Stop Job"
        ] }, "stop") })
      ] });
    }
    return null;
  };
  const { totalSeconds, cumulativeSeconds } = timeEstimate || { totalSeconds: 0, cumulativeSeconds: [] };
  let displayTime = totalSeconds;
  let timeLabel = "Est. Time";
  let timeTitle = "Estimated Job Time";
  if (isJobActive && totalSeconds > 0 && cumulativeSeconds) {
    const feedMultiplier = (machineState?.ov?.[0] ?? 100) / 100;
    timeLabel = "Time Rem.";
    timeTitle = "Estimated Time Remaining";
    if (feedMultiplier > 0) {
      const timeElapsedAt100 = currentLine > 0 && cumulativeSeconds[currentLine - 1] ? cumulativeSeconds[currentLine - 1] : 0;
      const timeRemainingAt100 = totalSeconds - timeElapsedAt100;
      displayTime = timeRemainingAt100 / feedMultiplier;
    } else {
      displayTime = Infinity;
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "bg-surface rounded-lg shadow-lg flex flex-col p-4 h-full relative",
      onDragEnter: handleDragEnter,
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-2 pb-4 border-b border-secondary", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold", children: "G-Code" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center bg-background rounded-md p-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setView("visualizer"), title: "Visualizer View", className: `p-1 rounded transition-colors ${view === "visualizer" ? "bg-primary text-white" : "hover:bg-secondary"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-5 h-5" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setView("code"), title: "Code View", className: `p-1 rounded transition-colors ${view === "code" ? "bg-primary text-white" : "hover:bg-secondary"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Code, { className: "w-5 h-5" }) }),
              view === "visualizer" && gcodeLines.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => visualizerRef.current?.resetView(), title: "Reset to Top-Down View", className: "p-1 rounded transition-colors hover:bg-secondary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Crosshair, { className: "w-5 h-5" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => visualizerRef.current?.fitView(), title: "Fit to View", className: "p-1 rounded transition-colors hover:bg-secondary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Maximize, { className: "w-5 h-5" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => visualizerRef.current?.zoomIn(), title: "Zoom In", className: "p-1 rounded transition-colors hover:bg-secondary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ZoomIn, { className: "w-5 h-5" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => visualizerRef.current?.zoomOut(), title: "Zoom Out", className: "p-1 rounded transition-colors hover:bg-secondary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ZoomOut, { className: "w-5 h-5" }) })
              ] })
            ] }),
            view === "code" && gcodeLines.length > 0 && (isEditing ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleSave, className: "flex items-center gap-2 px-3 py-1 bg-accent-green text-white font-semibold rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors", title: "Save Changes to Local Copy", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "w-4 h-4" }),
                "Save"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleSaveToDisk, className: "flex items-center gap-2 px-3 py-1 bg-primary text-white font-semibold rounded-md hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-primary transition-colors", title: "Save to Disk", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "w-4 h-4" }),
                "Save to Disk"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleCancel, className: "flex items-center gap-2 px-3 py-1 bg-secondary text-white font-semibold rounded-md hover:bg-secondary-focus focus:outline-none focus:ring-2 focus:ring-secondary transition-colors", title: "Cancel", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-4 h-4" }),
                "Cancel"
              ] })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setIsEditing(true), className: "flex items-center gap-2 px-3 py-1 bg-secondary text-white font-semibold rounded-md hover:bg-secondary-focus focus:outline-none focus:ring-2 focus:ring-secondary transition-colors", title: "Edit G-Code", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-4 h-4" }),
              "Edit"
            ] }))
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: onOpenGenerator, disabled: isJobActive, className: "flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed", title: "Generate G-Code", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "w-5 h-5" }),
              "Generate"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", ref: fileInputRef, onChange: handleFileChange, className: "hidden", accept: ".gcode,.nc,.txt" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleUploadClick, disabled: isJobActive, className: "flex items-center gap-2 px-4 py-2 bg-secondary text-white font-semibold rounded-md hover:bg-secondary-focus focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-5 h-5" }),
              "Load File"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClearFile, disabled: isJobActive || gcodeLines.length === 0, className: "p-2 bg-secondary text-text-primary font-semibold rounded-md hover:bg-secondary-focus focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed", title: "Clear G-Code & Preview", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-5 h-5" }) })
          ] })
        ] }),
        fileName && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-text-secondary truncate mb-2", title: fileName, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "File: " }),
          fileName
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 flex-shrink-0 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-4", children: renderJobControls() }),
          !isConnected && gcodeLines.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-accent-yellow/20 border border-accent-yellow text-accent-yellow p-4 rounded-md text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold", children: "Not Connected" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Please connect to your machine or the simulator using the button in the top right corner." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full bg-secondary rounded-full h-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-primary h-4 rounded-full transition-all duration-300", style: { width: `${progress}%` } }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center text-sm font-medium", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
              "Status: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold capitalize", children: jobStatus }),
              isJobActive && totalLines > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 font-mono text-text-secondary bg-background px-2 py-0.5 rounded-md", children: `${currentLine} / ${totalLines}` })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
              gcodeLines.length > 0 && totalSeconds > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { title: timeTitle, className: "flex items-center gap-1.5 text-text-secondary", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-4 h-4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: `${timeLabel}:` }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono ml-1", children: formatTime(displayTime) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold", children: `${progress.toFixed(1)}%` })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-grow relative min-h-0", children: [
          renderContent(),
          isDraggingOver && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 bg-primary/70 border-4 border-dashed border-primary-focus rounded-lg flex flex-col items-center justify-center pointer-events-none", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-24 h-24 text-white" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-white mt-4", children: "Drop G-code file here" })
          ] })
        ] }),
        isJobActive && /* @__PURE__ */ jsxRuntimeExports.jsx(FeedrateOverrideControl, { onFeedOverride, currentFeedrate: machineState?.ov?.[0] ?? 100, className: "mt-4 flex-shrink-0" })
      ]
    }
  );
};
const Console = ({ logs, onSendCommand, isConnected, isJobActive, isMacroRunning, isLightMode, isVerbose, onVerboseChange }) => {
  const [command, setCommand] = reactExports.useState("");
  const [commandHistory, setCommandHistory] = reactExports.useState([]);
  const [historyIndex, setHistoryIndex] = reactExports.useState(-1);
  const [isAutoScroll, setIsAutoScroll] = reactExports.useState(true);
  const [isFullscreen, setIsFullscreen] = reactExports.useState(false);
  const logContainerRef = reactExports.useRef(null);
  const consoleEndRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (isAutoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, isAutoScroll]);
  const handleSendCommand = () => {
    if (command.trim() === "") return;
    onSendCommand(command);
    if (commandHistory[commandHistory.length - 1] !== command) {
      setCommandHistory((prev) => [...prev, command]);
    }
    setCommand("");
    setHistoryIndex(-1);
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSendCommand();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < 0 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCommand(commandHistory[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex >= 0) {
        const newIndex = historyIndex >= commandHistory.length - 1 ? -1 : historyIndex + 1;
        setHistoryIndex(newIndex);
        setCommand(newIndex < 0 ? "" : commandHistory[newIndex]);
      }
    }
  };
  const getLogColor = (type) => {
    switch (type) {
      case "sent":
        return isLightMode ? "text-blue-600" : "text-blue-400";
      case "received":
        return isLightMode ? "text-gray-600" : "text-gray-400";
      case "status":
        return isLightMode ? "text-purple-600" : "text-purple-400";
      case "error":
        return isLightMode ? "text-red-600" : "text-red-400";
      default:
        return "text-text-primary";
    }
  };
  const isDisabled = !isConnected || isJobActive || isMacroRunning;
  const containerClasses = isFullscreen ? "fixed inset-0 z-50 bg-surface p-4 flex flex-col" : "bg-surface rounded-lg shadow-lg flex flex-col p-4 h-full";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: containerClasses, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center pb-2 border-b border-secondary flex-shrink-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold", children: "Console" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center text-sm cursor-pointer", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: isVerbose, onChange: (e) => onVerboseChange(e.target.checked), className: "mr-1" }),
          "Verbose"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center text-sm cursor-pointer", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: isAutoScroll, onChange: (e) => setIsAutoScroll(e.target.checked), className: "mr-1", title: "Toggle Autoscroll" }),
          "Autoscroll"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setCommandHistory([]), title: "Clear History", className: "p-1 rounded-md hover:bg-secondary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4 text-text-secondary" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setIsFullscreen(!isFullscreen),
            title: isFullscreen ? "Minimize Console" : "Fullscreen Console",
            className: "p-1 rounded-md hover:bg-secondary",
            children: isFullscreen ? /* @__PURE__ */ jsxRuntimeExports.jsx(Minimize, { className: "w-5 h-5 text-text-secondary" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Maximize, { className: "w-5 h-5 text-text-secondary" })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: logContainerRef, className: "h-40 bg-background rounded p-2 my-2 overflow-y-auto font-mono text-sm", onWheel: () => setIsAutoScroll(false), children: [
      logs.map((log, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-start ${getLogColor(log.type)}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-20 flex-shrink-0 text-gray-500", children: log.timestamp.toLocaleTimeString() }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-grow break-all", children: log.message })
      ] }, index)),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: consoleEndRef })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 mt-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: (e) => {
      e.preventDefault();
      handleSendCommand();
    }, className: "flex gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "text",
          value: command,
          onChange: (e) => setCommand(e.target.value),
          onKeyDown: handleKeyDown,
          placeholder: isDisabled ? "Console locked during operation" : "Enter G-code command...",
          className: "w-full bg-background border border-secondary rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary",
          disabled: isDisabled
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: isDisabled || !command.trim(), className: "px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface transition-colors disabled:bg-secondary disabled:cursor-not-allowed", title: "Send Command", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "w-5 h-5" }) })
    ] }) })
  ] });
};
const JogPanel = reactExports.memo(({
  isConnected,
  machineState,
  onJog,
  onHome,
  onSetZero,
  onSpindleCommand,
  onProbe,
  jogStep,
  onStepChange,
  flashingButton,
  onFlash,
  unit,
  onUnitChange,
  isJobActive,
  isJogging,
  isMacroRunning
}) => {
  const [spindleSpeed, setSpindleSpeed] = reactExports.useState(1e3);
  const isControlDisabled = !isConnected || isJobActive || isJogging || isMacroRunning || ["Alarm", "Home", "Jog"].includes(machineState?.status || "");
  const isZJogDisabledForStep = unit === "mm" && jogStep > 10 || unit === "in" && jogStep > 1;
  const JogButton = ({ id, axis, direction, icon, label, hotkey }) => {
    const isZButton = axis === "Z";
    const isDisabled = isControlDisabled || isZButton && isZJogDisabledForStep;
    let title = `${label} (${axis}${direction > 0 ? "+" : "-"}) (Hotkey: ${hotkey})`;
    if (isZButton && isZJogDisabledForStep) {
      title = `Z-Jog disabled for step size > ${unit === "mm" ? "10mm" : "1in"}`;
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        id,
        onMouseDown: () => {
          onJog(axis, direction, jogStep);
          onFlash(id);
        },
        disabled: isDisabled,
        className: `flex items-center justify-center p-4 bg-secondary rounded-md hover:bg-secondary-focus focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface disabled:opacity-50 disabled:cursor-not-allowed ${flashingButton === id ? "ring-4 ring-white ring-inset" : ""}`,
        title,
        children: icon
      }
    );
  };
  const stepSizes = unit === "mm" ? [0.01, 0.1, 1, 10, 50] : [1e-3, 0.01, 0.1, 1, 2];
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-surface rounded-lg shadow-lg flex flex-col p-4 gap-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-background p-3 rounded-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-bold text-text-secondary mb-2 text-center", children: "Jog Control" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 grid-rows-3 gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-start-1 row-start-1" }),
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(JogButton, { id: "jog-y-plus", axis: "Y", direction: 1, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUp, { className: "w-6 h-6" }), label: "Jog Y+", hotkey: "Up Arrow" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(JogButton, { id: "jog-z-plus", axis: "Z", direction: 1, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUp, { className: "w-6 h-6" }), label: "Jog Z+", hotkey: "Page Up" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(JogButton, { id: "jog-x-minus", axis: "X", direction: -1, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "w-6 h-6" }), label: "Jog X-", hotkey: "Left Arrow" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-start-2 row-start-2 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pin, { className: "w-8 h-8 text-text-secondary" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(JogButton, { id: "jog-x-plus", axis: "X", direction: 1, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-6 h-6" }), label: "Jog X+", hotkey: "Right Arrow" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-start-1 row-start-3" }),
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(JogButton, { id: "jog-y-minus", axis: "Y", direction: -1, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDown, { className: "w-6 h-6" }), label: "Jog Y-", hotkey: "Down Arrow" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(JogButton, { id: "jog-z-minus", axis: "Z", direction: -1, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDown, { className: "w-6 h-6" }), label: "Jog Z-", hotkey: "Page Down" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mt-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-text-secondary", children: "Step:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1", children: stepSizes.map((step) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            id: `step-${step}`,
            onClick: () => onStepChange(step),
            disabled: isControlDisabled,
            className: `px-2 py-1 text-xs rounded-md transition-colors ${jogStep === step ? "bg-primary text-white font-bold" : "bg-secondary hover:bg-secondary-focus"} ${flashingButton === `step-${step}` ? "ring-2 ring-white ring-inset" : ""} disabled:opacity-50 disabled:cursor-not-allowed`,
            children: step
          },
          step
        )) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 border-t border-secondary pt-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-bold text-text-secondary mb-2 text-center", children: "Homing" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-2 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onHome("all"), disabled: isControlDisabled, className: "p-2 bg-secondary rounded hover:bg-secondary-focus disabled:opacity-50 font-bold", children: "Home All ($H)" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-background p-3 rounded-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-bold text-text-secondary mb-2", children: "Set Zero" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onSetZero("all"), disabled: isControlDisabled, className: "p-2 bg-secondary rounded hover:bg-secondary-focus disabled:opacity-50", children: "Zero All" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onSetZero("xy"), disabled: isControlDisabled, className: "p-2 bg-secondary rounded hover:bg-secondary-focus disabled:opacity-50", children: "Zero XY" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onSetZero("z"), disabled: isControlDisabled, className: "p-2 bg-secondary rounded hover:bg-secondary-focus disabled:opacity-50", children: "Zero Z" })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-background p-3 rounded-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-bold text-text-secondary mb-2", children: "Units" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex bg-secondary rounded-md p-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onUnitChange("mm"), disabled: isControlDisabled, className: `w-1/2 p-1 rounded-md text-sm font-semibold transition-colors ${unit === "mm" ? "bg-primary text-white" : "hover:bg-secondary-focus"} disabled:opacity-50 disabled:cursor-not-allowed`, children: "mm" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onUnitChange("in"), disabled: isControlDisabled, className: `w-1/2 p-1 rounded-md text-sm font-semibold transition-colors ${unit === "in" ? "bg-primary text-white" : "hover:bg-secondary-focus"} disabled:opacity-50 disabled:cursor-not-allowed`, children: "in" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-background p-3 rounded-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-bold text-text-secondary mb-2", children: "Probe" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onProbe("X"), disabled: isControlDisabled, className: "p-2 bg-primary text-white font-semibold rounded hover:bg-primary-focus disabled:opacity-50", children: "Probe X" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onProbe("Y"), disabled: isControlDisabled, className: "p-2 bg-primary text-white font-semibold rounded hover:bg-primary-focus disabled:opacity-50", children: "Probe Y" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => onProbe("Z"), disabled: isControlDisabled, className: "p-2 bg-primary text-white font-semibold rounded hover:bg-primary-focus disabled:opacity-50 flex items-center justify-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Probe, { className: "w-4 h-4" }),
            " Probe Z"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onProbe("XY"), disabled: isControlDisabled, className: "p-2 bg-primary text-white font-semibold rounded hover:bg-primary-focus disabled:opacity-50", children: "Probe XY" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-background p-3 rounded-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-bold text-text-secondary mb-2", children: "Spindle Control" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "number",
              value: spindleSpeed,
              onChange: (e) => setSpindleSpeed(parseInt(e.target.value, 10)),
              disabled: isControlDisabled,
              className: "w-full bg-secondary border border-secondary rounded-md py-1.5 px-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50",
              "aria-label": "Spindle Speed in RPM"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-text-secondary", children: "RPM" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2 mt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { title: "Spindle On (CW)", onClick: () => onSpindleCommand("cw", spindleSpeed), disabled: isControlDisabled, className: "p-2 bg-secondary rounded hover:bg-secondary-focus disabled:opacity-50 flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCw, { className: "w-5 h-5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { title: "Spindle On (CCW)", onClick: () => onSpindleCommand("ccw", spindleSpeed), disabled: isControlDisabled, className: "p-2 bg-secondary rounded hover:bg-secondary-focus disabled:opacity-50 flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "w-5 h-5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { title: "Spindle Off", onClick: () => onSpindleCommand("off", 0), disabled: isControlDisabled, className: "p-2 bg-secondary rounded hover:bg-secondary-focus disabled:opacity-50 flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PowerOff, { className: "w-5 h-5" }) })
        ] }),
        "                    "
      ] })
    ] })
  ] }) });
});
const MacrosPanel = ({ macros, onRunMacro, onOpenEditor, isEditMode, onToggleEditMode, disabled }) => {
  const [isCollapsed, setIsCollapsed] = reactExports.useState(true);
  const handleButtonClick = (e, index) => {
    e.stopPropagation();
    if (isEditMode) {
      onOpenEditor(index);
    } else {
      onRunMacro(macros[index].commands);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface rounded-lg shadow-lg p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        onClick: () => setIsCollapsed((p) => !p),
        className: "flex items-center justify-between cursor-pointer",
        role: "button",
        tabIndex: 0,
        "aria-expanded": !isCollapsed,
        "aria-controls": "macros-panel-content",
        onKeyDown: (e) => {
          if (e.key === "Enter" || e.key === " ") setIsCollapsed((p) => !p);
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-lg font-bold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "w-5 h-5 text-primary" }),
            "Macros"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: (e) => {
                  e.stopPropagation();
                  onToggleEditMode();
                  if (!isEditMode) {
                    setIsCollapsed(false);
                  }
                },
                disabled: disabled && !isEditMode,
                className: "flex items-center gap-2 px-3 py-1 bg-secondary text-white font-semibold rounded-md hover:bg-secondary-focus focus:outline-none focus:ring-2 focus:ring-secondary transition-colors text-sm disabled:opacity-50",
                children: isEditMode ? /* @__PURE__ */ jsxRuntimeExports.jsxs(reactExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "w-4 h-4 text-accent-green" }),
                  " Done"
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(reactExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-4 h-4" }),
                  " Edit"
                ] })
              }
            ),
            isCollapsed ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "w-5 h-5 text-text-secondary" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "w-5 h-5 text-text-secondary" })
          ] })
        ]
      }
    ),
    !isCollapsed && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { id: "macros-panel-content", className: "mt-4 pt-4 border-t border-secondary", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-2", children: [
      macros.map((macro, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: (e) => handleButtonClick(e, index),
          disabled: disabled && !isEditMode,
          className: "relative p-3 bg-secondary rounded-md text-sm font-semibold hover:bg-secondary-focus focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface disabled:opacity-50 disabled:cursor-not-allowed text-left",
          title: isEditMode ? `Edit "${macro.name}"` : macro.commands.join("; "),
          children: [
            macro.name,
            isEditMode && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-1 right-1 p-1 rounded-full bg-primary/50 hover:bg-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3 h-3 text-white" }) })
          ]
        },
        index
      )),
      isEditMode && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: (e) => {
            e.stopPropagation();
            onOpenEditor(null);
          },
          className: "p-3 border-2 border-dashed border-secondary rounded-md text-sm font-semibold text-text-secondary hover:border-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface flex flex-col items-center justify-center gap-1",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(PlusCircle, { className: "w-6 h-6" }),
            "Add Macro"
          ]
        }
      )
    ] }) })
  ] });
};
const WebcamPanel = () => {
  const [isWebcamOn, setIsWebcamOn] = reactExports.useState(false);
  const [isInPiP, setIsInPiP] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const videoRef = reactExports.useRef(null);
  const streamRef = reactExports.useRef(null);
  const isPiPSupported = "pictureInPictureEnabled" in document;
  const handleTogglePiP = async () => {
    if (!videoRef.current || !isPiPSupported) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (videoRef.current.srcObject) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (pipError) {
      console.error("PiP Error:", pipError);
      setError("Could not enter Picture-in-Picture mode.");
    }
  };
  const handleToggleWebcam = async () => {
    if (isWebcamOn && document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    }
    setIsWebcamOn((prev) => !prev);
  };
  reactExports.useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    const onEnterPiP = () => setIsInPiP(true);
    const onLeavePiP = () => setIsInPiP(false);
    videoElement.addEventListener("enterpictureinpicture", onEnterPiP);
    videoElement.addEventListener("leavepictureinpicture", onLeavePiP);
    return () => {
      videoElement.removeEventListener("enterpictureinpicture", onEnterPiP);
      videoElement.removeEventListener("leavepictureinpicture", onLeavePiP);
    };
  }, []);
  reactExports.useEffect(() => {
    const startWebcam = async () => {
      try {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setError(null);
      } catch (err) {
        console.error("Webcam Error:", err);
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setError("Webcam access denied. Please allow camera permissions in your browser settings.");
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          setError("No webcam found. Please connect a camera and try again.");
        } else {
          setError("Could not access webcam.");
        }
        setIsWebcamOn(false);
      }
    };
    const stopWebcam = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
    if (isWebcamOn) {
      startWebcam();
    } else {
      stopWebcam();
    }
    return () => {
      stopWebcam();
    };
  }, [isWebcamOn]);
  const renderBody = () => {
    if (!isWebcamOn) {
      return null;
    }
    if (isInPiP) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative aspect-video bg-background rounded-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: handleTogglePiP,
          title: "Dock to Panel",
          className: "absolute top-2 right-2 flex items-center gap-2 p-2 bg-secondary text-white font-semibold rounded-md hover:bg-secondary-focus focus:outline-none focus:ring-2 focus:ring-primary",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Dock, { className: "w-5 h-5" })
        }
      ) });
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "aspect-video bg-background rounded-md overflow-hidden flex items-center justify-center", children: [
      error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center text-accent-yellow p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTriangle, { className: "w-8 h-8 mx-auto mb-2" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", children: error })
      ] }),
      !error && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "video",
        {
          ref: videoRef,
          autoPlay: true,
          playsInline: true,
          muted: true,
          className: "w-full h-full object-cover"
        }
      )
    ] });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface rounded-lg shadow-lg p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `text-lg font-bold flex items-center justify-between ${isWebcamOn ? "pb-4 border-b border-secondary mb-4" : ""}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        isWebcamOn ? /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "w-5 h-5 text-primary" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CameraOff, { className: "w-5 h-5 text-text-secondary" }),
        "Webcam"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        isWebcamOn && isPiPSupported && !isInPiP && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: handleTogglePiP,
            title: "Picture-in-Picture",
            className: "p-1 rounded-md text-text-secondary hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-primary",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(PictureInPicture, { className: "w-5 h-5" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: handleToggleWebcam,
            className: `flex items-center gap-2 px-3 py-1 ${isWebcamOn ? "bg-accent-red hover:bg-red-700" : "bg-secondary hover:bg-secondary-focus"} text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-colors text-sm`,
            children: [
              isWebcamOn ? /* @__PURE__ */ jsxRuntimeExports.jsx(CameraOff, { className: "w-4 h-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "w-4 h-4" }),
              isWebcamOn ? "Disable" : "Enable"
            ]
          }
        )
      ] })
    ] }),
    renderBody()
  ] });
};
const ChecklistItem = ({ children, status }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: `flex items-center gap-3 ${status === "warning" ? "text-accent-yellow" : ""}`, children: [
  status === "checked" ? /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "w-6 h-6 text-accent-green" }) : status === "warning" ? /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTriangle, { className: "w-6 h-6 text-accent-yellow" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-6 h-6 text-accent-red" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-text-primary", children })
] });
const PreflightChecklistModal = ({ isOpen, onCancel, onConfirm, jobInfo, isHomed, warnings, selectedTool }) => {
  const [isDryRun, setIsDryRun] = reactExports.useState(false);
  const [skipPreflight, setSkipPreflight] = reactExports.useState(() => localStorage.getItem("cnc-app-skip-preflight") === "true");
  if (!isOpen) return null;
  const hasErrors = warnings.some((w) => w.type === "error");
  const handleConfirm = () => {
    if (skipPreflight) {
      localStorage.setItem("cnc-app-skip-preflight", "true");
    }
    onConfirm({ isDryRun });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-background/80 backdrop-blur-sm z-40 flex items-center justify-center", onClick: onCancel, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface rounded-lg shadow-2xl w-full max-w-2xl border border-secondary transform transition-all", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 border-b border-secondary flex justify-between items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-2xl font-bold text-text-primary flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTriangle, { className: "w-8 h-8 text-accent-yellow" }),
        "Preflight Check"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onCancel, className: "p-1 rounded-md text-text-secondary hover:text-text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-6 h-6" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Please review the following before starting the job:" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-2 bg-background p-4 rounded-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(ChecklistItem, { status: jobInfo.fileName ? "checked" : "unchecked", children: [
          "Job file loaded: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: jobInfo.fileName })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChecklistItem, { status: isHomed ? "checked" : "warning", children: isHomed ? "Machine has been homed" : "Machine has not been homed since connecting" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChecklistItem, { status: hasErrors ? "unchecked" : "checked", children: "G-code analysis passed" })
      ] }),
      warnings.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-40 overflow-y-auto space-y-2", children: warnings.map((w, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `p-3 rounded-md text-sm ${w.type === "error" ? "bg-accent-red/20 text-accent-red" : "bg-accent-yellow/20 text-accent-yellow"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: w.type === "error" ? "Error:" : "Warning:" }),
        " ",
        w.message
      ] }, i)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-background px-6 py-4 flex justify-between items-center rounded-b-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm cursor-pointer", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: isDryRun, onChange: (e) => setIsDryRun(e.target.checked), className: "h-4 w-4 rounded border-secondary text-primary focus:ring-primary" }),
        "Run in Dry Run mode (no spindle/laser, rapids only)"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onCancel, className: "px-4 py-2 bg-secondary text-white font-semibold rounded-md hover:bg-secondary-focus", children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleConfirm, disabled: hasErrors, className: "px-6 py-2 bg-accent-green text-white font-bold rounded-md hover:bg-green-600 disabled:bg-secondary disabled:cursor-not-allowed flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "w-5 h-5" }),
          "Confirm & Start Job"
        ] })
      ] })
    ] })
  ] }) });
};
const SetupStep = ({ title, description, isComplete, onAction, actionText }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `p-4 rounded-lg flex items-center justify-between ${isComplete ? "bg-accent-green/10" : "bg-secondary"}`, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: `font-bold ${isComplete ? "text-accent-green" : "text-text-primary"}`, children: title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-text-secondary", children: description })
  ] }),
  isComplete ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-bold text-accent-green", children: "Complete" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onAction, className: "px-3 py-1 bg-primary text-white font-semibold rounded-md hover:bg-primary-focus text-sm", children: actionText })
] });
const WelcomeModal = ({
  isOpen,
  onClose,
  onOpenSettings,
  onOpenToolLibrary,
  onTrySimulator,
  isMachineSetupComplete,
  isToolLibrarySetupComplete
}) => {
  if (!isOpen) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface rounded-lg shadow-2xl w-full max-w-2xl border border-secondary transform transition-all", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 border-b border-secondary flex justify-between items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-text-primary", children: "Welcome to mycnc.app!" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "p-1 rounded-md text-text-secondary hover:text-text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-6 h-6" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-base text-text-primary", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "mycnc.app" }),
        " is a web-based G-code sender that runs in your browser to control your CNC machine. Connect via USB to jog, send files, and monitor jobs in real-time. It includes a 3D toolpath visualizer, a machine simulator, and G-code generators for simple operations."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("hr", { className: "border-secondary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-text-secondary", children: "To get started, please complete the two steps below. This will configure the application for your specific machine." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SetupStep, { title: "Machine Setup", description: "Define your machine's work area and spindle speeds.", isComplete: isMachineSetupComplete, onAction: onOpenSettings, actionText: "Open Settings" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SetupStep, { title: "Tool Library", description: "Add at least one tool to your library.", isComplete: isToolLibrarySetupComplete, onAction: onOpenToolLibrary, actionText: "Open Tool Library" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-6 border-t border-secondary space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: onClose,
            disabled: !isMachineSetupComplete || !isToolLibrarySetupComplete,
            className: "w-full flex items-center justify-center gap-3 p-4 bg-primary text-white font-bold rounded-md hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface transition-colors disabled:bg-secondary disabled:cursor-not-allowed text-xl",
            children: "Get Started"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-text-secondary mb-2", children: "Or, if you just want to try out the software:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: onTrySimulator, className: "px-4 py-2 bg-secondary text-white font-semibold rounded-md hover:bg-secondary-focus flex items-center gap-2 mx-auto", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "w-5 h-5" }),
            "Try the Simulator"
          ] })
        ] })
      ] })
    ] })
  ] }) });
};
const MacroEditorModal = ({ isOpen, onCancel, onSave, onDelete, macro, index }) => {
  const isEditing = macro != null && index != null;
  const [name2, setName] = reactExports.useState("");
  const [commands, setCommands] = reactExports.useState("");
  reactExports.useEffect(() => {
    if (isOpen) {
      setName(isEditing ? macro.name : "");
      setCommands(isEditing ? macro.commands.join("\n") : "");
    }
  }, [isOpen, macro, isEditing]);
  if (!isOpen) {
    return null;
  }
  const handleSave = () => {
    if (name2.trim() === "") {
      return;
    }
    const newMacro = {
      name: name2.trim(),
      commands: commands.split("\n").map((cmd) => cmd.trim()).filter((cmd) => cmd)
    };
    onSave(newMacro, index);
    onCancel();
  };
  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete the macro "${macro.name}"?`)) {
      onDelete(index);
      onCancel();
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "fixed inset-0 bg-background/80 backdrop-blur-sm z-40 flex items-center justify-center",
      onClick: onCancel,
      "aria-modal": "true",
      role: "dialog",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "bg-surface rounded-lg shadow-2xl w-full max-w-lg border border-secondary transform transition-all",
          onClick: (e) => e.stopPropagation(),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 border-b border-secondary flex justify-between items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-text-primary", children: isEditing ? "Edit Macro" : "Add New Macro" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: onCancel,
                  className: "p-1 rounded-md text-text-secondary hover:text-text-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-6 h-6" })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "macro-name", className: "block text-sm font-medium text-text-secondary mb-1", children: "Macro Name" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    id: "macro-name",
                    type: "text",
                    value: name2,
                    onChange: (e) => setName(e.target.value),
                    placeholder: "e.g., Probe Z-Axis",
                    className: "w-full bg-background border border-secondary rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "macro-commands", className: "block text-sm font-medium text-text-secondary mb-1", children: "G-Code Commands" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "textarea",
                  {
                    id: "macro-commands",
                    value: commands,
                    onChange: (e) => setCommands(e.target.value),
                    rows: 8,
                    placeholder: "G21\nG90\nG0 Z10\n...",
                    className: "w-full bg-background border border-secondary rounded-md py-2 px-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
                    spellCheck: "false"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-text-secondary mt-1", children: "Enter one G-code command per line." })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-background px-6 py-4 flex justify-between items-center rounded-b-lg", children: [
              isEditing ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: handleDelete,
                  className: "flex items-center gap-2 px-4 py-2 bg-accent-red text-white font-semibold rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-background",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-5 h-5" }),
                    "Delete"
                  ]
                }
              ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", {}),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: onCancel,
                    className: "px-4 py-2 bg-secondary text-white font-semibold rounded-md hover:bg-secondary-focus focus:outline-none focus:ring-2 focus:ring-secondary",
                    children: "Cancel"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    onClick: handleSave,
                    disabled: name2.trim() === "",
                    className: "px-6 py-2 bg-primary text-white font-bold rounded-md hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-secondary disabled:cursor-not-allowed flex items-center gap-2",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "w-5 h-5" }),
                      "Save"
                    ]
                  }
                )
              ] })
            ] })
          ]
        }
      )
    }
  );
};
const InputGroup = ({ label, children }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-bold text-text-secondary mb-2", children: label }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2", children })
] });
const NumberInput = ({ id, value, onChange, unit }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-grow", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(
    "input",
    {
      id,
      type: "number",
      value,
      onChange,
      className: "w-full bg-background border border-secondary rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
    }
  ),
  unit && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute right-3 top-1/2 -translate-y-1/2 text-sm text-text-secondary", children: unit })
] });
const ScriptInput = ({ label, value, onChange, placeholder }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-text-secondary mb-1", children: label }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(
    "textarea",
    {
      value,
      onChange,
      rows: 4,
      placeholder,
      className: "w-full bg-background border border-secondary rounded-md py-2 px-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
      spellCheck: "false"
    }
  )
] });
const SettingsModal = ({ isOpen, onCancel, onSave, settings, generatorSettings, onResetDialogs, onExport, onImport }) => {
  const [localSettings, setLocalSettings] = reactExports.useState(settings);
  const [localGeneratorSettings, setLocalGeneratorSettings] = reactExports.useState(generatorSettings);
  const importFileRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (isOpen) {
      setLocalSettings(JSON.parse(JSON.stringify(settings)));
      setLocalGeneratorSettings(JSON.parse(JSON.stringify(generatorSettings)));
    }
  }, [isOpen, settings, generatorSettings]);
  if (!isOpen) return null;
  const handleNestedNumericChange = (category, field, value) => {
    setLocalSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };
  const handleScriptChange = (scriptName, value) => {
    setLocalSettings((prev) => ({
      ...prev,
      scripts: {
        ...prev.scripts,
        [scriptName]: value
      }
    }));
  };
  const handleSave = () => {
    const settingsToSave = JSON.parse(JSON.stringify(localSettings));
    const numericFields = {
      workArea: ["x", "y", "z"],
      spindle: ["min", "max"],
      probe: ["xOffset", "yOffset", "zOffset", "feedRate"]
    };
    for (const category in numericFields) {
      if (settingsToSave[category]) {
        for (const field of numericFields[category]) {
          const value = settingsToSave[category][field];
          settingsToSave[category][field] = parseFloat(value) || 0;
        }
      }
    }
    onSave(settingsToSave, localGeneratorSettings);
    onCancel();
  };
  const handleFileImport = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        onImport(importedData);
        onCancel();
      } catch (error) {
        console.error("Failed to parse settings file:", error);
        alert("Error: Could not read or parse the settings file. Please ensure it's a valid JSON file.");
      }
    };
    reader.readAsText(file);
    event.target.value = null;
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "fixed inset-0 bg-background/80 backdrop-blur-sm z-40 flex items-center justify-center",
      onClick: onCancel,
      "aria-modal": "true",
      role: "dialog",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "bg-surface rounded-lg shadow-2xl w-full max-w-2xl border border-secondary transform transition-all max-h-[90vh] flex flex-col",
          onClick: (e) => e.stopPropagation(),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 border-b border-secondary flex justify-between items-center flex-shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-text-primary", children: "Machine Settings" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onCancel, className: "p-1 rounded-md text-text-secondary hover:text-text-primary hover:bg-secondary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-6 h-6" }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-6 overflow-y-auto", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 bg-background p-4 rounded-md", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(InputGroup, { label: "Work Area Dimensions (mm)", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(NumberInput, { id: "work-x", value: localSettings.workArea.x, onChange: (e) => handleNestedNumericChange("workArea", "x", e.target.value), unit: "X" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(NumberInput, { id: "work-y", value: localSettings.workArea.y, onChange: (e) => handleNestedNumericChange("workArea", "y", e.target.value), unit: "Y" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(NumberInput, { id: "work-z", value: localSettings.workArea.z, onChange: (e) => handleNestedNumericChange("workArea", "z", e.target.value), unit: "Z" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(InputGroup, { label: "Spindle Speed Range (RPM)", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(NumberInput, { id: "spindle-min", value: localSettings.spindle.min, onChange: (e) => handleNestedNumericChange("spindle", "min", e.target.value), unit: "Min" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(NumberInput, { id: "spindle-max", value: localSettings.spindle.max, onChange: (e) => handleNestedNumericChange("spindle", "max", e.target.value), unit: "Max" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(InputGroup, { label: "Probe (mm)", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-4 text-center text-text-secondary font-semibold", children: "X" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(NumberInput, { id: "probe-x", value: localSettings.probe.xOffset, onChange: (e) => handleNestedNumericChange("probe", "xOffset", e.target.value) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-4 text-center text-text-secondary font-semibold", children: "Y" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(NumberInput, { id: "probe-y", value: localSettings.probe.yOffset, onChange: (e) => handleNestedNumericChange("probe", "yOffset", e.target.value) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-4 text-center text-text-secondary font-semibold", children: "Z" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(NumberInput, { id: "probe-z", value: localSettings.probe.zOffset, onChange: (e) => handleNestedNumericChange("probe", "zOffset", e.target.value) })
                  ] }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(InputGroup, { label: "Probe Feed Rate", children: /* @__PURE__ */ jsxRuntimeExports.jsx(NumberInput, { id: "probe-feed", value: localSettings.probe.feedRate, onChange: (e) => handleNestedNumericChange("probe", "feedRate", e.target.value), unit: "mm/min" }) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 bg-background p-4 rounded-md", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-bold text-text-secondary mb-2", children: "Custom G-Code Scripts" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ScriptInput, { label: "Startup Script (on connect)", value: localSettings.scripts.startup, onChange: (e) => handleScriptChange("startup", e.target.value), placeholder: "e.g., G21 G90" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ScriptInput, { label: "Tool Change Script", value: localSettings.scripts.toolChange, onChange: (e) => handleScriptChange("toolChange", e.target.value), placeholder: "e.g., M5 G0 Z10" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ScriptInput, { label: "Shutdown Script (on disconnect)", value: localSettings.scripts.shutdown, onChange: (e) => handleScriptChange("shutdown", e.target.value), placeholder: "e.g., M5 G0 X0 Y0" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-background p-4 rounded-md", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-bold text-text-secondary mb-2", children: "Configuration" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Export/Import all settings, macros, and tools." }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", ref: importFileRef, className: "hidden", accept: ".json", onChange: handleFileImport }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => importFileRef.current.click(), className: "flex items-center gap-2 px-4 py-2 bg-secondary text-white text-sm font-semibold rounded-md hover:bg-secondary-focus", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-4 h-4" }),
                      "Import"
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: onExport, className: "flex items-center gap-2 px-4 py-2 bg-secondary text-white text-sm font-semibold rounded-md hover:bg-secondary-focus", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-4 h-4" }),
                      "Export"
                    ] })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-background p-4 rounded-md", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-bold text-text-secondary mb-2", children: "Interface Settings" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: `Reset "Don't show again" dialogs.` }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onResetDialogs, className: "px-4 py-2 bg-secondary text-white text-sm font-semibold rounded-md hover:bg-secondary-focus focus:outline-none focus:ring-2 focus:ring-secondary", children: "Reset Dialogs" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-background px-6 py-4 flex justify-end items-center rounded-b-lg flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onCancel, className: "px-4 py-2 bg-secondary text-white font-semibold rounded-md hover:bg-secondary-focus", children: "Cancel" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleSave, className: "px-6 py-2 bg-primary text-white font-bold rounded-md hover:bg-primary-focus flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "w-5 h-5" }),
                "Save Settings"
              ] })
            ] }) })
          ]
        }
      )
    }
  );
};
const newToolInitialState = {
  id: null,
  name: "",
  diameter: ""
};
const ToolLibraryModal = ({ isOpen, onCancel, onSave, library }) => {
  const [localLibrary, setLocalLibrary] = reactExports.useState([]);
  const [isEditing, setIsEditing] = reactExports.useState(false);
  const [currentTool, setCurrentTool] = reactExports.useState(newToolInitialState);
  reactExports.useEffect(() => {
    if (isOpen) {
      setLocalLibrary(library.map((tool, index) => ({ ...tool, id: tool.id ?? Date.now() + index })));
    }
  }, [isOpen, library]);
  if (!isOpen) return null;
  const handleEdit = (tool) => {
    setCurrentTool(tool);
    setIsEditing(true);
  };
  const handleAddNew = () => {
    setCurrentTool(newToolInitialState);
    setIsEditing(true);
  };
  const handleCancelEdit = () => {
    setIsEditing(false);
    setCurrentTool(newToolInitialState);
  };
  const handleSaveTool = () => {
    if (currentTool.name.trim() === "" || currentTool.diameter === "" || isNaN(Number(currentTool.diameter))) return;
    const toolToSave = { ...currentTool, diameter: Number(currentTool.diameter) };
    if (currentTool.id) {
      setLocalLibrary((lib) => lib.map((t) => t.id === toolToSave.id ? toolToSave : t));
    } else {
      setLocalLibrary((lib) => [...lib, { ...toolToSave, id: Date.now() }]);
    }
    handleCancelEdit();
  };
  const handleDelete = (toolId) => {
    if (window.confirm("Are you sure you want to delete this tool?")) {
      setLocalLibrary((lib) => lib.filter((t) => t.id !== toolId));
    }
  };
  const handleSaveAndClose = () => {
    onSave(localLibrary);
    onCancel();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center",
      onClick: onCancel,
      "aria-modal": "true",
      role: "dialog",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "bg-surface rounded-lg shadow-2xl w-full max-w-md border border-secondary transform transition-all max-h-[80vh] flex flex-col",
          onClick: (e) => e.stopPropagation(),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 border-b border-secondary flex justify-between items-center flex-shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-text-primary", children: "Tool Library" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onCancel, className: "p-1 rounded-md text-text-secondary hover:text-text-primary hover:bg-secondary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-6 h-6" }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-4 overflow-y-auto", children: [
              !isEditing ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: handleAddNew,
                  className: "w-full flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-white font-semibold rounded-md hover:bg-secondary-focus focus:outline-none focus:ring-2 focus:ring-primary",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-5 h-5" }),
                    "Add New Tool"
                  ]
                }
              ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-background p-4 rounded-md border border-primary", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold mb-2", children: currentTool.id ? "Edit Tool" : "Add Tool" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-text-secondary mb-1", children: "Tool Name" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        type: "text",
                        placeholder: 'e.g., 1/4" 2-Flute Endmill',
                        value: currentTool.name,
                        onChange: (e) => setCurrentTool((prev) => ({ ...prev, name: e.target.value })),
                        className: "w-full bg-secondary border border-secondary rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-text-secondary mb-1", children: "Diameter (mm)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        type: "number",
                        placeholder: "e.g., 6.35",
                        value: currentTool.diameter || "",
                        onChange: (e) => setCurrentTool((prev) => ({ ...prev, diameter: e.target.value })),
                        className: "w-full bg-secondary border border-secondary rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mt-4 justify-end", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleCancelEdit, className: "px-3 py-1 bg-secondary text-white rounded-md hover:bg-secondary-focus", children: "Cancel" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleSaveTool, className: "px-3 py-1 bg-primary text-white rounded-md hover:bg-primary-focus", children: "Save" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: localLibrary.length > 0 ? localLibrary.map((tool) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between bg-background p-3 rounded-md", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: tool.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-text-secondary", children: `Ø ${tool.diameter} mm` })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleEdit(tool), className: "p-1 text-text-secondary hover:text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-4 h-4" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleDelete(tool.id), className: "p-1 text-text-secondary hover:text-accent-red", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" }) })
                ] })
              ] }, tool.id)) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-text-secondary py-4", children: "Your tool library is empty." }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-background px-6 py-4 flex justify-end items-center rounded-b-lg flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: handleSaveAndClose,
                disabled: isEditing,
                className: "px-6 py-2 bg-primary text-white font-bold rounded-md hover:bg-primary-focus flex items-center gap-2 disabled:bg-secondary disabled:cursor-not-allowed",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "w-5 h-5" }),
                  "Save & Close"
                ]
              }
            ) })
          ]
        }
      )
    }
  );
};
const NotificationItem = ({ notification, onDismiss }) => {
  const { id, message, type } = notification;
  const icon = type === "success" ? /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "w-12 h-12 text-accent-green" }) : type === "error" ? /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTriangle, { className: "w-12 h-12 text-accent-red" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "w-12 h-12 text-accent-blue" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `max-w-4xl w-full bg-background shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden border-2 ${type === "success" ? "border-accent-green" : type === "error" ? "border-accent-red" : "border-accent-blue"} mb-4`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0", children: icon }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-5 w-0 flex-1 pt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-3xl font-medium text-text-primary", children: message }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-4 flex-shrink-0 flex", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: () => onDismiss(id),
        className: "rounded-md inline-flex text-text-secondary hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: "Close" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-8 w-8" })
        ]
      }
    ) })
  ] }) }) });
};
const NotificationContainer = ({ notifications, onDismiss }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      "aria-live": "assertive",
      className: "fixed inset-x-0 top-0 flex items-center justify-center px-4 py-6 pointer-events-none z-50",
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full max-w-4xl flex flex-col items-center space-y-4", children: notifications.map((notification) => /* @__PURE__ */ jsxRuntimeExports.jsx(NotificationItem, { notification, onDismiss }, notification.id)) })
    }
  );
};
const ThemeToggle = ({ isLightMode, onToggle }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      onClick: onToggle,
      title: isLightMode ? "Switch to Dark Mode" : "Switch to Light Mode",
      className: "p-2 rounded-md bg-secondary text-text-primary hover:bg-secondary-focus focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface",
      children: isLightMode ? /* @__PURE__ */ jsxRuntimeExports.jsx(Moon, { className: "w-5 h-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Sun, { className: "w-5 h-5" })
    }
  );
};
const StatusIndicator = ({ isConnected, machineState }) => {
  const getStatusIndicatorClass = () => {
    if (!isConnected) return "bg-accent-yellow/20 text-accent-yellow";
    if (machineState?.status === "Alarm") return "bg-accent-red/20 text-accent-red";
    return "bg-accent-green/20 text-accent-green";
  };
  const statusText = isConnected ? machineState?.status === "Home" ? "Homing" : machineState?.status || "Connected" : "Disconnected";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-sm text-text-secondary", children: "Status:" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `px-3 py-1 text-sm rounded-full font-bold ${getStatusIndicatorClass()}`, children: statusText })
  ] });
};
const SpindleStatusIndicator = ({ machineState, isConnected }) => {
  if (!isConnected) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-text-secondary", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(PowerOff, { className: "w-5 h-5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Spindle Off" })
    ] });
  }
  const spindleState = machineState?.spindle?.state || "off";
  const spindleSpeed = machineState?.spindle?.speed || 0;
  if (spindleState === "off" || spindleSpeed === 0) return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-text-secondary", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PowerOff, { className: "w-5 h-5" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Spindle Off" })
  ] });
  const icon = spindleState === "cw" ? /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCw, { className: "w-5 h-5 text-accent-green animate-spin-slow" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "w-5 h-5 text-accent-green animate-spin-slow-reverse" });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-text-primary", children: [
    icon,
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col leading-tight", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: `${spindleSpeed.toLocaleString()} RPM` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-text-secondary", children: spindleState === "cw" ? "Clockwise" : "Counter-CW" })
    ] })
  ] });
};
const formatCoordinate = (val) => val?.toFixed(3) ?? "0.000";
const PositionDisplay = ({ title, pos, unit }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-bold text-text-secondary", children: title }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 text-center font-mono bg-background px-2 py-1 rounded-md text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-red-400", children: "X " }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-text-primary", children: formatCoordinate(pos?.x) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-green-400", children: "Y " }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-text-primary", children: formatCoordinate(pos?.y) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-blue-400", children: "Z " }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-text-primary", children: formatCoordinate(pos?.z) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-text-secondary ml-1 self-center", children: unit })
  ] })
] });
const StatusBar = ({ isConnected, machineState, unit, onEmergencyStop, flashingButton }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface/50 border-b border-t border-secondary shadow-sm p-2 flex justify-between items-center z-10 flex-shrink-0 gap-4", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(StatusIndicator, { isConnected, machineState }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-6 border-l border-secondary" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SpindleStatusIndicator, { isConnected, machineState })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PositionDisplay, { title: "WPos", pos: machineState?.wpos, unit }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-6 border-l border-secondary" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PositionDisplay, { title: "MPos", pos: machineState?.mpos, unit })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: isConnected && /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      onClick: onEmergencyStop,
      className: `flex items-center gap-2 px-3 py-2 bg-red-600 text-white font-bold rounded-md hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-surface transition-all duration-100 animate-pulse ${flashingButton === "estop" ? "ring-4 ring-white ring-inset" : ""}`,
      title: "Emergency Stop (Soft Reset) (Hotkey: Esc)",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(OctagonAlert, { className: "w-5 h-5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden md:inline", children: "E-STOP" })
      ]
    }
  ) })
] });
const RAPID_FEED_RATE = 4e3;
const DEFAULT_FEED_RATE = 500;
const getParam$1 = (gcode, param) => {
  const regex = new RegExp(`${param}\\s*([-+]?[0-9]*\\.?[0-9]*)`, "i");
  const match = gcode.match(regex);
  return match ? parseFloat(match[1]) : null;
};
const estimateGCodeTime = (gcodeLines) => {
  let totalSeconds = 0;
  const cumulativeSeconds = [];
  let state = {
    x: 0,
    y: 0,
    z: 0,
    feedRate: DEFAULT_FEED_RATE,
    isAbsolute: true,
    // G90 is default
    motionMode: "G0"
  };
  gcodeLines.forEach((line) => {
    const upperLine = line.toUpperCase();
    if (upperLine.includes("G90")) state.isAbsolute = true;
    if (upperLine.includes("G91")) state.isAbsolute = false;
    const f = getParam$1(upperLine, "F");
    if (f !== null) state.feedRate = f;
    const gCommandMatch = upperLine.match(/G(\d+(\.\d+)?)/);
    if (gCommandMatch) {
      const gCode = parseInt(gCommandMatch[1], 10);
      if ([0, 1, 2, 3].includes(gCode)) {
        state.motionMode = `G${gCode}`;
      }
    }
    if (upperLine.includes("X") || upperLine.includes("Y") || upperLine.includes("Z")) {
      const lastPos = { ...state };
      const nextX = getParam$1(upperLine, "X");
      const nextY = getParam$1(upperLine, "Y");
      const nextZ = getParam$1(upperLine, "Z");
      let targetX = state.x, targetY = state.y, targetZ = state.z;
      if (state.isAbsolute) {
        if (nextX !== null) targetX = nextX;
        if (nextY !== null) targetY = nextY;
        if (nextZ !== null) targetZ = nextZ;
      } else {
        if (nextX !== null) targetX += nextX;
        if (nextY !== null) targetY += nextY;
        if (nextZ !== null) targetZ += nextZ;
      }
      state.x = targetX;
      state.y = targetY;
      state.z = targetZ;
      let distance = 0;
      const dx = state.x - lastPos.x;
      const dy = state.y - lastPos.y;
      const dz = state.z - lastPos.z;
      distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (distance > 0) {
        const effectiveFeed = state.motionMode === "G0" ? RAPID_FEED_RATE : state.feedRate;
        if (effectiveFeed > 0) {
          const timeMinutes = distance / effectiveFeed;
          totalSeconds += timeMinutes * 60;
        }
      }
    }
    cumulativeSeconds.push(totalSeconds);
  });
  return { totalSeconds, cumulativeSeconds };
};
const getParam = (gcode, param) => {
  const regex = new RegExp(`${param}\\s*([-+]?[0-9]*\\.?[0-9]*)`, "i");
  const match = gcode.match(regex);
  return match ? parseFloat(match[1]) : null;
};
const analyzeGCode = (gcodeLines, settings) => {
  const warnings = [];
  if (!gcodeLines || gcodeLines.length === 0) {
    return warnings;
  }
  const { bounds } = parseGCode(gcodeLines);
  if (bounds.maxX > settings.workArea.x) {
    warnings.push({ type: "error", message: `Toolpath exceeds machine X+ travel (${bounds.maxX.toFixed(2)}mm > ${settings.workArea.x}mm).` });
  }
  if (bounds.minX < 0) {
    warnings.push({ type: "warning", message: `Toolpath contains negative X coordinates (${bounds.minX.toFixed(2)}mm). Ensure WCS is set correctly.` });
  }
  if (bounds.maxY > settings.workArea.y) {
    warnings.push({ type: "error", message: `Toolpath exceeds machine Y+ travel (${bounds.maxY.toFixed(2)}mm > ${settings.workArea.y}mm).` });
  }
  if (bounds.minY < 0) {
    warnings.push({ type: "warning", message: `Toolpath contains negative Y coordinates (${bounds.minY.toFixed(2)}mm). Ensure WCS is set correctly.` });
  }
  if (bounds.maxZ > settings.workArea.z) {
    warnings.push({ type: "warning", message: `Toolpath exceeds machine Z+ travel (${bounds.maxZ.toFixed(2)}mm > ${settings.workArea.z}mm).` });
  }
  if (bounds.minZ < 0) {
    warnings.push({ type: "warning", message: `Toolpath plunges below Z0 (${bounds.minZ.toFixed(2)}mm). This is normal for cutting, but confirm your Z-zero is on the stock top.` });
  }
  let maxSpindle = 0;
  let minSpindle = Infinity;
  let spindleFound = false;
  gcodeLines.forEach((line) => {
    const upperLine = line.toUpperCase();
    if (upperLine.includes("M3") || upperLine.includes("M4")) {
      const s = getParam(upperLine, "S");
      if (s !== null) {
        spindleFound = true;
        if (s > maxSpindle) maxSpindle = s;
        if (s > 0 && s < minSpindle) minSpindle = s;
      }
    }
  });
  if (spindleFound) {
    if (maxSpindle > settings.spindle.max) {
      warnings.push({ type: "error", message: `Job requests spindle speed of ${maxSpindle} RPM, but max is ${settings.spindle.max} RPM.` });
    }
    if (minSpindle < settings.spindle.min) {
      warnings.push({ type: "warning", message: `Job requests spindle speed of ${minSpindle} RPM, but configured min is ${settings.spindle.min} RPM.` });
    }
  }
  return warnings;
};
var define_process_env_default = {};
var name = "@vercel/analytics";
var version = "1.5.0";
var initQueue = () => {
  if (window.va) return;
  window.va = function a(...params) {
    (window.vaq = window.vaq || []).push(params);
  };
};
function isBrowser() {
  return typeof window !== "undefined";
}
function detectEnvironment() {
  try {
    const env = "production";
    if (env === "development" || env === "test") ;
  } catch (e) {
  }
  return "production";
}
function setMode(mode = "auto") {
  if (mode === "auto") {
    window.vam = detectEnvironment();
    return;
  }
  window.vam = mode;
}
function getMode() {
  const mode = isBrowser() ? window.vam : detectEnvironment();
  return mode || "production";
}
function isDevelopment() {
  return getMode() === "development";
}
function getScriptSrc(props) {
  if (props.scriptSrc) {
    return props.scriptSrc;
  }
  if (isDevelopment()) {
    return "https://va.vercel-scripts.com/v1/script.debug.js";
  }
  if (props.basePath) {
    return `${props.basePath}/insights/script.js`;
  }
  return "/_vercel/insights/script.js";
}
function inject(props = {
  debug: true
}) {
  var _a;
  if (!isBrowser()) return;
  setMode(props.mode);
  initQueue();
  if (props.beforeSend) {
    (_a = window.va) == null ? void 0 : _a.call(window, "beforeSend", props.beforeSend);
  }
  const src = getScriptSrc(props);
  if (document.head.querySelector(`script[src*="${src}"]`)) return;
  const script = document.createElement("script");
  script.src = src;
  script.defer = true;
  script.dataset.sdkn = name + (props.framework ? `/${props.framework}` : "");
  script.dataset.sdkv = version;
  if (props.disableAutoTrack) {
    script.dataset.disableAutoTrack = "1";
  }
  if (props.endpoint) {
    script.dataset.endpoint = props.endpoint;
  } else if (props.basePath) {
    script.dataset.endpoint = `${props.basePath}/insights`;
  }
  if (props.dsn) {
    script.dataset.dsn = props.dsn;
  }
  script.onerror = () => {
    const errorMessage = isDevelopment() ? "Please check if any ad blockers are enabled and try again." : "Be sure to enable Web Analytics for your project and deploy again. See https://vercel.com/docs/analytics/quickstart for more information.";
    console.log(
      `[Vercel Web Analytics] Failed to load script from ${src}. ${errorMessage}`
    );
  };
  if (isDevelopment() && props.debug === false) {
    script.dataset.debug = "false";
  }
  document.head.appendChild(script);
}
function pageview({
  route,
  path
}) {
  var _a;
  (_a = window.va) == null ? void 0 : _a.call(window, "pageview", { route, path });
}
function getBasePath() {
  if (typeof process === "undefined" || typeof define_process_env_default === "undefined") {
    return void 0;
  }
  return define_process_env_default.REACT_APP_VERCEL_OBSERVABILITY_BASEPATH;
}
function Analytics(props) {
  reactExports.useEffect(() => {
    var _a;
    if (props.beforeSend) {
      (_a = window.va) == null ? void 0 : _a.call(window, "beforeSend", props.beforeSend);
    }
  }, [props.beforeSend]);
  reactExports.useEffect(() => {
    inject({
      framework: props.framework || "react",
      basePath: props.basePath ?? getBasePath(),
      ...props.route !== void 0 && { disableAutoTrack: true },
      ...props
    });
  }, []);
  reactExports.useEffect(() => {
    if (props.route && props.path) {
      pageview({ route: props.route, path: props.path });
    }
  }, [props.route, props.path]);
  return null;
}
const SANS_SERIF_STICK = {
  type: "stroke",
  characters: {
    "A": [{ p1: { x: 0, y: 0 }, p2: { x: 2.5, y: 7 } }, { p1: { x: 2.5, y: 7 }, p2: { x: 5, y: 0 } }, { p1: { x: 1, y: 3.5 }, p2: { x: 4, y: 3.5 } }],
    "B": [{ p1: { x: 0, y: 0 }, p2: { x: 0, y: 7 } }, { p1: { x: 0, y: 7 }, p2: { x: 4, y: 5.25 } }, { p1: { x: 4, y: 5.25 }, p2: { x: 0, y: 3.5 } }, { p1: { x: 0, y: 3.5 }, p2: { x: 4, y: 1.75 } }, { p1: { x: 4, y: 1.75 }, p2: { x: 0, y: 0 } }],
    "C": [{ p1: { x: 5, y: 7 }, p2: { x: 1, y: 7 } }, { p1: { x: 1, y: 7 }, p2: { x: 0, y: 6 } }, { p1: { x: 0, y: 6 }, p2: { x: 0, y: 1 } }, { p1: { x: 0, y: 1 }, p2: { x: 1, y: 0 } }, { p1: { x: 1, y: 0 }, p2: { x: 5, y: 0 } }],
    "D": [{ p1: { x: 0, y: 0 }, p2: { x: 0, y: 7 } }, { p1: { x: 0, y: 7 }, p2: { x: 4, y: 3.5 } }, { p1: { x: 4, y: 3.5 }, p2: { x: 0, y: 0 } }],
    "E": [{ p1: { x: 0, y: 0 }, p2: { x: 0, y: 7 } }, { p1: { x: 0, y: 7 }, p2: { x: 5, y: 7 } }, { p1: { x: 0, y: 3.5 }, p2: { x: 4, y: 3.5 } }, { p1: { x: 0, y: 0 }, p2: { x: 5, y: 0 } }],
    "F": [{ p1: { x: 0, y: 0 }, p2: { x: 0, y: 7 } }, { p1: { x: 0, y: 7 }, p2: { x: 5, y: 7 } }, { p1: { x: 0, y: 3.5 }, p2: { x: 4, y: 3.5 } }],
    "G": [{ p1: { x: 5, y: 7 }, p2: { x: 1, y: 7 } }, { p1: { x: 1, y: 7 }, p2: { x: 0, y: 6 } }, { p1: { x: 0, y: 6 }, p2: { x: 0, y: 1 } }, { p1: { x: 0, y: 1 }, p2: { x: 1, y: 0 } }, { p1: { x: 1, y: 0 }, p2: { x: 5, y: 0 } }, { p1: { x: 5, y: 0 }, p2: { x: 5, y: 3.5 } }, { p1: { x: 5, y: 3.5 }, p2: { x: 2.5, y: 3.5 } }],
    "H": [{ p1: { x: 0, y: 0 }, p2: { x: 0, y: 7 } }, { p1: { x: 5, y: 0 }, p2: { x: 5, y: 7 } }, { p1: { x: 0, y: 3.5 }, p2: { x: 5, y: 3.5 } }],
    "I": [{ p1: { x: 2.5, y: 0 }, p2: { x: 2.5, y: 7 } }, { p1: { x: 0, y: 7 }, p2: { x: 5, y: 7 } }, { p1: { x: 0, y: 0 }, p2: { x: 5, y: 0 } }],
    "J": [{ p1: { x: 5, y: 7 }, p2: { x: 5, y: 1 } }, { p1: { x: 5, y: 1 }, p2: { x: 4, y: 0 } }, { p1: { x: 4, y: 0 }, p2: { x: 1, y: 0 } }, { p1: { x: 1, y: 0 }, p2: { x: 0, y: 1 } }],
    "K": [{ p1: { x: 0, y: 0 }, p2: { x: 0, y: 7 } }, { p1: { x: 5, y: 7 }, p2: { x: 0, y: 3.5 } }, { p1: { x: 0, y: 3.5 }, p2: { x: 5, y: 0 } }],
    "L": [{ p1: { x: 0, y: 7 }, p2: { x: 0, y: 0 } }, { p1: { x: 0, y: 0 }, p2: { x: 5, y: 0 } }],
    "M": [{ p1: { x: 0, y: 0 }, p2: { x: 0, y: 7 } }, { p1: { x: 0, y: 7 }, p2: { x: 2.5, y: 3.5 } }, { p1: { x: 2.5, y: 3.5 }, p2: { x: 5, y: 7 } }, { p1: { x: 5, y: 7 }, p2: { x: 5, y: 0 } }],
    "N": [{ p1: { x: 0, y: 0 }, p2: { x: 0, y: 7 } }, { p1: { x: 0, y: 7 }, p2: { x: 5, y: 0 } }, { p1: { x: 5, y: 0 }, p2: { x: 5, y: 7 } }],
    "O": [{ p1: { x: 0, y: 0 }, p2: { x: 0, y: 7 } }, { p1: { x: 0, y: 7 }, p2: { x: 5, y: 7 } }, { p1: { x: 5, y: 7 }, p2: { x: 5, y: 0 } }, { p1: { x: 5, y: 0 }, p2: { x: 0, y: 0 } }],
    "P": [{ p1: { x: 0, y: 0 }, p2: { x: 0, y: 7 } }, { p1: { x: 0, y: 7 }, p2: { x: 5, y: 5.25 } }, { p1: { x: 5, y: 5.25 }, p2: { x: 0, y: 3.5 } }],
    "Q": [{ p1: { x: 0, y: 0 }, p2: { x: 0, y: 7 } }, { p1: { x: 0, y: 7 }, p2: { x: 5, y: 7 } }, { p1: { x: 5, y: 7 }, p2: { x: 5, y: 1 } }, { p1: { x: 5, y: 1 }, p2: { x: 0, y: 0 } }, { p1: { x: 3, y: 2 }, p2: { x: 5, y: 0 } }],
    "R": [{ p1: { x: 0, y: 0 }, p2: { x: 0, y: 7 } }, { p1: { x: 0, y: 7 }, p2: { x: 5, y: 5.25 } }, { p1: { x: 5, y: 5.25 }, p2: { x: 0, y: 3.5 } }, { p1: { x: 0, y: 3.5 }, p2: { x: 5, y: 0 } }],
    "S": [{ p1: { x: 5, y: 7 }, p2: { x: 0, y: 7 } }, { p1: { x: 0, y: 7 }, p2: { x: 0, y: 3.5 } }, { p1: { x: 0, y: 3.5 }, p2: { x: 5, y: 3.5 } }, { p1: { x: 5, y: 3.5 }, p2: { x: 5, y: 0 } }, { p1: { x: 5, y: 0 }, p2: { x: 0, y: 0 } }],
    "T": [{ p1: { x: 2.5, y: 0 }, p2: { x: 2.5, y: 7 } }, { p1: { x: 0, y: 7 }, p2: { x: 5, y: 7 } }],
    "U": [{ p1: { x: 0, y: 7 }, p2: { x: 0, y: 1 } }, { p1: { x: 0, y: 1 }, p2: { x: 1, y: 0 } }, { p1: { x: 1, y: 0 }, p2: { x: 4, y: 0 } }, { p1: { x: 4, y: 0 }, p2: { x: 5, y: 1 } }, { p1: { x: 5, y: 1 }, p2: { x: 5, y: 7 } }],
    "V": [{ p1: { x: 0, y: 7 }, p2: { x: 2.5, y: 0 } }, { p1: { x: 2.5, y: 0 }, p2: { x: 5, y: 7 } }],
    "W": [{ p1: { x: 0, y: 7 }, p2: { x: 1.25, y: 0 } }, { p1: { x: 1.25, y: 0 }, p2: { x: 2.5, y: 3.5 } }, { p1: { x: 2.5, y: 3.5 }, p2: { x: 3.75, y: 0 } }, { p1: { x: 3.75, y: 0 }, p2: { x: 5, y: 7 } }],
    "X": [{ p1: { x: 0, y: 0 }, p2: { x: 5, y: 7 } }, { p1: { x: 0, y: 7 }, p2: { x: 5, y: 0 } }],
    "Y": [{ p1: { x: 0, y: 7 }, p2: { x: 2.5, y: 3.5 } }, { p1: { x: 5, y: 7 }, p2: { x: 2.5, y: 3.5 } }, { p1: { x: 2.5, y: 3.5 }, p2: { x: 2.5, y: 0 } }],
    "Z": [{ p1: { x: 0, y: 7 }, p2: { x: 5, y: 7 } }, { p1: { x: 5, y: 7 }, p2: { x: 0, y: 0 } }, { p1: { x: 0, y: 0 }, p2: { x: 5, y: 0 } }],
    "0": [{ p1: { x: 0, y: 0 }, p2: { x: 0, y: 7 } }, { p1: { x: 0, y: 7 }, p2: { x: 5, y: 7 } }, { p1: { x: 5, y: 7 }, p2: { x: 5, y: 0 } }, { p1: { x: 5, y: 0 }, p2: { x: 0, y: 0 } }, { p1: { x: 5, y: 7 }, p2: { x: 0, y: 0 } }],
    "1": [{ p1: { x: 2.5, y: 0 }, p2: { x: 2.5, y: 7 } }, { p1: { x: 1, y: 5.5 }, p2: { x: 2.5, y: 7 } }, { p1: { x: 1.5, y: 0 }, p2: { x: 3.5, y: 0 } }],
    "2": [{ p1: { x: 0, y: 7 }, p2: { x: 5, y: 7 } }, { p1: { x: 5, y: 7 }, p2: { x: 5, y: 3.5 } }, { p1: { x: 5, y: 3.5 }, p2: { x: 0, y: 0 } }, { p1: { x: 0, y: 0 }, p2: { x: 5, y: 0 } }],
    "3": [{ p1: { x: 0, y: 7 }, p2: { x: 5, y: 7 } }, { p1: { x: 5, y: 7 }, p2: { x: 2.5, y: 3.5 } }, { p1: { x: 5, y: 0 }, p2: { x: 0, y: 0 } }],
    "4": [{ p1: { x: 0, y: 7 }, p2: { x: 0, y: 3.5 } }, { p1: { x: 0, y: 3.5 }, p2: { x: 5, y: 3.5 } }, { p1: { x: 5, y: 7 }, p2: { x: 5, y: 0 } }],
    "5": [{ p1: { x: 5, y: 7 }, p2: { x: 0, y: 7 } }, { p1: { x: 0, y: 7 }, p2: { x: 0, y: 3.5 } }, { p1: { x: 0, y: 3.5 }, p2: { x: 5, y: 3.5 } }, { p1: { x: 5, y: 3.5 }, p2: { x: 5, y: 0 } }, { p1: { x: 5, y: 0 }, p2: { x: 0, y: 0 } }],
    "6": [{ p1: { x: 5, y: 7 }, p2: { x: 0, y: 7 } }, { p1: { x: 0, y: 7 }, p2: { x: 0, y: 0 } }, { p1: { x: 0, y: 0 }, p2: { x: 5, y: 0 } }, { p1: { x: 5, y: 0 }, p2: { x: 5, y: 3.5 } }, { p1: { x: 5, y: 3.5 }, p2: { x: 0, y: 3.5 } }],
    "7": [{ p1: { x: 0, y: 7 }, p2: { x: 5, y: 7 } }, { p1: { x: 5, y: 7 }, p2: { x: 2.5, y: 0 } }],
    "8": [{ p1: { x: 0, y: 0 }, p2: { x: 0, y: 7 } }, { p1: { x: 0, y: 7 }, p2: { x: 5, y: 7 } }, { p1: { x: 5, y: 7 }, p2: { x: 5, y: 0 } }, { p1: { x: 5, y: 0 }, p2: { x: 0, y: 0 } }, { p1: { x: 0, y: 3.5 }, p2: { x: 5, y: 3.5 } }],
    "9": [{ p1: { x: 0, y: 0 }, p2: { x: 5, y: 0 } }, { p1: { x: 5, y: 0 }, p2: { x: 5, y: 7 } }, { p1: { x: 5, y: 7 }, p2: { x: 0, y: 7 } }, { p1: { x: 0, y: 7 }, p2: { x: 0, y: 3.5 } }, { p1: { x: 0, y: 3.5 }, p2: { x: 5, y: 3.5 } }],
    " ": [],
    ".": [{ p1: { x: 2, y: 0 }, p2: { x: 3, y: 0 } }, { p1: { x: 3, y: 0 }, p2: { x: 3, y: 1 } }, { p1: { x: 3, y: 1 }, p2: { x: 2, y: 1 } }, { p1: { x: 2, y: 1 }, p2: { x: 2, y: 0 } }],
    "-": [{ p1: { x: 1, y: 3.5 }, p2: { x: 4, y: 3.5 } }]
  }
};
const BLOCK_OUTLINE = {
  type: "outline",
  characters: {
    "A": [[{ x: 2.5, y: 7 }, { x: 0, y: 0 }, { x: 5, y: 0 }], [{ x: 1.2, y: 3 }, { x: 3.8, y: 3 }, { x: 2.5, y: 5.5 }]],
    "B": [[{ x: 0, y: 0 }, { x: 0, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 6 }, { x: 4, y: 4.5 }, { x: 3, y: 3.5 }, { x: 4, y: 2.5 }, { x: 4, y: 1 }, { x: 3, y: 0 }], [{ x: 1, y: 1 }, { x: 1, y: 3 }, { x: 2.5, y: 3 }, { x: 2.5, y: 1 }], [{ x: 1, y: 4 }, { x: 1, y: 6 }, { x: 2.5, y: 6 }, { x: 2.5, y: 4 }]],
    "C": [[{ x: 5, y: 6 }, { x: 4, y: 7 }, { x: 1, y: 7 }, { x: 0, y: 6 }, { x: 0, y: 1 }, { x: 1, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 1 }], [{ x: 4, y: 2 }, { x: 1.5, y: 2 }, { x: 1.5, y: 5 }, { x: 4, y: 5 }]],
    "D": [[{ x: 0, y: 0 }, { x: 0, y: 7 }, { x: 3, y: 7 }, { x: 5, y: 5 }, { x: 5, y: 2 }, { x: 3, y: 0 }], [{ x: 1.5, y: 1.5 }, { x: 1.5, y: 5.5 }, { x: 2.5, y: 5.5 }, { x: 3.5, y: 4 }, { x: 3.5, y: 3 }, { x: 2.5, y: 1.5 }]],
    "E": [[{ x: 0, y: 0 }, { x: 0, y: 7 }, { x: 5, y: 7 }, { x: 5, y: 6 }, { x: 1, y: 6 }, { x: 1, y: 4.5 }, { x: 4, y: 4.5 }, { x: 4, y: 3.5 }, { x: 1, y: 3.5 }, { x: 1, y: 1 }, { x: 5, y: 1 }, { x: 5, y: 0 }]],
    "F": [[{ x: 0, y: 0 }, { x: 0, y: 7 }, { x: 5, y: 7 }, { x: 5, y: 6 }, { x: 1, y: 6 }, { x: 1, y: 4.5 }, { x: 4, y: 4.5 }, { x: 4, y: 3.5 }, { x: 1, y: 3.5 }, { x: 1, y: 0 }]],
    "G": [[{ x: 5, y: 6 }, { x: 4, y: 7 }, { x: 1, y: 7 }, { x: 0, y: 6 }, { x: 0, y: 1 }, { x: 1, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 1 }, { x: 5, y: 3 }, { x: 3, y: 3 }], [{ x: 1.5, y: 2 }, { x: 3.5, y: 2 }, { x: 3.5, y: 4 }, { x: 4, y: 4 }, { x: 4, y: 5 }, { x: 1.5, y: 5 }]],
    "H": [[{ x: 0, y: 0 }, { x: 0, y: 7 }, { x: 1, y: 7 }, { x: 1, y: 4.5 }, { x: 4, y: 4.5 }, { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 5, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 3.5 }, { x: 1, y: 3.5 }, { x: 1, y: 0 }]],
    "I": [[{ x: 2, y: 0 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 3, y: 0 }]],
    "J": [[{ x: 5, y: 7 }, { x: 4, y: 7 }, { x: 4, y: 2 }, { x: 3, y: 0 }, { x: 2, y: 0 }, { x: 1, y: 2 }, { x: 1, y: 7 }, { x: 0, y: 7 }, { x: 0, y: 2.5 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4.8, y: 2.5 }, { x: 5, y: 7 }]],
    "K": [[{ x: 0, y: 0 }, { x: 0, y: 7 }, { x: 1, y: 7 }, { x: 1, y: 4 }, { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 2, y: 3.5 }, { x: 5, y: 0 }, { x: 4, y: 0 }, { x: 1, y: 3 }, { x: 1, y: 0 }]],
    "L": [[{ x: 0, y: 7 }, { x: 0, y: 0 }, { x: 5, y: 0 }, { x: 5, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 7 }]],
    "M": [[{ x: 0, y: 0 }, { x: 0, y: 7 }, { x: 1, y: 7 }, { x: 2.5, y: 4 }, { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 5, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 6 }, { x: 2.5, y: 2 }, { x: 1, y: 6 }, { x: 1, y: 0 }]],
    "N": [[{ x: 0, y: 0 }, { x: 0, y: 7 }, { x: 1, y: 7 }, { x: 4, y: 1 }, { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 5, y: 0 }, { x: 4, y: 0 }, { x: 1, y: 6 }, { x: 1, y: 0 }]],
    "O": [[{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 6 }, { x: 1, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 6 }, { x: 5, y: 1 }, { x: 4, y: 0 }], [{ x: 2, y: 1.5 }, { x: 1.5, y: 2 }, { x: 1.5, y: 5 }, { x: 2, y: 5.5 }, { x: 3, y: 5.5 }, { x: 3.5, y: 5 }, { x: 3.5, y: 2 }, { x: 3, y: 1.5 }]],
    "P": [[{ x: 0, y: 0 }, { x: 0, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 6 }, { x: 5, y: 5 }, { x: 4, y: 4 }, { x: 1, y: 4 }, { x: 1, y: 0 }], [{ x: 2, y: 5 }, { x: 3.5, y: 5 }, { x: 3.5, y: 6 }, { x: 2, y: 6 }]],
    "Q": [[{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 6 }, { x: 1, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 6 }, { x: 5, y: 1 }, { x: 4, y: 0 }], [{ x: 2, y: 1.5 }, { x: 1.5, y: 2 }, { x: 1.5, y: 5 }, { x: 2, y: 5.5 }, { x: 3, y: 5.5 }, { x: 3.5, y: 5 }, { x: 3.5, y: 2 }, { x: 3, y: 1.5 }], [{ x: 2.5, y: 2.5 }, { x: 4.5, y: 0.5 }, { x: 5, y: 1.5 }, { x: 3, y: 3 }]],
    "R": [[{ x: 0, y: 0 }, { x: 0, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 6 }, { x: 5, y: 5 }, { x: 4, y: 4 }, { x: 1, y: 4 }, { x: 5, y: 0 }, { x: 4, y: 0 }, { x: 1, y: 3 }, { x: 1, y: 0 }], [{ x: 2, y: 5 }, { x: 3.5, y: 5 }, { x: 3.5, y: 6 }, { x: 2, y: 6 }]],
    "S": [[{ x: 5, y: 6 }, { x: 4, y: 7 }, { x: 1, y: 7 }, { x: 0, y: 6 }, { x: 0, y: 4 }, { x: 1, y: 3 }, { x: 4, y: 3 }, { x: 5, y: 4 }, { x: 5, y: 1 }, { x: 4, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 4, y: 2 }, { x: 4, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 5 }, { x: 4, y: 5 }, { x: 4, y: 6 }]],
    "T": [[{ x: 0, y: 7 }, { x: 5, y: 7 }, { x: 5, y: 6 }, { x: 3, y: 6 }, { x: 3, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 6 }, { x: 0, y: 6 }]],
    "U": [[{ x: 0, y: 7 }, { x: 1, y: 7 }, { x: 1, y: 2 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 2 }, { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 5, y: 1 }, { x: 4, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }]],
    "V": [[{ x: 0, y: 7 }, { x: 1, y: 7 }, { x: 2.5, y: 1 }, { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 2.5, y: 0 }]],
    "W": [[{ x: 0, y: 7 }, { x: 1, y: 7 }, { x: 1.5, y: 1 }, { x: 2.5, y: 5 }, { x: 3.5, y: 1 }, { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 4, y: 0 }, { x: 3, y: 0 }, { x: 2.5, y: 4 }, { x: 2, y: 0 }, { x: 1, y: 0 }]],
    "X": [[{ x: 0, y: 7 }, { x: 1, y: 7 }, { x: 2.5, y: 4 }, { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 3, y: 3.5 }, { x: 5, y: 0 }, { x: 4, y: 0 }, { x: 2.5, y: 3 }, { x: 1, y: 0 }, { x: 0, y: 0 }, { x: 2, y: 3.5 }]],
    "Y": [[{ x: 0, y: 7 }, { x: 1, y: 7 }, { x: 2.5, y: 4 }, { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 2.5, y: 3 }, { x: 2.5, y: 0 }, { x: 1.5, y: 0 }, { x: 1.5, y: 3 }]],
    "Z": [[{ x: 0, y: 7 }, { x: 5, y: 7 }, { x: 5, y: 6 }, { x: 1.5, y: 1 }, { x: 5, y: 1 }, { x: 5, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 1 }, { x: 3.5, y: 6 }, { x: 0, y: 6 }]],
    "0": [[{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 6 }, { x: 1, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 6 }, { x: 5, y: 1 }, { x: 4, y: 0 }], [{ x: 2, y: 1.5 }, { x: 1.5, y: 2 }, { x: 1.5, y: 5 }, { x: 2, y: 5.5 }, { x: 3, y: 5.5 }, { x: 3.5, y: 5 }, { x: 3.5, y: 2 }, { x: 3, y: 1.5 }], [{ x: 4, y: 6 }, { x: 1, y: 1 }]],
    "1": [[{ x: 2, y: 0 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 3, y: 0 }], [{ x: 1, y: 5 }, { x: 2, y: 6 }, { x: 2, y: 5 }]],
    "2": [[{ x: 0, y: 6 }, { x: 1, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 6 }, { x: 5, y: 5 }, { x: 0, y: 0 }, { x: 5, y: 0 }, { x: 5, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 4, y: 2 }, { x: 4, y: 4 }, { x: 1, y: 4 }, { x: 1, y: 6 }]],
    "3": [[{ x: 0, y: 7 }, { x: 5, y: 7 }, { x: 5, y: 6 }, { x: 2, y: 4 }, { x: 5, y: 1 }, { x: 5, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 1 }, { x: 3, y: 3 }, { x: 0, y: 6 }], [{ x: 1, y: 1 }, { x: 4, y: 1 }, { x: 4, y: 2 }, { x: 1, y: 2 }], [{ x: 1, y: 5 }, { x: 4, y: 5 }, { x: 4, y: 6 }, { x: 1, y: 6 }]],
    "4": [[{ x: 1, y: 7 }, { x: 0, y: 7 }, { x: 0, y: 4 }, { x: 5, y: 4 }, { x: 5, y: 3 }, { x: 1, y: 3 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 3 }, { x: 4, y: 3 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 5, y: 7 }, { x: 4, y: 7 }, { x: 4, y: 5 }, { x: 1, y: 5 }]],
    "5": [[{ x: 5, y: 7 }, { x: 0, y: 7 }, { x: 0, y: 6 }, { x: 4, y: 6 }, { x: 4, y: 4 }, { x: 1, y: 4 }, { x: 1, y: 3 }, { x: 4, y: 3 }, { x: 5, y: 2 }, { x: 5, y: 1 }, { x: 4, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }]],
    "6": [[{ x: 4, y: 7 }, { x: 1, y: 7 }, { x: 0, y: 6 }, { x: 0, y: 1 }, { x: 1, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 1 }, { x: 5, y: 3 }, { x: 4, y: 4 }, { x: 1, y: 4 }, { x: 1, y: 5 }, { x: 4, y: 5 }], [{ x: 2, y: 1.5 }, { x: 3.5, y: 1.5 }, { x: 3.5, y: 2.5 }, { x: 2, y: 2.5 }]],
    "7": [[{ x: 0, y: 7 }, { x: 5, y: 7 }, { x: 5, y: 6 }, { x: 2, y: 0 }, { x: 1, y: 0 }, { x: 4, y: 6 }, { x: 0, y: 6 }]],
    "8": [[{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 6 }, { x: 1, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 6 }, { x: 5, y: 1 }, { x: 4, y: 0 }], [{ x: 1.5, y: 1.5 }, { x: 3.5, y: 1.5 }, { x: 3.5, y: 2.5 }, { x: 1.5, y: 2.5 }], [{ x: 1.5, y: 4.5 }, { x: 3.5, y: 4.5 }, { x: 3.5, y: 5.5 }, { x: 1.5, y: 5.5 }]],
    "9": [[{ x: 1, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 1 }, { x: 5, y: 6 }, { x: 4, y: 7 }, { x: 1, y: 7 }, { x: 0, y: 6 }, { x: 0, y: 4 }, { x: 1, y: 3 }, { x: 4, y: 3 }, { x: 4, y: 2 }, { x: 1, y: 2 }], [{ x: 2.5, y: 5.5 }, { x: 3.5, y: 5.5 }, { x: 3.5, y: 4.5 }, { x: 2.5, y: 4.5 }]],
    " ": [],
    ".": [[{ x: 2, y: 0 }, { x: 3, y: 0 }, { x: 3, y: 1 }, { x: 2, y: 1 }]],
    "-": [[{ x: 1, y: 3 }, { x: 4, y: 3 }, { x: 4, y: 4 }, { x: 1, y: 4 }]]
  }
};
const SCRIPT = {
  type: "stroke",
  characters: {
    "A": [{ p1: { x: 0, y: 0 }, p2: { x: 2.5, y: 7 } }, { p1: { x: 2.5, y: 7 }, p2: { x: 5, y: 0 } }, { p1: { x: 1, y: 3.5 }, p2: { x: 5.5, y: 2.5 } }],
    "B": [{ p1: { x: 0, y: 0 }, p2: { x: 0, y: 7 } }, { p1: { x: 0, y: 7 }, p2: { x: 3.5, y: 6 } }, { p1: { x: 3.5, y: 6 }, p2: { x: 0.5, y: 3.5 } }, { p1: { x: 0.5, y: 3.5 }, p2: { x: 4, y: 2 } }, { p1: { x: 4, y: 2 }, p2: { x: 0, y: 0 } }],
    "C": [{ p1: { x: 4.5, y: 6 }, p2: { x: 4, y: 7 } }, { p1: { x: 4, y: 7 }, p2: { x: 1, y: 7 } }, { p1: { x: 1, y: 7 }, p2: { x: 0, y: 6 } }, { p1: { x: 0, y: 6 }, p2: { x: 0, y: 1 } }, { p1: { x: 0, y: 1 }, p2: { x: 1, y: 0 } }, { p1: { x: 1, y: 0 }, p2: { x: 4, y: 0 } }, { p1: { x: 4, y: 0 }, p2: { x: 4.5, y: 1 } }],
    "D": [{ p1: { x: 0, y: 0 }, p2: { x: 0, y: 7 } }, { p1: { x: 0, y: 7 }, p2: { x: 4, y: 5 } }, { p1: { x: 4, y: 5 }, p2: { x: 4, y: 2 } }, { p1: { x: 4, y: 2 }, p2: { x: 0, y: 0 } }],
    "E": [{ p1: { x: 5, y: 3.5 }, p2: { x: 0, y: 3.5 } }, { p1: { x: 0, y: 3.5 }, p2: { x: 1, y: 7 } }, { p1: { x: 1, y: 7 }, p2: { x: 5, y: 7 } }, { p1: { x: 0, y: 3.5 }, p2: { x: 1, y: 0 } }, { p1: { x: 1, y: 0 }, p2: { x: 5, y: 0 } }],
    "F": [{ p1: { x: 0, y: 0 }, p2: { x: 0, y: 6 } }, { p1: { x: 0, y: 6 }, p2: { x: 1, y: 7 } }, { p1: { x: 1, y: 7 }, p2: { x: 5, y: 7 } }, { p1: { x: 0, y: 3.5 }, p2: { x: 4, y: 3.5 } }],
    "G": [{ p1: { x: 4.5, y: 6 }, p2: { x: 4, y: 7 } }, { p1: { x: 4, y: 7 }, p2: { x: 1, y: 7 } }, { p1: { x: 1, y: 7 }, p2: { x: 0, y: 6 } }, { p1: { x: 0, y: 6 }, p2: { x: 0, y: 1 } }, { p1: { x: 0, y: 1 }, p2: { x: 1, y: 0 } }, { p1: { x: 1, y: 0 }, p2: { x: 4, y: 0 } }, { p1: { x: 4, y: 0 }, p2: { x: 5, y: 1 } }, { p1: { x: 5, y: 1 }, p2: { x: 5, y: 3.5 } }, { p1: { x: 5, y: 3.5 }, p2: { x: 2.5, y: 3.5 } }],
    "H": [{ p1: { x: 0, y: 0 }, p2: { x: 0, y: 7 } }, { p1: { x: 5, y: 0 }, p2: { x: 5, y: 7 } }, { p1: { x: 0, y: 3.5 }, p2: { x: 2, y: 3.5 } }, { p1: { x: 2, y: 3.5 }, p2: { x: 3, y: 2 } }, { p1: { x: 3, y: 2 }, p2: { x: 5, y: 3.5 } }],
    "I": [{ p1: { x: 2.5, y: 0 }, p2: { x: 2.5, y: 7 } }, { p1: { x: 1, y: 7 }, p2: { x: 4, y: 7 } }, { p1: { x: 1, y: 0 }, p2: { x: 4, y: 0 } }],
    "J": [{ p1: { x: 5, y: 7 }, p2: { x: 5, y: 2 } }, { p1: { x: 5, y: 2 }, p2: { x: 4, y: 0 } }, { p1: { x: 4, y: 0 }, p2: { x: 1, y: 0 } }, { p1: { x: 1, y: 0 }, p2: { x: 0, y: 2 } }],
    "K": [{ p1: { x: 0, y: 0 }, p2: { x: 0, y: 7 } }, { p1: { x: 4.5, y: 7 }, p2: { x: 1, y: 4 } }, { p1: { x: 1, y: 4 }, p2: { x: 5, y: 0 } }],
    "L": [{ p1: { x: 0, y: 7 }, p2: { x: 0, y: 1 } }, { p1: { x: 0, y: 1 }, p2: { x: 1, y: 0 } }, { p1: { x: 1, y: 0 }, p2: { x: 5, y: 0 } }],
    "M": [{ p1: { x: 0, y: 0 }, p2: { x: 0, y: 7 } }, { p1: { x: 0, y: 7 }, p2: { x: 2.5, y: 2 } }, { p1: { x: 2.5, y: 2 }, p2: { x: 5, y: 7 } }, { p1: { x: 5, y: 7 }, p2: { x: 5, y: 0 } }],
    "N": [{ p1: { x: 0, y: 0 }, p2: { x: 0, y: 7 } }, { p1: { x: 0, y: 7 }, p2: { x: 5, y: 0 } }, { p1: { x: 5, y: 0 }, p2: { x: 5, y: 7 } }],
    "O": [{ p1: { x: 1, y: 0 }, p2: { x: 0, y: 1 } }, { p1: { x: 0, y: 1 }, p2: { x: 0, y: 6 } }, { p1: { x: 0, y: 6 }, p2: { x: 1, y: 7 } }, { p1: { x: 1, y: 7 }, p2: { x: 4, y: 7 } }, { p1: { x: 4, y: 7 }, p2: { x: 5, y: 6 } }, { p1: { x: 5, y: 6 }, p2: { x: 5, y: 1 } }, { p1: { x: 5, y: 1 }, p2: { x: 4, y: 0 } }, { p1: { x: 4, y: 0 }, p2: { x: 1, y: 0 } }],
    "P": [{ p1: { x: 0, y: 0 }, p2: { x: 0, y: 7 } }, { p1: { x: 0, y: 7 }, p2: { x: 4, y: 6 } }, { p1: { x: 4, y: 6 }, p2: { x: 4, y: 4.5 } }, { p1: { x: 4, y: 4.5 }, p2: { x: 0, y: 3.5 } }],
    "Q": [{ p1: { x: 1, y: 0 }, p2: { x: 0, y: 1 } }, { p1: { x: 0, y: 1 }, p2: { x: 0, y: 6 } }, { p1: { x: 0, y: 6 }, p2: { x: 1, y: 7 } }, { p1: { x: 1, y: 7 }, p2: { x: 4, y: 7 } }, { p1: { x: 4, y: 7 }, p2: { x: 5, y: 6 } }, { p1: { x: 5, y: 6 }, p2: { x: 5, y: 1 } }, { p1: { x: 5, y: 1 }, p2: { x: 4, y: 0 } }, { p1: { x: 4, y: 0 }, p2: { x: 1, y: 0 } }, { p1: { x: 3, y: 2 }, p2: { x: 5.5, y: 0 } }],
    "R": [{ p1: { x: 0, y: 0 }, p2: { x: 0, y: 7 } }, { p1: { x: 0, y: 7 }, p2: { x: 4, y: 6 } }, { p1: { x: 4, y: 6 }, p2: { x: 4, y: 4.5 } }, { p1: { x: 4, y: 4.5 }, p2: { x: 0, y: 3.5 } }, { p1: { x: 2, y: 3.5 }, p2: { x: 5, y: 0 } }],
    "S": [{ p1: { x: 4.5, y: 6 }, p2: { x: 4, y: 7 } }, { p1: { x: 4, y: 7 }, p2: { x: 1, y: 7 } }, { p1: { x: 1, y: 7 }, p2: { x: 0, y: 6 } }, { p1: { x: 0, y: 6 }, p2: { x: 0.5, y: 3.5 } }, { p1: { x: 0.5, y: 3.5 }, p2: { x: 4.5, y: 3.5 } }, { p1: { x: 4.5, y: 3.5 }, p2: { x: 5, y: 1 } }, { p1: { x: 5, y: 1 }, p2: { x: 4, y: 0 } }, { p1: { x: 4, y: 0 }, p2: { x: 1, y: 0 } }, { p1: { x: 1, y: 0 }, p2: { x: 0.5, y: 1 } }],
    "T": [{ p1: { x: 2.5, y: 0 }, p2: { x: 2.5, y: 7 } }, { p1: { x: 0, y: 7 }, p2: { x: 5, y: 7 } }],
    "U": [{ p1: { x: 0, y: 7 }, p2: { x: 0, y: 1 } }, { p1: { x: 0, y: 1 }, p2: { x: 1, y: 0 } }, { p1: { x: 1, y: 0 }, p2: { x: 4, y: 0 } }, { p1: { x: 4, y: 0 }, p2: { x: 5, y: 1 } }, { p1: { x: 5, y: 1 }, p2: { x: 5, y: 7 } }],
    "V": [{ p1: { x: 0, y: 7 }, p2: { x: 2.5, y: 0 } }, { p1: { x: 2.5, y: 0 }, p2: { x: 5, y: 7 } }],
    "W": [{ p1: { x: 0, y: 7 }, p2: { x: 1.5, y: 0 } }, { p1: { x: 1.5, y: 0 }, p2: { x: 2.5, y: 7 } }, { p1: { x: 2.5, y: 7 }, p2: { x: 3.5, y: 0 } }, { p1: { x: 3.5, y: 0 }, p2: { x: 5, y: 7 } }],
    "X": [{ p1: { x: 0, y: 0 }, p2: { x: 5, y: 7 } }, { p1: { x: 0, y: 7 }, p2: { x: 5, y: 0 } }],
    "Y": [{ p1: { x: 0, y: 7 }, p2: { x: 2.5, y: 3 } }, { p1: { x: 5, y: 7 }, p2: { x: 2.5, y: 3 } }, { p1: { x: 2.5, y: 3 }, p2: { x: 2.5, y: 0 } }],
    "Z": [{ p1: { x: 0, y: 7 }, p2: { x: 5, y: 7 } }, { p1: { x: 5, y: 7 }, p2: { x: 0, y: 0 } }, { p1: { x: 0, y: 0 }, p2: { x: 5, y: 0 } }],
    "0": [{ p1: { x: 1, y: 0 }, p2: { x: 0, y: 1 } }, { p1: { x: 0, y: 1 }, p2: { x: 0, y: 6 } }, { p1: { x: 0, y: 6 }, p2: { x: 1, y: 7 } }, { p1: { x: 1, y: 7 }, p2: { x: 4, y: 7 } }, { p1: { x: 4, y: 7 }, p2: { x: 5, y: 6 } }, { p1: { x: 5, y: 6 }, p2: { x: 5, y: 1 } }, { p1: { x: 5, y: 1 }, p2: { x: 4, y: 0 } }, { p1: { x: 4, y: 0 }, p2: { x: 1, y: 0 } }, { p1: { x: 5, y: 6 }, p2: { x: 0, y: 1 } }],
    "1": [{ p1: { x: 1, y: 5 }, p2: { x: 2.5, y: 7 } }, { p1: { x: 2.5, y: 7 }, p2: { x: 2.5, y: 0 } }],
    "2": [{ p1: { x: 0, y: 6 }, p2: { x: 1, y: 7 } }, { p1: { x: 1, y: 7 }, p2: { x: 4, y: 7 } }, { p1: { x: 4, y: 7 }, p2: { x: 5, y: 6 } }, { p1: { x: 5, y: 6 }, p2: { x: 0, y: 0 } }, { p1: { x: 0, y: 0 }, p2: { x: 5, y: 0 } }],
    "3": [{ p1: { x: 0, y: 6 }, p2: { x: 1, y: 7 } }, { p1: { x: 1, y: 7 }, p2: { x: 4, y: 7 } }, { p1: { x: 4, y: 7 }, p2: { x: 2, y: 3.5 } }, { p1: { x: 2, y: 3.5 }, p2: { x: 5, y: 1 } }, { p1: { x: 5, y: 1 }, p2: { x: 4, y: 0 } }, { p1: { x: 4, y: 0 }, p2: { x: 1, y: 0 } }, { p1: { x: 1, y: 0 }, p2: { x: 0, y: 1 } }],
    "4": [{ p1: { x: 1, y: 7 }, p2: { x: 0, y: 4 } }, { p1: { x: 0, y: 4 }, p2: { x: 5, y: 4 } }, { p1: { x: 4, y: 7 }, p2: { x: 4, y: 0 } }],
    "5": [{ p1: { x: 5, y: 7 }, p2: { x: 1, y: 7 } }, { p1: { x: 1, y: 7 }, p2: { x: 1, y: 3.5 } }, { p1: { x: 1, y: 3.5 }, p2: { x: 4, y: 2.5 } }, { p1: { x: 4, y: 2.5 }, p2: { x: 4, y: 1 } }, { p1: { x: 4, y: 1 }, p2: { x: 1, y: 0 } }],
    "6": [{ p1: { x: 4, y: 7 }, p2: { x: 1, y: 7 } }, { p1: { x: 1, y: 7 }, p2: { x: 0, y: 6 } }, { p1: { x: 0, y: 6 }, p2: { x: 0, y: 1 } }, { p1: { x: 0, y: 1 }, p2: { x: 1, y: 0 } }, { p1: { x: 1, y: 0 }, p2: { x: 4, y: 0 } }, { p1: { x: 4, y: 0 }, p2: { x: 5, y: 1 } }, { p1: { x: 5, y: 1 }, p2: { x: 4, y: 2.5 } }, { p1: { x: 4, y: 2.5 }, p2: { x: 0, y: 2.5 } }],
    "7": [{ p1: { x: 0, y: 7 }, p2: { x: 5, y: 7 } }, { p1: { x: 5, y: 7 }, p2: { x: 2, y: 0 } }],
    "8": [{ p1: { x: 1, y: 7 }, p2: { x: 0, y: 6 } }, { p1: { x: 0, y: 6 }, p2: { x: 0, y: 4.5 } }, { p1: { x: 0, y: 4.5 }, p2: { x: 1, y: 3.5 } }, { p1: { x: 1, y: 3.5 }, p2: { x: 4, y: 3.5 } }, { p1: { x: 4, y: 3.5 }, p2: { x: 5, y: 2.5 } }, { p1: { x: 5, y: 2.5 }, p2: { x: 5, y: 1 } }, { p1: { x: 5, y: 1 }, p2: { x: 4, y: 0 } }, { p1: { x: 4, y: 0 }, p2: { x: 1, y: 0 } }, { p1: { x: 1, y: 0 }, p2: { x: 0, y: 1 } }, { p1: { x: 0, y: 1 }, p2: { x: 0, y: 2.5 } }, { p1: { x: 0, y: 2.5 }, p2: { x: 1, y: 3.5 } }, { p1: { x: 4, y: 3.5 }, p2: { x: 5, y: 4.5 } }, { p1: { x: 5, y: 4.5 }, p2: { x: 5, y: 6 } }, { p1: { x: 5, y: 6 }, p2: { x: 4, y: 7 } }, { p1: { x: 4, y: 7 }, p2: { x: 1, y: 7 } }],
    "9": [{ p1: { x: 1, y: 0 }, p2: { x: 4, y: 0 } }, { p1: { x: 4, y: 0 }, p2: { x: 5, y: 1 } }, { p1: { x: 5, y: 1 }, p2: { x: 5, y: 6 } }, { p1: { x: 5, y: 6 }, p2: { x: 4, y: 7 } }, { p1: { x: 4, y: 7 }, p2: { x: 1, y: 7 } }, { p1: { x: 1, y: 7 }, p2: { x: 0, y: 6 } }, { p1: { x: 0, y: 6 }, p2: { x: 1, y: 4.5 } }, { p1: { x: 1, y: 4.5 }, p2: { x: 5, y: 4.5 } }],
    " ": [],
    ".": [{ p1: { x: 2.5, y: 0 }, p2: { x: 2.5, y: 1 } }],
    "-": [{ p1: { x: 1, y: 3.5 }, p2: { x: 4, y: 3.5 } }]
  }
};
const FONTS = {
  "Sans-serif Stick": SANS_SERIF_STICK,
  "Block Outline": BLOCK_OUTLINE,
  "Script": SCRIPT
};
const RadioGroup = ({ label, options, selected, onChange }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2", children: [
  label && /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-text-secondary mb-1", children: label }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex bg-secondary rounded-md p-1", children: options.map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      onClick: () => onChange(opt.value),
      className: `w-full p-1 rounded-md text-sm font-semibold transition-colors ${selected === opt.value ? "bg-primary text-white" : "hover:bg-secondary-focus"}`,
      children: opt.label
    },
    opt.value
  )) })
] });
const Input = ({ label, value, valueX, valueY, onChange, onChangeX, onChangeY, unit, help, isXY = false }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-text-secondary mb-1", children: label }),
  isXY ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", value: valueX, onChange: onChangeX, className: "w-full bg-background border-secondary rounded-md py-1 px-2 focus:outline-none focus:ring-1 focus:ring-primary" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", value: valueY, onChange: onChangeY, className: "w-full bg-background border-secondary rounded-md py-1 px-2 focus:outline-none focus:ring-1 focus:ring-primary" })
  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", value, onChange, className: "w-full bg-background border-secondary rounded-md py-1 px-2 focus:outline-none focus:ring-1 focus:ring-primary" }),
    unit && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute right-2 top-1/2 -translate-y-1/2 text-xs text-text-secondary", children: unit })
  ] }),
  help && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-text-secondary mt-1", children: help })
] });
const Checkbox = ({ label, checked, onChange }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 cursor-pointer font-semibold text-text-primary", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(
    "input",
    {
      type: "checkbox",
      checked,
      onChange: (e) => onChange(e.target.checked),
      className: "h-4 w-4 rounded border-secondary text-primary focus:ring-primary"
    }
  ),
  label
] });
const ToolSelector = ({ selectedId, onChange, colSpan = "col-span-full", unit, toolLibrary }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: colSpan, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-text-secondary mb-1", children: "Tool" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "select",
    {
      value: selectedId || "",
      onChange: (e) => onChange(e.target.value ? parseInt(e.target.value, 10) : null),
      className: "w-full bg-background border-secondary rounded-md py-1 px-2 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50",
      disabled: !toolLibrary || toolLibrary.length === 0,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: toolLibrary && toolLibrary.length > 0 ? "Select a tool..." : "No tools in library" }),
        toolLibrary && toolLibrary.map((tool) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: tool.id, children: `${tool.name} (Ø ${tool.diameter}${unit})` }, tool.id))
      ]
    }
  ),
  (!toolLibrary || toolLibrary.length === 0) && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-text-secondary mt-1", children: "Add tools in the Tool Library to enable generation." })
] });
const SpindleAndFeedControls = ({ params, onParamChange, feedLabel = "Feed Rate", plunge, plungeLabel = "Plunge Rate", unit }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("hr", { className: "border-secondary" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: feedLabel, value: params.feed, onChange: (e) => onParamChange("feed", e.target.value), unit: unit + "/min" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Spindle Speed", value: params.spindle, onChange: (e) => onParamChange("spindle", e.target.value), unit: "RPM" })
  ] }),
  plunge && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: plungeLabel, value: params.plungeFeed, onChange: (e) => onParamChange("plungeFeed", e.target.value), unit: unit + "/min" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Safe Z", value: params.safeZ, onChange: (e) => onParamChange("safeZ", e.target.value), unit, help: "Rapid height above stock" })
] });
const SlotGenerator = ({ params, onParamsChange, toolLibrary, unit, settings }) => {
  const handleParamChange = (field, value) => {
    onParamsChange(field, value);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(ToolSelector, { selectedId: params.toolId, onChange: (id) => handleParamChange("toolId", id), unit, toolLibrary }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("hr", { className: "border-secondary" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(RadioGroup, { options: [{ value: "straight", label: "Straight" }, { value: "arc", label: "Arc" }], selected: params.type, onChange: (val) => handleParamChange("type", val) }),
    params.type === "straight" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Start X", value: params.startX, onChange: (e) => handleParamChange("startX", e.target.value), unit }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Start Y", value: params.startY, onChange: (e) => handleParamChange("startY", e.target.value), unit })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "End X", value: params.endX, onChange: (e) => handleParamChange("endX", e.target.value), unit }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "End Y", value: params.endY, onChange: (e) => handleParamChange("endY", e.target.value), unit })
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Center X", value: params.centerX, onChange: (e) => handleParamChange("centerX", e.target.value), unit }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Center Y", value: params.centerY, onChange: (e) => handleParamChange("centerY", e.target.value), unit })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Radius", value: params.radius, onChange: (e) => handleParamChange("radius", e.target.value), unit }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Start Angle", value: params.startAngle, onChange: (e) => handleParamChange("startAngle", e.target.value), unit: "°" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "End Angle", value: params.endAngle, onChange: (e) => handleParamChange("endAngle", e.target.value), unit: "°" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("hr", { className: "border-secondary" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Slot Width", value: params.slotWidth, onChange: (e) => handleParamChange("slotWidth", e.target.value), unit }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Total Depth", value: params.depth, onChange: (e) => handleParamChange("depth", e.target.value), unit, help: "Should be negative" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Depth per Pass", value: params.depthPerPass, onChange: (e) => handleParamChange("depthPerPass", e.target.value), unit })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SpindleAndFeedControls, { params, onParamChange: handleParamChange, unit })
  ] });
};
const SurfacingGenerator = ({ params, onParamsChange, toolLibrary, unit, settings }) => {
  const handleParamChange = (field, value) => {
    onParamsChange(field, value);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(ToolSelector, { selectedId: params.toolId, onChange: (id) => handleParamChange("toolId", id), unit, toolLibrary }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("hr", { className: "border-secondary" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: `Width (X)`, value: params.width, onChange: (e) => handleParamChange("width", e.target.value), unit }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: `Length (Y)`, value: params.length, onChange: (e) => handleParamChange("length", e.target.value), unit })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(RadioGroup, { label: "Milling Direction", options: [{ value: "horizontal", label: "Horizontal (X)" }, { value: "vertical", label: "Vertical (Y)" }], selected: params.direction, onChange: (val) => handleParamChange("direction", val) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Final Depth", value: params.depth, onChange: (e) => handleParamChange("depth", e.target.value), unit, help: "Should be negative" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Stepover", value: params.stepover, onChange: (e) => handleParamChange("stepover", e.target.value), unit: "%" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SpindleAndFeedControls, { params, onParamChange: (field, value) => handleParamChange(field, value), unit })
  ] });
};
const DrillingGenerator = ({ params, onParamsChange, toolLibrary, unit, settings }) => {
  const handleParamChange = (field, value) => {
    onParamsChange(field, value);
  };
  const handleTypeChange = (newType) => {
    onParamsChange("drillType", newType);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(ToolSelector, { selectedId: params.toolId, onChange: (id) => handleParamChange("toolId", id), unit, toolLibrary }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("hr", { className: "border-secondary" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      RadioGroup,
      {
        selected: params.drillType,
        onChange: handleTypeChange,
        options: [
          { value: "single", label: "Single Hole" },
          { value: "rect", label: "Rectangular Pattern" },
          { value: "circ", label: "Circular Pattern" }
        ]
      }
    ),
    params.drillType === "single" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "X Coordinate", value: params.singleX, onChange: (e) => handleParamChange("singleX", e.target.value), unit }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Y Coordinate", value: params.singleY, onChange: (e) => handleParamChange("singleY", e.target.value), unit })
    ] }),
    params.drillType === "rect" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Start X", value: params.rectStartX, onChange: (e) => handleParamChange("rectStartX", e.target.value), unit }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Start Y", value: params.rectStartY, onChange: (e) => handleParamChange("rectStartY", e.target.value), unit }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Columns", value: params.rectCols, onChange: (e) => handleParamChange("rectCols", e.target.value) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Rows", value: params.rectRows, onChange: (e) => handleParamChange("rectRows", e.target.value) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Spacing (X)", value: params.rectSpacingX, onChange: (e) => handleParamChange("rectSpacingX", e.target.value), unit }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Spacing (Y)", value: params.rectSpacingY, onChange: (e) => handleParamChange("rectSpacingY", e.target.value), unit })
    ] }),
    params.drillType === "circ" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Center X", value: params.circCenterX, onChange: (e) => handleParamChange("circCenterX", e.target.value), unit }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Center Y", value: params.circCenterY, onChange: (e) => handleParamChange("circCenterY", e.target.value), unit }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Radius", value: params.circRadius, onChange: (e) => handleParamChange("circRadius", e.target.value), unit }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Number of Holes", value: params.circHoles, onChange: (e) => handleParamChange("circHoles", e.target.value) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Start Angle", value: params.circStartAngle, onChange: (e) => handleParamChange("circStartAngle", e.target.value), unit: "°" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("hr", { className: "border-secondary" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Final Depth", value: params.depth, onChange: (e) => handleParamChange("depth", e.target.value), unit, help: "Should be negative" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Peck Depth", value: params.peck, onChange: (e) => handleParamChange("peck", e.target.value), unit, help: "Incremental depth per peck" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Retract Height", value: params.retract, onChange: (e) => handleParamChange("retract", e.target.value), unit, help: "Height to retract to between pecks" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SpindleAndFeedControls, { params, onParamChange: (field, value) => handleParamChange(field, value), unit })
  ] });
};
const BoreGenerator = ({ params, onParamsChange, toolLibrary, unit, settings }) => {
  const handleParamChange = (field, value) => {
    onParamsChange(field, value);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(ToolSelector, { selectedId: params.toolId, onChange: (id) => handleParamChange("toolId", id), unit, toolLibrary }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("hr", { className: "border-secondary" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Center X", value: params.centerX, onChange: (e) => handleParamChange("centerX", e.target.value), unit }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Center Y", value: params.centerY, onChange: (e) => handleParamChange("centerY", e.target.value), unit }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Hole Diameter", value: params.holeDiameter, onChange: (e) => handleParamChange("holeDiameter", e.target.value), unit }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Hole Depth", value: params.holeDepth, onChange: (e) => handleParamChange("holeDepth", e.target.value), unit, help: "Should be negative" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("hr", { className: "border-secondary" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { label: "Enable Counterbore", checked: params.counterboreEnabled, onChange: (checked) => handleParamChange("counterboreEnabled", checked) }),
    params.counterboreEnabled && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 pl-4 mt-2 border-l-2 border-secondary", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "CB Diameter", value: params.cbDiameter, onChange: (e) => handleParamChange("cbDiameter", e.target.value), unit }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "CB Depth", value: params.cbDepth, onChange: (e) => handleParamChange("cbDepth", e.target.value), unit, help: "Should be negative" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("hr", { className: "border-secondary" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Depth per Pass", value: params.depthPerPass, onChange: (e) => handleParamChange("depthPerPass", e.target.value), unit }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      SpindleAndFeedControls,
      {
        params,
        onParamChange: handleParamChange,
        unit,
        includePlungeFeed: true
      }
    )
  ] });
};
const ProfileGenerator = ({ params, onParamsChange, toolLibrary, unit, settings }) => {
  const handleParamChange = (field, value) => {
    onParamsChange(field, value);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(ToolSelector, { selectedId: params.toolId, onChange: (id) => handleParamChange("toolId", id), unit, toolLibrary }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("hr", { className: "border-secondary" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(RadioGroup, { options: [{ value: "rect", label: "Rectangle" }, { value: "circ", label: "Circle" }], selected: params.shape, onChange: (val) => handleParamChange("shape", val) }),
    params.shape === "rect" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Width (X)", value: params.width, onChange: (e) => handleParamChange("width", e.target.value), unit }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Length (Y)", value: params.length, onChange: (e) => handleParamChange("length", e.target.value), unit })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Corner Radius", value: params.cornerRadius, onChange: (e) => handleParamChange("cornerRadius", e.target.value), unit })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Diameter", value: params.diameter, onChange: (e) => handleParamChange("diameter", e.target.value), unit }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("hr", { className: "border-secondary" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(RadioGroup, { label: "Cut Side", options: [{ value: "outside", label: "Outside" }, { value: "inside", label: "Inside" }, { value: "online", label: "On-line" }], selected: params.cutSide, onChange: (val) => handleParamChange("cutSide", val) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Total Depth", value: params.depth, onChange: (e) => handleParamChange("depth", e.target.value), unit, help: "Should be negative" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Depth per Pass", value: params.depthPerPass, onChange: (e) => handleParamChange("depthPerPass", e.target.value), unit })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("hr", { className: "border-secondary" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { label: "Enable Tabs", checked: params.tabsEnabled, onChange: (checked) => handleParamChange("tabsEnabled", checked) }),
    params.tabsEnabled && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-4 pl-4 mt-2 border-l-2 border-secondary", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Number", value: params.numTabs, onChange: (e) => handleParamChange("numTabs", e.target.value) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Width", value: params.tabWidth, onChange: (e) => handleParamChange("tabWidth", e.target.value), unit }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Height", value: params.tabHeight, onChange: (e) => handleParamChange("tabHeight", e.target.value), unit })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SpindleAndFeedControls, { params, onParamChange: handleParamChange, unit })
  ] });
};
const PocketGenerator = ({ params, onParamsChange, toolLibrary, unit, settings }) => {
  const handleParamChange = (field, value) => {
    onParamsChange(field, value);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(ToolSelector, { selectedId: params.toolId, onChange: (id) => handleParamChange("toolId", id), unit, toolLibrary }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("hr", { className: "border-secondary" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(RadioGroup, { options: [{ value: "rect", label: "Rectangle" }, { value: "circ", label: "Circle" }], selected: params.shape, onChange: (val) => handleParamChange("shape", val) }),
    params.shape === "rect" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Width (X)", value: params.width, onChange: (e) => handleParamChange("width", e.target.value), unit }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Length (Y)", value: params.length, onChange: (e) => handleParamChange("length", e.target.value), unit })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Corner Radius", value: params.cornerRadius, onChange: (e) => handleParamChange("cornerRadius", e.target.value), unit })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Diameter", value: params.diameter, onChange: (e) => handleParamChange("diameter", e.target.value), unit }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("hr", { className: "border-secondary" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Total Depth", value: params.depth, onChange: (e) => handleParamChange("depth", e.target.value), unit, help: "Should be negative" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Depth per Pass", value: params.depthPerPass, onChange: (e) => handleParamChange("depthPerPass", e.target.value), unit })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Stepover", value: params.stepover, onChange: (e) => handleParamChange("stepover", e.target.value), unit: "%" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      SpindleAndFeedControls,
      {
        params,
        onParamChange: handleParamChange,
        unit,
        includePlungeFeed: true
      }
    )
  ] });
};
const ThreadMillingGenerator = ({ params, onParamsChange, toolLibrary, unit, settings }) => {
  const handleParamChange = (field, value) => {
    onParamsChange(field, value);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(ToolSelector, { selectedId: params.toolId, onChange: (id) => handleParamChange("toolId", id), unit, toolLibrary }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("hr", { className: "border-secondary" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(RadioGroup, { label: "Type", options: [{ value: "internal", label: "Internal" }, { value: "external", label: "External" }], selected: params.type, onChange: (val) => handleParamChange("type", val) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(RadioGroup, { label: "Hand", options: [{ value: "right", label: "Right-Hand" }, { value: "left", label: "Left-Hand" }], selected: params.hand, onChange: (val) => handleParamChange("hand", val) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("hr", { className: "border-secondary" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Thread Diameter", value: params.diameter, onChange: (e) => handleParamChange("diameter", e.target.value), unit, help: "Major diameter" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Pitch", value: params.pitch, onChange: (e) => handleParamChange("pitch", e.target.value), unit, help: "Distance between threads" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Thread Depth", value: params.depth, onChange: (e) => handleParamChange("depth", e.target.value), unit, help: "Length of thread" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SpindleAndFeedControls, { params, onParamChange: handleParamChange, unit })
  ] });
};
const TextGenerator = ({ params, onParamsChange, toolLibrary, unit, settings, fontOptions }) => {
  const handleParamChange = (field, value) => {
    onParamsChange(field, value);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(ToolSelector, { selectedId: params.toolId, onChange: (id) => handleParamChange("toolId", id), unit, toolLibrary }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("hr", { className: "border-secondary" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-text-secondary mb-1", children: "Text" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "textarea",
        {
          value: params.text,
          onChange: (e) => handleParamChange("text", e.target.value),
          className: "w-full bg-background border-secondary rounded-md py-1 px-2 focus:outline-none focus:ring-1 focus:ring-primary",
          rows: 3
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-text-secondary mb-1", children: "Font" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: params.font, onChange: (e) => handleParamChange("font", e.target.value), className: "w-full bg-background border-secondary rounded-md py-1.5 px-2 focus:outline-none focus:ring-1 focus:ring-primary", children: fontOptions.map((font) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: font, children: font }, font)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Height", value: params.height, onChange: (e) => handleParamChange("height", e.target.value), unit }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Character Spacing", value: params.spacing, onChange: (e) => handleParamChange("spacing", e.target.value), unit }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Start X", value: params.startX, onChange: (e) => handleParamChange("startX", e.target.value), unit }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Start Y", value: params.startY, onChange: (e) => handleParamChange("startY", e.target.value), unit })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(RadioGroup, { label: "Alignment", options: [{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }], selected: params.alignment, onChange: (val) => handleParamChange("alignment", val) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Engraving Depth", value: params.depth, onChange: (e) => handleParamChange("depth", e.target.value), unit, help: "Should be negative" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SpindleAndFeedControls, { params, onParamChange: handleParamChange, unit })
  ] });
};
const Tab = ({ label, isActive, onClick }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "button",
  {
    onClick,
    className: `px-4 py-2 text-sm font-semibold -mb-px border-b-2 ${isActive ? "border-primary text-primary" : "border-transparent text-text-secondary hover:text-text-primary"}`,
    children: label
  }
);
const Preview = ({ paths, viewBox }) => {
  const [vbMinX, vbMinY, vbWidth, vbHeight] = viewBox.split(" ").map(parseFloat);
  const gridElements = [];
  const labelElements = [];
  const majorDim = Math.max(vbWidth, vbHeight);
  const magnitudes = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1e3];
  const targetLines = 8;
  const roughSpacing = majorDim / targetLines;
  const spacing = magnitudes.find((m) => m > roughSpacing) || magnitudes[magnitudes.length - 1];
  const gridLineStyle = { stroke: "var(--color-secondary-focus)", opacity: 0.5, strokeWidth: "0.5%", vectorEffect: "non-scaling-stroke" };
  const axisLineStyle = { stroke: "var(--color-text-secondary)", opacity: 0.5, strokeWidth: "1%", vectorEffect: "non-scaling-stroke" };
  const labelStyle = { fontSize: "4%", fill: "var(--color-text-secondary)", opacity: 0.6, vectorEffect: "non-scaling-stroke" };
  if (spacing > 0 && isFinite(vbMinX) && isFinite(vbWidth)) {
    const startX = Math.floor(vbMinX / spacing) * spacing;
    for (let x = startX; x <= vbMinX + vbWidth; x += spacing) {
      gridElements.push(/* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: x, y1: vbMinY, x2: x, y2: vbMinY + vbHeight, style: gridLineStyle }, `v-${x}`));
      labelElements.push(
        /* @__PURE__ */ jsxRuntimeExports.jsx("text", { x, y: vbMinY, transform: "scale(1, -1)", style: { ...labelStyle, textAnchor: "middle", dominantBaseline: "hanging" }, children: x.toFixed(0) }, `lx-${x}`)
      );
    }
  }
  if (spacing > 0 && isFinite(vbMinY) && isFinite(vbHeight)) {
    const startY = Math.floor(vbMinY / spacing) * spacing;
    for (let y = startY; y <= vbMinY + vbHeight; y += spacing) {
      gridElements.push(/* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: vbMinX, y1: y, x2: vbMinX + vbWidth, y2: y, style: gridLineStyle }, `h-${y}`));
      const yFlipped = -y;
      labelElements.push(
        /* @__PURE__ */ jsxRuntimeExports.jsx("text", { x: vbMinX, y, transform: "scale(1, -1)", style: { ...labelStyle, textAnchor: "start", dominantBaseline: "middle" }, children: yFlipped.toFixed(0) }, `ly-${y}`)
      );
    }
  }
  if (0 >= vbMinX && 0 <= vbMinX + vbWidth) {
    gridElements.push(/* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: 0, y1: vbMinY, x2: 0, y2: vbMinY + vbHeight, style: axisLineStyle }, "axis-y"));
  }
  if (0 >= vbMinY && 0 <= vbMinY + vbHeight) {
    gridElements.push(/* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: vbMinX, y1: 0, x2: vbMinX + vbWidth, y2: 0, style: axisLineStyle }, "axis-x"));
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-square w-full bg-secondary rounded", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { viewBox, className: "w-full h-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { transform: "scale(1, -1)", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("g", { children: gridElements }, "grid-group"),
      /* @__PURE__ */ jsxRuntimeExports.jsx("g", { children: paths.map((p, i) => {
        if (p.d) {
          return /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: p.d, stroke: p.stroke, fill: p.fill || "none", strokeWidth: p.strokeWidth || "2%", strokeDasharray: p.strokeDasharray, style: { vectorEffect: "non-scaling-stroke" } }, i);
        }
        if (p.cx !== void 0) {
          return /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: p.cx, cy: p.cy, r: p.r, fill: p.fill || "none", stroke: p.stroke, strokeWidth: p.strokeWidth || "2%", strokeDasharray: p.strokeDasharray, style: { vectorEffect: "non-scaling-stroke" } }, i);
        }
        return null;
      }) }, "path-group")
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("g", { children: labelElements }, "label-group")
  ] }) });
};
const GCodeGeneratorModal = ({ isOpen, onClose, onLoadGCode, unit, settings, toolLibrary, selectedToolId, onToolSelect, generatorSettings, onSettingsChange }) => {
  const [activeTab, setActiveTab] = reactExports.useState("surfacing");
  const [generatedGCode, setGeneratedGCode] = reactExports.useState("");
  const [previewPaths, setPreviewPaths] = reactExports.useState({ paths: [], bounds: { minX: 0, maxX: 100, minY: 0, maxY: 100 } });
  const [viewBox, setViewBox] = reactExports.useState("0 0 100 100");
  const [generationError, setGenerationError] = reactExports.useState(null);
  const [arraySettings, setArraySettings] = reactExports.useState({
    isEnabled: false,
    pattern: "rect",
    rectCols: 3,
    rectRows: 2,
    rectSpacingX: 15,
    rectSpacingY: 15,
    circCopies: 6,
    circRadius: 40,
    circCenterX: 50,
    circCenterY: 50,
    circStartAngle: 0
  });
  const calculateViewBox = reactExports.useCallback((bounds) => {
    if (!bounds || bounds.minX === Infinity) return "0 -100 100 100";
    const { minX = 0, minY = 0, maxX = 100, maxY = 100 } = bounds;
    const width = Math.abs(maxX - minX) || 100;
    const height = Math.abs(maxY - minY) || 100;
    const padding = Math.max(width, height) * 0.15;
    const vbMinX = minX - padding;
    const vbWidth = width + padding * 2;
    const vbMinY = -(maxY + padding);
    const vbHeight = height + padding * 2;
    return `${vbMinX} ${vbMinY} ${vbWidth} ${vbHeight}`;
  }, [previewPaths.bounds?.minX, previewPaths.bounds?.minY, previewPaths.bounds?.maxX, previewPaths.bounds?.maxY]);
  const fitView = reactExports.useCallback(() => {
    setViewBox(calculateViewBox(previewPaths.bounds));
  }, [previewPaths.bounds, calculateViewBox]);
  reactExports.useEffect(() => {
    if (previewPaths.bounds && previewPaths.bounds.minX !== Infinity)
      fitView();
  }, [fitView]);
  const generateDrillingCode = () => {
    const drillParams = generatorSettings.drilling;
    const toolIndex = toolLibrary.findIndex((t) => t.id === drillParams.toolId);
    if (toolIndex === -1) return { error: "Please select a tool.", code: [], paths: [], bounds: {} };
    const selectedTool = toolLibrary[toolIndex];
    if (!selectedTool) return { error: "Please select a tool.", code: [], paths: [], bounds: {} };
    const { depth, peck, retract, feed, spindle, safeZ } = drillParams;
    if ([depth, peck, feed, spindle, safeZ].some((p) => p === "" || p === null || isNaN(Number(p)))) {
      return { error: "Please fill all required fields.", code: [], paths: [], bounds: {} };
    }
    const code = [
      `(--- Drilling Operation: ${drillParams.drillType} ---)`,
      `(Tool: ${selectedTool.name} - Ø${selectedTool.diameter}${unit})`,
      `G21 G90`,
      `M3 S${spindle}`
    ];
    const paths = [];
    const bounds = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
    const updateBounds = (x, y) => {
      bounds.minX = Math.min(bounds.minX, x);
      bounds.maxX = Math.max(bounds.maxX, x);
      bounds.minY = Math.min(bounds.minY, y);
      bounds.maxY = Math.max(bounds.maxY, y);
    };
    const points = [];
    if (drillParams.drillType === "single") {
      points.push({ x: drillParams.singleX, y: drillParams.singleY });
    } else if (drillParams.drillType === "rect") {
      const { rectCols, rectRows, rectSpacingX, rectSpacingY, rectStartX, rectStartY } = drillParams;
      for (let row = 0; row < rectRows; row++) {
        for (let col = 0; col < rectCols; col++) {
          points.push({
            x: rectStartX + col * rectSpacingX,
            y: rectStartY + row * rectSpacingY
          });
        }
      }
    } else {
      const { circHoles, circRadius, circCenterX, circCenterY, circStartAngle } = drillParams;
      const angleStep = circHoles > 0 ? 360 / circHoles : 0;
      for (let i = 0; i < circHoles; i++) {
        const angle = (circStartAngle + i * angleStep) * (Math.PI / 180);
        points.push({
          x: circCenterX + circRadius * Math.cos(angle),
          y: circCenterY + circRadius * Math.sin(angle)
        });
      }
    }
    code.push(`G0 Z${safeZ.toFixed(3)}`);
    code.push(`G83 Z${depth.toFixed(3)} Q${peck.toFixed(3)} R${retract.toFixed(3)} F${feed.toFixed(3)}`);
    points.forEach((p) => {
      code.push(`X${p.x.toFixed(3)} Y${p.y.toFixed(3)}`);
      paths.push({ cx: p.x, cy: p.y, r: selectedTool.diameter / 2, stroke: "var(--color-accent-yellow)", fill: "var(--color-accent-yellow-transparent)" });
      updateBounds(p.x, p.y);
    });
    code.push("G80");
    code.push(`G0 Z${safeZ.toFixed(3)}`);
    code.push("M5");
    return { code, paths, bounds, error: null };
  };
  const generateProfileCode = () => {
    const profileParams = generatorSettings.profile;
    const toolIndex = toolLibrary.findIndex((t) => t.id === profileParams.toolId);
    if (toolIndex === -1) return { error: "Please select a tool.", code: [], paths: [], bounds: {} };
    const selectedTool = toolLibrary[toolIndex];
    if (!selectedTool) return { error: "Please select a tool.", code: [], paths: [], bounds: {} };
    const toolDiameter = selectedTool.diameter;
    const { shape, width, length, cornerRadius, diameter, depth, depthPerPass, cutSide, tabsEnabled, numTabs, tabWidth, tabHeight, feed, spindle, safeZ } = profileParams;
    const code = [
      `(Tool: ${selectedTool.name} - Ø${toolDiameter}${unit})`,
      // `T${toolIndex + 1} M6`, // Tool change disabled for non-ATC setups
      `G21 G90`,
      `M3 S${spindle}`
    ];
    const paths = [];
    const toolRadius = toolDiameter / 2;
    let offset = 0;
    if (cutSide === "outside") offset = toolRadius;
    if (cutSide === "inside") offset = -toolRadius;
    const bounds = shape === "rect" ? { minX: -offset, minY: -offset, maxX: width + offset, maxY: length + offset } : { minX: -diameter / 2 - offset, minY: -diameter / 2 - offset, maxX: diameter / 2 + offset, maxY: diameter / 2 + offset };
    if (shape === "rect") {
      paths.push({ d: `M 0 ${cornerRadius} L 0 ${length - cornerRadius} A ${cornerRadius} ${cornerRadius} 0 0 1 ${cornerRadius} ${length} L ${width - cornerRadius} ${length} A ${cornerRadius} ${cornerRadius} 0 0 1 ${width} ${length - cornerRadius} L ${width} ${cornerRadius} A ${cornerRadius} ${cornerRadius} 0 0 1 ${width - cornerRadius} 0 L ${cornerRadius} 0 A ${cornerRadius} ${cornerRadius} 0 0 1 0 ${cornerRadius}`, stroke: "var(--color-text-secondary)", strokeDasharray: "4 2", strokeWidth: "0.5%" });
    } else {
      paths.push({ cx: diameter / 2, cy: diameter / 2, r: diameter / 2, stroke: "var(--color-text-secondary)", fill: "none", strokeDasharray: "4 2", strokeWidth: "0.5%" });
    }
    const numericDepth = Number(depth);
    const numericDepthPerPass = Number(depthPerPass);
    let currentDepth = 0;
    while (currentDepth > numericDepth) {
      currentDepth = Math.max(numericDepth, currentDepth - numericDepthPerPass);
      if (shape === "rect") {
        const r = Math.max(0, cornerRadius - offset);
        const w = width + offset * 2;
        const l = length + offset * 2;
        const p1 = { x: -offset + r, y: -offset };
        const p2 = { x: w - r, y: -offset };
        const p3 = { x: w, y: -offset + r };
        const p4 = { x: w, y: l - r };
        const p5 = { x: w - r, y: l };
        const p6 = { x: -offset + r, y: l };
        const p7 = { x: -offset, y: l - r };
        const p8 = { x: -offset, y: -offset + r };
        code.push(`G0 X${p2.x.toFixed(3)} Y${p2.y.toFixed(3)} Z${safeZ}`);
        code.push(`G1 Z${currentDepth.toFixed(3)} F${feed / 2}`);
        code.push(`G1 X${p1.x.toFixed(3)} F${feed}`);
        if (r > 0) code.push(`G2 X${(-offset).toFixed(3)} Y${p8.y.toFixed(3)} I0 J${r.toFixed(3)}`);
        code.push(`G1 Y${p7.y.toFixed(3)}`);
        if (r > 0) code.push(`G2 X${p6.x.toFixed(3)} Y${l.toFixed(3)} I${r.toFixed(3)} J0`);
        code.push(`G1 X${p5.x.toFixed(3)}`);
        if (r > 0) code.push(`G2 X${w.toFixed(3)} Y${p4.y.toFixed(3)} I0 J${-r.toFixed(3)}`);
        code.push(`G1 Y${p3.y.toFixed(3)}`);
        if (r > 0) code.push(`G2 X${p2.x.toFixed(3)} Y${(-offset).toFixed(3)} I${-r.toFixed(3)} J0`);
        paths.push({ d: `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} A ${r} ${r} 0 0 0 ${p3.x} ${p3.y} L ${p4.x} ${p4.y} A ${r} ${r} 0 0 0 ${p5.x} ${p5.y} L ${p6.x} ${p6.y} A ${r} ${r} 0 0 0 ${p7.x} ${p7.y} L ${p8.x} ${p8.y} A ${r} ${r} 0 0 0 ${p1.x} ${p1.y}`, stroke: "var(--color-accent-yellow)", fill: "none", strokeWidth: "2%" });
      } else {
        const radius = diameter / 2 + offset;
        const centerX = diameter / 2;
        const centerY = diameter / 2;
        code.push(`G0 X${(centerX + radius).toFixed(3)} Y${centerY.toFixed(3)} Z${safeZ}`);
        code.push(`G1 Z${currentDepth.toFixed(3)} F${feed / 2}`);
        code.push(`G2 I${-radius.toFixed(3)} J0 F${Number(feed)}`);
        paths.push({ cx: centerX, cy: centerY, r: radius, stroke: "var(--color-accent-yellow)", fill: "none", strokeWidth: "2%" });
      }
    }
    code.push(`G0 Z${safeZ}`, `M5`);
    return { code, paths, bounds, error: null };
  };
  const generateSurfacingCode = () => {
    const surfaceParams = generatorSettings.surfacing;
    const toolIndex = toolLibrary.findIndex((t) => t.id === surfaceParams.toolId);
    if (toolIndex === -1) return { error: "Please select a tool.", code: [], paths: [], bounds: {} };
    const selectedTool = toolLibrary[toolIndex];
    if (!selectedTool) return { error: "Please select a tool.", code: [], paths: [], bounds: {} };
    const { width, length, depth, stepover, feed, spindle, safeZ, direction } = surfaceParams;
    if ([width, length, depth, stepover, feed, spindle, safeZ].some((p) => p === "" || p === null || isNaN(Number(p)))) {
      return { error: "Please fill all required fields.", code: [], paths: [], bounds: {} };
    }
    const code = [
      `(--- Surfacing Operation ---)`,
      `(Tool: ${selectedTool.name} - Ø${selectedTool.diameter}${unit})`,
      `G21 G90`,
      `M3 S${spindle}`
    ];
    const paths = [];
    const toolRadius = selectedTool.diameter / 2;
    const stepoverDist = selectedTool.diameter * (stepover / 100);
    code.push(`G0 Z${safeZ.toFixed(3)}`);
    if (direction === "horizontal") {
      let y = toolRadius;
      let xDirection = 1;
      while (y <= length + toolRadius) {
        const startX = xDirection === 1 ? -toolRadius : width + toolRadius;
        const endX = xDirection === 1 ? width + toolRadius : -toolRadius;
        code.push(`G0 X${startX.toFixed(3)} Y${y.toFixed(3)}`);
        code.push(`G1 Z${depth.toFixed(3)} F${feed / 2}`);
        code.push(`G1 X${endX.toFixed(3)} F${feed}`);
        code.push(`G0 Z${safeZ.toFixed(3)}`);
        paths.push({ d: `M ${startX} ${y} L ${endX} ${y}`, stroke: "var(--color-accent-yellow)" });
        y += stepoverDist;
        xDirection *= -1;
      }
    } else {
      let x = toolRadius;
      let yDirection = 1;
      while (x <= width + toolRadius) {
        const startY = yDirection === 1 ? -toolRadius : length + toolRadius;
        const endY = yDirection === 1 ? length + toolRadius : -toolRadius;
        code.push(`G0 X${x.toFixed(3)} Y${startY.toFixed(3)}`);
        code.push(`G1 Z${depth.toFixed(3)} F${feed / 2}`);
        code.push(`G1 Y${endY.toFixed(3)} F${feed}`);
        code.push(`G0 Z${safeZ.toFixed(3)}`);
        paths.push({ d: `M ${x.toFixed(3)} ${startY.toFixed(3)} L ${x.toFixed(3)} ${endY.toFixed(3)}`, stroke: "var(--color-accent-yellow)" });
        x += stepoverDist;
        yDirection *= -1;
      }
    }
    code.push(`M5`);
    const bounds = { minX: 0, minY: 0, maxX: width, maxY: length };
    return { code, paths, bounds, error: null };
  };
  const generatePocketCode = () => {
    const pocketParams = generatorSettings.pocket;
    const toolIndex = toolLibrary.findIndex((t) => t.id === pocketParams.toolId);
    if (toolIndex === -1) return { error: "Please select a tool.", code: [], paths: [], bounds: {} };
    const selectedTool = toolLibrary[toolIndex];
    if (!selectedTool) return { error: "Please select a tool.", code: [], paths: [], bounds: {} };
    const { shape, width, length, cornerRadius, diameter, depth, depthPerPass, stepover, feed, plungeFeed, spindle, safeZ } = pocketParams;
    if ([depth, depthPerPass, stepover, feed, plungeFeed, spindle, safeZ].some((p) => p === "" || p === null || isNaN(Number(p)))) {
      return { error: "Please fill all required fields.", code: [], paths: [], bounds: {} };
    }
    const code = [
      `(--- Pocket Operation: ${shape} ---)`,
      `(Tool: ${selectedTool.name} - Ø${selectedTool.diameter}${unit})`,
      `G21 G90`,
      `M3 S${spindle}`,
      `G0 Z${safeZ}`
    ];
    const paths = [];
    const toolRadius = selectedTool.diameter / 2;
    const stepoverDist = selectedTool.diameter * (stepover / 100);
    const numericDepth = Number(depth);
    const numericPlungeFeed = Number(plungeFeed);
    let currentDepth = 0;
    while (currentDepth > numericDepth) {
      currentDepth = Math.max(numericDepth, currentDepth - Number(depthPerPass));
      code.push(`(--- Pass at Z=${currentDepth.toFixed(3)} ---)`);
      if (shape === "rect") {
        const centerX = width / 2;
        const centerY = length / 2;
        code.push(`G0 X${centerX.toFixed(3)} Y${centerY.toFixed(3)}`);
        code.push(`G1 Z${currentDepth.toFixed(3)} F${numericPlungeFeed}`);
        let y = toolRadius;
        while (y <= length - toolRadius) {
          code.push(`G1 X${(width - toolRadius).toFixed(3)} Y${y.toFixed(3)} F${feed}`);
          paths.push({ d: `M${toolRadius} ${y} L${width - toolRadius} ${y}`, stroke: "var(--color-accent-yellow)" });
          y += stepoverDist;
          if (y <= length - toolRadius) {
            code.push(`G1 X${toolRadius.toFixed(3)} Y${y.toFixed(3)} F${feed}`);
            paths.push({ d: `M${width - toolRadius} ${y - stepoverDist} L${width - toolRadius} ${y}`, stroke: "var(--color-text-secondary)" });
          }
        }
      } else {
        const centerX = diameter / 2;
        const centerY = diameter / 2;
        code.push(`G0 X${centerX.toFixed(3)} Y${centerY.toFixed(3)}`);
        code.push(`G1 Z${currentDepth.toFixed(3)} F${numericPlungeFeed}`);
      }
    }
    code.push(`G0 Z${safeZ}`, `M5`, `G0 X0 Y0`);
    const bounds = shape === "rect" ? { minX: 0, minY: 0, maxX: width, maxY: length } : { minX: 0, minY: 0, maxX: diameter, maxY: diameter };
    return { code, paths, bounds, error: null };
  };
  const generateBoreCode = () => {
    const boreParams = generatorSettings.bore;
    const toolIndex = toolLibrary.findIndex((t) => t.id === boreParams.toolId);
    if (toolIndex === -1) return { error: "Please select a tool.", code: [], paths: [], bounds: {} };
    const selectedTool = toolLibrary[toolIndex];
    if (!selectedTool) return { error: "Please select a tool.", code: [], paths: [], bounds: {} };
    const { centerX, centerY, holeDiameter, holeDepth, counterboreEnabled, cbDiameter, cbDepth, depthPerPass, feed, plungeFeed, spindle, safeZ } = boreParams;
    if (holeDiameter <= selectedTool.diameter) {
      return { error: "Tool must be smaller than hole diameter.", code: [], paths: [], bounds: {} };
    }
    if (counterboreEnabled && cbDiameter <= selectedTool.diameter) {
      return { error: "Tool must be smaller than counterbore diameter.", code: [], paths: [], bounds: {} };
    }
    if (counterboreEnabled && cbDiameter <= holeDiameter) {
      return { error: "Counterbore must be larger than hole diameter.", code: [], paths: [], bounds: {} };
    }
    const code = [
      `(--- Bore Operation ---)`,
      `(Tool: ${selectedTool.name} - Ø${selectedTool.diameter}${unit})`,
      `G21 G90`,
      `M3 S${spindle}`
    ];
    const paths = [];
    const bounds = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
    const updateBounds = (x, y, r) => {
      bounds.minX = Math.min(bounds.minX, x - r);
      bounds.maxX = Math.max(bounds.maxX, x + r);
      bounds.minY = Math.min(bounds.minY, y - r);
      bounds.maxY = Math.max(bounds.maxY, y + r);
    };
    const doHelicalBore = (targetDiameter, targetDepth, startZ = 0) => {
      const pathRadius = (targetDiameter - selectedTool.diameter) / 2;
      if (pathRadius <= 0) return;
      code.push(`(Boring to Ø${targetDiameter} at Z=${targetDepth})`);
      paths.push({ cx: centerX, cy: centerY, r: targetDiameter / 2, stroke: "var(--color-text-secondary)", strokeDasharray: "4 2", strokeWidth: "0.5%" });
      updateBounds(centerX, centerY, targetDiameter / 2);
      const numericPlungeFeed = Number(plungeFeed);
      const numericDepthPerPass = Number(depthPerPass);
      code.push(`G0 X${centerX.toFixed(3)} Y${centerY.toFixed(3)} Z${safeZ.toFixed(3)}`);
      code.push(`G1 Z${startZ.toFixed(3)} F${numericPlungeFeed}`);
      let currentDepth = startZ;
      while (currentDepth > targetDepth) {
        currentDepth = Math.max(targetDepth, currentDepth - numericDepthPerPass);
        code.push(`G2 X${(centerX + pathRadius).toFixed(3)} Y${centerY.toFixed(3)} I${pathRadius / 2} J0 Z${currentDepth.toFixed(3)} F${feed}`);
        code.push(`G2 I${-pathRadius.toFixed(3)} J0`);
        code.push(`G2 X${centerX.toFixed(3)} Y${centerY.toFixed(3)} I${-pathRadius / 2} J0`);
        if (currentDepth === Math.max(targetDepth, startZ - numericDepthPerPass)) {
          paths.push({ cx: centerX, cy: centerY, r: pathRadius, stroke: "var(--color-accent-yellow)" });
        }
      }
    };
    if (counterboreEnabled) {
      const numericCbDepth = Number(cbDepth);
      const numericHoleDepth = Number(holeDepth);
      if (numericCbDepth > numericHoleDepth) {
        doHelicalBore(cbDiameter, cbDepth);
        doHelicalBore(holeDiameter, holeDepth, cbDepth);
      } else {
        doHelicalBore(holeDiameter, holeDepth);
        doHelicalBore(cbDiameter, cbDepth);
      }
    } else {
      doHelicalBore(holeDiameter, holeDepth);
    }
    code.push(`G0 Z${safeZ.toFixed(3)}`);
    code.push(`M5`);
    code.push(`G0 X0 Y0`);
    return { code, paths, bounds, error: null };
  };
  const generateSlotCode = () => {
    const slotParams = generatorSettings.slot;
    const toolIndex = toolLibrary.findIndex((t) => t.id === slotParams.toolId);
    if (toolIndex === -1) return { error: "Please select a tool.", code: [], paths: [], bounds: {} };
    const selectedTool = toolLibrary[toolIndex];
    if (!selectedTool) return { error: "Please select a tool.", code: [], paths: [], bounds: {} };
    const toolDiameter = selectedTool.diameter;
    const { type, slotWidth, depth, depthPerPass, feed, spindle, safeZ, startX, startY, endX, endY, centerX, centerY, radius, startAngle, endAngle } = slotParams;
    const paramsToCheck = [slotWidth, depth, depthPerPass, feed, spindle, safeZ];
    if (paramsToCheck.some((p) => p === "" || p === null)) return { error: "Please fill all required fields.", code: [], paths: [], bounds: {} };
    const code = [
      `(--- Slot Operation: ${type} ---)`,
      `(Tool: ${selectedTool.name} - Ø${toolDiameter}${unit})`,
      // `T${toolIndex + 1} M6`, // Tool change disabled for non-ATC setups
      `G21 G90`,
      `M3 S${spindle}`
    ];
    const paths = [];
    let bounds = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
    const updateBounds = (x, y) => {
      bounds.minX = Math.min(bounds.minX, x);
      bounds.maxX = Math.max(bounds.maxX, x);
      bounds.minY = Math.min(bounds.minY, y);
      bounds.maxY = Math.max(bounds.maxY, y);
    };
    const offsets = [];
    if (slotWidth <= toolDiameter) {
      offsets.push(0);
    } else {
      const wallOffset = (slotWidth - toolDiameter) / 2;
      offsets.push(-wallOffset, wallOffset);
      if (slotWidth > toolDiameter * 2) {
        offsets.push(0);
      }
    }
    offsets.sort((a, b) => a - b);
    const numericDepth = Number(depth);
    const numericDepthPerPass = Number(depthPerPass);
    let currentDepth = 0;
    while (currentDepth > numericDepth) {
      currentDepth = Math.max(numericDepth, currentDepth - numericDepthPerPass);
      code.push(`(--- Pass at Z=${currentDepth.toFixed(3)} ---)`);
      for (const offset of offsets) {
        if (type === "straight") {
          const angle = Math.atan2(endY - startY, endX - startX);
          const perpAngle = angle + Math.PI / 2;
          const dx = Math.cos(perpAngle) * offset;
          const dy = Math.sin(perpAngle) * offset;
          const passStartX = startX + dx;
          const passStartY = startY + dy;
          const passEndX = endX + dx;
          const passEndY = endY + dy;
          code.push(`G0 Z${safeZ}`);
          code.push(`G0 X${passStartX.toFixed(3)} Y${passStartY.toFixed(3)}`);
          code.push(`G1 Z${currentDepth.toFixed(3)} F${feed / 2}`);
          code.push(`G1 X${passEndX.toFixed(3)} Y${passEndY.toFixed(3)} F${feed}`);
          if (currentDepth === Math.max(numericDepth, -numericDepthPerPass)) {
            paths.push({ d: `M${passStartX} ${passStartY} L${passEndX} ${passEndY}`, stroke: "var(--color-accent-yellow)", strokeWidth: `${toolDiameter}%` });
            updateBounds(passStartX, passStartY);
            updateBounds(passEndX, passEndY);
          }
        } else {
          const passRadius = radius + offset;
          if (passRadius <= 0) continue;
          const startRad = startAngle * (Math.PI / 180);
          const endRad = endAngle * (Math.PI / 180);
          const passStartX = centerX + passRadius * Math.cos(startRad);
          const passStartY = centerY + passRadius * Math.sin(startRad);
          const passEndX = centerX + passRadius * Math.cos(endRad);
          const passEndY = centerY + passRadius * Math.sin(endRad);
          const gCodeArc = endAngle > startAngle ? "G3" : "G2";
          const sweepFlag = endAngle > startAngle ? 1 : 0;
          const I = centerX - passStartX;
          const J = centerY - passStartY;
          code.push(`G0 Z${safeZ}`);
          code.push(`G0 X${passStartX.toFixed(3)} Y${passStartY.toFixed(3)}`);
          code.push(`G1 Z${currentDepth.toFixed(3)} F${feed / 2}`);
          code.push(`${gCodeArc} X${passEndX.toFixed(3)} Y${passEndY.toFixed(3)} I${I.toFixed(3)} J${J.toFixed(3)} F${feed}`);
          if (currentDepth === Math.max(numericDepth, -numericDepthPerPass)) {
            const largeArcFlag = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
            paths.push({ d: `M ${passStartX} ${passStartY} A ${passRadius} ${passRadius} 0 ${largeArcFlag} ${sweepFlag} ${passEndX} ${passEndY}`, stroke: "var(--color-accent-yellow)", fill: "none", strokeWidth: `${toolDiameter}%` });
            updateBounds(centerX - passRadius, centerY - passRadius);
            updateBounds(centerX + passRadius, centerY + passRadius);
          }
        }
      }
    }
    code.push(`G0 Z${safeZ}`, `M5`);
    return { code, paths, bounds, error: null };
  };
  const generateTextCode = () => {
    const textParams = generatorSettings.text;
    const toolIndex = toolLibrary.findIndex((t) => t.id === textParams.toolId);
    if (toolIndex === -1) return { error: "Please select a tool.", code: [], paths: [], bounds: {} };
    const selectedTool = toolLibrary[toolIndex];
    if (!selectedTool) return { error: "Please select a tool.", code: [], paths: [], bounds: {} };
    const { text, font, height, spacing, startX, startY, alignment, depth, feed, spindle, safeZ } = textParams;
    if ([height, spacing, startX, startY, depth, feed, spindle, safeZ].some((p) => p === "" || p === null) || !text) return { error: "Please fill all required fields.", code: [], paths: [], bounds: {} };
    const fontData = FONTS[font];
    if (!fontData) {
      return { error: `Font "${font}" not found.`, code: [], paths: [], bounds: {} };
    }
    const code = [];
    const paths = [];
    const FONT_BASE_HEIGHT = 7;
    const FONT_BASE_WIDTH = 5;
    const scale = height / FONT_BASE_HEIGHT;
    const charWidth = FONT_BASE_WIDTH * scale;
    const totalTextWidth = text.length * charWidth + Math.max(0, (text.length - 1) * spacing);
    let currentX = startX;
    if (alignment === "center") {
      currentX -= totalTextWidth / 2;
    } else if (alignment === "right") {
      currentX -= totalTextWidth;
    }
    const startOffsetX = currentX;
    code.push(`(--- Text Engraving ---)`);
    code.push(`(Tool: ${selectedTool.name})`);
    code.push(`(Text: ${text}, Font: ${font})`);
    code.push(`G21 G90`);
    code.push(`M3 S${spindle}`);
    for (let i = 0; i < text.length; i++) {
      const char = text[i].toUpperCase();
      const charData = fontData.characters[char];
      if (charData) {
        if (fontData.type === "stroke") {
          for (const stroke of charData) {
            const p1 = {
              x: startOffsetX + i * (charWidth + spacing) + stroke.p1.x * scale,
              y: startY + stroke.p1.y * scale
            };
            const p2 = {
              x: startOffsetX + i * (charWidth + spacing) + stroke.p2.x * scale,
              y: startY + stroke.p2.y * scale
            };
            code.push(`G0 Z${safeZ}`);
            code.push(`G0 X${p1.x.toFixed(3)} Y${p1.y.toFixed(3)}`);
            code.push(`G1 Z${depth.toFixed(3)} F${feed / 2}`);
            code.push(`G1 X${p2.x.toFixed(3)} Y${p2.y.toFixed(3)} F${feed}`);
            code.push(`G0 Z${safeZ}`);
            paths.push({ d: `M${p1.x} ${p1.y} L${p2.x} ${p2.y}`, stroke: "var(--color-accent-yellow)" });
          }
        } else if (fontData.type === "outline") {
          for (const path of charData) {
            if (path.length === 0) continue;
            const scaledPath = path.map((p) => ({
              x: startOffsetX + i * (charWidth + spacing) + p.x * scale,
              y: startY + p.y * scale
            }));
            code.push(`G0 Z${safeZ}`);
            code.push(`G0 X${scaledPath[0].x.toFixed(3)} Y${scaledPath[0].y.toFixed(3)}`);
            code.push(`G1 Z${depth.toFixed(3)} F${feed / 2}`);
            for (let j = 1; j < scaledPath.length; j++) {
              code.push(`G1 X${scaledPath[j].x.toFixed(3)} Y${scaledPath[j].y.toFixed(3)} F${feed}`);
            }
            if (scaledPath[0].x !== scaledPath[scaledPath.length - 1].x || scaledPath[0].y !== scaledPath[scaledPath.length - 1].y) {
              code.push(`G1 X${scaledPath[0].x.toFixed(3)} Y${scaledPath[0].y.toFixed(3)} F${feed}`);
            }
            code.push(`G0 Z${safeZ}`);
            const pathString = "M" + scaledPath.map((p) => `${p.x} ${p.y}`).join(" L ") + " Z";
            paths.push({ d: pathString, stroke: "var(--color-accent-yellow)", "strokeWidth": "2%", fill: "none" });
          }
        }
      }
    }
    code.push("M5");
    code.push(`G0 X${startX.toFixed(3)} Y${startY.toFixed(3)}`);
    const bounds = { minX: startOffsetX, maxX: startOffsetX + totalTextWidth, minY: startY, maxY: startY + height };
    return { code, paths, bounds, error: null };
  };
  const generateThreadMillingCode = () => {
    const threadParams = generatorSettings.thread;
    const toolIndex = toolLibrary.findIndex((t) => t.id === threadParams.toolId);
    if (toolIndex === -1) return { error: "Please select a tool.", code: [], paths: [], bounds: {} };
    const selectedTool = toolLibrary[toolIndex];
    if (!selectedTool) return { error: "Please select a tool.", code: [], paths: [], bounds: {} };
    const toolDiameter = selectedTool.diameter;
    const { type, hand, feed, spindle, safeZ } = threadParams;
    const diameter = Number(threadParams.diameter);
    const pitch = Number(threadParams.pitch);
    const depth = Number(threadParams.depth);
    if ([diameter, pitch, depth, feed, spindle, safeZ].some((p) => p === "" || p === null || isNaN(Number(p)) || Number(p) <= 0)) {
      return { error: "Please fill all fields with positive values.", code: [], paths: [], bounds: {} };
    }
    if (toolDiameter >= diameter && type === "internal") {
      return { error: "Tool diameter must be smaller than thread diameter for internal threads.", code: [], paths: [], bounds: {} };
    }
    const code = [
      `(--- Thread Milling Operation ---)`,
      `(Tool: ${selectedTool.name} - Ø${toolDiameter}${unit})`,
      `(Type: ${type}, Hand: ${hand})`,
      `(Diameter: ${diameter}, Pitch: ${pitch}, Depth: ${depth})`,
      `(Feed: ${feed}, Spindle: ${spindle})`,
      // `T${toolIndex + 1} M6`, // Tool change disabled for non-ATC setups
      `G21 G90`,
      `M3 S${spindle}`,
      `G0 Z${safeZ}`
    ];
    const paths = [];
    const centerX = 0;
    const centerY = 0;
    let pathRadius, helicalDirection;
    if (type === "internal") {
      pathRadius = (diameter - toolDiameter) / 2;
      helicalDirection = hand === "right" ? "G3" : "G2";
    } else {
      pathRadius = (diameter + toolDiameter) / 2;
      helicalDirection = hand === "right" ? "G2" : "G3";
    }
    if (pathRadius <= 0) return { error: "Invalid tool/thread diameter combination.", code: [], paths: [], bounds: {} };
    paths.push({ cx: centerX, cy: centerY, r: diameter / 2, stroke: "var(--color-text-secondary)", strokeDasharray: "4 2", strokeWidth: "2%", fill: "none" });
    paths.push({ cx: centerX, cy: centerY, r: pathRadius, stroke: "var(--color-accent-yellow)", strokeWidth: "3%", fill: "none" });
    if (type === "internal") {
      const preDrillRadius = diameter - pitch;
      paths.push({ cx: centerX, cy: centerY, r: preDrillRadius / 2, stroke: "var(--color-text-secondary)", strokeDasharray: "2 2", strokeWidth: "2%", fill: "none" });
    }
    const startX = centerX + pathRadius;
    code.push(`G0 X${centerX.toFixed(3)} Y${centerY.toFixed(3)}`);
    code.push(`G1 Z${(-depth).toFixed(3)} F${feed / 2}`);
    code.push(`G1 X${startX.toFixed(3)} F${feed}`);
    const numericDepth = Number(depth);
    let currentZ = -numericDepth;
    while (currentZ < 0) {
      currentZ = Math.min(0, currentZ + Number(pitch));
      code.push(`${helicalDirection} X${startX.toFixed(3)} Y${centerY.toFixed(3)} I${-pathRadius.toFixed(3)} J0 Z${currentZ.toFixed(3)} F${Number(feed)}`);
    }
    code.push(`G1 X${centerX.toFixed(3)} F${feed}`);
    code.push(`G0 Z${safeZ.toFixed(3)}`);
    code.push(`M5`);
    code.push(`G0 X0 Y0`);
    const boundsRadius = type === "internal" ? diameter / 2 : pathRadius;
    const bounds = { minX: centerX - boundsRadius, maxX: centerX + boundsRadius, minY: centerY - boundsRadius, maxY: centerY + boundsRadius };
    return { code, paths, bounds, error: null };
  };
  const applyArrayPattern = reactExports.useCallback((singleOpResult) => {
    const { code: singleCode, paths: singlePaths, bounds: singleBounds } = singleOpResult;
    const { pattern, rectCols, rectRows, rectSpacingX, rectSpacingY, circCopies, circRadius, circCenterX, circCenterY, circStartAngle } = arraySettings;
    const inputLines = singleCode;
    const transformLine = (line, offset) => {
      const upperLine = line.toUpperCase();
      if (!/G[0-3]\s/.test(upperLine) || !upperLine.includes("X") && !upperLine.includes("Y")) {
        return line;
      }
      let transformed = line;
      transformed = transformed.replace(/X\s*([-+]?\d*\.?\d+)/i, (match, val) => `X${(parseFloat(val) + offset.x).toFixed(3)}`);
      transformed = transformed.replace(/Y\s*([-+]?\d*\.?\d+)/i, (match, val) => `Y${(parseFloat(val) + offset.y).toFixed(3)}`);
      return transformed;
    };
    const offsets = [];
    if (pattern === "rect") {
      for (let row = 0; row < rectRows; row++) {
        for (let col = 0; col < rectCols; col++) {
          offsets.push({ x: col * rectSpacingX, y: row * rectSpacingY });
        }
      }
    } else {
      const angleStep = circCopies > 0 ? 360 / circCopies : 0;
      for (let i = 0; i < circCopies; i++) {
        const angle = (circStartAngle + i * angleStep) * (Math.PI / 180);
        offsets.push({
          x: circCenterX + circRadius * Math.cos(angle),
          y: circCenterY + circRadius * Math.sin(angle)
        });
      }
    }
    const finalCode = [];
    const finalPaths = [];
    const finalBounds = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
    offsets.forEach((offset) => {
      finalCode.push(`(--- Repetition at X${offset.x.toFixed(3)} Y${offset.y.toFixed(3)} ---)`);
      inputLines.forEach((line) => {
        if (line.startsWith("(") || /T\d+\s*M6/.test(line)) {
          if (!finalCode.includes(line)) finalCode.unshift(line);
        } else {
          finalCode.push(transformLine(line, offset));
        }
      });
      singlePaths.forEach((p) => {
        let newPath = { ...p };
        if (p.d) {
          newPath.d = p.d.replace(/([ML])(\s*[\d\.-]+)(\s*,?\s*)([\d\.-]+)/g, (match, cmd, x, sep, y) => {
            return `${cmd} ${parseFloat(x) + offset.x} ${sep} ${parseFloat(y) + offset.y}`;
          });
        }
        if (p.cx !== void 0) {
          newPath.cx = p.cx + offset.x;
          newPath.cy = p.cy + offset.y;
        }
        finalPaths.push(newPath);
      });
      finalBounds.minX = Math.min(finalBounds.minX, singleBounds.minX + offset.x);
      finalBounds.maxX = Math.max(finalBounds.maxX, singleBounds.maxX + offset.x);
      finalBounds.minY = Math.min(finalBounds.minY, singleBounds.minY + offset.y);
      finalBounds.maxY = Math.max(finalBounds.maxY, singleBounds.maxY + offset.y);
    });
    return { code: finalCode, paths: finalPaths, bounds: finalBounds };
  }, [arraySettings]);
  const handleGenerate = reactExports.useCallback(() => {
    setGenerationError(null);
    let result = { code: [], paths: [], bounds: {}, error: "Unknown operation" };
    if (activeTab === "surfacing") result = generateSurfacingCode();
    else if (activeTab === "drilling") result = generateDrillingCode();
    else if (activeTab === "bore") result = generateBoreCode();
    else if (activeTab === "pocket") result = generatePocketCode();
    else if (activeTab === "profile") result = generateProfileCode();
    else if (activeTab === "slot") result = generateSlotCode();
    else if (activeTab === "text") result = generateTextCode();
    else if (activeTab === "thread") result = generateThreadMillingCode();
    if (result.error) {
      setGenerationError(result.error);
      setGeneratedGCode("");
      setPreviewPaths({ paths: [], bounds: { minX: 0, maxX: 100, minY: 0, maxY: 100 } });
      return;
    }
    const showArray = !["surfacing", "drilling"].includes(activeTab);
    if (showArray && arraySettings.isEnabled && result.code.length > 0) {
      result = applyArrayPattern(result);
    }
    setGeneratedGCode(result.code ? result.code.join("\n") : "");
    setPreviewPaths({ paths: result.paths, bounds: result.bounds });
  }, [activeTab, generatorSettings, toolLibrary, arraySettings, applyArrayPattern, generateSurfacingCode, generateDrillingCode, generateBoreCode, generatePocketCode, generateProfileCode, generateSlotCode, generateTextCode, generateThreadMillingCode]);
  const handleGenerateRef = React.useRef(handleGenerate);
  reactExports.useEffect(() => {
    handleGenerateRef.current = handleGenerate;
  }, [handleGenerate]);
  const handleZoom = (factor) => {
    setViewBox((currentViewBox) => {
      const parts = currentViewBox.split(" ").map(parseFloat);
      if (parts.length !== 4) return currentViewBox;
      let [x, y, w, h] = parts;
      const newW = w * factor;
      const newH = h * factor;
      const newX = x + (w - newW) / 2;
      const newY = y + (h - newH) / 2;
      return `${newX} ${newY} ${newW} ${newH}`;
    });
  };
  const handleParamChange = reactExports.useCallback((field, value) => {
    const isNumberField = !["shape", "cutSide", "tabsEnabled", "type", "font", "text", "alignment", "hand", "direction"].includes(field);
    const parsedValue = isNumberField ? value === "" ? "" : parseFloat(value) : value;
    if (isNumberField && value !== "" && isNaN(parsedValue)) return;
    onSettingsChange({
      ...generatorSettings,
      [activeTab]: { ...generatorSettings[activeTab], [field]: parsedValue }
    });
  }, [activeTab, generatorSettings, onSettingsChange]);
  const handleToolChange = reactExports.useCallback((toolId) => {
    onToolSelect(toolId);
    onSettingsChange({
      ...generatorSettings,
      [activeTab]: { ...generatorSettings[activeTab], toolId }
    });
  }, [activeTab, generatorSettings, onSettingsChange, onToolSelect]);
  const currentParams = reactExports.useMemo(() => {
    return generatorSettings[activeTab];
  }, [activeTab, generatorSettings]);
  reactExports.useEffect(() => {
    if (isOpen) {
      handleGenerateRef.current();
    }
  }, [isOpen, generatorSettings, toolLibrary, arraySettings]);
  reactExports.useEffect(() => {
    if (selectedToolId !== null && currentParams?.toolId !== selectedToolId) {
      handleToolChange(selectedToolId);
    }
  }, [selectedToolId, activeTab, currentParams, handleToolChange]);
  const isLoadDisabled = !generatedGCode || !!generationError || !currentParams || currentParams.toolId === null;
  const renderPreviewContent = () => {
    if (!currentParams || currentParams.toolId === null) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-square w-full bg-secondary rounded flex items-center justify-center p-4 text-center text-text-secondary", children: "Please select a tool to generate a preview." });
    }
    if (generationError) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-square w-full bg-secondary rounded flex items-center justify-center p-4 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-accent-yellow", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTriangle, { className: "w-10 h-10 mx-auto mb-2" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold", children: "Generation Failed" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: generationError })
      ] }) });
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Preview, { paths: previewPaths.paths, viewBox });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-background/80 backdrop-blur-sm z-40 flex items-center justify-center", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface rounded-lg shadow-2xl w-full max-w-4xl border border-secondary transform transition-all max-h-[90vh] flex flex-col", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 border-b border-secondary flex justify-between items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-text-primary", children: "G-Code Generator" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "p-1 rounded-md text-text-secondary hover:text-text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-6 h-6" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 flex-grow grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex border-b border-secondary flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full text-xs text-text-secondary uppercase tracking-wider", children: "Milling" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tab, { label: "Surfacing", isActive: activeTab === "surfacing", onClick: () => setActiveTab("surfacing") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tab, { label: "Drilling", isActive: activeTab === "drilling", onClick: () => setActiveTab("drilling") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tab, { label: "Bore", isActive: activeTab === "bore", onClick: () => setActiveTab("bore") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tab, { label: "Pocket", isActive: activeTab === "pocket", onClick: () => setActiveTab("pocket") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tab, { label: "Profile", isActive: activeTab === "profile", onClick: () => setActiveTab("profile") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tab, { label: "Slot", isActive: activeTab === "slot", onClick: () => setActiveTab("slot") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tab, { label: "Thread Milling", isActive: activeTab === "thread", onClick: () => setActiveTab("thread") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full text-xs text-text-secondary uppercase tracking-wider mt-2", children: "Text & Engraving" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tab, { label: "Text", isActive: activeTab === "text", onClick: () => setActiveTab("text") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-4", children: [
          activeTab === "surfacing" && /* @__PURE__ */ jsxRuntimeExports.jsx(
            SurfacingGenerator,
            {
              params: generatorSettings.surfacing,
              onParamsChange: handleParamChange,
              toolLibrary,
              unit,
              settings,
              selectedToolId,
              onToolSelect
            }
          ),
          activeTab === "drilling" && /* @__PURE__ */ jsxRuntimeExports.jsx(
            DrillingGenerator,
            {
              params: generatorSettings.drilling,
              onParamsChange: handleParamChange,
              toolLibrary,
              unit,
              settings,
              selectedToolId,
              onToolSelect
            }
          ),
          activeTab === "bore" && /* @__PURE__ */ jsxRuntimeExports.jsx(
            BoreGenerator,
            {
              params: generatorSettings.bore,
              onParamsChange: handleParamChange,
              toolLibrary,
              unit,
              settings,
              selectedToolId,
              onToolSelect
            }
          ),
          activeTab === "pocket" && /* @__PURE__ */ jsxRuntimeExports.jsx(
            PocketGenerator,
            {
              params: generatorSettings.pocket,
              onParamsChange: handleParamChange,
              toolLibrary,
              unit,
              settings,
              selectedToolId,
              onToolSelect
            }
          ),
          activeTab === "profile" && /* @__PURE__ */ jsxRuntimeExports.jsx(
            ProfileGenerator,
            {
              params: generatorSettings.profile,
              onParamsChange: handleParamChange,
              toolLibrary,
              unit,
              settings,
              selectedToolId,
              onToolSelect
            }
          ),
          activeTab === "slot" && /* @__PURE__ */ jsxRuntimeExports.jsx(
            SlotGenerator,
            {
              params: generatorSettings.slot,
              onParamsChange: handleParamChange,
              toolLibrary,
              unit,
              settings,
              selectedToolId,
              onToolSelect
            }
          ),
          activeTab === "text" && /* @__PURE__ */ jsxRuntimeExports.jsx(
            TextGenerator,
            {
              params: generatorSettings.text,
              onParamsChange: handleParamChange,
              toolLibrary,
              unit,
              fontOptions: Object.keys(FONTS),
              settings,
              selectedToolId,
              onToolSelect
            }
          ),
          activeTab === "thread" && /* @__PURE__ */ jsxRuntimeExports.jsx(
            ThreadMillingGenerator,
            {
              params: generatorSettings.thread,
              onParamsChange: handleParamChange,
              toolLibrary,
              unit,
              settings,
              selectedToolId,
              onToolSelect
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-background p-4 rounded-md flex flex-col gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center border-b border-secondary pb-2 mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold", children: "2D Preview" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: handleGenerate,
                title: "Regenerate G-Code and Preview",
                className: "px-2 py-1 bg-primary text-white text-xs font-bold rounded-md hover:bg-primary-focus disabled:bg-secondary disabled:cursor-not-allowed flex items-center gap-1",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "w-4 h-4" }),
                  "Generate"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold", children: "2D Preview" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleZoom(1.5), title: "Zoom Out", className: "p-1.5 rounded-md hover:bg-secondary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ZoomOut, { className: "w-5 h-5 text-text-secondary" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleZoom(1 / 1.5), title: "Zoom In", className: "p-1.5 rounded-md hover:bg-secondary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ZoomIn, { className: "w-5 h-5 text-text-secondary" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: fitView, title: "Fit to View", className: "p-1.5 rounded-md hover:bg-secondary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Maximize, { className: "w-5 h-5 text-text-secondary" }) })
          ] })
        ] }),
        renderPreviewContent(),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "textarea",
          {
            readOnly: true,
            value: generatedGCode,
            className: "w-full flex-grow bg-secondary font-mono text-sm p-2 rounded-md border border-secondary focus:outline-none focus:ring-1 focus:ring-primary",
            rows: 8
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-background px-6 py-4 flex justify-end gap-4 rounded-b-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "px-4 py-2 bg-secondary text-white font-semibold rounded-md hover:bg-secondary-focus", children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => onLoadGCode(generatedGCode, `${activeTab}_generated.gcode`),
          disabled: isLoadDisabled,
          title: isLoadDisabled ? generationError || "Please select a tool" : "Load G-Code",
          className: "px-6 py-2 bg-primary text-white font-bold rounded-md hover:bg-primary-focus disabled:bg-secondary disabled:cursor-not-allowed flex items-center gap-2",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "w-5 h-5" }),
            "Load into Sender"
          ]
        }
      )
    ] })
  ] }) });
};
const Footer = ({ onContactClick }) => {
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("footer", { className: "bg-surface text-text-secondary text-sm text-center p-4 mt-auto border-t border-secondary flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
    "© ",
    currentYear,
    " mycnc.app - A Web-Based G-Code Sender.",
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onContactClick, className: "ml-2 text-primary hover:underline font-semibold", children: "Contact Us" }),
    "  - Source Code ",
    /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "https://github.com/jennib/mycnc.github.io", target: "_blank", rel: "noopener noreferrer", className: "text-primary hover:underline font-semibold", children: "here" }),
    "."
  ] }) });
};
const ContactModal = ({ isOpen, onClose }) => {
  const [name2, setName] = reactExports.useState("");
  const [email, setEmail] = reactExports.useState("");
  const [message, setMessage] = reactExports.useState("");
  const [error, setError] = reactExports.useState("");
  if (!isOpen) {
    return null;
  }
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name2 || !email || !message) {
      setError("All fields are required.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    const subject = encodeURIComponent("Contact from mycnc.app");
    const body = encodeURIComponent(
      `Name: ${name2}
Email: ${email}

Message:
${message}`
    );
    window.location.href = `mailto:tutti.studios@gmail.com?subject=${subject}&body=${body}`;
    onClose();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "fixed inset-0 bg-background/80 backdrop-blur-sm z-40 flex items-center justify-center",
      onClick: onClose,
      "aria-modal": "true",
      role: "dialog",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "bg-surface rounded-lg shadow-2xl w-full max-w-lg border border-secondary transform transition-all",
          onClick: (e) => e.stopPropagation(),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 border-b border-secondary flex justify-between items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-text-primary", children: "Contact Us" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: onClose,
                  className: "p-1 rounded-md text-text-secondary hover:text-text-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary",
                  "aria-label": "Close contact form",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-6 h-6" })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-4", children: [
                error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-accent-red/20 text-accent-red p-3 rounded-md text-sm font-semibold", children: error }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "contact-name", className: "block text-sm font-medium text-text-secondary mb-1", children: "Your Name" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      id: "contact-name",
                      type: "text",
                      value: name2,
                      onChange: (e) => setName(e.target.value),
                      required: true,
                      className: "w-full bg-background border border-secondary rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "contact-email", className: "block text-sm font-medium text-text-secondary mb-1", children: "Your Email" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      id: "contact-email",
                      type: "email",
                      value: email,
                      onChange: (e) => setEmail(e.target.value),
                      required: true,
                      className: "w-full bg-background border border-secondary rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "contact-message", className: "block text-sm font-medium text-text-secondary mb-1", children: "Message" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "textarea",
                    {
                      id: "contact-message",
                      value: message,
                      onChange: (e) => setMessage(e.target.value),
                      required: true,
                      rows: 5,
                      className: "w-full bg-background border border-secondary rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-text-secondary", children: "This will open your default email client to send the message." })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-background px-6 py-4 flex justify-end items-center gap-4 rounded-b-lg", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: onClose,
                    className: "px-4 py-2 bg-secondary text-white font-semibold rounded-md hover:bg-secondary-focus",
                    children: "Cancel"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    type: "submit",
                    className: "px-6 py-2 bg-primary text-white font-bold rounded-md hover:bg-primary-focus flex items-center gap-2",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "w-5 h-5" }),
                      "Send Message"
                    ]
                  }
                )
              ] })
            ] })
          ]
        }
      )
    }
  );
};
class ErrorBoundary extends reactExports.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { children: "Something went wrong." });
    }
    return this.props.children;
  }
}
const UnsupportedBrowser = () => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-background text-text-primary min-h-screen flex flex-col items-center justify-center p-8 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { viewBox: "0 0 420 100", className: "h-16 w-auto mx-auto mb-8", "aria-label": "mycnc.app logo", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { transform: "translate(48,48)", fill: "none", stroke: "var(--color-text-primary)", strokeWidth: "4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { r: "48", cx: "0", cy: "0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M 0,-48 A 48,48 0 0 1 30,16 L 10,6 A 12,12 0 0 0 0,-12 Z" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M 0,-48 A 48,48 0 0 1 30,16 L 10,6 A 12,12 0 0 0 0,-12 Z", transform: "rotate(120)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M 0,-48 A 48,48 0 0 1 30,16 L 10,6 A 12,12 0 0 0 0,-12 Z", transform: "rotate(-120)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { r: "12", cx: "0", cy: "0" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "text",
        {
          x: "108",
          y: "66",
          fontFamily: "Inter, 'Segoe UI', Roboto, Arial, sans-serif",
          fontWeight: "700",
          fontSize: "64px",
          letterSpacing: "-0.02em",
          fill: "var(--color-text-primary)",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("tspan", { style: { fill: "var(--color-primary)" }, children: "mycnc" }),
            ".app"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-accent-yellow/20 border-l-4 border-accent-yellow text-accent-yellow p-4 m-4 flex items-start", role: "alert", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTriangle, { className: "h-8 w-8 mr-4 flex-shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-left", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold mb-2", children: "Browser Not Supported or Mobile Device Detected" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-2", children: "This application requires the Web Serial API to communicate with CNC controllers. This API is currently supported in desktop versions of browsers like Google Chrome and Microsoft Edge." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-2", children: "Mobile browsers do not support this feature." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Please access this page from a compatible desktop browser." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API#browser_compatibility", target: "_blank", rel: "noopener noreferrer", className: "text-primary font-semibold hover:underline", children: "Check Web Serial API compatibility" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mx-2", children: "|" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "https://caniuse.com/serial", target: "_blank", rel: "noopener noreferrer", className: "text-primary font-semibold hover:underline", children: "View on CanIUse.com" })
        ] })
      ] })
    ] })
  ] }) });
};
const GRBL_ALARM_CODES = {
  1: { name: "Hard limit", desc: "A limit switch was triggered. Usually due to machine travel limits.", resolution: 'Check for obstructions. The machine may need to be moved off the switch manually. Use the "$X" command to unlock after clearing the issue, then perform a homing cycle ($H).' },
  2: { name: "G-code motion command error", desc: "The G-code motion target is invalid or exceeds machine travel limits.", resolution: 'Check your G-code file for errors near the last executed line. Use the "$X" command to unlock.' },
  3: { name: "Reset while in motion", desc: "The reset button was pressed while the machine was moving.", resolution: 'This is expected. Use "$X" to unlock the machine and resume work.' },
  4: { name: "Probe fail", desc: "The probing cycle failed to make contact or the probe is already triggered.", resolution: 'Check your probe wiring and ensure it is properly positioned. Use the "$X" to unlock.' },
  5: { name: "Probe fail, travel error", desc: "The probing cycle failed to clear the probe switch.", resolution: 'Check probe wiring and setup. The machine may require a soft-reset (E-STOP). Use "$X" to unlock.' },
  8: { name: "Homing fail, pull-off", desc: "The homing cycle failed because the machine couldn't move off the limit switches.", resolution: 'Check for mechanical issues or obstructions. Use "$X" to unlock.' },
  9: { name: "Homing fail, not found", desc: "The homing cycle failed because the limit switches were not triggered.", resolution: 'Check limit switch wiring and functionality. Use "$X" to unlock.' },
  "default": { name: "Unknown Alarm", desc: "An unspecified alarm has occurred.", resolution: 'Try unlocking with "$X". If that fails, a soft-reset (E-STOP button) may be required.' }
};
const GRBL_ERROR_CODES = {
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
};
const DEFAULT_MACROS = [
  { name: "Go to WCS Zero", commands: ["G90", "G0 X0 Y0"] },
  { name: "Safe Z & WCS Zero", commands: ["G90", "G0 Z10", "G0 X0 Y0"] },
  { name: "Spindle On (1k RPM)", commands: ["M3 S1000"] },
  { name: "Spindle Off", commands: ["M5"] },
  { name: "Go to G54 Zero", commands: ["G54 G0 X0 Y0"] },
  { name: "Reset All Offsets", commands: ["G92.1"] }
];
const DEFAULT_TOOLS = [
  { id: 1, name: '1/8" Flat Endmill', diameter: 3.175 },
  { id: 2, name: '1/4" Flat Endmill', diameter: 6.35 },
  { id: 3, name: "60 Degree V-Bit", diameter: 12.7 },
  { id: 4, name: "90 Degree V-Bit", diameter: 12.7 }
];
const DEFAULT_SETTINGS = {
  workArea: { x: 300, y: 300, z: 80 },
  spindle: { min: 0, max: 12e3 },
  probe: { xOffset: 3, yOffset: 3, zOffset: 15, feedRate: 25 },
  scripts: {
    startup: ["G21", "G90"].join("\n"),
    // Set units to mm, absolute positioning
    toolChange: ["M5", "G0 Z10"].join("\n"),
    // Stop spindle, raise Z
    shutdown: ["M5", "G0 X0 Y0"].join("\n"),
    // Stop spindle, go to WCS zero
    jobPause: "M5",
    // Stop spindle on pause
    jobResume: "",
    // No default resume script, spindle state is restored by logic
    jobStop: "M5"
    // Stop spindle on graceful stop
  }
};
const DEFAULT_GENERATOR_SETTINGS = {
  // Ensure this matches the new interfaces
  surfacing: { width: 100, length: 100, depth: -1, stepover: 40, feed: 800, spindle: 8e3, safeZ: 5, startX: 0, startY: 0, toolId: null, direction: "horizontal" },
  // Example values
  drilling: { drillType: "single", depth: -5, peck: 2, retract: 2, feed: 150, spindle: 8e3, safeZ: 5, singleX: 10, singleY: 10, rectCols: 4, rectRows: 3, rectSpacingX: 25, rectSpacingY: 20, rectStartX: 10, rectStartY: 10, circCenterX: 50, circCenterY: 50, circRadius: 40, circHoles: 6, circStartAngle: 0, toolId: null },
  // Example values
  bore: { centerX: 50, centerY: 50, holeDiameter: 20, holeDepth: -15, counterboreEnabled: true, cbDiameter: 30, cbDepth: -5, depthPerPass: 2, feed: 400, plungeFeed: 150, spindle: 8e3, safeZ: 5, toolId: null },
  // Example values
  pocket: { shape: "rect", width: 80, length: 50, cornerRadius: 5, diameter: 60, depth: -10, depthPerPass: 2, stepover: 40, feed: 500, plungeFeed: 150, spindle: 8e3, safeZ: 5, toolId: null },
  // Example values
  profile: { shape: "rect", width: 80, length: 50, cornerRadius: 10, diameter: 60, depth: -12, depthPerPass: 3, cutSide: "outside", tabsEnabled: true, numTabs: 4, tabWidth: 6, tabHeight: 2, feed: 600, spindle: 9e3, safeZ: 5, toolId: null },
  // Example values
  slot: { type: "straight", slotWidth: 6, depth: -5, depthPerPass: 2, feed: 400, spindle: 8e3, safeZ: 5, startX: 10, startY: 10, endX: 90, endY: 20, centerX: 50, centerY: 50, radius: 40, startAngle: 45, endAngle: 135, toolId: null },
  // Example values
  text: { text: "HELLO", font: "Sans-serif Stick", height: 10, spacing: 2, startX: 10, startY: 10, alignment: "left", depth: -0.5, feed: 300, spindle: 1e4, safeZ: 5, toolId: null },
  // Example values
  thread: { type: "internal", hand: "right", diameter: 10, pitch: 1, depth: 10, feed: 200, spindle: 1e4, safeZ: 5, toolId: null }
  // Example values
};
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = reactExports.useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key “${key}”:`, error);
      return initialValue;
    }
  });
  reactExports.useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Error setting localStorage key “${key}”:`, error);
    }
  }, [key, storedValue]);
  return [storedValue, setStoredValue];
}
const usePrevious = (value) => {
  const ref = reactExports.useRef();
  reactExports.useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};
(/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 19);
const App = () => {
  const [isConnected, setIsConnected] = reactExports.useState(false);
  const [isSimulatedConnection, setIsSimulatedConnection] = reactExports.useState(false);
  const [portInfo, setPortInfo] = reactExports.useState(null);
  const [gcodeLines, setGcodeLines] = reactExports.useState([]);
  const [fileName, setFileName] = reactExports.useState("");
  const [jobStatus, setJobStatus] = reactExports.useState(JobStatus.Idle);
  const [progress, setProgress] = reactExports.useState(0);
  const [consoleLogs, setConsoleLogs] = reactExports.useState([]);
  const [error, setError] = reactExports.useState(null);
  const [isSerialApiSupported, setIsSerialApiSupported] = reactExports.useState(true);
  const [useSimulator, setUseSimulator] = reactExports.useState(false);
  const [machineState, setMachineState] = reactExports.useState(null);
  const [isJogging, setIsJogging] = reactExports.useState(false);
  const [flashingButton, setFlashingButton] = reactExports.useState(null);
  const [notifications, setNotifications] = reactExports.useState([]);
  const [isAudioUnlocked, setIsAudioUnlocked] = reactExports.useState(false);
  const [timeEstimate, setTimeEstimate] = reactExports.useState({ totalSeconds: 0, cumulativeSeconds: [] });
  const [isPreflightModalOpen, setIsPreflightModalOpen] = reactExports.useState(false);
  const [jobStartOptions, setJobStartOptions] = reactExports.useState({ startLine: 0, isDryRun: false });
  const [isHomedSinceConnect, setIsHomedSinceConnect] = reactExports.useState(false);
  const [isMacroRunning, setIsMacroRunning] = reactExports.useState(false);
  const [preflightWarnings, setPreflightWarnings] = reactExports.useState([]);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = reactExports.useState(false);
  const [isFullscreen, setIsFullscreen] = reactExports.useState(false);
  const [isMacroEditorOpen, setIsMacroEditorOpen] = reactExports.useState(false);
  const [editingMacroIndex, setEditingMacroIndex] = reactExports.useState(null);
  const [isMacroEditMode, setIsMacroEditMode] = reactExports.useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = reactExports.useState(false);
  const [isToolLibraryModalOpen, setIsToolLibraryModalOpen] = reactExports.useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = reactExports.useState(false);
  const [isGCodeModalOpen, setIsGCodeModalOpen] = reactExports.useState(false);
  const [selectedToolId, setSelectedToolId] = reactExports.useState(null);
  const [isVerbose, setIsVerbose] = reactExports.useState(false);
  const [returnToWelcome, setReturnToWelcome] = reactExports.useState(false);
  const [jogStep, setJogStep] = useLocalStorage("cnc-app-jogstep", 1);
  const [unit, setUnit] = useLocalStorage("cnc-app-unit", "mm");
  const [isLightMode, setIsLightMode] = useLocalStorage("cnc-app-theme", false);
  const [macros, setMacros] = useLocalStorage("cnc-app-macros", DEFAULT_MACROS);
  const [machineSettings, setMachineSettings] = useLocalStorage("cnc-app-settings", DEFAULT_SETTINGS);
  const [toolLibrary, setToolLibrary] = useLocalStorage("cnc-app-tool-library", []);
  const [generatorSettings, setGeneratorSettings] = useLocalStorage("cnc-app-generator-settings", DEFAULT_GENERATOR_SETTINGS);
  const serialManagerRef = reactExports.useRef(null);
  const prevState = usePrevious(machineState);
  const jobStatusRef = reactExports.useRef(jobStatus);
  const audioContextRef = reactExports.useRef(null);
  const audioBufferRef = reactExports.useRef(null);
  const isVerboseRef = reactExports.useRef(isVerbose);
  reactExports.useEffect(() => {
    isVerboseRef.current = isVerbose;
  }, [isVerbose]);
  reactExports.useEffect(() => {
    jobStatusRef.current = jobStatus;
  }, [jobStatus]);
  reactExports.useEffect(() => {
    document.documentElement.classList.toggle("light-mode", isLightMode);
  }, [isLightMode]);
  reactExports.useEffect(() => {
    const toolIds = new Set(toolLibrary.map((t) => t.id));
    const validatedSettings = { ...generatorSettings };
    let hasChanges = false;
    for (const key in validatedSettings) {
      const opSettings = validatedSettings[key];
      if (opSettings.toolId !== null && !toolIds.has(opSettings.toolId)) {
        opSettings.toolId = null;
        hasChanges = true;
      }
    }
    if (hasChanges) {
      setGeneratorSettings(validatedSettings);
    }
  }, []);
  reactExports.useEffect(() => {
    if (machineState?.status === "Idle" || machineState?.status === "Alarm") {
      setIsJogging(false);
    }
  }, [machineState?.status]);
  reactExports.useEffect(() => {
    if (toolLibrary.length === 1 && selectedToolId === null) {
      setSelectedToolId(toolLibrary[0].id);
    }
  }, [toolLibrary, selectedToolId]);
  const removeNotification = reactExports.useCallback((id) => {
    setNotifications((prev) => {
      const notificationToRemove = prev.find((n) => n.id === id);
      if (notificationToRemove && notificationToRemove.timerId) {
        clearTimeout(notificationToRemove.timerId);
      }
      return prev.filter((n) => n.id !== id);
    });
  }, []);
  const addNotification = reactExports.useCallback((message, type = "success", duration = 1e4) => {
    const id = Date.now() + Math.random();
    const timerId = window.setTimeout(() => {
      removeNotification(id);
    }, duration);
    setNotifications((prev) => [...prev, { id, message, type, timerId }]);
  }, [removeNotification]);
  reactExports.useEffect(() => {
    const AudioContext = window.AudioContext;
    if (!AudioContext) {
      console.error("AudioContext not supported by this browser.");
      return;
    }
    const context = new AudioContext();
    audioContextRef.current = context;
    try {
      const base64Data = completionSound.split(",")[1];
      const binaryString = window.atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      context.decodeAudioData(bytes.buffer).then((decodedData) => {
        audioBufferRef.current = decodedData;
      }).catch((error2) => {
        console.error("Failed to decode completion sound:", error2);
        addNotification("Could not load notification sound.", "error");
      });
    } catch (error2) {
      console.error("Failed to process completion sound:", error2);
      addNotification("Could not load notification sound.", "error");
    }
    const unlockAudio = () => {
      if (context.state === "suspended") {
        context.resume().then(() => {
          setIsAudioUnlocked(true);
          document.removeEventListener("click", unlockAudio);
          document.removeEventListener("keydown", unlockAudio);
        });
      } else {
        setIsAudioUnlocked(true);
        document.removeEventListener("click", unlockAudio);
        document.removeEventListener("keydown", unlockAudio);
      }
    };
    document.addEventListener("click", unlockAudio);
    document.addEventListener("keydown", unlockAudio);
    return () => {
      document.removeEventListener("click", unlockAudio);
      document.removeEventListener("keydown", unlockAudio);
      context.close();
    };
  }, [addNotification]);
  reactExports.useEffect(() => {
    const isMachineSetupComplete = !!machineSettings.isConfigured;
    const isToolLibrarySetupComplete = toolLibrary.length > 0;
    const hasSeenWelcome = localStorage.getItem("cnc-app-seen-welcome");
    if (hasSeenWelcome !== "true" && (!isMachineSetupComplete || !isToolLibrarySetupComplete)) {
      setIsWelcomeModalOpen(true);
    }
  }, []);
  reactExports.useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);
  const playCompletionSound = reactExports.useCallback(() => {
    const audioContext = audioContextRef.current;
    const audioBuffer = audioBufferRef.current;
    if (audioBuffer && audioContext && audioContext.state === "running") {
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start(0);
    } else {
      console.warn("Could not play sound: AudioContext not running or sound buffer not loaded.");
    }
  }, []);
  const addLog = reactExports.useCallback((log) => {
    let processedLog = { ...log, timestamp: /* @__PURE__ */ new Date() };
    if (processedLog.type === "error" && processedLog.message.includes("error:")) {
      const codeMatch = processedLog.message.match(/error:(\d+)/);
      if (codeMatch && codeMatch[1]) {
        const code = parseInt(codeMatch[1], 10);
        const explanation = GRBL_ERROR_CODES[code];
        if (explanation) {
          processedLog.message = `${processedLog.message} (${explanation})`;
        }
      }
    }
    setConsoleLogs((prev) => {
      const trimmedMessage = processedLog.message.trim().toLowerCase();
      if (!isVerboseRef.current && processedLog.type === "received" && trimmedMessage === "ok") {
        const lastLog = prev.length > 0 ? prev[prev.length - 1] : null;
        if (lastLog && lastLog.type === "received" && /^ok\.*$/.test(lastLog.message) && lastLog.message.length < 60) {
          const newLogs = [...prev];
          newLogs[newLogs.length - 1] = { ...lastLog, message: lastLog.message + "." };
          return newLogs;
        }
      }
      return [...prev, processedLog].slice(-200);
    });
  }, []);
  reactExports.useEffect(() => {
    if (prevState?.status === "Home" && machineState?.status === "Idle") {
      addNotification("Homing complete.", "success");
      setIsHomedSinceConnect(true);
    }
  }, [machineState, prevState, addNotification]);
  reactExports.useEffect(() => {
    if (machineState?.status === "Alarm" && (jobStatus === JobStatus.Running || jobStatus === JobStatus.Paused)) {
      setJobStatus(JobStatus.Stopped);
      setProgress(0);
      const alarmInfo2 = GRBL_ALARM_CODES[machineState.code] || GRBL_ALARM_CODES.default;
      addLog({
        type: "error",
        message: `Job aborted due to Alarm ${machineState.code}: ${alarmInfo2.name}.`
      });
    }
  }, [machineState, jobStatus, addLog]);
  reactExports.useEffect(() => {
    if ("serial" in navigator) {
      setIsSerialApiSupported(true);
    } else {
      setIsSerialApiSupported(false);
      setError("Web Serial API is not supported by your browser. Please use a compatible browser like Chrome, Edge, or enable it in Firefox (dom.w3c_serial.enabled).");
    }
  }, []);
  const handleConnect = reactExports.useCallback(async () => {
    if (!isSerialApiSupported && !useSimulator) return;
    const commonCallbacks = {
      onConnect: async (info) => {
        setIsConnected(true);
        setPortInfo(info);
        addLog({ type: "status", message: `Connected to ${useSimulator ? "simulator" : "port"} at 115200 baud.` });
        setError(null);
        setIsSimulatedConnection(useSimulator);
        setIsHomedSinceConnect(false);
        if (machineSettings.scripts.startup && serialManagerRef.current) {
          addLog({ type: "status", message: "Running startup script..." });
          const startupCommands = machineSettings.scripts.startup.split("\n").filter((cmd) => cmd.trim() !== "");
          for (const command of startupCommands) {
            await serialManagerRef.current.sendLineAndWaitForOk(command);
          }
        }
      },
      onDisconnect: () => {
        setIsConnected(false);
        setPortInfo(null);
        setJobStatus(JobStatus.Idle);
        setProgress(0);
        setMachineState(null);
        addLog({ type: "status", message: "Disconnected." });
        serialManagerRef.current = null;
        setIsSimulatedConnection(false);
        setIsHomedSinceConnect(false);
      },
      onLog: addLog,
      onProgress: (p) => {
        setProgress(p.percentage);
        if (p.percentage >= 100 && jobStatusRef.current !== JobStatus.Complete) {
          setJobStatus(JobStatus.Complete);
          addLog({ type: "status", message: "Job complete!" });
          addNotification("Job complete!", "success");
          playCompletionSound();
        }
      },
      onError: (message) => {
        setError(message);
        addLog({ type: "error", message });
      },
      onStatus: (status, rawStatus) => {
        setMachineState(status);
        if (isVerboseRef.current && rawStatus && rawStatus.startsWith("<")) {
          addLog({ type: "received", message: rawStatus });
        }
      }
    };
    try {
      const manager = useSimulator ? new SimulatedSerialManager(commonCallbacks) : new SerialManager(commonCallbacks);
      serialManagerRef.current = manager;
      await manager.connect(115200);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Failed to connect: ${errorMessage}`);
      addLog({ type: "error", message: `Failed to connect: ${errorMessage}` });
    }
  }, [addLog, isSerialApiSupported, useSimulator, addNotification, playCompletionSound, machineSettings.scripts.startup, isVerboseRef]);
  const handleDisconnect = reactExports.useCallback(async () => {
    if (jobStatus === JobStatus.Running || jobStatus === JobStatus.Paused) {
      if (!window.confirm("A job is currently running or paused. Are you sure you want to disconnect? This will stop the job.")) {
        return;
      }
    }
    if (isConnected && machineSettings.scripts.shutdown && serialManagerRef.current) {
      addLog({ type: "status", message: "Running shutdown script..." });
      const shutdownCommands = machineSettings.scripts.shutdown.split("\n").filter((cmd) => cmd.trim() !== "");
      for (const command of shutdownCommands) {
        await serialManagerRef.current.sendLineAndWaitForOk(command);
      }
    }
    await serialManagerRef.current?.disconnect();
    if (isSimulatedConnection) {
      setUseSimulator(false);
    }
  }, [jobStatus, isConnected, isSimulatedConnection, machineSettings.scripts.shutdown, addLog, setUseSimulator]);
  const handleFileLoad = (content, name2) => {
    const lines = content.split("\n").map((l) => l.replace(/\(.*\)/g, "")).map((l) => l.split(";")[0]).map((l) => l.trim()).filter((l) => l && l !== "%");
    setGcodeLines(lines);
    setFileName(name2);
    setProgress(0);
    setJobStatus(JobStatus.Idle);
    setSelectedToolId(toolLibrary.length === 1 ? toolLibrary[0].id : null);
    setTimeEstimate(estimateGCodeTime(lines));
    addLog({ type: "status", message: `Loaded ${name2} (${lines.length} lines).` });
  };
  const handleGCodeChange = (content) => {
    const lines = content.split("\n").map((l) => l.replace(/\(.*\)/g, "")).map((l) => l.split(";")[0]).map((l) => l.trim()).filter((l) => l && l !== "%");
    setGcodeLines(lines);
    if (fileName && !fileName.endsWith(" (edited)")) {
      setFileName(`${fileName} (edited)`);
    } else if (!fileName) {
      setFileName("untitled.gcode (edited)");
    }
    setProgress(0);
    setJobStatus(JobStatus.Idle);
    setTimeEstimate(estimateGCodeTime(lines));
    addLog({ type: "status", message: `G-code modified (${lines.length} lines).` });
  };
  const handleClearFile = reactExports.useCallback(() => {
    setGcodeLines([]);
    setFileName("");
    setProgress(0);
    setJobStatus(JobStatus.Idle);
    setSelectedToolId(toolLibrary.length === 1 ? toolLibrary[0].id : null);
    setTimeEstimate({ totalSeconds: 0, cumulativeSeconds: [] });
    addLog({ type: "status", message: "G-code file cleared." });
  }, [addLog, toolLibrary]);
  const handleLoadGeneratedGCode = reactExports.useCallback((gcode, name2) => {
    handleFileLoad(gcode, name2);
    setIsGCodeModalOpen(false);
  }, [handleFileLoad]);
  const handleStartJobConfirmed = reactExports.useCallback((options) => {
    const manager = serialManagerRef.current;
    if (!manager || !isConnected || gcodeLines.length === 0) return;
    setIsPreflightModalOpen(false);
    setJobStatus(JobStatus.Running);
    manager.sendGCode(gcodeLines, {
      startLine: jobStartOptions.startLine,
      isDryRun: options.isDryRun
    });
  }, [isConnected, gcodeLines, jobStartOptions]);
  const handleJobControl = reactExports.useCallback(async (action, options) => {
    const manager = serialManagerRef.current;
    if (!manager || !isConnected) return;
    switch (action) {
      case "start":
        if (gcodeLines.length > 0) {
          const warnings = analyzeGCode(gcodeLines, machineSettings);
          setPreflightWarnings(warnings);
          setJobStartOptions({ startLine: options?.startLine ?? 0, isDryRun: false });
          setIsPreflightModalOpen(true);
        }
        break;
      case "pause":
        if (jobStatusRef.current === JobStatus.Running) {
          await manager.pause();
          setJobStatus(JobStatus.Paused);
        }
        break;
      case "resume":
        if (jobStatusRef.current === JobStatus.Paused) {
          await manager.resume();
          setJobStatus(JobStatus.Running);
        }
        break;
      case "stop":
        setJobStatus((currentStatus) => {
          if (currentStatus === JobStatus.Running || currentStatus === JobStatus.Paused) {
            manager.stopJob();
            setProgress(0);
            return JobStatus.Stopped;
          }
          return currentStatus;
        });
        break;
      case "gracefulStop":
        setJobStatus((currentStatus) => {
          if (currentStatus === JobStatus.Running || currentStatus === JobStatus.Paused) {
            manager.gracefulStop();
            setProgress(0);
            return JobStatus.Stopped;
          }
          return currentStatus;
        });
        break;
    }
  }, [isConnected, gcodeLines, machineSettings, handleStartJobConfirmed]);
  const handleManualCommand = reactExports.useCallback((command) => {
    serialManagerRef.current?.sendLine(command);
  }, []);
  const handleJog = (axis, direction, step) => {
    if (!serialManagerRef.current) return;
    if (axis === "Z" && unit === "mm" && step > 10) {
      addLog({ type: "error", message: "Z-axis jog step cannot exceed 10mm." });
      return;
    }
    if (axis === "Z" && unit === "in" && step > 1) {
      addLog({ type: "error", message: "Z-axis jog step cannot exceed 1in." });
      return;
    }
    const feedRate = 1e3;
    const command = `$J=G91 ${axis}${step * direction} F${feedRate}`;
    setIsJogging(true);
    serialManagerRef.current.sendLineAndWaitForOk(command).catch((err) => {
      const errorMessage = err instanceof Error ? err.message : "An error occurred during jog.";
      if (!errorMessage.includes("Cannot send new line")) {
        addLog({ type: "error", message: `Jog failed: ${errorMessage}` });
      }
      setIsJogging(false);
    });
  };
  const flashControl = reactExports.useCallback((buttonId) => {
    setFlashingButton(buttonId);
    setTimeout(() => {
      setFlashingButton(null);
    }, 200);
  }, []);
  const handleEmergencyStop = reactExports.useCallback(() => {
    serialManagerRef.current?.emergencyStop();
    setJobStatus(JobStatus.Stopped);
    setProgress(0);
    addLog({ type: "error", message: "EMERGENCY STOP TRIGGERED (Soft Reset)" });
  }, [addLog]);
  const handleSpindleCommand = reactExports.useCallback((command, speed) => {
    const manager = serialManagerRef.current;
    if (!manager || !isConnected) return;
    let gcode = "";
    switch (command) {
      case "cw":
        gcode = `M3 S${speed}`;
        break;
      case "ccw":
        gcode = `M4 S${speed}`;
        break;
      case "off":
        gcode = "M5";
        break;
      default:
        return;
    }
    manager.sendLine(gcode);
  }, [isConnected]);
  const handleFeedOverride = reactExports.useCallback((command) => {
    const manager = serialManagerRef.current;
    if (!manager) return;
    const commandMap = {
      "reset": "",
      // Set to 100%
      "inc10": "",
      // Increase 10%
      "dec10": "",
      // Decrease 10%
      "inc1": "",
      // Increase 1%
      "dec1": ""
      // Decrease 1%
    };
    if (commandMap[command]) {
      manager.sendRealtimeCommand(commandMap[command]);
    }
  }, []);
  const isAlarm = machineState?.status === "Alarm";
  const handleUnitChange = reactExports.useCallback((newUnit) => {
    if (newUnit === unit || !serialManagerRef.current) return;
    const command = newUnit === "mm" ? "G21" : "G20";
    serialManagerRef.current.sendLine(command);
    setUnit(newUnit);
    addLog({ type: "status", message: `Units set to ${newUnit === "mm" ? "millimeters" : "inches"}.` });
    setJogStep(newUnit === "mm" ? 1 : 0.1);
  }, [unit, addLog]);
  const handleProbe = reactExports.useCallback(async (axes) => {
    const manager = serialManagerRef.current;
    if (!manager || !isConnected) {
      addLog({ type: "error", message: "Cannot probe while disconnected." });
      return;
    }
    const offsets = {
      x: machineSettings.probe.xOffset,
      y: machineSettings.probe.yOffset,
      z: machineSettings.probe.zOffset
    };
    const probeTravel = unit === "mm" ? -25 : -1;
    const probeFeed = machineSettings.probe.feedRate || 25;
    const retractDist = unit === "mm" ? -5 : -0.2;
    addLog({ type: "status", message: `Starting ${axes.toUpperCase()}-Probe cycle...` });
    try {
      const probeAxis = async (axis, offset, travelDir = -1) => {
        const travel = probeTravel * travelDir;
        await manager.sendLineAndWaitForOk(`G38.2 ${axis}${travel.toFixed(4)} F${probeFeed}`);
        addLog({ type: "status", message: `Probe contact detected on ${axis}.` });
        await manager.sendLineAndWaitForOk(`G10 L20 P1 ${axis}${offset}`);
        addLog({ type: "status", message: `${axis}-axis zero set to ${offset}${unit}.` });
        await manager.sendLineAndWaitForOk("G91");
        await manager.sendLineAndWaitForOk(`G0 ${axis}${retractDist * -travelDir}`);
        await manager.sendLineAndWaitForOk("G90");
      };
      if (axes.includes("X") && offsets.x !== void 0) {
        await probeAxis("X", offsets.x, -1);
      }
      if (axes.includes("Y") && offsets.y !== void 0) {
        await probeAxis("Y", offsets.y, -1);
      }
      if (axes.includes("Z") && offsets.z !== void 0) {
        await probeAxis("Z", offsets.z, 1);
      }
      addLog({ type: "status", message: "Probe cycle complete." });
      addNotification(`${axes.toUpperCase()}-Probe cycle complete.`, "success");
    } catch (error2) {
      const errorMessage = error2 instanceof Error ? error2.message : "Unknown error";
      addLog({ type: "error", message: `Probe cycle failed: ${errorMessage}` });
      setError(`Probe cycle failed: ${errorMessage}`);
      manager.sendLine("", false);
    }
  }, [isConnected, addLog, addNotification, unit, setError, machineSettings.probe]);
  const handleTrySimulator = reactExports.useCallback(() => {
    setMachineSettings({ ...DEFAULT_SETTINGS, isConfigured: true });
    setToolLibrary(DEFAULT_TOOLS);
    setUseSimulator(true);
    setIsWelcomeModalOpen(false);
    localStorage.setItem("cnc-app-seen-welcome", "true");
  }, [setMachineSettings, setToolLibrary, setUseSimulator, setIsWelcomeModalOpen]);
  reactExports.useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isConnected) return;
      if (document.activeElement && ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) {
        return;
      }
      let handled = true;
      switch (e.key.toLowerCase()) {
        // Jogging
        case "arrowup":
          handleJog("Y", 1, jogStep);
          flashControl("jog-y-plus");
          break;
        case "arrowdown":
          handleJog("Y", -1, jogStep);
          flashControl("jog-y-minus");
          break;
        case "arrowleft":
          handleJog("X", -1, jogStep);
          flashControl("jog-x-minus");
          break;
        case "arrowright":
          handleJog("X", 1, jogStep);
          flashControl("jog-x-plus");
          break;
        case "pageup":
          handleJog("Z", 1, jogStep);
          flashControl("jog-z-plus");
          break;
        case "pagedown":
          handleJog("Z", -1, jogStep);
          flashControl("jog-z-minus");
          break;
        // E-Stop
        case "escape":
          handleEmergencyStop();
          flashControl("estop");
          break;
        // Unlock
        case "x":
          if (isAlarm) {
            handleManualCommand("$X");
            flashControl("unlock-button");
          } else {
            handled = false;
          }
          break;
        // Step Size
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
          const stepSizes = unit === "mm" ? [0.01, 0.1, 1, 10, 50] : [1e-3, 0.01, 0.1, 1, 2];
          const stepIndex = parseInt(e.key) - 1;
          if (stepIndex < stepSizes.length) {
            const newStep = stepSizes[stepIndex];
            setJogStep(newStep);
            flashControl(`step-${newStep}`);
          }
          break;
        default:
          handled = false;
          break;
      }
      if (handled) {
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isConnected, jogStep, handleJog, flashControl, handleEmergencyStop, isAlarm, handleManualCommand, unit]);
  const handleHome = reactExports.useCallback((axes) => {
    const manager = serialManagerRef.current;
    if (!manager) return;
    setMachineState((prev) => {
      const newPrev = prev || {
        status: "Idle",
        code: null,
        wpos: { x: 0, y: 0, z: 0 },
        mpos: { x: 0, y: 0, z: 0 },
        spindle: { state: "off", speed: 0 },
        ov: [100, 100, 100]
      };
      return { ...newPrev, status: "Home" };
    });
    addLog({ type: "status", message: `Starting homing cycle for: ${axes.toUpperCase()}...` });
    const commandMap = {
      all: ["$H"],
      x: ["$HX"],
      y: ["$HY"],
      z: ["$HZ"],
      xy: ["$HXY"]
    };
    const commands = commandMap[axes];
    if (!commands) {
      addLog({ type: "error", message: `Unknown homing command: ${axes}` });
      return;
    }
    for (const cmd of commands) {
      manager.sendLine(cmd);
    }
  }, [addLog]);
  const handleSetZero = reactExports.useCallback((axes) => {
    let command = "G10 L20 P1";
    switch (axes) {
      case "all":
        command += " X0 Y0 Z0";
        break;
      case "x":
        command += " X0";
        break;
      case "y":
        command += " Y0";
        break;
      case "z":
        command += " Z0";
        break;
      case "xy":
        command += " X0 Y0";
        break;
    }
    serialManagerRef.current?.sendLine(command);
    addLog({ type: "status", message: `Work coordinate origin set for ${axes.toUpperCase()}.` });
  }, [addLog]);
  const handleRunMacro = reactExports.useCallback(async (commands) => {
    const manager = serialManagerRef.current;
    if (!manager) return;
    const processedCommands = commands.map(
      (cmd) => cmd.replace(/{unit}/g, unit).replace(/{safe_z}/g, unit === "mm" ? "10" : "0.4")
    );
    setIsMacroRunning(true);
    addLog({ type: "status", message: `Running macro: ${processedCommands.join("; ")}` });
    try {
      for (const command of processedCommands) {
        await manager.sendLineAndWaitForOk(command);
      }
      addLog({ type: "status", message: "Macro finished." });
    } catch (error2) {
      const errorMessage = error2 instanceof Error ? error2.message : "Unknown error";
      addLog({ type: "error", message: `Macro failed: ${errorMessage}` });
      setError(`Macro failed: ${errorMessage}`);
    } finally {
      setIsMacroRunning(false);
    }
  }, [addLog, unit, setError]);
  const handleOpenMacroEditor = reactExports.useCallback((index) => {
    setEditingMacroIndex(index);
    setIsMacroEditorOpen(true);
  }, []);
  const handleCloseMacroEditor = reactExports.useCallback(() => {
    setIsMacroEditorOpen(false);
    setEditingMacroIndex(null);
  }, []);
  const handleSaveMacro = reactExports.useCallback((macro, index) => {
    setMacros((prevMacros) => {
      const newMacros = [...prevMacros];
      if (index !== null && index >= 0) {
        newMacros[index] = macro;
      } else {
        newMacros.push(macro);
      }
      return newMacros;
    });
    addNotification("Macro saved!", "success");
  }, [addNotification]);
  const handleDeleteMacro = reactExports.useCallback((index) => {
    setMacros((prevMacros) => prevMacros.filter((_, i) => i !== index));
    addNotification("Macro deleted!", "success");
  }, [addNotification]);
  const handleExportSettings = reactExports.useCallback(() => {
    const settingsToExport = {
      machineSettings,
      macros,
      toolLibrary,
      generatorSettings
    };
    const a = document.createElement("a");
    const url = URL.createObjectURL(new Blob([JSON.stringify(settingsToExport, null, 2)], { type: "application/json" }));
    a.href = url;
    a.download = `mycnc-app-settings-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addNotification("Settings exported successfully!", "success");
  }, [machineSettings, macros, toolLibrary, generatorSettings, addNotification]);
  const handleImportSettings = reactExports.useCallback((imported) => {
    if (!window.confirm("This will overwrite your current macros, settings, tool library, and generator settings. Are you sure?")) {
      return;
    }
    if (imported.machineSettings && !imported.machineSettings.probe) {
      imported.machineSettings.probe = DEFAULT_SETTINGS.probe;
    }
    if (imported.machineSettings && imported.macros && imported.toolLibrary) {
      setMachineSettings(imported.machineSettings);
      setMacros(imported.macros);
      setToolLibrary(imported.toolLibrary);
      if (imported.generatorSettings) {
        setGeneratorSettings(imported.generatorSettings);
      }
      addNotification("Settings imported successfully!", "success");
    }
  }, [addNotification, setMachineSettings, setMacros, setToolLibrary, setGeneratorSettings]);
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  if (!isSerialApiSupported || isMobile) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(UnsupportedBrowser, {});
  }
  const alarmInfo = isAlarm ? GRBL_ALARM_CODES[machineState.code] || GRBL_ALARM_CODES.default : null;
  const isJobActive = jobStatus === JobStatus.Running || jobStatus === JobStatus.Paused;
  reactExports.useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (isJobActive) {
        event.preventDefault();
        event.returnValue = "A job is currently active. Are you sure you want to leave?";
        return "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isJobActive]);
  !isConnected || isJobActive || isJogging || isMacroRunning || machineState?.status && ["Alarm", "Home"].includes(machineState.status);
  const selectedTool = toolLibrary.find((t) => t.id === selectedToolId) || null;
  reactExports.useEffect(() => {
    if (useSimulator && !isConnected) {
      handleConnect();
    }
  }, [useSimulator, isConnected, handleConnect]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background font-sans text-text-primary flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Analytics, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      WelcomeModal,
      {
        isOpen: isWelcomeModalOpen,
        onClose: () => {
          const isMachineSetupComplete = machineSettings.workArea.x > 0 && machineSettings.workArea.y > 0;
          const isToolLibrarySetupComplete = toolLibrary.length > 0;
          localStorage.getItem("cnc-app-seen-welcome");
          if (isMachineSetupComplete && isToolLibrarySetupComplete) {
            setIsWelcomeModalOpen(false);
            localStorage.setItem("cnc-app-seen-welcome", "true");
          } else {
            addNotification("Please complete all setup tasks to dismiss this window.", "info");
          }
        },
        onOpenSettings: () => {
          setIsWelcomeModalOpen(false);
          setReturnToWelcome(true);
          setIsSettingsModalOpen(true);
        },
        onOpenToolLibrary: () => {
          setIsWelcomeModalOpen(false);
          setReturnToWelcome(true);
          setIsToolLibraryModalOpen(true);
        },
        onTrySimulator: handleTrySimulator,
        isMachineSetupComplete: !!machineSettings.isConfigured,
        isToolLibrarySetupComplete: toolLibrary.length > 0
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      NotificationContainer,
      {
        notifications,
        onDismiss: removeNotification
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ContactModal,
      {
        isOpen: isContactModalOpen,
        onClose: () => setIsContactModalOpen(false)
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      PreflightChecklistModal,
      {
        isOpen: isPreflightModalOpen,
        onCancel: () => setIsPreflightModalOpen(false),
        onConfirm: handleStartJobConfirmed,
        jobInfo: { fileName, gcodeLines, timeEstimate, startLine: jobStartOptions.startLine },
        isHomed: isHomedSinceConnect,
        warnings: preflightWarnings,
        selectedTool
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      MacroEditorModal,
      {
        isOpen: isMacroEditorOpen,
        onCancel: handleCloseMacroEditor,
        onSave: handleSaveMacro,
        onDelete: handleDeleteMacro,
        macro: editingMacroIndex !== null ? macros[editingMacroIndex] : null,
        index: editingMacroIndex
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      SettingsModal,
      {
        isOpen: isSettingsModalOpen,
        onCancel: () => {
          setIsSettingsModalOpen(false);
          if (returnToWelcome) {
            setIsWelcomeModalOpen(true);
            setReturnToWelcome(false);
          }
        },
        onSave: (newSettings, newGeneratorSettings) => {
          setMachineSettings({ ...newSettings, isConfigured: true });
          setGeneratorSettings(newGeneratorSettings);
        },
        settings: machineSettings,
        generatorSettings,
        onResetDialogs: () => {
          localStorage.removeItem("cnc-app-skip-preflight");
          addNotification("Dialog settings have been reset.", "info");
        },
        onExport: handleExportSettings,
        onImport: handleImportSettings
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ToolLibraryModal,
      {
        isOpen: isToolLibraryModalOpen,
        onCancel: () => {
          setIsToolLibraryModalOpen(false);
          if (returnToWelcome) {
            setIsWelcomeModalOpen(true);
            setReturnToWelcome(false);
          }
        },
        onSave: setToolLibrary,
        library: toolLibrary
      }
    ),
    isGCodeModalOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorBoundary, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      GCodeGeneratorModal,
      {
        isOpen: isGCodeModalOpen,
        onClose: () => setIsGCodeModalOpen(false),
        onLoadGCode: handleLoadGeneratedGCode,
        unit,
        settings: machineSettings,
        toolLibrary,
        selectedToolId,
        onToolSelect: setSelectedToolId,
        generatorSettings,
        onSettingsChange: setGeneratorSettings
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "bg-surface shadow-md p-4 flex justify-between items-center z-10 flex-shrink-0 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "svg",
          {
            viewBox: "0 0 420 100",
            className: "h-8 w-auto",
            "aria-label": "mycnc.app logo",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { transform: "translate(48,48)", fill: "none", stroke: "var(--color-text-primary)", strokeWidth: "4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { r: "48", cx: "0", cy: "0" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M 0,-48 A 48,48 0 0 1 30,16 L 10,6 A 12,12 0 0 0 0,-12 Z" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M 0,-48 A 48,48 0 0 1 30,16 L 10,6 A 12,12 0 0 0 0,-12 Z", transform: "rotate(120)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M 0,-48 A 48,48 0 0 1 30,16 L 10,6 A 12,12 0 0 0 0,-12 Z", transform: "rotate(-120)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { r: "12", cx: "0", cy: "0" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "text",
                {
                  x: "108",
                  y: "66",
                  fontFamily: "Inter, 'Segoe UI', Roboto, Arial, sans-serif",
                  fontWeight: "700",
                  fontSize: "64px",
                  letterSpacing: "-0.02em",
                  fill: "var(--color-text-primary)",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("tspan", { style: { fill: "var(--color-primary)" }, children: "mycnc" }),
                    ".app"
                  ]
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-text-secondary font-mono pt-1", children: "v1.0.2" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: handleToggleFullscreen,
            title: isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen",
            className: "p-2 rounded-md bg-secondary text-text-primary hover:bg-secondary-focus focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface",
            children: isFullscreen ? /* @__PURE__ */ jsxRuntimeExports.jsx(Minimize, { className: "w-5 h-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Maximize, { className: "w-5 h-5" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setIsToolLibraryModalOpen(true),
            title: "Tool Library",
            className: "p-2 rounded-md bg-secondary text-text-primary hover:bg-secondary-focus focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "w-5 h-5" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => {
              setReturnToWelcome(false);
              setIsSettingsModalOpen(true);
            },
            title: "Machine Settings",
            className: "p-2 rounded-md bg-secondary text-text-primary hover:bg-secondary-focus focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "w-5 h-5" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          ThemeToggle,
          {
            isLightMode,
            onToggle: () => setIsLightMode((prev) => !prev)
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          SerialConnector,
          {
            isConnected,
            portInfo,
            onConnect: handleConnect,
            onDisconnect: handleDisconnect,
            isApiSupported: isSerialApiSupported,
            isSimulated: isSimulatedConnection,
            useSimulator,
            onSimulatorChange: setUseSimulator
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StatusBar,
      {
        isConnected,
        machineState,
        unit,
        onEmergencyStop: handleEmergencyStop,
        flashingButton
      }
    ),
    isAlarm && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-accent-red/20 border-b-4 border-accent-red text-accent-red p-4 m-4 flex items-start", role: "alert", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(OctagonAlert, { className: "h-8 w-8 mr-4 flex-shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-grow", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-lg", children: `Machine Alarm: ${alarmInfo.name}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: alarmInfo.desc }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm mt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Resolution: " }),
          alarmInfo.resolution
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          id: "unlock-button",
          title: "Unlock Machine (Hotkey: x)",
          onClick: () => handleManualCommand("$X"),
          className: `ml-4 flex items-center gap-2 px-4 py-2 bg-accent-red text-white font-semibold rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-background transition-all duration-100 ${flashingButton === "unlock-button" ? "ring-4 ring-white ring-inset" : ""}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Unlock, { className: "w-5 h-5" }),
            "Unlock ($X)"
          ]
        }
      )
    ] }),
    !isSerialApiSupported && !useSimulator && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-accent-yellow/20 border-l-4 border-accent-yellow text-accent-yellow p-4 m-4 flex items-start", role: "alert", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTriangle, { className: "h-6 w-6 mr-3 flex-shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold", children: "Browser Not Supported" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: error })
      ] })
    ] }),
    error && (isSerialApiSupported || useSimulator) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-accent-red/20 border-l-4 border-accent-red text-accent-red p-4 m-4 flex items-start", role: "alert", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTriangle, { className: "h-6 w-6 mr-3 flex-shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: error }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setError(null), className: "ml-auto font-bold", children: "X" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "flex-grow p-4 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-[60vh] lg:min-h-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        GCodePanel,
        {
          onFileLoad: handleFileLoad,
          fileName,
          gcodeLines,
          onJobControl: handleJobControl,
          jobStatus,
          progress,
          isConnected,
          unit,
          onGCodeChange: handleGCodeChange,
          onClearFile: handleClearFile,
          machineState,
          onFeedOverride: handleFeedOverride,
          timeEstimate,
          machineSettings,
          toolLibrary,
          selectedToolId,
          onToolSelect: setSelectedToolId,
          onOpenGenerator: () => setIsGCodeModalOpen(true)
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 overflow-hidden min-h-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          JogPanel,
          {
            isConnected,
            machineState,
            onJog: handleJog,
            onHome: handleHome,
            onSetZero: handleSetZero,
            onSpindleCommand: handleSpindleCommand,
            onProbe: handleProbe,
            onCommand: handleManualCommand,
            jogStep,
            onStepChange: setJogStep,
            flashingButton,
            onFlash: flashControl,
            unit,
            onUnitChange: handleUnitChange,
            isJobActive,
            isJogging,
            isMacroRunning
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(WebcamPanel, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          MacrosPanel,
          {
            macros,
            onRunMacro: handleRunMacro,
            onOpenEditor: handleOpenMacroEditor,
            isEditMode: isMacroEditMode,
            onToggleEditMode: () => setIsMacroEditMode((prev) => !prev),
            disabled: isJobActive
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Console,
          {
            logs: consoleLogs,
            onSendCommand: handleManualCommand,
            isConnected,
            isJobActive,
            isMacroRunning,
            isLightMode,
            isVerbose,
            onVerboseChange: setIsVerbose
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, { onContactClick: () => setIsContactModalOpen(true) })
  ] });
};
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}
const root = ReactDOM.createRoot(rootElement);
root.render(
  React.createElement(App, null)
);
