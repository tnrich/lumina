
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.29.6' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    const LOCATION = {};
    const ROUTER = {};

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/history.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    function getLocation(source) {
      return {
        ...source.location,
        state: source.history.state,
        key: (source.history.state && source.history.state.key) || "initial"
      };
    }

    function createHistory(source, options) {
      const listeners = [];
      let location = getLocation(source);

      return {
        get location() {
          return location;
        },

        listen(listener) {
          listeners.push(listener);

          const popstateListener = () => {
            location = getLocation(source);
            listener({ location, action: "POP" });
          };

          source.addEventListener("popstate", popstateListener);

          return () => {
            source.removeEventListener("popstate", popstateListener);

            const index = listeners.indexOf(listener);
            listeners.splice(index, 1);
          };
        },

        navigate(to, { state, replace = false } = {}) {
          state = { ...state, key: Date.now() + "" };
          // try...catch iOS Safari limits to 100 pushState calls
          try {
            if (replace) {
              source.history.replaceState(state, null, to);
            } else {
              source.history.pushState(state, null, to);
            }
          } catch (e) {
            source.location[replace ? "replace" : "assign"](to);
          }

          location = getLocation(source);
          listeners.forEach(listener => listener({ location, action: "PUSH" }));
        }
      };
    }

    // Stores history entries in memory for testing or other platforms like Native
    function createMemorySource(initialPathname = "/") {
      let index = 0;
      const stack = [{ pathname: initialPathname, search: "" }];
      const states = [];

      return {
        get location() {
          return stack[index];
        },
        addEventListener(name, fn) {},
        removeEventListener(name, fn) {},
        history: {
          get entries() {
            return stack;
          },
          get index() {
            return index;
          },
          get state() {
            return states[index];
          },
          pushState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            index++;
            stack.push({ pathname, search });
            states.push(state);
          },
          replaceState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            stack[index] = { pathname, search };
            states[index] = state;
          }
        }
      };
    }

    // Global history uses window.history as the source if available,
    // otherwise a memory history
    const canUseDOM = Boolean(
      typeof window !== "undefined" &&
        window.document &&
        window.document.createElement
    );
    const globalHistory = createHistory(canUseDOM ? window : createMemorySource());
    const { navigate } = globalHistory;

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    const paramRe = /^:(.+)/;

    const SEGMENT_POINTS = 4;
    const STATIC_POINTS = 3;
    const DYNAMIC_POINTS = 2;
    const SPLAT_PENALTY = 1;
    const ROOT_POINTS = 1;

    /**
     * Check if `string` starts with `search`
     * @param {string} string
     * @param {string} search
     * @return {boolean}
     */
    function startsWith(string, search) {
      return string.substr(0, search.length) === search;
    }

    /**
     * Check if `segment` is a root segment
     * @param {string} segment
     * @return {boolean}
     */
    function isRootSegment(segment) {
      return segment === "";
    }

    /**
     * Check if `segment` is a dynamic segment
     * @param {string} segment
     * @return {boolean}
     */
    function isDynamic(segment) {
      return paramRe.test(segment);
    }

    /**
     * Check if `segment` is a splat
     * @param {string} segment
     * @return {boolean}
     */
    function isSplat(segment) {
      return segment[0] === "*";
    }

    /**
     * Split up the URI into segments delimited by `/`
     * @param {string} uri
     * @return {string[]}
     */
    function segmentize(uri) {
      return (
        uri
          // Strip starting/ending `/`
          .replace(/(^\/+|\/+$)/g, "")
          .split("/")
      );
    }

    /**
     * Strip `str` of potential start and end `/`
     * @param {string} str
     * @return {string}
     */
    function stripSlashes(str) {
      return str.replace(/(^\/+|\/+$)/g, "");
    }

    /**
     * Score a route depending on how its individual segments look
     * @param {object} route
     * @param {number} index
     * @return {object}
     */
    function rankRoute(route, index) {
      const score = route.default
        ? 0
        : segmentize(route.path).reduce((score, segment) => {
            score += SEGMENT_POINTS;

            if (isRootSegment(segment)) {
              score += ROOT_POINTS;
            } else if (isDynamic(segment)) {
              score += DYNAMIC_POINTS;
            } else if (isSplat(segment)) {
              score -= SEGMENT_POINTS + SPLAT_PENALTY;
            } else {
              score += STATIC_POINTS;
            }

            return score;
          }, 0);

      return { route, score, index };
    }

    /**
     * Give a score to all routes and sort them on that
     * @param {object[]} routes
     * @return {object[]}
     */
    function rankRoutes(routes) {
      return (
        routes
          .map(rankRoute)
          // If two routes have the exact same score, we go by index instead
          .sort((a, b) =>
            a.score < b.score ? 1 : a.score > b.score ? -1 : a.index - b.index
          )
      );
    }

    /**
     * Ranks and picks the best route to match. Each segment gets the highest
     * amount of points, then the type of segment gets an additional amount of
     * points where
     *
     *  static > dynamic > splat > root
     *
     * This way we don't have to worry about the order of our routes, let the
     * computers do it.
     *
     * A route looks like this
     *
     *  { path, default, value }
     *
     * And a returned match looks like:
     *
     *  { route, params, uri }
     *
     * @param {object[]} routes
     * @param {string} uri
     * @return {?object}
     */
    function pick(routes, uri) {
      let match;
      let default_;

      const [uriPathname] = uri.split("?");
      const uriSegments = segmentize(uriPathname);
      const isRootUri = uriSegments[0] === "";
      const ranked = rankRoutes(routes);

      for (let i = 0, l = ranked.length; i < l; i++) {
        const route = ranked[i].route;
        let missed = false;

        if (route.default) {
          default_ = {
            route,
            params: {},
            uri
          };
          continue;
        }

        const routeSegments = segmentize(route.path);
        const params = {};
        const max = Math.max(uriSegments.length, routeSegments.length);
        let index = 0;

        for (; index < max; index++) {
          const routeSegment = routeSegments[index];
          const uriSegment = uriSegments[index];

          if (routeSegment !== undefined && isSplat(routeSegment)) {
            // Hit a splat, just grab the rest, and return a match
            // uri:   /files/documents/work
            // route: /files/* or /files/*splatname
            const splatName = routeSegment === "*" ? "*" : routeSegment.slice(1);

            params[splatName] = uriSegments
              .slice(index)
              .map(decodeURIComponent)
              .join("/");
            break;
          }

          if (uriSegment === undefined) {
            // URI is shorter than the route, no match
            // uri:   /users
            // route: /users/:userId
            missed = true;
            break;
          }

          let dynamicMatch = paramRe.exec(routeSegment);

          if (dynamicMatch && !isRootUri) {
            const value = decodeURIComponent(uriSegment);
            params[dynamicMatch[1]] = value;
          } else if (routeSegment !== uriSegment) {
            // Current segments don't match, not dynamic, not splat, so no match
            // uri:   /users/123/settings
            // route: /users/:id/profile
            missed = true;
            break;
          }
        }

        if (!missed) {
          match = {
            route,
            params,
            uri: "/" + uriSegments.slice(0, index).join("/")
          };
          break;
        }
      }

      return match || default_ || null;
    }

    /**
     * Check if the `path` matches the `uri`.
     * @param {string} path
     * @param {string} uri
     * @return {?object}
     */
    function match(route, uri) {
      return pick([route], uri);
    }

    /**
     * Add the query to the pathname if a query is given
     * @param {string} pathname
     * @param {string} [query]
     * @return {string}
     */
    function addQuery(pathname, query) {
      return pathname + (query ? `?${query}` : "");
    }

    /**
     * Resolve URIs as though every path is a directory, no files. Relative URIs
     * in the browser can feel awkward because not only can you be "in a directory",
     * you can be "at a file", too. For example:
     *
     *  browserSpecResolve('foo', '/bar/') => /bar/foo
     *  browserSpecResolve('foo', '/bar') => /foo
     *
     * But on the command line of a file system, it's not as complicated. You can't
     * `cd` from a file, only directories. This way, links have to know less about
     * their current path. To go deeper you can do this:
     *
     *  <Link to="deeper"/>
     *  // instead of
     *  <Link to=`{${props.uri}/deeper}`/>
     *
     * Just like `cd`, if you want to go deeper from the command line, you do this:
     *
     *  cd deeper
     *  # not
     *  cd $(pwd)/deeper
     *
     * By treating every path as a directory, linking to relative paths should
     * require less contextual information and (fingers crossed) be more intuitive.
     * @param {string} to
     * @param {string} base
     * @return {string}
     */
    function resolve(to, base) {
      // /foo/bar, /baz/qux => /foo/bar
      if (startsWith(to, "/")) {
        return to;
      }

      const [toPathname, toQuery] = to.split("?");
      const [basePathname] = base.split("?");
      const toSegments = segmentize(toPathname);
      const baseSegments = segmentize(basePathname);

      // ?a=b, /users?b=c => /users?a=b
      if (toSegments[0] === "") {
        return addQuery(basePathname, toQuery);
      }

      // profile, /users/789 => /users/789/profile
      if (!startsWith(toSegments[0], ".")) {
        const pathname = baseSegments.concat(toSegments).join("/");

        return addQuery((basePathname === "/" ? "" : "/") + pathname, toQuery);
      }

      // ./       , /users/123 => /users/123
      // ../      , /users/123 => /users
      // ../..    , /users/123 => /
      // ../../one, /a/b/c/d   => /a/b/one
      // .././one , /a/b/c/d   => /a/b/c/one
      const allSegments = baseSegments.concat(toSegments);
      const segments = [];

      allSegments.forEach(segment => {
        if (segment === "..") {
          segments.pop();
        } else if (segment !== ".") {
          segments.push(segment);
        }
      });

      return addQuery("/" + segments.join("/"), toQuery);
    }

    /**
     * Combines the `basepath` and the `path` into one path.
     * @param {string} basepath
     * @param {string} path
     */
    function combinePaths(basepath, path) {
      return `${stripSlashes(
    path === "/" ? basepath : `${stripSlashes(basepath)}/${stripSlashes(path)}`
  )}/`;
    }

    /**
     * Decides whether a given `event` should result in a navigation or not.
     * @param {object} event
     */
    function shouldNavigate(event) {
      return (
        !event.defaultPrevented &&
        event.button === 0 &&
        !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)
      );
    }

    /* node_modules/svelte-routing/src/Router.svelte generated by Svelte v3.29.6 */

    function create_fragment(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 32) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[5], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $base;
    	let $location;
    	let $routes;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Router", slots, ['default']);
    	let { basepath = "/" } = $$props;
    	let { url = null } = $$props;
    	const locationContext = getContext(LOCATION);
    	const routerContext = getContext(ROUTER);
    	const routes = writable([]);
    	validate_store(routes, "routes");
    	component_subscribe($$self, routes, value => $$invalidate(10, $routes = value));
    	const activeRoute = writable(null);
    	let hasActiveRoute = false; // Used in SSR to synchronously set that a Route is active.

    	// If locationContext is not set, this is the topmost Router in the tree.
    	// If the `url` prop is given we force the location to it.
    	const location = locationContext || writable(url ? { pathname: url } : globalHistory.location);

    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(9, $location = value));

    	// If routerContext is set, the routerBase of the parent Router
    	// will be the base for this Router's descendants.
    	// If routerContext is not set, the path and resolved uri will both
    	// have the value of the basepath prop.
    	const base = routerContext
    	? routerContext.routerBase
    	: writable({ path: basepath, uri: basepath });

    	validate_store(base, "base");
    	component_subscribe($$self, base, value => $$invalidate(8, $base = value));

    	const routerBase = derived([base, activeRoute], ([base, activeRoute]) => {
    		// If there is no activeRoute, the routerBase will be identical to the base.
    		if (activeRoute === null) {
    			return base;
    		}

    		const { path: basepath } = base;
    		const { route, uri } = activeRoute;

    		// Remove the potential /* or /*splatname from
    		// the end of the child Routes relative paths.
    		const path = route.default
    		? basepath
    		: route.path.replace(/\*.*$/, "");

    		return { path, uri };
    	});

    	function registerRoute(route) {
    		const { path: basepath } = $base;
    		let { path } = route;

    		// We store the original path in the _path property so we can reuse
    		// it when the basepath changes. The only thing that matters is that
    		// the route reference is intact, so mutation is fine.
    		route._path = path;

    		route.path = combinePaths(basepath, path);

    		if (typeof window === "undefined") {
    			// In SSR we should set the activeRoute immediately if it is a match.
    			// If there are more Routes being registered after a match is found,
    			// we just skip them.
    			if (hasActiveRoute) {
    				return;
    			}

    			const matchingRoute = match(route, $location.pathname);

    			if (matchingRoute) {
    				activeRoute.set(matchingRoute);
    				hasActiveRoute = true;
    			}
    		} else {
    			routes.update(rs => {
    				rs.push(route);
    				return rs;
    			});
    		}
    	}

    	function unregisterRoute(route) {
    		routes.update(rs => {
    			const index = rs.indexOf(route);
    			rs.splice(index, 1);
    			return rs;
    		});
    	}

    	if (!locationContext) {
    		// The topmost Router in the tree is responsible for updating
    		// the location store and supplying it through context.
    		onMount(() => {
    			const unlisten = globalHistory.listen(history => {
    				location.set(history.location);
    			});

    			return unlisten;
    		});

    		setContext(LOCATION, location);
    	}

    	setContext(ROUTER, {
    		activeRoute,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute
    	});

    	const writable_props = ["basepath", "url"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("basepath" in $$props) $$invalidate(3, basepath = $$props.basepath);
    		if ("url" in $$props) $$invalidate(4, url = $$props.url);
    		if ("$$scope" in $$props) $$invalidate(5, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		setContext,
    		onMount,
    		writable,
    		derived,
    		LOCATION,
    		ROUTER,
    		globalHistory,
    		pick,
    		match,
    		stripSlashes,
    		combinePaths,
    		basepath,
    		url,
    		locationContext,
    		routerContext,
    		routes,
    		activeRoute,
    		hasActiveRoute,
    		location,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute,
    		$base,
    		$location,
    		$routes
    	});

    	$$self.$inject_state = $$props => {
    		if ("basepath" in $$props) $$invalidate(3, basepath = $$props.basepath);
    		if ("url" in $$props) $$invalidate(4, url = $$props.url);
    		if ("hasActiveRoute" in $$props) hasActiveRoute = $$props.hasActiveRoute;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$base*/ 256) {
    			// This reactive statement will update all the Routes' path when
    			// the basepath changes.
    			 {
    				const { path: basepath } = $base;

    				routes.update(rs => {
    					rs.forEach(r => r.path = combinePaths(basepath, r._path));
    					return rs;
    				});
    			}
    		}

    		if ($$self.$$.dirty & /*$routes, $location*/ 1536) {
    			// This reactive statement will be run when the Router is created
    			// when there are no Routes and then again the following tick, so it
    			// will not find an active Route in SSR and in the browser it will only
    			// pick an active Route after all Routes have been registered.
    			 {
    				const bestMatch = pick($routes, $location.pathname);
    				activeRoute.set(bestMatch);
    			}
    		}
    	};

    	return [routes, location, base, basepath, url, $$scope, slots];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { basepath: 3, url: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get basepath() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set basepath(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-routing/src/Route.svelte generated by Svelte v3.29.6 */

    const get_default_slot_changes = dirty => ({
    	params: dirty & /*routeParams*/ 2,
    	location: dirty & /*$location*/ 16
    });

    const get_default_slot_context = ctx => ({
    	params: /*routeParams*/ ctx[1],
    	location: /*$location*/ ctx[4]
    });

    // (40:0) {#if $activeRoute !== null && $activeRoute.route === route}
    function create_if_block(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*component*/ ctx[0] !== null) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(40:0) {#if $activeRoute !== null && $activeRoute.route === route}",
    		ctx
    	});

    	return block;
    }

    // (43:2) {:else}
    function create_else_block(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[10].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope, routeParams, $location*/ 530) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[9], dirty, get_default_slot_changes, get_default_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(43:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (41:2) {#if component !== null}
    function create_if_block_1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{ location: /*$location*/ ctx[4] },
    		/*routeParams*/ ctx[1],
    		/*routeProps*/ ctx[2]
    	];

    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*$location, routeParams, routeProps*/ 22)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*$location*/ 16 && { location: /*$location*/ ctx[4] },
    					dirty & /*routeParams*/ 2 && get_spread_object(/*routeParams*/ ctx[1]),
    					dirty & /*routeProps*/ 4 && get_spread_object(/*routeProps*/ ctx[2])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(41:2) {#if component !== null}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$activeRoute*/ ctx[3] !== null && /*$activeRoute*/ ctx[3].route === /*route*/ ctx[7] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$activeRoute*/ ctx[3] !== null && /*$activeRoute*/ ctx[3].route === /*route*/ ctx[7]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$activeRoute*/ 8) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $activeRoute;
    	let $location;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Route", slots, ['default']);
    	let { path = "" } = $$props;
    	let { component = null } = $$props;
    	const { registerRoute, unregisterRoute, activeRoute } = getContext(ROUTER);
    	validate_store(activeRoute, "activeRoute");
    	component_subscribe($$self, activeRoute, value => $$invalidate(3, $activeRoute = value));
    	const location = getContext(LOCATION);
    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(4, $location = value));

    	const route = {
    		path,
    		// If no path prop is given, this Route will act as the default Route
    		// that is rendered if no other Route in the Router is a match.
    		default: path === ""
    	};

    	let routeParams = {};
    	let routeProps = {};
    	registerRoute(route);

    	// There is no need to unregister Routes in SSR since it will all be
    	// thrown away anyway.
    	if (typeof window !== "undefined") {
    		onDestroy(() => {
    			unregisterRoute(route);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(13, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("path" in $$new_props) $$invalidate(8, path = $$new_props.path);
    		if ("component" in $$new_props) $$invalidate(0, component = $$new_props.component);
    		if ("$$scope" in $$new_props) $$invalidate(9, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		onDestroy,
    		ROUTER,
    		LOCATION,
    		path,
    		component,
    		registerRoute,
    		unregisterRoute,
    		activeRoute,
    		location,
    		route,
    		routeParams,
    		routeProps,
    		$activeRoute,
    		$location
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(13, $$props = assign(assign({}, $$props), $$new_props));
    		if ("path" in $$props) $$invalidate(8, path = $$new_props.path);
    		if ("component" in $$props) $$invalidate(0, component = $$new_props.component);
    		if ("routeParams" in $$props) $$invalidate(1, routeParams = $$new_props.routeParams);
    		if ("routeProps" in $$props) $$invalidate(2, routeProps = $$new_props.routeProps);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$activeRoute*/ 8) {
    			 if ($activeRoute && $activeRoute.route === route) {
    				$$invalidate(1, routeParams = $activeRoute.params);
    			}
    		}

    		 {
    			const { path, component, ...rest } = $$props;
    			$$invalidate(2, routeProps = rest);
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		component,
    		routeParams,
    		routeProps,
    		$activeRoute,
    		$location,
    		activeRoute,
    		location,
    		route,
    		path,
    		$$scope,
    		slots
    	];
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { path: 8, component: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get path() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-routing/src/Link.svelte generated by Svelte v3.29.6 */
    const file = "node_modules/svelte-routing/src/Link.svelte";

    function create_fragment$2(ctx) {
    	let a;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[11].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);

    	let a_levels = [
    		{ href: /*href*/ ctx[0] },
    		{ "aria-current": /*ariaCurrent*/ ctx[2] },
    		/*props*/ ctx[1]
    	];

    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			if (default_slot) default_slot.c();
    			set_attributes(a, a_data);
    			add_location(a, file, 40, 0, 1249);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*onClick*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1024) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[10], dirty, null, null);
    				}
    			}

    			set_attributes(a, a_data = get_spread_update(a_levels, [
    				(!current || dirty & /*href*/ 1) && { href: /*href*/ ctx[0] },
    				(!current || dirty & /*ariaCurrent*/ 4) && { "aria-current": /*ariaCurrent*/ ctx[2] },
    				dirty & /*props*/ 2 && /*props*/ ctx[1]
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $base;
    	let $location;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Link", slots, ['default']);
    	let { to = "#" } = $$props;
    	let { replace = false } = $$props;
    	let { state = {} } = $$props;
    	let { getProps = () => ({}) } = $$props;
    	const { base } = getContext(ROUTER);
    	validate_store(base, "base");
    	component_subscribe($$self, base, value => $$invalidate(14, $base = value));
    	const location = getContext(LOCATION);
    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(15, $location = value));
    	const dispatch = createEventDispatcher();
    	let href, isPartiallyCurrent, isCurrent, props;

    	function onClick(event) {
    		dispatch("click", event);

    		if (shouldNavigate(event)) {
    			event.preventDefault();

    			// Don't push another entry to the history stack when the user
    			// clicks on a Link to the page they are currently on.
    			const shouldReplace = $location.pathname === href || replace;

    			navigate(href, { state, replace: shouldReplace });
    		}
    	}

    	const writable_props = ["to", "replace", "state", "getProps"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Link> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("to" in $$props) $$invalidate(6, to = $$props.to);
    		if ("replace" in $$props) $$invalidate(7, replace = $$props.replace);
    		if ("state" in $$props) $$invalidate(8, state = $$props.state);
    		if ("getProps" in $$props) $$invalidate(9, getProps = $$props.getProps);
    		if ("$$scope" in $$props) $$invalidate(10, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		createEventDispatcher,
    		ROUTER,
    		LOCATION,
    		navigate,
    		startsWith,
    		resolve,
    		shouldNavigate,
    		to,
    		replace,
    		state,
    		getProps,
    		base,
    		location,
    		dispatch,
    		href,
    		isPartiallyCurrent,
    		isCurrent,
    		props,
    		onClick,
    		$base,
    		$location,
    		ariaCurrent
    	});

    	$$self.$inject_state = $$props => {
    		if ("to" in $$props) $$invalidate(6, to = $$props.to);
    		if ("replace" in $$props) $$invalidate(7, replace = $$props.replace);
    		if ("state" in $$props) $$invalidate(8, state = $$props.state);
    		if ("getProps" in $$props) $$invalidate(9, getProps = $$props.getProps);
    		if ("href" in $$props) $$invalidate(0, href = $$props.href);
    		if ("isPartiallyCurrent" in $$props) $$invalidate(12, isPartiallyCurrent = $$props.isPartiallyCurrent);
    		if ("isCurrent" in $$props) $$invalidate(13, isCurrent = $$props.isCurrent);
    		if ("props" in $$props) $$invalidate(1, props = $$props.props);
    		if ("ariaCurrent" in $$props) $$invalidate(2, ariaCurrent = $$props.ariaCurrent);
    	};

    	let ariaCurrent;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*to, $base*/ 16448) {
    			 $$invalidate(0, href = to === "/" ? $base.uri : resolve(to, $base.uri));
    		}

    		if ($$self.$$.dirty & /*$location, href*/ 32769) {
    			 $$invalidate(12, isPartiallyCurrent = startsWith($location.pathname, href));
    		}

    		if ($$self.$$.dirty & /*href, $location*/ 32769) {
    			 $$invalidate(13, isCurrent = href === $location.pathname);
    		}

    		if ($$self.$$.dirty & /*isCurrent*/ 8192) {
    			 $$invalidate(2, ariaCurrent = isCurrent ? "page" : undefined);
    		}

    		if ($$self.$$.dirty & /*getProps, $location, href, isPartiallyCurrent, isCurrent*/ 45569) {
    			 $$invalidate(1, props = getProps({
    				location: $location,
    				href,
    				isPartiallyCurrent,
    				isCurrent
    			}));
    		}
    	};

    	return [
    		href,
    		props,
    		ariaCurrent,
    		base,
    		location,
    		onClick,
    		to,
    		replace,
    		state,
    		getProps,
    		$$scope,
    		slots
    	];
    }

    class Link extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { to: 6, replace: 7, state: 8, getProps: 9 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Link",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get to() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set to(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get replace() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set replace(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get state() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set state(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getProps() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getProps(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, basedir, module) {
    	return module = {
    	  path: basedir,
    	  exports: {},
    	  require: function (path, base) {
          return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
        }
    	}, fn(module, module.exports), module.exports;
    }

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
    }

    var EmailJSResponseStatus_1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EmailJSResponseStatus = void 0;
    var EmailJSResponseStatus = /** @class */ (function () {
        function EmailJSResponseStatus(httpResponse) {
            this.status = httpResponse.status;
            this.text = httpResponse.responseText;
        }
        return EmailJSResponseStatus;
    }());
    exports.EmailJSResponseStatus = EmailJSResponseStatus;
    });

    var UI_1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UI = void 0;
    var UI = /** @class */ (function () {
        function UI() {
        }
        UI.clearAll = function (form) {
            form.classList.remove(this.PROGRESS);
            form.classList.remove(this.DONE);
            form.classList.remove(this.ERROR);
        };
        UI.progressState = function (form) {
            this.clearAll(form);
            form.classList.add(this.PROGRESS);
        };
        UI.successState = function (form) {
            form.classList.remove(this.PROGRESS);
            form.classList.add(this.DONE);
        };
        UI.errorState = function (form) {
            form.classList.remove(this.PROGRESS);
            form.classList.add(this.ERROR);
        };
        UI.PROGRESS = 'emailjs-sending';
        UI.DONE = 'emailjs-success';
        UI.ERROR = 'emailjs-error';
        return UI;
    }());
    exports.UI = UI;
    });

    var source = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EmailJSResponseStatus = exports.sendForm = exports.send = exports.init = void 0;

    Object.defineProperty(exports, "EmailJSResponseStatus", { enumerable: true, get: function () { return EmailJSResponseStatus_1.EmailJSResponseStatus; } });

    var _userID = null;
    var _origin = 'https://api.emailjs.com';
    function sendPost(url, data, headers) {
        if (headers === void 0) { headers = {}; }
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.addEventListener('load', function (event) {
                var responseStatus = new EmailJSResponseStatus_1.EmailJSResponseStatus(event.target);
                if (responseStatus.status === 200 || responseStatus.text === 'OK') {
                    resolve(responseStatus);
                }
                else {
                    reject(responseStatus);
                }
            });
            xhr.addEventListener('error', function (event) {
                reject(new EmailJSResponseStatus_1.EmailJSResponseStatus(event.target));
            });
            xhr.open('POST', url, true);
            for (var key in headers) {
                xhr.setRequestHeader(key, headers[key]);
            }
            xhr.send(data);
        });
    }
    function appendGoogleCaptcha(templatePrams) {
        var element = document && document.getElementById('g-recaptcha-response');
        if (element && element.value) {
            templatePrams['g-recaptcha-response'] = element.value;
        }
        element = null;
        return templatePrams;
    }
    function fixIdSelector(selector) {
        if (selector[0] !== '#') {
            return '#' + selector;
        }
        return selector;
    }
    /**
     * Initiation
     * @param {string} userID - set the EmailJS user ID
     * @param {string} origin - set the EmailJS origin
     */
    function init(userID, origin) {
        _userID = userID;
        _origin = origin || 'https://api.emailjs.com';
    }
    exports.init = init;
    /**
     * Send a template to the specific EmailJS service
     * @param {string} serviceID - the EmailJS service ID
     * @param {string} templateID - the EmailJS template ID
     * @param {Object} templatePrams - the template params, what will be set to the EmailJS template
     * @param {string} userID - the EmailJS user ID
     * @returns {Promise<EmailJSResponseStatus>}
     */
    function send(serviceID, templateID, templatePrams, userID) {
        var params = {
            lib_version: '2.6.3',
            user_id: userID || _userID,
            service_id: serviceID,
            template_id: templateID,
            template_params: appendGoogleCaptcha(templatePrams)
        };
        return sendPost(_origin + '/api/v1.0/email/send', JSON.stringify(params), {
            'Content-type': 'application/json'
        });
    }
    exports.send = send;
    /**
     * Send a form the specific EmailJS service
     * @param {string} serviceID - the EmailJS service ID
     * @param {string} templateID - the EmailJS template ID
     * @param {string | HTMLFormElement} form - the form element or selector
     * @param {string} userID - the EmailJS user ID
     * @returns {Promise<EmailJSResponseStatus>}
     */
    function sendForm(serviceID, templateID, form, userID) {
        if (typeof form === 'string') {
            form = document.querySelector(fixIdSelector(form));
        }
        if (!form || form.nodeName !== 'FORM') {
            throw 'Expected the HTML form element or the style selector of form';
        }
        UI_1.UI.progressState(form);
        var formData = new FormData(form);
        formData.append('lib_version', '2.6.3');
        formData.append('service_id', serviceID);
        formData.append('template_id', templateID);
        formData.append('user_id', userID || _userID);
        return sendPost(_origin + '/api/v1.0/email/send-form', formData)
            .then(function (response) {
            UI_1.UI.successState(form);
            return response;
        }, function (error) {
            UI_1.UI.errorState(form);
            return Promise.reject(error);
        });
    }
    exports.sendForm = sendForm;
    exports.default = {
        init: init,
        send: send,
        sendForm: sendForm
    };
    });

    /* src/JoinMailingList.svelte generated by Svelte v3.29.6 */

    const { console: console_1 } = globals;
    const file$1 = "src/JoinMailingList.svelte";

    // (64:0) {:else}
    function create_else_block$1(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Join Mailing List";
    			attr_dev(button, "class", "button is-primary");
    			add_location(button, file$1, 64, 2, 1427);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler_1*/ ctx[7], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(64:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (27:0) {#if isOpen}
    function create_if_block$1(ctx) {
    	let div;
    	let input0;
    	let t0;
    	let input1;
    	let t1;
    	let button;
    	let t2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			input0 = element("input");
    			t0 = space();
    			input1 = element("input");
    			t1 = space();
    			button = element("button");
    			t2 = text("Join Mailing List");
    			attr_dev(input0, "class", "input is-primary svelte-1vqeijs");
    			attr_dev(input0, "type", "name");
    			attr_dev(input0, "placeholder", "Name");
    			add_location(input0, file$1, 28, 4, 437);
    			attr_dev(input1, "class", "input is-primary svelte-1vqeijs");
    			attr_dev(input1, "type", "email");
    			attr_dev(input1, "placeholder", "Email");
    			add_location(input1, file$1, 33, 4, 555);
    			button.disabled = /*sending*/ ctx[2];
    			attr_dev(button, "class", "button is-primary");
    			add_location(button, file$1, 38, 4, 676);
    			attr_dev(div, "class", "bottom-holder svelte-1vqeijs");
    			add_location(div, file$1, 27, 2, 405);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input0);
    			set_input_value(input0, /*$user*/ ctx[3].name);
    			append_dev(div, t0);
    			append_dev(div, input1);
    			set_input_value(input1, /*$user*/ ctx[3].email);
    			append_dev(div, t1);
    			append_dev(div, button);
    			append_dev(button, t2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[4]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[5]),
    					listen_dev(button, "click", /*click_handler*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$user*/ 8) {
    				set_input_value(input0, /*$user*/ ctx[3].name);
    			}

    			if (dirty & /*$user*/ 8 && input1.value !== /*$user*/ ctx[3].email) {
    				set_input_value(input1, /*$user*/ ctx[3].email);
    			}

    			if (dirty & /*sending*/ 4) {
    				prop_dev(button, "disabled", /*sending*/ ctx[2]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(27:0) {#if isOpen}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*isOpen*/ ctx[1]) return create_if_block$1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $user,
    		$$unsubscribe_user = noop,
    		$$subscribe_user = () => ($$unsubscribe_user(), $$unsubscribe_user = subscribe(user, $$value => $$invalidate(3, $user = $$value)), user);

    	$$self.$$.on_destroy.push(() => $$unsubscribe_user());
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("JoinMailingList", slots, []);

    	const user = writable({
    		name: "",
    		// phone: "11 972393003",
    		email: ""
    	});

    	validate_store(user, "user");
    	$$subscribe_user();
    	let isOpen = true;
    	let sending = false;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<JoinMailingList> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		$user.name = this.value;
    		user.set($user);
    	}

    	function input1_input_handler() {
    		$user.email = this.value;
    		user.set($user);
    	}

    	const click_handler = () => {
    		$$invalidate(2, sending = true);

    		source.send(
    			{"env":{"isProd":false,"npm_package_devDependencies_rollup_plugin_terser":"^7.0.0","npm_package_devDependencies_rollup_plugin_svelte":"^6.0.0","TERM_PROGRAM":"vscode","NODE":"/usr/local/bin/node","INIT_CWD":"/Users/tnrich/Sites/lumina","npm_config_version_git_tag":"true","TERM":"xterm-256color","SHELL":"/bin/zsh","TMPDIR":"/var/folders/4x/mpwfvxr17szdw0q4pb0d59b40000gn/T/","trc":"teselagen-react-components","npm_config_init_license":"MIT","npm_config_email":"team@teselagen.com","TERM_PROGRAM_VERSION":"1.50.1","npm_package_scripts_dev":"rollup -c -w","ORIGINAL_XDG_CURRENT_DESKTOP":"undefined","npm_package_devDependencies__rollup_plugin_replace":"^2.3.4","npm_config_registry":"https://registry.yarnpkg.com","npm_package_readmeFilename":"README.md","USER":"tnrich","npm_package_description":"This is a project template for [Svelte](https://svelte.dev) apps. It lives at https://github.com/sveltejs/template.","npm_config_python":"/usr/bin/python","COMMAND_MODE":"unix2003","npm_package_dependencies_emailjs_com":"^2.6.3","SSH_AUTH_SOCK":"/private/tmp/com.apple.launchd.TFOLbOk9c1/Listeners","npm_package_devDependencies__rollup_plugin_commonjs":"^14.0.0","__CF_USER_TEXT_ENCODING":"0x1F5:0x0:0x0","npm_execpath":"/usr/local/Cellar/yarn/1.17.3/libexec/bin/yarn.js","npm_package_devDependencies_svelte":"^3.0.0","npm_package_dependencies_sirv_cli":"^1.0.0","SENCHA_CMD_3_0_0":"/Users/tnrich/bin/Sencha/Cmd/4.0.4.84","PATH":"/var/folders/4x/mpwfvxr17szdw0q4pb0d59b40000gn/T/yarn--1604971838231-0.9450962261722899:/Users/tnrich/Sites/lumina/node_modules/.bin:/Users/tnrich/.config/yarn/link/node_modules/.bin:/usr/local/libexec/lib/node_modules/npm/bin/node-gyp-bin:/usr/local/lib/node_modules/npm/bin/node-gyp-bin:/usr/local/bin/node_modules/npm/bin/node-gyp-bin:/Users/tnrich/Documents/google-cloud-sdk/bin:/Users/tnrich/bin/Sencha/Cmd/4.0.4.84:./node_modules/.bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/Library/Apple/usr/bin:/Users/tnrich/Documents/google-cloud-sdk/bin:/Users/tnrich/bin/Sencha/Cmd/4.0.4.84:./node_modules/.bin:/usr/local/sbin:/usr/local/bin:/usr/local/sbin","npm_config_argv":"{\"remain\":[],\"cooked\":[\"run\",\"dev\"],\"original\":[\"--ignore-engines\",\"dev\"]}","npm_package_devDependencies_rollup":"^2.3.4","_":"/Users/tnrich/Sites/lumina/node_modules/.bin/rollup","PWD":"/Users/tnrich/Sites/lumina","npm_package_devDependencies__rollup_plugin_node_resolve":"^8.0.0","npm_lifecycle_event":"dev","LANG":"en_US.UTF-8","LOCAL_GIT_DIRECTORY":"/Applications/GitHub Desktop.app/Contents/Resources/app/git","npm_package_name":"svelte-app","npm_package_scripts_start":"sirv public --single","npm_package_scripts_build":"rollup -c","npm_config_version_commit_hooks":"true","XPC_FLAGS":"0x0","npm_config_username":"teselagen","npm_config_bin_links":"true","npm_package_dependencies__beyonk_svelte_carousel":"^2.8.0","XPC_SERVICE_NAME":"0","npm_package_version":"1.0.0","SHLVL":"2","HOME":"/Users/tnrich","VSCODE_GIT_ASKPASS_MAIN":"/Applications/Visual Studio Code.app/Contents/Resources/app/extensions/git/dist/askpass-main.js","APPLICATION_INSIGHTS_NO_DIAGNOSTIC_CHANNEL":"true","npm_config_save_prefix":"^","npm_config_strict_ssl":"true","npm_config_version_git_message":"v%s","NPM_CONFIG_PYTHON":"/usr/bin/python","LOGNAME":"tnrich","YARN_WRAP_OUTPUT":"false","PREFIX":"/usr/local","npm_lifecycle_script":"rollup -c -w","VSCODE_GIT_IPC_HANDLE":"/var/folders/4x/mpwfvxr17szdw0q4pb0d59b40000gn/T/vscode-git-24b242e186.sock","npm_package_dependencies_bulma":"^0.9.1","npm_config_version_git_sign":"","npm_config_ignore_scripts":"","npm_config_user_agent":"yarn/1.17.3 npm/? node/v10.16.3 darwin x64","VSCODE_GIT_ASKPASS_NODE":"/Applications/Visual Studio Code.app/Contents/Frameworks/Code Helper (Renderer).app/Contents/MacOS/Code Helper (Renderer)","GIT_ASKPASS":"/Applications/Visual Studio Code.app/Contents/Resources/app/extensions/git/dist/askpass.sh","npm_config_init_version":"1.0.0","npm_config_ignore_optional":"","npm_package_devDependencies_rollup_plugin_livereload":"^2.0.0","COLORTERM":"truecolor","npm_node_execpath":"/usr/local/bin/node","npm_package_dependencies_svelte_routing":"^1.4.2","npm_config_version_tag_prefix":"v","ROLLUP_WATCH":"true"}}.env.service_id,
    			{"env":{"isProd":false,"npm_package_devDependencies_rollup_plugin_terser":"^7.0.0","npm_package_devDependencies_rollup_plugin_svelte":"^6.0.0","TERM_PROGRAM":"vscode","NODE":"/usr/local/bin/node","INIT_CWD":"/Users/tnrich/Sites/lumina","npm_config_version_git_tag":"true","TERM":"xterm-256color","SHELL":"/bin/zsh","TMPDIR":"/var/folders/4x/mpwfvxr17szdw0q4pb0d59b40000gn/T/","trc":"teselagen-react-components","npm_config_init_license":"MIT","npm_config_email":"team@teselagen.com","TERM_PROGRAM_VERSION":"1.50.1","npm_package_scripts_dev":"rollup -c -w","ORIGINAL_XDG_CURRENT_DESKTOP":"undefined","npm_package_devDependencies__rollup_plugin_replace":"^2.3.4","npm_config_registry":"https://registry.yarnpkg.com","npm_package_readmeFilename":"README.md","USER":"tnrich","npm_package_description":"This is a project template for [Svelte](https://svelte.dev) apps. It lives at https://github.com/sveltejs/template.","npm_config_python":"/usr/bin/python","COMMAND_MODE":"unix2003","npm_package_dependencies_emailjs_com":"^2.6.3","SSH_AUTH_SOCK":"/private/tmp/com.apple.launchd.TFOLbOk9c1/Listeners","npm_package_devDependencies__rollup_plugin_commonjs":"^14.0.0","__CF_USER_TEXT_ENCODING":"0x1F5:0x0:0x0","npm_execpath":"/usr/local/Cellar/yarn/1.17.3/libexec/bin/yarn.js","npm_package_devDependencies_svelte":"^3.0.0","npm_package_dependencies_sirv_cli":"^1.0.0","SENCHA_CMD_3_0_0":"/Users/tnrich/bin/Sencha/Cmd/4.0.4.84","PATH":"/var/folders/4x/mpwfvxr17szdw0q4pb0d59b40000gn/T/yarn--1604971838231-0.9450962261722899:/Users/tnrich/Sites/lumina/node_modules/.bin:/Users/tnrich/.config/yarn/link/node_modules/.bin:/usr/local/libexec/lib/node_modules/npm/bin/node-gyp-bin:/usr/local/lib/node_modules/npm/bin/node-gyp-bin:/usr/local/bin/node_modules/npm/bin/node-gyp-bin:/Users/tnrich/Documents/google-cloud-sdk/bin:/Users/tnrich/bin/Sencha/Cmd/4.0.4.84:./node_modules/.bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/Library/Apple/usr/bin:/Users/tnrich/Documents/google-cloud-sdk/bin:/Users/tnrich/bin/Sencha/Cmd/4.0.4.84:./node_modules/.bin:/usr/local/sbin:/usr/local/bin:/usr/local/sbin","npm_config_argv":"{\"remain\":[],\"cooked\":[\"run\",\"dev\"],\"original\":[\"--ignore-engines\",\"dev\"]}","npm_package_devDependencies_rollup":"^2.3.4","_":"/Users/tnrich/Sites/lumina/node_modules/.bin/rollup","PWD":"/Users/tnrich/Sites/lumina","npm_package_devDependencies__rollup_plugin_node_resolve":"^8.0.0","npm_lifecycle_event":"dev","LANG":"en_US.UTF-8","LOCAL_GIT_DIRECTORY":"/Applications/GitHub Desktop.app/Contents/Resources/app/git","npm_package_name":"svelte-app","npm_package_scripts_start":"sirv public --single","npm_package_scripts_build":"rollup -c","npm_config_version_commit_hooks":"true","XPC_FLAGS":"0x0","npm_config_username":"teselagen","npm_config_bin_links":"true","npm_package_dependencies__beyonk_svelte_carousel":"^2.8.0","XPC_SERVICE_NAME":"0","npm_package_version":"1.0.0","SHLVL":"2","HOME":"/Users/tnrich","VSCODE_GIT_ASKPASS_MAIN":"/Applications/Visual Studio Code.app/Contents/Resources/app/extensions/git/dist/askpass-main.js","APPLICATION_INSIGHTS_NO_DIAGNOSTIC_CHANNEL":"true","npm_config_save_prefix":"^","npm_config_strict_ssl":"true","npm_config_version_git_message":"v%s","NPM_CONFIG_PYTHON":"/usr/bin/python","LOGNAME":"tnrich","YARN_WRAP_OUTPUT":"false","PREFIX":"/usr/local","npm_lifecycle_script":"rollup -c -w","VSCODE_GIT_IPC_HANDLE":"/var/folders/4x/mpwfvxr17szdw0q4pb0d59b40000gn/T/vscode-git-24b242e186.sock","npm_package_dependencies_bulma":"^0.9.1","npm_config_version_git_sign":"","npm_config_ignore_scripts":"","npm_config_user_agent":"yarn/1.17.3 npm/? node/v10.16.3 darwin x64","VSCODE_GIT_ASKPASS_NODE":"/Applications/Visual Studio Code.app/Contents/Frameworks/Code Helper (Renderer).app/Contents/MacOS/Code Helper (Renderer)","GIT_ASKPASS":"/Applications/Visual Studio Code.app/Contents/Resources/app/extensions/git/dist/askpass.sh","npm_config_init_version":"1.0.0","npm_config_ignore_optional":"","npm_package_devDependencies_rollup_plugin_livereload":"^2.0.0","COLORTERM":"truecolor","npm_node_execpath":"/usr/local/bin/node","npm_package_dependencies_svelte_routing":"^1.4.2","npm_config_version_tag_prefix":"v","ROLLUP_WATCH":"true"}}.env.template_id,
    			{
    				from_name: $user.name,
    				message: $user.email
    			},
    			{"env":{"isProd":false,"npm_package_devDependencies_rollup_plugin_terser":"^7.0.0","npm_package_devDependencies_rollup_plugin_svelte":"^6.0.0","TERM_PROGRAM":"vscode","NODE":"/usr/local/bin/node","INIT_CWD":"/Users/tnrich/Sites/lumina","npm_config_version_git_tag":"true","TERM":"xterm-256color","SHELL":"/bin/zsh","TMPDIR":"/var/folders/4x/mpwfvxr17szdw0q4pb0d59b40000gn/T/","trc":"teselagen-react-components","npm_config_init_license":"MIT","npm_config_email":"team@teselagen.com","TERM_PROGRAM_VERSION":"1.50.1","npm_package_scripts_dev":"rollup -c -w","ORIGINAL_XDG_CURRENT_DESKTOP":"undefined","npm_package_devDependencies__rollup_plugin_replace":"^2.3.4","npm_config_registry":"https://registry.yarnpkg.com","npm_package_readmeFilename":"README.md","USER":"tnrich","npm_package_description":"This is a project template for [Svelte](https://svelte.dev) apps. It lives at https://github.com/sveltejs/template.","npm_config_python":"/usr/bin/python","COMMAND_MODE":"unix2003","npm_package_dependencies_emailjs_com":"^2.6.3","SSH_AUTH_SOCK":"/private/tmp/com.apple.launchd.TFOLbOk9c1/Listeners","npm_package_devDependencies__rollup_plugin_commonjs":"^14.0.0","__CF_USER_TEXT_ENCODING":"0x1F5:0x0:0x0","npm_execpath":"/usr/local/Cellar/yarn/1.17.3/libexec/bin/yarn.js","npm_package_devDependencies_svelte":"^3.0.0","npm_package_dependencies_sirv_cli":"^1.0.0","SENCHA_CMD_3_0_0":"/Users/tnrich/bin/Sencha/Cmd/4.0.4.84","PATH":"/var/folders/4x/mpwfvxr17szdw0q4pb0d59b40000gn/T/yarn--1604971838231-0.9450962261722899:/Users/tnrich/Sites/lumina/node_modules/.bin:/Users/tnrich/.config/yarn/link/node_modules/.bin:/usr/local/libexec/lib/node_modules/npm/bin/node-gyp-bin:/usr/local/lib/node_modules/npm/bin/node-gyp-bin:/usr/local/bin/node_modules/npm/bin/node-gyp-bin:/Users/tnrich/Documents/google-cloud-sdk/bin:/Users/tnrich/bin/Sencha/Cmd/4.0.4.84:./node_modules/.bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/Library/Apple/usr/bin:/Users/tnrich/Documents/google-cloud-sdk/bin:/Users/tnrich/bin/Sencha/Cmd/4.0.4.84:./node_modules/.bin:/usr/local/sbin:/usr/local/bin:/usr/local/sbin","npm_config_argv":"{\"remain\":[],\"cooked\":[\"run\",\"dev\"],\"original\":[\"--ignore-engines\",\"dev\"]}","npm_package_devDependencies_rollup":"^2.3.4","_":"/Users/tnrich/Sites/lumina/node_modules/.bin/rollup","PWD":"/Users/tnrich/Sites/lumina","npm_package_devDependencies__rollup_plugin_node_resolve":"^8.0.0","npm_lifecycle_event":"dev","LANG":"en_US.UTF-8","LOCAL_GIT_DIRECTORY":"/Applications/GitHub Desktop.app/Contents/Resources/app/git","npm_package_name":"svelte-app","npm_package_scripts_start":"sirv public --single","npm_package_scripts_build":"rollup -c","npm_config_version_commit_hooks":"true","XPC_FLAGS":"0x0","npm_config_username":"teselagen","npm_config_bin_links":"true","npm_package_dependencies__beyonk_svelte_carousel":"^2.8.0","XPC_SERVICE_NAME":"0","npm_package_version":"1.0.0","SHLVL":"2","HOME":"/Users/tnrich","VSCODE_GIT_ASKPASS_MAIN":"/Applications/Visual Studio Code.app/Contents/Resources/app/extensions/git/dist/askpass-main.js","APPLICATION_INSIGHTS_NO_DIAGNOSTIC_CHANNEL":"true","npm_config_save_prefix":"^","npm_config_strict_ssl":"true","npm_config_version_git_message":"v%s","NPM_CONFIG_PYTHON":"/usr/bin/python","LOGNAME":"tnrich","YARN_WRAP_OUTPUT":"false","PREFIX":"/usr/local","npm_lifecycle_script":"rollup -c -w","VSCODE_GIT_IPC_HANDLE":"/var/folders/4x/mpwfvxr17szdw0q4pb0d59b40000gn/T/vscode-git-24b242e186.sock","npm_package_dependencies_bulma":"^0.9.1","npm_config_version_git_sign":"","npm_config_ignore_scripts":"","npm_config_user_agent":"yarn/1.17.3 npm/? node/v10.16.3 darwin x64","VSCODE_GIT_ASKPASS_NODE":"/Applications/Visual Studio Code.app/Contents/Frameworks/Code Helper (Renderer).app/Contents/MacOS/Code Helper (Renderer)","GIT_ASKPASS":"/Applications/Visual Studio Code.app/Contents/Resources/app/extensions/git/dist/askpass.sh","npm_config_init_version":"1.0.0","npm_config_ignore_optional":"","npm_package_devDependencies_rollup_plugin_livereload":"^2.0.0","COLORTERM":"truecolor","npm_node_execpath":"/usr/local/bin/node","npm_package_dependencies_svelte_routing":"^1.4.2","npm_config_version_tag_prefix":"v","ROLLUP_WATCH":"true"}}.env.emailjs_user_id
    		).then(
    			response => {
    				$$invalidate(2, sending = false);
    				console.log("SUCCESS!", response.status, response.text);
    			},
    			err => {
    				$$invalidate(2, sending = false);
    				console.log("FAILED...", err);
    			}
    		);
    	};

    	const click_handler_1 = () => {
    		$$invalidate(1, isOpen = !isOpen);
    	};

    	$$self.$capture_state = () => ({
    		writable,
    		emailjs: source,
    		user,
    		isOpen,
    		sending,
    		$user
    	});

    	$$self.$inject_state = $$props => {
    		if ("isOpen" in $$props) $$invalidate(1, isOpen = $$props.isOpen);
    		if ("sending" in $$props) $$invalidate(2, sending = $$props.sending);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		user,
    		isOpen,
    		sending,
    		$user,
    		input0_input_handler,
    		input1_input_handler,
    		click_handler,
    		click_handler_1
    	];
    }

    class JoinMailingList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { user: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "JoinMailingList",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get user() {
    		return this.$$.ctx[0];
    	}

    	set user(value) {
    		throw new Error("<JoinMailingList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Home.svelte generated by Svelte v3.29.6 */
    const file$2 = "src/Home.svelte";

    function create_fragment$4(ctx) {
    	let main;
    	let div;
    	let br0;
    	let t0;
    	let br1;
    	let t1;
    	let h1;
    	let t3;
    	let h2;
    	let t5;
    	let joinmailinglist;
    	let current;
    	joinmailinglist = new JoinMailingList({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			br0 = element("br");
    			t0 = space();
    			br1 = element("br");
    			t1 = space();
    			h1 = element("h1");
    			h1.textContent = "Lumina Wines";
    			t3 = space();
    			h2 = element("h2");
    			h2.textContent = "Pressin' Dat Juice since 2019";
    			t5 = space();
    			create_component(joinmailinglist.$$.fragment);
    			add_location(br0, file$2, 24, 4, 354);
    			add_location(br1, file$2, 25, 4, 363);
    			attr_dev(h1, "class", "header-top");
    			add_location(h1, file$2, 26, 4, 372);
    			add_location(h2, file$2, 27, 4, 417);
    			add_location(div, file$2, 23, 2, 344);
    			attr_dev(main, "class", "svelte-1y7fbis");
    			add_location(main, file$2, 22, 0, 335);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			append_dev(div, br0);
    			append_dev(div, t0);
    			append_dev(div, br1);
    			append_dev(div, t1);
    			append_dev(div, h1);
    			append_dev(div, t3);
    			append_dev(div, h2);
    			append_dev(main, t5);
    			mount_component(joinmailinglist, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(joinmailinglist.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(joinmailinglist.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(joinmailinglist);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Home", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ JoinMailingList });
    	return [];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/Story.svelte generated by Svelte v3.29.6 */

    const file$3 = "src/Story.svelte";

    function create_fragment$5(ctx) {
    	let main;
    	let br0;
    	let t0;
    	let br1;
    	let t1;
    	let h1;
    	let t3;
    	let h2;
    	let t5;
    	let div4;
    	let img0;
    	let img0_src_value;
    	let t6;
    	let div0;
    	let t8;
    	let img1;
    	let img1_src_value;
    	let t9;
    	let div1;
    	let t11;
    	let img2;
    	let img2_src_value;
    	let t12;
    	let div2;
    	let t14;
    	let img3;
    	let img3_src_value;
    	let t15;
    	let div3;

    	const block = {
    		c: function create() {
    			main = element("main");
    			br0 = element("br");
    			t0 = space();
    			br1 = element("br");
    			t1 = space();
    			h1 = element("h1");
    			h1.textContent = "Story";
    			t3 = space();
    			h2 = element("h2");
    			h2.textContent = "A bit about where I come from and what my journey has been";
    			t5 = space();
    			div4 = element("div");
    			img0 = element("img");
    			t6 = space();
    			div0 = element("div");
    			div0.textContent = "I like spicy things! I'm always using too much hot sauce..";
    			t8 = space();
    			img1 = element("img");
    			t9 = space();
    			div1 = element("div");
    			div1.textContent = "This is my best friend Tay! She and I do everything together!";
    			t11 = space();
    			img2 = element("img");
    			t12 = space();
    			div2 = element("div");
    			div2.textContent = "This is my soon to be hubby! Love you boo!";
    			t14 = space();
    			img3 = element("img");
    			t15 = space();
    			div3 = element("div");
    			div3.textContent = "This is the family I live with!";
    			add_location(br0, file$3, 26, 2, 321);
    			add_location(br1, file$3, 27, 2, 330);
    			attr_dev(h1, "class", "header-top");
    			add_location(h1, file$3, 28, 2, 339);
    			add_location(h2, file$3, 29, 2, 375);
    			attr_dev(img0, "alt", "2");
    			if (img0.src !== (img0_src_value = "/photos/4.jpg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "class", "svelte-ichxbw");
    			add_location(img0, file$3, 31, 4, 475);
    			add_location(div0, file$3, 32, 4, 517);
    			attr_dev(img1, "alt", "2");
    			if (img1.src !== (img1_src_value = "/photos/2.jpg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "class", "svelte-ichxbw");
    			add_location(img1, file$3, 33, 4, 591);
    			add_location(div1, file$3, 34, 4, 633);
    			attr_dev(img2, "alt", "1");
    			if (img2.src !== (img2_src_value = "/photos/1.jpg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "class", "svelte-ichxbw");
    			add_location(img2, file$3, 35, 4, 710);
    			add_location(div2, file$3, 36, 4, 752);
    			attr_dev(img3, "alt", "2");
    			if (img3.src !== (img3_src_value = "/photos/3.jpg")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "class", "svelte-ichxbw");
    			add_location(img3, file$3, 37, 4, 810);
    			add_location(div3, file$3, 38, 4, 852);
    			attr_dev(div4, "class", "photoholder");
    			add_location(div4, file$3, 30, 2, 445);
    			attr_dev(main, "class", "svelte-ichxbw");
    			add_location(main, file$3, 25, 0, 312);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, br0);
    			append_dev(main, t0);
    			append_dev(main, br1);
    			append_dev(main, t1);
    			append_dev(main, h1);
    			append_dev(main, t3);
    			append_dev(main, h2);
    			append_dev(main, t5);
    			append_dev(main, div4);
    			append_dev(div4, img0);
    			append_dev(div4, t6);
    			append_dev(div4, div0);
    			append_dev(div4, t8);
    			append_dev(div4, img1);
    			append_dev(div4, t9);
    			append_dev(div4, div1);
    			append_dev(div4, t11);
    			append_dev(div4, img2);
    			append_dev(div4, t12);
    			append_dev(div4, div2);
    			append_dev(div4, t14);
    			append_dev(div4, img3);
    			append_dev(div4, t15);
    			append_dev(div4, div3);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Story", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Story> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Story extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Story",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/Nav.svelte generated by Svelte v3.29.6 */

    const file$4 = "src/Nav.svelte";

    function create_fragment$6(ctx) {
    	let div;
    	let input;
    	let t0;
    	let label0;
    	let t1;
    	let label1;
    	let t2;
    	let ul;
    	let li0;
    	let a0;
    	let t4;
    	let li1;
    	let a1;
    	let t6;
    	let li2;
    	let a2;
    	let t8;
    	let li3;
    	let a3;
    	let t10;
    	let li4;
    	let a4;

    	const block = {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			t0 = space();
    			label0 = element("label");
    			t1 = space();
    			label1 = element("label");
    			t2 = space();
    			ul = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			a0.textContent = "Home";
    			t4 = space();
    			li1 = element("li");
    			a1 = element("a");
    			a1.textContent = "Story";
    			t6 = space();
    			li2 = element("li");
    			a2 = element("a");
    			a2.textContent = "Shop";
    			t8 = space();
    			li3 = element("li");
    			a3 = element("a");
    			a3.textContent = "Gallery";
    			t10 = space();
    			li4 = element("li");
    			a4 = element("a");
    			a4.textContent = "Instagram";
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "id", "menu-toggle");
    			attr_dev(input, "class", "svelte-1a77yzp");
    			add_location(input, file$4, 133, 2, 2546);
    			attr_dev(label0, "id", "trigger");
    			attr_dev(label0, "for", "menu-toggle");
    			attr_dev(label0, "class", "svelte-1a77yzp");
    			add_location(label0, file$4, 134, 2, 2591);
    			attr_dev(label1, "id", "burger");
    			attr_dev(label1, "for", "menu-toggle");
    			attr_dev(label1, "class", "svelte-1a77yzp");
    			add_location(label1, file$4, 135, 2, 2634);
    			attr_dev(a0, "href", "/");
    			attr_dev(a0, "class", "svelte-1a77yzp");
    			add_location(a0, file$4, 137, 8, 2699);
    			attr_dev(li0, "class", "svelte-1a77yzp");
    			add_location(li0, file$4, 137, 4, 2695);
    			attr_dev(a1, "href", "/story");
    			attr_dev(a1, "class", "svelte-1a77yzp");
    			add_location(a1, file$4, 138, 8, 2733);
    			attr_dev(li1, "class", "svelte-1a77yzp");
    			add_location(li1, file$4, 138, 4, 2729);
    			attr_dev(a2, "href", "/shop");
    			attr_dev(a2, "class", "svelte-1a77yzp");
    			add_location(a2, file$4, 139, 8, 2773);
    			attr_dev(li2, "class", "svelte-1a77yzp");
    			add_location(li2, file$4, 139, 4, 2769);
    			attr_dev(a3, "href", "/gallery");
    			attr_dev(a3, "class", "svelte-1a77yzp");
    			add_location(a3, file$4, 140, 8, 2811);
    			attr_dev(li3, "class", "svelte-1a77yzp");
    			add_location(li3, file$4, 140, 4, 2807);
    			attr_dev(a4, "href", "https://www.instagram.com/luminawines/");
    			attr_dev(a4, "class", "svelte-1a77yzp");
    			add_location(a4, file$4, 141, 8, 2855);
    			attr_dev(li4, "class", "svelte-1a77yzp");
    			add_location(li4, file$4, 141, 4, 2851);
    			attr_dev(ul, "id", "menu");
    			attr_dev(ul, "class", "svelte-1a77yzp");
    			add_location(ul, file$4, 136, 2, 2676);
    			add_location(div, file$4, 132, 0, 2538);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);
    			append_dev(div, t0);
    			append_dev(div, label0);
    			append_dev(div, t1);
    			append_dev(div, label1);
    			append_dev(div, t2);
    			append_dev(div, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a0);
    			append_dev(ul, t4);
    			append_dev(ul, li1);
    			append_dev(li1, a1);
    			append_dev(ul, t6);
    			append_dev(ul, li2);
    			append_dev(li2, a2);
    			append_dev(ul, t8);
    			append_dev(ul, li3);
    			append_dev(li3, a3);
    			append_dev(ul, t10);
    			append_dev(ul, li4);
    			append_dev(li4, a4);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Nav", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Nav> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Nav extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Nav",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/Shop.svelte generated by Svelte v3.29.6 */

    const file$5 = "src/Shop.svelte";

    function create_fragment$7(ctx) {
    	let main;
    	let br0;
    	let t0;
    	let br1;
    	let t1;
    	let h1;
    	let t3;
    	let h2;

    	const block = {
    		c: function create() {
    			main = element("main");
    			br0 = element("br");
    			t0 = space();
    			br1 = element("br");
    			t1 = space();
    			h1 = element("h1");
    			h1.textContent = "Shop!";
    			t3 = space();
    			h2 = element("h2");
    			h2.textContent = "I'm only selling 2 varietals of wine at the momement. Swag will arrive soon!";
    			add_location(br0, file$5, 20, 2, 245);
    			add_location(br1, file$5, 21, 2, 254);
    			attr_dev(h1, "class", "header-top");
    			add_location(h1, file$5, 22, 2, 263);
    			add_location(h2, file$5, 23, 2, 299);
    			attr_dev(main, "class", "svelte-itr1vx");
    			add_location(main, file$5, 19, 0, 236);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, br0);
    			append_dev(main, t0);
    			append_dev(main, br1);
    			append_dev(main, t1);
    			append_dev(main, h1);
    			append_dev(main, t3);
    			append_dev(main, h2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Shop", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Shop> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Shop extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Shop",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    var siema_min = createCommonjsModule(function (module, exports) {
    !function(e,t){module.exports=t();}("undefined"!=typeof self?self:commonjsGlobal,function(){return function(e){function t(r){if(i[r])return i[r].exports;var n=i[r]={i:r,l:!1,exports:{}};return e[r].call(n.exports,n,n.exports,t),n.l=!0,n.exports}var i={};return t.m=e,t.c=i,t.d=function(e,i,r){t.o(e,i)||Object.defineProperty(e,i,{configurable:!1,enumerable:!0,get:r});},t.n=function(e){var i=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(i,"a",i),i},t.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},t.p="",t(t.s=0)}([function(e,t,i){function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var n="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},s=function(){function e(e,t){for(var i=0;i<t.length;i++){var r=t[i];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r);}}return function(t,i,r){return i&&e(t.prototype,i),r&&e(t,r),t}}(),l=function(){function e(t){var i=this;if(r(this,e),this.config=e.mergeSettings(t),this.selector="string"==typeof this.config.selector?document.querySelector(this.config.selector):this.config.selector,null===this.selector)throw new Error("Something wrong with your selector 😭");this.resolveSlidesNumber(),this.selectorWidth=this.selector.offsetWidth,this.innerElements=[].slice.call(this.selector.children),this.currentSlide=this.config.loop?this.config.startIndex%this.innerElements.length:Math.max(0,Math.min(this.config.startIndex,this.innerElements.length-this.perPage)),this.transformProperty=e.webkitOrNot(),["resizeHandler","touchstartHandler","touchendHandler","touchmoveHandler","mousedownHandler","mouseupHandler","mouseleaveHandler","mousemoveHandler","clickHandler"].forEach(function(e){i[e]=i[e].bind(i);}),this.init();}return s(e,[{key:"attachEvents",value:function(){window.addEventListener("resize",this.resizeHandler),this.config.draggable&&(this.pointerDown=!1,this.drag={startX:0,endX:0,startY:0,letItGo:null,preventClick:!1},this.selector.addEventListener("touchstart",this.touchstartHandler),this.selector.addEventListener("touchend",this.touchendHandler),this.selector.addEventListener("touchmove",this.touchmoveHandler),this.selector.addEventListener("mousedown",this.mousedownHandler),this.selector.addEventListener("mouseup",this.mouseupHandler),this.selector.addEventListener("mouseleave",this.mouseleaveHandler),this.selector.addEventListener("mousemove",this.mousemoveHandler),this.selector.addEventListener("click",this.clickHandler));}},{key:"detachEvents",value:function(){window.removeEventListener("resize",this.resizeHandler),this.selector.removeEventListener("touchstart",this.touchstartHandler),this.selector.removeEventListener("touchend",this.touchendHandler),this.selector.removeEventListener("touchmove",this.touchmoveHandler),this.selector.removeEventListener("mousedown",this.mousedownHandler),this.selector.removeEventListener("mouseup",this.mouseupHandler),this.selector.removeEventListener("mouseleave",this.mouseleaveHandler),this.selector.removeEventListener("mousemove",this.mousemoveHandler),this.selector.removeEventListener("click",this.clickHandler);}},{key:"init",value:function(){this.attachEvents(),this.selector.style.overflow="hidden",this.selector.style.direction=this.config.rtl?"rtl":"ltr",this.buildSliderFrame(),this.config.onInit.call(this);}},{key:"buildSliderFrame",value:function(){var e=this.selectorWidth/this.perPage,t=this.config.loop?this.innerElements.length+2*this.perPage:this.innerElements.length;this.sliderFrame=document.createElement("div"),this.sliderFrame.style.width=e*t+"px",this.enableTransition(),this.config.draggable&&(this.selector.style.cursor="-webkit-grab");var i=document.createDocumentFragment();if(this.config.loop)for(var r=this.innerElements.length-this.perPage;r<this.innerElements.length;r++){var n=this.buildSliderFrameItem(this.innerElements[r].cloneNode(!0));i.appendChild(n);}for(var s=0;s<this.innerElements.length;s++){var l=this.buildSliderFrameItem(this.innerElements[s]);i.appendChild(l);}if(this.config.loop)for(var o=0;o<this.perPage;o++){var a=this.buildSliderFrameItem(this.innerElements[o].cloneNode(!0));i.appendChild(a);}this.sliderFrame.appendChild(i),this.selector.innerHTML="",this.selector.appendChild(this.sliderFrame),this.slideToCurrent();}},{key:"buildSliderFrameItem",value:function(e){var t=document.createElement("div");return t.style.cssFloat=this.config.rtl?"right":"left",t.style.float=this.config.rtl?"right":"left",t.style.width=(this.config.loop?100/(this.innerElements.length+2*this.perPage):100/this.innerElements.length)+"%",t.appendChild(e),t}},{key:"resolveSlidesNumber",value:function(){if("number"==typeof this.config.perPage)this.perPage=this.config.perPage;else if("object"===n(this.config.perPage)){this.perPage=1;for(var e in this.config.perPage)window.innerWidth>=e&&(this.perPage=this.config.perPage[e]);}}},{key:"prev",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:1,t=arguments[1];if(!(this.innerElements.length<=this.perPage)){var i=this.currentSlide;if(this.config.loop){if(this.currentSlide-e<0){this.disableTransition();var r=this.currentSlide+this.innerElements.length,n=this.perPage,s=r+n,l=(this.config.rtl?1:-1)*s*(this.selectorWidth/this.perPage),o=this.config.draggable?this.drag.endX-this.drag.startX:0;this.sliderFrame.style[this.transformProperty]="translate3d("+(l+o)+"px, 0, 0)",this.currentSlide=r-e;}else this.currentSlide=this.currentSlide-e;}else this.currentSlide=Math.max(this.currentSlide-e,0);i!==this.currentSlide&&(this.slideToCurrent(this.config.loop),this.config.onChange.call(this),t&&t.call(this));}}},{key:"next",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:1,t=arguments[1];if(!(this.innerElements.length<=this.perPage)){var i=this.currentSlide;if(this.config.loop){if(this.currentSlide+e>this.innerElements.length-this.perPage){this.disableTransition();var r=this.currentSlide-this.innerElements.length,n=this.perPage,s=r+n,l=(this.config.rtl?1:-1)*s*(this.selectorWidth/this.perPage),o=this.config.draggable?this.drag.endX-this.drag.startX:0;this.sliderFrame.style[this.transformProperty]="translate3d("+(l+o)+"px, 0, 0)",this.currentSlide=r+e;}else this.currentSlide=this.currentSlide+e;}else this.currentSlide=Math.min(this.currentSlide+e,this.innerElements.length-this.perPage);i!==this.currentSlide&&(this.slideToCurrent(this.config.loop),this.config.onChange.call(this),t&&t.call(this));}}},{key:"disableTransition",value:function(){this.sliderFrame.style.webkitTransition="all 0ms "+this.config.easing,this.sliderFrame.style.transition="all 0ms "+this.config.easing;}},{key:"enableTransition",value:function(){this.sliderFrame.style.webkitTransition="all "+this.config.duration+"ms "+this.config.easing,this.sliderFrame.style.transition="all "+this.config.duration+"ms "+this.config.easing;}},{key:"goTo",value:function(e,t){if(!(this.innerElements.length<=this.perPage)){var i=this.currentSlide;this.currentSlide=this.config.loop?e%this.innerElements.length:Math.min(Math.max(e,0),this.innerElements.length-this.perPage),i!==this.currentSlide&&(this.slideToCurrent(),this.config.onChange.call(this),t&&t.call(this));}}},{key:"slideToCurrent",value:function(e){var t=this,i=this.config.loop?this.currentSlide+this.perPage:this.currentSlide,r=(this.config.rtl?1:-1)*i*(this.selectorWidth/this.perPage);e?requestAnimationFrame(function(){requestAnimationFrame(function(){t.enableTransition(),t.sliderFrame.style[t.transformProperty]="translate3d("+r+"px, 0, 0)";});}):this.sliderFrame.style[this.transformProperty]="translate3d("+r+"px, 0, 0)";}},{key:"updateAfterDrag",value:function(){var e=(this.config.rtl?-1:1)*(this.drag.endX-this.drag.startX),t=Math.abs(e),i=this.config.multipleDrag?Math.ceil(t/(this.selectorWidth/this.perPage)):1,r=e>0&&this.currentSlide-i<0,n=e<0&&this.currentSlide+i>this.innerElements.length-this.perPage;e>0&&t>this.config.threshold&&this.innerElements.length>this.perPage?this.prev(i):e<0&&t>this.config.threshold&&this.innerElements.length>this.perPage&&this.next(i),this.slideToCurrent(r||n);}},{key:"resizeHandler",value:function(){this.resolveSlidesNumber(),this.currentSlide+this.perPage>this.innerElements.length&&(this.currentSlide=this.innerElements.length<=this.perPage?0:this.innerElements.length-this.perPage),this.selectorWidth=this.selector.offsetWidth,this.buildSliderFrame();}},{key:"clearDrag",value:function(){this.drag={startX:0,endX:0,startY:0,letItGo:null,preventClick:this.drag.preventClick};}},{key:"touchstartHandler",value:function(e){-1!==["TEXTAREA","OPTION","INPUT","SELECT"].indexOf(e.target.nodeName)||(e.stopPropagation(),this.pointerDown=!0,this.drag.startX=e.touches[0].pageX,this.drag.startY=e.touches[0].pageY);}},{key:"touchendHandler",value:function(e){e.stopPropagation(),this.pointerDown=!1,this.enableTransition(),this.drag.endX&&this.updateAfterDrag(),this.clearDrag();}},{key:"touchmoveHandler",value:function(e){if(e.stopPropagation(),null===this.drag.letItGo&&(this.drag.letItGo=Math.abs(this.drag.startY-e.touches[0].pageY)<Math.abs(this.drag.startX-e.touches[0].pageX)),this.pointerDown&&this.drag.letItGo){e.preventDefault(),this.drag.endX=e.touches[0].pageX,this.sliderFrame.style.webkitTransition="all 0ms "+this.config.easing,this.sliderFrame.style.transition="all 0ms "+this.config.easing;var t=this.config.loop?this.currentSlide+this.perPage:this.currentSlide,i=t*(this.selectorWidth/this.perPage),r=this.drag.endX-this.drag.startX,n=this.config.rtl?i+r:i-r;this.sliderFrame.style[this.transformProperty]="translate3d("+(this.config.rtl?1:-1)*n+"px, 0, 0)";}}},{key:"mousedownHandler",value:function(e){-1!==["TEXTAREA","OPTION","INPUT","SELECT"].indexOf(e.target.nodeName)||(e.preventDefault(),e.stopPropagation(),this.pointerDown=!0,this.drag.startX=e.pageX);}},{key:"mouseupHandler",value:function(e){e.stopPropagation(),this.pointerDown=!1,this.selector.style.cursor="-webkit-grab",this.enableTransition(),this.drag.endX&&this.updateAfterDrag(),this.clearDrag();}},{key:"mousemoveHandler",value:function(e){if(e.preventDefault(),this.pointerDown){"A"===e.target.nodeName&&(this.drag.preventClick=!0),this.drag.endX=e.pageX,this.selector.style.cursor="-webkit-grabbing",this.sliderFrame.style.webkitTransition="all 0ms "+this.config.easing,this.sliderFrame.style.transition="all 0ms "+this.config.easing;var t=this.config.loop?this.currentSlide+this.perPage:this.currentSlide,i=t*(this.selectorWidth/this.perPage),r=this.drag.endX-this.drag.startX,n=this.config.rtl?i+r:i-r;this.sliderFrame.style[this.transformProperty]="translate3d("+(this.config.rtl?1:-1)*n+"px, 0, 0)";}}},{key:"mouseleaveHandler",value:function(e){this.pointerDown&&(this.pointerDown=!1,this.selector.style.cursor="-webkit-grab",this.drag.endX=e.pageX,this.drag.preventClick=!1,this.enableTransition(),this.updateAfterDrag(),this.clearDrag());}},{key:"clickHandler",value:function(e){this.drag.preventClick&&e.preventDefault(),this.drag.preventClick=!1;}},{key:"remove",value:function(e,t){if(e<0||e>=this.innerElements.length)throw new Error("Item to remove doesn't exist 😭");var i=e<this.currentSlide,r=this.currentSlide+this.perPage-1===e;(i||r)&&this.currentSlide--,this.innerElements.splice(e,1),this.buildSliderFrame(),t&&t.call(this);}},{key:"insert",value:function(e,t,i){if(t<0||t>this.innerElements.length+1)throw new Error("Unable to inset it at this index 😭");if(-1!==this.innerElements.indexOf(e))throw new Error("The same item in a carousel? Really? Nope 😭");var r=t<=this.currentSlide>0&&this.innerElements.length;this.currentSlide=r?this.currentSlide+1:this.currentSlide,this.innerElements.splice(t,0,e),this.buildSliderFrame(),i&&i.call(this);}},{key:"prepend",value:function(e,t){this.insert(e,0),t&&t.call(this);}},{key:"append",value:function(e,t){this.insert(e,this.innerElements.length+1),t&&t.call(this);}},{key:"destroy",value:function(){var e=arguments.length>0&&void 0!==arguments[0]&&arguments[0],t=arguments[1];if(this.detachEvents(),this.selector.style.cursor="auto",e){for(var i=document.createDocumentFragment(),r=0;r<this.innerElements.length;r++)i.appendChild(this.innerElements[r]);this.selector.innerHTML="",this.selector.appendChild(i),this.selector.removeAttribute("style");}t&&t.call(this);}}],[{key:"mergeSettings",value:function(e){var t={selector:".siema",duration:200,easing:"ease-out",perPage:1,startIndex:0,draggable:!0,multipleDrag:!0,threshold:20,loop:!1,rtl:!1,onInit:function(){},onChange:function(){}},i=e;for(var r in i)t[r]=i[r];return t}},{key:"webkitOrNot",value:function(){return "string"==typeof document.documentElement.style.transform?"transform":"WebkitTransform"}}]),e}();t.default=l,e.exports=t.default;}])});
    });

    /* node_modules/@beyonk/svelte-carousel/src/Carousel.svelte generated by Svelte v3.29.6 */
    const file$6 = "node_modules/@beyonk/svelte-carousel/src/Carousel.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[31] = list[i];
    	child_ctx[33] = i;
    	return child_ctx;
    }

    const get_right_control_slot_changes = dirty => ({});
    const get_right_control_slot_context = ctx => ({});
    const get_left_control_slot_changes = dirty => ({});
    const get_left_control_slot_context = ctx => ({});

    // (6:1) {#if controls}
    function create_if_block_1$1(ctx) {
    	let button0;
    	let t;
    	let button1;
    	let current;
    	let mounted;
    	let dispose;
    	const left_control_slot_template = /*#slots*/ ctx[23]["left-control"];
    	const left_control_slot = create_slot(left_control_slot_template, ctx, /*$$scope*/ ctx[22], get_left_control_slot_context);
    	const right_control_slot_template = /*#slots*/ ctx[23]["right-control"];
    	const right_control_slot = create_slot(right_control_slot_template, ctx, /*$$scope*/ ctx[22], get_right_control_slot_context);

    	const block = {
    		c: function create() {
    			button0 = element("button");
    			if (left_control_slot) left_control_slot.c();
    			t = space();
    			button1 = element("button");
    			if (right_control_slot) right_control_slot.c();
    			attr_dev(button0, "class", "left svelte-1ppqxio");
    			attr_dev(button0, "aria-label", "left");
    			add_location(button0, file$6, 6, 1, 105);
    			attr_dev(button1, "class", "right svelte-1ppqxio");
    			attr_dev(button1, "aria-label", "right");
    			add_location(button1, file$6, 9, 1, 209);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button0, anchor);

    			if (left_control_slot) {
    				left_control_slot.m(button0, null);
    			}

    			insert_dev(target, t, anchor);
    			insert_dev(target, button1, anchor);

    			if (right_control_slot) {
    				right_control_slot.m(button1, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*left*/ ctx[3], false, false, false),
    					listen_dev(button1, "click", /*right*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (left_control_slot) {
    				if (left_control_slot.p && dirty[0] & /*$$scope*/ 4194304) {
    					update_slot(left_control_slot, left_control_slot_template, ctx, /*$$scope*/ ctx[22], dirty, get_left_control_slot_changes, get_left_control_slot_context);
    				}
    			}

    			if (right_control_slot) {
    				if (right_control_slot.p && dirty[0] & /*$$scope*/ 4194304) {
    					update_slot(right_control_slot, right_control_slot_template, ctx, /*$$scope*/ ctx[22], dirty, get_right_control_slot_changes, get_right_control_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(left_control_slot, local);
    			transition_in(right_control_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(left_control_slot, local);
    			transition_out(right_control_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button0);
    			if (left_control_slot) left_control_slot.d(detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(button1);
    			if (right_control_slot) right_control_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(6:1) {#if controls}",
    		ctx
    	});

    	return block;
    }

    // (14:4) {#if dots}
    function create_if_block$2(ctx) {
    	let ul;
    	let each_value = { length: /*totalDots*/ ctx[9] };
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "svelte-1ppqxio");
    			add_location(ul, file$6, 14, 1, 339);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*isDotActive, currentIndex, go, currentPerPage, totalDots*/ 868) {
    				each_value = { length: /*totalDots*/ ctx[9] };
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(14:4) {#if dots}",
    		ctx
    	});

    	return block;
    }

    // (16:2) {#each {length: totalDots} as _, i}
    function create_each_block(ctx) {
    	let li;
    	let li_class_value;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[25](/*i*/ ctx[33]);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");

    			attr_dev(li, "class", li_class_value = "" + (null_to_empty(/*isDotActive*/ ctx[2](/*currentIndex*/ ctx[6], /*i*/ ctx[33])
    			? "active"
    			: "") + " svelte-1ppqxio"));

    			add_location(li, file$6, 16, 2, 384);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);

    			if (!mounted) {
    				dispose = listen_dev(li, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*currentIndex*/ 64 && li_class_value !== (li_class_value = "" + (null_to_empty(/*isDotActive*/ ctx[2](/*currentIndex*/ ctx[6], /*i*/ ctx[33])
    			? "active"
    			: "") + " svelte-1ppqxio"))) {
    				attr_dev(li, "class", li_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(16:2) {#each {length: totalDots} as _, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let div1;
    	let div0;
    	let t0;
    	let t1;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[23].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[22], null);
    	let if_block0 = /*controls*/ ctx[1] && create_if_block_1$1(ctx);
    	let if_block1 = /*dots*/ ctx[0] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(div0, "class", "slides");
    			add_location(div0, file$6, 2, 1, 25);
    			attr_dev(div1, "class", "carousel svelte-1ppqxio");
    			add_location(div1, file$6, 1, 0, 1);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			/*div0_binding*/ ctx[24](div0);
    			append_dev(div1, t0);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div1, t1);
    			if (if_block1) if_block1.m(div1, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty[0] & /*$$scope*/ 4194304) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[22], dirty, null, null);
    				}
    			}

    			if (/*controls*/ ctx[1]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*controls*/ 2) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1$1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div1, t1);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*dots*/ ctx[0]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$2(ctx);
    					if_block1.c();
    					if_block1.m(div1, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			transition_in(if_block0);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			transition_out(if_block0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (default_slot) default_slot.d(detaching);
    			/*div0_binding*/ ctx[24](null);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Carousel", slots, ['default','left-control','right-control']);
    	let { perPage = 3 } = $$props;
    	let { loop = true } = $$props;
    	let { autoplay = 0 } = $$props;
    	let { duration = 200 } = $$props;
    	let { easing = "ease-out" } = $$props;
    	let { startIndex = 0 } = $$props;
    	let { draggable = true } = $$props;
    	let { multipleDrag = true } = $$props;
    	let { dots = true } = $$props;
    	let { controls = true } = $$props;
    	let { threshold = 20 } = $$props;
    	let { rtl = false } = $$props;
    	let currentIndex = startIndex;
    	let siema;
    	let controller;
    	let timer;
    	const dispatch = createEventDispatcher();

    	onMount(() => {
    		$$invalidate(26, controller = new siema_min({
    				selector: siema,
    				perPage: typeof perPage === "object" ? perPage : Number(perPage),
    				loop,
    				duration,
    				easing,
    				startIndex,
    				draggable,
    				multipleDrag,
    				threshold,
    				rtl,
    				onChange: handleChange
    			}));

    		if (autoplay) {
    			timer = setInterval(right, autoplay);
    		}

    		return () => {
    			autoplay && clearInterval(timer);
    			controller.destroy();
    		};
    	});

    	function isDotActive(currentIndex, dotIndex) {
    		if (currentIndex < 0) currentIndex = pips.length + currentIndex;
    		return currentIndex >= dotIndex * currentPerPage && currentIndex < dotIndex * currentPerPage + currentPerPage;
    	}

    	function left() {
    		controller.prev();
    	}

    	function right() {
    		controller.next();
    	}

    	function go(index) {
    		controller.goTo(index);
    	}

    	function pause() {
    		clearInterval(timer);
    	}

    	function resume() {
    		if (autoplay) {
    			timer = setInterval(right, autoplay);
    		}
    	}

    	function handleChange(event) {
    		$$invalidate(6, currentIndex = controller.currentSlide);

    		dispatch("change", {
    			currentSlide: controller.currentSlide,
    			slideCount: controller.innerElements.length
    		});
    	}

    	const writable_props = [
    		"perPage",
    		"loop",
    		"autoplay",
    		"duration",
    		"easing",
    		"startIndex",
    		"draggable",
    		"multipleDrag",
    		"dots",
    		"controls",
    		"threshold",
    		"rtl"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Carousel> was created with unknown prop '${key}'`);
    	});

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			siema = $$value;
    			$$invalidate(7, siema);
    		});
    	}

    	const click_handler = i => go(i * currentPerPage);

    	$$self.$$set = $$props => {
    		if ("perPage" in $$props) $$invalidate(10, perPage = $$props.perPage);
    		if ("loop" in $$props) $$invalidate(11, loop = $$props.loop);
    		if ("autoplay" in $$props) $$invalidate(12, autoplay = $$props.autoplay);
    		if ("duration" in $$props) $$invalidate(13, duration = $$props.duration);
    		if ("easing" in $$props) $$invalidate(14, easing = $$props.easing);
    		if ("startIndex" in $$props) $$invalidate(15, startIndex = $$props.startIndex);
    		if ("draggable" in $$props) $$invalidate(16, draggable = $$props.draggable);
    		if ("multipleDrag" in $$props) $$invalidate(17, multipleDrag = $$props.multipleDrag);
    		if ("dots" in $$props) $$invalidate(0, dots = $$props.dots);
    		if ("controls" in $$props) $$invalidate(1, controls = $$props.controls);
    		if ("threshold" in $$props) $$invalidate(18, threshold = $$props.threshold);
    		if ("rtl" in $$props) $$invalidate(19, rtl = $$props.rtl);
    		if ("$$scope" in $$props) $$invalidate(22, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Siema: siema_min,
    		onMount,
    		createEventDispatcher,
    		perPage,
    		loop,
    		autoplay,
    		duration,
    		easing,
    		startIndex,
    		draggable,
    		multipleDrag,
    		dots,
    		controls,
    		threshold,
    		rtl,
    		currentIndex,
    		siema,
    		controller,
    		timer,
    		dispatch,
    		isDotActive,
    		left,
    		right,
    		go,
    		pause,
    		resume,
    		handleChange,
    		pips,
    		currentPerPage,
    		totalDots
    	});

    	$$self.$inject_state = $$props => {
    		if ("perPage" in $$props) $$invalidate(10, perPage = $$props.perPage);
    		if ("loop" in $$props) $$invalidate(11, loop = $$props.loop);
    		if ("autoplay" in $$props) $$invalidate(12, autoplay = $$props.autoplay);
    		if ("duration" in $$props) $$invalidate(13, duration = $$props.duration);
    		if ("easing" in $$props) $$invalidate(14, easing = $$props.easing);
    		if ("startIndex" in $$props) $$invalidate(15, startIndex = $$props.startIndex);
    		if ("draggable" in $$props) $$invalidate(16, draggable = $$props.draggable);
    		if ("multipleDrag" in $$props) $$invalidate(17, multipleDrag = $$props.multipleDrag);
    		if ("dots" in $$props) $$invalidate(0, dots = $$props.dots);
    		if ("controls" in $$props) $$invalidate(1, controls = $$props.controls);
    		if ("threshold" in $$props) $$invalidate(18, threshold = $$props.threshold);
    		if ("rtl" in $$props) $$invalidate(19, rtl = $$props.rtl);
    		if ("currentIndex" in $$props) $$invalidate(6, currentIndex = $$props.currentIndex);
    		if ("siema" in $$props) $$invalidate(7, siema = $$props.siema);
    		if ("controller" in $$props) $$invalidate(26, controller = $$props.controller);
    		if ("timer" in $$props) timer = $$props.timer;
    		if ("pips" in $$props) pips = $$props.pips;
    		if ("currentPerPage" in $$props) $$invalidate(8, currentPerPage = $$props.currentPerPage);
    		if ("totalDots" in $$props) $$invalidate(9, totalDots = $$props.totalDots);
    	};

    	let pips;
    	let currentPerPage;
    	let totalDots;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*controller*/ 67108864) {
    			 pips = controller ? controller.innerElements : [];
    		}

    		if ($$self.$$.dirty[0] & /*controller, perPage*/ 67109888) {
    			 $$invalidate(8, currentPerPage = controller ? controller.perPage : perPage);
    		}

    		if ($$self.$$.dirty[0] & /*controller, currentPerPage*/ 67109120) {
    			 $$invalidate(9, totalDots = controller
    			? Math.ceil(controller.innerElements.length / currentPerPage)
    			: []);
    		}
    	};

    	return [
    		dots,
    		controls,
    		isDotActive,
    		left,
    		right,
    		go,
    		currentIndex,
    		siema,
    		currentPerPage,
    		totalDots,
    		perPage,
    		loop,
    		autoplay,
    		duration,
    		easing,
    		startIndex,
    		draggable,
    		multipleDrag,
    		threshold,
    		rtl,
    		pause,
    		resume,
    		$$scope,
    		slots,
    		div0_binding,
    		click_handler
    	];
    }

    class Carousel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$8,
    			create_fragment$8,
    			safe_not_equal,
    			{
    				perPage: 10,
    				loop: 11,
    				autoplay: 12,
    				duration: 13,
    				easing: 14,
    				startIndex: 15,
    				draggable: 16,
    				multipleDrag: 17,
    				dots: 0,
    				controls: 1,
    				threshold: 18,
    				rtl: 19,
    				isDotActive: 2,
    				left: 3,
    				right: 4,
    				go: 5,
    				pause: 20,
    				resume: 21
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Carousel",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get perPage() {
    		throw new Error("<Carousel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set perPage(value) {
    		throw new Error("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get loop() {
    		throw new Error("<Carousel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set loop(value) {
    		throw new Error("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get autoplay() {
    		throw new Error("<Carousel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set autoplay(value) {
    		throw new Error("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get duration() {
    		throw new Error("<Carousel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set duration(value) {
    		throw new Error("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get easing() {
    		throw new Error("<Carousel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set easing(value) {
    		throw new Error("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get startIndex() {
    		throw new Error("<Carousel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set startIndex(value) {
    		throw new Error("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get draggable() {
    		throw new Error("<Carousel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set draggable(value) {
    		throw new Error("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get multipleDrag() {
    		throw new Error("<Carousel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set multipleDrag(value) {
    		throw new Error("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dots() {
    		throw new Error("<Carousel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dots(value) {
    		throw new Error("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get controls() {
    		throw new Error("<Carousel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set controls(value) {
    		throw new Error("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get threshold() {
    		throw new Error("<Carousel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set threshold(value) {
    		throw new Error("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rtl() {
    		throw new Error("<Carousel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rtl(value) {
    		throw new Error("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isDotActive() {
    		return this.$$.ctx[2];
    	}

    	set isDotActive(value) {
    		throw new Error("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get left() {
    		return this.$$.ctx[3];
    	}

    	set left(value) {
    		throw new Error("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get right() {
    		return this.$$.ctx[4];
    	}

    	set right(value) {
    		throw new Error("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get go() {
    		return this.$$.ctx[5];
    	}

    	set go(value) {
    		throw new Error("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pause() {
    		return this.$$.ctx[20];
    	}

    	set pause(value) {
    		throw new Error("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get resume() {
    		return this.$$.ctx[21];
    	}

    	set resume(value) {
    		throw new Error("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Gallery.svelte generated by Svelte v3.29.6 */
    const file$7 = "src/Gallery.svelte";

    // (31:2) <Carousel perPage={1}>
    function create_default_slot(ctx) {
    	let div0;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let div1;
    	let img1;
    	let img1_src_value;
    	let t1;
    	let div2;
    	let img2;
    	let img2_src_value;
    	let t2;
    	let div3;
    	let img3;
    	let img3_src_value;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			img0 = element("img");
    			t0 = space();
    			div1 = element("div");
    			img1 = element("img");
    			t1 = space();
    			div2 = element("div");
    			img2 = element("img");
    			t2 = space();
    			div3 = element("div");
    			img3 = element("img");
    			if (img0.src !== (img0_src_value = "//placekitten.com/400")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Kitten 1");
    			add_location(img0, file$7, 32, 6, 547);
    			attr_dev(div0, "class", "slide-content svelte-8jppbf");
    			add_location(div0, file$7, 31, 4, 513);
    			if (img1.src !== (img1_src_value = "//placekitten.com/401")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Kitten 1");
    			add_location(img1, file$7, 35, 6, 646);
    			attr_dev(div1, "class", "slide-content svelte-8jppbf");
    			add_location(div1, file$7, 34, 4, 612);
    			if (img2.src !== (img2_src_value = "//placekitten.com/402")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "Kitten 1");
    			add_location(img2, file$7, 38, 6, 745);
    			attr_dev(div2, "class", "slide-content svelte-8jppbf");
    			add_location(div2, file$7, 37, 4, 711);
    			if (img3.src !== (img3_src_value = "//placekitten.com/403")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "Kitten 1");
    			add_location(img3, file$7, 41, 6, 844);
    			attr_dev(div3, "class", "slide-content svelte-8jppbf");
    			add_location(div3, file$7, 40, 4, 810);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, img0);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, img1);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, img2);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, img3);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(31:2) <Carousel perPage={1}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let main;
    	let br0;
    	let t0;
    	let br1;
    	let t1;
    	let h1;
    	let t3;
    	let h2;
    	let t5;
    	let carousel;
    	let current;

    	carousel = new Carousel({
    			props: {
    				perPage: 1,
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			br0 = element("br");
    			t0 = space();
    			br1 = element("br");
    			t1 = space();
    			h1 = element("h1");
    			h1.textContent = "Gallery";
    			t3 = space();
    			h2 = element("h2");
    			h2.textContent = "I'm only selling 2 varietals of wine at the momement. Swag will arrive soon!";
    			t5 = space();
    			create_component(carousel.$$.fragment);
    			add_location(br0, file$7, 25, 2, 339);
    			add_location(br1, file$7, 26, 2, 348);
    			attr_dev(h1, "class", "header-top");
    			add_location(h1, file$7, 27, 2, 357);
    			add_location(h2, file$7, 28, 2, 395);
    			attr_dev(main, "class", "svelte-8jppbf");
    			add_location(main, file$7, 24, 0, 330);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, br0);
    			append_dev(main, t0);
    			append_dev(main, br1);
    			append_dev(main, t1);
    			append_dev(main, h1);
    			append_dev(main, t3);
    			append_dev(main, h2);
    			append_dev(main, t5);
    			mount_component(carousel, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const carousel_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				carousel_changes.$$scope = { dirty, ctx };
    			}

    			carousel.$set(carousel_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(carousel.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(carousel.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(carousel);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Gallery", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Gallery> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Carousel });
    	return [];
    }

    class Gallery extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Gallery",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.29.6 */

    // (24:2) <Route path="/">
    function create_default_slot_4(ctx) {
    	let home;
    	let current;
    	home = new Home({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(home.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(home, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(home.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(home.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(home, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(24:2) <Route path=\\\"/\\\">",
    		ctx
    	});

    	return block;
    }

    // (27:2) <Route path="/story">
    function create_default_slot_3(ctx) {
    	let story;
    	let current;
    	story = new Story({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(story.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(story, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(story.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(story.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(story, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(27:2) <Route path=\\\"/story\\\">",
    		ctx
    	});

    	return block;
    }

    // (30:2) <Route path="/shop">
    function create_default_slot_2(ctx) {
    	let shop;
    	let current;
    	shop = new Shop({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(shop.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(shop, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(shop.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(shop.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(shop, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(30:2) <Route path=\\\"/shop\\\">",
    		ctx
    	});

    	return block;
    }

    // (33:2) <Route path="/gallery">
    function create_default_slot_1(ctx) {
    	let gallery;
    	let current;
    	gallery = new Gallery({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(gallery.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(gallery, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(gallery.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(gallery.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(gallery, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(33:2) <Route path=\\\"/gallery\\\">",
    		ctx
    	});

    	return block;
    }

    // (18:0) <Router {url}>
    function create_default_slot$1(ctx) {
    	let nav;
    	let t0;
    	let route0;
    	let t1;
    	let route1;
    	let t2;
    	let route2;
    	let t3;
    	let route3;
    	let current;
    	nav = new Nav({ $$inline: true });

    	route0 = new Route({
    			props: {
    				path: "/",
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route1 = new Route({
    			props: {
    				path: "/story",
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route2 = new Route({
    			props: {
    				path: "/shop",
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route3 = new Route({
    			props: {
    				path: "/gallery",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(nav.$$.fragment);
    			t0 = space();
    			create_component(route0.$$.fragment);
    			t1 = space();
    			create_component(route1.$$.fragment);
    			t2 = space();
    			create_component(route2.$$.fragment);
    			t3 = space();
    			create_component(route3.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(nav, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(route0, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(route1, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(route2, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(route3, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const route0_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				route0_changes.$$scope = { dirty, ctx };
    			}

    			route0.$set(route0_changes);
    			const route1_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				route1_changes.$$scope = { dirty, ctx };
    			}

    			route1.$set(route1_changes);
    			const route2_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				route2_changes.$$scope = { dirty, ctx };
    			}

    			route2.$set(route2_changes);
    			const route3_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				route3_changes.$$scope = { dirty, ctx };
    			}

    			route3.$set(route3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(nav.$$.fragment, local);
    			transition_in(route0.$$.fragment, local);
    			transition_in(route1.$$.fragment, local);
    			transition_in(route2.$$.fragment, local);
    			transition_in(route3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(nav.$$.fragment, local);
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			transition_out(route2.$$.fragment, local);
    			transition_out(route3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(nav, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(route0, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(route1, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(route2, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(route3, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(18:0) <Router {url}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let router;
    	let current;

    	router = new Router({
    			props: {
    				url: /*url*/ ctx[0],
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(router.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(router, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const router_changes = {};
    			if (dirty & /*url*/ 1) router_changes.url = /*url*/ ctx[0];

    			if (dirty & /*$$scope*/ 2) {
    				router_changes.$$scope = { dirty, ctx };
    			}

    			router.$set(router_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(router, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let { url = "" } = $$props;
    	const writable_props = ["url"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("url" in $$props) $$invalidate(0, url = $$props.url);
    	};

    	$$self.$capture_state = () => ({
    		Router,
    		Link,
    		Route,
    		Home,
    		Story,
    		Nav,
    		Shop,
    		Gallery,
    		url
    	});

    	$$self.$inject_state = $$props => {
    		if ("url" in $$props) $$invalidate(0, url = $$props.url);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [url];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { url: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get url() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
