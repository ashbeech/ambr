/* eslint-env browser */

import Debug from 'debug'

const debug = Debug('ambr:timeout-stream')

export function timeoutStream (readable, timeout) {
  return new ReadableStream(new TimeoutSource(readable, timeout))
}

/**
 * Runs a timer between calls to pull(), so that the timer runs only when
 * backpressure is applied. This is useful for detecting if the browser
 * no longer cares about the data.
 *
 * TODO: setTimeout/clearTimeout can be slow. Profile this to determine if
 * we need to do something smarter.
 */
class TimeoutSource {
  _timer = null

  constructor (readable, timeout) {
    this._timeout = timeout
    this._reader = readable.getReader()
  }

  async start (controller) {
    debug('stream started')
    // Run the timer until the first time pull() gets called
    this._setTimer(controller)
  }

  async pull (controller) {
    this._clearTimer()
    const { done, value } = await this._reader.read()
    if (done) {
      debug('stream ended')
      controller.close()
    } else {
      controller.enqueue(value)
      // Run the timer until the next time pull() gets called
      this._setTimer(controller)
    }
  }

  async cancel (reason) {
    debug('stream cancelled')
    this._clearTimer()
    await this._reader.cancel(reason)
  }

  _setTimer (controller) {
    this._timer = setTimeout(() => {
      debug('stream timed out')
      const err = new Error('stream timed out')
      controller.error(err)
      this._reader.cancel(err).catch(() => {})
    }, this._timeout)
  }

  _clearTimer () {
    clearTimeout(this._timer)
    this._timer = null
  }
}
