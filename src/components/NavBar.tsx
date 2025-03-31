
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

const NavBar = () => {
  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" className="mr-2">
          <Menu className="h-5 w-5" />
        </Button>
      </div>
      <Button variant="link" className="font-medium">
        Cerrar sesión
      </Button>
    </nav>
  );
};

export default NavBar;
