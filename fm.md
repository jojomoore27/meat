BESTGRASSFEDCATTLE — MASTER PRODUCTION BUILD PROMPT
ROLE
You are an expert senior full-stack engineer, UI/UX designer, product designer, database architect, security engineer, and QA engineer.

Build a real, production-ready, professional website for BestGrassFedCattle, a premium grass-fed cattle/beef business based in New York, United States.

This is NOT a simple landing page.

This is NOT a static HTML mockup.

This is NOT a fake ecommerce demonstration.

Build a complete, functional, responsive business website with a real backend, database, authentication, CMS, product management, inquiry/order system, admin dashboard, media management, and configurable communication notifications.

Every visible major feature must actually work.

Do not create fake functionality simply to make the interface look complete.

1. BUSINESS INFORMATION
Business name:

BestGrassFedCattle

Business location:

New York, United States

Currency:

USD ($)

Business model:

BestGrassFedCattle sells premium grass-fed cattle/beef products.

Customers should be able to browse products and submit an order request for individual products.

Businesses and organizations should be able to submit bulk/wholesale requests.

There is NO online payment system.

There is NO traditional ecommerce checkout.

There is NO customer account system.

There is NO delivery management system.

The business will communicate with customers directly to finalize orders and arrangements.

2. MOST IMPORTANT BUSINESS FLOW
The website must be built around this workflow:

CUSTOMER VISITS WEBSITE

↓

BROWSES PRODUCTS

↓

OPENS PRODUCT

↓

CLICKS "ORDER THIS ITEM"

↓

COMPLETES ORDER REQUEST FORM

↓

REQUEST IS SAVED TO DATABASE

↓

REQUEST APPEARS IN ADMIN PANEL

↓

ADMIN IS NOTIFIED

↓

SYSTEM FORWARDS NOTIFICATION TO ADMIN'S SELECTED COMMUNICATION CHANNEL(S)

↓

ADMIN CONTACTS CUSTOMER

↓

BUSINESS FINALIZES ORDER DIRECTLY WITH CUSTOMER

This is an order request system, not a payment checkout system.

3. REMOVE DELIVERY COMPLETELY
IMPORTANT:

Remove delivery as a website feature.

Do NOT create:

Delivery page

Delivery calculator

Delivery fee calculator

Delivery date selector

Delivery time selector

Delivery tracking

Delivery dashboard

Delivery status

Delivery management

Delivery pricing

Do not mention delivery as part of the normal ordering workflow.

If the business later wants to add logistics, the CMS/backend should be architected cleanly enough that the feature can be added later.

4. TECHNOLOGY STACK
Use the following stack:

Frontend
React

Vite

JavaScript

HTML5

CSS3

Tailwind CSS

Lucide React icons

Backend
Node.js

Express.js

Database
Use:

PostgreSQL

Use a proper relational schema.

Authentication
Use secure admin authentication.

Use:

Password hashing

Secure sessions or secure token-based authentication

HTTP-only cookies where appropriate

Protected admin routes

Logout

Session expiration

Password reset capability

File storage
Design the application to support cloud image storage.

Preferred:

Cloudinary

Keep storage credentials server-side.

Never expose secret API keys in frontend code.

5. DESIGN PHILOSOPHY
The website must look like a real premium American beef company.

Do NOT make it look like:

A generic farming template

A cheap restaurant website

A basic WordPress template

An AI-generated website

A cryptocurrency dashboard

A generic ecommerce template

The visual identity should combine:

Premium luxury

Modern agriculture

Authentic farm branding

Clean/minimal design

Strong commercial presentation

The site should feel trustworthy, established, premium and authentic.

6. COLOR SYSTEM
Primary visual direction:

Deep bright greens + warm earth tones + cream/white + sophisticated supporting colors

Use a professional palette such as:

Deep Forest Green

Rich Grass Green

Warm Earth Brown

Sand

Cream

Ivory

Charcoal

Soft Gold/Brass accent

Muted natural green

Do not overuse green.

