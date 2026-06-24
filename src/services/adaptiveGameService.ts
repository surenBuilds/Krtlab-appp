import { GameAdaptiveState, GameSessionResult } from '../types';

export class AdaptiveGameService {
  /**
   * Calculates the next internal level for a game based on performance
   */
  static getNextState(currentState: GameAdaptiveState | undefined, result: GameSessionResult): GameAdaptiveState {
    const initialState: GameAdaptiveState = {
      currentInternalLevel: 1,
      bestAccuracy: 0,
      averageReactionTime: 0,
      consecutiveSuccesses: 0,
      history: []
    };

    const state = currentState || initialState;
    const history = [...state.history, result].slice(-10); // Keep last 10 sessions

    // Performance metrics
    const isSuccess = result.accuracy >= 90 && result.completionTime < 60; // Example threshold
    const consecutiveSuccesses = isSuccess ? state.consecutiveSuccesses + 1 : 0;
    
    let nextLevel = state.currentInternalLevel;
    
    // Logic for leveling up: 2 consecutive successes with high accuracy
    if (consecutiveSuccesses >= 2 && nextLevel < 4) {
      nextLevel += 1;
    } else if (result.accuracy < 60 && nextLevel > 1) {
      // Logic for leveling down: very poor performance
      nextLevel -= 1;
    }

    // Reaction time improvement check
    const avgReactionTime = history.reduce((acc, h) => acc + h.reactionTime, 0) / history.length;

    return {
      currentInternalLevel: nextLevel,
      bestAccuracy: Math.max(state.bestAccuracy, result.accuracy),
      averageReactionTime: avgReactionTime,
      consecutiveSuccesses: isSuccess ? consecutiveSuccesses : 0,
      history
    };
  }

  /**
   * Returns display level label
   */
  static getLevelLabel(level: number): string {
    switch (level) {
      case 1: return 'Սկսնակ (Basic)';
      case 2: return 'Միջին (Intermediate)';
      case 3: return 'Առաջադեմ (Advanced)';
      case 4: return 'Փորձագետ (Expert)';
      default: return 'Սկսնակ';
    }
  }

  /**
   * Adjusts XP reward based on difficulty level
   */
  static calculateXPReward(baseReward: number, internalLevel: number, accuracy: number): number {
    const levelMultiplier = 1 + (internalLevel - 1) * 0.5; // +50% per level
    const performanceMultiplier = accuracy / 100;
    return Math.round(baseReward * levelMultiplier * performanceMultiplier);
  }
}
