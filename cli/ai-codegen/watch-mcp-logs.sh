#!/bin/bash

# MCP Debug Log Watcher
# Usage: ./watch-mcp-logs.sh

LOG_FILE="/tmp/mcp-debug.log"

echo "🔍 Watching MCP Debug Logs..."
echo "📁 Log file: $LOG_FILE"
echo ""
echo "Press Ctrl+C to stop"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Create log file if it doesn't exist
touch "$LOG_FILE"

# Watch the log file with colors
tail -f "$LOG_FILE" | while read line; do
  # Color code different log types
  if [[ $line == *"Tool call:"* ]]; then
    echo -e "\033[1;36m$line\033[0m"  # Cyan for tool calls
  elif [[ $line == *"✓ Tool completed"* ]]; then
    echo -e "\033[1;32m$line\033[0m"  # Green for success
  elif [[ $line == *"ERROR"* ]] || [[ $line == *"✗"* ]]; then
    echo -e "\033[1;31m$line\033[0m"  # Red for errors
  elif [[ $line == *"Arguments:"* ]]; then
    echo -e "\033[0;33m$line\033[0m"  # Yellow for arguments
  elif [[ $line == *"==="* ]]; then
    echo -e "\033[1;35m$line\033[0m"  # Magenta for separators
  else
    echo "$line"
  fi
done
