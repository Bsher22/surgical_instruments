#!/bin/bash

# build-production.sh
# Script to build production versions of the SurgicalPrep app

set -e  # Exit on any error

echo "🏗️  SurgicalPrep Production Build Script"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo -e "${RED}❌ EAS CLI not found. Install it with: npm install -g eas-cli${NC}"
    exit 1
fi

# Check if logged in to EAS
if ! eas whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to EAS. Running eas login...${NC}"
    eas login
fi

# Function to build for a specific platform
build_platform() {
    local platform=$1
    echo ""
    echo -e "${GREEN}🔨 Building for ${platform}...${NC}"
    
    eas build --platform "$platform" --profile production --non-interactive
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ ${platform} build completed successfully${NC}"
    else
        echo -e "${RED}❌ ${platform} build failed${NC}"
        exit 1
    fi
}

# Parse command line arguments
PLATFORM=${1:-all}

case $PLATFORM in
    ios)
        build_platform ios
        ;;
    android)
        build_platform android
        ;;
    all)
        echo -e "${YELLOW}Building for both iOS and Android...${NC}"
        build_platform ios
        build_platform android
        ;;
    *)
        echo -e "${RED}Unknown platform: $PLATFORM${NC}"
        echo "Usage: $0 [ios|android|all]"
        exit 1
        ;;
esac

echo ""
echo "========================================"
echo -e "${GREEN}🎉 Build process completed!${NC}"
echo ""
echo "Next steps:"
echo "1. Check build status: eas build:list"
echo "2. Download builds: eas build:download"
echo "3. Submit to stores: ./submit-stores.sh"
