import type { CSSProperties } from '@stitches/react'

type KeyVariants<KeyMap, Prop extends keyof CSSProperties> = {
  [K in keyof KeyMap]: {
    [P in Prop]: `$${K extends string | number ? K : never}`
  }
}

/**
 * Function used to map keys of an object to variants using an specified css property.
 * @param map: Map object holding key-value pairs.
 * @param prop: CSS property or function used to generate set of variants.
 * @returns keyVariants<MapObject, Prop>
 */
export const mapKeysToVariants = <
  MapObject extends { [key: string | number]: any },
  CSSProp extends
    | keyof CSSProperties
    | ((key: keyof MapObject) => CSSProperties)
>(
  map: MapObject,
  prop: CSSProp
): KeyVariants<MapObject, keyof CSSProperties> =>
  Object.keys(map).reduce((acc, key) => {
    let newProp: CSSProperties = {}
    if (typeof prop === 'string') {
      newProp = { [key]: { [prop.toString()]: `$${String(key)}` } }
    } else {
      newProp = { [key]: prop(key) }
    }
    return {
      ...acc,
      ...newProp,
    }
  }, {}) as KeyVariants<MapObject, keyof CSSProperties>
