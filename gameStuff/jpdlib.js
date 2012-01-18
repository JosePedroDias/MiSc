JPDlib = {
    
    bind: function(fn, scope) {
        var args = Array.prototype.slice.call(arguments, 2);
        return function() {
            var inArgs = Array.prototype.slice.call(arguments);
            var endArgs = args.concat(inArgs);
            return fn.apply(scope, endArgs);
        };
    },
    
    // EVENTS
    observe: function(el, evtName, cb) {
        if      (el.addEventListener) {el.addEventListener(evtName, cb, false);}
        else if (el.attachEvent)      {el.attachEvent('on' + evtName, cb);}
        else                          {el['on' + evtName] = cb;}
    },
    
    stopObserving: function(el, evtName, cb) {
        if      (el.removeEventListener) {el.removeEventListener(evtName, cb, false);}
        else if (el.detachEvent)         {el.detachEvent('on' + evtName, cb);}
        else                             {el['on' + evtName] = null;}
    },
    
    getTarget: function(ev) {
        return ev.target || ev.srcElement;
    },
    
    preventDefault: function(ev) {
        if (ev.preventDefault) {ev.preventDefault();}
        else                   {ev.returnValue = false;}
    },
    
    stopPropagation: function(ev) {
        if (ev.stopPropagation) {ev.stopPropagation();}
        else                    {ev.cancelBubble = true;}
    },
    
    
    // DOM
    getChildElems: function(el, tagName) {
    },
    
    // insert element after
    
    
    // COMMUNICATION
    ajax: function(url, cb, useGet, parseJSON, sync) {
        var xhr = new XMLHttpRequest();
        xhr.open(useGet ? 'get' : 'post', url, !sync);
        xhr.send(null);
        xhr.onreadystatechange = function(event) {
            if (xhr.readyState === 4) {
                if ( (xhr.status > 199 && xhr.status < 300) || xhr.status === 304) {
                    cb( parseJSON? JSON.parse(xhr.responseText) : xhr.responseText );
                }
                else {
                    throw new Error('AJAX request unsuccessful!');
                }
            }
        };
    },
    
    
    // RESOURCES
    loadResource: function(url, callback) {
    },
    
    
    // OO
    
    // option parsing
    extendObj: function(dst, src) {
        for (var prop in src) {
            if (src.hasOwnProperty(prop)) {dst[prop] = src[prop];}
        }
        return dst;
    }
    
    // clone object?
};

window.s$ = function(el) {
    if (typeof el === 'string') {return document.getElementById(el);}
    return el;
};
