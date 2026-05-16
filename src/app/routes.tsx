import { Redirect, Route } from 'react-router-dom';
import { IonRouterOutlet } from '@ionic/react';
import AuthScreen from '../features/auth/screens/AuthScreen';
import RunScreen from '../features/run/screens/RunScreen';
import HistoryScreen from '../features/history/screens/HistoryScreen';
import LeaderboardScreen from '../features/leaderboard/screens/LeaderboardScreen';
import ProfileScreen from '../features/profile/screens/ProfileScreen';

const AppRoutes = () => (
  <IonRouterOutlet>
    <Route exact path="/auth">
      <AuthScreen />
    </Route>
    <Route exact path="/run">
      <RunScreen />
    </Route>
    <Route exact path="/history">
      <HistoryScreen />
    </Route>
    <Route exact path="/leaderboard">
      <LeaderboardScreen />
    </Route>
    <Route exact path="/profile">
      <ProfileScreen />
    </Route>
    <Route exact path="/">
      <Redirect to="/run" />
    </Route>
  </IonRouterOutlet>
);

export default AppRoutes;
