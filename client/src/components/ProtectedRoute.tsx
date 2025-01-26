import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../features/hooks";
import { RootState } from "../features/store";

const ProtectedRoute = () => {
  const { isAuthenticated, user } = useAppSelector(
    (state: RootState) => state.auth
  );
  // console.log(isAuthenticated);

  return isAuthenticated && user ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
