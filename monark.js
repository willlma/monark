var monark = function(parent) {
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
    var j = 0;
    for(var i = 0, len = plainText.length; i < len; i++) {
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

  var getRange = function(start, end) {
    var map = getMap();
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

  elems.textarea.addEventListener('input', function(evt) {
    elems.div.innerHTML = marked(this.value, {sanitize: true});
    /*[].forEach.call(elems.div.children, function(elem) {
      elem.style.whiteSpace = 'pre-wrap';
    });*/
    var range = getRange(this.selectionStart, this.selectionEnd);
    var sel = getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    // elems.div.focus();
  });
  
  parent.addEventListener('keydown', function(evt) {
    // console.dir(evt);
    if (document.activeElement===elems.textarea) return;
    if (evt.code.indexOf('Shift')!==-1 || evt.code.indexOf('Arrow')!==-1)
      return;
    var map = getMap();
    // TODO: inverse range if backwards
    elems.textarea.setSelectionRange(map[getOffset('start')], map[getOffset('end')]);
    elems.textarea.focus();
  });
  return elems.div;
};