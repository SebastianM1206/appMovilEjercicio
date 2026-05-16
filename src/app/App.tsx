import { IonApp, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import AppProviders from './providers';
import AppRoutes from './routes';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import '@ionic/react/css/palettes/dark.system.css';

import '../ui/theme/tailwind.css';
import '../ui/theme/variables.css';

setupIonicReact();

const App = () => (
  <IonApp>
    <AppProviders>
      <IonReactRouter>
        <AppRoutes />
      </IonReactRouter>
    </AppProviders>
  </IonApp>
);

export default App;
