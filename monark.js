var monark = function(parent, render) {
  var TAG = 'MONARK  ';
  if (!parent) parent = document.body;
  parent.classList.add('monark');
  /*var*/elems = {};
  ['div', 'textarea'].forEach(function(tag) {
    elems[tag] = document.createElement(tag);
    parent.appendChild(elems[tag]);
  });
  elems.div.contentEditable = true;
  // elems.div.style.whiteSpace = 'pre';
  elems.textarea.placeholder = 'i *am* me';
  var getMap = function() {
    var map = [];
    var plainText = elems.textarea.value;
    var richText = elems.div.textContent;
    var re = /\w/g, match;
    /*while((match = re.exec(richText))!==null) {
      var four = 2+2;
    }*/
    var j = 0;
    for (var i = 0, len = plainText.length; i < len; i++) {
      if (plainText[i]===richText[j]) map[j++] = i;
    }
    map.push(plainText.length);
    return map;
  }

  var dive = function(node) {
    while (node.firstChild) node = node.firstChild;
    return node;
  }

  var nextNode = function(node) {
    while (node) {
      var sibling = node.nextSibling;
      if (sibling) return dive(sibling);
      node = node.parentNode;
    }
  };

  var getOffset = function(prefix) {
    var range = getSelection().getRangeAt(0);
    var textNode = dive(elems.div);
    var index = 0;
    while (true) {
      if (textNode===range[prefix + 'Container'])
        return  index + range[prefix + 'Offset'];
      index += textNode.data.length;
      textNode = nextNode(textNode);
    }  
  }

  var createRange = function(map) {
    var start = elems.textarea.selectionStart, end = elems.textarea.selectionEnd
    for (var i = 0, len = map.length; i < len; i++) {
      if (map[i]===start) start = i;
      if (map[i]===end) {
        end = i;
        break;
      }
    }
    var range = document.createRange();
    var textNode = dive(elems.div);
    var index = 0;
    // var setPos = function('prefix') {}
    while (true) {
      if (textNode.length + index < start) {
        index += textNode.length;
        textNode = nextNode(textNode);
      } else {
        range.setStart(textNode, start - index);
        break;
      }
    }
    while (true) {
      if (textNode.length + index < end) {
        index += textNode.length;
        textNode = nextNode(textNode);
      } else {
        range.setEnd(textNode, end - index)
        return range;
      }
    }
  };

  var selectRich = function(map) {
    var range = createRange(map);
    var sel = getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    return range;
  };
  (function onKey() {
    var lastChar, map = [], range;
    parent.addEventListener('keydown', function(evt) {
  //     console.dir(evt);
      if (document.activeElement===elems.textarea) return;
      if (evt.metaKey || [16, 37, 38, 39, 40].indexOf(evt.keyCode)!==-1) return;
      range = getSelection().getRangeAt(0);
      var plainStart = getOffset('start');
      var richStart = map[plainStart];
      elems.textarea.setSelectionRange(richStart, map[getOffset('end')]);
      elems.textarea.focus();
    });
    parent.addEventListener('keypress', function(evt) {
      lastChar = String.fromCharCode(evt.which);
    }, true);
    elems.textarea.addEventListener('input', function(evt) {
      // console.log('input');
      // if (!lastChar || lastChar.search(/\s/)===-1 && this.selectionStart===this.selectionEnd) {
      if (lastChar && lastChar===' ' && range.endOffset===range.endContainer.length) {
        var textNode = range.endContainer;
        var text = textNode.textContent;
        textNode.textContent = text.substring(0, range.endOffset)
          + lastChar + text.substring(range.endOffset);
      } else {
        elems.div.innerHTML = render(this.value);       
      }
      map = getMap();
      selectRich(map);
      /*[].forEach.call(elems.div.children, function(elem) {
        elem.style.whiteSpace = 'pre-wrap';
      });*/
      lastChar = null;
    });
  })();

  elems.textarea.addEventListener('select', function() {
    // console.log('select');
    if (this.selectionStart!==this.selectionEnd) selectRich();
  });
  return elems.div;
};