# Candidate Command Center - Design Guidelines

## Design Approach
**System-Based Approach** inspired by Linear and Notion's productivity-focused patterns. This is a data-dense dashboard requiring clarity, efficiency, and professional polish.

## Typography System
- **Primary Font**: Inter (via Google Fonts CDN)
- **Hierarchy**:
  - Page Titles: text-2xl, font-semibold
  - Section Headers: text-lg, font-semibold
  - Card Titles: text-base, font-medium
  - Body Text: text-sm, font-normal
  - Labels/Meta: text-xs, font-medium, uppercase tracking

## Layout System
**Spacing Primitives**: Use Tailwind units of 2, 4, 6, and 8 consistently (p-4, gap-6, mb-8)

**Structure**:
- Fixed sidebar navigation (w-64) with logo, primary navigation items, and user profile at bottom
- Main content area with top bar (h-16) containing page title, search, and quick actions
- Content uses max-w-7xl container with px-8 padding
- Grid-based layouts for card displays (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)

## Core Components

**Navigation Sidebar**:
- Vertical list of navigation items with icons (Heroicons)
- Active state indicated through font weight and position indicator
- Collapsible sections for organizing navigation groups

**Top Bar**:
- Sticky positioned (sticky top-0)
- Contains breadcrumb navigation, global search input, notification icon, user avatar
- Shadow for depth separation

**Candidate Cards**:
- Compact cards displaying: avatar, name, role, stage badge, key metrics
- Quick action buttons on hover
- Status indicators using border accent

**Data Table**:
- Striped rows for readability
- Sortable column headers with sort indicators
- Inline actions column (right-aligned)
- Sticky header when scrolling

**Filters Panel**:
- Slide-out panel (w-80) from right side
- Grouped filter sections with collapsible headers
- Apply/Clear actions at bottom

**Stage Pipeline View**:
- Horizontal columns (Kanban-style) using flex layout
- Each column: header with count, scrollable card list
- Drag-drop indicators

**Metrics Dashboard**:
- Grid of stat cards (grid-cols-4) showing key numbers
- Each card: large number (text-3xl), label below, trend indicator
- Sparkline charts using chart library placeholder

**Modal Overlays**:
- Centered, max-w-2xl for forms
- Backdrop with backdrop-blur-sm
- Header with title and close button, body with form fields, footer with actions

## Component Library
- **Icons**: Heroicons (outline for navigation, solid for actions)
- **Forms**: Standard inputs with focus rings, labels above fields, helper text below
- **Buttons**: Primary (solid), Secondary (outline), Ghost (text-only with hover background)
- **Badges**: Small, rounded-full pills for status indicators
- **Avatars**: Circular, with fallback initials if no image

## Interaction Patterns
- Hover states: Slight background change on interactive elements
- Focus states: Ring with offset for keyboard navigation
- Loading states: Skeleton screens matching layout structure
- Empty states: Centered illustration placeholder with helper text

## Images
No hero images required. Use:
- Candidate profile photos (circular avatars)
- Company logos in candidate details
- Empty state illustrations (simple line drawings)

This is a functional dashboard prioritizing information density and workflow efficiency over visual flourish.