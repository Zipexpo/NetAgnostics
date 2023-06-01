import {useCallback, useEffect, useMemo, useState} from "react";
import AxisTime from "./AxisTime";
import ScatterArray from "./ScatterArray";
import {scaleTime, scaleLinear, pointer,scaleThreshold} from "d3";
import {isNumber} from "lodash";
import {colorScaleList} from "../../ulti";
import BoxplotArray from "./BoxplotArray";
import "./index.css"

const _margin = {
    top: 40,
    right: 20,
    bottom: 0,
    left: 20
};

const initColorFunc =  scaleLinear().domain([0,0.2, 0.4, 0.6, 0.8, 0.9, 1]).range(colorScaleList.colorBlueRed)
export default function ({
                             timeRange = [],
                             width = 1200,
                             height = 600,
                             margin = _margin,
                             node={},
                             metrics=[],
                             dimensions=[],
                             serviceSelected=0,
                             time=[]
                         }) {
    const layout = useMemo(() => ({margin, width, height}), [margin, width, height]);
    const [islensing,setIslensing] = useState(true);
    const [lensingTarget,setLensingTarget] = useState();
    const [lensingConfig,setLensingConfig] = useState({expandRate:0.01,zoomScale:1.5});

    const _xScaleLinear = useMemo(() => {
        let width = layout.width - layout.margin.left - layout.margin.right;
        return scaleTime().domain(timeRange).range([0,width])
    },[timeRange,layout.width])

    const _xScale = useMemo(() => {
        let width = layout.width - layout.margin.left - layout.margin.right;
        if (islensing&&(lensingTarget!==undefined)){
            const or = scaleTime().domain(timeRange);
            const orRang = scaleLinear().range([0,width]);
            const _target = or(lensingTarget);
            const lensingRange= [Math.max(0,_target-lensingConfig.expandRate),Math.min(_target+lensingConfig.expandRate,1)];
            const domain = [];
            const range = [];
            // if (lensingRange[0]>0){
                domain.push(timeRange[0]);
                range.push(orRang(0));
            // }
            domain.push(or.invert(lensingRange[0]));
            range.push(orRang(lensingRange[0]/lensingConfig.zoomScale));
            domain.push(or.invert(lensingRange[1]));
            range.push(orRang(1-(1-lensingRange[1])/lensingConfig.zoomScale));
            // if (lensingRange[1]<1){
                domain.push(timeRange[1]);
                range.push(orRang(1));
            // }
            return scaleTime().domain(domain).range(range);
        }else
            return scaleTime().domain(timeRange).range([0, width])
    }, [timeRange, layout.width, layout.margin,lensingConfig,lensingTarget,islensing]);
    const [currentMetric,setCurrentMetric] = useState([]);
    const [currentNet,setCurrentNet] = useState([]);
    const [boxplotNodes,setBoxplotNodes] = useState([]);
    useEffect(()=>{
        const newMap = {};
        const currentNet = time.map((t)=>({timestep:t,value:0}));
        const boxplotNodes = time.map((t)=>({timestep:t,sumAbove:0,sumBelow:0,
            countAbove:0, countBelow:0,maxAbove:0,maxBelow:0,nodes:[]
        }));
        if (dimensions[serviceSelected]) {
            const key = dimensions[serviceSelected].text;
            Object.keys(node).forEach(comp => {
                if (node[comp][key]) {
                    newMap[comp] = node[comp][key].map((d, i) => {
                        const sudden = node[comp][key].sudden[i];
                        if (!isNumber(d))
                            return {timestep: time[i], value: undefined}

                        if (Math.abs(sudden)>Math.abs(currentNet[i].value))
                            currentNet[i].value = sudden;
                        if (sudden > 0) {
                            boxplotNodes[i].sumAbove +=sudden;
                            boxplotNodes[i].countAbove++;
                        }
                        if (sudden < 0) {
                            boxplotNodes[i].sumBelow += sudden;
                            boxplotNodes[i].countBelow++;
                        }
                        boxplotNodes[i].nodes.push(sudden);

                        return {timestep: time[i], value: d};
                    })
                }
            });
            boxplotNodes.forEach((obj)=>{
                obj.nodes.sort((a,b)=>b-a);
                if (obj.countAbove > 0)
                    obj.averageAbove = obj.sumAbove / obj.countAbove;
                else
                    obj.averageAbove = 0;
                if (obj.countBelow > 0)
                    obj.averageBelow = obj.sumBelow / obj.countBelow;
                else
                    obj.averageBelow = 0;
                obj.maxAbove = obj.nodes[0];
                obj.maxBelow = obj.nodes[obj.nodes.length - 1];
            })
        }
        setCurrentMetric(newMap);
        setCurrentNet(currentNet);
        setBoxplotNodes(boxplotNodes)
    },[node,dimensions,serviceSelected,time]);

    const colorNet = useMemo(()=> {
        if (dimensions[serviceSelected]) {
            const netMin = dimensions[serviceSelected].suddenRange[0];
            const netMax = dimensions[serviceSelected].suddenRange[1];
            console.log(netMin,netMax)
            return initColorFunc.copy().domain([netMin, netMin / 2, netMin / 4, 0, netMax / 4, netMax / 2, netMax]);
        }else
            return initColorFunc
    },[dimensions,serviceSelected]);

    const onMouseMove = useCallback((event)=> {
        if (islensing) {
            setLensingTarget(_xScaleLinear.invert(pointer(event)[0]));
        }
    },[_xScaleLinear,islensing])

    const onMouseLeave = useCallback(()=> {
        if (islensing)
            setLensingTarget(undefined)
    },[islensing])
    return <div className={"w-full h-full overflow-hidden"}>
        <div className={"relative w-full h-full pointer-events-auto"}>
            <AxisTime width={layout.width} height={layout.margin.top}
                      ticks={20}
                      scale={_xScale} margin={layout.margin}
                      grid={()=><line y1={layout.height} stroke={'currentColor'}
                                      strokeDasharray={'4 2'} strokeWidth={0.5}
                      />}
                      onMouseMove={onMouseMove}
                      // onMouseLeave={onMouseLeave}
            />
            <svg width={layout.width} height={layout.height-layout.margin.top} className={"w-full overflow-visible"}>
                <g transform={`translate(0,${40})`}>
                    <ScatterArray scale={_xScale}
                                  data={currentNet}
                                  colorScale={colorNet}
                                  sizeScale={(d)=> {
                                      if (lensingTarget) {
                                          const r = scaleThreshold().domain(_xScale.range()).range([1,1,3,1,1])(_xScale(d.timestep))
                                          return r
                                      }
                                      return 1;
                                  }}
                    />
                </g>
                <g transform={`translate(0,${180})`}>
                    <BoxplotArray scaleX={_xScale}
                                  data={boxplotNodes}
                                  height={80}
                                  boxW={2}
                    />
                </g>
            </svg>
        </div>
    </div>
}
