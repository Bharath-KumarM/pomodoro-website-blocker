import { RiLoader4Fill as LoaderIcon } from "react-icons/ri"
import style from './Loader.module.scss';

const Loader = ()=>{

    return (
        <div className={style.LoaderCnt}>
            {/* Loading... */}
            <LoaderIcon />
        </div>
    )
}

export default Loader