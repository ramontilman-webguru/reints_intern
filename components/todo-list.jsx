import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

// We might need server actions for toggling and deleting
export default function TodoList({
  todos = [],
  toggleTodoAction,
  deleteTodoAction,
}) {
  if (todos.length === 0) {
    return (
      <p className='text-muted-foreground text-center py-4'>
        Nog geen taken toegevoegd.
      </p>
    );
  }

  return (
    <ul className='space-y-2'>
      {todos.map((todo) => (
        <li
          key={todo.id}
          className='flex items-center gap-2 p-2 border rounded-md'
        >
          <Checkbox
            id={`todo-${todo.id}`}
            checked={todo.completed}
            // onChange/onClick will need to trigger a server action
            // onClick={() => toggleTodoAction(todo.id, !todo.completed)} // Example
          />
          <label
            htmlFor={`todo-${todo.id}`}
            className={`flex-grow ${
              todo.completed ? "line-through text-muted-foreground" : ""
            }`}
          >
            {todo.text}
          </label>
          <Button
            variant='ghost'
            size='icon'
            className='text-destructive'
            // onClick will need to trigger a server action
            // onClick={() => deleteTodoAction(todo.id)} // Example
          >
            <Trash2 className='h-4 w-4' />
          </Button>
        </li>
      ))}
    </ul>
  );
}
