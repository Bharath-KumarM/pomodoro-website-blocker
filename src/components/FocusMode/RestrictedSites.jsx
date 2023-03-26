import './RestrictedSites.scss';

// Icons
import { ImCheckboxUnchecked as UncheckedIcon, ImCheckboxChecked as CheckedIcon } from "react-icons/im"
import { TbBarrierBlock } from "react-icons/tb"
import { BiMemoryCard as SaveIcon } from "react-icons/bi"


const RestrictedSites = ()=>{
    //! Debug
    const hostname = 'blog.logrocket.com'

    return (
    <div className="focus-restricted-sites-cnt">
        <div className="sticky">
            <div className='heading'> 
                <TbBarrierBlock />
                {/* Previous, it was focused blocked sites */}
                <h3>Restricted Sites</h3> 
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
                    // className={isUnsaved ? 'un-saved' : 'saved'}
                >
                    <SaveIcon />
                    <div>
                        {/* {isUnsaved ? 'Not Saved' : 'Saved'} */}
                        Saved
                    </div>
                </button>
            </div>
        </div>
        <table className="restricted-site-table">
            <tr key={0}>
                <td>
                    <input type="checkbox" checked/>
                </td>
                <td>
                    <img src={`http://www.google.com/s2/favicons?domain=${hostname}&sz=${128}`} alt="icon" />
                </td>
                <td className="site"> {hostname} </td>
            </tr>
            <tr key={1}>
                <td>
                    <input type="checkbox" checked/>
                </td>
                <td>
                    <img src={`http://www.google.com/s2/favicons?domain=${hostname}&sz=${128}`} alt="icon" />
                </td>
                <td className="site"> {hostname} </td>
            </tr>
            <tr key={2}>
                <td>
                    <input type="checkbox" checked/>
                </td>
                <td>
                    <img src={`http://www.google.com/s2/favicons?domain=${hostname}&sz=${128}`} alt="icon" />
                </td>
                <td className="site"> {hostname} </td>
            </tr>
            <tr key={3}>
                <td>
                    <input type="checkbox" checked/>
                </td>
                <td>
                    <img src={`http://www.google.com/s2/favicons?domain=${hostname}&sz=${128}`} alt="icon" />
                </td>
                <td className="site"> {hostname} </td>
            </tr>
            <tr key={4}>
                <td>
                    <input type="checkbox" checked/>
                </td>
                <td>
                    <img src={`http://www.google.com/s2/favicons?domain=${hostname}&sz=${128}`} alt="icon" />
                </td>
                <td className="site"> {hostname} </td>
            </tr>
            <tr key={5}>
                <td>
                    <input type="checkbox" checked/>
                </td>
                <td>
                    <img src={`http://www.google.com/s2/favicons?domain=${hostname}&sz=${128}`} alt="icon" />
                </td>
                <td className="site"> {hostname} </td>
            </tr>
            <tr key={6}>
                <td>
                    <input type="checkbox" checked/>
                </td>
                <td>
                    <img src={`http://www.google.com/s2/favicons?domain=${hostname}&sz=${128}`} alt="icon" />
                </td>
                <td className="site"> {hostname} </td>
            </tr>
            <tr key={7}>
                <td>
                    <input type="checkbox" checked/>
                </td>
                <td>
                    <img src={`http://www.google.com/s2/favicons?domain=${hostname}&sz=${128}`} alt="icon" />
                </td>
                <td className="site"> {hostname} </td>
            </tr>
            <tr key={8}>
                <td>
                    <input type="checkbox" checked/>
                </td>
                <td>
                    <img src={`http://www.google.com/s2/favicons?domain=${hostname}&sz=${128}`} alt="icon" />
                </td>
                <td className="site"> {hostname} </td>
            </tr>
            <tr key={9}>
                <td>
                    <input type="checkbox" checked/>
                </td>
                <td>
                    <img src={`http://www.google.com/s2/favicons?domain=${hostname}&sz=${128}`} alt="icon" />
                </td>
                <td className="site"> {hostname} </td>
            </tr>
        </table>

    </div>
    )
}

export default RestrictedSites