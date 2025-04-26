#!/bin/bash

# Where your raw .tsx files live
SRC_DIR="tsx_sources"

# Your GitHub Pages project folder
DEST_DIR="projects"

# Create folders if missing
mkdir -p "$DEST_DIR"
mkdir -p "$SRC_DIR"

# Loop through each TSX file
for file in "$SRC_DIR"/*.tsx; do
    [ -e "$file" ] || continue
    filename=$(basename -- "$file")
    projectname="${filename%.*}"
    
    echo "Building project: $projectname"

    # Make a temp folder
    rm -rf temp_build
    npm create vite@latest temp_build -- --template react-ts --no-git --no-install
    cd temp_build

    # Install
    npm install

    # Replace App.tsx
    cp "../$SRC_DIR/$filename" src/App.tsx

    # Build
    npm run build

    # Move it to your site folder
    cd ..
    rm -rf "$DEST_DIR/$projectname"
    mv temp_build/dist "$DEST_DIR/$projectname"

    # Clean up temp folder
    rm -rf temp_build

    # Add a gallery card automatically (optional)
    echo "<div class=\"gallery-item\" onclick=\"window.location.href='projects/$projectname/index.html'\">" >> temp_gallery_snippets.html
    echo "  <img src=\"thumbnails/$projectname.png\" alt=\"$projectname Thumbnail\">" >> temp_gallery_snippets.html
    echo "  <p>$projectname</p>" >> temp_gallery_snippets.html
    echo "</div>" >> temp_gallery_snippets.html
done

echo "✅ All projects built. Insert the HTML snippets from temp_gallery_snippets.html into your homepage!"
