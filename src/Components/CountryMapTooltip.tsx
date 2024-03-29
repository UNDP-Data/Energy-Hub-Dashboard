import styled from 'styled-components';
import { format } from 'd3-format';
import { useTranslation } from 'react-i18next';

interface Props {
  pctValue?: number;
  popValue?: number;
  popRuralNoAccess?: number,
  popUrbanNoAccess?: number,
  xPosition: number;
  yPosition: number;
  country: string;
  district:string;
}

interface TooltipElProps {
  x: number;
  y: number;
  verticalAlignment: string;
  horizontalAlignment: string;
}

const TooltipEl = styled.div<TooltipElProps>`
  display: block;
  position: fixed;
  z-index: 8;
  background-color: var(--gray-200);
  border: 1px solid var(--gray-300);
  word-wrap: break-word;
  top: ${(props) => (props.verticalAlignment === 'bottom' ? props.y - 40 : props.y + 40)}px;
  left: ${(props) => (props.horizontalAlignment === 'left' ? props.x - 20 : props.x + 20)}px;
  max-width: 24rem;
  transform: ${(props) => `translate(${props.horizontalAlignment === 'left' ? '-100%' : '0%'},${props.verticalAlignment === 'top' ? '-100%' : '0%'})`};
`;

export function CountryMapTooltip(props: Props) {
  const {
    pctValue,
    popValue,
    popRuralNoAccess,
    popUrbanNoAccess,
    district,
    country,
    xPosition,
    yPosition,
  } = props;
  // translation
  const { t } = useTranslation();
  return (
    <TooltipEl x={xPosition} y={yPosition} verticalAlignment={yPosition > window.innerHeight / 2 ? 'top' : 'bottom'} horizontalAlignment={xPosition > window.innerWidth / 2 ? 'left' : 'right'}>
      <div className='flex-div flex-wrap' style={{ padding: 'var(--spacing-05)', alignItems: 'baseline' }}>
        <h6 className='undp-typography bold margin-bottom-00' style={{ color: 'var(--blue-600)' }}>
          { district || country}
          {' '}
          {
            district
              ? (
                <span
                  className='undp-typography'
                  style={{
                    color: 'var(--gray-600)', fontWeight: 'normal', fontSize: '0.875rem', textTransform: 'none',
                  }}
                >
                  (
                  {country}
                  )
                </span>
              )
              : null
          }
        </h6>
      </div>
      <hr className='undp-style margin-top-00 margin-bottom-00' />
      <div style={{ padding: 'var(--spacing-03) var(--spacing-05) var(--spacing-05) var(--spacing-05)' }}>
        <div className='flex-div margin-bottom-00 flex-space-between' style={{ alignItems: 'flex-start' }}>
          <p className='small-font margin-bottom-00'>
            {t('access-reliable-energy')}
          </p>
          <p className='small-font bold margin-bottom-00'>
            {
                pctValue !== undefined ? `${pctValue.toFixed(1)} %` : 'NA'
              }
          </p>
        </div>
        <div className='flex-div flex-space-between' style={{ alignItems: 'flex-start' }}>
          <p className='small-font margin-bottom-00'>
            {t('number-without')}
          </p>
        </div>
        <div className='flex-div flex-space-between' style={{ alignItems: 'flex-start' }}>
          <p className='small-font margin-bottom-00 padding-bottom-00'>
            {t('total')}
          </p>
          <p className='small-font bold margin-bottom-00 padding-bottom-00'>
            {
              popValue
                ? format('.3s')(popValue).replace('G', 'B')
                : popValue === 0 ? 0 : 'NA'
            }
          </p>
        </div>
        <div className='flex-div flex-space-between' style={{ alignItems: 'flex-start' }}>
          <p className='small-font margin-bottom-00'>
            {t('rural-areas')}
          </p>
          <p className='small-font bold margin-bottom-00'>
            {
              popRuralNoAccess
                ? format('.3s')(popRuralNoAccess).replace('G', 'B')
                : popRuralNoAccess === 0 ? 0 : 'NA'
            }
          </p>
        </div>
        <div className='flex-div flex-space-between' style={{ alignItems: 'flex-start' }}>
          <p className='small-font margin-bottom-00'>
            {t('urban-areas')}
          </p>
          <p className='small-font bold margin-bottom-00'>
            {
              popUrbanNoAccess
                ? format('.3s')(popUrbanNoAccess).replace('G', 'B')
                : popUrbanNoAccess === 0 ? 0 : 'NA'
            }
          </p>
        </div>
      </div>
    </TooltipEl>
  );
}
