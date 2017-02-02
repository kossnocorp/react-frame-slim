'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _DocumentContext = require('./DocumentContext');

var _DocumentContext2 = _interopRequireDefault(_DocumentContext);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const hasConsole = typeof window !== 'undefined' && window.console;
const noop = () => {};
let swallowInvalidHeadWarning = noop;
let resetWarnings = noop;

if (hasConsole) {
  const originalError = console.error; // eslint-disable-line no-console
  // Rendering a <head> into a body is technically invalid although it
  // works. We swallow React's validateDOMNesting warning if that is the
  // message to avoid confusion
  swallowInvalidHeadWarning = () => {
    console.error = msg => {
      // eslint-disable-line no-console
      if (/<head>/.test(msg)) return;
      originalError.call(console, msg);
    };
  };
  resetWarnings = () => console.error = originalError; // eslint-disable-line no-console
}

class Frame extends _react.Component {
  // React warns when you render directly into the body since browser extensions
  // also inject into the body and can mess up React. For this reason
  // initialContent is expected to have a div inside of the body
  // element that we render react into.
  constructor(props, context) {
    super(props, context);
    this._isMounted = false;
  }

  componentDidMount() {
    this._isMounted = true;
    this.renderFrameContents();
  }

  componentDidUpdate() {
    this.renderFrameContents();
  }

  componentWillUnmount() {
    this._isMounted = false;
    const doc = this.getDoc();
    if (doc) {
      _reactDom2.default.unmountComponentAtNode(this.getMountTarget());
    }
  }

  getDoc() {
    return _reactDom2.default.findDOMNode(this).contentDocument; // eslint-disable-line
  }

  getMountTarget() {
    const doc = this.getDoc();
    if (this.props.mountTarget) {
      return doc.querySelector(this.props.mountTarget);
    }
    return doc.body.children[0];
  }

  renderFrameContents() {
    if (!this._isMounted) {
      return;
    }

    const doc = this.getDoc();
    if (doc && doc.readyState === 'complete') {
      const win = doc.defaultView || doc.parentView;
      const initialRender = !this._setInitialContent;
      const contents = _react2.default.createElement(
        _DocumentContext2.default,
        { document: doc, window: win },
        this.props.children
      );

      if (initialRender) {
        doc.open();
        doc.write(this.props.initialContent);
        doc.close();
        this._setInitialContent = true;
      }

      swallowInvalidHeadWarning();

      // unstable_renderSubtreeIntoContainer allows us to pass this component as
      // the parent, which exposes context to any child components.
      const callback = initialRender ? this.props.contentDidMount : this.props.contentDidUpdate;
      const mountTarget = this.getMountTarget();

      _reactDom2.default.unstable_renderSubtreeIntoContainer(this, contents, mountTarget, callback);
      resetWarnings();
    } else {
      setTimeout(this.renderFrameContents, 0);
    }
  }

  render() {
    const props = _extends({}, this.props, {
      children: undefined // The iframe isn't ready so we drop children from props here. #12, #17
    });
    delete props.initialContent;
    delete props.mountTarget;
    delete props.contentDidMount;
    delete props.contentDidUpdate;
    return _react2.default.createElement('iframe', props);
  }
}
exports.default = Frame;
Frame.propTypes = {
  style: _react.PropTypes.object, // eslint-disable-line
  initialContent: _react.PropTypes.string,
  mountTarget: _react.PropTypes.string,
  contentDidMount: _react.PropTypes.func,
  contentDidUpdate: _react.PropTypes.func,
  children: _react.PropTypes.oneOfType([_react.PropTypes.element, _react.PropTypes.arrayOf(_react.PropTypes.element)])
};
Frame.defaultProps = {
  style: {},
  children: undefined,
  mountTarget: undefined,
  contentDidMount: () => {},
  contentDidUpdate: () => {},
  initialContent: '<!DOCTYPE html><html><head></head><body><div class="frame-root"></div></body></html>'
};
module.exports = exports['default'];