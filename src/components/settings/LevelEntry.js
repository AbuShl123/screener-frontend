import { useCallback } from "react";

const LevelEntry = ({entries, i, isSpot, onValueChange, onDistanceChange}) => {

    const getCircleColor = useCallback(() => {
        switch (i + 1) {
            case 1: return 'green-circle'
            case 2: return 'yellow-circle'
            case 3: return 'red-circle'
            case 4: return 'purple-circle'
        }
    }, [i]);

    return (
        <div className="level-entry-container">
            <div className='level-entry' style={{ width: '100%' }}>
                <div className='small-circle-container'>
                    <div className={`small-circle ${getCircleColor()}`}/>
                </div>
                <input className='settings-input' id={`entry${i}_value_${isSpot}`} name={`entry${i}_value_${isSpot}`}
                    type="text"
                    value={entries[i].value || ''}
                    placeholder={`Ур. ${i}`}
                    onChange={(e) => onValueChange(e, i)}
                />
            </div>
            <hr style={{ width: '10px', opacity: '1', margin: '0 .8vw' }}></hr>
            <div className="level-entry" style={{ width: 'auto' }}>
                <input className='distance-input' id={`entry${i}_distance_${isSpot}`} name={`entry${i}_distance_${isSpot}`}
                    type="text"
                    value={entries[i].distance || ''}
                    placeholder={'&'}
                    onChange={(e) => onDistanceChange(e, i)}
                />
                <p style={{margin: '0 .4rem 0 0'}}> % </p>
            </div>
        </div>
    )
}

export default LevelEntry;