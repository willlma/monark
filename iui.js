var m = function() {
  var res = {};
  for (var i = 0, len = arguments.length; i < len; ++i)
    if (arguments[i]) Object.assign(res, arguments[i]);
  return res;
}
var MarkdownEditor = React.createClass({
  onInput: function(text) {
    this.setState({ text: text }, function() {
      
      // moveTextarea(this.refs.marked);
    });
  },
  setSelection: function(startOffset, endOffset) {
    console.log('startOffset: '+startOffset);
    console.log('endOffset: '+endOffset);
    this.setState({
      startOffset: startOffset,
      endOffset: endOffset
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
      // opacity: 0.6,
      fontFamily: 'sans-serif',
      fontSize: '1em',
      width: '100%',
      border: '1px solid blue'
      // height: '100%'
    }
    return (
      <div className="MarkdownEditor">
        <MarkedArea
          rawMarkup={this.rawMarkup}
          text = {this.state.text}
          setSelection = {this.setSelection} />
        <Textarea
          style = {childStyle}
          onInput = {this.onInput}
          text = {this.state.text}
          startOffset = {this.state.startOffset}
          endOffset = {this.state.endOffset} />
      </div>
    );
  }
});

var Textarea = React.createClass({
  handleChange: function(evt) {
    var textarea = evt.target;
    var text = textarea.value;
    // var mirror = this.refs.mirror;

    //calculate caret position
    // var moveTextarea = function(markedDiv) {
    //   var range = document.createRange();
    //   ['Start', 'End'].forEach(function(suffix) {
    //     range['set' + suffix](mirror.childNodes[0], textarea['selection' + suffix] - 1);
    //   });
    //   var caretPos = {
    //     x: range.getClientRects()[0].left
    //   };
    //   var map = getMapping(markedDiv.textContent);
    //   debugger;
    //   var next = nextNode(markedDiv);
    //   textarea.style.left = markedPos.x - caretPos.x;
    // }
    this.props.onInput(text);
    //calculate equiv RT position
    //reposition textarea
    // this.style.position = 
  },
  componentDidUpdate: function(prevProps) {
    if (prevProps.startOffset===this.props.startOffset &&
        prevProps.endOffset===this.props.endOffset)
      return;
    // this.elem.focus();
    // this.elem.selectionStart = 2//this.props.startOffset;
    // this.elem.selectionEnd = 5//this.props.endOffset;
    // this.elem.setSelectionRange(2,5/*this.props.startOffset, this.props.endOffset*/);
    console.log('document.activeElement: '+document.activeElement);
  },
  render: function() {
    this.style = {
      marginTop: '4rem',
      width: 400
    };
    return (
      <textarea
        ref={(ref) => this.elem = ref}
        style={this.style}
        onChange={this.handleChange}
        defaultValue={this.props.text} />
    );
  }
});

var MarkedArea = React.createClass({
  onClick: function(evt) {
    var elem = this.refs.marked;
    var plainText = this.props.text;
    var map = (function() {
      var result = [];
      var j = 0;
      for(var i = 0, len = plainText.length; i < len; i++) {
        if (plainText[i]===elem.textContent[j]) result[j++] = i;
      }
      return result;
    })();

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

    var range = getSelection().getRangeAt(0);
    var textNode = dive(elem);
    var index = 0;
    // TODO: inverse range if backwards
    var getOffset = function(prefix) {
      var i = 100;
      while (i--) {
        if (textNode===range[prefix + 'Container']) {
          return  index + range[prefix + 'Offset'];
          break;
        } else {
          index += textNode.data.length;
          textNode = nextNode(textNode);
        }
      }
    };
    this.props.setSelection(map[getOffset('start')], map[getOffset('end')]);

  },
  // componentDidUpdate: function(prevProps, prevState) {  },
  render: function() {
    this.style = {};
    return (
      <div ref="marked"
        /*style={m(
          childStyle,
          { }
        )}*/
    onClick={this.onClick}
        dangerouslySetInnerHTML={this.props.rawMarkup()}/>
    )
  }
});

/*var MarkedTag = React.createClass({
  render: function() {
    this.style = {};
    return <div style={this.style}></div>
  }
});*/
ReactDOM.render(<MarkdownEditor />, document.getElementById('container'));