Use cream/white space and dark charcoal to create a premium visual balance.

The exact color system should be centralized as design tokens so it can easily be changed later.

7. TYPOGRAPHY
Use a premium modern typography system.

Recommended:

Elegant display font for major headlines

Highly readable sans-serif for body content

Strong hierarchy

Comfortable line height

Large editorial-style headings

Typography should communicate:

Premium + Natural + Modern + Trustworthy

8. BRANDING
There is currently no official logo.

Create a temporary professional BestGrassFedCattle logo/wordmark.

The logo should work in:

Desktop header

Mobile header

Footer

Favicon

Admin panel

Social media/profile use

Do not use a generic emoji cow as the logo.

The admin must later be able to replace the logo through CMS.

9. PUBLIC WEBSITE PAGES
Create these pages:

Home

About

Our Farm

Products

Product Details

Gallery

Bulk & Wholesale

FAQs

Contact

Privacy Policy

Terms & Conditions

Do NOT create:

Delivery page

Blog

Customer dashboard

Customer login

Payment page

10. GLOBAL HEADER
Create a premium sticky responsive header.

Desktop navigation:

Home

About

Our Farm

Products

Gallery

Bulk & Wholesale

FAQs

Contact

Right side:

Search

Theme switcher

Order Beef CTA

The mobile header should use a polished slide-out navigation menu.

Header must remain responsive on:

Mobile

Tablet

Laptop

Desktop

Large displays

11. HOMEPAGE
Create a visually exceptional homepage.

HERO
Use a large authentic cattle/grassland/beef image.

Since the company currently has no photographs, use high-quality royalty-free/appropriately licensed placeholder imagery during development.

IMPORTANT:

Do not claim that placeholder images are photographs of the actual BestGrassFedCattle farm.

The admin must be able to replace all images later.

Hero headline:

Premium Grass-Fed Beef, Raised With Purpose.

Supporting copy:

Quality beef from carefully raised cattle, presented with the care and standards customers expect from a premium American beef brand.

Buttons:

Explore Our Beef

Order Beef

12. TRUST SECTION
Create a professional trust section.

Possible items:

Grass-Fed Focus

Premium Quality

Carefully Selected Beef

Customer Focused

Bulk Orders Available

Make these CMS editable.

Do not invent certifications or regulatory claims.

13. FEATURED PRODUCTS
Show products dynamically from the database.

Each card must contain:

Product image

Product name

Short description

Price

Product category

Availability

Order This Item button

IMPORTANT:

Every individual product MUST have a clearly visible:

ORDER THIS ITEM

button.

Do NOT use:

Add to Cart

Buy Now

Checkout

unless those terms are specifically appropriate to the inquiry system.

14. PRODUCT ORDER FLOW
When a customer clicks:

ORDER THIS ITEM

open a professional order-request experience.

The page/modal should display:

Product
Product name

Product image

Price

Description

Customer form
Fields:

Full name

Email

Phone number

Preferred contact method

Quantity/requested amount

Specific cut preference

Special instructions

Additional notes

The form should be easy to complete.

The customer does NOT pay online.

Button:

Submit Order Request

15. AFTER ORDER REQUEST
After successful submission show:

Request Received
Example:

Thank you for your order request.

Your request has been successfully received by BestGrassFedCattle.

Our team will review your request and contact you directly to confirm availability and finalize the order.

Display a unique request/reference number.

Example:

Request #BGC-10482

Do not claim an order is confirmed simply because a request was submitted.

The status should initially be:

New Request

16. ORDER REQUEST DATABASE
Every request must be stored in PostgreSQL.

Store:

Request ID

Customer name

Email

Phone

Contact preference

Product

Product ID

Quantity

Cut preference

Special instructions

Date/time

Source

Status

Admin notes

Possible statuses:

New

Reviewing

Contacted

Confirmed

Completed

Cancelled

Admin can change the status.

17. PRODUCT MANAGEMENT
The admin must have complete product CRUD functionality.

Admin can:

Create product

Edit product

Delete product

