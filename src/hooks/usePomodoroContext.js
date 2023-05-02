import { useContext } from 'react'
import { PomodoroContext } from '../context/pomodoroContext'

export const usePomodoroContext = () => {
	const globalServices = useContext(PomodoroContext)

	const { send } = globalServices.pomodoroService

	return [globalServices.pomodoroService, send]
}
