import styled from 'styled-components';
import { format } from 'd3-format';
import { HoverDataType } from '../Types';
import { HorizontalArrow, VerticalArrow } from '../Icons';

interface Props {
  data: HoverDataType;
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
  z-index: 10;
  border-radius: 1rem;
  font-size: 1.4rem;
  background-color: var(--white);
  box-shadow: 0 0 1rem rgb(0 0 0 / 15%);
  word-wrap: break-word;
  top: ${(props) => (props.verticalAlignment === 'bottom' ? props.y - 40 : props.y + 40)}px;
  left: ${(props) => (props.horizontalAlignment === 'left' ? props.x - 20 : props.x + 20)}px;
  max-width: 24rem;
  transform: ${(props) => `translate(${props.horizontalAlignment === 'left' ? '-100%' : '0%'},${props.verticalAlignment === 'top' ? '-100%' : '0%'})`};
`;

const TooltipTitle = styled.div`
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--navy);  
  background: var(--yellow);
  width: 100%;
  box-sizing: border-box;
  border-radius: 1rem 1rem 0 0;
  padding: 1.6rem 4rem 1.6rem 2rem;
  position: relative;
  font-weight: 700;
  font-size: 1.8rem;
  line-height: 1.8rem;
`;

const SubNote = styled.span`
  font-size: 1.2rem;
  color: var(--navy);
`;

const TooltipBody = styled.div`
  width: 100%;
  box-sizing: border-box;
  padding: 2rem;
`;

const RowEl = styled.div`
  font-size: 1.3rem;
  color: var(--dark-grey);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: flex-start; 
`;

const RowTitleEl = styled.div`
  font-weight: 400;
  font-size: 1.2rem;
  line-height: 1.4rem;
  margin-bottom: 0.3rem;
  color: var(--navy);
`;

const RowMetaData = styled.div`
  font-weight: 400;
  font-size: 1.2rem;
  color: var(--navy);
  opacity: 0.5;
  margin-bottom: -5px;
`;

const RowValue = styled.div`
  font-weight: 700;
  font-size: 1.4rem;
  line-height: 2rem;
  color: var(--navy);
`;

const TooltipHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

interface ColorIconProps {
  fill?:string;
}

const ColorIcon = styled.div<ColorIconProps>`
  width: 1.6rem;
  height: 1.6rem;
  margin: 0 0.2rem;
  background-color: ${(props) => (props.fill ? props.fill : 'var(--yellow)')};
  border: ${(props) => (props.fill === '#FFF' || props.fill === '#fff' || props.fill === '#FFFFFF' || props.fill === '#ffffff' ? '1px solid #AAA' : `1px solid ${props.fill}`)};
`;

const SizeIcon = styled.div`
  width: 1.4rem;
  height: 1.4rem;
  margin: 0 0.2rem;
  border-radius: 1.4rem;
  border: 2px solid var(--navy);
`;

const IconDiv = styled.div`
  margin-right: 0.5rem;
  margin-top: 0.5rem;
`;

const IconEl = styled.div`
  margin-top: 0.5rem;
`;

export const Tooltip = (props: Props) => {
  const {
    data,
  } = props;
  return (
    <TooltipEl x={data.xPosition} y={data.yPosition} verticalAlignment={data.yPosition > window.innerHeight / 2 ? 'top' : 'bottom'} horizontalAlignment={data.xPosition > window.innerWidth / 2 ? 'left' : 'right'}>
      <TooltipHead>
        <TooltipTitle>
          {data.country}
          {' '}
          <SubNote>
            (
            {data.continent}
            )
          </SubNote>
        </TooltipTitle>
      </TooltipHead>
      <TooltipBody>
        {
        data.rows.map((d, i) => (
          <RowEl key={i}>
            <IconDiv>
              {
                d.type === 'x-axis' ? <IconEl><HorizontalArrow size={20} /></IconEl>
                  : d.type === 'y-axis' ? <IconEl><VerticalArrow size={20} /></IconEl>
                    : d.type === 'color' ? <ColorIcon fill={d.color} />
                      : d.type === 'size' ? <SizeIcon />
                        : null
              }
            </IconDiv>
            <div>
              <RowMetaData>{d.year}</RowMetaData>
              <RowTitleEl>{d.title}</RowTitleEl>
              <RowValue>
                {
                  d.prefix && d.value && d.value !== 'NA' ? `${d.prefix} ` : ''
                }
                {typeof d.value === 'number' ? d.value < 1000000 ? format(',')(parseFloat(d.value.toFixed(2))).replace(',', ' ') : format('.3s')(d.value).replace('G', 'B') : d.value }
                {
                  d.suffix && d.value && d.value !== 'NA' ? ` ${d.suffix}` : ''
                }
              </RowValue>
            </div>
          </RowEl>
        ))
      }
      </TooltipBody>
    </TooltipEl>
  );
};
