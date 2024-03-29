/* eslint-disable jsx-a11y/iframe-has-title */
import {
  useState, useEffect, useReducer, useRef,
} from 'react';
import styled from 'styled-components';
import { json, csv } from 'd3-request';
import { queue } from 'd3-queue';
import { useTranslation } from 'react-i18next';
import { Tabs } from 'antd';
import {
  CountryGroupDataType, IndicatorMetaDataType, RegionDataType, CountryIndicatorMetaDataType, CountryIndicatorDataType, CountryData, ProjectLevelDataType, ProjectCoordsDataType, ROOT_DIR,
} from './Types';
import { Global } from './Global';
import { CountryProfile } from './CountryProfile';
import Reducer from './Context/Reducer';
import Context from './Context/Context';
import { DEFAULT_VALUES } from './Constants';

/* eslint no-console: ["error", { allow: ["warn", "error", "log"] }] */

const VizAreaEl = styled.div`
  display: flex;
  max-width: 1220px;
  margin: auto;
  align-items: center;
  justify-content: center;
  height: 6.25rem;
`;

interface Props {
  language: string;
}

const App = (props: Props) => {
  const { language } = props;
  // console.log('language: ', language);
  const containerEl = useRef(null);
  const [countryGroupData, setCountryGroupData] = useState<CountryGroupDataType[] | undefined>(undefined);
  const [indicatorsList, setIndicatorsList] = useState<IndicatorMetaDataType[] | undefined>(undefined);
  const [regionList, setRegionList] = useState<RegionDataType[] | undefined>(undefined);
  const [countryList, setCountryList] = useState<string[] | undefined>(undefined);
  const [allCountriesData, setAllCountriesData] = useState<CountryData[] | undefined>(undefined);
  const [projectLevelData, setProjectLevelData] = useState<ProjectLevelDataType[] | undefined>(undefined);
  const [projectCoords, setProjectCoordsData] = useState<ProjectCoordsDataType[] | undefined>(undefined);

  const queryParams = new URLSearchParams(window.location.search);
  const queryCountry = queryParams.get('country');

  const initialState = {
    selectedRegions: queryParams.get('region') || 'All',
    selectedCountries: [],
    selectedProjects: '',
    xAxisIndicator: DEFAULT_VALUES.firstMetric,
    showProjectLocations: false,
    selectedProjectType: 'All',
    selectedTaxonomy: 'All',
  };

  const [state, dispatch] = useReducer(Reducer, initialState);

  const regions = [
    { value: 'RBA', label: 'Regional Bureau for Africa (RBA)' },
    { value: 'RBAP', label: 'Regional Bureau for Asia and the Pacific (RBAP)' },
    { value: 'RBAS', label: 'Regional Bureau for Arab States (RBAS)' },
    { value: 'RBEC', label: 'Regional Bureau for Europe and the Commonwealth of Independent States (RBEC)' },
    { value: 'RBLAC', label: 'Regional Bureau on Latin America and the Caribbean (RBLAC)' },
  ];

  const updateSelectedRegions = (selectedRegions: string[]) => {
    dispatch({
      type: 'UPDATE_SELECTED_REGIONS',
      payload: selectedRegions,
    });
  };

  const updateSelectedCountries = (selectedCountries: string[]) => {
    dispatch({
      type: 'UPDATE_SELECTED_COUNTRIES',
      payload: selectedCountries,
    });
  };

  const updateSelectedProjects = (selectedProjects: string) => {
    dispatch({
      type: 'UPDATE_SELECTED_PROJECTS',
      payload: selectedProjects,
    });
  };

  const updateXAxisIndicator = (xAxisIndicator: string) => {
    dispatch({
      type: 'UPDATE_X_AXIS_INDICATOR',
      payload: xAxisIndicator,
    });
  };

  const updateShowProjectLocations = (showProjectLocations: boolean) => {
    dispatch({
      type: 'UPDATE_SHOW_PROJECT_LOCATIONS',
      payload: showProjectLocations,
    });
  };

  const updateSelectedTaxonomy = (selectedTaxonomy: string) => {
    dispatch({
      type: 'UPDATE_SELECTED_TAXONOMY',
      payload: selectedTaxonomy,
    });
  };
  function removeDuplicates(arr: any) {
    return arr.filter((item: any, index: number) => arr.indexOf(item) === index);
  }
  // translation
  const { t, i18n } = useTranslation();
  useEffect(() => {
    i18n.changeLanguage(language);
    queue()
      .defer(json, `${ROOT_DIR}/data/indicatorMetaData.json`)
      .defer(csv, `${ROOT_DIR}/data/countryIndicatorMetadata.csv`)
      .defer(csv, `${ROOT_DIR}/data/country_level_data1.csv`)
      .defer(csv, `${ROOT_DIR}/data/country_level_data2.csv`)
      .defer(csv, `${ROOT_DIR}/data/country_level_data3.csv`)
      .defer(csv, `${ROOT_DIR}/data/country_level_data4.csv`)
      .defer(csv, `${ROOT_DIR}/data/country_level_data5.csv`)
      .defer(csv, `${ROOT_DIR}/data/country_level_data6.csv`)
      .defer(csv, `${ROOT_DIR}/data/country_level_data7.csv`)
      .defer(csv, `${ROOT_DIR}/data/country_level_data8.csv`)
      .defer(csv, `${ROOT_DIR}/data/project_level_data1.csv`)
      .defer(csv, `${ROOT_DIR}/data/project_level_data2.csv`)
      .defer(json, 'https://raw.githubusercontent.com/UNDP-Data/country-taxonomy-from-azure/main/country_territory_groups.json')
      .defer(json, 'https://gist.githubusercontent.com/cplpearce/3bc5f1e9b1187df51d2085ffca795bee/raw/b36904c0c8ea72fdb82f68eb33f29891095deab3/country_codes')
      .await((err: any, indicatorMetaData: IndicatorMetaDataType[], countryIndicatorMetadata: CountryIndicatorMetaDataType[], countryLevelData1: any[], countryLevelData2: any[], countryLevelData3: any[], countryLevelData4: any[], countryLevelData5: any[], countryLevelData6: any[], countryLevelData7: any[], countryLevelData8: any[], projectLevelData1: any[], projectCoordsData: ProjectCoordsDataType[], countryGroupDataRaw: any[], countryBoundingBoxData: any) => {
        if (err) throw err;
        const countryIndicatorsData = [countryLevelData1, countryLevelData2, countryLevelData3, countryLevelData4, countryLevelData5, countryLevelData6, countryLevelData7, countryLevelData8];
        const projectLevelDataWithNumbers = projectLevelData1.map((d) => ({
          ...d,
          'Grant amount': Number(d.Grant_amount.replaceAll(',', '')),
          'target_Electricity access': +d['target_Electricity access'].replaceAll(',', ''),
          'target_Clean cooking': +d['target_Clean cooking'].replaceAll(',', ''),
          'target_Energy services': +d['target_Energy services'].replaceAll(',', ''),
          target_total: +d.target_total.replaceAll(',', ''),
          'results_Electricity access': +d['results_Electricity access'].replaceAll(',', ''),
          'results_Clean cooking': +d['results_Clean cooking'].replaceAll(',', ''),
          'results_Energy services': +d['results_Energy services'].replaceAll(',', ''),
          results_total: Number(d.results_total.replaceAll(',', '')),
        }));
        setProjectLevelData(projectLevelDataWithNumbers);
        // here we need to have only the projects which are at projectLevelData
        const projectCoordsWithData: ProjectCoordsDataType[] = [];
        projectCoordsData.forEach((d: any) => {
          const index = projectLevelDataWithNumbers.findIndex((el: ProjectLevelDataType) => el['projectID_PIMS+'] === d['projectID_PIMS+']);
          if (index > 0) {
            projectCoordsWithData.push({
              ...d,
              projectData: projectLevelDataWithNumbers[index],
            });
          }
        });

        // this can be used later probably
        /* const projectCoordsWithData = projectCoordsData.map((d) => ({
          ...d,
          projectData: projectLevelDataWithNumbers.filter((g) => g['projectID_PIMS+'] === d['projectID_PIMS+'])[0],
        })); */

        const countryGroupDataBbox = countryGroupDataRaw.map((d) => ({
          ...d,
          bbox: (countryBoundingBoxData[d['Alpha-2 code'].toLowerCase()] !== undefined) ? countryBoundingBoxData[d['Alpha-2 code'].toLowerCase()].boundingBox : {},
        }));
        setProjectCoordsData(projectCoordsWithData);
        setCountryGroupData(countryGroupDataBbox);
        const countries = removeDuplicates(projectLevelDataWithNumbers.map((d) => d['Lead Country']));
        setCountryList(countries);
        const countriesData : CountryData[] = [];
        countries.forEach((country:string) => {
          const values : CountryIndicatorDataType[] = [];
          // looping through the 3 datasets
          countryIndicatorsData.forEach((dataSet, i) => {
            // filtering indicators related to the dataset
            const ind = countryIndicatorMetadata.filter((d) => Number(d.FileNumber) === i + 1);
            const countryData = dataSet.filter((d) => d.country === country)[0]; // filtering data for the country
            if (countryData !== undefined) ind.forEach((indRow) => values.push({ value: countryData[indRow.IndicatorLabelTable].replace(',', ''), year: countryData.year, indicator: indRow.Indicator })); // adding the values to the array
            else ind.forEach((indRow) => values.push({ value: 'n/a', year: 'n/a', indicator: indRow.Indicator }));
          });
          const countryData: CountryData = { country, values };
          countriesData.push(countryData);
        });
        setAllCountriesData(countriesData);
        setRegionList(regions);
        setIndicatorsList(indicatorMetaData);
      });
    if (countryList && countryGroupData) {
      countryList.forEach((country) => {
        const index = countryGroupData.findIndex((d:any) => d['Country or Area'] === country);
        if (index < 0) {
          // eslint-disable-next-line no-console
          console.log('-------- country not found ------', country);
        }
      });
    }
  }, []);
  return (
    <div className='undp-container'>
      {
        indicatorsList && regionList && countryList && countryGroupData && allCountriesData && projectLevelData && projectCoords
          ? (
            <>
              <Context.Provider
                value={{
                  ...state,
                  updateSelectedRegions,
                  updateSelectedCountries,
                  updateSelectedProjects,
                  updateXAxisIndicator,
                  updateShowProjectLocations,
                  updateSelectedTaxonomy,
                }}
              >
                <div
                  ref={containerEl}
                  className='bodyEl'
                >
                  <div className='margin-bottom07'>
                    {
                    !queryCountry
                      ? (
                        <Tabs
                          defaultActiveKey='1'
                          className='undp-tabs'
                          items={[
                            {
                              label: t('world-overview'),
                              key: '1',
                              children: <Global
                                countryGroupData={countryGroupData}
                                indicators={indicatorsList}
                                regions={regionList}
                                countries={countryList}
                                projectLevelData={projectLevelData}
                                projectCoordsData={projectCoords}
                              />,
                            },
                            {
                              label: t('country-profiles'),
                              key: '2',
                              children: <CountryProfile
                                projectsData={projectLevelData}
                                countries={countryList}
                                countriesData={allCountriesData}
                                data={countryGroupData}
                              />,
                            },
                          ]}
                        />
                      ) : (
                        <CountryProfile
                          projectsData={projectLevelData}
                          countries={countryList}
                          countriesData={allCountriesData}
                          data={countryGroupData}
                        />
                      )
                    }
                  </div>
                </div>
              </Context.Provider>
            </>
          )
          : (
            <VizAreaEl>
              <div className='undp-loader' />
            </VizAreaEl>
          )
      }
    </div>
  );
};

export default App;
