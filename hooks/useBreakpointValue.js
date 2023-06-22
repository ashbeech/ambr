import { useBreakpointValue as useBreakpointValueChakra } from '@chakra-ui/react'

import { useBrowser } from './useBrowser.js'

export const useBreakpointValue = values => {
  if (
    !Array.isArray(values) &&
    !(typeof values === 'object' && values !== null)
  ) {
    // For convenience, support passing a bare value (not an array or object)
    values = [values]
  }

  const { isMobile } = useBrowser()
  const value = useBreakpointValueChakra(values)

  // If running on the server side, use the browser user agent (mobile vs.
  // non-mobile) to guess the correct breakpoint value to use.
  if (value === undefined) {
    if (Array.isArray(values)) {
      // Array notation: [100, 200, 300]
      return isMobile ? values[0] : values[2] ?? values[1] ?? values[0]
    } else {
      // Object notation: { base: 100, sm: 200, md: 300 }
      return isMobile ? values.base : values.md ?? values.sm ?? values.base
    }
  }

  return value
}
