# Google OAuth Integration Guide

## Overview

Social links can now be added through Google OAuth, providing a secure and convenient way for users to connect their social accounts and auto-populate links based on their profile information.

## Setup Instructions

### 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth 2.0 Client ID**
5. Choose **Web application**
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/google/callback` (development)
   - `https://yourdomain.com/api/auth/google/callback` (production)
7. Copy the **Client ID** and **Client Secret**

### 2. Configure Environment Variables

Add to your `.env.local`:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id_here
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

**Note:** Only values prefixed with `NEXT_PUBLIC_` are accessible in the browser.

### 3. Backend Setup

Create a Google OAuth callback route at `/api/auth/google/callback`:

```typescript
// apps/api/src/auth/google.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { GoogleAuthService } from './google-auth.service';

@Controller('auth/google')
export class GoogleAuthController {
  constructor(private readonly googleAuthService: GoogleAuthService) {}

  @Get('callback')
  async googleCallback(@Query('code') code: string) {
    // Exchange authorization code for tokens
    const tokens = await this.googleAuthService.exchangeCodeForTokens(code);
    
    // Detect social links and store in database
    const socialLinks = await this.googleAuthService.detectAndStoreSocialLinks(
      tokens.access_token
    );

    // Return redirect with success
    return { success: true, socialLinks };
  }
}
```

### 4. Frontend Components

The integration includes:

#### GoogleSocialConnect Component
Located in: `apps/web/src/components/(app)/profile/GoogleSocialConnect.tsx`

Features:
- Modal dialog for secure connection
- Real-time connection status feedback
- Error handling with user-friendly messages
- Animated UI with Framer Motion

#### Integration in SocialLinksCard
Located in: `apps/web/src/components/(app)/profile/SocialLinksCard.tsx`

- Google OAuth button in empty state
- Manual link addition fallback option
- One-click social link detection

### 5. Utility Functions

Located in: `apps/web/src/lib/utils/googleOAuth.ts`

Key functions:
- `getGoogleOAuthUrl()` - Generate OAuth authorization URL
- `detectSocialLinksFromGoogle()` - Parse profile for social links
- `getColorForPlatform()` - Get platform-specific colors
- `validateGoogleOAuthResponse()` - Validate OAuth response
- `createSocialLinkFromDetection()` - Create link objects

## How It Works

1. **User Initiates Connection**
   - Clicks "إضافة عبر Google" button in SocialLinksCard

2. **Authorization Flow**
   - Redirects to Google login/consent screen
   - User approves access to profile information

3. **Backend Processing**
   - Exchanges authorization code for access token
   - Retrieves user's Google profile
   - Detects social media handles/links
   - Stores links in database

4. **Frontend Update**
   - User is redirected back to profile page
   - Social links are displayed and can be managed

## Supported Platforms

The system auto-detects these platforms:
- Twitter / X
- LinkedIn
- GitHub
- Instagram
- Facebook
- YouTube
- TikTok
- WhatsApp
- Telegram

## Features

✅ **Secure OAuth Flow** - No password storage  
✅ **Auto-Detection** - Finds social links in profile  
✅ **Platform Colors** - Each link shows platform colors  
✅ **Error Handling** - User-friendly error messages  
✅ **Fallback Option** - Manual link addition available  
✅ **Real-time Feedback** - Connection status updates  

## Troubleshooting

### "Client ID is not configured"
- Verify `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set in `.env.local`
- Restart development server after changing env vars

### Redirect URI mismatch
- Ensure redirect URI in Google Console exactly matches environment variable
- Check for trailing slashes and protocol (http vs https)

### Social links not detected
- Verify backend is correctly implementing link detection logic
- Check that profile data is being parsed correctly
- Ensure database schema supports storing detected links

## Testing

```bash
# Test OAuth URL generation
npm test -- googleOAuth

# Test component rendering
npm test -- GoogleSocialConnect

# E2E test OAuth flow
npm run test:e2e -- google-oauth
```

## Security Considerations

1. **Token Storage** - Never store tokens in localStorage
2. **HTTPS** - Always use HTTPS in production
3. **Scope Limitation** - Only request `profile` and `email` scopes
4. **State Parameter** - Include state parameter to prevent CSRF attacks
5. **Token Refresh** - Implement token refresh logic for long-lived access

## Next Steps

- [ ] Implement backend Google callback handler
- [ ] Add database schema for storing OAuth tokens
- [ ] Create social link auto-detection service
- [ ] Add unit tests for OAuth utilities
- [ ] Set up E2E tests for OAuth flow
- [ ] Configure production Google credentials
