
export default function({
    scale,
    size=30,
    sizeScale=()=>1,
    colorScale,
    data=[]
}){
    const renderFrame = (d) => {
        const rsize = size*sizeScale(d);
        return <rect x={-rsize/2} y={-rsize/2} width={rsize} height={rsize}
                     rx={3} ry={3}
                     stroke={'gray'}
                     fill={colorScale?colorScale(d.value):'none'}
        />
    }
    return <>
        {data.map(d=><g key={d.timestep} transform={`translate(${scale(d.timestep)},0)`}>
            {renderFrame(d)}
        </g>)}
    </>
}