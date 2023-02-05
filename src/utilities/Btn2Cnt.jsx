import { useEffect, useState } from 'react'
import { BiLoader, BiLoaderAlt } from 'react-icons/bi'
import styles from './Btn2Cnt.module.scss'

const Btn2Cnt = ({btn1Details, btn2Details})=>{
    const [desc1, setDesc1] = useState(btn1Details.desc)
    const [desc2, setDesc2] = useState(btn2Details.desc)

    useEffect(()=>{
        setDesc1(btn1Details.desc)
        setDesc2(btn2Details.desc)
    }, [btn1Details.desc, btn2Details.desc])

    return (
    <div className={styles.btn2Cnt}>
        <button 
            className={[btn1Details.style, styles.btn].join(' ')}
            onClick={()=>{
                setDesc1(<BiLoaderAlt />)
                btn1Details.onClick()
            }}
            >
            {desc1}
        </button>
        <button 
            className={styles.btn}
            onClick={()=>{
                setDesc2(<BiLoaderAlt />)
                btn2Details.onClick()
            }}
            >
            {desc2}
        </button>
    </div>
    )
}


export default Btn2Cnt