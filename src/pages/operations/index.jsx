// src/pages/operations/index.jsx
import { Switch, Route, Redirect } from "wouter";
import OpsDashboard from "./dashboard";
import OpsOrders from "./orders";
import OpsOrderDetail from "./order-detail";
 
function OpsRouter() {
  return (
    <Switch>
      <Route path="/" component={OpsDashboard} />
      {/* IMPORTANT: :id route MUST come before /orders — otherwise /orders matches first */}
      <Route path="/orders/:id" component={OpsOrderDetail} />
      <Route path="/orders" component={OpsOrders} />
      <Route>
        <Redirect to="/" />
      </Route>
    </Switch>
  );
}
 
export default OpsRouter;