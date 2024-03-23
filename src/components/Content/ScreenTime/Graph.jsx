import "./Graph.scss"
import { Bar, getElementAtEvent } from "react-chartjs-2"

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
  } from 'chart.js';
import { useRef } from "react";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  );

ChartJS.defaults.color = "rgb(212, 212, 212)";
ChartJS.defaults.borderColor = "transparent";


const createOptions = (dataType, isUnitHr)=>{

    let stepSize
    if (dataType === 'screen-time'){
        stepSize  = isUnitHr ? 1 : 20
    } else if (dataType === 'opens'){
        stepSize = 1
    }

    return {
        scales: {
            y: {
                grid: {
                    color: 'rgb(212, 212, 212)',
                  },
                
                position: 'right',
                ticks: {
                    // Add units
                    callback: function(value, index, ticks) {
                        if (dataType === 'screen-time'){
                            return value + (isUnitHr ? 'h' : 'm');  
                        } else if (dataType === 'opens'){
                            return value
                        }
                    },
                    stepSize,
                },
            },
            x: {
                grid: {
                    display: false,
                },
            }
        },
        plugins: {
            tooltip:{
                enabled: false
            },
            legend: {
                display: false
            },
        },
    
    }
}

const createData = (weeklyData, weekDayNum, isUnitHr, dataType)=>{
    const backgroundColor = ["#497676", "#497676","#497676","#497676","#497676", "#497676", "#497676"]
    backgroundColor[weekDayNum] = "#95fbff"

    let graphData
    if (dataType === 'screen-time'){
        graphData = weeklyData.map((mins)=> isUnitHr ? Math.round(mins/60) : mins)
    } else if (dataType === 'opens'){
        graphData = weeklyData
    }

    return {
        labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        datasets: [
        {
            label: "Total Screen Time, Today",
            backgroundColor,
            data: graphData,
            borderRadius: 5,
            datalabels: {
                display: true
            },
    
        }
        ]
    }
} 

const Graph = ({weeklyData, dataType, weekDayNum, day, setDay})=>{
    const graphRef = useRef()
    const isUnitHr = Math.max(...weeklyData) > 100

    const handleOnclick = (event)=>{
        const elem = getElementAtEvent(graphRef.current, event)
        if (!elem[0]) return;        
        setDay(elem[0].index - weekDayNum + day)
      }

    return (
    <div className="screen-time-graph-cnt">
        <div className="screen-time-graph-inner-cnt">
            <Bar 
                data={createData(weeklyData, weekDayNum, isUnitHr, dataType)}
                options={createOptions(dataType, isUnitHr)}
                onClick={(event)=>handleOnclick(event)}
                ref={graphRef}
            />
        </div>
    </div>
    )
}

export default Graph