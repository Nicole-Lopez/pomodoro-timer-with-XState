import { createContext } from 'react'
import { useInterpret } from '@xstate/react'
import { pomodoroMachine } from '../machines/pomodoroMachine'

export const PomodoroContext = createContext()

export function PomodoroContextProvider(props) {
	const pomodoroService = useInterpret(pomodoroMachine, { devTools: true })

	return (
		<PomodoroContext.Provider value={{ pomodoroService }}>
			{props.children}
		</PomodoroContext.Provider>
	)
}
