import {multiFormat} from "../ulti";
const emptyFunction = ()=>{};
export default function({width,height,margin={},scale,
                            ticks,
                            grid=emptyFunction,
                            onMouseMove=emptyFunction,
                            onMouseLeave=emptyFunction,...others}) {
    return <svg width={width} height={height} className={"timeText w-full overflow-visible"} {...others}>
        <g transform={`translate(${margin.left??0},${margin.top??0})`}>
            <rect width={width}
                  height={height}
                  x={-margin.left??0}
                  y={-margin.top??0}
                  fill={'#adabab'}
            />
            {scale.ticks(ticks).map(t=><g transform={`translate(${scale(t)},-10)`}
                                     className={'timeLegendLine'}
                                     key={`tick ${t}`}>
                <text textAnchor={'middle'}>{multiFormat(t)}</text>
                {grid(t)}
            </g>)}
            <rect style={{opacity:0}} width={width}
                  y={-margin.top??0}
                  height={height} className={'timeBrushBox'}
                  onMouseMove={onMouseMove}
                  onMouseLeave={onMouseLeave}
            />
        </g>
    </svg>
}