import { useContext } from 'react';
import { nest } from 'd3-collection';
import sumBy from 'lodash.sumby';
import {
  CountryGroupDataType,
  CtxDataType,
  IndicatorMetaDataType,
  RegionDataType,
  CountryData,
  ProjectLevelDataType,
  ProjectCoordsDataType,
} from '../Types';
import Context from '../Context/Context';
import { Cards } from './Cards';
import { Settings } from './Settings';
import { Graph } from './Graph';
import { ProjectsTable } from './ProjectsTable';

interface Props {
  countryGroupData: CountryGroupDataType[];
  indicators: IndicatorMetaDataType[];
  regions: RegionDataType[];
  countries: string[],
  countriesData: CountryData[],
  projectLevelData: ProjectLevelDataType[],
  projectCoordsData: ProjectCoordsDataType[],
}

const regionList = [
  { value: 'RBA', label: 'Regional Bureau for Africa (RBA)' },
  { value: 'RBAP', label: 'Regional Bureau for Asia and the Pacific (RBAP)' },
  { value: 'RBAS', label: 'Regional Bureau for Arab States (RBAS)' },
  { value: 'RBEC', label: 'Regional Bureau for Europe and the Commonwealth of Independent States (RBEC)' },
  { value: 'RBLAC', label: 'Regional Bureau on Latin America and the Caribbean (RBLAC)' },
];

export const GrapherComponent = (props: Props) => {
  const {
    countryGroupData,
    indicators,
    regions,
    countries,
    countriesData,
    projectLevelData,
    projectCoordsData,
  } = props;
  const {
    selectedTaxonomy,
  } = useContext(Context) as CtxDataType;
  const queryParams = new URLSearchParams(window.location.search);
  const queryRegion = queryParams.get('region');
  // const queryCountry = queryParams.get('country');
  const filteredProjectData = projectLevelData.filter((d) => selectedTaxonomy === 'All' || d.taxonomy_level3 === selectedTaxonomy);
  function calculateCountryTotals() {
    const groupedData = nest()
      .key((d: any) => d['Lead Country'])
      .entries(filteredProjectData);

    const countryData = groupedData.map((country) => {
      const countryGroup = countryGroupData[countryGroupData.findIndex((el) => el['Country or Area'] === country.key)];
      const region = country.values[0]['Regional Bureau'];
      const indTemp = indicators.map((indicator) => {
        const indicatorName = indicator.DataKey;
        const value = sumBy(country.values, (project:any) => project[indicatorName]);
        return (
          {
            indicator: indicatorName,
            value,
          }
        );
      });
      return ({
        ...countryGroup,
        region,
        indicatorsAvailable: indTemp.map((ind) => ind.indicator),
        indicators: indTemp,
      });
    });
    return (countryData);
  }
  const mapData = calculateCountryTotals();
  return (
    <>
      {queryRegion ? ` for ${regionList[regionList.findIndex((d) => d.value === queryRegion)].label}` : null}
      <Settings
        regions={regions}
      />
      <Cards
        data={mapData}
      />
      <div style={{ backgroundColor: 'var(--gray-200)' }}>
        <Graph
          data={mapData}
          indicators={indicators}
          projectCoordsData={projectCoordsData}
        />
      </div>
      <p className='italics' style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
        Note: This map presents data on active projects from PIMS+. Active projects are defined as being in the approved/endorsed, hard pipeline, or under implementation stages or have a status of &lsquo;implementation.&rsquo;
        <br />
        * Tagging of energy resilience projects is currently being revised and it will soon be added to the taxonomy
        <br />
        ** For calculations of  cars taken off the road we assume a typical passenger vehicle emits about 4.6 metric tons of CO2 per year
        {' '}
        (
        <a target='_black' href='https://www.epa.gov/greenvehicles/greenhouse-gas-emissions-typical-passenger-vehicle' className='undp-style'>source here</a>
        )
        <br />
        *** For calculations of equivalent tree seedlings grown, we assume the average tree absorbs an average of 10 KGs of C02 per year for the first 20 years
        {' '}
        (
        <a target='_black' href='https://onetreeplanted.org/blogs/stories/how-much-co2-does-tree-absorb' className='undp-style'>source here</a>
        )
      </p>
      <ProjectsTable
        data={projectLevelData}
        countries={countries}
        countriesData={countriesData}
      />
    </>
  );
};