Duplicate product

Publish/unpublish

Mark featured

Change price

Change category

Change description

Upload images

Remove images

Reorder images

Change availability

Add product specifications

Product fields:

Product name

SKU/reference

Category

Price

Short description

Full description

Main image

Additional images

Product status

Featured status

Custom cut options

Tags

SEO title

SEO description

18. PRODUCT CATEGORIES
Admin can create and manage categories.

Examples:

Premium Beef Cuts

Steaks

Ground Beef

Roasts

Organ Meat

Specialty Cuts

Bulk Beef

Do not permanently hard-code these categories.

Admin must be able to:

Add

Edit

Delete

Reorder

Hide/show

categories.

19. PRODUCT SEARCH & FILTERING
Create professional product discovery.

Customers can:

Search products

Filter by category

Sort products

View featured products

Provide excellent empty states when no products match.

20. BULK & WHOLESALE PAGE
Create a premium dedicated page for:

Restaurants

Hotels

Caterers

Retailers

Grocery businesses

Butchers

Food businesses

Events

Organizations

Large-volume customers

Headline:

Need Beef in Larger Quantities?

Explain that businesses can submit a wholesale/bulk request.

21. BULK REQUEST FORM
Fields:

Full name

Company/business name

Email

Phone

Business type

Location

Products interested in

Estimated quantity

Preferred cuts

Frequency of purchase

Additional requirements

Message

Button:

Submit Wholesale Request

No payment.

No automatic confirmation of availability.

22. BULK REQUEST NOTIFICATION
This is a CRITICAL requirement.

When a wholesale/bulk request is submitted:

Save it to the database.

Display it in the admin dashboard.

Create an admin notification.

Send it to the communication channels enabled by the administrator.

The administrator must be able to choose where messages are received.

Supported channels should be architected for:

Admin Dashboard

Email

Telegram Bot

WhatsApp

Live Chat

The administrator can turn channels ON or OFF.

Example:

Wholesale Request Notifications
Admin Dashboard: ON

Email: ON

Telegram: ON

WhatsApp: OFF

Live Chat: ON

23. NORMAL ORDER NOTIFICATIONS
The same communication system must work for normal individual product order requests.

When someone clicks:

Order This Item

and submits the form:

The request must:

Enter the database.

Appear in admin.

Generate an admin notification.

Be forwarded to enabled communication channels.

The notification should contain useful information.

Example:

NEW BESTGRASSFEDCATTLE ORDER REQUEST

Request: BGC-10482

Customer: John Smith

Product: Premium Ribeye

Quantity: 4

Email: customer@example.com

Phone: +1 XXX XXX XXXX

Special instructions: ...

Open request in Admin Dashboard.

24. ADMIN COMMUNICATION SETTINGS
Create:

Settings → Notifications

The administrator can configure notification channels.

Email
Enable/disable

Recipient email

SMTP/provider configuration

Telegram
Enable/disable

Bot token

Chat ID

Store sensitive credentials securely.

WhatsApp
Architect the system so a legitimate WhatsApp Business/API integration can be connected.

Do not create a fake WhatsApp API.

Live Chat
Allow integration/configuration of a supported live-chat provider.

The admin should be able to enable or disable each channel.

25. "MESSAGE US" BUTTONS
Throughout the website use appropriate CTA buttons such as:

Contact Us

Ask About This Product

Request This Item

Wholesale Inquiry

These should open the appropriate inquiry/contact flow.

Where appropriate, provide configurable communication buttons.

For example:

Email Us

WhatsApp

Telegram

Live Chat

The admin controls which communication methods are active.

Do not display inactive channels.

26. COMPANY/BUSINESS REQUESTS
Company/business requests must have their own dedicated workflow.

The business inquiry form should be received through:

Website admin panel

Selected email

Selected messaging channels

The administrator must NOT have to manually check multiple disconnected systems to know whether a company has submitted a request.

The website should act as the central source of truth.

27. ADMIN DASHBOARD
Build a beautiful custom admin dashboard.

