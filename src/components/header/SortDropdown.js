import { useState } from 'react'
import useCacheContext from "../context/Context";
import SortingRule from "./SortingRule";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

const SortDropdown = () => {

    const [isActive, setIsActive] = useState(false);
    const { sortingRule, setSortingRule } = useCacheContext();

    const handleChange = (event) => {
        setSortingRule(event.target.value);
    };

    return (
        <div className={'tooltip-clickable-container' + (isActive ? ' active' : 'closed')}>
            <div className='sort-button menu-button multi-el-header-item header-item' onClick={() => setIsActive(prev => !prev)} >
                <FontAwesomeIcon icon={faFilter} style={{fontSize: '13px'}}/>
                <div> {sortingRule} </div>
                { isActive ? (
                    <FontAwesomeIcon icon={faChevronUp} style={{margin: '3px 4px 0 4px'}}/>
                ) : (
                    <FontAwesomeIcon icon={faChevronDown} style={{margin: '0 4px'}}/>
                )}
            </div>
            <div className="advanced-tooltip sort-container" 
                style={{ 
                    fontSize: '14px', 
                    top: '110%',
                    left: '0', 
                    minWidth: '100%',
                    display: isActive ? '' : 'none',
                    border: '1px solid rgb(81 81 81)',
                    backgroundColor: '#343743'
                }}
            >
                <p><b>Сортировка стаканов:</b></p>
                <div className='dropdown-radio'>
                    <label className='custom-radio'>
                        <input
                            type="radio"
                            value={SortingRule.alphabet}
                            checked={sortingRule === SortingRule.alphabet}
                            onChange={handleChange}
                        />
                        <span className="radio-mark"></span>
                        {SortingRule.alphabet}
                    </label>

                    <label className='custom-radio'>
                        <input
                            type="radio"
                            value={SortingRule.levels}
                            checked={sortingRule === SortingRule.levels}
                            onChange={handleChange}
                        />
                        <span className="radio-mark"></span>
                        {SortingRule.levels}
                    </label>

                    <label className='custom-radio'>
                        <input
                            type="radio"
                            value={SortingRule.spotThenFut}
                            checked={sortingRule === SortingRule.spotThenFut}
                            onChange={handleChange}
                        />
                        <span className="radio-mark"></span>
                        {SortingRule.spotThenFut}
                    </label>

                    <label className='custom-radio'>
                        <input
                            type="radio"
                            value={SortingRule.futThenSpot}
                            checked={sortingRule === SortingRule.futThenSpot}
                            onChange={handleChange}
                        />
                        <span className="radio-mark"></span>
                        {SortingRule.futThenSpot}
                    </label>
                </div>
            </div>
        </div>

    )
}

export default SortDropdown;