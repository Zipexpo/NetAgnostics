import {useData} from "../../container/Data";
import NetAgnostics from "../NetAgnostics/wrapper";
import AutoSizer from "react-virtualized-auto-sizer";
import Loading from "../Loading/Loading";
import {useEffect, useMemo} from "react";

const emptyObject = {};
export default function (){
    const {getList,isLoading,queryData} = useData();
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
    },[getList('scheme')])
    return <>
        <AutoSizer style={{width:'100%',height:'100%'}}>
            {({height, width}) =>
                <NetAgnostics
                    width={width}
                    height={height}
                    timeRange={scheme.timerange}
                />
            }
        </AutoSizer>
        {(isLoading('data')||isLoading('scheme'))&&<Loading/>}
    </>
}