/**
 * Handler for /plan command
 */

const { handleAnalyze } = require('./analyzeHandler');

/**
 * Get predefined plan templates from Chroma
 * @param {string} goal - The goal for the plan
 * @param {Object} chromaDB - ChromaDB adapter
 * @returns {Promise<Array>} Matching templates
 */
async function getPlanTemplates(goal, chromaDB) {
  try {
    // Query Chroma for templates that match the goal
    const results = await chromaDB.queryBySimilarity(`plan template for ${goal}`, 3);
    
    return results.map(result => ({
      id: result.id,
      template: result.content,
      metadata: result.metadata
    }));
  } catch (error) {
    console.warn('Error getting plan templates:', error);
    return [];
  }
}

/**
 * Generate a customized plan based on template and analysis
 * @param {string} template - The plan template
 * @param {Object} analysis - The target analysis
 * @param {string} goal - The goal for the plan
 * @returns {Object} Customized plan
 */
function generateCustomizedPlan(template, analysis, goal) {
  // This is a simplified implementation
  // In a real system, this would involve template rendering and more
  // sophisticated customization based on the analysis
  
  // Simple placeholder replacement
  let customized = template
    .replace(/\{goal\}/g, goal)
    .replace(/\{target_type\}/g, analysis.type || 'unknown');
    
  // Generate steps based on analysis and goal
  const steps = [];
  
  if (analysis.recommendations) {
    // Convert recommendations to plan steps
    analysis.recommendations.forEach((rec, index) => {
      steps.push({
        number: index + 1,
        description: `Address ${rec.type}: ${rec.message}`,
        priority: rec.priority || 'medium',
        validation: `Check that ${rec.type} issues have been addressed`
      });
    });
  } else {
    // Generic steps if no specific recommendations
    steps.push({
      number: 1,
      description: `Review ${goal} requirements`,
      priority: 'high',
      validation: 'Requirements are clear and documented'
    });
    
    steps.push({
      number: 2,
      description: `Implement ${goal} strategy`,
      priority: 'high',
      validation: 'Strategy is implemented according to requirements'
    });
    
    steps.push({
      number: 3,
      description: 'Test and validate implementation',
      priority: 'medium',
      validation: 'Implementation passes all tests'
    });
  }
  
  return {
    title: `Plan for ${goal}`,
    description: customized,
    steps,
    totalSteps: steps.length
  };
}

/**
 * Enhance plan with context from the Knowledge Graph
 * @param {Object} plan - The generated plan
 * @param {Object} knowledgeGraph - Knowledge Graph adapter
 * @param {string} goal - The goal for the plan
 * @returns {Promise<Object>} Enhanced plan
 */
async function enhancePlanWithContext(plan, knowledgeGraph, goal) {
  try {
    // Query Knowledge Graph for entities related to the goal
    const entities = await knowledgeGraph.queryEntitiesByType(goal);
    
    if (entities && entities.length > 0) {
      // Add related insights to the plan
      plan.relatedInsights = entities.map(entity => ({
        id: entity.id,
        type: entity.type,
        relevance: 'Related knowledge from previous plans'
      }));
    }
    
    return plan;
  } catch (error) {
    console.warn('Error enhancing plan with context:', error);
    return plan;
  }
}

/**
 * Format plan for presentation
 * @param {Object} plan - The plan to format
 * @returns {Object} Formatted plan
 */
function formatPlan(plan) {
  // Format steps with more details
  const formattedSteps = plan.steps.map(step => ({
    ...step,
    statusLabel: 'Pending',
    statusColor: step.priority === 'high' ? 'red' : (step.priority === 'medium' ? 'orange' : 'blue')
  }));
  
  return {
    ...plan,
    steps: formattedSteps,
    createdAt: new Date().toISOString(),
    formattedTitle: `📋 ${plan.title}`
  };
}

/**
 * Handle the /plan command
 * @param {Object} command - The parsed command object
 * @param {Object} storage - Storage adapters
 * @returns {Promise<Object>} Result of the operation
 */
async function handlePlan(command, { chromaDB, knowledgeGraph }) {
  const { goal, target } = command;
  
  try {
    // First, analyze the target if it hasn't been analyzed already
    let analysis;
    try {
      const analyzeCommand = {
        type: 'analyze',
        target,
        goal
      };
      
      const analyzeResult = await handleAnalyze(analyzeCommand);
      if (analyzeResult.success) {
        analysis = analyzeResult.analysis;
      } else {
        return {
          success: false,
          error: `Could not analyze target: ${analyzeResult.error}`
        };
      }
    } catch (error) {
      console.error('Error analyzing target:', error);
      return {
        success: false,
        error: `Error analyzing target: ${error.message}`
      };
    }
    
    // Get plan templates from Chroma
    const templates = await getPlanTemplates(goal, chromaDB);
    
    // Use default template if none found
    const template = templates.length > 0 
      ? templates[0].template 
      : `Default plan template for {goal} targeting {target_type}`;
    
    // Generate customized plan
    let plan = generateCustomizedPlan(template, analysis, goal);
    
    // Enhance plan with context from Knowledge Graph
    plan = await enhancePlanWithContext(plan, knowledgeGraph, goal);
    
    // Format plan for presentation
    const formattedPlan = formatPlan(plan);
    
    return {
      success: true,
      goal,
      target,
      plan: formattedPlan
    };
  } catch (error) {
    console.error('Error creating plan:', error);
    return {
      success: false,
      error: `Error creating plan: ${error.message}`
    };
  }
}

module.exports = handlePlan;
