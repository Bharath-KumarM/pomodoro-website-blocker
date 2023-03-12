import { ImCheckboxUnchecked as UncheckedIcon, ImCheckboxChecked as CheckedIcon } from "react-icons/im"
import { BiMemoryCard as SaveIcon } from "react-icons/bi"
import {ImBlocked} from "react-icons/im"
import {BsCalendarCheckFill} from "react-icons/bs"
import { useEffect, useRef,useState } from "react"

const BlockedSitesList = ({blockedSites}) => {

    const [isUnsaved, setIsUnsaved] = useState(false)
    const [isSelectAll, setIsSelectAll] = useState(true)

    const entryRefArr = []
    const blockedSiteElements = []
    const hostFavArr = []
    // Created entries (row) and reference
    Object.keys(blockedSites).map((hostname, id)=>{
        const favIconUrl = blockedSites[hostname][0]
        hostFavArr.push([hostname, favIconUrl])

        const entryRef = useRef(null)
        entryRefArr.push(entryRef)
        
        blockedSiteElements.push(
            <BlockSiteEntry 
                id={id}
                entryRef={entryRef}
                // favIconUrl={favIconUrl}
                hostname={hostname}
                isSelectAll={isSelectAll}
                setIsUnsaved={setIsUnsaved}
            />
        )
    })
    
    const handleSelectAllClicked = ()=>{
        setIsSelectAll(true)
        setIsUnsaved(true)

    }
    const handleUnselectAllClicked = ()=>{
        setIsSelectAll(false)
        setIsUnsaved(true)

    }
    
    const handleSaveClicked = ()=>{
        const saveBlockedSites = {}
        entryRefArr.map((entryRef, index)=>{
            if (entryRef.current.checked){
                const [entryHost, entryFav] = hostFavArr[index]
                saveBlockedSites[entryHost] = [entryFav]
            }
        })
        chrome.storage.local.set({'blockedSites': saveBlockedSites}, ()=>{
            setIsUnsaved(false)
        })

    }

    return (
        <>
            <hr class="hr-line"></hr>
            <div className="sticky">
                <div className="heading">
                    <ImBlocked />
                    <h3> Blocked Sites </h3>
                </div>
                <div className="btn-cnt">
                    <button
                        onClick={()=>handleSelectAllClicked()}
                    >   
                        <CheckedIcon />
                        <div>
                            Select all
                        </div>
                    </button>
                    <button
                        onClick={()=>handleUnselectAllClicked()}
                    >
                        <UncheckedIcon />
                        <div>
                            Unselect all
                        </div>
                    </button>
                    <button 
                        onClick={()=>handleSaveClicked()}
                        className={isUnsaved ? 'un-saved' : 'saved'}
                    >
                        <SaveIcon />
                        <div>
                            {isUnsaved ? 'Not Saved' : 'Saved'}
                        </div>
                    </button>

                </div>
            </div>

            <table class="block-site-list-table">
                {blockedSiteElements}
            </table>
        </>
    )

}

export default BlockedSitesList

const BlockSiteEntry = ({id, entryRef, hostname, isSelectAll, setIsUnsaved})=>{
    const [isChecked, setIsChecked ]= useState(isSelectAll)

    useEffect(()=>{
        setIsChecked(isSelectAll)
    }, [isSelectAll])

    const handleEntryClick = () =>{
        setIsUnsaved(true)
        setIsChecked((prevIsChecked)=> !prevIsChecked)
    }

    return (
        <tr
            key={id}
            onClick={e => handleEntryClick() }
            >
            <td>
                <input 
                    ref={entryRef} 
                    type="checkbox" 
                    checked={isChecked} 
                    />
            </td>
            <td>
                <img src={`http://www.google.com/s2/favicons?domain=${hostname}&sz=${128}`} alt="icon" />
            </td>
            <td className="site"> {hostname} </td>
        </tr>
    )
}