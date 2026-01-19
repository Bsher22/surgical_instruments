# SurgicalPrep - Complete Implementation Guide

A comprehensive guide for building SurgicalPrep, a mobile educational app for surgical technologists and OR nurses to study surgical instruments and manage preference cards.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Complete Project Structure](#complete-project-structure)
4. [Stage-by-Stage Implementation](#stage-by-stage-implementation)
5. [Database Schema](#database-schema)
6. [API Endpoints Reference](#api-endpoints-reference)
7. [Dependencies](#dependencies)

---

## Project Overview

**SurgicalPrep** is a React Native (Expo) mobile application with a FastAPI backend, targeting:
- Surgical Technology students preparing for CST certification
- Current OR staff (surgical techs, nurses)
- Healthcare educators

### Core Features
- 📚 **Instrument Database**: Browse 200+ surgical instruments with search/filter
- 📋 **Preference Cards**: Create and manage digital preference cards with photos
- 🎴 **Flashcard Study**: Swipeable cards with spaced repetition (SM-2 algorithm)
- ❓ **Multiple Choice Quizzes**: Image→Name, Name→Use, Image→Category questions
- 💎 **Freemium Model**: Limited free tier, unlimited premium via Stripe

### Business Model
| Tier | Cards | Daily Quizzes | Features |
|------|-------|---------------|----------|
| Free | 5 | 3 | Basic instrument details |
| Premium ($4.99/mo or $29.99/yr) | Unlimited | Unlimited | Full details, templates |

---

## Technology Stack

### Backend
| Component | Technology |
|-----------|------------|
| Framework | FastAPI 0.109+ |
| Database | PostgreSQL (Supabase) |
| ORM | SQLAlchemy 2.0 (async) |
| Authentication | JWT (python-jose) |
| Payments | Stripe |
| Deployment | Railway or Render |

### Mobile Frontend
| Component | Technology |
|-----------|------------|
| Framework | React Native (Expo SDK 50) |
| Language | TypeScript |
| Routing | Expo Router (file-based) |
| State Management | Zustand |
| Server State | TanStack React Query |
| Animations | React Native Reanimated |
| Secure Storage | expo-secure-store |

---

## Complete Project Structure

### Backend Structure
```
surgicalprep-backend/
├── app/
│   ├── __init__.py
│   ├── main.py                    # FastAPI application entry
│   ├── api/
│   │   ├── __init__.py
│   │   └── endpoints/
│   │       ├── __init__.py
│   │       ├── auth.py            # Login, signup, token refresh
│   │       ├── users.py           # Profile, settings
│   │       ├── instruments.py     # Instrument CRUD, search
│   │       ├── cards.py           # Preference cards CRUD
│   │       ├── quiz.py            # Quiz sessions, progress
│   │       └── subscriptions.py   # Stripe subscription management
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py              # Settings from environment
│   │   ├── security.py            # JWT, password hashing
│   │   └── stripe_config.py       # Stripe configuration
│   ├── db/
│   │   ├── __init__.py
│   │   ├── database.py            # Async engine, session
│   │   └── models.py              # SQLAlchemy models
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── instrument.py
│   │   ├── card.py
│   │   ├── quiz.py
│   │   └── subscription.py
│   └── services/
│       └── subscription_service.py
├── database/
│   ├── schema.sql                 # Main database schema
│   ├── rls_policies.sql           # Row Level Security
│   └── seed_sample_data.sql       # Sample data for testing
├── scripts/
│   ├── __init__.py
│   ├── seed_instruments.py        # Instrument seeding
│   ├── seed_templates.py          # Template cards seeding
│   ├── upload_images.py           # Image upload utility
│   └── image_processor.py         # Image processing
├── tests/
│   ├── __init__.py
│   ├── conftest.py                # Pytest fixtures
│   ├── test_auth.py
│   ├── test_instruments.py
│   ├── test_preference_cards.py
│   ├── test_quiz.py
│   └── test_premium.py
├── requirements.txt
├── requirements-test.txt
├── pytest.ini
├── railway.json
├── render.yaml
├── Dockerfile
├── Procfile
└── .env.example
```

### Mobile Frontend Structure
```
surgicalprep-mobile/
├── app/                           # Expo Router (file-based routing)
│   ├── _layout.tsx                # Root layout with providers
│   ├── index.tsx                  # Entry redirect
│   ├── (auth)/                    # Auth screens group
│   │   ├── _layout.tsx            # Auth stack layout
│   │   ├── login.tsx              # Login screen
│   │   └── signup.tsx             # Signup screen
│   └── (tabs)/                    # Main app tabs group
│       ├── _layout.tsx            # Tab navigator
│       ├── instruments/
│       │   ├── _layout.tsx        # Instruments stack
│       │   ├── index.tsx          # Instrument list
│       │   └── [id].tsx           # Instrument detail
│       ├── cards/
│       │   ├── _layout.tsx        # Cards stack
│       │   ├── index.tsx          # Card list
│       │   ├── [id].tsx           # Card detail view
│       │   ├── new.tsx            # Create new card
│       │   └── edit/
│       │       └── [id].tsx       # Edit card
│       ├── quiz/
│       │   ├── _layout.tsx        # Quiz stack
│       │   ├── index.tsx          # Quiz home
│       │   ├── flashcards.tsx     # Flashcard session
│       │   ├── session.tsx        # Multiple choice quiz
│       │   ├── results.tsx        # Quiz results
│       │   ├── review.tsx         # Review mistakes
│       │   └── history.tsx        # Quiz history
│       └── profile/
│           ├── _layout.tsx        # Profile stack
│           ├── index.tsx          # Profile main
│           ├── settings.tsx       # Settings screen
│           ├── subscription.tsx   # Subscription management
│           ├── change-password.tsx
│           └── delete-account.tsx
├── src/
│   ├── api/                       # API client layer
│   │   ├── index.ts               # Barrel exports
│   │   ├── client.ts              # Axios client with interceptors
│   │   ├── auth.ts                # Auth endpoints
│   │   ├── instruments.ts         # Instruments endpoints
│   │   ├── cards.ts               # Cards endpoints
│   │   ├── quiz.ts                # Quiz endpoints
│   │   ├── storage.ts             # Supabase storage
│   │   ├── subscriptions.ts       # Subscription endpoints
│   │   └── supabase.ts            # Supabase client
│   ├── stores/                    # Zustand stores
│   │   ├── index.ts
│   │   ├── authStore.ts           # Authentication state
│   │   ├── quizStore.ts           # Quiz state
│   │   ├── cardFormStore.ts       # Card form state
│   │   ├── flashcardStore.ts      # Flashcard session state
│   │   ├── multipleChoiceQuizStore.ts
│   │   ├── settingsStore.ts       # App settings
│   │   ├── subscriptionStore.ts   # Subscription state
│   │   └── toastStore.ts          # Toast notifications
│   ├── hooks/                     # Custom React hooks
│   │   ├── index.ts
│   │   ├── useAuth.ts
│   │   ├── useInstruments.ts
│   │   ├── useCards.ts
│   │   ├── useCardForm.ts
│   │   ├── useCardDraftRecovery.ts
│   │   ├── useCardFormAutoSave.ts
│   │   ├── useUnsavedChangesGuard.ts
│   │   ├── useQuiz.ts
│   │   ├── useFlashcardSession.ts
│   │   ├── useMultipleChoiceQuiz.ts
│   │   ├── useQuizTimer.ts
│   │   ├── useBookmarks.ts
│   │   ├── usePhotoUpload.ts
│   │   ├── useImagePicker.ts
│   │   ├── usePhotoDelete.ts
│   │   ├── useUser.ts
│   │   ├── useSubscription.ts
│   │   ├── usePremiumFeature.ts
│   │   ├── useSettingsSync.ts
│   │   ├── useNetworkStatus.ts
│   │   ├── useDynamicFontSize.ts
│   │   ├── useReduceMotion.ts
│   │   └── useFocus.ts
│   ├── components/                # Reusable components
│   │   ├── index.ts
│   │   ├── ui/                    # Base UI components
│   │   │   ├── index.ts
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Loading.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── FormInput.tsx
│   │   │   ├── FormTextArea.tsx
│   │   │   ├── FormPicker.tsx
│   │   │   ├── FormSection.tsx
│   │   │   ├── FormError.tsx
│   │   │   ├── LogoHeader.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── ToastContainer.tsx
│   │   │   ├── SkeletonLoader.tsx
│   │   │   ├── OptimizedImage.tsx
│   │   │   ├── OptimizedFlatList.tsx
│   │   │   ├── SafeContainer.tsx
│   │   │   ├── KeyboardAvoidingWrapper.tsx
│   │   │   ├── RefreshableScrollView.tsx
│   │   │   ├── BookmarkButton.tsx
│   │   │   ├── CategoryBadge.tsx
│   │   │   ├── PremiumLockOverlay.tsx
│   │   │   ├── SectionCard.tsx
│   │   │   ├── TagList.tsx
│   │   │   └── ZoomableImage.tsx
│   │   ├── InstrumentCard.tsx
│   │   ├── SearchBar.tsx
│   │   ├── CategoryChip.tsx
│   │   ├── LoadingSkeleton.tsx
│   │   ├── PreferenceCardItem.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── OfflineBanner.tsx
│   │   ├── MedicalDisclaimer.tsx
│   │   ├── cards/                 # Card-specific components
│   │   │   ├── index.ts
│   │   │   ├── CardForm.tsx
│   │   │   ├── CardFormHeader.tsx
│   │   │   ├── SpecialtyPicker.tsx
│   │   │   ├── CategoryBadge.tsx
│   │   │   ├── CardItemRow.tsx
│   │   │   ├── ItemSearchModal.tsx
│   │   │   ├── ItemEditModal.tsx
│   │   │   ├── CustomItemForm.tsx
│   │   │   └── DraggableItemList.tsx
│   │   ├── photos/                # Photo upload components
│   │   │   ├── index.ts
│   │   │   ├── PhotoUploader.tsx
│   │   │   ├── PhotoPreviewGrid.tsx
│   │   │   ├── PhotoPreviewItem.tsx
│   │   │   └── PhotoSourceModal.tsx
│   │   ├── quiz/                  # Quiz components
│   │   │   ├── index.ts
│   │   │   ├── StatsDashboard.tsx
│   │   │   ├── QuickActionButtons.tsx
│   │   │   ├── CategorySelectModal.tsx
│   │   │   ├── QuizHistoryList.tsx
│   │   │   ├── FreeTierLimitBanner.tsx
│   │   │   ├── QuizProgressBar.tsx
│   │   │   ├── QuizTimer.tsx
│   │   │   ├── AnswerOption.tsx
│   │   │   ├── QuizQuestion.tsx
│   │   │   ├── AnswerFeedback.tsx
│   │   │   └── QuizResults.tsx
│   │   ├── flashcard/             # Flashcard components
│   │   │   ├── index.ts
│   │   │   ├── FlashCard.tsx
│   │   │   ├── SwipeableCardStack.tsx
│   │   │   ├── FlashcardProgressBar.tsx
│   │   │   └── SessionSummary.tsx
│   │   ├── profile/               # Profile components
│   │   │   ├── index.ts
│   │   │   ├── ProfileHeader.tsx
│   │   │   ├── SubscriptionCard.tsx
│   │   │   ├── UsageStatsCard.tsx
│   │   │   ├── SettingsSection.tsx
│   │   │   ├── SettingsRow.tsx
│   │   │   ├── EditProfileModal.tsx
│   │   │   └── CategoryPickerModal.tsx
│   │   ├── subscription/          # Subscription components
│   │   │   ├── index.ts
│   │   │   ├── PaywallScreen.tsx
│   │   │   ├── PricingCard.tsx
│   │   │   ├── BenefitItem.tsx
│   │   │   └── PremiumBadge.tsx
│   │   └── premium/               # Premium gating components
│   │       ├── index.ts
│   │       ├── PremiumGate.tsx
│   │       ├── LockedOverlay.tsx
│   │       └── UpgradePrompt.tsx
│   ├── contexts/                  # React contexts
│   │   ├── index.ts
│   │   └── ThemeContext.tsx
│   ├── providers/                 # Provider components
│   │   └── QueryProvider.tsx
│   ├── types/                     # TypeScript types
│   │   ├── index.ts
│   │   ├── auth.ts
│   │   ├── instruments.ts
│   │   ├── cards.ts
│   │   ├── cardForm.ts
│   │   ├── quiz.ts
│   │   ├── flashcard.ts
│   │   ├── photo.ts
│   │   ├── user.ts
│   │   └── subscription.ts
│   ├── utils/                     # Utility functions
│   │   ├── index.ts
│   │   ├── constants.ts
│   │   ├── tokenStorage.ts
│   │   ├── validation.ts
│   │   ├── cardFormUtils.ts
│   │   ├── imageUtils.ts
│   │   ├── fileUtils.ts
│   │   ├── haptics.ts
│   │   ├── accessibility.ts
│   │   ├── colorContrast.ts
│   │   └── retry.ts
│   └── theme/                     # Theme configuration
│       └── index.ts
├── assets/                        # Static assets
│   ├── images/
│   ├── fonts/
│   └── icons/
├── config/                        # Build configuration
│   ├── app.config.ts
│   └── eas.json
├── __tests__/                     # Test files
│   ├── setup.ts
│   ├── utils/
│   │   └── test-utils.tsx
│   ├── mocks/
│   │   ├── handlers.ts
│   │   └── server.ts
│   ├── components/
│   ├── stores/
│   └── screens/
├── app.json
├── package.json
├── tsconfig.json
├── babel.config.js
├── jest.config.js
├── .env.example
└── .gitignore
```

---

## Stage-by-Stage Implementation

### Stage 1: Infrastructure Setup

#### Stage 1A: Supabase Setup (2-3 hours)

**Steps:**
1. Create Supabase project at supabase.com
2. Run `database/schema.sql` in SQL Editor
3. Run `database/rls_policies.sql` for Row Level Security
4. Create storage bucket `instrument-images` with public read access
5. Export credentials to `.env`

**Required Credentials:**
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
DATABASE_URL=postgresql+asyncpg://postgres:[password]@db.[ref].supabase.co:5432/postgres
```

**Deliverables:**
- [ ] Database schema deployed (6 tables)
- [ ] RLS policies configured
- [ ] Storage bucket created
- [ ] Credentials exported

---

#### Stage 1B: Backend Deployment (2-3 hours)

**Steps:**
1. Set up Railway or Render account
2. Connect GitHub repository
3. Configure environment variables
4. Deploy FastAPI application
5. Verify health endpoint

**Files to Create:**
- `app/main.py` - FastAPI entry point
- `app/core/config.py` - Environment settings
- `app/core/security.py` - JWT/password utilities
- `app/db/database.py` - Async SQLAlchemy setup
- `app/db/models.py` - SQLAlchemy models
- `app/schemas/*.py` - Pydantic schemas
- `app/api/endpoints/*.py` - API routes

**Deliverables:**
- [ ] Backend deployed and accessible
- [ ] Health endpoint returning 200
- [ ] API documentation at `/docs`

---

#### Stage 1C: Mobile Environment Setup (1-2 hours)

**Steps:**
1. Install Node.js 18+ and npm
2. Install Expo CLI and EAS CLI
3. Initialize Expo project with TypeScript
4. Install core dependencies
5. Configure `app.json`
6. Verify app runs on simulator

**Commands:**
```bash
npx create-expo-app@latest surgicalprep-mobile --template expo-template-blank-typescript
cd surgicalprep-mobile

# Install core dependencies
npx expo install expo-router expo-linking expo-constants expo-status-bar
npx expo install @react-navigation/native @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context
npx expo install react-native-gesture-handler react-native-reanimated
npx expo install expo-secure-store expo-image-picker expo-image
npx expo install @tanstack/react-query zustand axios
```

**Deliverables:**
- [ ] Expo project initialized
- [ ] Dependencies installed
- [ ] App runs on simulator/device

---

### Stage 2: Mobile App Foundation

#### Stage 2A: Project Structure (2-3 hours)

**Steps:**
1. Create file-based routing structure in `app/`
2. Set up `src/` directories (api, stores, components, hooks, types, utils)
3. Configure TypeScript paths in `tsconfig.json`
4. Create placeholder screens for all routes

**Deliverables:**
- [ ] Complete routing structure
- [ ] All placeholder screens
- [ ] TypeScript path aliases working

---

#### Stage 2B: API Client (2-3 hours)

**Steps:**
1. Create Axios client with base URL and interceptors
2. Set up React Query provider with default options
3. Create TypeScript types matching backend schemas
4. Implement API modules (auth, instruments, cards, quiz)

**Key Files:**
- `src/api/client.ts` - Axios instance with token interceptor
- `src/api/auth.ts` - Login, signup, refresh token
- `src/providers/QueryProvider.tsx` - React Query setup
- `src/types/index.ts` - All TypeScript interfaces

**Deliverables:**
- [ ] Typed API client
- [ ] Token auto-injection
- [ ] React Query configured

---

#### Stage 2C: Authentication Store & Flow (3-4 hours)

**Steps:**
1. Create Zustand auth store
2. Implement secure token storage
3. Build auth context/hooks
4. Create protected route wrapper
5. Add auto-login on app start

**Key Files:**
- `src/stores/authStore.ts` - User, token, loading state
- `src/utils/tokenStorage.ts` - Secure storage utilities
- `src/hooks/useAuth.ts` - Auth convenience hooks
- `src/components/ProtectedRoute.tsx` - Route guard

**Deliverables:**
- [ ] Persistent auth state
- [ ] Secure token storage
- [ ] Protected route wrapper

---

#### Stage 2D: Auth Screens (3-4 hours)

**Steps:**
1. Build login screen with form validation
2. Build signup screen with role picker
3. Add error handling and loading states
4. Implement keyboard avoiding behavior

**Key Files:**
- `app/(auth)/login.tsx`
- `app/(auth)/signup.tsx`
- `src/utils/validation.ts`
- `src/components/ui/FormError.tsx`

**Deliverables:**
- [ ] Working login/signup
- [ ] Form validation
- [ ] Error handling

---

### Stage 3: Instruments Feature

#### Stage 3A: Instruments API Layer (2-3 hours)

**Steps:**
1. Create instruments API functions
2. Build React Query hooks
3. Add search and pagination support

**Key Files:**
- `src/api/instruments.ts`
- `src/hooks/useInstruments.ts`
- `src/types/instruments.ts`

---

#### Stage 3B: Instrument List Screen (4-5 hours)

**Steps:**
1. Build FlatList with infinite scroll
2. Add search bar with debounce
3. Create category filter chips
4. Implement pull-to-refresh
5. Add loading skeletons

**Key Files:**
- `app/(tabs)/instruments/index.tsx`
- `src/components/SearchBar.tsx`
- `src/components/CategoryChip.tsx`
- `src/components/LoadingSkeleton.tsx`

---

#### Stage 3C: UI Components (3-4 hours)

**Steps:**
1. Build InstrumentCard component
2. Create SearchBar with debounce
3. Build CategoryChip component
4. Create EmptyState component
5. Build LoadingSkeleton

---

#### Stage 3D: Instrument Detail Screen (3-4 hours)

**Steps:**
1. Create hero image with zoom
2. Build info sections (description, uses, procedures)
3. Add bookmark button
4. Implement premium lock overlay

**Key Files:**
- `app/(tabs)/instruments/[id].tsx`
- `src/components/ui/ZoomableImage.tsx`
- `src/components/ui/PremiumLockOverlay.tsx`
- `src/hooks/useBookmarks.ts`

---

### Stage 4: Preference Cards - Read & List

#### Stage 4A: Cards API Layer (2-3 hours)

**Steps:**
1. Create cards API functions
2. Build React Query hooks
3. Add template cards support

**Key Files:**
- `src/api/cards.ts`
- `src/hooks/useCards.ts`
- `src/types/cards.ts`

---

#### Stage 4B: Cards List Screen (3-4 hours)

**Steps:**
1. Build card list with search/filter
2. Create PreferenceCardItem component
3. Add empty state with CTA
4. Show free tier limit indicator

**Key Files:**
- `app/(tabs)/cards/index.tsx`
- `src/components/PreferenceCardItem.tsx`

---

#### Stage 4C: Card Detail View (4-5 hours)

**Steps:**
1. Build card header section
2. Create grouped items display
3. Add photo carousel
4. Link to instrument details
5. Add edit/share buttons

**Key Files:**
- `app/(tabs)/cards/[id].tsx`

---

### Stage 5: Preference Cards - Create & Edit

#### Stage 5A: Card Form State (3-4 hours)

**Steps:**
1. Create card form Zustand store
2. Implement draft auto-save
3. Add unsaved changes tracking
4. Build draft recovery

**Key Files:**
- `src/stores/cardFormStore.ts`
- `src/hooks/useCardFormAutoSave.ts`
- `src/hooks/useCardDraftRecovery.ts`
- `src/hooks/useUnsavedChangesGuard.ts`

---

#### Stage 5B: Card Form - Basic Info (4-5 hours)

**Steps:**
1. Create form UI with sections
2. Build specialty picker
3. Add form validation
4. Implement save/cancel

**Key Files:**
- `app/(tabs)/cards/new.tsx`
- `app/(tabs)/cards/edit/[id].tsx`
- `src/components/cards/CardForm.tsx`
- `src/components/cards/SpecialtyPicker.tsx`

---

#### Stage 5C: Item Management (6-8 hours)

**Steps:**
1. Build item search modal
2. Create item edit modal
3. Add custom item form
4. Implement drag-to-reorder
5. Add swipe-to-delete

**Key Files:**
- `src/components/cards/ItemSearchModal.tsx`
- `src/components/cards/ItemEditModal.tsx`
- `src/components/cards/CustomItemForm.tsx`
- `src/components/cards/DraggableItemList.tsx`

**Dependencies:**
```bash
npx expo install react-native-draggable-flatlist
```

---

#### Stage 5D: Photo Upload (4-5 hours)

**Steps:**
1. Implement camera/gallery picker
2. Build photo preview grid
3. Add upload to Supabase Storage
4. Handle progress and errors

**Key Files:**
- `src/components/photos/PhotoUploader.tsx`
- `src/components/photos/PhotoPreviewGrid.tsx`
- `src/hooks/usePhotoUpload.ts`
- `src/hooks/useImagePicker.ts`
- `src/api/storage.ts`

**Dependencies:**
```bash
npx expo install expo-file-system expo-image-manipulator expo-haptics
```

---

### Stage 6: Quiz & Study System

#### Stage 6A: Quiz API Layer (3-4 hours)

**Steps:**
1. Create quiz API functions
2. Build progress tracking API
3. Add spaced repetition support

**Key Files:**
- `src/api/quiz.ts`
- `src/hooks/useQuiz.ts`
- `src/types/quiz.ts`

---

#### Stage 6B: Quiz Home Screen (4-5 hours)

**Steps:**
1. Build stats dashboard
2. Create quick action buttons
3. Add category selection modal
4. Build quiz history list
5. Add free tier limit banner

**Key Files:**
- `app/(tabs)/quiz/index.tsx`
- `src/components/quiz/StatsDashboard.tsx`
- `src/components/quiz/QuickActionButtons.tsx`
- `src/components/quiz/CategorySelectModal.tsx`

---

#### Stage 6C: Flashcard Mode (5-6 hours)

**Steps:**
1. Build swipeable card stack
2. Implement flip animation
3. Add progress tracking
4. Create session summary
5. Integrate SM-2 algorithm

**Key Files:**
- `app/(tabs)/quiz/flashcards.tsx`
- `src/components/flashcard/FlashCard.tsx`
- `src/components/flashcard/SwipeableCardStack.tsx`
- `src/stores/flashcardStore.ts`
- `src/hooks/useFlashcardSession.ts`

**Dependencies:**
```bash
npx expo install expo-haptics uuid
npm install --save-dev @types/uuid
```

---

#### Stage 6D: Multiple Choice Quiz (5-6 hours)

**Steps:**
1. Build question display
2. Create answer options
3. Add timer functionality
4. Implement feedback
5. Build results screen
6. Add review mistakes feature

**Key Files:**
- `app/(tabs)/quiz/session.tsx`
- `app/(tabs)/quiz/review.tsx`
- `src/components/quiz/QuizQuestion.tsx`
- `src/components/quiz/AnswerOption.tsx`
- `src/components/quiz/QuizTimer.tsx`
- `src/stores/multipleChoiceQuizStore.ts`

---

### Stage 7: User Profile & Settings

#### Stage 7A: Profile Screen (3-4 hours)

**Steps:**
1. Build profile header
2. Create subscription status card
3. Add usage stats display
4. Implement edit profile modal

**Key Files:**
- `app/(tabs)/profile/index.tsx`
- `src/components/profile/ProfileHeader.tsx`
- `src/components/profile/SubscriptionCard.tsx`
- `src/components/profile/UsageStatsCard.tsx`

---

#### Stage 7B: Settings Screen (2-3 hours)

**Steps:**
1. Build quiz preferences section
2. Add display settings
3. Create about section

**Key Files:**
- `app/(tabs)/profile/settings.tsx`
- `src/stores/settingsStore.ts`
- `src/hooks/useSettingsSync.ts`

**Dependencies:**
```bash
npx expo install @react-native-async-storage/async-storage
npx expo install @react-native-community/slider
npx expo install expo-application expo-haptics
```

---

#### Stage 7C: Account Actions (2-3 hours)

**Steps:**
1. Build change password flow
2. Implement logout
3. Add delete account with confirmation

**Key Files:**
- `app/(tabs)/profile/change-password.tsx`
- `app/(tabs)/profile/delete-account.tsx`

---

### Stage 8: Subscription & Payments

#### Stage 8A: Stripe Setup (2-3 hours)

**Backend Steps:**
1. Create Stripe products/prices
2. Implement subscription endpoints
3. Set up webhook handling

**Key Files (Backend):**
- `app/api/endpoints/subscriptions.py`
- `app/core/stripe_config.py`
- `app/services/subscription_service.py`

---

#### Stage 8B: Paywall Screen (4-5 hours)

**Steps:**
1. Build premium benefits display
2. Create pricing cards
3. Implement Stripe Checkout redirect
4. Add restore purchases

**Key Files:**
- `app/(tabs)/profile/subscription.tsx`
- `src/components/subscription/PaywallScreen.tsx`
- `src/components/subscription/PricingCard.tsx`
- `src/api/subscriptions.ts`

---

#### Stage 8C: Premium Gating (3-4 hours)

**Steps:**
1. Build PremiumGate wrapper
2. Create LockedOverlay component
3. Implement feature limits
4. Add upgrade prompts

**Key Files:**
- `src/components/premium/PremiumGate.tsx`
- `src/components/premium/LockedOverlay.tsx`
- `src/hooks/usePremiumFeature.ts`
- `src/stores/subscriptionStore.ts`

---

### Stage 9: Content Population

#### Stage 9A-9B: Content & Images (8-12 hours)

**Steps:**
1. Compile instrument data (200-300 instruments)
2. Source/create instrument images
3. Process images (resize, optimize)
4. Upload to Supabase Storage

**Key Files:**
- `scripts/data/instruments.json`
- `scripts/data/categories.json`
- `scripts/image_processor.py`
- `scripts/upload_images.py`

---

#### Stage 9C-9D: Database Seeding (3-4 hours)

**Steps:**
1. Create seed scripts
2. Import instruments
3. Create template cards
4. Verify data integrity

**Key Files:**
- `scripts/seed_instruments.py`
- `scripts/seed_templates.py`
- `scripts/verify_seed.py`
- `scripts/data/templates.json`

---

### Stage 10: Polish & Performance

#### Stage 10A: Performance (4-5 hours)

**Steps:**
1. Implement image lazy loading
2. Optimize FlatList rendering
3. Configure React Query caching
4. Analyze and reduce bundle size

**Key Files:**
- `src/components/ui/OptimizedImage.tsx`
- `src/components/ui/OptimizedFlatList.tsx`
- `src/api/queryClient.ts`

---

#### Stage 10B: Error Handling (3-4 hours)

**Steps:**
1. Build global error boundary
2. Add toast notifications
3. Implement retry logic
4. Create offline banner

**Key Files:**
- `src/components/ErrorBoundary.tsx`
- `src/components/OfflineBanner.tsx`
- `src/components/ui/Toast.tsx`
- `src/stores/toastStore.ts`
- `src/utils/retry.ts`

---

#### Stage 10C: UI Polish (4-5 hours)

**Steps:**
1. Standardize spacing/typography
2. Add loading animations
3. Implement haptic feedback
4. Add keyboard avoiding views

**Key Files:**
- `src/theme/index.ts`
- `src/utils/haptics.ts`
- `src/components/ui/KeyboardAvoidingWrapper.tsx`

---

#### Stage 10D: Accessibility (2-3 hours)

**Steps:**
1. Add screen reader labels
2. Ensure touch target sizes
3. Verify color contrast
4. Support dynamic font scaling

**Key Files:**
- `src/utils/accessibility.ts`
- `src/utils/colorContrast.ts`
- `src/hooks/useDynamicFontSize.ts`
- `src/hooks/useReduceMotion.ts`

---

### Stage 11: Testing & QA

#### Stage 11A: Backend Tests (4-5 hours)

**Steps:**
1. Set up pytest with fixtures
2. Write auth endpoint tests
3. Write CRUD operation tests
4. Test premium gating

**Key Files:**
- `tests/conftest.py`
- `tests/test_auth.py`
- `tests/test_instruments.py`
- `tests/test_preference_cards.py`
- `tests/test_quiz.py`
- `tests/test_premium.py`

**Dependencies:**
```bash
pip install pytest pytest-asyncio httpx factory-boy faker
```

---

#### Stage 11B: Frontend Tests (3-4 hours)

**Steps:**
1. Configure Jest with mocks
2. Set up MSW for API mocking
3. Write component tests
4. Test auth store

**Key Files:**
- `__tests__/setup.ts`
- `__tests__/mocks/handlers.ts`
- `__tests__/components/*.test.tsx`
- `jest.config.js`

**Dependencies:**
```bash
npm install --save-dev jest @testing-library/react-native msw
```

---

#### Stage 11C-11D: Manual & Beta Testing (1-2 weeks)

**Steps:**
1. Complete manual testing checklist
2. Set up TestFlight (iOS)
3. Set up Play Internal Testing (Android)
4. Recruit beta testers
5. Collect and address feedback

---

### Stage 12: Launch Preparation

#### Stage 12A: App Store Assets (4-5 hours)

**iOS Requirements:**
- App icon (1024x1024)
- Screenshots (6.7", 6.5", 5.5")
- App name, subtitle, description
- Keywords (100 char max)
- Privacy policy URL

**Android Requirements:**
- Feature graphic (1024x500)
- Screenshots (phone + tablet)
- Short/full description
- Content rating questionnaire
- Data safety form

---

#### Stage 12B: Legal & Compliance (2-3 hours)

**Required Documents:**
- Privacy Policy
- Terms of Service
- Medical Disclaimer
- EULA

**Key Files:**
- `legal/privacy-policy.md`
- `legal/terms-of-service.md`

---

#### Stage 12C: Monitoring Setup (2-3 hours)

**Steps:**
1. Configure Firebase Analytics
2. Set up Sentry error tracking
3. Add uptime monitoring

**Key Files:**
- `monitoring/analytics.ts`
- `monitoring/sentry.ts`
- `monitoring/index.ts`

---

#### Stage 12D: Submission (2-3 hours)

**Steps:**
1. Build production app with EAS
2. Submit to App Store Connect
3. Submit to Google Play Console
4. Address review feedback

**Commands:**
```bash
eas build --platform all --profile production
eas submit --platform ios
eas submit --platform android
```

---

## Database Schema

### Tables Overview

| Table | Purpose |
|-------|---------|
| `users` | User accounts with subscription info |
| `instruments` | Surgical instruments with full-text search |
| `preference_cards` | User preference cards |
| `preference_card_items` | Items within cards |
| `user_instrument_progress` | Study progress with SM-2 data |
| `quiz_sessions` | Quiz history and results |

### Key Enums

```sql
-- User roles
CREATE TYPE user_role AS ENUM ('student', 'surgical_tech', 'nurse', 'educator', 'other');

-- Subscription tiers
CREATE TYPE subscription_tier AS ENUM ('free', 'premium');

-- Instrument categories
CREATE TYPE instrument_category AS ENUM (
  'cutting', 'clamping', 'grasping', 'retracting',
  'suturing', 'suctioning', 'probing', 'dilating', 'specialty', 'other'
);

-- Card item categories
CREATE TYPE card_item_category AS ENUM (
  'instruments', 'supplies', 'sutures', 'implants', 'medications', 'other'
);

-- Quiz types
CREATE TYPE quiz_type AS ENUM ('flashcard', 'multiple_choice', 'mixed');
```

---

## API Endpoints Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create new user |
| POST | `/api/auth/login` | Login, get tokens |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Invalidate tokens |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Get current user |
| PUT | `/api/users/me` | Update profile |
| PUT | `/api/users/me/password` | Change password |
| DELETE | `/api/users/me` | Delete account |

### Instruments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/instruments` | List instruments (paginated) |
| GET | `/api/instruments/:id` | Get instrument detail |
| GET | `/api/instruments/search` | Full-text search |
| GET | `/api/instruments/categories` | List categories |

### Preference Cards
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cards` | List user's cards |
| POST | `/api/cards` | Create card |
| GET | `/api/cards/:id` | Get card detail |
| PUT | `/api/cards/:id` | Update card |
| DELETE | `/api/cards/:id` | Delete card |
| POST | `/api/cards/:id/duplicate` | Duplicate card |
| GET | `/api/cards/templates` | Get template cards |

### Quiz & Study
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/quiz/sessions` | Start quiz session |
| POST | `/api/quiz/sessions/:id/answer` | Submit answer |
| POST | `/api/quiz/sessions/:id/end` | End session |
| GET | `/api/quiz/progress` | Get study progress |
| GET | `/api/quiz/due-for-review` | Get due instruments |
| POST | `/api/quiz/bookmark/:id` | Toggle bookmark |

### Subscriptions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/subscriptions/status` | Get subscription status |
| POST | `/api/subscriptions/checkout` | Create checkout session |
| POST | `/api/subscriptions/portal` | Get customer portal URL |
| POST | `/api/subscriptions/webhook` | Stripe webhook handler |

---

## Dependencies

### Backend (requirements.txt)
```txt
fastapi>=0.109.0
uvicorn[standard]>=0.27.0
sqlalchemy[asyncio]>=2.0.0
asyncpg>=0.29.0
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.4
python-multipart>=0.0.6
pydantic>=2.5.0
pydantic-settings>=2.1.0
stripe>=7.0.0
python-dotenv>=1.0.0
aiohttp>=3.9.0
pillow>=10.0.0
```

### Mobile (package.json dependencies)
```json
{
  "dependencies": {
    "@react-native-async-storage/async-storage": "^1.21.0",
    "@react-native-community/slider": "^4.5.0",
    "@react-native-picker/picker": "^2.6.1",
    "@react-navigation/bottom-tabs": "^6.5.11",
    "@react-navigation/native": "^6.1.9",
    "@tanstack/react-query": "^5.17.0",
    "axios": "^1.6.5",
    "expo": "~50.0.0",
    "expo-application": "~5.8.0",
    "expo-constants": "~15.4.5",
    "expo-file-system": "~16.0.0",
    "expo-haptics": "~12.8.0",
    "expo-image": "~1.10.1",
    "expo-image-manipulator": "~11.8.0",
    "expo-image-picker": "~14.7.1",
    "expo-linking": "~6.2.2",
    "expo-router": "~3.4.0",
    "expo-secure-store": "~12.8.1",
    "expo-status-bar": "~1.11.1",
    "react": "18.2.0",
    "react-native": "0.73.2",
    "react-native-draggable-flatlist": "^4.0.1",
    "react-native-gesture-handler": "~2.14.0",
    "react-native-reanimated": "~3.6.1",
    "react-native-safe-area-context": "4.8.2",
    "react-native-screens": "~3.29.0",
    "uuid": "^9.0.0",
    "zustand": "^4.4.7"
  }
}
```

---

## Quick Start Commands

### Backend
```bash
# Setup
cd surgicalprep-backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run locally
uvicorn app.main:app --reload --port 8000

# Run tests
pytest -v
```

### Mobile
```bash
# Setup
cd surgicalprep-mobile
npm install

# Run development
npx expo start

# Build for production
eas build --platform all --profile production

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

---

## Success Metrics

### MVP Launch (Month 1)
- 200+ downloads
- 50+ registered users
- 4.0+ app store rating
- <1% crash rate

### Month 3
- 1,000+ downloads
- 300+ MAU
- 10+ premium subscribers
- 20+ preference cards created

### Month 6
- 5,000+ downloads
- 1,500+ MAU
- 100+ premium subscribers ($500+ MRR)
- Featured in surgical tech communities

---

*Generated from SurgicalPrep implementation files - Version 1.0*
