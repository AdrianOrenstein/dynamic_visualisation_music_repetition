export function unique(arr) {
  var u = {},
    a = []
  for (var i = 0, l = arr.length; i < l; ++i) {
    if (!u.hasOwnProperty(arr[i])) {
      a.push(arr[i])
      u[arr[i]] = 1
    }
  }
  return a
}

export function toTitleCase(str) {
  return String(str).replace(/\w\S*/g, txt => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  })
}
