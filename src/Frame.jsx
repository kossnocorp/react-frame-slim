import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import DocumentContext from './DocumentContext'

export default class Frame extends Component {
  // React warns when you render directly into the body since browser extensions
  // also inject into the body and can mess up React. For this reason
  // initialContent is expected to have a div inside of the body
  // element that we render react into.
  static propTypes = {
    iframeProps: PropTypes.object,
    initialContent: PropTypes.string,
    mountTarget: PropTypes.string,
    contentDidMount: PropTypes.func,
    contentDidUpdate: PropTypes.func,
    children: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.arrayOf(PropTypes.element)
    ])
  };

  static defaultProps = {
    contentDidMount: () => {},
    contentDidUpdate: () => {},
    initialContent: '<!DOCTYPE html><html><head></head><body><div></div></body></html>'
  };

  constructor (props, context) {
    super(props, context)
    this._isMounted = false
  }

  componentDidMount () {
    this._isMounted = true
    this.renderFrameContents()
  }

  componentDidUpdate () {
    this.renderFrameContents()
  }

  componentWillUnmount () {
    this._isMounted = false
    const doc = this.getDoc()
    if (doc) {
      ReactDOM.unmountComponentAtNode(this.getMountTarget())
    }
  }

  getDoc () {
    return ReactDOM.findDOMNode(this).contentDocument; // eslint-disable-line
  }

  getMountTarget () {
    const doc = this.getDoc()
    if (this.props.mountTarget) {
      return doc.querySelector(this.props.mountTarget)
    }
    return doc.body.children[0]
  }

  renderFrameContents () {
    // TODO: Write test for it
    if (!this._isMounted) {
      return
    }

    const doc = this.getDoc()
    if (doc && doc.readyState === 'complete') {
      const win = doc.defaultView || doc.parentView // TODO: Write tests for it (|| cond)
      const initialRender = !this._setInitialContent
      const contents = (
        <DocumentContext document={doc} window={win}>
          {this.props.children}
        </DocumentContext>
      )

      if (initialRender) {
        doc.open()
        doc.write(this.props.initialContent)
        doc.close()
        this._setInitialContent = true
      }

      // unstable_renderSubtreeIntoContainer allows us to pass this component as
      // the parent, which exposes context to any child components.
      const callback = initialRender ? this.props.contentDidMount : this.props.contentDidUpdate
      const mountTarget = this.getMountTarget()

      ReactDOM.unstable_renderSubtreeIntoContainer(this, contents, mountTarget, callback)
    } else {
      setTimeout(this.renderFrameContents, 0)
    }
  }

  render () {
    return <iframe {...this.props.iframeProps || {}} />
  }
}
