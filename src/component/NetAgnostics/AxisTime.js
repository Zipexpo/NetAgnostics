import {multiFormat} from "../ulti";

export default function({width,height,margin={},scale,grid=()=>{},...others}) {
    return <svg width={width} height={height} className={"timeText w-full overflow-visible"} {...others}>
        <g transform={`translate(${margin.left??0},${margin.top??0})`}>
            {scale.ticks().map(t=><g transform={`translate(${scale(t)},-30)`}
                                     className={'timeLegendLine'}
                                     key={`tick ${t}`}>
                <text textAnchor={'middle'}>{multiFormat(t)}</text>
                {grid(t)}
            </g>)}
        </g>
    </svg>
}