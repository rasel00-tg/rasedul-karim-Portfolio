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

    const setupStream = async () => {
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

              setStreamState({
                data: items,
                docsMap,
                loading: false,
                error: null,
              });
            },
            (error) => {
              if (!isMounted) return;
              console.warn(`Firestore StreamBuilder listener notice for [${collectionName}]:`, error.message);
              setStreamState((prev) => ({
                ...prev,
                loading: false,
                error,
              }));
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
              setStreamState({
                data: items,
                docsMap,
                loading: false,
                error: null,
              });
            }
          } else {
            if (isMounted) {
              setStreamState({
                data: [],
                docsMap: {},
                loading: false,
                error: null,
              });
            }
          }
        }
      } catch (err) {
        if (!isMounted) return;
        console.warn(`Firestore StreamBuilder notice for [${collectionName}]:`, err);
        setStreamState((prev) => ({
          ...prev,
          loading: false,
          error: err,
        }));
      }
    };

    setupStream();

    return () => {
      isMounted = false;
      unsubscribe();
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
