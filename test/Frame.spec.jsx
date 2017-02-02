/* eslint-env mocha */

import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'
import ReactTestUtils from 'react-addons-test-utils'
import { expect } from 'chai'
import sinon from 'sinon/pkg/sinon'
import Frame from '../src'

describe('The Frame Component', () => {
  let div

  afterEach(() => {
    if (div) {
      div.parentNode.removeChild(div)
      div = null
    }
  })

  it('should create an empty iFrame', () => {
    const frame = ReactTestUtils.renderIntoDocument(<Frame />)
    expect(frame.props.children).to.be.undefined
    expect(ReactDOM.findDOMNode(frame).contentWindow).to.be.defined
  })

  it('should not pass this.props.children in iframe render', () => {
    sinon.spy(React, 'createElement')
    const frame = ReactTestUtils.renderIntoDocument(
      <Frame className='foo'>
        <div />
      </Frame>)

    expect(React.createElement.calledWith('iframe', null))
    expect(frame.props.children).to.be.defined
  })

  it('should create an empty iFrame and apply inline styles', () => {
    const frame = ReactTestUtils.renderIntoDocument(<Frame style={{ border: 0 }} />)
    expect(frame.props.style).to.deep.equal({ border: 0 })
    expect(ReactDOM.findDOMNode(frame).style.border).to.contain('0')
  })

  it('should pass along all props to underlying iFrame', () => {
    const frame = ReactTestUtils.renderIntoDocument(
      <Frame
        className='test-class-1 test-class-2'
        frameBorder={0}
        height='100%'
        width='80%'
      />)
    const node = ReactDOM.findDOMNode(frame)
    expect(frame.props.className).to.equal('test-class-1 test-class-2')
    expect(frame.props.frameBorder).to.equal(0)
    expect(frame.props.height).to.equal('100%')
    expect(frame.props.width).to.equal('80%')
    expect(node.className).to.equal('test-class-1 test-class-2')
    expect(node.getAttribute('frameBorder')).to.equal('0')
    expect(node.getAttribute('height')).to.equal('100%')
    expect(node.getAttribute('width')).to.equal('80%')
  })

  it('should re-render inside the iframe correctly', () => {
    div = document.body.appendChild(document.createElement('div'))
    const component1 = ReactDOM.render(
      <Frame>
        <p>Test 1</p>
      </Frame>,
      div,
    )
    const body1 = ReactDOM.findDOMNode(component1).contentDocument.body
    const p1 = body1.querySelector('p')

    expect(p1.textContent).to.equal('Test 1')
    p1.setAttribute('data-test-value', 'set on dom')

    const component2 = ReactDOM.render(
      <Frame>
        <p>Test 2</p>
      </Frame>,
      div,
    )
    const body2 = ReactDOM.findDOMNode(component2).contentDocument.body
    const p2 = body2.querySelector('p')

    expect(p2.textContent).to.equal('Test 2')
    expect(p2.getAttribute('data-test-value')).to.equal('set on dom')
  })

  it('should pass context to components in the frame', () => {
    div = document.body.appendChild(document.createElement('div'))

    class Parent extends React.Component {
      static childContextTypes = {
        color: PropTypes.string
      };

      static propTypes = {
        children: PropTypes.element.isRequired
      };

      getChildContext () {
        return { color: 'purple' }
      }

      render () {
        return (
          <div>
            {this.props.children}
          </div>
        )
      }
    }

    const Child = (props, context) => (
      <div className='childDiv'>
        {context.color}
      </div>
    )
    Child.contextTypes = {
      color: PropTypes.string.isRequired
    }

    ReactDOM.render(
      <Parent>
        <Frame>
          <Child />
        </Frame>
      </Parent>
    , div)

    const frame = div.querySelector('iframe')
    expect(frame).to.not.be.null
    expect(frame.contentDocument.body.querySelector('.childDiv').innerHTML).to.equal('purple')
  })

  it('should allow setting initialContent', () => {
    div = document.body.appendChild(document.createElement('div'))

    const initialContent = '<!DOCTYPE html><html><head><script>console.log("foo");</script></head><body><div></div></body></html>'
    const renderedContent = '<html><head><script>console.log("foo");</script></head><body><div><!-- react-empty: 1 --></div></body></html>'
    const frame = ReactDOM.render(
      <Frame initialContent={initialContent} />
    , div)
    const doc = ReactDOM.findDOMNode(frame).contentDocument
    expect(doc.documentElement.outerHTML).to.equal(renderedContent)
  })

  it('should allow setting mountTarget', () => {
    div = document.body.appendChild(document.createElement('div'))

    const initialContent = '<!DOCTYPE html><html><head></head><body><h1>i was here first</h1><div id=\'mountHere\'></div></body></html>'
    const frame = ReactDOM.render(
      <Frame initialContent={initialContent} mountTarget='#mountHere'>
        <h1>And i am joining you</h1>
      </Frame>
    , div)
    const doc = ReactDOM.findDOMNode(frame).contentDocument
    expect(doc.querySelectorAll('h1').length).to.equal(2)
  })

  it('should call contentDidMount on initial render', () => {
    div = document.body.appendChild(document.createElement('div'))

    const didMount = sinon.spy()
    const didUpdate = sinon.spy()
    ReactDOM.render(
      <Frame contentDidMount={didMount} contentDidUpdate={didUpdate} />
    , div)

    expect(didMount.callCount).to.equal(1)
    expect(didUpdate.callCount).to.equal(0)
  })

  it('should call contentDidUpdate on subsequent updates', (done) => {
    div = document.body.appendChild(document.createElement('div'))

    const didMount = sinon.spy()
    const didUpdate = sinon.spy()
    const frame = ReactDOM.render(
      <Frame contentDidMount={didMount} contentDidUpdate={didUpdate} />
    , div)

    frame.setState({ foo: 'bar' }, () => {
      expect(didMount.callCount).to.equal(1)
      expect(didUpdate.callCount).to.equal(1)
      done()
    })
  })

  it('should return first child element of the `body` on call to `this.getMountTarget()` if `props.mountTarget` was not passed in', () => {
    div = document.body.appendChild(document.createElement('div'))

    const frame = ReactDOM.render(<Frame />, div)
    const body = ReactDOM.findDOMNode(frame).contentDocument.body

    expect(Frame.prototype.getMountTarget.call(frame)).to.equal(body.children[0])
  })

  it('should return resolved `props.mountTarget` node on call to `this.getMountTarget()` if `props.mountTarget` was passed in', () => {
    div = document.body.appendChild(document.createElement('div'))
    const initialContent = '<!DOCTYPE html><html><head></head><body><div></div><div id=\'container\'></div></body></html>'

    const frame = ReactDOM.render(<Frame initialContent={initialContent} mountTarget='#container' />, div)
    const body = ReactDOM.findDOMNode(frame).contentDocument.body
    div = document.body.appendChild(document.createElement('div'))

    expect(Frame.prototype.getMountTarget.call(frame)).to.equal(body.querySelector('#container'))
  })
})
