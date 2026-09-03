export interface AIOverviewStats {
  totalTokensUsed: number;
  monthlyTokenBudget: number;
  aiRevenueAttributedMinor: number;
  forecastAccuracyPercentage: number;
  activeAgentsCount: number;
  supportDeflectionRate: number;
  estimatedCostMinor: number;
  currency: string;
}

export interface AIModelDefinition {
  id: string;
  provider: 'anthropic' | 'openai' | 'google' | 'local';
  modelKey: string;
  displayName: string;
  taskTypes: string[];
  status: 'active' | 'standby' | 'disabled';
  contextLimitTokens: number;
  costPer1kTokensMinor: number;
}

export interface AIRecommendationConfig {
  id: string;
  placement: 'homepage' | 'pdp' | 'cart' | 'checkout' | 'search';
  strategy: 'similar_products' | 'frequently_bought_together' | 'personalized' | 'trending';
  minConfidence: number;
  inventoryFilterEnabled: boolean;
  fallbackStrategy: 'best_sellers' | 'recently_viewed' | 'popular';
  enabled: boolean;
  clickThroughRatePercentage: number;
}

export interface AIContentDraft {
  id: string;
  productTitle: string;
  productSku: string;
  field: 'description' | 'seo_title' | 'seo_description' | 'bullet_points';
  originalValue: string;
  generatedValue: string;
  model: string;
  status: 'draft' | 'approved' | 'rejected' | 'published';
  createdAt: string;
}

export interface DemandForecastRecord {
  id: string;
  productTitle: string;
  sku: string;
  category: string;
  currentStockOnHand: number;
  predictedDemand30d: number;
  predictedDemand90d: number;
  confidenceScore: number;
  reorderRecommendation: 'urgent_reorder' | 'optimal' | 'excess_stock' | 'reorder_soon';
  reorderUnits: number;
}

export interface AIAgentDefinition {
  id: string;
  name: string;
  role: 'analytics_copilot' | 'merchandising_agent' | 'inventory_planner' | 'customer_support_agent';
  description: string;
  status: 'active' | 'idle' | 'paused';
  allowedTools: string[];
  requiresApprovalForWrites: boolean;
  lastExecutionAt: string;
  totalExecutions: number;
}

export interface AIToolExecutionRecord {
  id: string;
  agentId: string;
  agentName: string;
  toolName: string;
  riskLevel: 'low_read' | 'medium_write' | 'high_mutation';
  status: 'completed' | 'pending_approval' | 'rejected' | 'failed';
  inputSummary: string;
  outputSummary: string;
  timestamp: string;
}

export interface AIStoreAssistantConfig {
  id: string;
  assistantName: string;
  tone: 'luxury_concierge' | 'friendly_helpful' | 'minimal_factual';
  welcomeMessage: string;
  knowledgeSources: string[];
  maxTokensPerReply: number;
  supportHandoffEnabled: boolean;
  status: 'active' | 'maintenance';
}

export interface AIInsightRecord {
  id: string;
  type: 'sales_opportunity' | 'inventory_risk' | 'conversion_anomaly' | 'merchandising_tip';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  summary: string;
  actionableRecommendation: string;
  confidence: number;
  createdAt: string;
}

export interface AIModerationRecord {
  id: string;
  entityType: 'review' | 'ugc_comment' | 'product_qna';
  authorName: string;
  contentSnippet: string;
  flaggedCategories: string[];
  safetyScore: number;
  decision: 'auto_approved' | 'pending_human_review' | 'rejected';
  createdAt: string;
}
