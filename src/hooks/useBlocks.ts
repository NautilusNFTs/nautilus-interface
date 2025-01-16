import { useQuery } from '@tanstack/react-query';

interface Proposer {
  proposer: string;
  block_count: number;
  vote_count: null;
}

interface BlocksResponse {
  data: Proposer[];
  max_timestamp: string;
  block_height: number;
  blacklist: string[];
  num_proposers: number;
  num_blocks: number;
  num_blocks_ballast: number;
  blacklist_balance_total: number;
}

const fetchBlocks = async (): Promise<BlocksResponse> => {
  // Get last Wednesday and next Tuesday
  const today = new Date();
  const lastWed = new Date(today);
  lastWed.setDate(today.getDate() - ((today.getDay() + 4) % 7));
  
  const nextTue = new Date(lastWed);
  nextTue.setDate(lastWed.getDate() + 6);

  // Format dates as YYYY-MM-DD
  const start = lastWed.toISOString().split('T')[0];
  const end = nextTue.toISOString().split('T')[0];

  const response = await fetch(
    `https://api.voirewards.com/proposers/index_main_3.php?start=${start}&end=${end}`
  );
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

export function useBlocks() {
  return useQuery<BlocksResponse, Error>({
    queryKey: ['blocks'],
    queryFn: fetchBlocks,
    refetchInterval: 3600000, // Refetch every hour
    select: (data) => ({
      ...data,
      // Add computed properties if needed
      totalBlockCount: data.data.reduce((sum, proposer) => sum + proposer.block_count, 0),
      activeProposers: data.data.filter(proposer => proposer.block_count > 0).length,
      // Add new function to lookup proposer blocks
      getProposerBlocks: (address: string) => {
        const proposer = data.data.find(p => p.proposer.toLowerCase() === address.toLowerCase());
        return proposer?.block_count ?? 0;
      },
    }),
  });
}

// Export types for use in other components
export type { Proposer, BlocksResponse }; 