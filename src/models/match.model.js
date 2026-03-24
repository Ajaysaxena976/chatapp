const SuggestionEngine = require('../engines/suggestion-engine');
const Interaction = require('../models/Interaction');
const User = require('../models/User');
const Match = require('../models/Match');

class SuggestionController {
  constructor() {
    this.suggestionEngine = new SuggestionEngine();
  }

  async getSuggestions(req, res) {
    try {
      const { userId } = req.params;
      const { limit = 10, minCompatibility = 0.3 } = req.query;

      // Get current user
      const currentUser = await User.findById(userId);
      if (!currentUser) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      // Get users already interacted with
      const interactions = await Interaction.find({ userId }).select('targetUserId');
      const excludeIds = [userId, ...interactions.map(i => i.targetUserId)];

      // Get candidates
      const candidates = await User.find({
        _id: { $nin: excludeIds },
        active: true
      }).limit(50);

      // Generate suggestions
      const suggestions = await this.suggestionEngine.getSuggestions(
        currentUser, 
        candidates, 
        { limit: parseInt(limit), minCompatibility: parseFloat(minCompatibility) }
      );

      res.json({
        success: true,
        data: {
          suggestions: suggestions.map(s => this.formatSuggestion(s, currentUser)),
          hasMore: suggestions.length === parseInt(limit),
          timestamp: new Date()
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  formatSuggestion(suggestion, currentUser) {
    return {
      id: suggestion.user._id,
      name: suggestion.user.name,
      age: this.calculateAge(suggestion.user.date_of_birth),
      photos: suggestion.user.photos || [],
      bio: suggestion.user.bio || '',
      compatibility: Math.round(suggestion.score * 100),
      reasons: suggestion.reasons,
      distance: this.calculateDistance(currentUser, suggestion.user)
    };
  }

  calculateAge(dateOfBirth) {
    return Math.floor((Date.now() - new Date(dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000));
  }

  calculateDistance(user1, user2) {
    // Simplified - in production use your haversineDistance function
    return user1.city === user2.city ? '< 5 miles' : '> 50 miles';
  }
}

module.exports = SuggestionController;