#!/bin/bash

# End Worktree Script
# Wraps up work in an existing Git worktree and merges it back to main

set -e  # Exit on any error

# Get the current branch name
CURRENT_BRANCH=$(git branch --show-current)

# Extract the worktree directory name from the current working directory
WORKTREE_DIR=$(basename "$(pwd)")

# Validate that we're in a feature worktree (not main/master)
if [[ "$CURRENT_BRANCH" == "main" ]] || [[ "$CURRENT_BRANCH" == "master" ]]; then
    echo "Error: This script should be run from a feature worktree, not from main/master branch"
    exit 1
fi

echo "Current branch: $CURRENT_BRANCH"
echo "Worktree directory: $WORKTREE_DIR"

# Step 1: cd to the ../base directory where the main project branch is located
echo "Changing to base directory..."
cd ../base

# Step 2: Use Claude to merge the feature branch into main
echo "Merging $CURRENT_BRANCH branch into main using Claude..."
claude "Merge the $CURRENT_BRANCH branch into main. Do not use a fast-forward merge."

# Check if the Claude merge succeeded
if ! git merge-base --is-ancestor "$CURRENT_BRANCH" HEAD; then
    echo "Error: Claude merge did not complete successfully. Exiting."
    exit 1
fi

# Step 3: Remove the worktree directory
echo "Removing worktree directory ../$(basename "$WORKTREE_DIR")..."
git worktree remove "../$WORKTREE_DIR"

# Step 4: Delete the local feature branch
echo "Deleting local branch $CURRENT_BRANCH..."
git branch -d "$CURRENT_BRANCH"

# Step 5: Run the build command for the NodeJS implementation
echo "Building the NodeJS project..."
npm install && npm run build  # install in case of new dependencies

# Step 6: Push to remote
echo "Pushing to remote..."
git push

echo "Successfully wrapped up worktree work and merged $CURRENT_BRANCH into main!"