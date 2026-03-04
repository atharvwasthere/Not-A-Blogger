import resend
import logging
from typing import List
from config import get_settings

# Setup settings
settings = get_settings()

# Setup logger
logger = logging.getLogger(__name__)

# Try to get API key from environment
resend.api_key = settings.RESEND_API_KEY


async def send_new_post_notification(
    post_title: str,
    post_excerpt: str,
    post_url: str,
    cover_image: str,
    subscribers: List[str],
):
    """
    Sends a new post notification email via Resend to all confirmed subscribers.
    """
    if not resend.api_key:
        logger.warning(
            "RESEND_API_KEY not found in environment. Skipping email notification."
        )
        return

    if not subscribers:
        logger.info("No subscribers found. Skipping email broadcast.")
        return

    # To avoid React Email rendering issues on Python backend,
    # we export an HTML string or use a simplified layout mirroring it.
    # The React code we wrote just now gives us the structure.
    # We will build a simplified HTML mapping for the backend to send.

    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@400;600&display=swap" rel="stylesheet">
        <style>
            body {{ font-family: 'Inter', sans-serif; background-color: #f7f7f7; padding: 40px 0; margin: 0; }}
            .container {{ background-color: #ffffff; margin: 0 auto; max-width: 640px; padding: 40px 32px; }}
            .site-title {{ font-family: 'Playfair Display', serif; font-size: 48px; font-weight: 400; letter-spacing: -0.5px; color: #111111; margin: 0 0 24px 0; line-height: 1.1; }}
            .author-title {{ font-size: 18px; color: #555555; margin: 0 0 12px 0; }}
            .author-subtitle {{ font-size: 14px; color: #888888; margin: 0 0 24px 0; max-width: 80%; line-height: 1.6; }}
            .author-writtenby {{ font-size: 14px; color: #111111; margin: 0; line-height: 1.6; }}
            .divider {{ border-top: 1px solid #e5e5e5; border-bottom: none; margin: 32px 0; }}
            .cover-image {{ width: 100%; border-radius: 0; margin-bottom: 24px; }}
            .post-title {{ font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 600; color: #111111; margin: 0 0 16px 0; line-height: 1.3; }}
            .post-excerpt {{ font-size: 16px; color: #444444; line-height: 1.7; margin: 0 0 24px 0; }}
            .btn {{ background-color: #0a0a0a; color: #ffffff; padding: 16px 24px; font-size: 15px; text-decoration: none; display: block; text-align: center; font-weight: 500; box-sizing: border-box; }}
            .footer-text {{ font-size: 13px; color: #777777; margin: 0 0 8px 0; line-height: 1.6; }}
            .footer-link {{ font-family: monospace; font-size: 13px; color: #111111; text-decoration: underline; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div>
                <img src="https://images.atharvsingh.me/cta/New%20Post%20header.png" alt="Not a Blogger" class="header-logo" />
                <p class="author-title">I break systems so you don't have to.</p>
                <p class="author-subtitle">Notes on backend, systems, and things I build when I'm bored of tutorials.</p>
            </div>
            
            <hr class="divider">
            
            <div>
                {f'<img src="{cover_image}" alt="Post Cover" class="cover-image">' if cover_image else ""}
                <h2 class="post-title">{post_title}</h2>
                <p class="post-excerpt">{post_excerpt}</p>
                
                <div style="margin: 24px 0;">
                    <a href="{post_url}" class="btn">Read the full post →</a>
                </div>
            </div>
            
            <hr class="divider">
            
            <div style="padding-top: 36px;">
                <img src="https://images.atharvsingh.me/cta/Atharv%20Singh.png" alt="Atharv Singh" style="height: 24px; width: auto; display: block; margin-bottom: 4px;">
                <br>
                <img src="https://images.atharvsingh.me/cta/blogs.atharvsingh.me.png" alt="blogs.atharvsingh.me" style="height: 14px; width: auto; display: block; margin-bottom: 20px;">
                <p style="font-size: 13px; color: #777777; margin: 0 0 8px 0; line-height: 1.6;">You're receiving this because you subscribed to Not a Blogger.</p>
                <a href="{settings.SITE_URL}/unsubscribe" style="font-family: monospace; font-size: 13px; color: #111111; text-decoration: underline;">Unsubscribe</a>
            </div>
        </div>
    </body>
    </html>
    """

    try:
        # Loop through batches of 50 (Resend limit per request is 50 subscribers)
        batch_size = 50
        for i in range(0, len(subscribers), batch_size):
            batch = subscribers[i : i + batch_size]

            params = {
                "from": "Atharv <blogs@atharvsingh.me>",  # custom domain
                "to": ["blogs@atharvsingh.me"],  # Generic inbox or sender
                "bcc": batch,
                "subject": f"{post_title} — Not a Blogger",
                "html": html_content,
            }

            # Send using resend API
            # For testing without a domain, you can only send to yourself
            response = resend.Emails.send(params)
            logger.info(f"Broadcast sent successfully: {response}")

    except Exception as e:
        logger.error(f"Failed to send email broadcast: {str(e)}")


async def send_welcome_email(email: str, subscriber_id: str, name: str = None):
    """
    Sends a welcome email to a new subscriber.
    """
    if not resend.api_key:
        logger.warning(
            "RESEND_API_KEY not found in environment. Skipping welcome email."
        )
        return

    greeting = f"Welcome, {name}." if name else "Welcome."
    unsubscribe_url = f"{settings.SITE_URL}/api/subscribers/unsubscribe/{subscriber_id}"

    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap');
            
            * {{ box-sizing: border-box; margin: 0; padding: 0; }}
            body {{ font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background-color: #fafafa; padding: 48px 0; margin: 0; color: #111111; }}
            .container {{ background-color: #ffffff; margin: 0 auto; max-width: 600px; padding: 52px 48px; }}

            /* System header */
            .meta-table {{ border-collapse: collapse; width: 100%; margin-bottom: 36px; }}
            .meta-table td {{ font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; color: #6b6b6b; line-height: 1.8; padding: 0; vertical-align: top; }}
            .meta-key {{ color: #b0b0b0; padding-right: 20px; white-space: nowrap; }}

            /* Hero */
            .hero-wrap {{ padding: 40px 0 40px 24px; }}
            .hero {{ font-family: 'Playfair Display', Georgia, serif; font-size: 64px; font-weight: 600; color: #111111; line-height: 1.0; letter-spacing: -0.02em; }}

            /* Divider */
            .divider {{ border: none; border-top: 1px solid #e8e8e8; margin: 0; }}
            .section {{ padding: 36px 0; }}

            /* Label */
            .label {{ font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: #888888; margin-bottom: 20px; }}

            /* Author block */
            .author-tagline {{ font-size: 16px; color: #333333; line-height: 1.5; margin-bottom: 8px; }}
            .author-sub {{ font-size: 13px; color: #999999; line-height: 1.6; margin-bottom: 28px; }}
            .signature {{ font-size: 14px; color: #555555; line-height: 1.8; }}
            .signature strong {{ color: #111111; font-weight: 500; }}
            .signature-aside {{ font-size: 13px; color: #999999; }}

            /* Body */
            .welcome-heading {{ font-family: 'Playfair Display', Georgia, serif; font-size: 22px; font-weight: 400; color: #111111; margin-bottom: 24px; line-height: 1.3; }}
            .paragraph {{ font-size: 16px; color: #444444; line-height: 1.75; margin-bottom: 18px; max-width: 540px; }}

            /* Text link CTA */
            .cta {{ font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; color: #111111; text-decoration: none; display: inline-block; margin-top: 16px; border-bottom: 1px solid #111111; padding-bottom: 2px; }}

            /* Footer */
            .footer {{ padding-top: 36px; border-top: 1px solid #e8e8e8; }}
            .footer-rule {{ font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; color: #bbbbbb; margin-bottom: 16px; }}
            .footer-name {{ font-size: 14px; color: #555555; margin-bottom: 4px; }}
            .footer-site {{ font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; color: #999999; margin-bottom: 20px; }}
            .footer-note {{ font-size: 12px; color: #aaaaaa; line-height: 1.6; margin-bottom: 8px; }}
            .footer-link {{ font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; color: #888888; text-decoration: underline; }}
        </style>
    </head>
    <body>
        <div class="container">

            <!-- Hero -->
            <div style="padding: 40px 0 40px 0;">
                <img src="https://images.atharvsingh.me/cta/Intro.png" alt="You are in." style="height: 64px; width: auto; display: block;">
            </div>

            <hr class="divider">

            <!-- Header context -->
            <div class="section">
                <p class="author-tagline">I break systems so you don't have to.</p>
                <p class="author-sub">Notes on backend, systems, and things I build when I'm bored of tutorials.</p>
                <div class="signature">
                    <strong>Atharv Singh</strong><br>
                    <span class="signature-aside">(not a blogger)</span>
                </div>
            </div>

            <hr class="divider">

            <!-- Body -->
            <div class="section">
                <h2 class="welcome-heading">{greeting}</h2>
                <p class="paragraph">Thanks for subscribing to <strong>Not a Blogger</strong>. You are now on the list to receive my latest writings on backend systems, architectural trade-offs, and deliberate engineering.</p>
                <p class="paragraph">I don't publish on a strict schedule. I only hit send when I have something meaningful to say. Usually deep dives into technical choices, hard-learned lessons from production, or essays on software design.</p>
                <p class="paragraph">You will receive the next essay as soon as it's published. Until then, the archive is open.</p>
                <a href="https://blogs.atharvsingh.me" class="cta">Explore the archive &rarr;</a>
            </div>

            <div style="padding-top: 36px; border-top: 1px solid #e8e8e8;">
                <img src="https://images.atharvsingh.me/cta/Atharv%20Singh.png" alt="Atharv Singh" style="height: 24px; width: auto; display: block; margin-bottom: 4px;">
                <br> 
                <img src="https://images.atharvsingh.me/cta/blogs.atharvsingh.me.png" alt="blogs.atharvsingh.me" style="height: 14px; width: auto; display: block; margin-bottom: 20px;">
                <p style="font-size: 12px; color: #aaaaaa; line-height: 1.6; margin-bottom: 8px;">You received this because you subscribed to Not a Blogger.</p>
                <a href="{unsubscribe_url}" style="font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; color: #888888; text-decoration: underline;">Unsubscribe</a>
            </div>

        </div>
    </body>
    </html>
    """

    try:
        params = {
            "from": "Atharv <blogs@atharvsingh.me>",  # custom domain
            "to": email,
            "subject": "Welcome to Not a Blogger",
            "html": html_content,
        }

        response = resend.Emails.send(params)
        logger.info(f"Welcome email sent successfully: {response}")
    except Exception as e:
        logger.error(f"Failed to send welcome email: {str(e)}")
