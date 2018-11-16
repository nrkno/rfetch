/* global */
export default function windowFeatureIsSupported (feature) {
  try {
    return window[feature].constructor !== null
  } catch (e) {
    return false
  }
}
