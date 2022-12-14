import { Switch } from "react-router-dom";
import { useRecoilState } from "recoil";

import userSessionAtom from "#root/recoil/atoms/userSession";
import PrivateRoute from "#root/utils/components/routing/PrivateRoute";

import Login from "./Login";
import Main from "./Main";

const Initialized = () => {
  const [userSession] = useRecoilState(userSessionAtom);
  return (
    <Switch>
      <PrivateRoute
        allowVisit={!userSession}
        component={Login}
        path="/login"
        redirectTo="/"
      />
      <PrivateRoute
        allowVisit={!!userSession}
        component={Main}
        path="/"
        redirectTo="/login"
      />
    </Switch>
  );
};

export default Initialized;
