export function Error({ message }) {
    const handleRefresh = () => {
      window.location.reload();
    };
  
    return (
      <div className="error-overlay">
        <div className="error-container">
          <div className="error-icon">&#10060;</div>
          <p className="error-text">Erreur : {message}</p>
          <button className="refresh-button" onClick={handleRefresh}>
            Rafraîchir
          </button>
        </div>
      </div>
    );
  };
  
  export function Loading() {
    return (
      <div className="loading-overlay">
        <div className="loading-container">
          <div className="loading-icon">
            <div className="spinner"></div>
          </div>
          <p className="loading-text">Loading...</p>
        </div>
      </div>
    );
  };