# Jeevan Verse — Product Requirements Document

**Status:** Product definition based on the current repository  
**Last updated:** 26 November 2026  
**Product:** Jeevan Verse  
**Tagline:** Connecting healthcare, empowering lives

## 1. Product summary

Jeevan Verse is a community health platform that brings together individual users and health organizations. It provides four connected experiences: an AI health assistant called Umeed, a blood request and volunteer network called Blood Bridge, community health discussions, and organization-led health posts and campaigns.

The current product is a web application with separate user and organization accounts. Its primary value is helping people find health information and community support, coordinate blood donation requests, and discover health initiatives in one place.

## 2. Problem and opportunity

People seeking health support may have to move between general information sources, local communities, and informal donor networks. Health organizations also need a way to publish initiatives to a community that can discover and discuss them. Jeevan Verse aims to make these interactions easier to access through one community platform.

The product is not a healthcare provider. AI-generated content is informational and should not replace diagnosis, treatment, or professional medical advice.

## 3. Goals

- Give users one place to access health-oriented conversations, AI assistance, blood requests, and organization updates.
- Let users create and manage blood requests and let other users volunteer to help.
- Support persistent, user-specific conversations with Umeed, including prescription document analysis.
- Let health organizations maintain a profile and publish posts or campaigns.
- Make important activity visible through notifications and clear account-specific experiences.

### Success measures to establish

The project does not currently define product analytics or target thresholds. The team should establish baselines and targets for:

- User registration and successful return visits.
- Blood requests receiving at least one volunteer and reaching completion.
- Discussion posts receiving comments or replies.
- Umeed sessions with a follow-up interaction and successful prescription uploads.
- Organization posts viewed and engaged with by users.
- Error rate, page performance, and completion rate for key workflows.

## 4. Users and roles

### Individual user

A community member who registers with contact, location, and profile information. A user can explore discussions and organization posts, create posts, use Umeed, and create, edit, or volunteer for blood requests. The profile includes blood group and a donation availability preference.

### Health organization

An organization account that registers and maintains organization profile information, then publishes organization posts and campaign-style updates for users to discover.

### Visitor

A person who has not signed in. Visitors can view public landing and informational content, and public discussion content where available. Actions that create or personalize data require authentication.

### Product operator

An operational role needed to support moderation, abuse handling, and account or content issues. No operator-facing moderation console or detailed operator workflow is currently evidenced in the application; these remain future requirements.

## 5. Product scope and requirements

Requirements below describe the product represented by the repository. “Current” means a corresponding screen, route, or data model exists; it does not claim production readiness or independently verified quality.

### 5.1 Accounts and access

- **Current:** Individual users can register, log in, log out, and refresh authentication. User profiles capture name, email, phone, age, location, professional status, blood group, height, weight, and whether the user can donate.
- **Current:** Organizations have separate registration, login, logout, profile retrieval, profile update, and password-change flows.
- **Current:** Protected routes and server middleware distinguish authenticated access; JWTs and HTTP-only cookies are used by the server.
- **Requirement:** Users must be able to understand which account type they are using and reach the correct sign-in and registration flow.
- **Requirement:** Forms must validate required fields and provide understandable recovery feedback for authentication errors.

### 5.2 Umeed — AI health assistant

- **Current:** Authenticated users can create and revisit chat sessions, send messages, and delete sessions.
- **Current:** Users can upload a prescription for analysis in a chat session. The server includes Gemini, PDF parsing, and prescription data handling.
- **Current:** A behavior insights view is available through a dedicated endpoint and client feature.
- **Requirement:** Users must be able to see which conversation is active, review its history, start a new conversation, and recover gracefully from a failed response or upload.
- **Requirement:** Responses must be clearly presented as informational, avoid claiming to diagnose, and direct users to professional or emergency care when appropriate.
- **Requirement:** Before uploading, users should be told that a document may contain sensitive health information and how it is used and retained.
- **Product note:** Repository materials describe retrieval-augmented memory and a session cap, but the exact retention behavior and limits need confirmation before being treated as user-facing guarantees.

### 5.3 Blood Bridge — blood requests and volunteers

- **Current:** Authenticated users can browse requests, filter by blood group or status, view request details, create and update requests, change status, and delete their own requests where authorized.
- **Current:** Users can volunteer for a request and configure whether their details can be shared. Request records include blood group, urgency, location, contact information, status, and volunteers.
- **Current:** The server and client include real-time notifications and email support associated with blood request activity.
- **Requirement:** Request listings and details must show the blood group, urgency, location, status, and contact or volunteering action clearly.
- **Requirement:** The requester must be able to mark a request completed or otherwise update its status so outdated requests are not mistaken for active needs.
- **Requirement:** The product must explain that volunteer coordination does not verify donor eligibility or guarantee a successful donation.
- **Product note:** Geolocation-based matching is mentioned in the existing README but is not substantiated by the current request model and screens reviewed. Treat it as unconfirmed future scope.

### 5.4 Community discussions

