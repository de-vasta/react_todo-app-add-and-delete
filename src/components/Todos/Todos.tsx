import React from 'react';
import { Todo } from '../../types/Todo';
import TodoItem from '../TodoItem/TodoItem';

interface Props {
  todos: Todo[];
  handleTodoToggle: (todoId: number) => void;
  handleTodoRemove: (todoId: number) => Promise<void>;
  deletingTodoIds?: number[];
}

const Todos = ({
  todos,
  handleTodoToggle,
  handleTodoRemove,
  deletingTodoIds = [],
}: Props) => {
  return (
    <section className="todoapp__main" data-cy="TodoList">
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={handleTodoToggle}
          onTodoRemove={handleTodoRemove}
          isBeingDeleted={deletingTodoIds.includes(todo.id)}
        />
      ))}
    </section>
  );
};

export default React.memo(Todos);
