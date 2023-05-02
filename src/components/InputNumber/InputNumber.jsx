import { ChevronDown, ChevronUp } from 'react-feather'
import './InputNumber.scss'

export default function InputNumber({inputID, label, value, setValue}) {
	const handleChange = (e) => {
		if (/^(?!0|$)[0-9]*$/.test(e.target.value)) {
			setValue(val => ({
				...val,
				[inputID] : Number(e.target.value)
			}))
		}
	}


	return (
		<div className='input-number-with-buttons'>
		    <label htmlFor={inputID}>{label}</label>
			
			<div className='input-container'>
				<input 
					autoComplete="off"
					type="text"
					id={inputID} 
					value={value}
					onChange={handleChange}
					maxLength='2'
				/>

				<button 
					className='input-container__up'
					type='button'
					onClick={() => setValue(val => ({...val, [inputID]: val[inputID] + 1}))}
					disabled={99<=value}
				><ChevronUp/></button>

				<button 
					className='input-container__down'
					type='button'
					onClick={() => setValue(val => ({...val, [inputID]: val[inputID] - 1}))}
					disabled={value<=1}
				><ChevronDown/></button>	
			</div>
		</div>
	)
}