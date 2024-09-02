import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from "react-router-dom";
import LoginComponent from "./pages/Login/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import LayoutAuth from "./components/Layout/LayoutAuth/LayoutAuth";
import Signup from "./pages/Signup/Signup";
import LayoutProtected from "./components/Layout/LayoutAuth/LayoutProtected";
import ProfilePage from "./pages/Profile/ProfilePage";
import AppLayout from "./components/Layout/AppLayout/AppLayout";

// import Posts, { postsLoader } from "./pages/Posts/Posts";
import Posts from "./pages/Posts/Posts";
import Users from "./pages/Users/Users";
import UserPage from "./pages/Users/UserPage";
import ErrorElement from "./components/ErrorElement/ErrorElement";
import NotFound from "./components/NotFound/NotFound";

const homeRoutes = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route element={<LayoutAuth />} errorElement={<ErrorElement />}>
        <Route
          path="/login"
          element={<LoginComponent />}
          errorElement={<ErrorElement />}
        />
        <Route path="/signup" element={<Signup />} />
      </Route>
      <Route
        path="/"
        element={<ProtectedRoute />}
        errorElement={<ErrorElement />}
      >
        <Route element={<LayoutProtected />} errorElement={<ErrorElement />}>
          <Route element={<AppLayout />} errorElement={<ErrorElement />}>
            <Route index element={<Posts />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="users" element={<Users />} />
          </Route>
          <Route path="users/:userId" element={<UserPage />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </>
  )
);

const App = () => {
  return <RouterProvider router={homeRoutes} />;
};

export default App;
