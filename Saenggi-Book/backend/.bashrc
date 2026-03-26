# This script is executed whenever a new terminal session starts.

# Check if the default HOME directory is writable. If not, switch to /workspace.
if [ ! -w "$HOME" ]; then
  export HOME=/workspace
  # Create the new home directory if it doesn't exist.
  mkdir -p "$HOME"
  # Display a one-time message to inform the user about the change.
  echo "Switched HOME to $HOME due to permission issues."
fi

# Set standard XDG environment variables based on the (potentially new) HOME.
export XDG_CACHE_HOME="$HOME/.cache"
export XDG_CONFIG_HOME="$HOME/.config"
export XDG_DATA_HOME="$HOME/.local/share"

# Create these directories to ensure they exist for applications that need them.
mkdir -p "$XDG_CACHE_HOME" "$XDG_CONFIG_HOME" "$XDG_DATA_HOME"

# Set the npm cache path, which is also used by yarn.
export npm_config_cache="$XDG_CACHE_HOME/npm"
