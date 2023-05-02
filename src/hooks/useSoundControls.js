import { useRef } from 'react'

export const useSoundControls = () => {
	const sound = useRef(null)

	const playSound = volume => {
		sound.current.volume = volume
		sound.current.play()
	}

	const stopSound = () => {
		sound.current.pause()
		sound.current.currentTime = 0
	}

	return [sound, playSound, stopSound]
}
