import { Switch, Route, Redirect } from "wouter";
import AdminDashboard from "./dashboard";
import AdminClients from "./clients";
import AdminUsers from "./users";
import AdminProducts from "./products";
import AdminOrders from "./orders";
function AdminRouter() {
  return <Switch>
      <Route path="/" component={AdminDashboard} />
      <Route path="/clients" component={AdminClients} />
      <Route path="/users" component={AdminUsers} />
      <Route path="/products" component={AdminProducts} />
      <Route path="/orders" component={AdminOrders} />
      <Route><Redirect to="/" /></Route>
    </Switch>;
}
export {
  AdminRouter as default
};
