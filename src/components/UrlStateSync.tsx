'use client';

import { useEffect, useRef } from 'react';

import { useStore } from '@/store/useStore';

export function UrlStateSync() {
  const serialize = useStore((state) => state.serialize);
  const deserialize = useStore((state) => state.deserialize);
  const policy = useStore((state) => state.policy);
  const schemaName = useStore((state) => state.schema.name);
  const rowData = useStore((state) => state.rowData);
  const userContext = useStore((state) => state.userContext);
  const hydratedRef = useRef(false);

  useEffect(() => {
    const loadFromHash = () => {
      const hash = window.location.hash.replace(/^#/, '');
      if (hash) {
        deserialize(hash);
      }
      hydratedRef.current = true;
    };

    loadFromHash();

    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#/, '');
      if (hash) {
        deserialize(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [deserialize]);

  useEffect(() => {
    if (!hydratedRef.current) return;

    const encoded = serialize();
    const nextHash = `#${encoded}`;
    if (window.location.hash !== nextHash) {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${nextHash}`);
    }
  }, [serialize, policy, schemaName, rowData, userContext]);

  return null;
}