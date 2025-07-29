/**
 * MCP Orchestrator - Advanced coordination and workflow management
 * Integrates with Operator Core for maximum efficiency
 */

import { MCPCore } from './core.js';
import { GitHubMCPServer, SlackMCPServer, AWSMCPServer } from './servers.js';
import { MCPToolRegistry } from './tools.js';
import { EventEmitter } from 'events';

class MCPOrchestrator extends EventEmitter {
  constructor(config = {}) {
    super();
    this.mcp = new MCPCore(config);
    this.toolRegistry = new MCPToolRegistry();
    this.workflows = new Map();
    this.activeJobs = new Map();
    this.config = config;
  }

  async initialize() {
    console.log('🔧 MCP ORCHESTRATOR: Initializing enhanced protocol...');
    
    // Register default servers
    await this.registerDefaultServers();
    
    // Load workflows
    await this.loadWorkflows();
    
    console.log('✅ MCP ORCHESTRATOR: Ready for operations');
  }

  async registerDefaultServers() {
    const servers = [
      {
        name: 'github',
        class: GitHubMCPServer,
        config: { apiKey: process.env.GITHUB_TOKEN }
      },
      {
        name: 'slack',
        class: SlackMCPServer,
        config: { token: process.env.SLACK_TOKEN }
      },
      {
        name: 'aws',
        class: AWSMCPServer,
        config: {
          accessKey: process.env.AWS_ACCESS_KEY,
          secretKey: process.env.AWS_SECRET_KEY,
          region: process.env.AWS_REGION
        }
      }
    ];

    for (const server of servers) {
      if (server.config.apiKey || server.config.token || server.config.accessKey) {
        const instance = new server.class(server.config);
        await this.mcp.registerServer(server.name, instance);
        console.log(`📡 Registered ${server.name} server`);
      }
    }
  }

  async loadWorkflows() {
    const defaultWorkflows = [
      {
        name: 'code_review',
        steps: [
          { tool: 'git', operation: 'status' },
          { tool: 'ai', operation: 'analyze' },
          { server: 'github', tool: 'create_pr' }
        ]
      },
      {
        name: 'deploy_pipeline',
        steps: [
          { tool: 'git', operation: 'pull' },
          { tool: 'filesystem', operation: 'analyze' },
          { server: 'aws', tool: 's3_upload' },
          { server: 'slack', tool: 'send_message' }
        ]
      },
      {
        name: 'security_audit',
        steps: [
          { tool: 'security', operation: 'scan' },
          { tool: 'security', operation: 'audit' },
          { tool: 'filesystem', operation: 'write' },
          { server: 'slack', tool: 'send_message' }
        ]
      }
    ];

    defaultWorkflows.forEach(workflow => {
      this.workflows.set(workflow.name, workflow);
    });
  }

  async executeWorkflow(workflowName, context = {}) {
    const workflow = this.workflows.get(workflowName);
    if (!workflow) throw new Error(`Workflow ${workflowName} not found`);

    const jobId = `job_${Date.now()}`;
    const job = {
      id: jobId,
      workflow: workflowName,
      status: 'running',
      steps: workflow.steps.length,
      completed: 0,
      results: [],
      startTime: new Date()
    };

    this.activeJobs.set(jobId, job);
    this.emit('jobStarted', job);

    try {
      for (let i = 0; i < workflow.steps.length; i++) {
        const step = workflow.steps[i];
        const result = await this.executeStep(step, context);
        
        job.results.push(result);
        job.completed = i + 1;
        
        this.emit('stepCompleted', { job, step: i, result });
      }

      job.status = 'completed';
      job.endTime = new Date();
      job.duration = job.endTime - job.startTime;

      this.emit('jobCompleted', job);
      return job;

    } catch (error) {
      job.status = 'failed';
      job.error = error.message;
      job.endTime = new Date();

      this.emit('jobFailed', { job, error });
      throw error;
    }
  }

  async executeStep(step, context) {
    if (step.server) {
      // Execute server tool
      return await this.mcp.callTool(step.server, step.tool, {
        ...step.args,
        ...context
      });
    } else {
      // Execute local tool
      return await this.toolRegistry.executeTool(step.tool, {
        operation: step.operation,
        ...step.args,
        ...context
      });
    }
  }

  async createCustomWorkflow(name, steps) {
    const workflow = { name, steps };
    this.workflows.set(name, workflow);
    return workflow;
  }

  async parallelExecution(tasks) {
    const results = await Promise.allSettled(
      tasks.map(task => this.executeTask(task))
    );

    return results.map((result, index) => ({
      task: tasks[index],
      status: result.status,
      value: result.value,
      reason: result.reason
    }));
  }

  async executeTask(task) {
    if (task.workflow) {
      return await this.executeWorkflow(task.workflow, task.context);
    } else if (task.server) {
      return await this.mcp.callTool(task.server, task.tool, task.args);
    } else {
      return await this.toolRegistry.executeTool(task.tool, task.args);
    }
  }

  async scheduleWorkflow(workflowName, schedule, context = {}) {
    // Simple scheduling implementation
    const interval = this.parseSchedule(schedule);
    
    const scheduledJob = setInterval(async () => {
      try {
        await this.executeWorkflow(workflowName, context);
      } catch (error) {
        console.error(`Scheduled workflow ${workflowName} failed:`, error);
      }
    }, interval);

    return scheduledJob;
  }

  parseSchedule(schedule) {
    // Parse schedule string (e.g., "5m", "1h", "1d")
    const unit = schedule.slice(-1);
    const value = parseInt(schedule.slice(0, -1));

    const multipliers = {
      's': 1000,
      'm': 60 * 1000,
      'h': 60 * 60 * 1000,
      'd': 24 * 60 * 60 * 1000
    };

    return value * (multipliers[unit] || 1000);
  }

  getJobStatus(jobId) {
    return this.activeJobs.get(jobId);
  }

  listActiveJobs() {
    return Array.from(this.activeJobs.values());
  }

  listWorkflows() {
    return Array.from(this.workflows.keys());
  }

  async generateReport() {
    const jobs = this.listActiveJobs();
    const completedJobs = jobs.filter(j => j.status === 'completed');
    const failedJobs = jobs.filter(j => j.status === 'failed');

    return {
      timestamp: new Date().toISOString(),
      orchestrator: 'MCP_ORCHESTRATOR',
      statistics: {
        total_jobs: jobs.length,
        completed: completedJobs.length,
        failed: failedJobs.length,
        success_rate: jobs.length > 0 ? (completedJobs.length / jobs.length) * 100 : 0
      },
      workflows: this.listWorkflows(),
      servers: Array.from(this.mcp.servers.keys()),
      tools: this.toolRegistry.listTools()
    };
  }
}

export default MCPOrchestrator;