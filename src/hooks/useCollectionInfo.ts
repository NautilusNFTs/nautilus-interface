import React, { useEffect, useState } from 'react';
import { CollectionInfo } from '../types/collection';

export function useCollectionInfo(contractId: number) {
  const [collectionInfo, setCollectionInfo] = useState<CollectionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCollectionInfo = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use new endpoint
        const response = await fetch('https://mainnet-idx.nautilus.sh/nft-indexer/v1/collections');
        const data = await response.json();

        // Find matching collection from the collections array
        const collection = data.collections.find(
          (c: any) => c.contractId === contractId
        );

        if (!collection) {
          throw new Error('Collection not found');
        }

        // Transform the data into the expected format
        const collectionData: CollectionInfo = {
          contractId: collection.contractId,
          totalSupply: collection.totalSupply,
          creator: collection.creator,
          globalState: collection.globalState.reduce((acc: any, curr: any) => {
            acc[curr.key] = curr.value;
            return acc;
          }, {}),
          mintRound: collection.mintRound,
          burnedSupply: collection.burnedSupply,
          firstToken: collection.firstToken
        };

        setCollectionInfo(collectionData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch collection info');
      } finally {
        setLoading(false);
      }
    };

    if (contractId) {
      fetchCollectionInfo();
    }
  }, [contractId]);

  return { collectionInfo, loading, error };
} 