import { ImCheckboxUnchecked as UncheckedIcon, ImCheckboxChecked as CheckedIcon } from "react-icons/im"
import { BiMemoryCard as SaveIcon } from "react-icons/bi"
import { useEffect, useRef,useState } from "react"

const BlockedSitesList = ({blockedSites, setUpdateBlockSiteDetails}) => {

    const [isUnsaved, setIsUnsaved] = useState(false)
    const entryRefArr = []
    const blockedSiteElements = []
    
    // Created entries (row) and reference
    Object.keys(blockedSites).map((hostname, id)=>{
        const favIconUrl = blockedSites[hostname][0]

        const [isChecked, setIsChecked ]= useState(true)
        const entryRef = useRef(null)
        const entry = 
        (
            <tr
                key={id}
                ref={entryRef} 
                onClick={e =>{
                    setIsUnsaved(true)
                    setIsChecked((prevIsChecked)=> !prevIsChecked)
                }}
                >
                <td>
                    <input type="checkbox" checked={isChecked} />
                </td>
                <td>
                    <img src={favIconUrl} alt="icon" />
                </td>
                <td className="site"> {hostname} </td>
            </tr>
        )
        blockedSiteElements.push(entry)
        entryRefArr.push(entryRef)
    })
    
    const handleSelectAllClicked = ()=>{
        setIsUnsaved(true)

        for (const entryRef of entryRefArr){
            entryRef.
                    current.
                    childNodes[0].
                    childNodes[0].
                    checked = true
        }
    }
    const handleUnselectAllClicked = ()=>{
        setIsUnsaved(true)

        for (const entryRef of entryRefArr){
            entryRef.
                    current.
                    childNodes[0].
                    childNodes[0].
                    checked = false
        }
    }
    
    const handleSaveClicked = ()=>{
        setIsUnsaved(true)
        const saveBlockedSites = {}
        for (const entryRef of entryRefArr){
            if (entryRef.
                    current.
                    childNodes[0].
                    childNodes[0].
                    checked){
                const hostName = entryRef.
                                    current.
                                    childNodes[2].
                                    childNodes[0].wholeText.trim()
                saveBlockedSites[hostName] = 
                    [

                        // favIcon URL
                        entryRef.
                            current.
                            childNodes[1].
                            childNodes[0].src
                    ]
                }
        }
        chrome.storage.local.set({'blockedSites': saveBlockedSites}, ()=>{
            setUpdateBlockSiteDetails(prevSate => prevSate+1)
            setIsUnsaved(false)
            console.log(saveBlockedSites)
        })
    }

    return (
        <>
            <hr class="hr-line"></hr>
            <h2> Blocked Sites </h2>
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
            <table class="block-site-list-table">
                {blockedSiteElements}
            </table>
        </>
    )

}

export default BlockedSitesList