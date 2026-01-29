import classNames from 'classnames';
import { Todo } from '../../types/Todo';
import { useState } from 'react';

interface Props {
  todo: Todo;
  onToggle?: (todoId: number) => void;
  onTodoRemove?: (todoId: number) => Promise<void>;
  hasTempTodo?: boolean;
  isBeingDeleted?: boolean;
}

const TodoItem = ({
  todo: { id, title, completed },
  onToggle,
  onTodoRemove,
  hasTempTodo = false,
  isBeingDeleted = false,
}: Props) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = (todoId: number) => {
    setIsDeleting(() => true);
    onTodoRemove?.(todoId);
  };

  return (
    <div
      data-cy="Todo"
      className={classNames('todo', {
        completed: completed,
      })}
    >
      <label aria-label="Todo Status" className="todo__status-label">
        <input
          data-cy="TodoStatus"
          type="checkbox"
          className="todo__status"
          checked={completed}
          onChange={() => onToggle?.(id)}
        />
      </label>

      <span data-cy="TodoTitle" className="todo__title">
        {title}
      </span>
      <button
        type="button"
        className="todo__remove"
        data-cy="TodoDelete"
        onClick={() => handleDelete(id)}
      >
        {isDeleting ? '···' : '×'}
      </button>

      <div
        data-cy="TodoLoader"
        className={classNames('modal overlay', {
          'is-active': isDeleting || hasTempTodo || isBeingDeleted,
        })}
      >
        <div className="modal-background has-background-white-ter" />
        <div className="loader" />
      </div>
    </div>
  );
};

export default TodoItem;
