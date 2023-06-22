import { Box, Container } from '@chakra-ui/react'

export const SafeContainer = props => (
  <Box pl='env(safe-area-inset-left)' pr='env(safe-area-inset-right)'>
    <Container {...props} />
  </Box>
)
