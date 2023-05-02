import { useState } from 'react'
import InputNumber from '../InputNumber/InputNumber'
import './TaskForm.scss'

export default function TaskForm({ taskData, cancel, submit }) {
	const [newTask, setNewTask] = useState(taskData)

	const handleSubmit = e => {
		e.preventDefault()
		submit(newTask)
		cancel()
	}

	return (
		<form
			className='new-task-form'
			autoComplete='false'
			onSubmit={handleSubmit}
		>
			<textarea
				maxLength='280'
				value={newTask.content}
				onChange={e =>
					setNewTask(newTask => ({
						...newTask,
						content: e.target.value,
					}))
				}
			/>
			<InputNumber
				inputID='estPomodoros'
				label='Est Pomodoros'
				value={newTask.estPomodoros}
				setValue={setNewTask}
			/>
			<div className='new-task-form__buttons'>
				<button
					className='cancel-button'
					onClick={cancel}
					type='button'
				>
					CANCEL
				</button>
				<button className='submit-button' type='submit'>
					SAVE
				</button>
			</div>
		</form>
	)
}
