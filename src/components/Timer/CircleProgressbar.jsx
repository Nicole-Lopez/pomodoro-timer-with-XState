export default function CircleProgressbar({
    radius,
    progress,
    strokeWidth,
    strokeColor,
    trackStrokeColor,
}) {
    const width = 2 * radius + strokeWidth * 2

    const circumference = 2 * Math.PI * radius
    const strokeLength = (circumference / 360) * 360
    const progressLength = (strokeLength / 100) * (100 - progress)

    return (
        <svg
            width='100%'
            height='100%'
            viewBox={`0 0 ${width} ${width}`}
            style={{ transform: `rotate(-90deg)` }}
        >
            <circle
                cx={width / 2}
                cy={width / 2}
                r={radius}
                fill='none'
                stroke={trackStrokeColor}
                strokeWidth={strokeWidth}
                strokeDasharray={`${strokeLength}, ${circumference}`}
                strokeLinecap='butt'
            />

            <circle
                cx={width / 2}
                cy={width / 2}
                r={radius}
                fill='none'
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeDasharray={`${progressLength}, ${circumference}`}
                strokeDashoffset={progressLength - strokeLength}
                strokeLinecap='butt'
            />
        </svg>
    )
}
