#!/bin/bash

# 🚀 Claude Code Interactive Launcher
# Advanced launcher with checkbox options for yolo mode, deep thinking, model selection

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Default settings
YOLO_MODE=true
DEEP_THINKING=true
MODEL="claude-opus-4-1-20250805"
VERBOSE=false
MCP_DEBUG=false
ALLOW_ALL_TOOLS=true

# Clear screen for clean interface
clear

echo -e "${CYAN}${BOLD}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   🚀 CLAUDE CODE LAUNCHER                               "
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${NC}"

# Function to toggle checkbox
toggle_checkbox() {
    if [ "$1" = true ]; then
        echo "false"
    else
        echo "true"
    fi
}

# Function to display checkbox
show_checkbox() {
    if [ "$1" = true ]; then
        echo "[✅]"
    else
        echo "[ ]"
    fi
}

# Interactive menu loop
while true; do
    echo -e "\n${BOLD}⚙️  Launch Options:${NC}\n"
    echo -e "  1) $(show_checkbox $YOLO_MODE) ${YELLOW}🎯 YOLO Mode${NC} (--dangerously-skip-permissions)"
    echo -e "  2) $(show_checkbox $DEEP_THINKING) ${MAGENTA}🧠 Deep Thinking${NC} (plan mode - extended reasoning)"
    echo -e "  3) $(show_checkbox $VERBOSE) ${BLUE}📊 Verbose Output${NC}"
    echo -e "  4) $(show_checkbox $MCP_DEBUG) ${CYAN}🐛 MCP Debug${NC}"
    echo -e "  5) $(show_checkbox $ALLOW_ALL_TOOLS) ${GREEN}🔧 Allow All Tools${NC}"
    
    echo -e "\n${BOLD}🤖 Model Selection:${NC}\n"
    if [ "$MODEL" = "claude-opus-4-1-20250805" ]; then
        echo -e "  6) ${GREEN}● Opus 4.1 (Current)${NC}"
    else
        echo -e "  6) ○ Opus 4.1"
    fi
    if [ "$MODEL" = "claude-3-5-sonnet-20241022" ]; then
        echo -e "  7) ${GREEN}● Sonnet 3.5${NC}"
    else
        echo -e "  7) ○ Sonnet 3.5"
    fi
    if [ "$MODEL" = "claude-3-5-haiku-20241022" ]; then
        echo -e "  8) ${GREEN}● Haiku 3.5${NC}"
    else
        echo -e "  8) ○ Haiku 3.5"
    fi
    
    echo -e "\n${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "  ${GREEN}${BOLD}Enter)${NC} 🚀 ${GREEN}Launch Claude Code${NC}"
    echo -e "  ${YELLOW}${BOLD}Q)${NC} ❌ ${YELLOW}Quit${NC}"
    echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
    
    read -p "Select option (1-8, Enter to launch, Q to quit): " choice
    
    # Handle empty input (just Enter) as launch
    if [ -z "$choice" ]; then
        break
    fi
    
    case ${choice,,} in
        1)
            YOLO_MODE=$(toggle_checkbox $YOLO_MODE)
            clear
            echo -e "${YELLOW}🎯 YOLO Mode: $(show_checkbox $YOLO_MODE)${NC}"
            ;;
        2)
            DEEP_THINKING=$(toggle_checkbox $DEEP_THINKING)
            clear
            echo -e "${MAGENTA}🧠 Deep Thinking: $(show_checkbox $DEEP_THINKING)${NC}"
            ;;
        3)
            VERBOSE=$(toggle_checkbox $VERBOSE)
            clear
            echo -e "${BLUE}📊 Verbose: $(show_checkbox $VERBOSE)${NC}"
            ;;
        4)
            MCP_DEBUG=$(toggle_checkbox $MCP_DEBUG)
            clear
            echo -e "${CYAN}🐛 MCP Debug: $(show_checkbox $MCP_DEBUG)${NC}"
            ;;
        5)
            ALLOW_ALL_TOOLS=$(toggle_checkbox $ALLOW_ALL_TOOLS)
            clear
            echo -e "${GREEN}🔧 Allow All Tools: $(show_checkbox $ALLOW_ALL_TOOLS)${NC}"
            ;;
        6)
            MODEL="claude-opus-4-1-20250805"
            clear
            echo -e "${GREEN}✅ Selected: Opus 4.1${NC}"
            ;;
        7)
            MODEL="claude-3-5-sonnet-20241022"
            clear
            echo -e "${GREEN}✅ Selected: Sonnet 3.5${NC}"
            ;;
        8)
            MODEL="claude-3-5-haiku-20241022"
            clear
            echo -e "${GREEN}✅ Selected: Haiku 3.5${NC}"
            ;;
        l|launch)
            break
            ;;
        q|quit)
            echo -e "\n${YELLOW}👋 Goodbye!${NC}\n"
            exit 0
            ;;
        *)
            clear
            echo -e "${RED}❌ Invalid option. Please try again.${NC}"
            ;;
    esac
done

# Build the Claude command
clear
echo -e "${GREEN}${BOLD}🚀 Launching Claude Code...${NC}\n"

# Base command (use $HOME for proper expansion)
CMD="$HOME/.claude/local/claude --model \"$MODEL\""

# Add optional flags
if [ "$YOLO_MODE" = true ]; then
    CMD="$CMD --dangerously-skip-permissions"
    echo -e "  ${YELLOW}✅ YOLO Mode enabled${NC}"
fi

if [ "$DEEP_THINKING" = true ]; then
    CMD="$CMD --permission-mode plan"
    echo -e "  ${MAGENTA}✅ Deep Thinking enabled (plan mode)${NC}"
fi

if [ "$VERBOSE" = true ]; then
    CMD="$CMD --verbose"
    echo -e "  ${BLUE}✅ Verbose output enabled${NC}"
fi

if [ "$MCP_DEBUG" = true ]; then
    CMD="$CMD --mcp-debug"
    echo -e "  ${CYAN}✅ MCP Debug enabled${NC}"
fi

if [ "$ALLOW_ALL_TOOLS" = true ]; then
    CMD="$CMD --allowedTools all"
    echo -e "  ${GREEN}✅ All tools allowed${NC}"
fi

# Add startup instruction for Claude
STARTUP_INSTRUCTION='
IMPORTANT: Execute these startup tasks immediately:

1. 📁 Create a new AI chat session file in ai-chats/YYYY-MM-DD-XX-description.md
2. 🎯 Then display this interactive menu:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 CLAUDE CODE STARTUP MENU
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 📊 Task Master - Check active tasks & roadmap
2. 💬 Recent Sessions - Review ai-chats history
3. 🔧 Project Status - Show git status & recent commits
4. 🎯 Continue Work - Resume from previous session
5. 🆕 New Feature - Start fresh feature branch
6. 🧪 Run Tests - Execute test suite
7. 📚 Show Docs - Display project documentation
8. ⚡ Quick Start - Jump straight to coding

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Please select an option (1-8) or describe what you would like to do:
'

echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}📋 Model: ${GREEN}$MODEL${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Execute Claude with the startup instruction
eval "$CMD \"CLAUDE.md\" \"$STARTUP_INSTRUCTION\" \"$@\""