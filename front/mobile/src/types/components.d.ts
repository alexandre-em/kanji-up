type SvgProps = {
  width: number;
  height: number;
};

type SpacerProps = {
  x?: number;
  y?: number;
};

type RouteParamsProps<T> = {
  route: {
    params: T;
  };
};
