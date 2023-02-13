import { useContext } from 'react';
import sumBy from 'lodash.sumby';
import styled from 'styled-components';
import { format } from 'd3-format';
import {
  CtxDataType, DataType,
} from '../Types';
import Context from '../Context/Context';

interface WidthProps {
  width: string;
}

const StatCardsDiv = styled.div<WidthProps>`
  width: ${(props) => props.width};
`;

interface Props {
  data: DataType[];
}

export const Cards = (props: Props) => {
  const {
    data,
  } = props;
  const {
    selectedCountries,
    selectedRegions,
  } = useContext(Context) as CtxDataType;
  const formatData = (d: undefined | number) => {
    if (d === undefined) return d;

    if (d < 10000) return format(',')(parseFloat(d.toFixed(0))).replace(',', ' ');
    return format('.3s')(d).replace('G', 'B');
  };

  const relevantData = selectedCountries.length > 0
    ? data.filter((d) => d['Country or Area'] === selectedCountries)
    : selectedRegions !== 'All'
      ? data.filter((d) => d.region === selectedRegions) : data;
  const cardData = {
    peopleBenefiting: sumBy(relevantData, (d:any) => d.indicators.filter((i:any) => i.indicator === 'target_total')[0].value),
    grantAmount: sumBy(relevantData, (d:any) => d.indicators.filter((i:any) => i.indicator === 'Grant amount')[0].value),
    numberCountries: relevantData.length,
  };

  return (
    <>
      <div className='stat-container flex-div margin-bottom-05'>
        <StatCardsDiv className='stat-card' width='calc(33.33% - 1.334rem)'>
          <h3 className='undp-typography'>{formatData(cardData.numberCountries)}</h3>
          <p>Number of countries</p>
        </StatCardsDiv>
        <StatCardsDiv className='stat-card' width='calc(33.33% - 1.334rem)'>
          <h3 className='undp-typography'>{cardData.peopleBenefiting === undefined ? 'N/A' : formatData(cardData.peopleBenefiting)}</h3>
          <p>People directly benefiting</p>
        </StatCardsDiv>
        <StatCardsDiv className='stat-card' width='calc(33.33% - 1.334rem)'>
          <h3 className='undp-typography'>{cardData.grantAmount === undefined ? 'N/A' : formatData(cardData.grantAmount)}</h3>
          <p>Total grant amount (USD)</p>
        </StatCardsDiv>
      </div>
    </>
  );
};
