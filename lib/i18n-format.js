import prettyBytes from 'pretty-bytes'

export const i18nFormat = (value, format, language) => {
  // Special format types
  switch (format) {
    case 'bytes':
      return formatBytes(value, language)
    case 'percent':
      return formatPercent(value, language)
  }

  // General number format
  if (typeof value === 'number') {
    return formatNumber(value, language)
  }

  // Everything else
  return value
}

export const formatNumber = (value, language) => {
  try {
    return formatNumberRaw(value, language)
  } catch {
    return value.toString()
  }
}

export const formatPercent = (value, language) => {
  try {
    return formatNumberRaw(value / 100, language, {
      style: 'percent'
    })
  } catch {
    return `${value}%`
  }
}

const byteUnits = [
  'byte',
  'kilobyte',
  'megabyte',
  'gigabyte',
  'terabyte',
  'petabyte'
]
let usePrettyBytes = false
export const formatBytes = (value, language) => {
  if (!usePrettyBytes) {
    let unit = 'byte'
    if (value > 0) {
      let unitIndex = Math.floor(Math.log10(value) / 3)
      if (Number.isFinite(unitIndex)) {
        if (unitIndex >= byteUnits.length) {
          unitIndex = byteUnits.length - 1
        } else if (unitIndex < 0) {
          unitIndex = 0
        }
        unit = byteUnits[unitIndex]
        value /= Math.pow(1000, unitIndex)
      }
    }

    // Use 'long' format only for bytes to work around weird
    // plural data in official data files at
    // https://github.com/unicode-org/icu/blob/main/icu4c/source/data/unit
    const unitDisplay = unit === 'byte' ? 'long' : 'short'

    try {
      // Safari < 14.1 doesn't support { style: 'unit' },
      // so `new Intl.NumberFormat` will throw
      return formatNumberRaw(value, language, {
        style: 'unit',
        unit,
        unitDisplay,
        maximumFractionDigits: 1
      })
    } catch {
      usePrettyBytes = true
    }
  }

  // Use pretty-bytes as a fallback. It internationalizes the number
  // but not the units; e.g. 90,3 kB in Spanish and ٩٠٫٣ kB in Arabic
  return prettyBytes(value, {
    locale: language,
    maximumFractionDigits: 1
  })
}

// This throws on error to make custom fallbacks work.
// Remember to catch errors!
const numberFormatInstances = {}
const formatNumberRaw = (value, language, options = {}) => {
  const cacheKey = `${language}-${JSON.stringify(options)}`
  let instance = numberFormatInstances[cacheKey]
  if (!instance) {
    instance = new Intl.NumberFormat(language, options)
    numberFormatInstances[cacheKey] = instance
  }

  return instance.format(value)
}
