import Modal from '../Modal/Modal'
import './DeleteConfirmation.scss'

export default function DeleteConfirmation({ cancel, handleDelete, message }) {
	return (
		<Modal>
			<div className='delete-confirmation'>
				<h3>Delete</h3>
				<p>{message}</p>
				<div>
					<button
						className='delete-confirmation__cancel'
						onClick={cancel}
					>
						Cancel
					</button>
					<button
						className='delete-confirmation__delete'
						onClick={handleDelete}
					>
						Delete
					</button>
				</div>
			</div>
		</Modal>
	)
}
