#!/bin/bash
# scripts/analyze-bundle.sh
# Bundle size analysis script for SurgicalPrep

echo "🔍 Analyzing bundle size..."

# Check if npx is available
if ! command -v npx &> /dev/null; then
    echo "❌ npx is required but not installed."
    exit 1
fi

# Export bundle for analysis
echo "📦 Exporting bundle..."
npx expo export --platform ios --output-dir dist/ios 2>/dev/null
npx expo export --platform android --output-dir dist/android 2>/dev/null

# Install bundle analyzer if not present
if ! command -v source-map-explorer &> /dev/null; then
    echo "📥 Installing source-map-explorer..."
    npm install -g source-map-explorer
fi

# Analyze iOS bundle
if [ -d "dist/ios" ]; then
    echo "📱 Analyzing iOS bundle..."
    find dist/ios -name "*.js" -exec du -h {} \; | sort -h
fi

# Analyze Android bundle
if [ -d "dist/android" ]; then
    echo "🤖 Analyzing Android bundle..."
    find dist/android -name "*.js" -exec du -h {} \; | sort -h
fi

# Check for large dependencies
echo ""
echo "📊 Checking node_modules size..."
du -sh node_modules 2>/dev/null || echo "node_modules not found"

# List largest packages
echo ""
echo "📦 Largest packages in node_modules:"
du -sh node_modules/* 2>/dev/null | sort -rh | head -20

# Check for duplicate packages
echo ""
echo "🔄 Checking for duplicate packages..."
npm ls --depth=0 2>/dev/null | grep -E "^\├|^\└" | head -30

echo ""
echo "✅ Bundle analysis complete!"
echo ""
echo "💡 Tips to reduce bundle size:"
echo "  - Use dynamic imports for rarely-used screens"
echo "  - Replace large libraries with smaller alternatives"
echo "  - Enable Hermes engine for better performance"
echo "  - Use react-native-svg-transformer for SVG icons"
echo "  - Consider using ProGuard rules for Android"
