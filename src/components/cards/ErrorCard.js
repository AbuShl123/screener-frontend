
const ErrorCard = () => {
    return (
        <div className="frame-container">
            <div className="frame-element-up-right" />
            <div className="frame-element-bottom-left" />
            <div className="modal-layout">
                <div className='content-container animated-box-fadeInUp'>
                    <div className='dynamic-container modal-content-2'>
                        <div className="logo-title-container" style={{ marginBottom: '30px' }}>
                            <span className="logo-title">
                                clerk-screener.com
                            </span>
                        </div>
                        <div>
                            <h5 className="multi-el-header-item">
                                Упс, что-то пошло не так
                                <span className="material-symbols-outlined med-bold-icon warning-icon">
                                    warning
                                </span>
                            </h5>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ErrorCard;