import {useData} from "../../container/Data";
import NetAgnostics from "../NetAgnostics/wrapper";
import AutoSizer from "react-virtualized-auto-sizer";
import Loading from "../Loading/Loading";
import {useEffect, useMemo, useState} from "react";

const emptyObject = {};
export default function (){
    const {getList,isLoading,queryData} = useData();
    const [selectedSer,setselectedSer] = useState(0);
    useEffect(()=>{
        queryData('./data/nocona_2023-04-13-2023-04-14.json')
    },[])
    const scheme = useMemo(()=>{
        const _scheme = getList('scheme');
        if (_scheme) {
            return _scheme
        }else{
            return {}
        }
    },[getList('scheme')]);
    const dimensions = getList('dimensions')??[];

    return <div className={"flex w-full h-full"}>
        <div className={"flex-initial w-64 p-1"}>
            <h2>Time</h2>
            <div className={" p-3 rounded bg-slate-300 shadow"}>
                <label htmlFor="countries" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Primary Variable</label>
                <select className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    onChange={(event)=>setselectedSer(event.currentTarget.value)}>
                    {dimensions.map((s,i)=><option selected={i===selectedSer} value={i}>{s.text}</option>)}
                </select>
            </div>
        </div>
        <div className={"flex-grow w-full h-full"}>
            <AutoSizer style={{width:'100%',height:'100%'}}>
                {({height, width}) =>
                    <NetAgnostics
                        width={width}
                        height={height}
                        timeRange={scheme.timerange}
                        node={scheme.computers??{}}
                        serviceSelected={selectedSer}
                        metrics={scheme.tsnedata}
                        dimensions={dimensions}
                        time={scheme.time_stamp}
                    />
                }
            </AutoSizer>
        </div>
        {(isLoading('data')||isLoading('scheme'))&&<Loading/>}
    </div>
}