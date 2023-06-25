/* ************************************************************************************************
 *                                                                                                *
 * Please read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */

/**
 * Returns the rectangle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(recWidth, recHeight) {
  return {
    width: recWidth,
    height: recHeight,
    getArea: () => recWidth * recHeight,
  };
}

/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
}

/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  const obj = JSON.parse(json);
  const values = Object.values(obj);

  return new proto.constructor(...values);
}

/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurrences
 *
 * All types of selectors can be combined using the combination ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string representation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */

const ELEMENTS = {
  TAG: 'TAG',
  ID: 'ID',
  CLASS: 'CLASS',
  ATTRIBUTE: 'ATTRIBUTE',
  PSEUDO_CLASS: 'PSEUDO-CLASS',
  PSEUDO_ELEMENT: 'PSEUDO-ELEMENT',
};

class SelectorBuilder {
  constructor() {
    this.elementsPathOrder = [
      ELEMENTS.TAG,
      ELEMENTS.ID,
      ELEMENTS.CLASS,
      ELEMENTS.ATTRIBUTE,
      ELEMENTS.PSEUDO_CLASS,
      ELEMENTS.PSEUDO_ELEMENT,
    ];

    this.map = new Map();
    this.combineSelector = false;
  }

  element(value) {
    this.checkElementExist();
    this.checkElementOrder(ELEMENTS.TAG);
    this.map.set(ELEMENTS.TAG, value);
    return this;
  }

  id(value) {
    this.checkIdExist();
    this.checkElementOrder(ELEMENTS.ID);
    this.map.set(ELEMENTS.ID, `#${value}`);
    return this;
  }

  class(value) {
    this.checkElementOrder(ELEMENTS.CLASS);
    this.setArrayValueToMap(ELEMENTS.CLASS, `.${value}`);
    return this;
  }

  attr(value) {
    this.checkElementOrder(ELEMENTS.ATTRIBUTE);
    this.setArrayValueToMap(ELEMENTS.ATTRIBUTE, `[${value}]`);
    return this;
  }

  pseudoClass(value) {
    this.checkElementOrder(ELEMENTS.PSEUDO_CLASS);
    this.setArrayValueToMap(ELEMENTS.PSEUDO_CLASS, `:${value}`);
    return this;
  }

  pseudoElement(value) {
    this.checkPseudoElementExist();
    this.checkElementOrder(ELEMENTS.PSEUDO_ELEMENT);
    this.map.set(ELEMENTS.PSEUDO_ELEMENT, `::${value}`);
    return this;
  }

  stringify() {
    if (this.combineSelector) {
      this.combineSelector = false;
      return `${this.selector1.stringify()} ${
        this.combinator
      } ${this.selector2.stringify()}`;
    }

    let result = '';

    this.map.forEach((value) => {
      result += Array.isArray(value) ? value.join('') : value;
    });

    return result;
  }

  setArrayValueToMap(key, value) {
    const elements = this.map.get(key);

    if (elements) {
      elements.push(value);
    } else {
      this.map.set(key, [value]);
    }
  }

  checkPseudoElementExist() {
    if (this.map.has(ELEMENTS.PSEUDO_ELEMENT)) {
      throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    }
  }

  checkIdExist() {
    if (this.map.has(ELEMENTS.ID)) {
      throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    }
  }

  checkElementExist() {
    if (this.map.has(ELEMENTS.TAG)) {
      throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    }
  }

  checkElementOrder(element) {
    const index = this.elementsPathOrder.indexOf(element);
    for (let i = index + 1; i < this.elementsPathOrder.length; i += 1) {
      if (this.map.has(this.elementsPathOrder[i])) {
        throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
      }
    }
  }

  combine(selector1, combinator, selector2) {
    this.selector1 = selector1;
    this.combinator = combinator;
    this.selector2 = selector2;
    this.combineSelector = true;
    return this;
  }
}

const cssSelectorBuilder = {
  elements: [],

  element(value) {
    return new SelectorBuilder().element(value);
  },

  id(value) {
    return new SelectorBuilder().id(value);
  },

  class(value) {
    return new SelectorBuilder().class(value);
  },

  attr(value) {
    return new SelectorBuilder().attr(value);
  },

  pseudoClass(value) {
    return new SelectorBuilder().pseudoClass(value);
  },

  pseudoElement(value) {
    return new SelectorBuilder().pseudoElement(value);
  },

  combine(selector1, combinator, selector2) {
    return new SelectorBuilder().combine(selector1, combinator, selector2);
  },
};

module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
