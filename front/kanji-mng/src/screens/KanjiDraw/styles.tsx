import styled from "@emotion/styled";

interface MainProps {
  height: number | string,
};

export const Main = styled.div<MainProps>`
  height: ${p => p.height}px;
  width: 100%;
`;

export const Content = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin: 20px;
`;
