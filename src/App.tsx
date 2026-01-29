/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { addTodo, deleteTodo, getTodos, USER_ID } from './api/todos';
import { Todo } from './types/Todo';
import Todos from './components/Todos/Todos';
import cn from 'classnames';
import TodoHeader from './components/TodoHeader/TodoHeader';
import TodoFooter from './components/TodoFooter/TodoFooter';
import { FilterStatus } from './types/enums';
import TodoItem from './components/TodoItem/TodoItem';

enum ErrorMessage {
  None = '',
  LoadTodos = 'Unable to load todos',
  EmptyTitle = 'Title should not be empty',
  AddTodo = 'Unable to add a todo',
  DeleteTodo = 'Unable to delete a todo',
  UpdateTodo = 'Unable to update a todo',
}

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>(
    FilterStatus.All,
  );
  const [errorMsg, setErrorMsg] = useState<ErrorMessage>(ErrorMessage.None);
  const [deletingTodoIds, setDeletingTodoIds] = useState<number[]>([]);

  const errorMsgTimeOutId = useRef<number>(0);
  const inputFocusRef = useRef<HTMLInputElement>(null);

  const handleErrorMessage = (msgType: ErrorMessage) => {
    setErrorMsg(msgType);

    clearTimeout(errorMsgTimeOutId.current);
    errorMsgTimeOutId.current = window.setTimeout(() => {
      setErrorMsg(() => ErrorMessage.None);
    }, 3000);
  };

  useEffect(() => {
    getTodos()
      .then(setTodos)
      .catch(() => {
        handleErrorMessage(ErrorMessage.LoadTodos);
      });
  }, []);

  const handleTodoToggle = useCallback(
    (todoId: number) => {
      setTodos(
        todos.map(todo => {
          if (todo.id === todoId) {
            return { ...todo, completed: !todo.completed };
          }

          return todo;
        }),
      );
    },
    [todos],
  );

  const handleTodoDelete = useCallback(
    (todoId: number) => {
      setDeletingTodoIds(prev => [...prev, todoId]);

      return deleteTodo(todoId)
        .then(() => {
          setErrorMsg(() => ErrorMessage.None);
          setTodos(todos.filter(todo => todo.id !== todoId));
        })
        .catch(error => {
          handleErrorMessage(ErrorMessage.DeleteTodo);
          setDeletingTodoIds(prev => prev.filter(id => id !== todoId));

          throw error;
        })
        .finally(() => {
          setDeletingTodoIds(prev => prev.filter(id => id !== todoId));
          inputFocusRef.current?.focus();
        });
    },
    [todos],
  );

  const handleClearCompleted = () => {
    const completedTodos = todos.filter(todo => todo.completed);
    const completedIds = completedTodos.map(todo => todo.id);
    const successfulDeletedIds: number[] = [];

    setDeletingTodoIds(completedIds);

    Promise.all(
      completedTodos.map(todo =>
        deleteTodo(todo.id)
          .then(() => successfulDeletedIds.push(todo.id))
          .catch(() => {
            handleErrorMessage(ErrorMessage.DeleteTodo);
          }),
      ),
    )
      .then(() => {
        setTodos(oldTodos =>
          oldTodos.filter(todo => !successfulDeletedIds.includes(todo.id)),
        );
      })
      .finally(() => {
        setDeletingTodoIds([]);
        inputFocusRef.current?.focus();
      });
  };

  const handleTodoAdd = (title: string) => {
    const titleNormalized = title.trim();

    if (!titleNormalized) {
      handleErrorMessage(ErrorMessage.EmptyTitle);

      return Promise.reject(ErrorMessage.EmptyTitle);
    }

    const todoToAdd: Todo = {
      id: 0,
      title: titleNormalized,
      completed: false,
      userId: USER_ID,
    };

    setTempTodo(todoToAdd);

    return addTodo(todoToAdd)
      .then(todoResponse => {
        setErrorMsg(() => ErrorMessage.None);
        setTodos(currState => [
          ...currState,
          {
            ...todoResponse,
            id: Math.max(...currState.map(todo => todo.id)) + 1,
          },
        ]);
      })
      .catch(error => {
        handleErrorMessage(ErrorMessage.AddTodo);

        return Promise.reject(error);
      })
      .finally(() => {
        setTempTodo(null);
      });
  };

  const handleFilterChange = (filter: FilterStatus) => {
    setFilterStatus(filter);
  };

  const visibleTodos = useMemo(() => {
    switch (filterStatus) {
      case FilterStatus.Active:
        return todos.filter(todo => !todo.completed);

      case FilterStatus.Completed:
        return todos.filter(todo => todo.completed);

      case FilterStatus.All:
      default:
        return todos;
    }
  }, [todos, filterStatus]);

  const undoneTodosCount = useMemo(
    () => todos.reduce((acc, todo) => (todo.completed ? acc : acc + 1), 0),
    [todos],
  );

  const isAllTodosCompleted = undoneTodosCount === 0;
  const isAllTodosUncompleted = undoneTodosCount === todos.length;

  const handleToggleAll = () => {
    if (isAllTodosCompleted) {
      setTodos(todos.map(todo => ({ ...todo, completed: false })));
    } else {
      setTodos(todos.map(todo => ({ ...todo, completed: true })));
    }
  };

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <TodoHeader
          todos={todos}
          isAllTodosCompleted={isAllTodosCompleted}
          onToggleAll={handleToggleAll}
          onTodoAdd={handleTodoAdd}
          inputRef={inputFocusRef}
        />

        <Todos
          todos={visibleTodos}
          handleTodoToggle={handleTodoToggle}
          handleTodoRemove={handleTodoDelete}
          deletingTodoIds={deletingTodoIds}
        />

        {tempTodo && <TodoItem todo={tempTodo} hasTempTodo={!!tempTodo} />}

        {todos.length > 0 && (
          <TodoFooter
            undoneTodosCount={undoneTodosCount}
            isAllTodosUncompleted={isAllTodosUncompleted}
            filterStatus={filterStatus}
            onFilterChange={handleFilterChange}
            onClearCompleted={handleClearCompleted}
          />
        )}
      </div>

      <div
        data-cy="ErrorNotification"
        className={cn(
          'notification is-danger is-light has-text-weight-normal',
          { hidden: !errorMsg },
        )}
      >
        <button
          data-cy="HideErrorButton"
          type="button"
          className="delete"
          onClick={() => handleErrorMessage(ErrorMessage.None)}
        />
        {errorMsg}
      </div>
    </div>
  );
};
