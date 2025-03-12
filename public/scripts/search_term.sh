#!/bin/bash

# Ensure correct usage
if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <directory> <search_term>"
    exit 1
fi

DIRECTORY=$1
SEARCH_TERM=$2

# Check if the directory exists
if [ ! -d "$DIRECTORY" ]; then
    echo "❌ Directory '$DIRECTORY' does not exist!"
    exit 1
fi

echo "🔍 Searching in '$DIRECTORY' for files with '$SEARCH_TERM' in the name or content..."

# Find files with the search term in their name
echo "📂 Files with '$SEARCH_TERM' in their name:"
find "$DIRECTORY" -type f -iname "*$SEARCH_TERM*" 2>/dev/null

# Find files containing the search term in their content
echo -e "\n📄 Files containing '$SEARCH_TERM' in their content:"
grep -rl --exclude-dir=".git" "$SEARCH_TERM" "$DIRECTORY" 2>/dev/null

echo -e "\n✅ Search complete."
