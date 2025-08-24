import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { observer } from 'mobx-react-lite';
import { ApiPlayer } from '../services/api';
import { getPlayerImageUrl } from '../utils';

interface TierInfo {
  position: string;
  tierNum: number;
  quantity: number;
  displayString: string;
}

const DraftScenarioPage: React.FC = observer(() => {
  const { playerStore } = useStore();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const tiersStr = searchParams.get('tier');
  
  // Parse the new tier format with quantities
  const parseTier = (tierStr: string): TierInfo => {
    // Check if there's a quantity prefix
    const quantityMatch = tierStr.match(/^(\d+)([A-Z]+\|\d+(\.\d+)?)$/);
    
    if (quantityMatch) {
      const quantity = parseInt(quantityMatch[1], 10);
      const [position, tierNum] = quantityMatch[2].split('|');
      return {
        position,
        tierNum: parseFloat(tierNum),
        quantity,
        displayString: `${position} Tier ${tierNum}`
      };
    } else {
      // Fallback to old format without quantity
      const [position, tierNum] = tierStr.split('|');
      return {
        position,
        tierNum: parseFloat(tierNum),
        quantity: 1,
        displayString: `${position} Tier ${tierNum}`
      };
    }
  };
  
  const tierInfos: TierInfo[] = tiersStr ? tiersStr.split(',').map(parseTier) : [];
  const playersByTier: { [key: string]: ApiPlayer[] } = {};
  
  if (tierInfos.length > 0) {
    for (const tierInfo of tierInfos) {
      const tierKey = `${tierInfo.quantity}${tierInfo.position}|${tierInfo.tierNum}`;
      playersByTier[tierKey] = playerStore
        .getPlayersByPositionTier(tierInfo.position, tierInfo.tierNum)
        .filter(p => !p.teamId)
        .sort((a, b) => (a.projRanking || 0) - (b.projRanking || 0));
    }
  }
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Draft Scenario</h1>
      {tierInfos.length > 0 ? (
        <div className="space-y-8">
          {tierInfos.map((tierInfo, index) => {
            const tierKey = `${tierInfo.quantity}${tierInfo.position}|${tierInfo.tierNum}`;
            return (
              <div key={tierKey}>
                <h2 className="text-2xl font-semibold mb-4 bg-gray-100 p-2 rounded">
                  {tierInfo.displayString}
                  {tierInfo.quantity > 1 && (
                    <span className="ml-2 text-blue-600 font-bold">×{tierInfo.quantity}</span>
                  )}
                </h2>
                {playersByTier[tierKey] && playersByTier[tierKey].length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {playersByTier[tierKey].map(player => (
                      <div key={player.id} className="border rounded-lg p-4 shadow-sm flex items-center">
                        <img src={getPlayerImageUrl(player.cbssportsId)} alt={player.name} className="w-12 h-12 rounded-full mr-4" />
                        <div>
                          <Link to={`/player/${player.id}`} className="text-lg font-bold text-blue-600 hover:underline">{player.name}</Link>
                          <p className="text-sm text-gray-600">{player.nflTeam} - {player.position}</p>
                          <p className="text-sm text-gray-600">{(player.projectedFantasyPoints / 17).toFixed(1)} proj ppg</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No available players in this tier.</p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p>No tiers specified.</p>
      )}
    </div>
  );
});

export default DraftScenarioPage;
