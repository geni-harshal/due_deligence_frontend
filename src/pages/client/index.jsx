import { Switch, Route, Redirect } from "wouter";
import { useGetCurrentUser, useClientLiveUpdates } from "@/lib/api";
import ClientDashboard from "./dashboard";
import ClientOrders from "./orders";
import ClientUsers from "./users";
import ReportViewerPage from "./ReportViewerPage";
function ClientRouter() {
  useClientLiveUpdates();
  const { data: user } = useGetCurrentUser();
  const isAdmin = user?.role === "client_admin";
  return <Switch>
      <Route path="/" component={ClientDashboard} />
      <Route path="/orders" component={ClientOrders} />
      <Route path="/report/:orderId" component={ReportViewerPage} />
      {isAdmin && <Route path="/team" component={ClientUsers} />}
      <Route><Redirect to="/" /></Route>
    </Switch>;
}
export {
  ClientRouter as default
};
