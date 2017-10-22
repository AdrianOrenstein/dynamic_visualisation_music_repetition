import React, { Component } from 'react'
import {
  VictoryScatter,
  VictoryChart,
  VictoryTheme,
  VictoryLegend,
  VictoryTooltip,
  VictoryGroup,
  VictoryAxis,
  VictoryLabel
} from 'victory'

class Chart extends Component {
  render() {
    const { data, selectedArtists } = this.props

    return (
      <VictoryChart theme={VictoryTheme.material}>
        <VictoryGroup>
          {data.map(artist => {
            return (
              <VictoryScatter
                data={artist.data}
                labelComponent={<VictoryTooltip />}
                key={artist.name}
                style={{
                  data: {
                    fill: artist.color
                  }
                }}
              />
            )
          })}
        </VictoryGroup>
        <VictoryAxis
          label="Year"
          tickFormat={t => `${Math.round(t)}`}
          axisLabelComponent={<VictoryLabel dy={25} />}
        />
        <VictoryAxis
          label="Repetition Percentage"
          dependentAxis
          tickFormat={t => `  ${Math.round(t)}%`}
          axisLabelComponent={<VictoryLabel dy={-30} />}
          tickLabelComponent={<VictoryLabel dx={5} />}
        />
      </VictoryChart>
    )
  }
}

export default Chart
