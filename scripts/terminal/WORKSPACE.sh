#!/bin/bash
# 🛸 APEX PARALLEL WORKSPACE v1.0
# Maximizes tmux for multi-armed Piston & Mastermind operations.

SESSION="APEX_POWERHOUSE"

# Check if session exists
tmux has-session -t $SESSION 2>/dev/null

if [ $? != 0 ]; then
  # Create new session, split into 4 quadrants
  tmux new-session -d -s $SESSION -n "GRID"
  
  # Pane 1 (Top-Left): Piston Heartbeat
  tmux send-keys -t $SESSION "tail -f ~/powerhouse/logs/piston.log" C-m
  
  # Pane 2 (Top-Right): Void Core Harmonics
  tmux split-window -h -t $SESSION
  tmux send-keys -t $SESSION "export PYTHONPATH=\$PYTHONPATH:~/apex/mastermind; python3 ~/powerhouse/logic/void_core.py" C-m
  
  # Pane 3 (Bottom-Left): M2A Terminal
  tmux split-window -v -t $SESSION:GRID.1
  tmux send-keys -t $SESSION "cd ~/powerhouse/pistons" C-m
  
  # Pane 4 (Bottom-Right): Mastermind Repo
  tmux split-window -v -t $SESSION:GRID.2
  tmux send-keys -t $SESSION "cd ~/apex/mastermind && ls -la" C-m
  
  # Final layout
  tmux select-pane -t $SESSION:GRID.1
fi

# Attach
tmux attach-session -t $SESSION
