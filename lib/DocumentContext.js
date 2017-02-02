'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// eslint-disable-line no-unused-vars

class DocumentContext extends _react.Component {

  getChildContext() {
    return {
      document: this.props.document,
      window: this.props.window
    };
  }

  render() {
    return this.props.children || null;
  }
}
exports.default = DocumentContext;
DocumentContext.propTypes = {
  document: _react.PropTypes.object.isRequired,
  window: _react.PropTypes.object.isRequired,
  children: _react.PropTypes.element
};
DocumentContext.childContextTypes = {
  document: _react.PropTypes.object.isRequired,
  window: _react.PropTypes.object.isRequired
};
module.exports = exports['default'];