updatecc() {
    claude -v
    echo "Updating Claude Code CLI..."
    sudo npm install -g @anthropic-ai/claude-code@latest
    echo "Update complete."
}

# Claude Code interactive launcher
claudia() {
    sudo npm install -g @anthropic-ai/claude-code@latest
    /home/darren/bin/claude-launcher "$@"
}
#
# Quick Claude launcher alias
cc() {
    claudia "$@"
}