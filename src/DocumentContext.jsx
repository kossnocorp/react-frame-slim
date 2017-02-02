import {Component, PropTypes} from 'react'

export default class DocumentContext extends Component {
  static propTypes = {
    document: PropTypes.object.isRequired,
    window: PropTypes.object.isRequired,
    children: PropTypes.element
  };

  static childContextTypes = {
    document: PropTypes.object.isRequired,
    window: PropTypes.object.isRequired
  };

  getChildContext () {
    return {
      document: this.props.document,
      window: this.props.window
    }
  }

  render () {
    return this.props.children || null
  }
}
