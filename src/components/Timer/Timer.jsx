import { useEffect } from 'react'
import { useSelector } from '@xstate/react'
import { useToggle } from '../../hooks/useToggle'
import { usePomodoroContext } from '../../hooks/usePomodoroContext'
import { useSoundControls } from '../../hooks/useSoundControls'
import { toMMSS } from '../../utilities/toMMSS'
import { pomodoroAlarms } from '../../utilities/pomodoroAlarms'
import CircleProgressbar from './CircleProgressbar'
import SettingPomodoroForm from '../SettingPomodoroForm/SettingPomodoroForm'
import TasksReminder from '../TasksReminder/TasksReminder'
import { BellOff, Pause, Play, X } from 'react-feather'
import tickStart from '../../assets/audio/startPomodoro.wav'
import './Timer.scss'

export default function Timer() {
    const [alarmAudio, playAlarmAudio, stopAlarmAudio] = useSoundControls()

    const [openEditPomodoro, toggleOpenEditPomodoro] = useToggle()

    const [pomodoroContext, send] = usePomodoroContext()

    const context = useSelector(pomodoroContext, state => state.context)
    const stateValue = useSelector(pomodoroContext, state => state.value)
    const alarm = useSelector(pomodoroContext, state => state.context.alarm)

    const handleStartPomodoro = () => {
        send('START_POMODORO')

        const startSound = new Audio(tickStart)
        startSound.volume = alarm.volume
        startSound.play()
    }

    const handleStopAlarm = () => {
        stopAlarmAudio()
        send('STOP_ALARM')
    }

    const handleResumeAlarm = () => {
        if (stateValue === 'intermediate' && alarm.play) {
            handleStopAlarm()
        }

        send('RESUME')

        const startSound = new Audio(tickStart)
        startSound.volume = alarm.volume
        startSound.play()
    }

    const handleCancelTimer = () => {
        handleStopAlarm()
        send('CANCEL')
    }

    useEffect(() => {
        if (alarm.play) {
            playAlarmAudio(alarm.volume)

            if (context.autoStart && !context.todosReminder.length) {
                send('STOP_ALARM')
            }
        }
    }, [alarm.play])

    useEffect(() => {
        const stageName = e => {
            const names = {
                work: 'Work',
                shortBreak: 'Short Break',
                longBreak: 'Long Break',
            }

            return names[e]
        }

        if (context.todosReminder.length) {
            document.title = 'TASKS REMINDER!'
        } else {
            document.title = `${toMMSS(context.current.time)} - ${stageName(
                context.current.stage
            )}`
        }
    }, [context.current, context.todosReminder])

    return (
        <>
            <div
                className={`timer-shape timer-shape--${context.current.stage}`}
            >
                <div>
                    <CircleProgressbar
                        radius={100}
                        progress={
                            (context.current.time /
                                context[context.current.stage]) *
                            100
                        }
                        strokeWidth={12}
                    />
                    <p>{toMMSS(context.current.time)}</p>
                </div>
                <audio
                    ref={alarmAudio}
                    src={
                        pomodoroAlarms.find(e => e.title === alarm.title).sound
                    }
                    loop={
                        (!context.autoStart && alarm.play) ||
                        context.todosReminder.length
                    }
                />
            </div>

            <div className='pomodoro-controls'>
                {stateValue === 'initial' ? (
                    <>
                        <button onClick={handleStartPomodoro}>START</button>
                        <button onClick={toggleOpenEditPomodoro}>EDIT</button>
                    </>
                ) : (
                    <>
                        {['pause', 'intermediate'].includes(stateValue) ? (
                            <button onClick={handleResumeAlarm}>
                                <Play />
                            </button>
                        ) : (
                            <button onClick={() => send('PAUSE')}>
                                <Pause />
                            </button>
                        )}

                        <button onClick={handleCancelTimer}>
                            <X />
                        </button>

                        {stateValue === 'intermediate' &&
                            !context.autoStart &&
                            alarm.play && (
                                <button onClick={handleStopAlarm}>
                                    <BellOff />
                                </button>
                            )}
                    </>
                )}
            </div>

            {Boolean(context.todosReminder.length) && (
                <TasksReminder stopAlarm={handleStopAlarm} />
            )}

            {openEditPomodoro && (
                <SettingPomodoroForm
                    open={openEditPomodoro}
                    close={toggleOpenEditPomodoro}
                />
            )}
        </>
    )
}
