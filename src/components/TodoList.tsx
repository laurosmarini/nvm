import React from "react";
import { CheckCircle2, Circle, Edit3, Trash2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { showSuccess } from "@/utils/toast";

type Todo = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
};

type Filter = "all" | "active" | "completed";

const STORAGE_KEY = "todos";

function useLocalTodos() {
  const [todos, setTodos] = React.useState<Todo[]>([]);

  React.useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Todo[];
        setTodos(parsed);
      } catch {
        // leave empty: bad JSON shouldn't crash UI
      }
    }
  }, []);

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  return { todos, setTodos };
}

const TodoList: React.FC = () => {
  const { todos, setTodos } = useLocalTodos();
  const [title, setTitle] = React.useState("");
  const [filter, setFilter] = React.useState<Filter>("all");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editingTitle, setEditingTitle] = React.useState("");

  const addTodo = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      title: trimmed,
      completed: false,
      createdAt: Date.now(),
    };
    setTodos([newTodo, ...todos]);
    setTitle("");
    showSuccess("Added task");
  };

  const toggleTodo = (id: string) => {
    setTodos(
      todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  };

  const removeTodo = (id: string) => {
    setTodos(todos.filter((t) => t.id !== id));
  };

  const startEdit = (t: Todo) => {
    setEditingId(t.id);
    setEditingTitle(t.title);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingTitle("");
  };

  const saveEdit = () => {
    const trimmed = editingTitle.trim();
    if (!editingId) return;
    if (!trimmed) {
      // If empty after trimming, treat as delete
      setTodos(todos.filter((t) => t.id !== editingId));
    } else {
      setTodos(
        todos.map((t) => (t.id === editingId ? { ...t, title: trimmed } : t)),
      );
      showSuccess("Updated task");
    }
    cancelEdit();
  };

  const clearCompleted = () => {
    setTodos(todos.filter((t) => !t.completed));
  };

  const filteredTodos = React.useMemo(() => {
    if (filter === "active") return todos.filter((t) => !t.completed);
    if (filter === "completed") return todos.filter((t) => t.completed);
    return todos;
  }, [todos, filter]);

  const remaining = todos.filter((t) => !t.completed).length;

  const onKeyDownAdd: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") addTodo();
  };

  const onKeyDownEdit: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") saveEdit();
    if (e.key === "Escape") cancelEdit();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Todo List</CardTitle>
        <Badge variant="secondary">{remaining} left</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Add a new task..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={onKeyDownAdd}
            aria-label="New task title"
          />
          <Button onClick={addTodo} className="shrink-0" aria-label="Add task">
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={filter === "all" ? "default" : "secondary"}
            onClick={() => setFilter("all")}
            size="sm"
          >
            All
          </Button>
          <Button
            variant={filter === "active" ? "default" : "secondary"}
            onClick={() => setFilter("active")}
            size="sm"
          >
            Active
          </Button>
          <Button
            variant={filter === "completed" ? "default" : "secondary"}
            onClick={() => setFilter("completed")}
            size="sm"
          >
            Completed
          </Button>

          <div className="ml-auto">
            <Button variant="ghost" size="sm" onClick={clearCompleted}>
              Clear completed
            </Button>
          </div>
        </div>

        <Separator />

        <ul className="space-y-2">
          {filteredTodos.length === 0 ? (
            <li className="text-sm text-muted-foreground text-center py-6">
              No tasks here. Add one above!
            </li>
          ) : (
            filteredTodos.map((t) => (
              <li
                key={t.id}
                className="flex items-center gap-2 rounded-md border p-2"
              >
                <button
                  onClick={() => toggleTodo(t.id)}
                  className="p-1 rounded hover:bg-accent"
                  aria-label={t.completed ? "Mark as active" : "Mark as done"}
                >
                  {t.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>

                {editingId === t.id ? (
                  <div className="flex-1 flex items-center gap-2">
                    <Input
                      autoFocus
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={onKeyDownEdit}
                    />
                    <Button size="sm" onClick={saveEdit}>
                      Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={cancelEdit}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex-1">
                    <p
                      className={
                        "text-sm " +
                        (t.completed ? "line-through text-muted-foreground" : "")
                      }
                    >
                      {t.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(t.createdAt).toLocaleString()}
                    </p>
                  </div>
                )}

                {editingId !== t.id && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEdit(t)}
                      aria-label="Edit task"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTodo(t.id)}
                      aria-label="Delete task"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                )}
              </li>
            ))
          )}
        </ul>
      </CardContent>
    </Card>
  );
};

export default TodoList;