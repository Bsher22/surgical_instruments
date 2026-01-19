#!/bin/bash

# submit-stores.sh
# Script to submit builds to Apple App Store and Google Play Store

set -e  # Exit on any error

echo "📱 SurgicalPrep Store Submission Script"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo -e "${RED}❌ EAS CLI not found. Install it with: npm install -g eas-cli${NC}"
    exit 1
fi

# Function to submit to iOS
submit_ios() {
    echo ""
    echo -e "${BLUE}🍎 Submitting to Apple App Store...${NC}"
    echo ""
    
    # Check for required credentials
    echo -e "${YELLOW}Ensure you have set up:${NC}"
    echo "  - Apple ID in eas.json"
    echo "  - App Store Connect API Key (recommended) or Apple ID password"
    echo ""
    
    read -p "Continue with iOS submission? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        eas submit --platform ios --profile production
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ iOS submission completed${NC}"
            echo ""
            echo -e "${YELLOW}Next steps:${NC}"
            echo "1. Go to App Store Connect: https://appstoreconnect.apple.com"
            echo "2. Select your app and the new build"
            echo "3. Fill in version information"
            echo "4. Submit for review"
        else
            echo -e "${RED}❌ iOS submission failed${NC}"
            return 1
        fi
    else
        echo "Skipping iOS submission"
    fi
}

# Function to submit to Android
submit_android() {
    echo ""
    echo -e "${GREEN}🤖 Submitting to Google Play Store...${NC}"
    echo ""
    
    # Check for required credentials
    echo -e "${YELLOW}Ensure you have set up:${NC}"
    echo "  - Google Service Account JSON key"
    echo "  - Path configured in eas.json"
    echo ""
    
    # Check if service account file exists
    if [ ! -f "./google-service-account.json" ]; then
        echo -e "${RED}❌ google-service-account.json not found${NC}"
        echo "Download it from Google Play Console → Setup → API access"
        return 1
    fi
    
    read -p "Continue with Android submission? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        eas submit --platform android --profile production
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Android submission completed${NC}"
            echo ""
            echo -e "${YELLOW}Next steps:${NC}"
            echo "1. Go to Google Play Console: https://play.google.com/console"
            echo "2. Select your app"
            echo "3. Go to Release → Production"
            echo "4. Review and roll out"
        else
            echo -e "${RED}❌ Android submission failed${NC}"
            return 1
        fi
    else
        echo "Skipping Android submission"
    fi
}

# Function to show pre-submission checklist
show_checklist() {
    echo ""
    echo -e "${BLUE}📋 Pre-Submission Checklist${NC}"
    echo "========================================"
    echo ""
    echo "Before submitting, ensure you have:"
    echo ""
    echo "iOS App Store:"
    echo "  □ App Store Connect account set up"
    echo "  □ App created in App Store Connect"
    echo "  □ Screenshots uploaded (all required sizes)"
    echo "  □ App description and metadata filled in"
    echo "  □ Privacy policy URL configured"
    echo "  □ Review information added (demo account)"
    echo "  □ In-app purchases configured (if applicable)"
    echo "  □ Export compliance answered"
    echo ""
    echo "Google Play Store:"
    echo "  □ Google Play Console account set up"
    echo "  □ App created in Play Console"
    echo "  □ Store listing complete"
    echo "  □ Screenshots uploaded"
    echo "  □ Content rating questionnaire completed"
    echo "  □ Data safety form filled"
    echo "  □ Service account JSON key downloaded"
    echo "  □ App signing configured"
    echo ""
}

# Parse command line arguments
PLATFORM=${1:-menu}

case $PLATFORM in
    ios)
        submit_ios
        ;;
    android)
        submit_android
        ;;
    all)
        submit_ios
        submit_android
        ;;
    checklist)
        show_checklist
        ;;
    menu)
        echo ""
        echo "What would you like to do?"
        echo ""
        echo "1) Submit to iOS App Store"
        echo "2) Submit to Google Play Store"
        echo "3) Submit to both stores"
        echo "4) Show pre-submission checklist"
        echo "5) Exit"
        echo ""
        read -p "Enter choice [1-5]: " choice
        
        case $choice in
            1) submit_ios ;;
            2) submit_android ;;
            3) submit_ios && submit_android ;;
            4) show_checklist ;;
            5) echo "Goodbye!" && exit 0 ;;
            *) echo -e "${RED}Invalid choice${NC}" && exit 1 ;;
        esac
        ;;
    *)
        echo -e "${RED}Unknown option: $PLATFORM${NC}"
        echo "Usage: $0 [ios|android|all|checklist|menu]"
        exit 1
        ;;
esac

echo ""
echo "========================================"
echo -e "${GREEN}Done!${NC}"
