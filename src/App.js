import React, { Component } from 'react'
import logo from './logo.svg'
import './App.css'
import 'semantic-ui-css/semantic.css'

import Chart from './Chart'
import debounce from 'lodash.debounce'

import { toTitleCase, unique } from './utils'

import {
  Grid,
  Label,
  Header,
  Container,
  Form,
  Icon,
  Table,
  Dropdown
} from 'semantic-ui-react'

const url = 'http://localhost:8080'

// generate the autocomplete list

const colors = [
  '#b21e1e',
  '#cf590c',
  '#cd9903',
  '#a7bd0d',
  '#198f35',
  '#009c95',
  '#1a69a4',
  '#502aa1',
  '#9627ba',
  '#c71f7e',
  '#805031',
  '#909090',
  '#343637'
]

const colorsToNames = {
  '#b21e1e': 'red',
  '#cf590c': 'orange',
  '#cd9903': 'yellow',
  '#a7bd0d': 'olive',
  '#198f35': 'green',
  '#009c95': 'teal',
  '#1a69a4': 'blue',
  '#502aa1': 'violet',
  '#9627ba': 'purple',
  '#c71f7e': 'pink',
  '#805031': 'brown',
  '#909090': 'grey',
  '#343637': 'black'
}

let artistsCache = {}
let artistColors = {}

// App defintion
class App extends Component {
  state = {
    artistData: [],
    isFetching: false,
    isLoadingData: false,
    selectedArtists: [],
    searchQuery: '',
    options: []
  }

  constructor(props) {
    super(props)

    this.debouncedSearch = debounce(this._requestSearch, 150)
  }

  _onChangeArtists = (e, { value }) => {
    this.setState({ selectedArtists: value })

    for (let artist of value) {
      const lc = artist.toLowerCase()
      if (!artistsCache[lc]) {
        this.setState({ isLoadingData: true })
        fetch(`${url}/artist/${lc}`)
          .then(response => response.json())
          .then(response => {
            artistsCache[lc] = response.results
            artistColors[lc] = colors[Math.floor(Math.random() * colors.length)]
            this.setState({ isLoadingData: false })
          })
      }
    }
  }

  _renderTable = () => {
    const { isLoadingData, selectedArtists } = this.state

    if (isLoadingData) {
      return null
    }

    if (selectedArtists.length === 0) {
      return null
    }

    let combinedData = []

    selectedArtists.map(artist => {
      const lc = artist.toLowerCase()

      if (artistsCache[lc] && artistsCache[lc].length > 0) {
        for (let item of artistsCache[lc]) {
          combinedData.push({
            year: item.x,
            song: item.label,
            ratio: item.y,
            color: artistColors[lc]
          })
        }
      }
    })

    combinedData = combinedData.sort((a, b) => b.ratio - a.ratio)

    return (
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Year</Table.HeaderCell>
            <Table.HeaderCell>Song</Table.HeaderCell>
            <Table.HeaderCell>Ratio</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {combinedData.map(item =>
            <Table.Row
              key={item.song + item.year}
              style={{ color: item.color }}
            >
              <Table.Cell>
                {item.year}
              </Table.Cell>
              <Table.Cell>
                {item.song}
              </Table.Cell>
              <Table.Cell>
                {item.ratio}%
              </Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table>
    )
  }

  _requestSearch = searchQuery => {
    if (searchQuery.length < 2) {
      this.setState({ isFetching: false })
      return
    } else {
      this.setState({ isFetching: true })
    }

    fetch(`${url}/autocompleteartist`, {
      method: 'POST',
      body: JSON.stringify({ query: searchQuery.toLowerCase() }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => response.json())
      .then(response => {
        this.setState({
          options: unique(
            response.results.concat(this.state.selectedArtists)
          ).map(item => {
            const tc = toTitleCase(item)
            return {
              value: tc,
              text: tc
            }
          }),
          isFetching: false
        })
      })
  }

  _handleSearchChange = (e, { searchQuery }) => {
    this.setState({ searchQuery })

    this.debouncedSearch(searchQuery)
  }

  _renderChart = () => {
    const { isLoadingData, selectedArtists } = this.state

    if (isLoadingData) {
      return <div>...Loading...</div>
    }

    if (selectedArtists.length === 0) {
      return <div>...Please select at least one artist...</div>
    }

    const renderData = selectedArtists.map(artist => {
      const lc = artist.toLowerCase()

      return {
        name: artist,
        data: artistsCache[lc],
        color: artistColors[lc]
      }
    })

    return <Chart data={renderData} selectedArtists={selectedArtists} />
  }

  renderLabel = label => {
    return (
      <Label
        content={label.text}
        color={colorsToNames[artistColors[label.text.toLowerCase()]]}
      />
    )
  }

  render() {
    const {
      selectedArtists,
      isFetchingArtistNames,
      searchQuery,
      options,
      isFetching,
      isLoadingData
    } = this.state

    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Select your artists</h1>
        </header>
        <Container style={{ marginTop: 50 }}>
          <Grid divided="vertically" textAlign="left">
            <Grid.Row columns={2}>
              <Grid.Column>
                <Header>Pick your artists</Header>
                <Form>
                  <label>Pick your artists</label>
                  <br />
                  <Dropdown
                    fluid
                    selection
                    multiple
                    search
                    options={options}
                    value={selectedArtists}
                    placeholder="Select Artists"
                    onChange={this._onChangeArtists}
                    onSearchChange={this._handleSearchChange}
                    loading={isFetching || isLoadingData}
                    renderLabel={this.renderLabel}
                  />
                </Form>
                <br />
                {this._renderTable()}
              </Grid.Column>
              <Grid.Column style={{maxHeight: 600, position: 'fixed', maxWidth: '40%', right: 50}}>
                <Header>
                  Scatter Plot of Artist's Song Similarity Over Time
                </Header>
                {this._renderChart()}
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Container>
      </div>
    )
  }
}

export default App