Route:

/admin

Login:

/admin/login

The design should look like a modern premium SaaS dashboard.

Do not use a default ugly Bootstrap admin template.

28. ADMIN SIDEBAR
Include:

Dashboard

Order Requests

Wholesale Requests

Products

Categories

Gallery

Testimonials

FAQs

Pages

CMS

Media Library

Messages

Notifications

Settings

Admin Profile

Logout

29. ADMIN DASHBOARD OVERVIEW
Show:

New Order Requests

Wholesale Requests

Contact Messages

Total Products

Published Products

Gallery Images

Unread Messages

Show recent requests in a clean table.

Columns:

Request ID

Customer

Product

Type

Date

Status

Action

30. REQUEST DETAIL PAGE
When admin opens an order request, show:

Customer information.

Product information.

Request details.

Customer message.

Date/time.

Status.

Admin notes.

Communication actions.

Buttons:

Mark Contacted

Mark Confirmed

Mark Completed

Cancel

Add Note

The admin should be able to see the complete history of the request.

31. CMS
Create a genuine CMS.

The admin must be able to manage website content without editing source code.

Site Settings
Business name

Logo

Favicon

Email

Phone

Social links

Brand description

Business information

Theme settings

Homepage
Admin can edit:

Hero title

Hero description

Hero image

CTA buttons

Featured products

Trust sections

About section

Gallery

Testimonials

FAQ section

About
Admin can edit:

Headings

Paragraphs

Images

Story sections

Our Farm
Admin can edit all content and images.

Contact
Admin can edit:

Email

Phone

Contact information

Social media

Available communication channels

32. MEDIA LIBRARY
Create a professional media library.

Features:

Upload image

Drag/drop upload

Preview

Delete

Rename

Search

Categorize

Select image

Reuse image

Image metadata

Supported image types should be validated.

Do not allow dangerous file uploads.

33. GALLERY
Create a beautiful visual gallery.

Categories:

Cattle

Grassland

Beef

Products

Farm

Behind the Scenes

Admin can:

Upload

Delete

Reorder

Categorize

Feature

Hide/show

Use a premium lightbox.

34. TESTIMONIALS
Create an admin-managed testimonial system.

Fields:

Customer name

Customer role/company

Testimonial

Photo

Status

Do NOT pre-populate fake customer reviews.

Use placeholder/demo content only if clearly marked for replacement during development.

35. FAQ SYSTEM
Admin can:

Create FAQ

Edit FAQ

Delete FAQ

Reorder FAQ

Categorize FAQ

Publish/unpublish

Frontend should display FAQs using accessible accordions.

36. CONTACT SYSTEM
Create a professional contact form.

Fields:

Name

Email

Phone

Subject

Message

When submitted:

Save to database.

Show in admin.

Generate notification.

Send through enabled communication channels.

37. DARK/LIGHT MODE
Implement a genuine theme system.

Users can switch:

☀ Light

🌙 Dark

Save their preference locally.

Dark mode must be professionally designed.

Do not simply invert the colors.

Admin can define default theme behavior.

38. MOBILE EXPERIENCE
The website must be designed mobile-first.

Test:

iPhone

Android

Tablet

Laptop

Desktop

Large monitor

All forms must be easy to complete on mobile.

Admin dashboard must also be responsive.

Tables should become cards or horizontally scroll intelligently on smaller screens.

39. ACCESSIBILITY
Implement:

Semantic HTML

Keyboard navigation

Accessible forms

Visible focus states

Proper labels

ARIA where necessary

Alt text

Color contrast

Accessible modal dialogs

40. SEO
Implement:

SEO titles

Meta descriptions

Open Graph

Canonical URLs

Sitemap

Robots.txt

Semantic HTML

Structured data where appropriate

Product pages should have dynamic SEO metadata.

41. PERFORMANCE
Optimize:

Images

Lazy loading

Code splitting

API requests

Database queries

Frontend bundle

Fonts

Do not load unnecessary libraries.

42. SECURITY
Implement:

