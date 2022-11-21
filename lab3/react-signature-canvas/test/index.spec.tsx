import { jest, describe, it, test, expect } from '@jest/globals'
import { render, RenderResult } from '@testing-library/react'
import React from 'react'

import { SignatureCanvas, SignatureCanvasProps } from '../src/index'
import { propsF, dotF } from './fixtures'

function renderSCWithRef (props?: SignatureCanvasProps): { wrapper: RenderResult, instance: SignatureCanvas, ref: React.RefObject<SignatureCanvas> } {
  const ref = React.createRef<SignatureCanvas>()
  const wrapper = render(<SignatureCanvas {...props} ref={ref} />)
  const instance = ref.current! // eslint-disable-line @typescript-eslint/no-non-null-assertion -- this simplifies the code; it does exist immediately after render. it won't exist after unmount, but we literally test for that separately
  return { wrapper, instance, ref }
}

test('mounts canvas and instance properly', () => {
  const { wrapper: { container }, instance } = renderSCWithRef()
  expect(container.querySelector('canvas')).toBeTruthy()
  expect(instance.isEmpty()).toBe(true)
})

describe('setting and updating props', () => {
  it('should set default props', () => {
    const { instance } = renderSCWithRef()
    expect(instance.props).toStrictEqual(SignatureCanvas.defaultProps)
  })

  it('should set initial mount props and SigPad options', () => {
    const { instance } = renderSCWithRef(propsF.all)
    const sigPad = instance.getSignaturePad()

    expect(instance.props).toMatchObject(propsF.all)
    expect(sigPad).toMatchObject(propsF.sigPadOptions)
  })

  it('should update props and SigPad options', () => {
    const { wrapper, instance, ref } = renderSCWithRef()
    const sigPad = instance.getSignaturePad()

    // default props and options should not match new ones
    expect(instance.props).not.toMatchObject(propsF.all)
    expect(sigPad).not.toMatchObject(propsF.sigPadOptions)

    // should match when updated
    wrapper.rerender(<SignatureCanvas ref={ref} {...propsF.all} />)
    expect(instance.props).toMatchObject(propsF.all)
    expect(sigPad).toMatchObject(propsF.sigPadOptions)
  })
})

describe('SigCanvas wrapper methods return equivalent to SigPad', () => {
  const { instance } = renderSCWithRef()
  const rSigPad = instance
  const sigPad = rSigPad.getSignaturePad()

  test('toData should be equivalent', () => {
    const rData = rSigPad.toData()
    expect(rData).toStrictEqual([])
    expect(rData).toBe(sigPad.toData())
  })

  test('fromData should be equivalent', () => {
    rSigPad.fromData(dotF.data)
    const rData = rSigPad.toData()
    expect(rData).toBe(dotF.data)
    expect(rData).toBe(sigPad.toData())

    // test reverse as both froms should be equivalent
    sigPad.fromData(dotF.data)
    const data = sigPad.toData()
    expect(rData).toBe(data)
    expect(rSigPad.toData()).toBe(data)
  })

  test('toDataURL should be equivalent', () => {
    rSigPad.fromData(dotF.data)
    expect(rSigPad.toDataURL()).toBe(sigPad.toDataURL())
    expect(rSigPad.toDataURL('image/jpg')).toBe(sigPad.toDataURL('image/jpg'))
    expect(rSigPad.toDataURL('image/jpg', 0.7)).toBe(sigPad.toDataURL('image/jpg', 0.7))
    expect(rSigPad.toDataURL('image/svg+xml')).toBe(sigPad.toDataURL('image/svg+xml'))
  })

  test('fromDataURL should be equivalent', () => {
    // convert data fixture to dataURL
    rSigPad.fromData(dotF.data)
    const dotFDataURL = rSigPad.toDataURL()

    rSigPad.fromDataURL(dotFDataURL)
    const rDataURL = rSigPad.toDataURL()
    expect(rDataURL).toBe(dotFDataURL)
    expect(rDataURL).toBe(sigPad.toDataURL())

    // test reverse as both froms should be equivalent
    sigPad.fromDataURL(dotFDataURL)
    const dataURL = sigPad.toDataURL()
    expect(rDataURL).toBe(dataURL)
    expect(rSigPad.toDataURL()).toBe(dataURL)
  })

  test('isEmpty & clear should be equivalent', () => {
    rSigPad.fromData(dotF.data)
    let isEmpty = rSigPad.isEmpty()
    expect(isEmpty).toBe(false)
    expect(isEmpty).toBe(sigPad.isEmpty())

    // both empty after clear
    rSigPad.clear()
    isEmpty = rSigPad.isEmpty()
    expect(isEmpty).toBe(true)
    expect(isEmpty).toBe(sigPad.isEmpty())

    // test reverse
    sigPad.fromData(dotF.data)
    isEmpty = rSigPad.isEmpty()
    expect(isEmpty).toBe(false)
    expect(isEmpty).toBe(sigPad.isEmpty())

    // both empty after internal sigPad clear
    sigPad.clear()
    isEmpty = rSigPad.isEmpty()
    expect(isEmpty).toBe(true)
    expect(isEmpty).toBe(sigPad.isEmpty())
  })
})

