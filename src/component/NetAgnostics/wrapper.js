import {useMemo, useState} from "react";
import AxisTime from "./AxisTime";
import {scaleTime, scaleLinear} from "d3";

const _margin = {
    top: 50,
    right: 20,
    bottom: 0,
    left: 20
};
export default function ({
                             timeRange = [],
                             width = 1200,
                             height = 600,
                             margin = _margin
                         }) {
    const layout = useMemo(() => ({margin, width, height}), [margin, width, height]);
    const [islensing,setIslensing] = useState();
    const [lensingConfig,setLensingConfig] = useState({expandRate:0.1,zoomScale:4});

    const _xScale = useMemo(() => {
        let width = layout.width - layout.margin.left - layout.margin.right;
        if (islensing&&lensingConfig.target){
            const or = scaleTime().domain(timeRange);
            const orRang = scaleLinear().range([0,width]);
            const _target = or.invert(lensingConfig.target);
            const lensingRange= [Math.max(0,_target-lensingConfig.expandRate),Math.min(_target+lensingConfig.expandRate,1)];
            const domain = [];
            const range = [];
            if (lensingRange[0]>0){
                domain.push(timeRange[0]);
                range.push(orRang(0));
            }
            domain.push(lensingRange[0]);
            range.push(orRang(or(lensingRange[0])/lensingConfig.zoomScale));
            domain.push(lensingRange[1]);
            range.push(orRang(1-(1-or(lensingRange[1]))/lensingConfig.zoomScale));
            if (lensingRange[1]<1){
                domain.push(lensingRange[1]);
                range.push(orRang(1));
            }
            return scaleTime().domain(domain).range(range);
        }else
            return scaleTime().domain(timeRange).range([0, width])
    }, [timeRange, layout.width, layout.margin,lensingConfig,islensing]);


    return <div className={"w-full h-full overflow-hidden"}>
        <div className={"relative w-full h-full pointer-events-auto"}>
            <AxisTime width={layout.width} height={layout.margin.top}
                      scale={_xScale} margin={layout.margin}
                      grid={()=><line y1={layout.height} stroke={'currentColor'}
                                      strokeDasharray={'4 2'} strokeWidth={0.5}
                      />}
            />
        </div>
    </div>
}
