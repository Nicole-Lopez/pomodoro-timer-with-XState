import { useRef, useState } from 'react'
import { useToggle } from '../../hooks/useToggle'
import { usePomodoroContext } from '../../hooks/usePomodoroContext'
import TaskForm from '../TaskForm/TaskForm'
import DeleteConfirmation from '../DeleteConfirmation/DeleteConfirmation'
import { Check, Edit2, Trash2 } from 'react-feather'
import './TaskCard.scss'

export default function TaskCard({ taskInfo }) {
	const [read, setRead] = useState(true)
	const [deleteConfirmationIsOpen, deleteConfirmationToggle] = useToggle()
	const completeButtonRef = useRef(null)

	const [, send] = usePomodoroContext()

	const handleEdit = () => setRead(false)

	const handleCancel = () => setRead(true)

	const handleDelete = () => {
		send({ type: 'DELETE_TODO', id: taskInfo.id })
		deleteConfirmationToggle()
	}

	const handleCompleteTask = () => {
		const newspaperSpinning = [
			{ transform: 'scale(1)' },
			{ transform: 'scale(1.2)' },
			{ transform: 'scale(0.85)' },
			{ transform: 'scale(1)' },
		]

		completeButtonRef.current.animate(newspaperSpinning, { duration: 650 })

		send({ type: 'COMPLETE_TODO', id: taskInfo.id })
	}

	const handleSubmit = e => {
		send({ type: 'EDIT_TODO', data: e, id: taskInfo.id })
	}

	return (
		<>
			{read ? (
				<div
					className={`task-card-read ${
						taskInfo.completed
							? 'task-card-read--completed'
							: 'task-card-read--incompleted'
					}`}
				>
					<div className='task-card-read__top'>
						<p>{taskInfo.content}</p>
						<button
							ref={completeButtonRef}
							onClick={handleCompleteTask}
						>
							<Check />
						</button>
					</div>
					<div className='task-card-read__bottom'>
						<p>
							{taskInfo.totalPomodoros}/{taskInfo.estPomodoros}
						</p>

						<div>
							<button
								className='task-card-read__edit'
								onClick={handleEdit}
							>
								<Edit2 />
							</button>
							<button
								className='task-card-read__delete'
								onClick={deleteConfirmationToggle}
							>
								<Trash2 />
							</button>
							{deleteConfirmationIsOpen && (
								<DeleteConfirmation
									cancel={deleteConfirmationToggle}
									handleDelete={handleDelete}
									message='Are you sure you want to delete this task?'
								/>
							)}
						</div>
					</div>
				</div>
			) : (
				<TaskForm
					taskData={{
						content: taskInfo.content,
						estPomodoros: taskInfo.estPomodoros,
					}}
					cancel={handleCancel}
					submit={handleSubmit}
				/>
			)}
		</>
	)
}
