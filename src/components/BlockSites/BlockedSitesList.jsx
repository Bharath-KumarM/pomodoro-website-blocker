import { ImCheckboxUnchecked as UncheckedIcon, ImCheckboxChecked as CheckedIcon } from "react-icons/im"
import { BiMemoryCard as SaveIcon } from "react-icons/bi"
import { useEffect, useRef,useState } from "react"

const BlockedSitesList = ({blockedSites}) => {

    const [saveState, setSaveState] = useState('Save')
    const entryRefArr = []
    const blockedSiteElements = []

    // Created entries (row) and reference
    blockedSites.map(([hostname, favIconUrl], id)=>{
        const [isChecked, setIsChecked ]= useState(true)
        const entryRef = useRef(null)
        const entry = 
        (
            <tr
                key={id}
                ref={entryRef} 
                onClick={e =>{
                    setSaveState('Save')
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
        setSaveState('Save')

        for (const entryRef of entryRefArr){
            entryRef.
                    current.
                    childNodes[0].
                    childNodes[0].
                    checked = true
        }
    }
    const handleUnselectAllClicked = ()=>{
        setSaveState('Save')

        for (const entryRef of entryRefArr){
            entryRef.
                    current.
                    childNodes[0].
                    childNodes[0].
                    checked = false
        }
    }
    
    const handleSaveClicked = ()=>{
        setSaveState('Saving...')
        const saveBlockedSites = []
        for (const entryRef of entryRefArr){
            if (entryRef.
                    current.
                    childNodes[0].
                    childNodes[0].
                    checked){
                saveBlockedSites.push([
                    //hostname
                    entryRef.
                        current.
                        childNodes[2].
                        childNodes[0].wholeText.trim(),
                    // favIcon URL
                    entryRef.
                        current.
                        childNodes[1].
                        childNodes[0].src
                    ])
                }
        }
        chrome.storage.local.set({blockedSites: saveBlockedSites}, ()=>{
            setSaveState('Saved')
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
                >
                    <SaveIcon />
                    <div>
                        {saveState}
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