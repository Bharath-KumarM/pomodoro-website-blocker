import style from './Footer.module.scss'

import {AiFillGithub} from 'react-icons/ai';

const Footer = () =>{
    return (
        <div className={style.FooterCnt}>
            <a href='https://github.com/Bharath-KumarM'
                target="_blank" 
                className={style.Footer}>
                <AiFillGithub /> 
                <div className={style.desc}>
                    Bharath Kumar Murali
                </div>
            </a>
        </div>
    )
}

export default Footer