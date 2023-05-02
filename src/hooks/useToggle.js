import { useCallback, useState } from 'react'

export const useToggle = initialValue => {
	const [value, setValue] = useState(initialValue)

	const toggle = useCallback(() => setValue(x => !x), [])

	return [value, toggle, setValue]
}
