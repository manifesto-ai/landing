// Pre-defined MEL domain schemas for landing page demos

export const counterMel = `
domain Counter {
  state {
    count: number = 0
  }

  computed doubled = mul(count, 2)
  computed isPositive = gt(count, 0)
  computed isZero = eq(count, 0)

  action increment() {
    onceIntent {
      patch count = add(count, 1)
    }
  }

  action decrement() {
    onceIntent {
      patch count = add(count, -1)
    }
  }

  action set(value: number)
    dispatchable when gte(value, 0) {
    onceIntent {
      patch count = value
    }
  }
}
`;

export const todoMel = `
domain TodoApp {
  type Todo = {
    id: string,
    title: string,
    completed: boolean
  }

  state {
    todos: Array<Todo> = []
  }

  computed totalCount = len(todos)
  computed completedCount = len(filter(todos, $item.completed))
  computed activeCount = sub(totalCount, completedCount)

  action addTodo(title: string) {
    onceIntent when neq(trim(title), "") {
      patch todos = append(todos, {
        id: $system.uuid,
        title: trim(title),
        completed: false
      })
    }
  }

  action toggleTodo(id: string) {
    onceIntent {
      patch todos = map(todos,
        cond(eq($item.id, id),
          { id: $item.id, title: $item.title, completed: not($item.completed) },
          $item
        )
      )
    }
  }

  action removeTodo(id: string) {
    onceIntent {
      patch todos = filter(todos, neq($item.id, id))
    }
  }
}
`;

// Domain shape types for TypeScript generics
export type CounterDomain = {
  readonly actions: {
    readonly increment: () => void;
    readonly decrement: () => void;
    readonly set: (value: number) => void;
  };
  readonly state: {
    readonly count: number;
  };
  readonly computed: {
    readonly doubled: number;
    readonly isPositive: boolean;
    readonly isZero: boolean;
  };
};

export type TodoItem = {
  readonly id: string;
  readonly title: string;
  readonly completed: boolean;
};

export type TodoDomain = {
  readonly actions: {
    readonly addTodo: (title: string) => void;
    readonly toggleTodo: (id: string) => void;
    readonly removeTodo: (id: string) => void;
  };
  readonly state: {
    readonly todos: readonly TodoItem[];
  };
  readonly computed: {
    readonly totalCount: number;
    readonly completedCount: number;
    readonly activeCount: number;
  };
};
