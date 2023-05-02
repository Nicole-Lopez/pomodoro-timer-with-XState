import { createPortal } from 'react-dom'
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock'
import './Modal.scss'

export default function Modal({ children }) {
	useBodyScrollLock()

	return createPortal(
		<div className='modal-bg'>{children}</div>,
		document.body
	)
}
