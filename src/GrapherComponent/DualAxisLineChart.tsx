import { useContext, useState } from 'react';
import styled from 'styled-components';
import { line, curveMonotoneX } from 'd3-shape';
import { scaleLinear } from 'd3-scale';
import maxBy from 'lodash.maxby';
import minBy from 'lodash.minby';
import { Select } from 'antd';
import { format } from 'd3-format';
import {
  CtxDataType, DataType, HoverDataType, IndicatorMetaDataWithYear,
} from '../Types';
import Context from '../Context/Context';
import { Tooltip } from '../Components/Tooltip';
import { MAX_TEXT_LENGTH } from '../Constants';

interface Props {
  data: DataType[];
  indicators: IndicatorMetaDataWithYear[];
  countries: string[];
}

interface DataFormattedType {
  year: number;
  param1?: number;
  param2?: number;
}

const El = styled.div`
  height: 100%;
  overflow-y: hidden;
`;

const SelectEl = styled.div`
  padding: 2rem;
  box-shadow: var(--shadow-bottom);
`;

const GraphEl = styled.div`
  height: calc(100% - 72px);
`;

const ErrorNote = styled.div`
  width: 80%;
  margin: auto;
  padding: 1rem 2rem;
  font-size: 1.8rem;
  color: var(--red);
  text-align: center;
  background-color: var(--red-bg);
  border: 1px solid var(--red);
  border-radius: 0.5rem;
  position: relative;
  top: 50%;
  transform: translateY(-50%);
`;

const InfoNote = styled.div`
  width: 80%;
  margin: auto;
  padding: 1rem 2rem;
  font-size: 1.8rem;
  color: var(--primary-blue);
  text-align: center;
  background-color: var(--blue-bg);
  border: 1px solid var(--primary-blue);
  border-radius: 0.5rem;
  position: relative;
  top: 50%;
  transform: translateY(-50%);
`;

