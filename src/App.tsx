import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
// import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import AllComplants from "./components/Complaintes/AllComplaints";
import FormElements from "./pages/Forms/FormElements";

import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import Orders from "./pages/PurchaseOrders/Orders";
import OrderDetail from "./pages/PurchaseOrders/OrderDetail";
import Products from "./pages/Products/Products";
import UserList from "./pages/Users/Users";
import UpdateProducts from "./pages/Products/UpdateProducts";
import ShopkeeperRequests from "./pages/Shopkeeper/ShopkeeperRequest";
import { AuthProvider } from "./context/AuthContext";
import ForgotPassword from "./pages/AuthPages/ForgotPassword";
import UpdateUser from "./pages/Users/UpdateUser";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
            <Route index path="/forgot-password" element={<ForgotPassword />} />
          <Route element={<AppLayout />}>

            {/* Others Page */}
                        <Route index path="/" element={<Home />} />

            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />

            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />

            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />

            <Route path="/all-complaints" element={<AllComplants />} />

            {/* purchase orders  */}
            <Route path="/purchase-orders" element={<Orders />} />
            <Route path="/order-detail/:orderId" element={<OrderDetail />} />
  
           {/* products */}
            <Route path="/products" element={<Products />} />
                        <Route path="/update-products" element={<UpdateProducts />} />

            {/* Users */}
                        <Route path="/users" element={<UserList />} />
                                                <Route path="/update-user" element={<UpdateUser />} />

    {/* Shopkeeper */}
                        <Route path="/shopkeeper-request" element={<ShopkeeperRequests />} />


            {/* Ui Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />

            {/* Charts */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          {/* <Route path="/signup" element={<SignUp />} /> */}

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
