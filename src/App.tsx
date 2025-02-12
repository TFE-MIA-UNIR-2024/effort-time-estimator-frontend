import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import ProjectDetails from "./pages/ProjectDetails";
import NeedDetails from "./pages/NeedDetails";
import { Layout } from "./components/Layout";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

function App() {
  return (
    <Router>
      <TooltipProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/home"
            element={
              <Layout>
                <Home />
              </Layout>
            }
          />
          <Route
            path="/project/:id"
            element={
              <Layout>
                <ProjectDetails />
              </Layout>
            }
          />
          <Route
            path="/need/:id"
            element={
              <Layout>
                <NeedDetails />
              </Layout>
            }
          />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </TooltipProvider>
      <Toaster />
    </Router>
  );
}

export default App;
