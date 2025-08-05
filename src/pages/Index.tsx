import { MadeWithDyad } from "@/components/made-with-dyad";
import TodoList from "@/components/TodoList";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6 text-center">Your TODOs</h1>
        <TodoList />
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;