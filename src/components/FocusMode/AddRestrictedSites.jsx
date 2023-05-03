import './AddRestrictedSites.scss'

// Icons
import { FiPlus } from "react-icons/fi"
import { useEffect, useRef, useState } from 'react'
import { getHost, isValidUrl } from '../../utilities/simpleTools'
import { addOrRemoveRestrictSite } from '../../utilities/chromeApiTools'

const AddRestrictedSites = ({setToastMsg, setRestrictedSites})=>{
    const [userInput, setUserInput] = useState('')
    const inputRef = useRef(null)


    let isUserInputValidUrl = isValidUrl(userInput)

    const handleAddBtnClick = async ()=>{
        if (!isUserInputValidUrl){
            setToastMsg('Invalid site')
            return null;
        }
        await addOrRemoveRestrictSite(true, getHost(userInput), null)
        setToastMsg('Added the site')
        setRestrictedSites(null)
        inputRef.current.value = ''
        setUserInput('')

    }

    const sampleSites = ['www.google.com', 'music.youtube.com', 'fireship.io'] //todo: take backup site and update this
    return (
        <div className='add-restricted-site-cnt'>
            <div key={0} className="item active">
                <div className={`cell plus-btn-cnt flex-center ${isUserInputValidUrl ? 'active' : ''}`} 
                    title='add site'
                    onClick={()=>handleAddBtnClick()}
                >
                    <div className={`inner-cnt flex-center `}>
                        <FiPlus />
                    </div>
                </div>
                <div className='cell site-icon flex-center'>
                    {
                        isUserInputValidUrl ?
                        <img src={`http://www.google.com/s2/favicons?domain=${getHost(userInput)}&sz=${128}`} alt="icon" />
                        : null
                    }
                </div>
                <div className="cell site-input-cnt flex-center">
                    <input 
                        type="text" 
                        className="site-input" 
                        onChange={(e)=>{
                            setUserInput(e.target.value)
                        }}
                        onKeyDown={(e)=>{
                            if (e.key === 'Enter'){
                                handleAddBtnClick()
                            }
                        }}
                        placeholder={"Add sites"}
                        list="site-list"
                        ref={inputRef}
                    />
                    <datalist id="site-list">
                        {
                            sampleSites.map((site, key)=>{
                                <option key={key} value={site} />
                            })
                        }
                    </datalist>
                </div>
            </div>
        </div>
    )
}

export default AddRestrictedSites