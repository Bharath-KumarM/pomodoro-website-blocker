
import { HiPuzzle as PuzzleIcon} from 'react-icons/hi';
import extensionIcon from '../../logo_3.png';

const style = {
    endNote: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "600px",
        gap: "10px",
        position:"fixed",
        bottom:"0px",
        margin:"15px"
      },
    endNotePara: { color: "#979797" },
    endNoteImg: {
        verticalAlign: "middle",
        border: "1px solid #636363",
        borderRadius: "5px",
        margin: "0 5px",
        padding: "5px",
        width: "30px",
        height: "30px"
    },
    endNotePuzzleSVG: {
        verticalAlign: "middle",
        border: "1px solid #636363",
        borderRadius: "5px",
        margin: "0 5px",
        padding: "5px",
        width: "30px",
        height: "30px",
        transform: "rotate(90deg)" 
    }

}
export const EndNoteInScreen = ()=>{

    return (
    <div style={style.endNote} >
        <p style={style.endNotePara}>
            Note: For more infomation click
            <img 
                src={extensionIcon}
                alt="Be focused icon" 
                style={style.endNoteImg}
            />
            button in the right top tool bar. If not there, find inside 
            <PuzzleIcon 
                style={style.endNotePuzzleSVG}
            />
            extention menu in right top of the browser window.
        </p>
    </div>
    )
}