import { createMachine, assign, actions } from 'xstate'

export const pomodoroMachine = createMachine(
    {
        id: 'pomodoro timer',
        predictableActionArguments: true,
        initial: 'initial',
        context: {
            current: {
                time: 1500,
                stage: 'work',
            },
            autoStart: true,
            work: 1500,
            shortBreak: 300,
            longBreak: 900,
            longBreakInterval: 4,
            alarm: {
                title: 'Wood',
                volume: 0.5,
                play: false,
            },
            pauseExist: false,
            pomodoroCount: {
                nextLongBreak: 0,
                all: 0,
            },
            todosList: [],
            todosReminder: [],
        },

        on: {
            CREATE_TODO: { actions: ['createTodo', 'setLocalStorage'] },
            EDIT_TODO: { actions: ['editTodo', 'setLocalStorage'] },
            DELETE_TODO: { actions: ['deleteTodo', 'setLocalStorage'] },
            COMPLETE_TODO: { actions: ['completeTodo', 'setLocalStorage'] },
            CLEAR_TODO: { actions: ['clearTodo', 'setLocalStorage'] },
            REORDER_TODOS: { actions: ['reorderTodos', 'setLocalStorage'] },
            CLEAR_PAST_POMODOROS: {
                actions: ['clearPastPomodoros', 'setLocalStorage'],
            },
            STOP_ALARM: { actions: 'togglePlayAlarm' },
            CLEAN_REMINDER: { actions: 'cleanReminder' },
            CANCEL: 'initial',
            INITIAL_LOCAL_STORAGE: { actions: 'initialLocalStorage' },
        },
        states: {
            initial: {
                entry: 'initContextPomodoro',
                on: {
                    START_POMODORO: 'workTime',
                    EDIT_POMODORO: {
                        actions: [
                            'editPomodoro',
                            'setCurrentWork',
                            'setLocalStorage',
                        ],
                    },
                },
            },

            workTime: {
                entry: actions.choose([
                    { cond: 'pauseExist', actions: 'pauseToggle' },
                ]),

                invoke: {
                    id: 'workTimer',
                    src: () => callback => {
                        const id = setInterval(
                            () => callback('PASS_TO_BREAK'),
                            1000
                        )

                        return () => clearInterval(id)
                    },
                },
                on: {
                    PASS_TO_BREAK: [
                        {
                            cond: 'uploadTimeIsCorrect',
                            actions: 'setCurrentTime',
                        },
                        {
                            target: 'intermediate',
                            actions: [
                                'setPomodoroCount',
                                'togglePlayAlarm',
                                'setLocalStorage',
                            ],
                        },
                    ],
                    PAUSE: 'pause',
                },
            },

            shortBreak: {
                entry: actions.choose([
                    { cond: 'pauseExist', actions: 'pauseToggle' },
                ]),
                invoke: {
                    id: 'shortBreakTimer',
                    src: () => callback => {
                        const id = setInterval(
                            () => callback('PASS_TO_WORK'),
                            1000
                        )

                        return () => clearInterval(id)
                    },
                },
                on: {
                    PASS_TO_WORK: [
                        {
                            cond: 'uploadTimeIsCorrect',
                            actions: 'setCurrentTime',
                        },
                        {
                            target: 'intermediate',
                            actions: 'togglePlayAlarm',
                        },
                    ],
                    PAUSE: 'pause',
                },
            },

            longBreak: {
                entry: actions.choose([
                    { cond: 'pauseExist', actions: 'pauseToggle' },
                ]),
                invoke: {
                    id: 'longBreakTimer',
                    src: () => callback => {
                        const id = setInterval(
                            () => callback('PASS_TO_WORK'),
                            1000
                        )

                        return () => clearInterval(id)
                    },
                },
                on: {
                    PASS_TO_WORK: [
                        {
                            cond: 'uploadTimeIsCorrect',
                            actions: 'setCurrentTime',
                        },
                        {
                            target: 'intermediate',
                            actions: [
                                'togglePlayAlarm',
                                'setNextLongBreak',
                                'setLocalStorage',
                            ],
                        },
                    ],
                    PAUSE: 'pause',
                },
            },

            pause: {
                entry: 'pauseToggle',
                on: {
                    RESUME: [
                        {
                            cond: { type: 'thatIsCurrentStage', stage: 'work' },
                            target: 'workTime',
                        },
                        {
                            cond: {
                                type: 'thatIsCurrentStage',
                                stage: 'shortBreak',
                            },
                            target: 'shortBreak',
                        },
                        {
                            target: 'longBreak',
                        },
                    ],
                },
            },

            intermediate: {
                entry: actions.choose([
                    {
                        cond: 'isTimeForALongBreak',
                        actions: 'setCurrentInitLong',
                    },
                    {
                        cond: { type: 'thatIsCurrentStage', stage: 'work' },
                        actions: 'setCurrentShort',
                    },
                    {
                        actions: 'setCurrentWork',
                    },
                ]),

                always: [
                    {
                        cond: { type: 'autoStart', stage: 'work' },
                        target: 'workTime',
                    },
                    {
                        cond: { type: 'autoStart', stage: 'shortBreak' },
                        target: 'shortBreak',
                    },
                    {
                        cond: { type: 'autoStart', stage: 'longBreak' },
                        target: 'longBreak',
                    },
                ],

                on: {
                    RESUME: [
                        {
                            cond: 'isTimeForALongBreak',
                            target: 'longBreak',
                        },
                        {
                            cond: { type: 'thatIsCurrentStage', stage: 'work' },
                            target: 'workTime',
                        },
                        {
                            cond: {
                                type: 'thatIsCurrentStage',
                                stage: 'shortBreak',
                            },
                            target: 'shortBreak',
                        },
                    ],
                },
            },
        },
    },

    {
        guards: {
            isTimeForALongBreak: context =>
                context.pomodoroCount.nextLongBreak ===
                    context.longBreakInterval && context.todosReminder,
            uploadTimeIsCorrect: context => context.current.time !== 0,
            pauseExist: context => context.pauseExist,
            thatIsCurrentStage: (context, event, { cond }) =>
                context.current.stage === cond.stage,
            autoStart: (context, event, { cond }) =>
                context.autoStart &&
                !context.todosReminder.length &&
                context.current.stage === cond.stage,
        },

        actions: {
            createTodo: assign({
                todosList: (context, event) => [
                    {
                        id: crypto.randomUUID(),
                        ...event.data,
                        totalPomodoros: 0,
                        completed: false,
                    },
                    ...context.todosList,
                ],
            }),

            completeTodo: assign({
                todosList: (context, event) =>
                    context.todosList.map(todo =>
                        todo.id === event.id
                            ? { ...todo, completed: !todo.completed }
                            : todo
                    ),
            }),

            editTodo: assign({
                todosList: (context, event) =>
                    context.todosList.map(todo =>
                        todo.id === event.id ? { ...todo, ...event.data } : todo
                    ),
            }),

            deleteTodo: assign({
                todosList: (context, event) =>
                    context.todosList.filter(todo => todo.id !== event.id),
            }),

            clearTodo: assign({
                todosList: (context, event) => {
                    if (event.wich === 'all') {
                        return []
                    } else {
                        return context.todosList.filter(todo =>
                            event.wich === 'completed'
                                ? !todo.completed
                                : todo.completed
                        )
                    }
                },
            }),

            reorderTodos: assign({
                todosList: (context, event) => {
                    const result = [...context.todosList]
                    const [removed] = result.splice(event.sourceIndex, 1)
                    result.splice(event.destinationIndex, 0, removed)

                    return result
                },
            }),

            clearPastPomodoros: assign({
                todosList: context =>
                    context.todosList.map(todo => ({
                        ...todo,
                        totalPomodoros: 0,
                    })),
            }),

            editPomodoro: assign((context, event) => event.data),

            setPomodoroCount: assign(context => {
                const todoAddCount = context.todosList.map(todo => ({
                    ...todo,
                    totalPomodoros: todo.totalPomodoros + 1,
                }))

                return {
                    todosList: todoAddCount,
                    todosReminder: todoAddCount
                        .filter(
                            todo =>
                                todo.totalPomodoros >= todo.estPomodoros &&
                                !todo.completed
                        )
                        .map(todo => todo.id),
                    pomodoroCount: {
                        nextLongBreak: context.pomodoroCount.nextLongBreak + 1,
                        all: context.pomodoroCount.all + 1,
                    },
                }
            }),

            setNextLongBreak: assign({
                pomodoroCount: context => ({
                    ...context.pomodoroCount,
                    nextLongBreak: 0,
                }),
            }),

            setCurrentTime: assign({
                current: context => ({
                    ...context.current,
                    time: context.current.time - 1,
                }),
            }),

            setCurrentWork: assign({
                current: context => ({ time: context.work, stage: 'work' }),
            }),

            setCurrentShort: assign({
                current: context => ({
                    time: context.shortBreak,
                    stage: 'shortBreak',
                }),
            }),

            setCurrentInitLong: assign({
                current: context => ({
                    time: context.longBreak,
                    stage: 'longBreak',
                }),
            }),

            pauseToggle: assign({
                pauseExist: context => !context.pauseExist,
            }),

            togglePlayAlarm: assign({
                alarm: context => ({
                    ...context.alarm,
                    play: !context.alarm.play,
                }),
            }),

            cleanReminder: assign({ todosReminder: [] }),

            initContextPomodoro: assign(context => {
                return {
                    current: { time: context.work, stage: 'work' },
                    alarm: { ...context.alarm, play: false },
                    pauseExist: false,
                    pomodoroCount: { nextLongBreak: 0, all: 0 },
                }
            }),

            initialLocalStorage: assign(() => {
                const {
                    work,
                    shortBreak,
                    longBreak,
                    longBreakInterval,
                    autoStart,
                    alarm,
                    pomodoroCount,
                    todosList,
                } = JSON.parse(
                    localStorage.getItem('contextPomodoroMachineXState')
                )

                return {
                    current: {
                        time: work,
                        stage: 'work',
                    },
                    autoStart,
                    work,
                    shortBreak,
                    longBreak,
                    longBreakInterval,
                    alarm: {
                        title: alarm.title,
                        volume: alarm.volume,
                        play: false,
                    },
                    pomodoroCount: {
                        nextLongBreak: 0,
                        all: pomodoroCount.all,
                    },
                    todosList,
                }
            }),

            setLocalStorage: context => {
                const contextPomodoroMachineSerialized =
                    JSON.stringify(context)

                localStorage.setItem(
                    'contextPomodoroMachineXState',
                    contextPomodoroMachineSerialized
                )
            },
        },
    }
)