// comes after props and wrapper methods as it uses both
describe('get methods', () => {
  const { instance } = renderSCWithRef({ canvasProps: dotF.canvasProps })
  instance.fromData(dotF.data)

  test('getCanvas should return the same underlying canvas', () => {
    const canvas = instance.getCanvas()
    expect(instance.toDataURL()).toBe(canvas.toDataURL())
  })

  test('getTrimmedCanvas should return a trimmed canvas', () => {
    const trimmed = instance.getTrimmedCanvas()
    expect(trimmed.width).toBe(dotF.trimmedSize.width)
    expect(trimmed.height).toBe(dotF.trimmedSize.height)
  })
})

// comes after props, wrappers, and gets as it uses them all
describe('canvas resizing', () => {
  const { wrapper, instance, ref } = renderSCWithRef()
  const canvas = instance.getCanvas()

  it('should clear on resize', () => {
    instance.fromData(dotF.data)
    expect(instance.isEmpty()).toBe(false)

    window.resizeTo(500, 500)
    expect(instance.isEmpty()).toBe(true)
  })

  it('should not clear when clearOnResize is false', () => {
    wrapper.rerender(<SignatureCanvas ref={ref} clearOnResize={false} />)

    instance.fromData(dotF.data)
    expect(instance.isEmpty()).toBe(false)

    window.resizeTo(500, 500)
    expect(instance.isEmpty()).toBe(false)
  })

  const size = { width: 100, height: 100 }
  it('should not change size if fixed width & height', () => {
    // reset clearOnResize back to true after previous test
    wrapper.rerender(<SignatureCanvas ref={ref} clearOnResize canvasProps={size} />)
    window.resizeTo(500, 500)

    expect(canvas.width).toBe(size.width)
    expect(canvas.height).toBe(size.height)
  })

  it('should change size if no width or height', () => {
    wrapper.rerender(<SignatureCanvas ref={ref} canvasProps={{}} />)
    window.resizeTo(500, 500)

    expect(canvas.width).not.toBe(size.width)
    expect(canvas.height).not.toBe(size.height)
  })

  it('should partially change size if one of width or height', () => {
    wrapper.rerender(<SignatureCanvas ref={ref} canvasProps={{ width: size.width }} />)
    window.resizeTo(500, 500)

    expect(canvas.width).toBe(size.width)
    expect(canvas.height).not.toBe(size.height)

    // now do height instead
    wrapper.rerender(<SignatureCanvas ref={ref} canvasProps={{ height: size.height }} />)
    window.resizeTo(500, 500)

    expect(canvas.width).not.toBe(size.width)
    expect(canvas.height).toBe(size.height)
  })
})

// comes after wrappers and resizing as it uses both
describe('on & off methods', () => {
  const { wrapper, instance } = renderSCWithRef()

  it('should not clear when off, should clear when back on', () => {
    instance.fromData(dotF.data)
    expect(instance.isEmpty()).toBe(false)

    instance.off()
    window.resizeTo(500, 500)
    expect(instance.isEmpty()).toBe(false)

    instance.on()
    window.resizeTo(500, 500)
    expect(instance.isEmpty()).toBe(true)
  })

  it('should no longer fire after unmount', () => {
    // monkey-patch on with a mock to tell if it were called, as there's no way
    // to check what event listeners are attached to window
    const origOn = instance.on
    instance.on = jest.fn(origOn)

    wrapper.unmount()
    window.resizeTo(500, 500)
    expect(instance.on).not.toBeCalled()
  })
})

// unmounting comes last
describe('unmounting', () => {
  const { wrapper, instance } = renderSCWithRef()

  it('should error when retrieving instance variables', () => {
    wrapper.unmount()
    expect(() => {
      instance.getCanvas()
    }).toThrowError(SignatureCanvas.refNullError)
    expect(() => {
      instance.getSignaturePad()
    }).toThrowError(SignatureCanvas.refNullError)
  })
})