Secure admin authentication

Password hashing

Protected APIs

Input validation

Server-side validation

Rate limiting

Secure cookies

XSS protection

SQL injection protection

Secure HTTP headers

File upload validation

Authorization checks

Never expose:

Database credentials

Telegram bot tokens

SMTP credentials

API keys

Cloudinary secrets

in frontend code.

Use environment variables.

43. ERROR HANDLING
Every important operation must have:

Loading state

Success state

Error state

Empty state

Examples:

If product request fails:

We couldn't submit your request. Please try again or contact us directly.

Do not expose raw server errors to customers.

44. DATABASE
Use PostgreSQL.

Create normalized tables for:

admins

products

categories

product_images

order_requests

order_request_items if multiple-item requests are supported

wholesale_requests

contact_messages

faqs

testimonials

gallery_images

pages

cms_settings

media

notification_settings

notification_logs

admin_notifications

site_settings

Use foreign keys and indexes.

45. API ARCHITECTURE
Create clean backend APIs.

Examples:

POST /api/order-requests

GET /api/admin/order-requests

PATCH /api/admin/order-requests/:id

POST /api/wholesale-requests

GET /api/admin/wholesale-requests

POST /api/contact

GET /api/products

GET /api/products/:slug

POST /api/admin/products

PATCH /api/admin/products/:id

DELETE /api/admin/products/:id

GET /api/categories

POST /api/admin/media

etc.

Protect admin endpoints.

46. NO FAKE FEATURES
This is extremely important.

Do not create:

Fake payment processing

Fake delivery tracking

Fake inventory

Fake analytics

Fake customer accounts

Fake reviews

Fake certifications

Fake farm claims

Fake orders

Fake notifications

If a feature cannot be implemented because an external API requires credentials, build the integration architecture correctly and provide a secure configuration interface.

Do not pretend that an external service is connected when it isn't.

47. CONTENT AUTHENTICITY
Do not invent facts about BestGrassFedCattle.

Do not claim:

USDA certification

Specific farm acreage

Number of cattle

Years in business

Awards

Government approvals

Specific farming claims

Customer numbers

Reviews

Locations that haven't been supplied

Use professional editable copy that can be replaced through the CMS.

48. ADMIN CONTENT EDITOR
Where practical, provide a simple rich-text editor for CMS content.

Admin should be able to:

Bold

Italic

Headings

Lists

Links

Paragraphs

Images

Content must be safely sanitized before rendering.

49. BRAND EXPERIENCE
The final website should feel like a premium combination of:

American agriculture + premium food brand + modern digital commerce + direct customer relationship.

The customer should immediately understand:

What BestGrassFedCattle sells.

Why the business is different.

What products are available.

How to request an item.

How businesses can submit wholesale requests.

How to contact the company.

The user should never feel confused about what to do next.

50. FINAL NAVIGATION
Use this final navigation:

HOME
ABOUT
OUR FARM
PRODUCTS
GALLERY
BULK & WHOLESALE
FAQS
CONTACT

Primary CTA:

ORDER BEEF

51. FINAL CUSTOMER JOURNEY
Individual customer
Home

↓

Products

↓

Product

↓

Order This Item

↓

Order Request Form

↓

Submit

↓

Request Confirmation

↓

Admin Notification

↓

Configured Email/Telegram/WhatsApp/Live Chat notification

↓

Admin contacts customer

Business customer
Home

↓

Bulk & Wholesale

↓

Wholesale Request Form

↓

Submit

↓

Admin Dashboard

↓

Configured notification channels

↓

Admin contacts company/business

52. ADMIN COMMUNICATION CENTER
Create one central location:

Admin → Communications

Show:

New order requests

Wholesale requests

Contact messages

Allow admin to:

View

Search

Filter

Mark read

Add notes

Change status

Delete/archive

Also show notification delivery status where technically possible.

For example:

Telegram — Sent

Email — Sent

WhatsApp — Not configured

Do not report a message as successfully delivered if the external provider did not confirm delivery.

