
import { Button } from "@/components/ui/button";
import { AppSidebar } from "./AppSidebar";

const NavBar = () => {
  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
      <div className="flex items-center">
        <AppSidebar />
      </div>
    </nav>
  );
};

export default NavBar;
