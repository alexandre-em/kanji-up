import { ThemeOverride } from '../../App.tsx';

declare module "*.svg" {
  const content: any;
  export default content;
}

declare global {
  namespace ReactNativePaper {
    interface Theme extends ThemeOverride
  }
}

