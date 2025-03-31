
import NavBar from "@/components/NavBar";
import ProjectList from "@/components/ProjectList";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavBar />
      <main className="flex-1">
        <ProjectList />
      </main>
    </div>
  );
};

export default Index;
