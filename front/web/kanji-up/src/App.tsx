import { Provider } from 'react-redux';

import GatewayRouter from './router';

import store from './store';

export default function App() {
  return (
    <Provider store={store}>
      <GatewayRouter />
    </Provider>
  );
}
