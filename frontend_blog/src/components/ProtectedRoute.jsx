import { useEffect, useState } from "react";
import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import { getCurrentUser } from "../api/auth";
import {
  getToken,
  removeToken,
} from "../auth/tokenStorage";


export default function ProtectedRoute() {
  const location = useLocation();

  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);


  useEffect(() => {
    let componentIsMounted = true;


    async function verifyAuthentication() {
      const token = getToken();

      if (!token) {
        if (componentIsMounted) {
          setIsAuthorized(false);
          setIsChecking(false);
        }

        return;
      }

      try {
        const user = await getCurrentUser();

        if (componentIsMounted) {
          setIsAuthorized(user.role === "admin");
        }
      } catch (error) {
        console.error(error);

        removeToken();

        if (componentIsMounted) {
          setIsAuthorized(false);
        }
      } finally {
        if (componentIsMounted) {
          setIsChecking(false);
        }
      }
    }


    verifyAuthentication();


    return () => {
      componentIsMounted = false;
    };
  }, []);


  if (isChecking) {
    return (
      <main>
        <p>Vérification de la session...</p>
      </main>
    );
  }


  if (!isAuthorized) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }


  return <Outlet />;
}