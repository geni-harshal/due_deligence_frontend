import { Switch, Route, Redirect } from "wouter";
import { useGetCurrentUser } from "@/lib/api";
import ClientDashboard from "./dashboard";
import ClientOrders from "./orders";
import ClientUsers from "./users";
function ClientRouter() {
  const { data: user } = useGetCurrentUser();
  const isAdmin = user?.role === "client_admin";
  return <Switch>
      <Route path="/" component={ClientDashboard} />
      <Route path="/orders" component={ClientOrders} />
      {isAdmin && <Route path="/team" component={ClientUsers} />}
      <Route><Redirect to="/" /></Route>
    </Switch>;
}
export {
  ClientRouter as default
};
