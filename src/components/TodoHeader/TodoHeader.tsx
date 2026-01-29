import cn from 'classnames';
import { Todo } from '../../types/Todo';
import { useState, useEffect } from 'react';

interface Props {
  todos: Todo[];
  isAllTodosCompleted: boolean;
  onToggleAll: () => void;
  onTodoAdd: (title: string) => Promise<void>;
  inputRef: React.RefObject<HTMLInputElement>;
}

const TodoHeader = ({
  todos,
  isAllTodosCompleted,
  onToggleAll,
  onTodoAdd,
  inputRef,
}: Props) => {
  const [title, setTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (!isAdding) {
      inputRef.current?.focus();
    }
  }, [isAdding, inputRef]);

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsAdding(true);
    onTodoAdd(title)
      .then(() => {
        setTitle('');
      })
      .catch(() => {})
      .finally(() => {
        setIsAdding(() => false);
      });
  };

  return (
    <header className="todoapp__header">
      {todos.length > 0 && (
        <button
          type="button"
          className={cn('todoapp__toggle-all', {
            active: isAllTodosCompleted,
          })}
          data-cy="ToggleAllButton"
          onClick={onToggleAll}
        />
      )}

      <form onSubmit={handleSubmit}>
        <input
          data-cy="NewTodoField"
          type="text"
          className="todoapp__new-todo"
          placeholder="What needs to be done?"
          ref={inputRef}
          value={title}
          onChange={handleTitleChange}
          disabled={isAdding}
        />
      </form>
    </header>
  );
};

export default TodoHeader;
