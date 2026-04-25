#!/bin/bash
# 🌉 CROSTINI-TO-TERMUX BRIDGE
# Use this script from within the Crostini (Linux) terminal to execute commands in Termux.
# Requires: ADB installed in Crostini and ADB Wireless debugging enabled on Android.

COMMAND=$1

if [ -z "$COMMAND" ]; then
    echo "Usage: bridge.sh 'command_to_run_in_termux'"
    exit 1
fi

echo "🛰️  Relaying command to Termux: $COMMAND"

# Execute via ADB am broadcast or shell
# This assumes the Termux:API and am broadcast pattern you previously established
adb shell "/data/data/com.termux/files/usr/bin/bash -c '$COMMAND'"
