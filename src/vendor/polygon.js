/* eslint-disable */

/* ==============================
        DEFAULTS
    ============================== */

const computedStyle =
  typeof window !== 'undefined' ? window.getComputedStyle : () => null

Number.prototype.toFixed = function (n) {
  const fix = Math.pow(10, n || 0)
  return Math.round(this * fix) / fix
}

/* ==============================
        CONSTRUCTOR
    ============================== */

export function Polygon(element, nSides) {
  this.el = element
  this.nSides =
    typeof nSides !== 'number' || nSides < 2 ? 3 : nSides > 360 ? 360 : nSides
  this.init()
}

/* ==============================
        PUBLIC
    ============================== */

Polygon.prototype = {
  init: function () {
    this.el.classList.add('polygon')
    _createShape(this.el, this.nSides)
  },
}

/* ==============================
        PRIVATE
    ============================== */

var // create a new shape and append it at target element
  _createShape = function (el, nS) {
    const content = el.innerHTML
    const angle = 360 / nS
    let shape
    let layer
    let top
    let bottom
    const wEl = _fixNum(computedStyle(el).width)
    const hEl = _fixNum(computedStyle(el).height)
    const wShape = _fixNum(wEl * Math.sqrt(2))
    const wLayer = _fixNum(Math.sin(Math.PI / nS) * wShape)
    const lLayer = _fixNum((wEl - wLayer) / 2)
    const tzLayer = _fixNum((wShape / 2) * Math.cos(Math.PI / nS))
    const lCovers = _fixNum(-(wShape - wEl) / 2)
    const tCovers = _fixNum(-(wShape - hEl) / 2)
    const tzCovers = _fixNum(hEl / 2)
    const triangleFix =
      nS == 3 ? _fixNum((wShape - (wLayer / 2) * Math.sqrt(3)) / 2) : false
    let i = 1

    // set defaults at element
    el.innerHTML = ''

    // create a polygon
    shape = document.createElement('div')
    shape.classList.add('shape', 'sides-' + nS)

    for (; i <= nS; i++) {
      // create a new layer
      layer = _createLayer('l' + i, {
        width: wLayer + 'px',
        left: lLayer + 'px',

        // calc width and position of each layer
        transform:
          'rotateY(' +
          angle * (nS - i + 1) +
          'deg) translateZ(' +
          tzLayer +
          'px)',
      })

      // insert front/back faces of layer
      layer.innerHTML = '<div class="front"></div><div class="back"></div>'

      // append the layer at shape
      shape.appendChild(layer)
    }

    // create and insert the top/bottom layer
    top = _createLayer('top', {
      transform:
        'rotateX(90deg) translateZ(' +
        tzCovers +
        'px)' +
        (triangleFix ? ' translateY(' + -triangleFix + 'px)' : ''),
    })
    bottom = _createLayer('bottom', {
      transform:
        'rotateX(270deg) translateZ(' +
        tzCovers +
        'px)' +
        (triangleFix ? ' translateY(' + triangleFix + 'px)' : ''),
    })

    top.style.width =
      bottom.style.width =
      top.style.height =
      bottom.style.height =
        wShape + 'px'

    top.style.top = bottom.style.top = tCovers + 'px'
    top.style.left = bottom.style.left = lCovers + 'px'

    shape.insertBefore(top, shape.firstChild)
    shape.appendChild(bottom)

    // append the shape at element
    el.appendChild(shape)

    // insert the content of element at front face of first layer
    shape.querySelector('.front').innerHTML = content
  }

// classes: string sepa,rated with whitespace ' '
// style: object with property/value
var _createLayer = function (classes, style) {
  const layer = document.createElement('div')
  var classes = classes.split(' ')
  let s

  // set default and specifics classes of layer
  classes.push('layer')
  classes.forEach(function (value) {
    layer.classList.add(value)
  })

  _setStyle(layer, style)

  return layer
}

var _setStyle = function (el, prop, val) {
  // set properties with the specif prefix of browser
  if (typeof prop === 'object') {
    const style = prop
    let s

    // set style
    for (s in style) {
      _setStyle(el, s, style[s])
    }
  } else {
    el.style[prop.toLowerCase()] = el.style[
      _prefixCSS() + (prop.charAt(0).toUpperCase() + prop.slice(1))
    ] = val
  }
}

var _prefixCSS = function () {
  const style = computedStyle(document.documentElement)
  let pfx
  let i

  // search and return specific prefix of browser
  for (i in style) {
    pfx = i.match(/^(moz|webkit|ms)/gi)

    if (pfx) {
      return pfx
    }
  }
}

var _fixNum = function (n) {
  if (typeof n !== 'number') {
    n = parseInt(n)
  }

  return n.toFixed(2)
}
