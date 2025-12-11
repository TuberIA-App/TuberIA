/**
 * AI Model configuration for summarization fallback chain
 *
 * Models are tried in order until one succeeds:
 * 1. z-ai/glm-4.5 - Fast, reliable for most content
 * 2. amazon/nova-2-lite-v1:free - 1M context, free tier
 * 3. amazon/nova-2-lite-v1 - 1M context, paid (more reliable)
 * 4. x-ai/grok-4-fast - 2M context, expensive but powerful
 */

export const SUMMARIZATION_MODELS = [
  'z-ai/glm-4.5',
  'amazon/nova-2-lite-v1:free',
  'amazon/nova-2-lite-v1',
  'x-ai/grok-4-fast'
];

/**
 * Get model at specific index (with fallback to first model)
 * @param {number} index - Model index
 * @returns {string} Model identifier
 */
export const getModelAtIndex = (index) => {
  return SUMMARIZATION_MODELS[index] || SUMMARIZATION_MODELS[0];
};

/**
 * Get total number of models in fallback chain
 * @returns {number} Total models
 */
export const getTotalModels = () => {
  return SUMMARIZATION_MODELS.length;
};
