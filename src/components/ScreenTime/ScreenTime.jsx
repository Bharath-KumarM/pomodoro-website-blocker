import { useEffect } from "react"
 
const ScreenTime = ({setCntHeading})=>{
    useEffect(()=>{
        setCntHeading('Screen Time')
    }, [])
    
    return (
        <div>
            Screen Time
        </div>
    )
}

export default ScreenTime