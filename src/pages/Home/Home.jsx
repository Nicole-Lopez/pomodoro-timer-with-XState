import { useEffect } from 'react'
import { useSelector } from '@xstate/react'
import { usePomodoroContext } from '../../hooks/usePomodoroContext'
import { useIsFirstRender } from '../../hooks/useIsFirstRender'
import Timer from '../../components/Timer/Timer'
import TasksList from '../../components/TasksList/TasksList'

export default function Home() {
	const isFirst = useIsFirstRender()
	const [pomodoroContext, send] = usePomodoroContext()

	const bgStage = useSelector(pomodoroContext, state => {
		const bg = {
			work: '#A7727D',
			shortBreak: '#8EA7E9',
			longBreak: '#7286D3',
		}
		return bg[state.context.current.stage]
	})

	useEffect(() => {
		if (isFirst) {
			try {
				if (window.localStorage.getItem('contextPomodoroMachineXState'))
					send('INITIAL_LOCAL_STORAGE')
			} catch (error) {
				console.error(error)
			}
		}
	}, [])

	return (
		<div
			style={{
				padding: '20px',
				minHeight: 'calc(100vh - 40px)',
				backgroundColor: bgStage,
				transition: 'background-color .50s ease',
			}}
		>
			<Timer />

			<TasksList />
		</div>
	)
}
