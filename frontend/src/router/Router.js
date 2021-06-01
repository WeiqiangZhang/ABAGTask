import { BrowserRouter, Switch, Route } from "react-router-dom";
// import Distributor from "../pages/Distributor/Distributor";
import Claim from "../pages/Claim/Claim";

const Router = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/">
          <Claim />
        </Route>
        <Route>
          <h1>404: Not Found</h1>
        </Route>
      </Switch>
    </BrowserRouter>
  );
};

export default Router;