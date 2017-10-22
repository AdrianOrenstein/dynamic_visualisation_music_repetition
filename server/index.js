// grab the packages we need
import express from 'express'
import fs from 'fs'

const app = express()
const port = process.env.PORT || 8080

// POST parameter parsing
import bodyParser from 'body-parser'
app.use(bodyParser.json()) // we'll be using json objects

// add CORS
import cors from 'cors'
app.use(cors())

// csv parsing
import parse from 'csv-parse'

import { unique } from './utils'

let data = []
let artistNames = []

function toTitleCase(str) {
  return String(str).replace(/\w\S*/g, txt => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  })
}

// load data into memory
const streamParser = parse({ delimiter: ',', columns: true }, (err, d) => {
  data = d
  artistNames = unique(d.map(item => item.artist))
})

// read the dataset file
fs.createReadStream(__dirname + '/dataset.csv').pipe(streamParser)

// autocomplete
app.post('/autocompleteartist', function(req, res) {
  console.log(req.body)
  const query = req.body.query

  if (query.length < 2) {
    res.send({ results: [] })
    return
  }

  // filter by start of the artist name
  const results = artistNames.filter(item => item.startsWith(query))

  res.send({ results })
})

// get artist
app.get('/artist/:artist', function(req, res) {
  const artist = req.params.artist

  // filter by exact artist name
  const results = data.filter(item => item.artist === artist).map(item => ({
    x: parseInt(item.year, 10),
    y: parseFloat(item.ratio),
    label: toTitleCase(item.song)
  }))

  res.send({ results })
})

// start the server
app.listen(port)

console.log('Server started on port ' + port)
