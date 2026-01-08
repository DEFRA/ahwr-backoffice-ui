#!/bin/bash

# Set the URL for the latest list of compromised packages
COMPROMISED_LIST_URL="https://raw.githubusercontent.com/Cobenian/shai-hulud-detect/main/compromised-packages.txt"

# Inform the user that the list is being downloaded
echo "Downloading latest compromised packages list..."

# Download the compromised packages list to a local file
curl -s "$COMPROMISED_LIST_URL" -o compromised-packages.txt

# Check if the download was successful (file exists and is not empty)
if [ ! -s compromised-packages.txt ]; then
  echo "Failed to download compromised packages list. Exiting."
  exit 1
fi

# Print a message before starting the scan
echo "
Scanning for compromised packages in lock files...
"

# Find all package-lock.json and yarn.lock files in the current directory and subdirectories
find . -type f \( -name "package-lock.json" -o -name "yarn.lock" \) | while read -r lockfile; do
  # Print which lockfile is being checked
  echo "Checking $lockfile"
  # Read each line from the compromised packages list
  while read -r line; do
    # Skip lines that are comments (start with #) or empty
    [[ "$line" =~ ^#.*$ || -z "$line" ]] && continue
    # Extract the package name (before the colon)
    pkg=$(echo "$line" | cut -d':' -f1)
    # Extract the package version (after the colon)
    ver=$(echo "$line" | cut -d':' -f2)
    # Search for the package and version in the lockfile
    if grep -q "$pkg.*$ver" "$lockfile"; then
      # If found, print a warning message
      echo "  [FOUND] $pkg@$ver in $lockfile"
    fi
  done < compromised-packages.txt
done

# Print a message when the scan is complete
echo "
Scan complete."