- **Current:** Users can browse posts and open individual discussions. Authenticated users can create, edit, and delete posts. Comments and replies are supported, and users receive comment notifications.
- **Requirement:** Discussion content must be clearly identified as community-generated and not professional medical advice by default.
- **Requirement:** Users need a way to report harmful or misleading content and the product needs a corresponding moderation process.
- **Product note:** The existing README mentions moderated and expert-verified conversations and anonymous support groups. The reviewed implementation does not establish moderator verification or anonymous posting, so these are not current commitments.

### 5.5 Organization profiles and health posts

- **Current:** Organizations can register, log in, manage their profile, and create organization posts. Users can discover organization posts in the application.
- **Requirement:** Organization identity and post ownership must be visible to users.
- **Requirement:** Posts should support clear, accessible campaign information and a useful destination or next step when applicable.
- **Product note:** The code supports organization posts; the exact publication, approval, and campaign lifecycle should be confirmed with product stakeholders.

### 5.6 Notifications

- **Current:** The client receives real-time blood request and comment events through Socket.IO and provides notification UI.
- **Requirement:** Notifications should identify the related activity and link users to the relevant request or discussion when available.
- **Requirement:** The interface should distinguish unread and read notifications and explain when live updates are unavailable.

### 5.7 General experience

- **Current:** The application includes a public landing page, user dashboard, organization experience, discussion pages, blood donation guidance, notifications, and light/dark theme support.
- **Requirement:** Core pages must work on common mobile and desktop viewports, expose loading/empty/error states, and support keyboard navigation and assistive technologies.

## 6. Key user journeys

1. **Join and explore:** Visitor reviews the product, registers as an individual user, completes the profile, and opens the dashboard.
2. **Find blood support:** User opens Blood Bridge, filters requests, reviews request details, and volunteers with their contact-sharing preference.
3. **Request blood:** User creates a request with blood group, urgency, location, and contact details; receives volunteer activity; updates the request status when resolved.
4. **Ask Umeed:** User starts a chat, asks a health question, reviews the response, and optionally uploads a prescription for analysis.
5. **Join a discussion:** User browses a post, reads comments, and contributes a post or reply.
6. **Publish an organization update:** Organization registers, completes its profile, and publishes a health post or campaign update for the community.

## 7. Non-functional requirements

- **Privacy and security:** Protect account credentials, health-related profile data, uploaded files, and contact details. Enforce authorization on the server, minimize data collection, and document retention and deletion behavior.
- **Safety:** Make the boundaries of AI and community information clear. Provide appropriate escalation language for urgent medical situations and avoid representing AI output as a diagnosis.
- **Reliability:** Show actionable errors and preserve user input where practical when network or third-party services fail.
- **Accessibility:** Meet WCAG 2.1 AA as a target for core flows, including keyboard access, readable contrast, labels, and announced validation errors.
- **Performance:** Set measurable response-time and page-load targets after establishing deployment baselines; key actions should provide immediate progress feedback.
- **Compatibility:** Support current mainstream mobile and desktop browsers.
- **Data integrity:** Restrict users to authorized operations on their own private account and request data; validate status changes and uploaded file types and sizes server-side.

## 8. Out of scope for the current product definition

- Diagnosis, prescribing, treatment planning, or replacement of professional care.
- Verified donor eligibility, blood-bank inventory, hospital integration, or guaranteed donor matching.
- Clinical record storage or exchange with healthcare providers.
- Paid services or insurance claims.
- Claims of professional verification, moderation coverage, or anonymous participation until implemented and operationally defined.

## 9. Risks and open product decisions

- Define privacy notices, consent, retention, and deletion for chat history, behavioral insights, prescriptions, and uploaded files.
- Confirm which regions and languages the service supports and what emergency guidance is appropriate in each.
- Determine how organization identities are verified and whether organization posts require review.
- Define reporting, moderation ownership, response times, and appeals for community content.
- Confirm whether retrieval memory, session limits, automatic titles, and location matching are active capabilities or planned features.
- Define account recovery, data export/deletion, notification preferences, and donor contact disclosure rules.
- Establish analytics events and success thresholds without collecting unnecessary sensitive health data.

## 10. Release acceptance checklist

- A new individual user and a new organization can complete their respective registration and sign-in journeys.
- A user can create and manage a blood request, volunteer for another request, and see the resulting status and notifications.
- A user can create a discussion post and participate in its comments.
- A user can create a Umeed session, exchange messages, and submit a supported prescription file with clear success or failure feedback.
- An organization can update its profile and publish a post visible to users.
- Protected data and actions are inaccessible to the wrong account or role.
- Core screens provide usable loading, empty, and error states across mobile and desktop layouts.
- Safety, privacy, and moderation copy is present before the related features are broadly released.

## 11. Implementation context

The repository contains a React and TypeScript single-page client and an Express API backed by MongoDB/Mongoose. Socket.IO supports real-time events. The server integrates Google Gemini, Pinecone, Cloudinary, PDF parsing, and email services. This section records observed implementation context; it is not a commitment to specific vendors or architecture for future versions.
