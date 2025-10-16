# Repurpose AI - Help Center

Welcome to Repurpose AI! This guide will help you get the most out of the platform.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Understanding Rate Limits](#understanding-rate-limits)
3. [Troubleshooting Common Issues](#troubleshooting-common-issues)
4. [Frequently Asked Questions](#frequently-asked-questions)
5. [Best Practices](#best-practices)
6. [Getting Help](#getting-help)

---

## Getting Started

### Step 1: Connect Your Accounts

1. Go to **Settings > Connections**
2. Click **Connect** next to the platform you want to use
3. Follow the authorization flow
4. Grant the required permissions

**Supported Platforms:**
- Twitter (X)
- LinkedIn
- Instagram (coming soon)

### Step 2: Create Your First Post

1. Go to **Dashboard**
2. Enter your original content in the text box
3. Select which platforms to adapt for
4. Choose your tone (Professional, Casual, Friendly, etc.)
5. Review the AI-adapted content
6. Schedule or post immediately

### Step 3: Schedule Posts

1. After adapting content, click **Schedule**
2. Choose date and time for each platform
3. Confirm scheduling
4. View scheduled posts in your **Posts** tab

---

## Understanding Rate Limits

Rate limits prevent abuse and ensure fair usage across all users. Each platform has its own limits.

### Twitter Rate Limits

| Action | Limit | Time Window |
|--------|-------|-------------|
| Tweets | 50 posts | 24 hours |
| API Requests | 300 requests | 15 minutes |

**What happens when you hit the limit:**
- New posts will fail with "Rate limit exceeded"
- Wait for the time window to reset
- System automatically retries after the reset

**Tips to avoid rate limits:**
- Space out your posts throughout the day
- Don't schedule more than 50 posts per day
- Use the scheduling feature to distribute posts evenly

### LinkedIn Rate Limits

| Action | Limit | Time Window |
|--------|-------|-------------|
| Posts | 100 posts | 24 hours |
| API Requests | 500 requests | 24 hours |

**What happens when you hit the limit:**
- Posts will fail with "Daily limit reached"
- Limits reset at midnight UTC
- Scheduled posts will retry automatically

**Tips to avoid rate limits:**
- LinkedIn is more generous, but don't spam
- Quality over quantity - focus on meaningful content
- Schedule posts during business hours for better engagement

### Instagram Rate Limits

**Note:** Instagram posting is coming soon.

---

## Troubleshooting Common Issues

### "Authentication expired. Please reconnect your account"

**Why this happens:**
- Access tokens expire after a period of time
- For LinkedIn: Tokens expire after 60 days
- For Twitter: Tokens expire after 2 hours (but auto-refresh)

**How to fix:**
1. Go to **Settings > Connections**
2. Click **Disconnect** next to the affected platform
3. Click **Connect** and authorize again
4. Your scheduled posts will resume automatically

### "No connected [platform] account found"

**Why this happens:**
- You haven't connected the platform yet
- Connection was removed or expired

**How to fix:**
1. Go to **Settings > Connections**
2. Click **Connect** next to the platform
3. Complete the authorization flow
4. Try posting again

### "Rate limit exceeded"

**Why this happens:**
- You've posted too many times in a short period
- Platform API limits have been reached

**How to fix:**
1. Wait for the rate limit window to reset (see table above)
2. Review your scheduled posts and spread them out
3. The system will automatically retry failed posts

### "Failed to publish post"

**Why this happens:**
- Network connectivity issues
- Platform API is temporarily down
- Content violates platform policies

**How to fix:**
1. Check the error message for specific details
2. Verify your internet connection
3. Check platform status pages:
   - Twitter: https://api.twitterstat.us/
   - LinkedIn: https://www.linkedin-apistatus.com/
4. Review content for policy violations
5. System will auto-retry transient errors

### "Post too long for [platform]"

**Why this happens:**
- Twitter has a 280 character limit
- LinkedIn has a 3,000 character limit
- AI sometimes generates content that's too long

**How to fix:**
1. Edit the adapted content to fit within limits
2. Character counts are shown in the composer
3. Use the "Shorten" option to reduce length
4. Break long content into threads (Twitter) or multiple posts

### Scheduled posts not publishing

**Why this happens:**
- Account disconnected or token expired
- Rate limits exceeded
- Platform API issues

**How to fix:**
1. Check **Posts** tab for error messages
2. Verify account connections in **Settings**
3. Review rate limit status
4. Failed posts will retry automatically up to 5 times
5. If still failing after retries, reconnect account

---

## Frequently Asked Questions

### How does the AI adaptation work?

Our AI analyzes your original content and adapts it for each platform's audience, tone, and format. It considers:
- Platform character limits
- Audience expectations (professional vs. casual)
- Optimal post structure (threads, paragraphs, etc.)
- Your selected tone preference

### Is my content stored?

Yes, we store:
- Original content you submit
- Adapted content for each platform
- Post scheduling information
- Publishing history

All data is encrypted and stored securely. We never share your content with third parties.

### Can I edit AI-adapted content?

Yes! After the AI generates adapted content:
1. Review each platform's version
2. Click **Edit** to make changes
3. Save your edits
4. Schedule or post the modified version

### How many accounts can I connect?

- One account per platform (Twitter, LinkedIn, Instagram)
- If you need multiple accounts, contact support

### What happens if a scheduled post fails?

The system automatically:
1. Detects the failure
2. Determines if it's a temporary issue (network, rate limit)
3. Retries up to 5 times with exponential backoff
4. Marks as permanently failed if all retries fail
5. Notifies you via the dashboard

### Can I cancel a scheduled post?

Yes:
1. Go to **Posts** tab
2. Find the scheduled post
3. Click **Cancel**
4. Post will be removed from the queue

### How far in advance can I schedule posts?

- Up to 7 days in advance
- Minimum: 5 minutes from now
- Recommended: At least 1 hour for reliability

### Do you support threads/carousels?

Currently:
- ✅ Twitter threads: Supported
- ❌ LinkedIn carousels: Not yet
- ❌ Instagram carousels: Not yet

Thread support coming soon!

---

## Best Practices

### Content Strategy

1. **Start with quality content**
   - AI adaptation works best with clear, well-written original content
   - Include key points you want emphasized
   - Add context that helps the AI understand intent

2. **Review AI adaptations**
   - AI is powerful but not perfect
   - Always review adapted content before posting
   - Make edits to match your voice

3. **Schedule strategically**
   - Twitter: Best engagement 8 AM - 4 PM weekdays
   - LinkedIn: Best engagement 7-9 AM and 5-6 PM weekdays
   - Space posts at least 2-4 hours apart

### Account Management

1. **Keep accounts connected**
   - Check connection status weekly
   - Reconnect before tokens expire
   - Enable notifications for connection issues

2. **Monitor posting activity**
   - Review published posts regularly
   - Check for failed posts
   - Adjust schedule based on analytics

3. **Respect rate limits**
   - Don't batch-schedule too many posts
   - Spread posts throughout the week
   - Quality over quantity

### Security

1. **Protect your account**
   - Use strong passwords
   - Enable 2FA on connected platforms
   - Don't share your login credentials

2. **Review permissions**
   - We only request necessary permissions
   - Review what access we have on each platform
   - Revoke access when not in use

---

## Getting Help

### In-App Support

1. Click the **Help** button in the navigation
2. Check the **FAQ** section
3. Review **Troubleshooting** guides

### Contact Support

**Email:** support@repurpose-ai.com

**Response Time:**
- Critical issues: 2-4 hours
- General questions: 24 hours
- Feature requests: 2-3 business days

**What to include:**
- Clear description of the issue
- Steps to reproduce
- Screenshots if applicable
- Account email (don't share password!)
- Platform(s) affected

### Community

Join our community for tips, feedback, and discussions:
- Discord: [Coming Soon]
- Twitter: [@RepurposeAI](https://twitter.com/RepurposeAI)

### Status Page

Check platform status and known issues:
- https://status.repurpose-ai.com [Coming Soon]

---

## Feedback & Feature Requests

We're constantly improving! Share your ideas:
1. Use the **Feedback** button in the app
2. Email feature requests to feedback@repurpose-ai.com
3. Vote on feature requests in our roadmap [Coming Soon]

---

**Last Updated:** October 16, 2025
**Version:** 1.0

Thank you for using Repurpose AI! 🚀
