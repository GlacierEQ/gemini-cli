/**
 * Enhanced MCP Library - Main Entry Point
 * Military-grade Model Context Protocol with Operator integration
 */

import { MCPCore, MCPServer } from './core.js';
import { GitHubMCPServer, SlackMCPServer, AWSMCPServer, DatabaseMCPServer } from './servers.js';
import { MCPToolRegistry, FileSystemTool, WebTool, GitTool, AITool, SecurityTool } from './tools.js';
import MCPOrchestrator from './orchestrator.js';

// Main MCP class for easy initialization
class EnhancedMCP {
  constructor(config = {}) {
    this.orchestrator = new MCPOrchestrator(config);
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    console.log('🚀 ENHANCED MCP: Initializing military-grade protocols...');
    await this.orchestrator.initialize();
    this.initialized = true;
    console.log('✅ ENHANCED MCP: Ready for operations');
  }

  // Quick access methods
  async executeWorkflow(name, context) {
    if (!this.initialized) await this.initialize();
    return await this.orchestrator.executeWorkflow(name, context);
  }

  async callTool(server, tool, args) {
    if (!this.initialized) await this.initialize();
    return await this.orchestrator.mcp.callTool(server, tool, args);
  }

  async executeTool(tool, args) {
    if (!this.initialized) await this.initialize();
    return await this.orchestrator.toolRegistry.executeTool(tool, args);
  }

  async createWorkflow(name, steps) {
    if (!this.initialized) await this.initialize();
    return await this.orchestrator.createCustomWorkflow(name, steps);
  }

  async parallel(tasks) {
    if (!this.initialized) await this.initialize();
    return await this.orchestrator.parallelExecution(tasks);
  }

  async schedule(workflow, schedule, context) {
    if (!this.initialized) await this.initialize();
    return await this.orchestrator.scheduleWorkflow(workflow, schedule, context);
  }

  getStatus() {
    return {
      initialized: this.initialized,
      activeJobs: this.orchestrator?.listActiveJobs() || [],
      workflows: this.orchestrator?.listWorkflows() || [],
      uptime: process.uptime()
    };
  }
}

// Convenience functions for quick operations
export const createMCP = (config) => new EnhancedMCP(config);

export const quickGitHub = async (operation, args) => {
  const mcp = new EnhancedMCP();
  await mcp.initialize();
  return await mcp.callTool('github', operation, args);
};

export const quickSlack = async (operation, args) => {
  const mcp = new EnhancedMCP();
  await mcp.initialize();
  return await mcp.callTool('slack', operation, args);
};

export const quickAWS = async (operation, args) => {
  const mcp = new EnhancedMCP();
  await mcp.initialize();
  return await mcp.callTool('aws', operation, args);
};

export const quickWorkflow = async (name, context) => {
  const mcp = new EnhancedMCP();
  await mcp.initialize();
  return await mcp.executeWorkflow(name, context);
};

// Export all classes for advanced usage
export {
  EnhancedMCP,
  MCPCore,
  MCPServer,
  MCPOrchestrator,
  MCPToolRegistry,
  GitHubMCPServer,
  SlackMCPServer,
  AWSMCPServer,
  DatabaseMCPServer,
  FileSystemTool,
  WebTool,
  GitTool,
  AITool,
  SecurityTool
};

// Default export
export default EnhancedMCP;