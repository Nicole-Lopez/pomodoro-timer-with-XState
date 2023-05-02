import { useSelector } from '@xstate/react'
import { usePomodoroContext } from '../../hooks/usePomodoroContext'
import TaskCard from '../TaskCard/TaskCard'
import Modal from '../Modal/Modal'
import { BellOff } from 'react-feather'
import './TasksReminder.scss'

export default function TasksReminder({ stopAlarm }) {
	const [pomodoroContext, send] = usePomodoroContext()

	const todosRem = useSelector(pomodoroContext, state => {
		return state.context.todosList.filter(task =>
			state.context.todosReminder.includes(task.id)
		)
	})

	const alarmIsPlay = useSelector(
		pomodoroContext,
		state => state.context.alarm.play
	)

	return (
		<Modal>
			<div className='tasks-reminder'>
				<div className='tasks-reminder__titles'>
					<h2>Did you complete these tasks?</h2>
					<h3>
						If not, please edit the amount of estimated pomodoros to
						mark a new goal
					</h3>
				</div>

				<div className='tasks-reminder__tasks-container'>
					{todosRem.map(todo => {
						return <TaskCard key={todo.id} taskInfo={todo} />
					})}
				</div>

				<div className='tasks-reminder__buttons'>
					{alarmIsPlay && (
						<button
							className='tasks-reminder__stop-alarm'
							onClick={stopAlarm}
						>
							<BellOff />
						</button>
					)}

					<button
						className='tasks-reminder__submit'
						onClick={() => send({ type: 'CLEAN_REMINDER' })}
						disabled={todosRem
							.filter(e => !e.completed)
							.some(
								todo =>
									todo.estPomodoros === todo.totalPomodoros
							)}
					>
						OK
					</button>
				</div>
			</div>
		</Modal>
	)
}
