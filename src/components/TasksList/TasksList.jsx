import { useState } from 'react'
import { useSelector } from '@xstate/react'
import { usePomodoroContext } from '../../hooks/usePomodoroContext'
import { useToggle } from '../../hooks/useToggle'
import TaskForm from '../TaskForm/TaskForm'
import TaskCard from '../TaskCard/TaskCard'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { EyeOff, MoreHorizontal, Trash, Plus } from 'react-feather'
import './TasksList.scss'

export default function TasksList() {
	const [hideType, setHideType] = useState('')

	const [openNewTask, toggleOpenNewTask, setOpenNewTask] = useToggle(false)
	const [openMenu, toggleOpenMenu, setOpenMenu] = useToggle(false)
	const [pomodoroContext, send] = usePomodoroContext()

	const todosList = useSelector(pomodoroContext, state => {
		if (!hideType.length) {
			return state.context.todosList
		} else {
			return state.context.todosList.filter(e =>
				hideType === 'completed' ? !e.completed : e.completed
			)
		}
	})

	const handleNewTask = e => send({ type: 'CREATE_TODO', data: e })

	const handleClearTask = type => {
		setOpenMenu(false)
		send({ type: 'CLEAR_TODO', wich: type })
	}

	const handleReorderTasks = result => {
		const { source, destination } = result
		if (!destination) return
		if (
			source.index === destination.index &&
			source.droppableId === destination.droppableId
		)
			return

		send({
			type: 'REORDER_TODOS',
			sourceIndex: source.index,
			destinationIndex: destination.index,
		})
	}

	return (
		<div className='tasks-list'>
			<div className='tasks-list__header'>
				<h3>
					Tasks<span>{todosList.length}</span>
				</h3>

				<div
					className={`tasks-list__menu ${
						openMenu
							? 'tasks-list__menu--open'
							: 'tasks-list__menu--close'
					}`}
				>
					<button onClick={toggleOpenMenu}>
						<MoreHorizontal />
					</button>
					<ul>
						<li>
							<button
								onClick={() =>
									setHideType(hideType =>
										hideType === 'completed'
											? ''
											: 'completed'
									)
								}
							>
								<EyeOff />
								{hideType === 'completed'
									? 'View'
									: 'Hide'}{' '}
								completed tasks
							</button>
						</li>
						<li>
							<button
								onClick={() =>
									setHideType(hideType =>
										hideType === 'incompleted'
											? ''
											: 'incompleted'
									)
								}
							>
								<EyeOff />
								{hideType === 'incompleted'
									? 'View'
									: 'Hide'}{' '}
								incomplete tasks
							</button>
						</li>
						<li>
							<button
								onClick={() => handleClearTask('incompleted')}
							>
								<Trash />
								Clear incomplete tasks
							</button>
						</li>
						<li>
							<button
								onClick={() => handleClearTask('completed')}
							>
								<Trash />
								Clear completed tasks
							</button>
						</li>
						<li>
							<button onClick={() => handleClearTask('all')}>
								<Trash />
								Clear all tasks
							</button>
						</li>
						<li>
							<button
								onClick={() => send('CLEAR_PAST_POMODOROS')}
							>
								<Trash />
								Clear past pomodoros
							</button>
						</li>
					</ul>
				</div>
			</div>

			<div className='tasks-list__new-task'>
				<button
					onClick={toggleOpenNewTask}
					style={
						openNewTask
							? { pointerEvents: 'none', opacity: '.8' }
							: null
					}
				>
					<Plus /> New Task
				</button>
			</div>

			<div className='tasks-list__list'>
				{openNewTask && (
					<TaskForm
						taskData={{ content: '', estPomodoros: 1 }}
						cancel={() => setOpenNewTask(false)}
						submit={handleNewTask}
					/>
				)}

				{todosList.length ? (
					<DragDropContext
						onDragEnd={result => handleReorderTasks(result)}
					>
						<Droppable droppableId='tasks'>
							{droppableProvided => (
								<ul
									{...droppableProvided.droppableProps}
									ref={droppableProvided.innerRef}
								>
									{todosList.map((todo, index) => (
										<Draggable
											key={todo.id}
											draggableId={todo.id}
											index={index}
											isDragDisabled={hideType !== ''}
										>
											{draggableProvided => (
												<li
													{...draggableProvided.draggableProps}
													ref={
														draggableProvided.innerRef
													}
													{...draggableProvided.dragHandleProps}
												>
													<TaskCard taskInfo={todo} />
												</li>
											)}
										</Draggable>
									))}
									{droppableProvided.placeholder}
								</ul>
							)}
						</Droppable>
					</DragDropContext>
				) : (
					<p className='tasks-list__not-tasks'>
						You don&apos;t have any tasks at the moment
					</p>
				)}
			</div>
		</div>
	)
}
