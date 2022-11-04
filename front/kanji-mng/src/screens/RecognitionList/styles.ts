import styled from '@emotion/styled';
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
  background-color: #efefef;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  border-radius: 10px;
`;

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