53. ADMIN SETTINGS
Create:

General
Business details.

Branding
Logo, favicon, colors.

Contact
Email, phone, social accounts.

Notifications
Email, Telegram, WhatsApp, live chat.

CMS
Homepage and page content.

Security
Password/session/security settings.

SEO
Default metadata.

Media
Image configuration.

54. DEVELOPMENT STRUCTURE
Use a clean maintainable architecture.

Separate:

Components

Pages

Layouts

Services

API

Database

Authentication

CMS

Admin

Utilities

Validation

Notification integrations

Do not place the entire application into a few giant files.

Use reusable components.

55. DESIGN SYSTEM
Create reusable components for:

Buttons

Inputs

Selects

Cards

Modals

Alerts

Toasts

Tables

Badges

Tabs

Dropdowns

Navigation

Product cards

Form sections

Empty states

Loading states

Maintain consistent spacing, typography and interaction patterns.

56. FINAL QA AUDIT
Before declaring the project complete, conduct a complete audit.

FRONTEND
Check:

All pages

All navigation

All buttons

All forms

Product search

Product filtering

Product pages

Individual order requests

Wholesale requests

Contact forms

Dark mode

Mobile menu

Gallery

CMS content rendering

BACKEND
Check:

Database

API

Authentication

Authorization

CRUD

Validation

Error handling

Notifications

File uploads

ADMIN
Check:

Login

Dashboard

Products

Categories

Requests

Wholesale

Messages

Gallery

FAQs

Testimonials

CMS

Media

Notification settings

Site settings

SECURITY
Test:

Unauthorized access

Invalid input

File upload attacks

Authentication

Session handling

API authorization

Rate limiting

RESPONSIVENESS
Test:

320px+

Mobile

Tablet

Desktop

Large desktop

57. NO PLACEHOLDER FUNCTIONALITY IN FINAL BUILD
Before finishing, search the entire project for:

TODO

FIXME

Coming Soon

Placeholder button

Fake API

Mock data

Hard-coded product data

Demo password

Demo credentials

Fake notification

Fake checkout

Fake delivery

Replace or remove them.

The final application must be production-oriented.

58. FINAL ACCEPTANCE CRITERIA
The project is complete only when:

A visitor can browse the website.

A visitor can browse products.

Every product has an Order This Item button.

A customer can submit an individual product request.

The request is saved to PostgreSQL.

The request appears in the admin panel.

Admin receives notification.

Admin can configure notification channels.

Wholesale requests work.

Wholesale requests appear in admin.

Wholesale requests can be forwarded to configured channels.

Contact forms work.

CMS works.

Product management works.

Image uploads work.

Gallery management works.

FAQ management works.

Admin authentication works.

Dark/light mode works.

Mobile responsiveness works.

SEO is implemented.

Security protections are implemented.

No payment functionality exists.

No delivery functionality exists.

No customer account functionality exists.

No fake business claims exist.

No major button is non-functional.

No critical errors remain.

59. FINAL INSTRUCTION TO ANTIGRAVITY
Do not rush directly into generating the interface.

First:

Analyze this entire specification.

Create the application architecture.

Create the database schema.

Create the backend/API structure.

Create authentication.

Create the notification architecture.

Create the CMS architecture.

Create the design system.

Build the public website.

Build the admin dashboard.

Connect frontend to backend.

Test all workflows.

Audit security.

Audit responsiveness.

Audit accessibility.

Audit all buttons and forms.

Fix all errors.

Remove unused/demo functionality.

Verify the complete customer-to-admin request flow.

Only then consider the project complete.

Build this as a real, polished, maintainable production application, not a superficial visual prototype.

The final result should make BestGrassFedCattle look like a credible, premium, authentic American grass-fed beef business with a sophisticated digital ordering-request experience.

I would also strongly recommend that Antigravity build the notification system as an adapter/integration architecture, rather than hard-coding one messaging service. That way, you can add or remove Telegram, WhatsApp, email, or another provider later without rebuilding the website.