export const DualAxisLineChart = (props: Props) => {
  const {
    data,
    indicators,
    countries,
  } = props;
  const {
    xAxisIndicator,
    yAxisIndicator,
    trendChartCountry,
    updateTrendChartCountry,
    useSameRange,
    showLabel,
  } = useContext(Context) as CtxDataType;
  const [hoverData, setHoverData] = useState<HoverDataType | undefined>(undefined);
  const queryParams = new URLSearchParams(window.location.search);
  const svgWidth = queryParams.get('showSettings') === 'false' && window.innerWidth > 960 ? 1280 : 960;
  const svgHeight = 678;
  const margin = {
    top: 40,
    bottom: 50,
    left: 90,
    right: 90,
  };
  const graphWidth = svgWidth - margin.left - margin.right;
  const graphHeight = svgHeight - margin.top - margin.bottom;

  const xIndicatorMetaData = indicators[indicators.findIndex((indicator) => indicator.IndicatorLabelTable === xAxisIndicator)];
  const yIndicatorMetaData = indicators[indicators.findIndex((indicator) => indicator.IndicatorLabelTable === yAxisIndicator)];

  const countryData = data[data.findIndex((d) => d['Country or Area'] === trendChartCountry)];

  const minYear = xIndicatorMetaData.years[0] < yIndicatorMetaData.years[0] ? xIndicatorMetaData.years[0] : yIndicatorMetaData.years[0];
  const maxYear = xIndicatorMetaData.years[xIndicatorMetaData.years.length - 1] > yIndicatorMetaData.years[yIndicatorMetaData.years.length - 1] ? xIndicatorMetaData.years[xIndicatorMetaData.years.length - 1] : yIndicatorMetaData.years[yIndicatorMetaData.years.length - 1];

  const xIndicatorIndex = countryData?.indicators.findIndex((el) => xIndicatorMetaData.DataKey === el.indicator);
  const yIndicatorIndex = countryData?.indicators.findIndex((el) => yIndicatorMetaData.DataKey === el.indicator);

  const dataFormatted: DataFormattedType[] = [];

  for (let i = minYear; i < maxYear + 1; i += 1) {
    dataFormatted.push({
      year: i,
      param1: countryData?.indicators[xIndicatorIndex].yearlyData[countryData?.indicators[xIndicatorIndex].yearlyData.findIndex((d) => d.year === i)]?.value,
      param2: countryData?.indicators[yIndicatorIndex].yearlyData[countryData?.indicators[yIndicatorIndex].yearlyData.findIndex((d) => d.year === i)]?.value,
    });
  }
  const minParam1: number = minBy(dataFormatted, (d) => d.param1)?.param1 ? minBy(dataFormatted, (d) => d.param1)?.param1 as number > 0 ? 0 : minBy(dataFormatted, (d) => d.param1)?.param1 as number : 0;
  const minParam2: number = minBy(dataFormatted, (d) => d.param2)?.param2 ? minBy(dataFormatted, (d) => d.param2)?.param2 as number > 0 ? 0 : minBy(dataFormatted, (d) => d.param2)?.param2 as number : 0;
  const maxParam1: number = maxBy(dataFormatted, (d) => d.param1)?.param1 ? maxBy(dataFormatted, (d) => d.param1)?.param1 as number : 0;
  const maxParam2: number = maxBy(dataFormatted, (d) => d.param2)?.param2 ? maxBy(dataFormatted, (d) => d.param2)?.param2 as number : 0;

  const minParam = minParam1 < minParam2 ? minParam1 : minParam2;
  const maxParam = maxParam1 > maxParam2 ? maxParam1 : maxParam2;

  const dataFilterd = dataFormatted.filter((d) => d.param1 !== undefined || d.param2 !== undefined);
  const minYearFiltered = minBy(dataFilterd, (d) => d.year)?.year ? minBy(dataFilterd, (d) => d.year)?.year : minYear;
  const maxYearFiltered = maxBy(dataFilterd, (d) => d.year)?.year ? maxBy(dataFilterd, (d) => d.year)?.year : maxYear;

  const x = scaleLinear().domain([minYearFiltered as number, maxYearFiltered as number]).range([0, graphWidth]);
  const y1 = scaleLinear().domain([useSameRange ? minParam : minParam1, useSameRange ? maxParam : maxParam1]).range([graphHeight, 0]).nice();
  const y2 = scaleLinear().domain([useSameRange ? minParam : minParam2, useSameRange ? maxParam : maxParam2]).range([graphHeight, 0]).nice();

  const dataParam1 = dataFormatted.filter((d) => d.param1 !== undefined);
  const dataParam2 = dataFormatted.filter((d) => d.param2 !== undefined);

  const lineShape1 = line()
    .defined((d: any) => d.param1 !== undefined)
    .x((d: any) => x(d.year))
    .y((d: any) => y1(d.param1))
    .curve(curveMonotoneX);
  const lineShape2 = line()
    .defined((d: any) => d.param2 !== undefined)
    .x((d: any) => x(d.year))
    .y((d: any) => y2(d.param2))
    .curve(curveMonotoneX);
  const y1Ticks = y1.ticks(5);
  const y2Ticks = y2.ticks(5);
  const xTicks = x.ticks(
    (((maxYearFiltered as number) - (minYearFiltered as number)) > 10 || ((maxYearFiltered as number) - (minYearFiltered as number)) === 0)
      ? 10
      : (maxYearFiltered as number) - (minYearFiltered as number),
  );
  return (
    <El>
      <SelectEl>
        <Select
          showSearch
          style={
            {
              width: '100%',
              borderRadius: '1rem',
            }
          }
          placeholder='Please select a country'
          onChange={(d) => { updateTrendChartCountry(d); }}
          value={trendChartCountry}
        >
          {
            countries.map((d) => (
              <Select.Option key={d}>{d}</Select.Option>
            ))
          }
        </Select>
      </SelectEl>
      <GraphEl>
        {
          trendChartCountry && dataFilterd.length > 0
            ? (
              <svg width='100%' height='100%' viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
                <g transform={`translate(${margin.left},${margin.top})`}>
                  <line
                    y1={graphHeight}
                    y2={graphHeight}
                    x1={-15}
                    x2={graphWidth + 15}
                    stroke='#AAA'
                    strokeWidth={1}
                  />
                  <g>
                    {
                      y1Ticks.map((d, i) => (
                        <g key={i}>
                          <line
                            y1={y1(d)}
                            y2={y1(d)}
                            x1={-15}
                            x2={-20}
                            stroke='#E26B8D'
                            strokeWidth={1}
                          />
                          <text
                            x={-25}
                            y={y1(d)}
                            fill='#E26B8D'
                            textAnchor='end'
                            fontSize={12}
                            dy={3}
                          >
                            {Math.abs(d) < 1 ? d : format('~s')(d).replace('G', 'B')}
                          </text>
                        </g>
                      ))
                    }
                    <line
                      y1={0}
                      y2={graphHeight}
                      x1={-15}
                      x2={-15}
                      stroke='#E26B8D'
                      strokeWidth={1}
                    />
                    <text
                      transform={`translate(-60, ${graphHeight / 2}) rotate(-90)`}
                      fill='#E26B8D'
                      textAnchor='middle'
                      fontSize={12}
                    >
                      {xIndicatorMetaData.IndicatorLabelTable.length > MAX_TEXT_LENGTH ? `${xIndicatorMetaData.IndicatorLabelTable.substring(0, MAX_TEXT_LENGTH)}...` : xIndicatorMetaData.IndicatorLabelTable}
                    </text>
                  </g>
                  <g>
                    {
                      y2Ticks.map((d, i) => (
                        <g key={i}>
                          <line
                            y1={y2(d)}
                            y2={y2(d)}
                            x1={graphWidth + 15}
                            x2={graphWidth + 20}
                            stroke='#266291'
                            strokeWidth={1}
                          />
                          <text
                            x={graphWidth + 25}
                            y={y2(d)}
                            fill='#266291'
                            textAnchor='start'
                            fontSize={12}
                            dy={3}
                            dx={-2}
                          >
                            {Math.abs(d) < 1 ? d : format('~s')(d).replace('G', 'B')}
                          </text>
                        </g>
                      ))
                    }
                    <line
                      y1={0}
                      y2={graphHeight}
                      x1={graphWidth + 15}
                      x2={graphWidth + 15}
                      stroke='#266291'
                      strokeWidth={1}
                    />
                    <text
                      transform={`translate(${graphWidth + 50}, ${graphHeight / 2}) rotate(-90)`}
                      fill='#266291'
                      textAnchor='middle'
                      fontSize={12}
                    >
                      {yIndicatorMetaData.IndicatorLabelTable.length > MAX_TEXT_LENGTH ? `${yIndicatorMetaData.IndicatorLabelTable.substring(0, MAX_TEXT_LENGTH)}...` : yIndicatorMetaData.IndicatorLabelTable}
                    </text>
                  </g>
                  <g>
                    {
                      xTicks.map((d, i) => (
                        <g key={i}>
                          <text
                            y={graphHeight}
                            x={x(d)}
                            fill='#AAA'
                            textAnchor='middle'
                            fontSize={12}
                            dy={15}
                          >
                            {d}
                          </text>
                        </g>
                      ))
                    }
                    <line
                      y1={0}
                      y2={graphHeight}
                      x1={graphWidth + 15}
                      x2={graphWidth + 15}
                      stroke='#266291'
                      strokeWidth={1}
                    />
                  </g>
                  <g>
                    <path d={lineShape1(dataFormatted as any) as string} fill='none' stroke='#E26B8D' strokeWidth={2} />
                    <path d={lineShape2(dataFormatted as any) as string} fill='none' stroke='#266291' strokeWidth={2} />
                    <path d={lineShape1(dataParam1 as any) as string} fill='none' stroke='#E26B8D' strokeWidth={2} strokeDasharray='4 8' />
                    <path d={lineShape2(dataParam2 as any) as string} fill='none' stroke='#266291' strokeWidth={2} strokeDasharray='4 8' />
                    {
                      hoverData
                        ? (
                          <line
                            y1={0}
                            y2={graphHeight}
                            x1={hoverData.rows[0].year ? x(hoverData.rows[0].year) : 0}
                            x2={hoverData.rows[0].year ? x(hoverData.rows[0].year) : 0}
                            stroke='#212121'
                            strokeDasharray='4 8'
                            strokeWidth={1}
                          />
                        ) : null
                    }
                  </g>
                  <g>
                    {
                    dataFormatted.map((d, i) => (
                      <g key={i}>
                        {
                          d.param1 !== undefined ? (
                            <g>
                              <circle
                                cx={x(d.year)}
                                cy={y1(d.param1)}
                                r={4}
                                fill='#E26B8D'
                              />
                              {
                                showLabel
                                  ? (
                                    <text
                                      x={x(d.year)}
                                      y={y1(d.param1)}
                                      dy={d.param2 !== undefined && (y1(d.param1) > y2(d.param2)) ? 16 : -8}
                                      fontSize={12}
                                      textAnchor='middle'
                                      fill='#E26B8D'
                                      strokeWidth={0.25}
                                      stroke='#fff'
                                      fontWeight='bold'
                                    >
                                      {d.param1 < 1 ? d.param1 : format('~s')(d.param1)}
                                    </text>
                                  ) : null
                              }
                            </g>
                          ) : null
                        }
                        {
                          d.param2 !== undefined ? (
                            <g>
                              <circle
                                cx={x(d.year)}
                                cy={y2(d.param2)}
                                r={4}
                                fill='#266291'
                              />
                              {
                                showLabel
                                  ? (
                                    <text
                                      x={x(d.year)}
                                      y={y2(d.param2)}
                                      dy={d.param1 !== undefined && (y1(d.param1) > y2(d.param2)) ? -8 : 16}
                                      fontSize={12}
                                      textAnchor='middle'
                                      fill='#266291'
                                      strokeWidth={0.25}
                                      stroke='#fff'
                                      fontWeight='bold'
                                    >
                                      {d.param2 < 1 ? d.param2 : format('~s')(d.param2)}
                                    </text>
                                  ) : null
                              }
                            </g>
                          ) : null
                        }
                        <rect
                          x={x(d.year) - 3}
                          y={0}
                          width={6}
                          height={graphHeight}
                          fill='#fff'
                          opacity={0}
                          onMouseEnter={(event) => {
                            setHoverData({
                              country: countryData['Country or Area'],
                              continent: countryData['Group 1'],
                              rows: [
                                {
                                  title: xAxisIndicator,
                                  value: d.param1 !== undefined ? d.param1 : 'NA',
                                  type: 'color',
                                  year: d.year,
                                  color: '#E26B8D',
                                  prefix: xIndicatorMetaData?.LabelPrefix,
                                  suffix: xIndicatorMetaData?.LabelSuffix,
                                },
                                {
                                  title: yAxisIndicator,
                                  value: d.param2 !== undefined ? d.param2 : 'NA',
                                  type: 'color',
                                  year: d.year,
                                  color: '#266291',
                                  prefix: yIndicatorMetaData?.LabelPrefix,
                                  suffix: yIndicatorMetaData?.LabelSuffix,
                                },
                              ],
                              xPosition: event.clientX,
                              yPosition: event.clientY,
                            });
                          }}
                          onMouseMove={(event) => {
                            setHoverData({
                              country: countryData['Country or Area'],
                              continent: countryData['Group 1'],
                              rows: [
                                {
                                  title: xAxisIndicator,
                                  value: d.param1 !== undefined ? d.param1 : 'NA',
                                  type: 'color',
                                  year: d.year,
                                  color: '#E26B8D',
                                  prefix: xIndicatorMetaData?.LabelPrefix,
                                  suffix: xIndicatorMetaData?.LabelSuffix,
                                },
                                {
                                  title: yAxisIndicator,
                                  value: d.param2 !== undefined ? d.param2 : 'NA',
                                  type: 'color',
                                  year: d.year,
                                  color: '#266291',
                                  prefix: yIndicatorMetaData?.LabelPrefix,
                                  suffix: yIndicatorMetaData?.LabelSuffix,
                                },
                              ],
                              xPosition: event.clientX,
                              yPosition: event.clientY,
                            });
                          }}
                          onMouseLeave={() => {
                            setHoverData(undefined);
                          }}
                        />
                      </g>
                    ))
                  }
                  </g>
                </g>
              </svg>
            ) : null
        }
        {
          !trendChartCountry ? (
            <InfoNote>
              <>Please select a country above to see the trend for that country</>
              <Select
                showSearch
                style={
                  {
                    width: '100%',
                    borderRadius: '1rem',
                  }
                }
                placeholder='Please select a country'
                value={trendChartCountry}
                onChange={(d) => { updateTrendChartCountry(d); }}
              >
                {
                  countries.map((d) => (
                    <Select.Option key={d}>{d}</Select.Option>
                  ))
                }
              </Select>
            </InfoNote>
          ) : null
        }
        {
          dataFilterd.length === 0 && trendChartCountry ? (
            <ErrorNote>
              No data available for
              {' '}
              {trendChartCountry}
            </ErrorNote>
          ) : null
        }
      </GraphEl>
      {
        hoverData ? <Tooltip data={hoverData} /> : null
      }
    </El>
  );
};
