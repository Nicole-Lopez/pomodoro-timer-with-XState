import { useRef, useState } from 'react'
import { useSelector } from '@xstate/react'
import { useOutsideAlerter } from '../../hooks/useOutsideAlerter'
import { usePomodoroContext } from '../../hooks/usePomodoroContext'
import { useSoundControls } from '../../hooks/useSoundControls.js'
import { secondsToMinutes, minutesToSeconds } from '../../utilities/timeConvert'
import { pomodoroAlarms } from '../../utilities/pomodoroAlarms'
import InputNumber from '../InputNumber/InputNumber'
import Modal from '../Modal/Modal'
import './SettingPomodoroForm.scss'

export default function SettingPomodoroForm({ open, close }) {
	const [alarmAudio, playAlarmAudio] = useSoundControls()
	const formSetting = useRef(null)
	useOutsideAlerter(formSetting, close)

	const [pomodoroContext, send] = usePomodoroContext()

	const context = useSelector(pomodoroContext, state => state.context)

	const [form, setForm] = useState({
		autoStart: context.autoStart,
		work: secondsToMinutes(context.work),
		shortBreak: secondsToMinutes(context.shortBreak),
		longBreak: secondsToMinutes(context.longBreak),
		longBreakInterval: context.longBreakInterval,
		alarm: context.alarm,
	})

	const handleSubmit = e => {
		e.preventDefault()

		send({
			type: 'EDIT_POMODORO',
			data: {
				...form,
				work: minutesToSeconds(form.work),
				shortBreak: minutesToSeconds(form.shortBreak),
				longBreak: minutesToSeconds(form.longBreak),
			},
		})

		close()
	}

	const handleSelectAlarm = e => {
		setForm(form => ({
			...form,
			alarm: { ...form.alarm, title: e.target.value },
		}))
		alarmAudio.current.src = pomodoroAlarms.find(
			alarm => alarm.title === e.target.value
		).sound

		playAlarmAudio(form.alarm.volume)
	}

	const handleAlarmVolume = e => {
		const volume = e.target.value / 100

		if (!alarmAudio.current.src.length) {
			alarmAudio.current.src = pomodoroAlarms.find(
				alarm => alarm.title === form.alarm.title
			).sound
		}

		playAlarmAudio(volume)

		setForm(form => ({ ...form, alarm: { ...form.alarm, volume } }))
	}

	return (
		<Modal>
			<form
				ref={formSetting}
				onSubmit={handleSubmit}
				autoComplete='off'
				className='setting-pomodoro'
			>
				<div className='setting-pomodoro__header'>
					<h3>Setting</h3>
					<button onClick={close} type='button'>
						x
					</button>
				</div>

				<fieldset className='setting-pomodoro__pomodoroTime'>
					<legend>Time (minutes)</legend>

					<InputNumber
						inputID='work'
						label='Work'
						value={form.work}
						setValue={setForm}
					/>
					<InputNumber
						inputID='shortBreak'
						label='Short Break'
						value={form.shortBreak}
						setValue={setForm}
					/>
					<InputNumber
						inputID='longBreak'
						label='Long Break'
						value={form.longBreak}
						setValue={setForm}
					/>
				</fieldset>

				<div className='setting-pomodoro__individual-setting'>
					<div className='autostart'>
						<span className='setting-pomodoro__label'>
							Auto Start
						</span>
						<input
							type='checkbox'
							id='toggleAutoStart'
							checked={form.autoStart}
							onChange={() =>
								setForm(form => ({
									...form,
									autoStart: !form.autoStart,
								}))
							}
						/>
						<label htmlFor='toggleAutoStart'></label>
					</div>

					<InputNumber
						inputID='longBreakInterval'
						label='Long Break interval'
						value={form.longBreakInterval}
						setValue={setForm}
					/>
				</div>

				<fieldset className='setting-pomodoro__alarm'>
					<legend>Alarm</legend>

					<div className='alarm-selects'>
						<label
							className='setting-pomodoro__label'
							htmlFor='soundsSelect'
						>
							Sound
						</label>

						<select
							name='sounds'
							id='soundsSelect'
							value={form.alarm.title}
							onChange={handleSelectAlarm}
						>
							{pomodoroAlarms.map(alarm => {
								return (
									<option
										key={alarm.title}
										value={alarm.title}
									>
										{alarm.title}
									</option>
								)
							})}
						</select>
					</div>

					<div className='volume'>
						<span className='setting-pomodoro__label'>
							{Math.round(form.alarm.volume * 100)}
						</span>
						<input
							type='range'
							min='0'
							max='100'
							value={Math.round(form.alarm.volume * 100)}
							onInput={handleAlarmVolume}
						/>
					</div>

					<audio ref={alarmAudio}></audio>
				</fieldset>

				<button className='setting-pomodoro__submit' type='submit'>
					SAVE
				</button>
			</form>
		</Modal>
	)
}
