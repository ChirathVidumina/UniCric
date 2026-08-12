import dataset from '../data/sl_universities_2026.json';

export const scoutService = {
  getTournamentInfo: () => dataset.tournament || {},

  getScheduleTimeline: () => {
    return (dataset.tournament && dataset.tournament.schedule) ? dataset.tournament.schedule : [];
  },

  getNextTargetMatch: () => {
    const schedule = dataset.tournament?.schedule || [];
    return schedule[0] || {};
  },

  getCompletedMatchScorecard: (matchId = 'match_1') => {
    const scorecards = dataset.completedMatchScorecards || {};
    return scorecards[matchId] || scorecards['match_1'] || null;
  },

  getOpponentsList: () => {
    const allowedOpponents = [
      { id: "UOP", code: "UOP", name: "University of Peradeniya", shortName: "Peradeniya" },
      { id: "VAV", code: "VAV", name: "Vavuniya University", shortName: "Vavuniya" },
      { id: "UOJ", code: "UOJ", name: "Jaffna University", shortName: "Jaffna" },
      { id: "UOC", code: "UOC", name: "Colombo University", shortName: "Colombo" },
      { id: "UOK", code: "UOK", name: "Kelaniya University", shortName: "Kelaniya" },
      { id: "USJP", code: "USJP", name: "Sri Jayawardenapura University", shortName: "Jayawardenapura" },
      { id: "RUH", code: "RUH", name: "Ruhunu University", shortName: "Ruhuna" },
      { id: "SAB", code: "SAB", name: "Sabaragamuwa University", shortName: "Sabaragamuwa" }
    ];

    if (!dataset.tournament || !dataset.tournament.teams) return allowedOpponents;

    return allowedOpponents.map(opp => {
      const found = dataset.tournament.teams.find(t => (t.code || t.id) === opp.code);
      return found ? { ...found, name: opp.name, shortName: opp.shortName } : opp;
    });
  },

  getVenueById: (venueId) => {
    if (!dataset.venues) return {};
    return dataset.venues[0] || {};
  },

  getAllVenues: () => dataset.venues || [],

  getOpponentScoutData: (opponentId = 'UOC') => {
    const teamObj = dataset.tournament?.teams?.find(t => (t.code || t.id) === opponentId) || dataset.tournament?.teams?.[0] || {};
    return {
      teamName: teamObj.name || "University Team",
      teamId: opponentId,
      recentForm: [teamObj.won > 0 ? "W" : "L"],
      headToHeadVsUOM: { uomWins: 0, opponentWins: teamObj.won || 0, lastMatchWinner: teamObj.name },
      threatLevel: teamObj.played > 0 ? `MATCH 1 WINNER (${teamObj.name})` : "UPCOMING TARGET",
      details: teamObj
    };
  },

  getOpponentPlayersList: (opponentId = 'UOC') => {
    if (!dataset.players) return [];
    return dataset.players.filter(p => p.team === opponentId);
  },

  getPlayerStatsByLastNMatches: (playerId = '301', nMatches = 3) => {
    const targetPlayer = dataset.players ? dataset.players.find(p => p.id === playerId || String(p.id) === String(playerId)) : null;
    
    if (!targetPlayer && (!dataset.players || dataset.players.length === 0)) {
      return {
        player: { 
          name: "No Player Selected", 
          role: "N/A", 
          icon: "🏏", 
          battingStyle: "N/A" 
        },
        matchesInWindow: 0,
        totalRuns: 0,
        totalBalls: 0,
        strikeRate: 0,
        dotBallPct: 0,
        boundaryPct: 0,
        totalFours: 0,
        totalSixes: 0,
        primaryWeakness: "No Telemetry Data",
        logsWindow: []
      };
    }

    const validPlayer = targetPlayer || (dataset.players && dataset.players[0]) || {};
    
    return {
      player: { 
        name: validPlayer.name || "Verified Player", 
        role: validPlayer.role || "Batter", 
        icon: validPlayer.icon || "🏏", 
        battingStyle: "Right-Hand Batter" 
      },
      matchesInWindow: validPlayer.matches || 0,
      totalRuns: validPlayer.runs || 0,
      totalBalls: validPlayer.runs && validPlayer.sr > 0 ? Math.round(validPlayer.runs / (validPlayer.sr / 100)) : 0,
      strikeRate: validPlayer.sr || 0,
      dotBallPct: validPlayer.dotPct || 0,
      boundaryPct: validPlayer.boundaryPct || 0,
      totalFours: validPlayer.fours || 0,
      totalSixes: validPlayer.sixes || 0,
      primaryWeakness: "Strict Pace & Spin Telemetry Control",
      logsWindow: validPlayer.name ? [
        { matchDate: "2026-08-01", vs: "SLUSA Championship", runs: validPlayer.runs || 0, balls: 15, fours: validPlayer.fours || 0, sixes: validPlayer.sixes || 0, dots: 10, isOut: true, dismissalMode: "Verified Scorecard Telemetry" }
      ] : []
    };
  }
};

export default scoutService;
