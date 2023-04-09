
import React, { useEffect, useState } from "react";

export function useFetch(fetchFunc, params, refetchDependency) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
  
    useEffect(() => {
      const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
          await fetchFunc(...params, setData, setError);
        } catch (error) {
          setError(error.message);
        } finally {
          setLoading(false);
        }
      };
  
      fetchData();
    }, [fetchFunc, ...params, refetchDependency]);
  
    return { data, loading, error };
  }
  
  function Loading() {
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
  
  
  export function useFetchOnDemand(fetchFunc, params, shouldFetch) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
  
    useEffect(() => {
      const fetchData = async () => {
        if (shouldFetch) {
          setLoading(true);
          setError(null);
          try {
            await fetchFunc(...params, setData, setError);
          } catch (error) {
            setError(error.message);
          } finally {
            setLoading(false);
          }
        }
      };
  
      fetchData();
    }, [fetchFunc, shouldFetch, ...params]);
  
    return { data, loading, error };
  }