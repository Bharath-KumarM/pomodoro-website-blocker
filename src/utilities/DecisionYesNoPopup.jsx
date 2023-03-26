import './DecisionYesNoPopup.scss';


const DescisionYesNoPopup = ({data})=>{
    const { heading, desc, yesBtnTitle, noBtnTitle, onYesBtnClick, onNoBtnClick } = data

    return (
        <div className="descision-yes-no-popup-cnt ">
            <h3 className='heading'>{heading}</h3>
            <div className='desc'>
                {desc}
            </div>
            <div className="btn-cnt">
                <button className='btn yes'
                    onClick={()=>{
                        onYesBtnClick()
                    }}
                >
                    {yesBtnTitle}
                </button>
                <button className='btn no'
                    onClick={()=>{
                        onNoBtnClick()
                    }}
                >
                    {noBtnTitle}
                </button>
            </div>
        </div>
    )
}

export default DescisionYesNoPopup