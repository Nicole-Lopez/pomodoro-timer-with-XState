import { PomodoroContextProvider } from './context/pomodoroContext'
import Home from './pages/Home/Home'
import './globalStyles/globalStyles.css'

function App() {
	return (
		<div className='App'>
			<PomodoroContextProvider>
				<Home />
			</PomodoroContextProvider>
		</div>
	)
}

export default App
