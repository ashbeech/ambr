export const withTimeout = async (promise, timeout) => {
  let timer

  const result = await Promise.race([
    promise,
    new Promise((resolve, reject) => {
      timer = setTimeout(() => {
        reject(new Error('Timeout'))
      }, timeout)
    })
  ])

  clearTimeout(timer)
  return result
}
