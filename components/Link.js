import NextLink from 'next/link'
import { forwardRef, Link as ChakraLink } from '@chakra-ui/react'

import { ExternalLinkIcon } from './icons/ExternalLinkIcon.js'

const EXAMPLE_ORIGIN = 'http://example.com:9999'

export const Link = forwardRef(
  (
    { href, isExternal, showExternalIcon, children, prefetch, ...rest },
    ref
  ) => {
    const url = new URL(href, EXAMPLE_ORIGIN)

    if (isExternal == null) {
      isExternal =
        url.origin !== EXAMPLE_ORIGIN &&
        ['http:', 'https:'].includes(url.protocol)
    }

    if (showExternalIcon == null) showExternalIcon = isExternal

    let externalIcon = null
    if (showExternalIcon) {
      externalIcon = <ExternalLinkIcon ms={1} height='auto' width={3.5} />
    }

    if (isExternal) {
      return (
        <ChakraLink href={href} isExternal ref={ref} {...rest}>
          {children}
          {externalIcon}
        </ChakraLink>
      )
    } else {
      const nextLinkProps = {}
      if (prefetch === false) nextLinkProps.prefetch = false
      return (
        <NextLink href={href} passHref {...nextLinkProps}>
          <ChakraLink ref={ref} {...rest}>
            {children}
            {externalIcon}
          </ChakraLink>
        </NextLink>
      )
    }
  }
)
