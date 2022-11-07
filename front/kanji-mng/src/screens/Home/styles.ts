import styled from '@emotion/styled';
import {Paper} from '@mui/material';
import colors from '../../const/colors';

interface MainProps {
  height: number | string,
};

export const Main = styled.div<MainProps>`
  height: ${p => p.height}px;
  width: 100%;
`;

export const Content = styled.div`
  margin: 25px;
  display: flex;
  flex-wrap: wrap;
`;

export const Item = styled(Paper)(({ theme }) => ({
  textAlign: 'center',
  width: 60,
  height: 60,
  lineHeight: '60px',
  fontWeight: '900',
  fontSize: 30,
  color: colors.text,
  margin: 10,
  cursor: 'pointer',
}));

export const Title = styled.div`
  color: ${colors.text};
  font-weight: 900;
  font-size: 25px;
  margin: 15px;
`;

export const Footer = styled.div`
  display: flex;
  justify-content: center;
  margin: 15px;
`;
