// TODO: publish this, and portToReadableStream in the service worker, to

// Sends data from a ReadableStream over a MessagePort.
// This is a substitute for native transferable streams.
export const readableStreamToPort = readableStream => {
  const channel = new globalThis.MessageChannel()

  const reader = readableStream.getReader()

  const localPort = channel.port1

  localPort.addEventListener('message', event => {
    const { type } = event.data

    if (type === 'pull') {
      reader.read().then(
        ({ value, done }) => {
          // TODO: consider transferring value instead of copying it.
          // It's a tad tricky since ArrayBuffer is transferable but Uint8Array
          // is not.
          localPort.postMessage({
            type: 'data',
            value,
            done
          })
          if (done) {
            localPort.close()
          }
        },
        err => {
          localPort.postMessage({
            type: 'error',
            message: err.message
          })
          localPort.close()
        }
      )
    } else if (type === 'cancel') {
      const { message } = event.data
      reader.cancel(new Error(`stream cancelled; reason: ${message}`))
      localPort.close()
    }
  })
  localPort.start()

  return channel.port2
}
