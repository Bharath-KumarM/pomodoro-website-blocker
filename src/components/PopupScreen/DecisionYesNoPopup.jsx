import './DecisionYesNoPopup.scss';


const DescisionYesNoPopup = ({data})=>{
    const { heading, desc, yesBtnTitle, noBtnTitle } = data

    return (
    <div className="dialog-box">
        <div className="cnt ">
            <h3 className='heading'>{heading}</h3>
            <div className='desc'>
                {desc}
            </div>
            <div className="btn-cnt">
                <button className='btn yes'>
                    {yesBtnTitle}
                </button>
                <button className='btn no'>
                    {noBtnTitle}
                </button>
            </div>
        </div>
    </div>
    )
}

export default DescisionYesNoPopup