import React, { useState, useEffect } from 'react';
import { firebaseConfig, initFirebase } from './config';
import { PortfolioStreamContext } from './usePortfolioStream';

/**
 * FirestoreStreamBuilder Component:
 * Replicates the Flutter StreamBuilder architecture for real-time Firestore listeners.
 * Listens to the 'portfolio' collection, emits reactive snapshots, and ensures zero layout shifts.
 */
export const FirestoreStreamBuilder = ({ 
  collectionName = 'portfolio', 
  builder, 
  children, 
  fallback = null 
}) => {
  const [streamState, setStreamState] = useState({
    data: null,
    docsMap: {},
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;
    let unsubscribe = () => {};

    // Feature collection instant local baseline and broadcast listener
    const isFeatureCollection = collectionName.startsWith('features_');

    const handleLocalUpdate = (e) => {
      if (e.detail?.collectionName === collectionName && isMounted) {
        import('../services/featuresService').then(({ getCachedItems }) => {
          const cached = getCachedItems(collectionName);
          const docsMap = {};
          cached.forEach((item) => { docsMap[item.id] = item; });
          setStreamState({
            data: cached,
            docsMap,
            loading: false,
            error: null,
          });
        });
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('portfolio_feature_updated', handleLocalUpdate);
    }

    const setupStream = async () => {
      // Pre-seed feature collections with cached or baseline items for zero-lag render
      if (isFeatureCollection) {
        try {
          const { getCachedItems } = await import('../services/featuresService');
          const initialCached = getCachedItems(collectionName);
          if (initialCached && initialCached.length > 0 && isMounted) {
            const initialMap = {};
            initialCached.forEach((item) => { initialMap[item.id] = item; });
            setStreamState((prev) => ({
              ...prev,
              data: prev.data && prev.data.length > 0 ? prev.data : initialCached,
              docsMap: Object.keys(prev.docsMap).length > 0 ? prev.docsMap : initialMap,
              loading: false,
            }));
          }
        } catch (e) {}
      }

      try {
        const { db } = await initFirebase();

        if (db) {
          const { collection, onSnapshot, query } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
          const colRef = collection(db, collectionName);
          const q = query(colRef);

          unsubscribe = onSnapshot(
            q,
            (querySnapshot) => {
              if (!isMounted) return;
              const docsMap = {};
              const items = [];

              querySnapshot.forEach((doc) => {
                const docData = { id: doc.id, ...doc.data() };
                items.push(docData);
                docsMap[doc.id] = docData;
              });

              if (items.length === 0 && isFeatureCollection) {
                import('../services/featuresService').then(({ getCachedItems }) => {
                  const fallbackItems = getCachedItems(collectionName);
                  const fbMap = {};
                  fallbackItems.forEach(i => { fbMap[i.id] = i; });
                  setStreamState({
                    data: fallbackItems,
                    docsMap: fbMap,
                    loading: false,
                    error: null,
                  });
                });
              } else {
                setStreamState({
                  data: items,
                  docsMap,
                  loading: false,
                  error: null,
                });
              }
            },
            (error) => {
              if (!isMounted) return;
              console.warn(`Firestore StreamBuilder listener notice for [${collectionName}]:`, error.message);
              if (isFeatureCollection) {
                import('../services/featuresService').then(({ getCachedItems }) => {
                  const fallbackItems = getCachedItems(collectionName);
                  const fbMap = {};
                  fallbackItems.forEach(i => { fbMap[i.id] = i; });
                  setStreamState({
                    data: fallbackItems,
                    docsMap: fbMap,
                    loading: false,
                    error: null,
                  });
                });
              } else {
                setStreamState((prev) => ({
                  ...prev,
                  loading: false,
                  error,
                }));
              }
            }
          );
        } else {
          // REST Fallback for Firestore collection
          const res = await fetch(
            `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/${collectionName}`
          );
          if (res.ok) {
            const json = await res.json();
            const docsMap = {};
            const items = (json.documents || []).map((doc) => {
              const nameParts = doc.name.split('/');
              const id = nameParts[nameParts.length - 1];
              const fields = {};
              if (doc.fields) {
                Object.keys(doc.fields).forEach((k) => {
                  const valObj = doc.fields[k];
                  fields[k] = valObj.stringValue || valObj.integerValue || valObj.booleanValue || valObj;
                });
              }
              const item = { id, ...fields };
              docsMap[id] = item;
              return item;
            });

            if (isMounted) {
              if (items.length === 0 && isFeatureCollection) {
                const { getCachedItems } = await import('../services/featuresService');
                const fallbackItems = getCachedItems(collectionName);
                const fbMap = {};
                fallbackItems.forEach(i => { fbMap[i.id] = i; });
                setStreamState({
                  data: fallbackItems,
                  docsMap: fbMap,
                  loading: false,
                  error: null,
                });
              } else {
                setStreamState({
                  data: items,
                  docsMap,
                  loading: false,
                  error: null,
                });
              }
            }
          } else {
            if (isMounted) {
              if (isFeatureCollection) {
                const { getCachedItems } = await import('../services/featuresService');
                const fallbackItems = getCachedItems(collectionName);
                const fbMap = {};
                fallbackItems.forEach(i => { fbMap[i.id] = i; });
                setStreamState({
                  data: fallbackItems,
                  docsMap: fbMap,
                  loading: false,
                  error: null,
                });
              } else {
                setStreamState({
                  data: [],
                  docsMap: {},
                  loading: false,
                  error: null,
                });
              }
            }
          }
        }
      } catch (err) {
        if (!isMounted) return;
        console.warn(`Firestore StreamBuilder notice for [${collectionName}]:`, err);
        if (isFeatureCollection) {
          try {
            const { getCachedItems } = await import('../services/featuresService');
            const fallbackItems = getCachedItems(collectionName);
            const fbMap = {};
            fallbackItems.forEach(i => { fbMap[i.id] = i; });
            setStreamState({
              data: fallbackItems,
              docsMap: fbMap,
              loading: false,
              error: null,
            });
          } catch {}
        } else {
          setStreamState((prev) => ({
            ...prev,
            loading: false,
            error: err,
          }));
        }
      }
    };

    setupStream();

    return () => {
      isMounted = false;
      unsubscribe();
      if (typeof window !== 'undefined') {
        window.removeEventListener('portfolio_feature_updated', handleLocalUpdate);
      }
    };
  }, [collectionName]);

  const contextValue = {
    portfolioData: streamState.docsMap,
    items: streamState.data,
    loading: streamState.loading,
    error: streamState.error,
  };

  // Support both builder prop pattern and function as children (StreamBuilder style)
  if (typeof builder === 'function') {
    return (
      <PortfolioStreamContext.Provider value={contextValue}>
        {builder(streamState)}
      </PortfolioStreamContext.Provider>
    );
  }

  if (typeof children === 'function') {
    return (
      <PortfolioStreamContext.Provider value={contextValue}>
        {children(streamState)}
      </PortfolioStreamContext.Provider>
    );
  }

  return (
    <PortfolioStreamContext.Provider value={contextValue}>
      {children}
    </PortfolioStreamContext.Provider>
  );
};

export default FirestoreStreamBuilder;
