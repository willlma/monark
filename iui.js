var m = function() {
  var res = {};
  for (var i = 0, len = arguments.length; i < len; ++i)
    if (arguments[i]) Object.assign(res, arguments[i]);
  return res;
}
var MarkdownEditor = React.createClass({
onInput: function(text, moveTextarea) {
  this.setState({ text: text }, function() {
    moveTextarea(this.refs.marked);
  });
},
getInitialState: function() {
  return {text: 'Type some *markdown* here!'};
},
rawMarkup: function() {
  // this.state.marked = marked(this.state.text, {sanitize: true});
  return { __html:  marked(this.state.text, {sanitize: true})};
},
render: function() {
  var childStyle = {
    opacity: 0.6,
    fontFamily: 'sans-serif',
    fontSize: '1em',
    width: '100%',
    border: '1px solid blue'
    // height: '100%'
  }
  return (
    <div className="MarkdownEditor">
      <div ref="marked"
        style={m(
          childStyle,
          { }
        )}
        className="content"
        dangerouslySetInnerHTML={this.rawMarkup()}/>
      <Textarea
        style = {childStyle}
        onInput = {this.onInput}
        text = {this.state.text} />
      <MarkTag />
    </div>
  );
}
});

var Textarea = React.createClass({
handleChange: function(evt) {
  var textarea = evt.target;
  var text = textarea.value;
  var mirror = this.refs.mirror;

  var getMapping = function(richText) {
    var map = [];
    var j = 0;
    for(var i = 0, len = text.length; i < len; i++) {
      if (text[i]===richText[j]) map[j++] = i;
    }
    return map;
  }

  var nextNode = function(node) {
    outer: while (node) {
      var sibling = node.nextSibling;
//       console.log(TAG+'sibling: '+sibling);
      if (!sibling) {
        node = node.parentNode;
//         console.log(TAG+'no sibling. node = '+node);
        continue;
      }
      while (sibling) {
        if (sibling.nodeType!==Node.TEXT_NODE) {
          node = sibling;
          continue outer;
        }
        node = sibling;
        sibling = sibling.firstChild;
      }
      return node;
    }
    console.error('did not encounter last node while finding next sibling');
  };

  //calculate caret position
  var moveTextarea = function(markedDiv) {
    var range = document.createRange();
    ['Start', 'End'].forEach(function(suffix) {
      range['set' + suffix](mirror.childNodes[0], textarea['selection' + suffix] - 1);
    });
    var caretPos = {
      x: range.getClientRects()[0].left
    };
    var map = getMapping(markedDiv.textContent);
    debugger;
    var next = nextNode(markedDiv);
    textarea.style.left = markedPos.x - caretPos.x;
  }
  this.props.onInput(textarea.value, moveTextarea);
  //calculate equiv RT position
  //reposition textarea
  // this.style.position = 
},
componentDidMount: function() {

},
render: function() {
  this.style = {
    position: 'absolute',
    top: '4rem',
    width: '100%'
  };
  var textareaStyle = m(this.props.style, {
    position: 'absolute',
    top: '1.5rem',
    resize: 'none',
    // border: 'none',
    background: 'transparent',
    color: 'green',
    outline: 'none',
    padding: 0
  });
  return (
    <div style = {this.style}>
      <textarea
        style={textareaStyle}
        onChange={this.handleChange}
        defaultValue={this.props.text} />
      <div ref="mirror"
        style={this.props.style}>
        {this.props.text}
      </div>
    </div>
  );
}
});

var MarkTag = React.createClass({
  render: function() {
    this.style = {};
    return <div style = {this.style}></div>
  }
});

ReactDOM.render(<MarkdownEditor />, document.getElementById('container'));