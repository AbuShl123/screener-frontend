
const LoadingCard = () => {
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
                            <h5 style={{ textAlign: 'center' }}>
                                Загрузка...
                            </h5>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoadingCard;